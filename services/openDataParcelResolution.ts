import type { ClaimCitation, CitationSource, DataGap, GeoPoint, Jurisdiction, OpenDatasetMetadata, SourcePointer } from "../types";
import type { ParcelCandidate, ParcelGeometryFeature, ParcelLookupInput } from "./parcelResolution";
import { resolveParcelWorkflow } from "./parcelResolution";
import { addressToGeometry } from "./openDataGeocoding";
import { getOpenDataProviderForPortalAsync } from "./openDataPortalService";
import { getOpenDatasetIndex, persistOpenDatasetMetadata } from "./openDataDiscovery";
import { evaluateDatasetUsage } from "./openDataUsage";
import { normalizeAddressVariants } from "./addressNormalization";
import { validateDataSourceContracts } from "../data/dataSourceContracts";
import { getOpenDataConfig } from "./openDataConfig";
import { isNonUsJurisdiction } from "./addressScope";
import { enforceRateLimit, fetchJsonWithRetry } from "./openDataHttp";
import {
  OPEN_DATA_PORTAL_MAX_GEOMETRY_DATASET_QUERIES,
  OPEN_DATA_PORTAL_MAX_TEXT_DATASET_QUERIES,
  OPEN_DATA_QUERY_CACHE_TTL_MS
} from "../constants";

const isoDateToday = () => new Date().toISOString().slice(0, 10);

const createGapId = () => `gap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const buildDataGap = (description: string, reason: string, status: DataGap["status"], expectedSources?: SourcePointer[]): DataGap => ({
  id: createGapId(),
  description,
  reason,
  status,
  detectedAt: isoDateToday(),
  expectedSources
});

type CalibrationOptions = {
  enabled?: boolean;
  includeDiagnostics?: boolean;
  relaxPublicAssessorReviewGates?: boolean;
};

type DatasetGateDiagnostic = {
  datasetId?: string;
  title: string;
  complianceAction?: "allow" | "block" | "review";
  complianceNotes?: string[];
  freshnessStatus?: "fresh" | "stale" | "unknown";
  doNotUse: boolean;
  overrideApplied?: boolean;
  blockReasons: string[];
};

type CalibrationDiagnostics = {
  calibrationMode: boolean;
  blockedDatasets: DatasetGateDiagnostic[];
  relaxedDatasets: DatasetGateDiagnostic[];
  evaluatedDatasets: DatasetGateDiagnostic[];
  validationStats: {
    restricted: number;
    nonTabular: number;
    metadata: number;
  };
  queryableDatasetCount: number;
};

const normalizePortalUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed}`.replace(/\/$/, "");
};

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const domainFromUrl = (value: string) => {
  try {
    const host = new URL(normalizePortalUrl(value)).hostname.toLowerCase();
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch (_) {
    const host = String(value || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    return host.startsWith("www.") ? host.slice(4) : host;
  }
};

const VERIFIED_ASSESSOR_TEXT_PATTERN = /parcel|assessor|appraisal|apn|pin|cadastre|cadastral|property assessment|tax parcel|tax roll/i;
const RESTRICTED_TEXT_PATTERN = /private|restricted|internal|confidential|paid|subscription|license required|non-public/i;

const isVerifiedPublicAssessorDataset = (dataset: OpenDatasetMetadata) => {
  const portalDomain = domainFromUrl(dataset.portalUrl);
  const sourceText = `${dataset.source || ""} ${dataset.title || ""} ${dataset.description || ""} ${(dataset.tags || []).join(" ")} ${(dataset.fields || []).join(" ")}`.toLowerCase();
  const constraintText = `${(dataset.accessConstraints || []).join(" ")} ${dataset.termsOfService || ""} ${dataset.license || ""}`.toLowerCase();
  const assessorLike = VERIFIED_ASSESSOR_TEXT_PATTERN.test(sourceText);
  if (!assessorLike) return false;
  if (RESTRICTED_TEXT_PATTERN.test(constraintText)) return false;
  const govLike = portalDomain.endsWith(".gov")
    || portalDomain.endsWith(".us")
    || /assessor|appraisal|cad|tax|county|city/.test(portalDomain)
    || /county|city|state|department|district/.test(sourceText);
  return govLike;
};

const buildBlockReasons = (dataset: OpenDatasetMetadata) => {
  const reasons: string[] = [];
  if (dataset.complianceAction === "block") {
    reasons.push("compliance_block");
  }
  if (dataset.complianceAction === "review" && dataset.doNotUse) {
    reasons.push("review_blocked_by_zero_cost");
  }
  if (dataset.freshnessStatus === "stale" && dataset.doNotUse) {
    reasons.push("stale_blocked");
  }
  if ((dataset.complianceNotes || []).length > 0) {
    reasons.push(...(dataset.complianceNotes || []).map((note) => `note:${note}`));
  }
  return Array.from(new Set(reasons));
};

const PARCEL_DATASET_PRIMARY_PATTERN = /parcel|assessor|appraiser|apn|pin|parcel id|tax roll|cad|cadastral|cadastre|property/i;
const PARCEL_FIELD_PATTERN = /parcel|apn|pin|account|address|situs|site|owner|tax/i;

const computeRecencyScore = (value?: string) => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return 0;
  const ageDays = Math.max(0, (Date.now() - parsed) / (1000 * 60 * 60 * 24));
  if (ageDays <= 180) return 8;
  if (ageDays <= 730) return 5;
  if (ageDays <= 1825) return 2;
  return 0;
};

const scoreDatasetForParcelResolution = (dataset: OpenDatasetMetadata, normalizedAddress: string) => {
  const textCorpus = `${dataset.title || ""} ${dataset.description || ""} ${(dataset.tags || []).join(" ")} ${(dataset.fields || []).join(" ")}`.toLowerCase();
  const addressToken = normalizedAddress.toLowerCase().split(/[^a-z0-9]+/).find((token) => token.length >= 4);
  let score = 0;
  if (PARCEL_DATASET_PRIMARY_PATTERN.test(textCorpus)) score += 30;
  if ((dataset.fields || []).some((field) => PARCEL_FIELD_PATTERN.test(field))) score += 18;
  if (dataset.freshnessStatus === "fresh") score += 8;
  if (dataset.freshnessStatus === "stale") score -= 8;
  if (dataset.complianceAction === "allow") score += 6;
  if (dataset.complianceAction === "review") score -= 2;
  if (dataset.datasetId) score += 3;
  if (addressToken && textCorpus.includes(addressToken)) score += 2;
  score += computeRecencyScore(dataset.lastUpdated || dataset.retrievedAt);
  return score;
};

const rankDatasetsForParcelResolution = (datasets: OpenDatasetMetadata[], normalizedAddress: string) => {
  return datasets
    .map((dataset, index) => ({
      dataset,
      index,
      score: scoreDatasetForParcelResolution(dataset, normalizedAddress)
    }))
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .map((entry) => entry.dataset);
};

const MAX_ASSESSOR_QUERY_VARIANTS = 6;
const ADDRESS_UNIT_PATTERN = /(?:^|\s|,)(?:#|apt|apartment|unit|suite|ste|bldg|building|fl|floor|lot|trlr|trailer)\.?\s*[a-z0-9-]+\b/gi;

const normalizeAssessorSearchText = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+,/g, ",")
    .replace(/,+$/g, "")
    .trim();

const stripAddressUnit = (value: string) => normalizeAssessorSearchText(value.replace(ADDRESS_UNIT_PATTERN, " "));

const toStreetLine = (value: string) => {
  const normalized = normalizeAssessorSearchText(value);
  if (!normalized) return "";
  const firstComma = normalized.indexOf(",");
  if (firstComma < 0) return normalized;
  return normalized.slice(0, firstComma).trim();
};

const searchVariantKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const buildAssessorSearchTexts = (input: {
  address: string;
  normalizedAddress: string;
  addressVariants?: string[];
}) => {
  const baseCandidates = Array.from(new Set([
    input.normalizedAddress,
    ...(input.addressVariants || []),
    ...normalizeAddressVariants(input.address),
    input.address
  ].map((value) => normalizeAssessorSearchText(value || "")).filter(Boolean)));

  const variants: string[] = [];
  const seen = new Set<string>();
  const push = (value: string) => {
    const normalized = normalizeAssessorSearchText(value);
    if (!normalized) return;
    const key = searchVariantKey(normalized);
    if (key.length < 6 || seen.has(key)) return;
    seen.add(key);
    variants.push(normalized);
  };

  for (const candidate of baseCandidates) {
    const withoutUnit = stripAddressUnit(candidate);
    const streetLine = toStreetLine(candidate);
    const streetNoUnit = stripAddressUnit(streetLine);
    push(candidate);
    push(withoutUnit);
    push(streetLine);
    push(streetNoUnit);
    if (variants.length >= MAX_ASSESSOR_QUERY_VARIANTS) break;
  }

  if (variants.length > 0) {
    return variants.slice(0, MAX_ASSESSOR_QUERY_VARIANTS);
  }
  const fallback = normalizeAssessorSearchText(input.normalizedAddress || input.address);
  return fallback ? [fallback] : [];
};

const extractParcelFields = (attributes: Record<string, unknown>) => {
  const keys = Object.keys(attributes);
  const findKey = (patterns: RegExp[]) => keys.find((key) => patterns.some((pattern) => pattern.test(key)));
  const parcelKey = findKey([/parcel/i, /apn/i, /pin/i, /parcel_id/i, /parcelid/i]);
  const accountKey = findKey([/account/i, /acct/i, /taxroll/i]);
  const situsKey = findKey([/situs/i, /address/i, /site/i, /location/i]);

  const parcelId = parcelKey ? String(attributes[parcelKey] ?? "").trim() : undefined;
  const accountId = accountKey ? String(attributes[accountKey] ?? "").trim() : undefined;
  const situsAddress = situsKey ? String(attributes[situsKey] ?? "").trim() : undefined;

  return {
    parcelId: parcelId || undefined,
    accountId: accountId || undefined,
    situsAddress: situsAddress || undefined
  };
};

const buildCandidatesFromRecords = (
  records: { attributes: Record<string, unknown>; geometry?: any }[],
  source: "assessor" | "gis"
): ParcelCandidate[] => {
  return records.map((record) => {
    const fields = extractParcelFields(record.attributes);
    return {
      ...fields,
      source,
      matchType: source === "gis" ? "spatial" : "unknown",
      geometry: record.geometry,
      attributes: record.attributes
    };
  }).filter((candidate) => candidate.parcelId || candidate.accountId || candidate.situsAddress);
};

const buildExpectedSources = (portalUrl: string, datasetId?: string): SourcePointer[] => [{
  label: "Open data parcel dataset",
  portalUrl,
  endpoint: datasetId ? `${portalUrl}/resource/${datasetId}` : portalUrl
}];

const isTabularSocrataMeta = (meta: any) => {
  const viewType = String(meta?.viewType || meta?.view_type || "").toLowerCase();
  const displayType = String(meta?.displayType || meta?.display_type || "").toLowerCase();
  if (displayType.includes("map")) return false;
  if (viewType.includes("map")) return false;
  return true;
};

const requiresAuthSocrataMeta = (meta: any) => {
  if (!meta) return false;
  const access = String(meta?.accessLevel || meta?.access_level || meta?.access || "").toLowerCase();
  if (access.includes("private") || access.includes("restricted") || access.includes("non-public")) return true;
  if (meta?.private === true) return true;
  const publicationStage = String(meta?.publicationStage || meta?.publication_stage || "").toLowerCase();
  if (publicationStage && publicationStage !== "published") return true;
  const approval = String(meta?.approvalStatus || meta?.approval_status || meta?.state || "").toLowerCase();
  if (approval && approval !== "approved") return true;
  return false;
};

const accessConstraintsIndicateRestricted = (dataset: OpenDatasetMetadata) => {
  const constraintText = (dataset.accessConstraints || []).join(" ").toLowerCase();
  if (!constraintText) return false;
  return /private|restricted|non-public|internal|confidential/.test(constraintText);
};

type SocrataValidationResult =
  | { ok: true }
  | { ok: false; reason: "restricted" | "non_tabular" | "metadata" };

const validateSocrataDataset = async (
  dataset: OpenDatasetMetadata,
  portalUrl: string,
  dataGaps: DataGap[]
): Promise<SocrataValidationResult> => {
  if (!dataset.datasetId) return { ok: false, reason: "metadata" };
  const config = getOpenDataConfig();
  const headers: Record<string, string> = {};
  if (config.auth.socrataAppToken) {
    headers["X-App-Token"] = config.auth.socrataAppToken;
  }
  const normalizedPortal = normalizePortalUrl(portalUrl);
  await enforceRateLimit(`socrata:${normalizedPortal}`, config.auth.socrataAppToken ? 100 : 500);
  const metaUrl = `${normalizedPortal}/api/views/${dataset.datasetId}.json`;
  const response = await fetchJsonWithRetry<any>(metaUrl, { headers, retries: 0, cacheTtlMs: OPEN_DATA_QUERY_CACHE_TTL_MS }, {
    portalType: "socrata",
    portalUrl: normalizedPortal
  });

  if (!response.ok || !response.data) {
    dataGaps.push(buildDataGap(
      `${dataset.title} (${dataset.datasetId}) metadata unavailable.`,
      response.error ? `${response.error}` : "Metadata fetch failed.",
      "unavailable",
      buildExpectedSources(normalizedPortal, dataset.datasetId)
    ));
    return { ok: false, reason: "metadata" };
  }
  if (requiresAuthSocrataMeta(response.data)) {
    dataGaps.push(buildDataGap(
      `${dataset.title} (${dataset.datasetId}) requires authentication or elevated access.`,
      "Dataset requires authentication or restricted access.",
      "restricted",
      buildExpectedSources(normalizedPortal, dataset.datasetId)
    ));
    return { ok: false, reason: "restricted" };
  }
  if (!isTabularSocrataMeta(response.data)) {
    dataGaps.push(buildDataGap(
      `${dataset.title} (${dataset.datasetId}) is not a tabular dataset (map or visualization).`,
      "Dataset is not tabular; cannot query via SODA.",
      "unavailable",
      buildExpectedSources(normalizedPortal, dataset.datasetId)
    ));
    return { ok: false, reason: "non_tabular" };
  }
  return { ok: true };
};

const buildCitationSources = (portalUrl: string, datasetId?: string, datasetTitle?: string, updatedAt?: string) => {
  const now = new Date().toISOString();
  const url = datasetId ? `${portalUrl}/resource/${datasetId}` : portalUrl;
  const source: CitationSource = {
    id: `source-${Math.random().toString(36).slice(2, 10)}`,
    url,
    title: datasetTitle || "Open data parcel dataset",
    publisher: portalUrl,
    sourceType: "quasi_official",
    retrievedAt: now,
    sourceUpdatedAt: updatedAt
  };
  return [source];
};

const buildParcelClaims = (parcelId?: string, datasetSource?: CitationSource): ClaimCitation[] => {
  if (!parcelId || !datasetSource) return [];
  return [{
    id: `claim-${Math.random().toString(36).slice(2, 10)}`,
    fieldPath: "/parcel/parcelId",
    claim: `Parcel ID ${parcelId} recorded in open data parcel dataset.`,
    value: parcelId,
    citations: [{ sourceId: datasetSource.id }],
    createdAt: isoDateToday()
  }];
};

const findParcelDatasets = (portalUrl: string) => {
  const normalizedPortal = normalizePortalUrl(portalUrl);
  const index = getOpenDatasetIndex();
  const candidates = index.datasets.filter((dataset) => {
    if (normalizePortalUrl(dataset.portalUrl) !== normalizedPortal) return false;
    const text = normalizeKey(`${dataset.title} ${dataset.description || ""} ${(dataset.tags || []).join(" ")}`);
    return text.includes("parcel") || text.includes("assessor") || text.includes("cad") || text.includes("apn");
  });
  return candidates;
};

export const resolveParcelFromOpenDataPortal = async (input: {
  address: string;
  portalUrl: string;
  portalType?: "socrata" | "arcgis" | "dcat" | "unknown";
  jurisdiction?: Jurisdiction;
  calibration?: CalibrationOptions;
}) => {
  const config = getOpenDataConfig();
  const calibration = input.calibration || {};
  const calibrationMode = Boolean(calibration.enabled || calibration.includeDiagnostics);
  const dataGaps: DataGap[] = [];

  if (config.featureFlags.usOnlyAddressPolicy && isNonUsJurisdiction(input.jurisdiction)) {
    dataGaps.push(buildDataGap(
      "Open-data parcel lookup skipped for non-US address.",
      "US-only address policy is enabled for open-data parcel resolution.",
      "unavailable",
      buildExpectedSources(input.portalUrl)
    ));
    return {
      parcel: undefined,
      geocode: undefined,
      dataGaps,
      datasetsUsed: [],
      sources: [],
      claims: [],
      diagnostics: calibrationMode
        ? {
            calibrationMode: true,
            blockedDatasets: [],
            relaxedDatasets: [],
            evaluatedDatasets: [],
            validationStats: { restricted: 0, nonTabular: 0, metadata: 0 },
            queryableDatasetCount: 0
          }
        : undefined
    };
  }

  const provider = await getOpenDataProviderForPortalAsync(input.portalUrl, input.portalType);
  const normalizedAddress = normalizeAddressVariants(input.address)[0] || input.address;

  const contractValidation = validateDataSourceContracts();
  if (!contractValidation.valid) {
    dataGaps.push(buildDataGap(
      "Data source contracts validation failed.",
      contractValidation.errors.slice(0, 2).join(" | "),
      "missing",
      buildExpectedSources(input.portalUrl)
    ));
  }

  const { geocode } = await addressToGeometry({ address: input.address, jurisdiction: input.jurisdiction });
  if (!geocode?.point) {
    dataGaps.push(buildDataGap(
      "Unable to geocode address for parcel lookup.",
      "Geocoding returned no location point.",
      "missing",
      buildExpectedSources(input.portalUrl)
    ));
  }

  let datasets = findParcelDatasets(input.portalUrl);
  if (datasets.length === 0) {
    datasets = await provider.discoverDatasets("parcel assessor apn pin property");
    if (datasets.length === 0) {
      datasets = await provider.discoverDatasets("parcel");
    }
    if (datasets.length > 0) {
      persistOpenDatasetMetadata(datasets);
    }
  }

  const evaluatedDatasets: OpenDatasetMetadata[] = [];
  const gateDiagnostics: DatasetGateDiagnostic[] = [];
  for (const dataset of datasets) {
    const evaluated = evaluateDatasetUsage(dataset);
    let adjusted = evaluated as OpenDatasetMetadata;
    let overrideApplied = false;
    if (
      calibrationMode
      && calibration.relaxPublicAssessorReviewGates
      && evaluated.doNotUse
      && evaluated.complianceAction === "review"
      && isVerifiedPublicAssessorDataset(evaluated)
    ) {
      overrideApplied = true;
      adjusted = {
        ...evaluated,
        doNotUse: false,
        complianceNotes: Array.from(new Set([
          ...(evaluated.complianceNotes || []),
          "calibration_override_public_assessor_review"
        ]))
      };
    }
    const blockReasons = overrideApplied ? [] : buildBlockReasons(adjusted);
    gateDiagnostics.push({
      datasetId: adjusted.datasetId,
      title: adjusted.title,
      complianceAction: adjusted.complianceAction,
      complianceNotes: adjusted.complianceNotes,
      freshnessStatus: adjusted.freshnessStatus,
      doNotUse: Boolean(adjusted.doNotUse),
      overrideApplied: overrideApplied || undefined,
      blockReasons
    });
    evaluatedDatasets.push(adjusted);
  }
  const usableDatasets = evaluatedDatasets.filter((dataset) => !dataset.doNotUse);
  const validationStats = {
    restricted: 0,
    nonTabular: 0,
    metadata: 0
  };
  let queryableDatasets = usableDatasets;

  if (usableDatasets.length > 0) {
    const validated: OpenDatasetMetadata[] = [];
    for (const dataset of usableDatasets) {
      if (accessConstraintsIndicateRestricted(dataset)) {
        validationStats.restricted += 1;
        dataGaps.push(buildDataGap(
          `${dataset.title}${dataset.datasetId ? ` (${dataset.datasetId})` : ""} requires authentication or restricted access.`,
          "Dataset access constraints indicate restricted or private access.",
          "restricted",
          buildExpectedSources(input.portalUrl, dataset.datasetId)
        ));
        continue;
      }
      if (provider.type === "socrata") {
        const validation = await validateSocrataDataset(dataset, input.portalUrl, dataGaps);
        if (!validation.ok) {
          const reason = (validation as { reason?: string }).reason;
          if (reason === "restricted") validationStats.restricted += 1;
          if (reason === "non_tabular") validationStats.nonTabular += 1;
          if (reason === "metadata") validationStats.metadata += 1;
          continue;
        }
      }
      validated.push(dataset);
    }
    queryableDatasets = validated;
  }

  if (usableDatasets.length === 0) {
    const complianceNotes = evaluatedDatasets.flatMap((dataset) => dataset.complianceNotes || []);
    const paidNote = complianceNotes.find((note) => note.includes("paid"));
    dataGaps.push(buildDataGap(
      "No usable parcel datasets available from portal.",
      paidNote
        ? "Datasets appear to require paid access under zero-cost mode."
        : "Datasets are blocked by compliance or freshness gates.",
      "restricted",
      buildExpectedSources(input.portalUrl)
    ));
  } else if (queryableDatasets.length === 0) {
    const reasons: string[] = [];
    if (validationStats.restricted > 0) reasons.push("restricted access");
    if (validationStats.nonTabular > 0) reasons.push("non-tabular datasets");
    if (validationStats.metadata > 0) reasons.push("metadata unavailable");
    const reasonText = reasons.length > 0
      ? `Only ${reasons.join(" / ")} datasets were found.`
      : "No queryable datasets available after validation.";
    dataGaps.push(buildDataGap(
      "No queryable parcel datasets available from portal.",
      reasonText,
      validationStats.restricted > 0 ? "restricted" : "unavailable",
      buildExpectedSources(input.portalUrl)
    ));
  }

  const rankedQueryableDatasets = rankDatasetsForParcelResolution(queryableDatasets, normalizedAddress);
  const textQueryDatasets = rankedQueryableDatasets.slice(0, OPEN_DATA_PORTAL_MAX_TEXT_DATASET_QUERIES);
  const geometryQueryDatasets = rankedQueryableDatasets.slice(0, OPEN_DATA_PORTAL_MAX_GEOMETRY_DATASET_QUERIES);

  const datasetPerformance = new Map<string, {
    dataset: OpenDatasetMetadata;
    score: number;
    textHits: number;
    geometryHits: number;
    queryErrors: number;
  }>();
  rankedQueryableDatasets.forEach((dataset) => {
    datasetPerformance.set(dataset.id, {
      dataset,
      score: scoreDatasetForParcelResolution(dataset, normalizedAddress),
      textHits: 0,
      geometryHits: 0,
      queryErrors: 0
    });
  });

  const assessorLookup = async (lookupInput: ParcelLookupInput) => {
    const candidates: ParcelCandidate[] = [];
    const searchTexts = buildAssessorSearchTexts({
      address: lookupInput.address || input.address,
      normalizedAddress: lookupInput.normalizedAddress || normalizedAddress,
      addressVariants: lookupInput.addressVariants
    });
    for (const dataset of textQueryDatasets) {
      if (!dataset.datasetId) continue;
      for (const searchText of searchTexts) {
        const result = await provider.queryByText({
          datasetId: dataset.datasetId,
          searchText,
          limit: 25
        });
        if (result.errors && result.errors.length > 0) {
          const perf = datasetPerformance.get(dataset.id);
          if (perf) perf.queryErrors += 1;
          const error = result.errors[0];
          const guidance = error.status === 401 || error.status === 403
            ? "Check optional API key or portal access policy."
            : error.status === 429
              ? "Rate limited. Retry later or provide optional token."
              : "Retry later or verify portal availability.";
          dataGaps.push(buildDataGap(
            "Parcel dataset query failed.",
            `${error.message} (${error.code}). ${guidance}`,
            "missing",
            buildExpectedSources(input.portalUrl, dataset.datasetId)
          ));
          break;
        }
        const records = buildCandidatesFromRecords(result.records, "assessor");
        if (records.length > 0) {
          const perf = datasetPerformance.get(dataset.id);
          if (perf) perf.textHits += records.length;
          candidates.push(...records);
          break;
        }
      }
    }
    return candidates;
  };

  const gisParcelLayer = async (params: { point: GeoPoint }) => {
    const features: ParcelGeometryFeature[] = [];
    for (const dataset of geometryQueryDatasets) {
      if (!dataset.datasetId) continue;
      const result = await provider.queryByGeometry({
        datasetId: dataset.datasetId,
        point: params.point,
        limit: 25
      });
      if (result.errors && result.errors.length > 0) {
        const perf = datasetPerformance.get(dataset.id);
        if (perf) perf.queryErrors += 1;
        const error = result.errors[0];
        const guidance = error.status === 401 || error.status === 403
          ? "Check optional API key or portal access policy."
          : error.status === 429
            ? "Rate limited. Retry later or provide optional token."
            : "Retry later or verify portal availability.";
        dataGaps.push(buildDataGap(
          "GIS parcel geometry query failed.",
          `${error.message} (${error.code}). ${guidance}`,
          "missing",
          buildExpectedSources(input.portalUrl, dataset.datasetId)
        ));
        continue;
      }
      let geometryMatchCount = 0;
      result.records.forEach((record) => {
        const fields = extractParcelFields(record.attributes);
        if (!record.geometry) return;
        geometryMatchCount += 1;
        features.push({
          geometry: record.geometry,
          parcelId: fields.parcelId,
          accountId: fields.accountId,
          situsAddress: fields.situsAddress,
          attributes: record.attributes
        });
      });
      if (geometryMatchCount > 0) {
        const perf = datasetPerformance.get(dataset.id);
        if (perf) perf.geometryHits += geometryMatchCount;
      }
    }
    return features;
  };

  const result = await resolveParcelWorkflow(
    {
      address: input.address,
      normalizedAddress,
      jurisdiction: input.jurisdiction
    },
    {
      geocode: async () => geocode || null,
      assessorLookup,
      gisParcelLayer: geocode?.point ? gisParcelLayer : undefined
    }
  );

  const performanceEntries = Array.from(datasetPerformance.values())
    .sort((a, b) =>
      ((b.textHits + b.geometryHits) - (a.textHits + a.geometryHits))
      || (a.queryErrors - b.queryErrors)
      || (b.score - a.score)
    );
  const datasetForCitations = performanceEntries.find((entry) => (entry.textHits + entry.geometryHits) > 0)?.dataset
    || rankedQueryableDatasets[0];
  const sources = datasetForCitations
    ? buildCitationSources(input.portalUrl, datasetForCitations.datasetId, datasetForCitations.title, datasetForCitations.lastUpdated)
    : [];
  const claims = buildParcelClaims(result.parcel?.parcelId, sources[0]);
  const calibrationDiagnostics: CalibrationDiagnostics | undefined = calibrationMode
    ? {
        calibrationMode: true,
        blockedDatasets: gateDiagnostics.filter((entry) => entry.doNotUse && !entry.overrideApplied),
        relaxedDatasets: gateDiagnostics.filter((entry) => Boolean(entry.overrideApplied)),
        evaluatedDatasets: gateDiagnostics,
        validationStats,
        queryableDatasetCount: rankedQueryableDatasets.length
      }
    : undefined;

  return {
    ...result,
    dataGaps: [...result.dataGaps, ...dataGaps],
    datasetsUsed: rankedQueryableDatasets,
    sources,
    claims,
    diagnostics: calibrationDiagnostics
  };
};
