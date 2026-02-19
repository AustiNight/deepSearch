import type { OpenDatasetMetadata } from "../types";
import { COMPLIANCE_POLICY } from "../data/compliancePolicy";
import { getOpenDataConfig } from "./openDataConfig";

const RECORD_TYPE_MAX_AGE_DAYS: Record<string, number> = {
  assessor_parcel: 730,
  tax_appraisal: 730,
  tax_collector: 540,
  deed_recorder: 36500,
  zoning_gis: 1095,
  permits: 1825,
  code_enforcement: 1095,
  hazards_environmental: 1825,
  neighborhood_context: 3650
};

const normalizeText = (value?: string) => (value || "").toLowerCase();

const matchesAnyPattern = (value: string, patterns: RegExp[]) => patterns.some((pattern) => pattern.test(value));

const collectComplianceText = (dataset: OpenDatasetMetadata) => {
  const parts: string[] = [];
  if (dataset.license) parts.push(dataset.license);
  if (dataset.termsOfService) parts.push(dataset.termsOfService);
  if (Array.isArray(dataset.accessConstraints)) {
    dataset.accessConstraints.forEach((constraint) => {
      if (constraint) parts.push(constraint);
    });
  }
  return parts.join(" ");
};

const inferRecordType = (dataset: OpenDatasetMetadata) => {
  const haystack = normalizeText(`${dataset.title} ${dataset.description} ${(dataset.tags || []).join(" ")}`);
  if (/(parcel|assessor|appraiser|cad|apn)/i.test(haystack)) return "assessor_parcel";
  if (/(tax roll|tax bill|tax collector|treasurer)/i.test(haystack)) return "tax_collector";
  if (/(deed|recorder|clerk|register)/i.test(haystack)) return "deed_recorder";
  if (/(zoning|land use|planning)/i.test(haystack)) return "zoning_gis";
  if (/(permit|inspection|construction)/i.test(haystack)) return "permits";
  if (/(code enforcement|violation)/i.test(haystack)) return "code_enforcement";
  if (/(hazard|environment|flood|seismic)/i.test(haystack)) return "hazards_environmental";
  if (/(census|neighborhood|district|community)/i.test(haystack)) return "neighborhood_context";
  return undefined;
};

const computeAgeDays = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const ageDays = Math.max(0, (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));
  return ageDays;
};

export const evaluateDatasetUsage = (dataset: OpenDatasetMetadata) => {
  const config = getOpenDataConfig();
  const complianceText = normalizeText(collectComplianceText(dataset));
  const notes: string[] = [];
  let complianceAction: "allow" | "block" | "review" = "allow";

  if (complianceText && matchesAnyPattern(complianceText, COMPLIANCE_POLICY.blocklist.licensePatterns)) {
    complianceAction = "block";
    notes.push("license restriction");
  }
  if (complianceText && matchesAnyPattern(complianceText, COMPLIANCE_POLICY.blocklist.termsPatterns)) {
    complianceAction = "block";
    notes.push("terms restriction");
  }
  if (complianceText && matchesAnyPattern(complianceText, COMPLIANCE_POLICY.blocklist.accessConstraintPatterns)) {
    complianceAction = "block";
    notes.push("access restriction");
  }

  if (complianceAction === "allow" && config.zeroCostMode) {
    if (COMPLIANCE_POLICY.review.requireLicense && !dataset.license && !dataset.licenseUrl) {
      complianceAction = "review";
      notes.push("missing license metadata");
    }
    if (COMPLIANCE_POLICY.review.requireTerms && !dataset.termsOfService && !dataset.termsUrl) {
      complianceAction = "review";
      notes.push("missing terms metadata");
    }
    if (complianceText && matchesAnyPattern(complianceText, COMPLIANCE_POLICY.review.costPatterns)) {
      complianceAction = "review";
      notes.push("possible paid access");
    }
  }

  const recordType = inferRecordType(dataset);
  const maxAgeDays = recordType ? RECORD_TYPE_MAX_AGE_DAYS[recordType] : undefined;
  const ageDays = dataset.lastUpdated
    ? computeAgeDays(dataset.lastUpdated)
    : dataset.retrievedAt
      ? computeAgeDays(dataset.retrievedAt)
      : null;

  let freshnessStatus: "fresh" | "stale" | "unknown" = "unknown";
  let staleReason: string | undefined;
  if (typeof ageDays === "number") {
    if (maxAgeDays && ageDays > maxAgeDays) {
      freshnessStatus = "stale";
      staleReason = `last updated ${dataset.lastUpdated || dataset.retrievedAt}`;
    } else {
      freshnessStatus = "fresh";
    }
  }

  const doNotUse = config.featureFlags.gatingEnforcement
    ? complianceAction === "block"
      || (config.zeroCostMode && complianceAction === "review" && !config.allowPaidAccess)
      || (freshnessStatus === "stale" && !config.allowPaidAccess)
    : false;

  return {
    ...dataset,
    complianceAction,
    complianceNotes: notes.length > 0 ? notes : undefined,
    doNotUse,
    freshnessStatus,
    staleReason,
    lastCheckedAt: new Date().toISOString()
  };
};

export const applyDatasetUsageGates = (datasets: OpenDatasetMetadata[]) => {
  return datasets.map((dataset) => evaluateDatasetUsage(dataset));
};
