import type {
  ComplianceSummary,
  DatasetComplianceEntry,
  NormalizedSource
} from "../types";
import { buildDatasetComplianceSummary } from "./openDataDiscovery";

const NON_PUBLIC_ACCESS_PATTERNS: RegExp[] = [
  /\bprivate\b/i,
  /\brestricted\b/i,
  /\bnon[-\s]?public\b/i,
  /\binternal\b/i,
  /\bconfidential\b/i,
  /\blogin\s+required\b/i,
  /\baccount\s+required\b/i,
  /\bauth(?:entication|orization)?\s+required\b/i,
  /\bpermission\s+required\b/i,
  /\bpayment\s+required\b/i,
  /\bpaid\s+access\s+required\b/i,
  /\bpaid\s+subscription\s+required\b/i,
  /\bsubscription\s+required\b/i,
  /\bpaywall\b/i,
  /\bpurchase\s+required\b/i,
  /\bfee(s)?\s+required\b/i,
  /\bcommercial\s+license\s+required\b/i
];

const normalizeDomain = (value?: string) => {
  if (!value) return "";
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch (_) {
    return value.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
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
  return normalizeDomain(sourceUrl) === normalizeDomain(portalUrl);
};

const matchDatasetForSource = (sourceUrl: string, dataset: DatasetComplianceEntry) => {
  if (sourceMatchesCandidate(sourceUrl, dataset.dataUrl)) return true;
  if (sourceMatchesCandidate(sourceUrl, dataset.homepageUrl)) return true;
  if (sourceMatchesDatasetId(sourceUrl, dataset.datasetId, dataset.portalUrl)) return true;
  return false;
};

const matchesAnyPattern = (value: string, patterns: RegExp[]) => patterns.some((pattern) => pattern.test(value));

const collectComplianceText = (entry: DatasetComplianceEntry) => {
  const parts: string[] = [];
  if (entry.license) parts.push(entry.license);
  if (entry.termsOfService) parts.push(entry.termsOfService);
  if (Array.isArray(entry.accessConstraints)) {
    entry.accessConstraints.forEach((constraint) => {
      if (constraint) parts.push(constraint);
    });
  }
  return parts.join(" ");
};

type DatasetEvaluation = {
  entry: DatasetComplianceEntry;
  action: "allow" | "block";
  reasons: string[];
};

const evaluateDataset = (entry: DatasetComplianceEntry): DatasetEvaluation => {
  const text = collectComplianceText(entry);
  const blocked = Boolean(text && matchesAnyPattern(text, NON_PUBLIC_ACCESS_PATTERNS));
  const reason = blocked ? "dataset appears non-public or access-restricted" : undefined;
  return {
    entry: {
      ...entry,
      complianceAction: blocked ? "block" : "allow",
      complianceNotes: reason ? [reason] : undefined,
      attribution: entry.attribution || entry.source || entry.portalUrl,
      attributionRequired: false,
      attributionStatus: "ok"
    },
    action: blocked ? "block" : "allow",
    reasons: reason ? [reason] : []
  };
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
  const datasetComplianceEntries = buildDatasetComplianceSummary(sourceUris);
  const datasetEvaluations = datasetComplianceEntries.map((entry) => evaluateDataset(entry));
  const datasetCompliance = datasetEvaluations.map((evaluation) => evaluation.entry);
  const blockedSources: ComplianceEnforcementResult["blockedSources"] = [];
  const allowedSources: NormalizedSource[] = [];

  for (const source of safeSources) {
    let blockedReason: string | null = null;
    let blockedDataset: DatasetComplianceEntry | null = null;
    for (const evaluation of datasetEvaluations) {
      if (evaluation.action !== "block") continue;
      if (!matchDatasetForSource(source.uri, evaluation.entry)) continue;
      blockedReason = evaluation.reasons[0] || "dataset access restricted";
      blockedDataset = evaluation.entry;
      break;
    }
    if (blockedReason) {
      blockedSources.push({
        uri: source.uri,
        domain: source.domain || normalizeDomain(source.uri),
        reason: blockedReason,
        datasetTitle: blockedDataset?.title,
        datasetId: blockedDataset?.datasetId
      });
      continue;
    }
    allowedSources.push(source);
  }

  const summary: ComplianceSummary = {
    mode: "enforce",
    signoffRequired: false,
    signoffProvided: true,
    gateStatus: "clear",
    blockedSources,
    zeroCostMode: false,
    reviewRequired: false
  };

  return {
    allowedSources,
    blockedSources,
    datasetCompliance,
    summary
  };
};
