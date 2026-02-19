import type { Jurisdiction, NormalizedSource, PrimaryRecordCoverage } from "../types";
import { PRIMARY_RECORD_TYPES, type PrimaryRecordType } from "../data/jurisdictionAvailability";
import { formatAvailabilityDetails, getRecordAvailability } from "./jurisdictionAvailability";
import { scoreAuthority } from "./evidenceGating";

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

const sourceMatchesRecordType = (source: NormalizedSource, recordType: PrimaryRecordType) => {
  const normalized = normalizeForMatch(`${source.title || ""} ${source.domain || ""} ${source.uri || ""}`);
  return PRIMARY_RECORD_KEYWORDS[recordType].some((pattern) => pattern.test(normalized));
};

export const evaluatePrimaryRecordCoverage = (
  sources: NormalizedSource[],
  jurisdiction?: Jurisdiction
): PrimaryRecordCoverage => {
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

    const matchedSources = sources
      .filter((source) => sourceMatchesRecordType(source, recordType))
      .filter((source) => scoreAuthority(source) >= 60)
      .map((source) => source.uri);

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
