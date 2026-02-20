import type { ClaimCitation, CitationSource, DataGap, GeoPoint, Jurisdiction, OpenDatasetMetadata, SourcePointer } from "../types";
import type { ParcelCandidate, ParcelGeometryFeature } from "./parcelResolution";
import { resolveParcelWorkflow } from "./parcelResolution";
import { addressToGeometry } from "./openDataGeocoding";
import { getOpenDataProviderForPortal } from "./openDataPortalService";
import { getOpenDatasetIndex } from "./openDataDiscovery";
import { evaluateDatasetUsage } from "./openDataUsage";
import { normalizeAddressVariants } from "./addressNormalization";
import { validateDataSourceContracts } from "../data/dataSourceContracts";
import { getOpenDataConfig } from "./openDataConfig";
import { isNonUsJurisdiction } from "./addressScope";
import { enforceRateLimit, fetchJsonWithRetry } from "./openDataHttp";

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

const normalizePortalUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed}`.replace(/\/$/, "");
};

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

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
  const response = await fetchJsonWithRetry<any>(metaUrl, { headers, retries: 0 }, {
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
  const index = getOpenDatasetIndex();
  const candidates = index.datasets.filter((dataset) => {
    if (dataset.portalUrl !== portalUrl) return false;
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
}) => {
  const config = getOpenDataConfig();
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
      claims: []
    };
  }

  const provider = getOpenDataProviderForPortal(input.portalUrl, input.portalType);
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
    datasets = await provider.discoverDatasets("parcel");
  }

  const evaluatedDatasets = datasets.map((dataset) => evaluateDatasetUsage(dataset));
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
          if (validation.reason === "restricted") validationStats.restricted += 1;
          if (validation.reason === "non_tabular") validationStats.nonTabular += 1;
          if (validation.reason === "metadata") validationStats.metadata += 1;
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

  const assessorLookup = async () => {
    const candidates: ParcelCandidate[] = [];
    for (const dataset of queryableDatasets) {
      if (!dataset.datasetId) continue;
      const result = await provider.queryByText({
        datasetId: dataset.datasetId,
        searchText: normalizedAddress,
        limit: 25
      });
      if (result.errors && result.errors.length > 0) {
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
        continue;
      }
      candidates.push(...buildCandidatesFromRecords(result.records, "assessor"));
    }
    return candidates;
  };

  const gisParcelLayer = async (params: { point: GeoPoint }) => {
    const features: ParcelGeometryFeature[] = [];
    for (const dataset of queryableDatasets) {
      if (!dataset.datasetId) continue;
      const result = await provider.queryByGeometry({
        datasetId: dataset.datasetId,
        point: params.point,
        limit: 25
      });
      if (result.errors && result.errors.length > 0) {
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
      result.records.forEach((record) => {
        const fields = extractParcelFields(record.attributes);
        if (!record.geometry) return;
        features.push({
          geometry: record.geometry,
          parcelId: fields.parcelId,
          accountId: fields.accountId,
          situsAddress: fields.situsAddress,
          attributes: record.attributes
        });
      });
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

  const datasetForCitations = queryableDatasets[0];
  const sources = datasetForCitations
    ? buildCitationSources(input.portalUrl, datasetForCitations.datasetId, datasetForCitations.title, datasetForCitations.lastUpdated)
    : [];
  const claims = buildParcelClaims(result.parcel?.parcelId, sources[0]);

  return {
    ...result,
    dataGaps: [...result.dataGaps, ...dataGaps],
    datasetsUsed: queryableDatasets,
    sources,
    claims
  };
};
