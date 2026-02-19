import type { NormalizedSource, SourceTaxonomy } from "../types";
import {
  MIN_EVIDENCE_TOTAL_SOURCES,
  MIN_EVIDENCE_AUTHORITATIVE_SOURCES,
  MIN_EVIDENCE_AUTHORITY_SCORE
} from "../constants";

const AGGREGATOR_DOMAINS = new Set([
  "zillow.com",
  "redfin.com",
  "realtor.com",
  "trulia.com",
  "loopnet.com",
  "propertyshark.com",
  "homes.com",
  "apartments.com"
]);

const SOCIAL_DOMAINS = new Set([
  "facebook.com",
  "twitter.com",
  "x.com",
  "reddit.com",
  "instagram.com",
  "tiktok.com",
  "linkedin.com"
]);

const PRIMARY_RECORD_PATTERN = /assessor|appraiser|appraisal|cad|property|parcel|tax|treasurer|recorder|clerk|register|gis|zoning|planning|permit|code\s*enforcement|deed/i;
const OPEN_DATA_PATTERN = /opendata|open-data|data\.|socrata|arcgis|esri|gis|catalog|dataset|hub/i;
const AGGREGATOR_PATTERN = /zillow|redfin|realtor|trulia|loopnet|propertyshark|homes\.com|apartments\.com|corelogic|realtytrac|attom/i;
const SOCIAL_PATTERN = /facebook|twitter|x\.com|reddit|instagram|tiktok|linkedin|nextdoor/i;
const GOVERNMENT_DOMAIN_PATTERN = /(\.gov$|\.gov\.|\.mil$|\.mil\.)/i;

const SOURCE_TYPE_BASE_SCORES: Record<SourceTaxonomy, number> = {
  authoritative: 90,
  quasi_official: 70,
  aggregator: 50,
  social: 20,
  unknown: 35
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const classifySourceType = (source: NormalizedSource): SourceTaxonomy => {
  const domain = (source.domain || "").toLowerCase();
  const text = `${domain} ${source.title || ""} ${source.uri || ""}`.toLowerCase();

  if (SOCIAL_DOMAINS.has(domain) || SOCIAL_PATTERN.test(text)) return "social";
  if (AGGREGATOR_DOMAINS.has(domain) || AGGREGATOR_PATTERN.test(text)) return "aggregator";

  const isGovDomain = GOVERNMENT_DOMAIN_PATTERN.test(domain);
  const hasRecordKeywords = PRIMARY_RECORD_PATTERN.test(text);
  const isOpenDataPortal = OPEN_DATA_PATTERN.test(text);

  if (isGovDomain && hasRecordKeywords) return "authoritative";
  if (isGovDomain) return "quasi_official";
  if (isOpenDataPortal) return "quasi_official";

  return "unknown";
};

export const scoreAuthority = (source: NormalizedSource) => {
  const domain = (source.domain || "").toLowerCase();
  const text = `${domain} ${source.title || ""} ${source.uri || ""}`.toLowerCase();
  const sourceType = classifySourceType(source);
  let score = SOURCE_TYPE_BASE_SCORES[sourceType];

  const isGovDomain = GOVERNMENT_DOMAIN_PATTERN.test(domain) || domain.endsWith(".us");
  if (isGovDomain) score += 5;

  if (PRIMARY_RECORD_PATTERN.test(text)) score += 5;

  if (/(parcel|account|permit|record|case|roll|parcelid|accountid|permitid)/i.test(source.uri || "")) {
    score += 5;
  }

  if (sourceType === "aggregator") score -= 10;
  if (sourceType === "social") score -= 15;
  if (!source.title || source.title.trim().length === 0 || source.title === source.domain) score -= 5;

  return clamp(score, 0, 100);
};

export const evaluateEvidence = (sources: NormalizedSource[]) => {
  const uniqueSources = Array.from(new Map(sources.map((source) => [source.uri, source])).values());
  let authoritativeSources = 0;
  let maxAuthorityScore = 0;
  uniqueSources.forEach((source) => {
    const score = scoreAuthority(source);
    if (score >= 60) authoritativeSources += 1;
    if (score > maxAuthorityScore) maxAuthorityScore = score;
  });
  const totalSources = uniqueSources.length;
  const meetsTotal = totalSources >= MIN_EVIDENCE_TOTAL_SOURCES;
  const meetsAuthoritative = authoritativeSources >= MIN_EVIDENCE_AUTHORITATIVE_SOURCES;
  const meetsAuthorityScore = maxAuthorityScore >= MIN_EVIDENCE_AUTHORITY_SCORE;
  return {
    totalSources,
    authoritativeSources,
    maxAuthorityScore,
    meetsTotal,
    meetsAuthoritative,
    meetsAuthorityScore,
    meetsAll: meetsTotal && meetsAuthoritative && meetsAuthorityScore
  };
};

export const buildEvidenceGateReasons = (status: ReturnType<typeof evaluateEvidence>) => {
  const reasons: string[] = [];
  if (!status.meetsTotal) {
    reasons.push(`total_sources_below_min (${status.totalSources}/${MIN_EVIDENCE_TOTAL_SOURCES})`);
  }
  if (!status.meetsAuthoritative) {
    reasons.push(
      `authoritative_sources_below_min (${status.authoritativeSources}/${MIN_EVIDENCE_AUTHORITATIVE_SOURCES})`
    );
  }
  if (!status.meetsAuthorityScore) {
    reasons.push(`authority_score_below_min (${status.maxAuthorityScore}/${MIN_EVIDENCE_AUTHORITY_SCORE})`);
  }
  return reasons;
};
