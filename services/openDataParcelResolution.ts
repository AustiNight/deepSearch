import type { ClaimCitation, CitationSource, DataGap, GeoPoint, Jurisdiction, SourcePointer } from "../types";
import type { ParcelCandidate, ParcelGeometryFeature } from "./parcelResolution";
import { resolveParcelWorkflow } from "./parcelResolution";
import { addressToGeometry } from "./openDataGeocoding";
import { getOpenDataProviderForPortal } from "./openDataPortalService";
import { getOpenDatasetIndex } from "./openDataDiscovery";
import { evaluateDatasetUsage } from "./openDataUsage";
import { normalizeAddressVariants } from "./addressNormalization";
import { validateDataSourceContracts } from "../data/dataSourceContracts";

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
  const provider = getOpenDataProviderForPortal(input.portalUrl, input.portalType);
  const normalizedAddress = normalizeAddressVariants(input.address)[0] || input.address;
  const dataGaps: DataGap[] = [];

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
  }

  const assessorLookup = async () => {
    const candidates: ParcelCandidate[] = [];
    for (const dataset of usableDatasets) {
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
    for (const dataset of usableDatasets) {
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

  const datasetForCitations = usableDatasets[0];
  const sources = datasetForCitations
    ? buildCitationSources(input.portalUrl, datasetForCitations.datasetId, datasetForCitations.title, datasetForCitations.lastUpdated)
    : [];
  const claims = buildParcelClaims(result.parcel?.parcelId, sources[0]);

  return {
    ...result,
    dataGaps: [...result.dataGaps, ...dataGaps],
    datasetsUsed: usableDatasets,
    sources,
    claims
  };
};
