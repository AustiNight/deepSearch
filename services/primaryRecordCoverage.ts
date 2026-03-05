import type {
  DatasetComplianceEntry,
  Jurisdiction,
  NormalizedSource,
  OpenDataPortalType,
  PrimaryRecordCoverage
} from "../types";
import { PRIMARY_RECORD_TYPES, type PrimaryRecordType } from "../data/jurisdictionAvailability";
import { formatAvailabilityDetails, getRecordAvailability } from "./jurisdictionAvailability";
import { scoreAuthority } from "./evidenceGating";
import { buildDatasetComplianceSummary, getOpenDatasetIndex } from "./openDataDiscovery";

const PRIMARY_RECORD_KEYWORDS: Record<PrimaryRecordType, RegExp[]> = {
  assessor_parcel: [
    /\bassessor\b/i,
    /\bappraiser\b/i,
    /\bappraisal\b/i,
    /\bcad\b/i,
    /\bproperty\b/i,
    /\bparcel\b/i,
    /\btax assessor\b/i,
    /\bproperty appraiser\b/i,
    /\bcentral appraisal district\b/i
  ],
  tax_collector: [
    /\btax collector\b/i,
    /\btax assessor\b/i,
    /\btreasurer\b/i,
    /\btax roll\b/i,
    /\btax bill\b/i,
    /\btax payment\b/i,
    /\bproperty tax\b/i,
    /\btax records\b/i
  ],
  deed_recorder: [
    /\brecorder\b/i,
    /\bregister of deeds\b/i,
    /\bdeed\b/i,
    /\bland records\b/i,
    /\brecording\b/i,
    /\bcounty clerk\b/i
  ],
  zoning_gis: [
    /\bzoning\b/i,
    /\bland use\b/i,
    /\bplanning\b/i,
    /\bzoning map\b/i,
    /\bland use map\b/i
  ],
  permits: [
    /\bpermit\b/i,
    /\bpermitting\b/i,
    /\bbuilding permit\b/i,
    /\binspection\b/i,
    /\bplan review\b/i,
    /\bconstruction permit\b/i
  ],
  code_enforcement: [
    /\bcode enforcement\b/i,
    /\bcode violation\b/i,
    /\bcode violations\b/i,
    /\bcompliance\b/i,
    /\bnuisance\b/i
  ]
};

const normalizeForMatch = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const isoDateToday = () => new Date().toISOString().slice(0, 10);

const uniqueList = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const domainFromUrl = (value?: string) => {
  if (!value) return "";
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch (_) {
    return "";
  }
};

const PRIMARY_RECORD_PORTAL_TYPES: Record<PrimaryRecordType, OpenDataPortalType[]> = {
  assessor_parcel: ["arcgis", "socrata", "dcat"],
  tax_collector: ["socrata", "dcat"],
  deed_recorder: ["socrata", "dcat", "arcgis"],
  zoning_gis: ["arcgis", "socrata", "dcat"],
  permits: ["socrata", "dcat", "arcgis"],
  code_enforcement: ["socrata", "dcat", "arcgis"]
};

const sourceMatchesRecordType = (source: NormalizedSource, recordType: PrimaryRecordType) => {
  const normalized = normalizeForMatch(`${source.title || ""} ${source.domain || ""} ${source.uri || ""}`);
  return PRIMARY_RECORD_KEYWORDS[recordType].some((pattern) => pattern.test(normalized));
};

const datasetMatchesRecordType = (dataset: DatasetComplianceEntry, recordType: PrimaryRecordType) => {
  const normalized = normalizeForMatch([
    dataset.title || "",
    dataset.datasetId || "",
    dataset.portalType || "",
    dataset.portalUrl || "",
    dataset.dataUrl || "",
    dataset.homepageUrl || ""
  ].join(" "));
  const keywordMatch = PRIMARY_RECORD_KEYWORDS[recordType].some((pattern) => pattern.test(normalized));
  if (keywordMatch) return true;
  const portalType = dataset.portalType || "unknown";
  if (!PRIMARY_RECORD_PORTAL_TYPES[recordType].includes(portalType)) return false;
  if (recordType === "zoning_gis") {
    return /\bfeature server\b|\bgis\b|\blayer\b/.test(normalized);
  }
  if (recordType === "assessor_parcel") {
    return /\bparcel\b|\bapn\b|\bpin\b/.test(normalized);
  }
  if (recordType === "permits") {
    return /\bpermit\b|\binspection\b|\bconstruction\b/.test(normalized);
  }
  if (recordType === "code_enforcement") {
    return /\bcode\b|\bviolation\b|\bcomplaint\b|\b311\b/.test(normalized);
  }
  if (recordType === "tax_collector") {
    return /\btax\b|\btreasurer\b|\bcollector\b/.test(normalized);
  }
  if (recordType === "deed_recorder") {
    return /\bdeed\b|\brecorder\b|\bregister\b|\bclerk\b/.test(normalized);
  }
  return false;
};

const datasetIsAuthoritative = (dataset: DatasetComplianceEntry) => {
  const domain = domainFromUrl(dataset.portalUrl || dataset.dataUrl || dataset.homepageUrl);
  if (domain.endsWith(".gov") || domain.endsWith(".us")) return true;
  const metadataText = normalizeForMatch([
    dataset.title || "",
    dataset.source || "",
    dataset.portalUrl || "",
    dataset.dataUrl || "",
    dataset.homepageUrl || "",
    ...(dataset.accessConstraints || [])
  ].join(" "));
  const officialOrgSignal = /\b(county|city|state|department|municipal|government|assessor|appraiser|treasurer|clerk|recorder|planning|zoning)\b/.test(metadataText);
  const trustedPortalType = dataset.portalType === "arcgis" || dataset.portalType === "socrata" || dataset.portalType === "dcat";
  return trustedPortalType && officialOrgSignal;
};

export const evaluatePrimaryRecordCoverage = (
  sources: NormalizedSource[],
  jurisdiction?: Jurisdiction
): PrimaryRecordCoverage => {
  const sourceUris = sources
    .map((source) => source.uri)
    .filter((uri): uri is string => typeof uri === "string" && uri.trim().length > 0);
  const datasetMatches = buildDatasetComplianceSummary(sourceUris, getOpenDatasetIndex());

  const entries = PRIMARY_RECORD_TYPES.map((recordType) => {
    const availability = getRecordAvailability(recordType, jurisdiction);
    const availabilityStatus = availability?.status ?? "unknown";
    const availabilityDetails = formatAvailabilityDetails(availability);
    if (availabilityStatus === "unavailable") {
      return {
        recordType,
        status: "unavailable",
        availabilityStatus,
        availabilityDetails,
        matchedSources: []
      };
    }

    const matchedSourceUris = sources
      .filter((source) => sourceMatchesRecordType(source, recordType))
      .filter((source) => scoreAuthority(source) >= 60)
      .map((source) => source.uri);
    const matchedDatasetUris = datasetMatches
      .filter((dataset) => datasetMatchesRecordType(dataset, recordType))
      .filter((dataset) => datasetIsAuthoritative(dataset))
      .flatMap((dataset) => [dataset.dataUrl, dataset.homepageUrl, dataset.portalUrl])
      .filter((uri): uri is string => Boolean(uri));
    const matchedSources = uniqueList([...matchedSourceUris, ...matchedDatasetUris]);

    if (matchedSources.length > 0) {
      return {
        recordType,
        status: "covered",
        availabilityStatus,
        availabilityDetails,
        matchedSources
      };
    }

    const status = availabilityStatus === "restricted"
      ? "restricted"
      : availabilityStatus === "partial"
        ? "partial"
        : availabilityStatus === "unknown"
          ? "unknown"
          : "missing";

    return {
      recordType,
      status,
      availabilityStatus,
      availabilityDetails,
      matchedSources: []
    };
  });

  const missing = entries
    .filter((entry) => entry.status !== "covered" && entry.status !== "unavailable")
    .map((entry) => entry.recordType);
  const unavailable = entries
    .filter((entry) => entry.status === "unavailable")
    .map((entry) => entry.recordType);

  return {
    complete: missing.length === 0,
    entries,
    missing,
    unavailable,
    generatedAt: isoDateToday()
  };
};
