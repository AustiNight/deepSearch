import type {
  ComplianceSummary,
  DatasetComplianceEntry,
  NormalizedSource
} from "../types";
import { COMPLIANCE_POLICY } from "../data/compliancePolicy";
import { buildDatasetComplianceSummary } from "./openDataDiscovery";

type DatasetEvaluation = {
  entry: DatasetComplianceEntry;
  action: "allow" | "block" | "review";
  reasons: string[];
};

const isNonEmpty = (value?: string) => typeof value === "string" && value.trim().length > 0;

const normalizeDomain = (value?: string) => {
  if (!value) return "";
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch (_) {
    return value.toLowerCase().replace(/^www\./, "");
  }
};

const normalizeMatchUrl = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "");
    return `${url.protocol.toLowerCase()}//${host}${path}`;
  } catch (_) {
    return value.trim().toLowerCase().replace(/\/+$/, "");
  }
};

const sourceMatchesCandidate = (sourceUrl: string, candidateUrl?: string) => {
  if (!candidateUrl) return false;
  const normalizedSource = normalizeMatchUrl(sourceUrl);
  const normalizedCandidate = normalizeMatchUrl(candidateUrl);
  if (!normalizedSource || !normalizedCandidate) return false;
  return normalizedSource === normalizedCandidate || normalizedSource.startsWith(`${normalizedCandidate}/`);
};

const sourceMatchesDatasetId = (sourceUrl: string, datasetId?: string, portalUrl?: string) => {
  if (!datasetId) return false;
  const needle = datasetId.toLowerCase();
  if (!needle) return false;
  const sourceLower = sourceUrl.toLowerCase();
  if (!sourceLower.includes(needle)) return false;
  if (!portalUrl) return true;
  const sourceDomain = normalizeDomain(sourceUrl);
  const portalDomain = normalizeDomain(portalUrl);
  return sourceDomain === portalDomain;
};

const matchDatasetForSource = (sourceUrl: string, dataset: DatasetComplianceEntry) => {
  if (sourceMatchesCandidate(sourceUrl, dataset.dataUrl)) return true;
  if (sourceMatchesCandidate(sourceUrl, dataset.homepageUrl)) return true;
  if (sourceMatchesDatasetId(sourceUrl, dataset.datasetId, dataset.portalUrl)) return true;
  return false;
};

const matchesAnyPattern = (value: string, patterns: RegExp[]) => {
  return patterns.some((pattern) => pattern.test(value));
};

const collectComplianceText = (entry: DatasetComplianceEntry) => {
  const parts: string[] = [];
  if (isNonEmpty(entry.license)) parts.push(entry.license!.trim());
  if (isNonEmpty(entry.termsOfService)) parts.push(entry.termsOfService!.trim());
  if (Array.isArray(entry.accessConstraints)) {
    entry.accessConstraints.forEach((constraint) => {
      if (isNonEmpty(constraint)) parts.push(constraint.trim());
    });
  }
  return parts.join(" ");
};

const buildAttribution = (entry: DatasetComplianceEntry) => {
  const portalDomain = normalizeDomain(entry.portalUrl || entry.dataUrl || entry.homepageUrl || "");
  const source = entry.source || portalDomain || "Unknown source";
  const title = entry.title || entry.datasetId || "Untitled dataset";
  const base = COMPLIANCE_POLICY.attributionTemplate
    .replace("{source}", source)
    .replace("{title}", title)
    .replace("{portalDomain}", portalDomain || "unknown-portal");
  if (!base.includes("unknown-portal")) return base;
  return COMPLIANCE_POLICY.attributionFallbackTemplate
    .replace("{portalDomain}", portalDomain || "unknown-portal")
    .replace("{title}", title);
};

const evaluateDataset = (entry: DatasetComplianceEntry): DatasetEvaluation => {
  const reasons: string[] = [];
  const text = collectComplianceText(entry);
  if (text && matchesAnyPattern(text, COMPLIANCE_POLICY.blocklist.licensePatterns)) {
    reasons.push("license restriction");
  }
  if (text && matchesAnyPattern(text, COMPLIANCE_POLICY.blocklist.termsPatterns)) {
    reasons.push("terms restriction");
  }
  if (text && matchesAnyPattern(text, COMPLIANCE_POLICY.blocklist.accessConstraintPatterns)) {
    reasons.push("access restriction");
  }

  const action = reasons.length > 0 ? "block" : "allow";
  const attribution = buildAttribution(entry);
  const attributionRequired = COMPLIANCE_POLICY.requireAttributionByDefault;
  const attributionIssues: string[] = [];
  if (attributionRequired && (!attribution || attribution.includes("Unknown source"))) {
    attributionIssues.push("missing attribution fields");
  }

  return {
    entry: {
      ...entry,
      attribution,
      attributionRequired,
      attributionStatus: attributionIssues.length > 0 ? "missing" : "ok",
      complianceAction: action,
      complianceNotes: [...reasons, ...attributionIssues]
    },
    action,
    reasons: [...reasons, ...attributionIssues]
  };
};

const shouldBlockDomain = (domain: string) => {
  if (!domain) return false;
  return COMPLIANCE_POLICY.blockedDomains.some((blocked) => {
    const normalized = blocked.toLowerCase().replace(/^www\./, "");
    return domain === normalized || domain.endsWith(`.${normalized}`);
  });
};

export type ComplianceEnforcementResult = {
  allowedSources: NormalizedSource[];
  blockedSources: Array<{
    uri: string;
    domain: string;
    reason: string;
    datasetTitle?: string;
    datasetId?: string;
  }>;
  datasetCompliance: DatasetComplianceEntry[];
  summary: ComplianceSummary;
};

export const enforceCompliance = (sources: NormalizedSource[]): ComplianceEnforcementResult => {
  const safeSources = Array.isArray(sources) ? sources : [];
  const sourceUris = safeSources.map((source) => source.uri);
  const datasetCompliance = buildDatasetComplianceSummary(sourceUris);
  const datasetEvaluations = datasetCompliance.map((entry) => evaluateDataset(entry));
  const evaluatedEntries = datasetEvaluations.map((evaluation) => evaluation.entry);
  const blockedSources: ComplianceEnforcementResult["blockedSources"] = [];
  const allowedSources: NormalizedSource[] = [];

  for (const source of safeSources) {
    const domain = source.domain || normalizeDomain(source.uri);
    let blockedReason: string | null = null;
    let blockedDataset: DatasetComplianceEntry | null = null;

    if (shouldBlockDomain(domain)) {
      blockedReason = "domain blocked by policy";
    } else {
      for (const evaluation of datasetEvaluations) {
        if (evaluation.action !== "block") continue;
        if (!matchDatasetForSource(source.uri, evaluation.entry)) continue;
        blockedReason = evaluation.reasons[0] || "dataset restricted";
        blockedDataset = evaluation.entry;
        break;
      }
    }

    if (blockedReason) {
      blockedSources.push({
        uri: source.uri,
        domain,
        reason: blockedReason,
        datasetTitle: blockedDataset?.title,
        datasetId: blockedDataset?.datasetId
      });
      if (COMPLIANCE_POLICY.mode !== "enforce") {
        allowedSources.push(source);
      }
    } else {
      allowedSources.push(source);
    }
  }

  const signoffRequired = COMPLIANCE_POLICY.signoff.required;
  const signoffProvided = isNonEmpty(COMPLIANCE_POLICY.signoff.approvedBy) && isNonEmpty(COMPLIANCE_POLICY.signoff.approvedAt);
  const gateStatus = signoffRequired && !signoffProvided ? "signoff_required" : "clear";
  const notes: string[] = [];
  if (gateStatus === "signoff_required") {
    notes.push("Compliance sign-off required before rollout.");
  }

  const summary: ComplianceSummary = {
    mode: COMPLIANCE_POLICY.mode,
    signoffRequired,
    signoffProvided,
    gateStatus,
    blockedSources,
    notes: notes.length > 0 ? notes : undefined
  };

  return {
    allowedSources: COMPLIANCE_POLICY.mode === "enforce" ? allowedSources : safeSources,
    blockedSources,
    datasetCompliance: evaluatedEntries,
    summary
  };
};
