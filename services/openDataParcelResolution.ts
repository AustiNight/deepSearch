import type { ClaimCitation, CitationSource, DataGap, GeoPoint, Jurisdiction, OpenDatasetMetadata, SourcePointer } from "../types";
import type { ParcelCandidate, ParcelGeometryFeature, ParcelLookupInput } from "./parcelResolution";
import { resolveParcelWorkflow } from "./parcelResolution";
import { addressToGeometry } from "./openDataGeocoding";
import { getOpenDataProviderForPortalAsync } from "./openDataPortalService";
import { getOpenDatasetIndex, persistOpenDatasetMetadata } from "./openDataDiscovery";
import { evaluateDatasetUsage } from "./openDataUsage";
import { normalizeAddressVariants } from "./addressNormalization";
import { getOpenDataConfig } from "./openDataConfig";
import { recordOpenDataDatasetTelemetry, scoreOpenDataDatasetTelemetry } from "./openDataDatasetTelemetry";
import { validateDataSourceContracts } from "../data/dataSourceContracts";
import {
  OPEN_DATA_PORTAL_MAX_GEOMETRY_DATASET_QUERIES,
  OPEN_DATA_PORTAL_MAX_TEXT_DATASET_QUERIES
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
const OPEN_DATA_DISCOVERY_QUERY_PLAN = [
  "parcel",
  "assessor parcel",
  "apn pin cadastre",
  "property appraiser situs",
  "tax roll tax collector property",
  "deed recorder register clerk",
  "zoning land use planning",
  "permit inspection code enforcement",
  "flood hazard fema environmental",
  "gis parcel layer"
];

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
const SECONDARY_RECORD_TEXT_MATCH_LIMIT = 250;
const SECONDARY_RECORD_CITATION_LIMIT = 4;

type SecondaryRecordType =
  | "tax_collector"
  | "deed_recorder"
  | "zoning_gis"
  | "permits"
  | "code_enforcement"
  | "hazards_environmental";

type SecondaryRecordDefinition = {
  recordType: SecondaryRecordType;
  label: string;
  fieldPath: string;
  keywords: RegExp;
  supportsGeometry?: boolean;
  claimTemplate: (anchor: string) => string;
};

const SECONDARY_RECORD_DEFINITIONS: SecondaryRecordDefinition[] = [
  {
    recordType: "tax_collector",
    label: "Tax Collector",
    fieldPath: "/taxAppraisal",
    keywords: /tax collector|tax roll|treasurer|tax bill|assessed value|taxable value|millage/i,
    claimTemplate: (anchor) => `Tax collector records were located for ${anchor}.`
  },
  {
    recordType: "deed_recorder",
    label: "Deed Recorder",
    fieldPath: "/ownership",
    keywords: /deed|recorder|register of deeds|clerk|instrument|grantor|grantee|conveyance/i,
    claimTemplate: (anchor) => `Deed/ownership transfer records were located for ${anchor}.`
  },
  {
    recordType: "zoning_gis",
    label: "Zoning GIS",
    fieldPath: "/zoningLandUse",
    keywords: /zoning|land use|future land use|overlay|planning|district|feature server/i,
    supportsGeometry: true,
    claimTemplate: (anchor) => `Zoning or land-use records were located for ${anchor}.`
  },
  {
    recordType: "permits",
    label: "Permits",
    fieldPath: "/permitsAndCode/permits",
    keywords: /permit|inspection|construction|building permit|permit status|certificate of occupancy/i,
    claimTemplate: (anchor) => `Permit records were located for ${anchor}.`
  },
  {
    recordType: "code_enforcement",
    label: "Code Enforcement",
    fieldPath: "/permitsAndCode/codeViolations",
    keywords: /code enforcement|code violation|violation|complaint|citation|abatement|311/i,
    claimTemplate: (anchor) => `Code enforcement records were located for ${anchor}.`
  },
  {
    recordType: "hazards_environmental",
    label: "Hazards/Environmental",
    fieldPath: "/hazardsEnvironmental",
    keywords: /flood|fema|hazard|environment|contamination|brownfield|superfund|wildfire|seismic/i,
    supportsGeometry: true,
    claimTemplate: (anchor) => `Hazard/environmental records were located for ${anchor}.`
  }
];

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

type DatasetRankingOptions = {
  useTelemetry?: boolean;
};

const scoreDatasetForParcelResolution = (
  dataset: OpenDatasetMetadata,
  normalizedAddress: string,
  options: DatasetRankingOptions = {}
) => {
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
  if (options.useTelemetry !== false) {
    score += scoreOpenDataDatasetTelemetry(dataset);
  }
  return score;
};

const rankDatasetsForParcelResolution = (
  datasets: OpenDatasetMetadata[],
  normalizedAddress: string,
  options: DatasetRankingOptions = {}
) => {
  return datasets
    .map((dataset, index) => ({
      dataset,
      index,
      score: scoreDatasetForParcelResolution(dataset, normalizedAddress, options)
    }))
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .map((entry) => entry.dataset);
};

const ADDRESS_UNIT_PATTERN = /(?:^|\s|,)(?:#|apt|apartment|unit|suite|ste|bldg|building|fl|floor|lot|trlr|trailer)\.?\s*[a-z0-9-]+\b/gi;
const UNIT_HINT_PATTERN = /(?:^|\s|,)(?:#|apt|apartment|unit|suite|ste|bldg|building|fl|floor|lot|rm|room|ph)\s*[-#]*([a-z0-9-]+)/gi;

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

const normalizeUnitHint = (value?: string) => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

const extractUnitHints = (...values: Array<string | undefined>) => {
  const hints = new Set<string>();
  values.forEach((value) => {
    const text = String(value || "").trim();
    if (!text) return;
    let match: RegExpExecArray | null;
    UNIT_HINT_PATTERN.lastIndex = 0;
    while ((match = UNIT_HINT_PATTERN.exec(text)) !== null) {
      const unit = normalizeUnitHint(match[1]);
      if (unit) hints.add(unit);
    }
    const streetLine = text.split(",")[0]?.trim() || "";
    const trailing = streetLine.split(/\s+/).filter(Boolean).pop() || "";
    if (/^(?:[a-z]-\d+[a-z]?|\d+[a-z]?(?:-\d+[a-z]?)?)$/i.test(trailing)) {
      const unit = normalizeUnitHint(trailing);
      if (unit) hints.add(unit);
    }
  });
  return hints;
};

const candidateMatchesUnitHints = (candidate: ParcelCandidate, hints: Set<string>) => {
  if (hints.size === 0) return true;
  const texts = [candidate.situsAddress];
  const attrs = candidate.attributes || {};
  Object.entries(attrs).forEach(([key, value]) => {
    if (!/(address|addr|situs|site|location|unit|apt|suite|ste|room|line)/i.test(key)) return;
    if (typeof value !== "string") return;
    if (value.length > 160) return;
    texts.push(value);
  });
  for (const text of texts) {
    const tokens = extractUnitHints(text);
    for (const token of tokens) {
      if (hints.has(token)) return true;
    }
  }
  return false;
};

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
  }

  if (variants.length > 0) {
    return variants;
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
    const matchType: ParcelCandidate["matchType"] = source === "gis" ? "spatial" : "unknown";
    return {
      ...fields,
      source,
      matchType,
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

const buildDatasetTextCorpus = (dataset: OpenDatasetMetadata) => {
  return [
    dataset.title || "",
    dataset.description || "",
    dataset.source || "",
    ...(dataset.tags || []),
    ...(dataset.fields || [])
  ].join(" ").toLowerCase();
};

const datasetMatchesSecondaryRecordType = (dataset: OpenDatasetMetadata, definition: SecondaryRecordDefinition) => {
  const text = buildDatasetTextCorpus(dataset);
  return definition.keywords.test(text);
};

const buildRecordLookupTokens = (input: {
  address: string;
  normalizedAddress: string;
  parcelId?: string;
  accountId?: string;
  situsAddress?: string;
}) => {
  const tokens = [
    input.parcelId,
    input.accountId,
    input.situsAddress,
    input.normalizedAddress,
    ...normalizeAddressVariants(input.address)
  ]
    .map((value) => normalizeAssessorSearchText(String(value || "")))
    .filter((value) => value.length >= 4);
  return Array.from(new Set(tokens));
};

const mergeCitationSources = (sources: CitationSource[]) => {
  const byKey = new Map<string, CitationSource>();
  for (const source of sources) {
    const key = normalizeKey(source.url || "");
    if (!key || byKey.has(key)) continue;
    byKey.set(key, source);
  }
  return Array.from(byKey.values());
};

const mapCitationSourceByUrl = (sources: CitationSource[]) => {
  const byUrl = new Map<string, CitationSource>();
  for (const source of sources) {
    const key = normalizeKey(source.url || "");
    if (!key || byUrl.has(key)) continue;
    byUrl.set(key, source);
  }
  return byUrl;
};

const buildSecondaryRecordClaim = (
  definition: SecondaryRecordDefinition,
  anchor: string,
  sources: CitationSource[]
): ClaimCitation => ({
  id: `claim-${Math.random().toString(36).slice(2, 10)}`,
  fieldPath: definition.fieldPath,
  claim: definition.claimTemplate(anchor),
  value: anchor,
  citations: sources.slice(0, SECONDARY_RECORD_CITATION_LIMIT).map((source) => ({ sourceId: source.id })),
  createdAt: isoDateToday()
});

const remapClaimCitations = (
  claims: ClaimCitation[],
  oldSources: CitationSource[],
  mergedSourcesByUrl: Map<string, CitationSource>
) => {
  const oldSourceById = new Map(oldSources.map((source) => [source.id, source]));
  return claims.map((claim) => {
    const nextCitations = (claim.citations || [])
      .map((citation) => {
        const oldSource = oldSourceById.get(citation.sourceId);
        if (!oldSource?.url) return null;
        const mergedSource = mergedSourcesByUrl.get(normalizeKey(oldSource.url));
        if (!mergedSource) return null;
        return { sourceId: mergedSource.id };
      })
      .filter((citation): citation is { sourceId: string } => Boolean(citation));
    return {
      ...claim,
      citations: nextCitations
    };
  }).filter((claim) => claim.citations.length > 0);
};

const resolveSecondaryRecordEvidence = async (input: {
  provider: any;
  portalUrl: string;
  datasets: OpenDatasetMetadata[];
  geocodePoint?: GeoPoint;
  lookupTokens: string[];
  dataGaps: DataGap[];
  collectTelemetry?: boolean;
}) => {
  const sources: CitationSource[] = [];
  const claims: ClaimCitation[] = [];
  const contributingDatasets: OpenDatasetMetadata[] = [];

  for (const definition of SECONDARY_RECORD_DEFINITIONS) {
    const candidateDatasets = input.datasets
      .filter((dataset) => datasetMatchesSecondaryRecordType(dataset, definition));
    if (candidateDatasets.length === 0) continue;

    const matchedSources: CitationSource[] = [];
    for (const dataset of candidateDatasets) {
      if (!dataset.datasetId) continue;
      let datasetMatched = false;
      let textAttempted = false;
      let textHits = 0;
      let textErrored = false;
      let geometryAttempted = false;
      let geometryHits = 0;
      let geometryErrored = false;

      for (const token of input.lookupTokens) {
        textAttempted = true;
        const textResult = await input.provider.queryByText({
          datasetId: dataset.datasetId,
          searchText: token,
          limit: SECONDARY_RECORD_TEXT_MATCH_LIMIT
        });
        if (Array.isArray(textResult?.errors) && textResult.errors.length > 0) {
          textErrored = true;
          const error = textResult.errors[0];
          input.dataGaps.push(buildDataGap(
            `${definition.label} dataset query failed.`,
            `${error.message || "query failed"} (${error.code || "unknown"}).`,
            "missing",
            buildExpectedSources(input.portalUrl, dataset.datasetId)
          ));
          break;
        }
        if (Array.isArray(textResult?.records) && textResult.records.length > 0) {
          datasetMatched = true;
          textHits = textResult.records.length;
          break;
        }
      }

      if (!datasetMatched && definition.supportsGeometry && input.geocodePoint) {
        geometryAttempted = true;
        const geometryResult = await input.provider.queryByGeometry({
          datasetId: dataset.datasetId,
          point: input.geocodePoint,
          limit: SECONDARY_RECORD_TEXT_MATCH_LIMIT
        });
        if (Array.isArray(geometryResult?.errors) && geometryResult.errors.length > 0) {
          geometryErrored = true;
          const error = geometryResult.errors[0];
          input.dataGaps.push(buildDataGap(
            `${definition.label} geometry query failed.`,
            `${error.message || "query failed"} (${error.code || "unknown"}).`,
            "missing",
            buildExpectedSources(input.portalUrl, dataset.datasetId)
          ));
        } else if (Array.isArray(geometryResult?.records) && geometryResult.records.length > 0) {
          datasetMatched = true;
          geometryHits = geometryResult.records.length;
        }
      }

      if (input.collectTelemetry !== false) {
        if (textAttempted) {
          recordOpenDataDatasetTelemetry({
            dataset,
            mode: "text",
            hits: textHits,
            errored: textErrored
          });
        }
        if (geometryAttempted) {
          recordOpenDataDatasetTelemetry({
            dataset,
            mode: "geometry",
            hits: geometryHits,
            errored: geometryErrored
          });
        }
      }

      if (datasetMatched) {
        const source = buildCitationSource(input.portalUrl, dataset.datasetId, dataset.title, dataset.lastUpdated);
        matchedSources.push(source);
        contributingDatasets.push(dataset);
      }
    }

    const dedupedMatchedSources = mergeCitationSources(matchedSources);
    if (dedupedMatchedSources.length > 0) {
      const anchor = input.lookupTokens[0] || "subject property";
      claims.push(buildSecondaryRecordClaim(definition, anchor, dedupedMatchedSources));
      sources.push(...dedupedMatchedSources);
    }
  }

  return {
    sources: mergeCitationSources(sources),
    claims,
    contributingDatasets
  };
};


const buildCitationSource = (portalUrl: string, datasetId?: string, datasetTitle?: string, updatedAt?: string): CitationSource => {
  const now = new Date().toISOString();
  const url = datasetId ? `${portalUrl}/resource/${datasetId}` : portalUrl;
  return {
    id: `source-${Math.random().toString(36).slice(2, 10)}`,
    url,
    title: datasetTitle || "Open data parcel dataset",
    publisher: portalUrl,
    sourceType: "quasi_official",
    retrievedAt: now,
    sourceUpdatedAt: updatedAt
  };
};

const buildCitationSourcesFromDatasets = (portalUrl: string, datasets: OpenDatasetMetadata[]) => {
  const seen = new Set<string>();
  const sources: CitationSource[] = [];
  for (const dataset of datasets) {
    const source = buildCitationSource(portalUrl, dataset.datasetId, dataset.title, dataset.lastUpdated);
    const key = normalizeKey(source.url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    sources.push(source);
  }
  return sources;
};

const buildParcelClaims = (parcelId?: string, datasetSources: CitationSource[] = []): ClaimCitation[] => {
  if (!parcelId || datasetSources.length === 0) return [];
  const citations = datasetSources.slice(0, 6).map((source) => ({ sourceId: source.id }));
  return [{
    id: `claim-${Math.random().toString(36).slice(2, 10)}`,
    fieldPath: "/parcel/parcelId",
    claim: `Parcel ID ${parcelId} recorded in open data parcel dataset.`,
    value: parcelId,
    citations,
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

const buildDatasetDiscoveryKey = (dataset: OpenDatasetMetadata) => {
  const portal = normalizePortalUrl(dataset.portalUrl || "");
  const identifier = dataset.datasetId || dataset.id || dataset.title || "";
  return normalizeKey(`${portal}|${identifier}`);
};

const discoverParcelCandidateDatasets = async (provider: any) => {
  const discovered: OpenDatasetMetadata[] = [];
  const seen = new Set<string>();
  for (const query of OPEN_DATA_DISCOVERY_QUERY_PLAN) {
    const batch = await provider.discoverDatasets(query);
    if (!Array.isArray(batch) || batch.length === 0) continue;
    for (const dataset of batch) {
      const key = buildDatasetDiscoveryKey(dataset);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      discovered.push(dataset);
    }
  }
  return discovered;
};

export const resolveParcelFromOpenDataPortal = async (input: {
  address: string;
  portalUrl: string;
  portalType?: "socrata" | "arcgis" | "dcat" | "unknown";
  jurisdiction?: Jurisdiction;
  calibration?: CalibrationOptions;
}) => {
  const calibration = input.calibration || {};
  const calibrationMode = Boolean(calibration.enabled || calibration.includeDiagnostics);
  const dataGaps: DataGap[] = [];
  const runtimeConfig = getOpenDataConfig();
  const useDatasetTelemetryRanking = runtimeConfig.featureFlags.datasetTelemetryRanking !== false;
  const rankingOptions: DatasetRankingOptions = { useTelemetry: useDatasetTelemetryRanking };

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
    datasets = await discoverParcelCandidateDatasets(provider);
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
  const queryableDatasets = usableDatasets;

  if (usableDatasets.length === 0) {
    const complianceNotes = evaluatedDatasets.flatMap((dataset) => dataset.complianceNotes || []);
    const paidNote = complianceNotes.find((note) => note.includes("paid"));
    dataGaps.push(buildDataGap(
      "No usable parcel datasets available from portal.",
      paidNote
        ? "Datasets appear to require paid access."
        : "Datasets are blocked by public-access policy.",
      "restricted",
      buildExpectedSources(input.portalUrl)
    ));
  }

  const rankedQueryableDatasets = rankDatasetsForParcelResolution(queryableDatasets, normalizedAddress, rankingOptions);
  const textQueryDatasets = rankedQueryableDatasets.slice(0, Math.max(1, OPEN_DATA_PORTAL_MAX_TEXT_DATASET_QUERIES));
  const geometryQueryDatasets = rankedQueryableDatasets.slice(0, Math.max(1, OPEN_DATA_PORTAL_MAX_GEOMETRY_DATASET_QUERIES));

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
      score: scoreDatasetForParcelResolution(dataset, normalizedAddress, rankingOptions),
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
    const unitHints = extractUnitHints(
      lookupInput.address,
      lookupInput.normalizedAddress,
      ...(lookupInput.addressVariants || [])
    );
    const queryLimit = unitHints.size > 0 ? 1000 : 500;
    for (const dataset of textQueryDatasets) {
      if (!dataset.datasetId) continue;
      let datasetMatched = false;
      let datasetAttempted = false;
      let datasetErrored = false;
      let datasetTextHits = 0;
      for (const searchText of searchTexts) {
        datasetAttempted = true;
        const result = await provider.queryByText({
          datasetId: dataset.datasetId,
          searchText,
          limit: queryLimit
        });
        if (result.errors && result.errors.length > 0) {
          datasetErrored = true;
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
          const filteredByUnit = unitHints.size > 0
            ? records.filter((candidate) => candidateMatchesUnitHints(candidate, unitHints))
            : records;
          const perf = datasetPerformance.get(dataset.id);
          if (filteredByUnit.length > 0) {
            datasetTextHits += filteredByUnit.length;
            if (perf) perf.textHits += filteredByUnit.length;
            candidates.push(...filteredByUnit);
            datasetMatched = true;
            break;
          }
        }
      }
      if (useDatasetTelemetryRanking && datasetAttempted) {
        recordOpenDataDatasetTelemetry({
          dataset,
          mode: "text",
          hits: datasetTextHits,
          errored: datasetErrored
        });
      }
      if (datasetMatched) continue;
    }
    return candidates;
  };

  const gisParcelLayer = async (params: { point: GeoPoint }) => {
    const features: ParcelGeometryFeature[] = [];
    for (const dataset of geometryQueryDatasets) {
      if (!dataset.datasetId) continue;
      let geometryAttempted = false;
      let geometryHits = 0;
      let geometryErrored = false;
      geometryAttempted = true;
      const result = await provider.queryByGeometry({
        datasetId: dataset.datasetId,
        point: params.point,
        limit: 25
      });
      if (result.errors && result.errors.length > 0) {
        geometryErrored = true;
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
        if (useDatasetTelemetryRanking && geometryAttempted) {
          recordOpenDataDatasetTelemetry({
            dataset,
            mode: "geometry",
            hits: 0,
            errored: geometryErrored
          });
        }
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
        geometryHits = geometryMatchCount;
      }
      if (useDatasetTelemetryRanking && geometryAttempted) {
        recordOpenDataDatasetTelemetry({
          dataset,
          mode: "geometry",
          hits: geometryHits,
          errored: geometryErrored
        });
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
  const contributingDatasets = performanceEntries
    .filter((entry) => (entry.textHits + entry.geometryHits) > 0)
    .map((entry) => entry.dataset);
  const lookupTokens = buildRecordLookupTokens({
    address: input.address,
    normalizedAddress,
    parcelId: result.parcel?.parcelId,
    accountId: result.parcel?.accountId,
    situsAddress: result.parcel?.situsAddress
  });
  const secondaryEvidence = lookupTokens.length > 0
      ? await resolveSecondaryRecordEvidence({
        provider,
        portalUrl: input.portalUrl,
        datasets: rankedQueryableDatasets,
        geocodePoint: geocode?.point,
        lookupTokens,
        dataGaps,
        collectTelemetry: useDatasetTelemetryRanking
      })
    : {
        sources: [] as CitationSource[],
        claims: [] as ClaimCitation[],
        contributingDatasets: [] as OpenDatasetMetadata[]
      };
  const citationDatasets = [
    ...contributingDatasets,
    ...secondaryEvidence.contributingDatasets
  ];
  const selectedCitationDatasets = citationDatasets.length > 0
    ? rankDatasetsForParcelResolution(citationDatasets, normalizedAddress, rankingOptions)
    : rankedQueryableDatasets.slice(0, 1);
  const parcelSources = buildCitationSourcesFromDatasets(input.portalUrl, selectedCitationDatasets);
  const mergedSources = mergeCitationSources([...parcelSources, ...secondaryEvidence.sources]);
  const mergedSourcesByUrl = mapCitationSourceByUrl(mergedSources);
  const parcelClaims = buildParcelClaims(result.parcel?.parcelId || result.parcel?.accountId, mergedSources);
  const secondaryClaims = remapClaimCitations(
    secondaryEvidence.claims,
    secondaryEvidence.sources,
    mergedSourcesByUrl
  );
  const claims = [...parcelClaims, ...secondaryClaims];
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
    datasetsUsed: selectedCitationDatasets.length > 0 ? selectedCitationDatasets : rankedQueryableDatasets,
    sources: mergedSources,
    claims,
    diagnostics: calibrationDiagnostics
  };
};
