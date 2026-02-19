import { useState, useCallback, useRef, useEffect } from 'react';
import { Agent, AgentStatus, AgentType, LogEntry, FinalReport, Finding, Skill, LLMProvider, ExhaustionMetrics, ModelOverrides, NormalizedSource, PrimaryRecordCoverage, Jurisdiction } from '../types';
import { initializeGemini, generateSectorAnalysis as generateSectorAnalysisGemini, performDeepResearch as performDeepResearchGemini, critiqueAndFindGaps as critiqueAndFindGapsGemini, synthesizeGrandReport as synthesizeGrandReportGemini, extractResearchMethods as extractResearchMethodsGemini, validateReport as validateReportGemini, proposeTaxonomyGrowth as proposeTaxonomyGrowthGemini, classifyResearchVertical as classifyResearchVerticalGemini } from '../services/geminiService';
import { initializeOpenAI, generateSectorAnalysis as generateSectorAnalysisOpenAI, performDeepResearch as performDeepResearchOpenAI, critiqueAndFindGaps as critiqueAndFindGapsOpenAI, synthesizeGrandReport as synthesizeGrandReportOpenAI, extractResearchMethods as extractResearchMethodsOpenAI, validateReport as validateReportOpenAI, proposeTaxonomyGrowth as proposeTaxonomyGrowthOpenAI, classifyResearchVertical as classifyResearchVerticalOpenAI } from '../services/openaiService';
import { buildReportFromRawText, coerceReportData, looksLikeJsonText } from '../services/reportFormatter';
import {
  INITIAL_OVERSEER_ID,
  METHOD_TEMPLATES_GENERAL,
  METHOD_TEMPLATES_ADDRESS,
  METHOD_DISCOVERY_TEMPLATES_GENERAL,
  METHOD_DISCOVERY_TEMPLATES_PERSON,
  METHOD_DISCOVERY_TEMPLATES_ADDRESS,
  SYSTEM_TEST_PHRASE,
  SYSTEM_TEST_VERTICAL_ID,
  MIN_AGENT_COUNT,
  MAX_AGENT_COUNT,
  MAX_METHOD_AGENTS,
  MIN_SEARCH_ROUNDS,
  MAX_SEARCH_ROUNDS,
  EARLY_STOP_DIMINISHING_SCORE,
  EARLY_STOP_NOVELTY_RATIO,
  EARLY_STOP_NEW_DOMAINS,
  EARLY_STOP_NEW_SOURCES,
  MIN_EVIDENCE_TOTAL_SOURCES,
  MIN_EVIDENCE_AUTHORITATIVE_SOURCES,
  MIN_EVIDENCE_AUTHORITY_SCORE
} from '../constants';
import { getResearchTaxonomy, summarizeTaxonomy, vetAndPersistTaxonomyProposals, listTacticsForVertical, expandTacticTemplates } from '../data/researchTaxonomy';
import { inferVerticalHints, isAddressLike, isSystemTestTopic, VERTICAL_SEED_QUERIES } from '../data/verticalLogic';
import { normalizeAddressVariants } from '../services/addressNormalization';
import { PRIMARY_RECORD_TYPES, type PrimaryRecordType } from '../data/jurisdictionAvailability';
import { formatAvailabilityDetails, getRecordAvailability } from '../services/jurisdictionAvailability';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

const normalizeDomain = (url: string) => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.startsWith('www.') ? host.slice(4) : host;
  } catch (_) {
    return '';
  }
};

const EVIDENCE_RECOVERY_CACHE_KEY = 'overseer_evidence_recovery_cache_v1';
const EVIDENCE_RECOVERY_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const EVIDENCE_RECOVERY_MAX_ATTEMPTS = 3;
const EVIDENCE_RECOVERY_BASE_DELAY_MS = 700;
const EVIDENCE_RECOVERY_MAX_QUERIES = 6;
const EVIDENCE_RECOVERY_TOTAL_TIME_BUDGET_MS = 1000 * 45;
const EVIDENCE_RECOVERY_PRIORITY_SCORE_MIN = 4;
const EVIDENCE_RECOVERY_MAX_FALLBACK_QUERIES = 2;
const EVIDENCE_RECOVERY_MAX_CACHE_ENTRIES = 200;
const EVIDENCE_RECOVERY_MAX_TEXT_CHARS = 12000;

type EvidenceRecoveryCacheEntry = {
  text: string;
  sources: NormalizedSource[];
  timestamp: number;
};

type EvidenceRecoveryCache = Record<string, EvidenceRecoveryCacheEntry>;

type EvidenceRecoveryErrorCode =
  | 'threshold_unmet'
  | 'recovery_failed'
  | 'recovery_exhausted'
  | 'recovery_timeout';

const EVIDENCE_RECOVERY_ERROR_TAXONOMY: Record<EvidenceRecoveryErrorCode, { severity: 'info' | 'warning' | 'error'; summary: string }> = {
  threshold_unmet: {
    severity: 'warning',
    summary: 'Evidence thresholds not met for address-like topic.'
  },
  recovery_failed: {
    severity: 'warning',
    summary: 'Evidence recovery search failed to return sources.'
  },
  recovery_exhausted: {
    severity: 'error',
    summary: 'Evidence recovery exhausted and thresholds remain unmet.'
  },
  recovery_timeout: {
    severity: 'warning',
    summary: 'Evidence recovery timed out or was interrupted.'
  }
};

const loadEvidenceRecoveryCache = (): EvidenceRecoveryCache => {
  try {
    const stored = localStorage.getItem(EVIDENCE_RECOVERY_CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') return parsed as EvidenceRecoveryCache;
    }
  } catch (_) {
    // ignore cache failures
  }
  return {};
};

const saveEvidenceRecoveryCache = (cache: EvidenceRecoveryCache) => {
  try {
    localStorage.setItem(EVIDENCE_RECOVERY_CACHE_KEY, JSON.stringify(cache));
  } catch (_) {
    // ignore cache failures
  }
};

const pruneEvidenceRecoveryCache = (cache: EvidenceRecoveryCache) => {
  const now = Date.now();
  const entries = Object.entries(cache)
    .filter(([_, entry]) => entry && typeof entry.timestamp === 'number' && now - entry.timestamp <= EVIDENCE_RECOVERY_CACHE_TTL_MS)
    .sort((a, b) => b[1].timestamp - a[1].timestamp)
    .slice(0, EVIDENCE_RECOVERY_MAX_CACHE_ENTRIES);
  return Object.fromEntries(entries);
};

const buildEvidenceRecoveryCacheKey = (provider: LLMProvider, topic: string, query: string) => {
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizedTopic = topic.toLowerCase().replace(/\s+/g, ' ').trim();
  return `${provider}:${normalizedTopic}:${normalizedQuery}`;
};

const uniqueList = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const createAbortError = (reason: string) => {
  const error = new Error(reason);
  (error as any).name = 'AbortError';
  return error;
};

const wait = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  if (!signal) {
    setTimeout(() => resolve(), ms);
    return;
  }
  if (signal.aborted) {
    reject(createAbortError('Run aborted'));
    return;
  }
  const timeout = setTimeout(() => {
    cleanup();
    resolve();
  }, ms);
  const onAbort = () => {
    clearTimeout(timeout);
    cleanup();
    reject(createAbortError('Run aborted'));
  };
  const cleanup = () => {
    signal.removeEventListener('abort', onAbort);
  };
  signal.addEventListener('abort', onAbort, { once: true });
});

const normalizeForMatch = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const AGGREGATOR_DOMAINS = new Set([
  'zillow.com',
  'redfin.com',
  'realtor.com',
  'trulia.com',
  'loopnet.com',
  'propertyshark.com',
  'homes.com',
  'apartments.com'
]);

const SOCIAL_DOMAINS = new Set([
  'facebook.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'instagram.com',
  'tiktok.com',
  'linkedin.com'
]);

const scoreAuthority = (source: NormalizedSource) => {
  const domain = (source.domain || '').toLowerCase();
  const title = (source.title || '').toLowerCase();
  let score = 20;

  if (domain.endsWith('.gov') || domain.includes('.gov.')) score += 60;
  if (domain.endsWith('.mil') || domain.includes('.mil.')) score += 60;
  if (domain.endsWith('.us')) score += 30;

  if (/assessor|appraiser|appraisal|cad|property|parcel|tax|treasurer|recorder|clerk|register|gis|zoning|planning|permit|code\s*enforcement|deed/.test(domain)) {
    score += 20;
  }
  if (/assessor|appraiser|parcel|property|tax|treasurer|recorder|clerk|gis|zoning|permit|deed/.test(title)) {
    score += 10;
  }
  if (/arcgis|opendata|socrata|data\.city|data\.county/.test(domain)) {
    score += 10;
  }

  if (AGGREGATOR_DOMAINS.has(domain) || /zillow|redfin|realtor|trulia|loopnet|propertyshark/.test(domain)) {
    score -= 25;
  }
  if (SOCIAL_DOMAINS.has(domain) || /facebook|twitter|reddit|instagram|tiktok|linkedin/.test(domain)) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
};

const evaluateEvidence = (sources: NormalizedSource[]) => {
  const uniqueSources = Array.from(new Map(sources.map(source => [source.uri, source])).values());
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

const PRIMARY_RECORD_KEYWORDS: Record<PrimaryRecordType, RegExp[]> = {
  assessor_parcel: [
    /\bassessor\b/i,
    /\bappraiser\b/i,
    /\bappraisal\b/i,
    /\bappraisal district\b/i,
    /\bcentral appraisal district\b/i,
    /\bparcel\b/i,
    /\bproperty card\b/i,
    /\bproperty search\b/i
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

const isoDateToday = () => new Date().toISOString().slice(0, 10);

const getSlotValue = (slots: Record<string, unknown>, key: string) =>
  Array.isArray(slots[key]) ? String(slots[key]?.[0] || '').trim() : '';

const buildJurisdictionFromSlots = (slots: Record<string, unknown>, addressLike: boolean): Jurisdiction | undefined => {
  if (!addressLike) return undefined;
  const state = getSlotValue(slots, 'state');
  const county = getSlotValue(slots, 'countyPrimary') || getSlotValue(slots, 'county');
  const city = getSlotValue(slots, 'city');
  const hasAny = Boolean(state || county || city);
  return hasAny
    ? {
        country: 'US',
        state: state || undefined,
        county: county || undefined,
        city: city || undefined
      }
    : { country: 'US' };
};

const sourceMatchesRecordType = (source: NormalizedSource, recordType: PrimaryRecordType) => {
  const normalized = normalizeForMatch(`${source.title || ''} ${source.domain || ''} ${source.uri || ''}`);
  return PRIMARY_RECORD_KEYWORDS[recordType].some(pattern => pattern.test(normalized));
};

const evaluatePrimaryRecordCoverage = (
  sources: NormalizedSource[],
  jurisdiction?: Jurisdiction
): PrimaryRecordCoverage => {
  const entries = PRIMARY_RECORD_TYPES.map((recordType) => {
    const availability = getRecordAvailability(recordType, jurisdiction);
    const availabilityStatus = availability?.status ?? 'unknown';
    const availabilityDetails = formatAvailabilityDetails(availability);
    if (availabilityStatus === 'unavailable') {
      return {
        recordType,
        status: 'unavailable',
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
        status: 'covered',
        availabilityStatus,
        availabilityDetails,
        matchedSources
      };
    }

    const status = availabilityStatus === 'restricted'
      ? 'restricted'
      : availabilityStatus === 'partial'
        ? 'partial'
        : availabilityStatus === 'unknown'
          ? 'unknown'
          : 'missing';

    return {
      recordType,
      status,
      availabilityStatus,
      availabilityDetails,
      matchedSources: []
    };
  });

  const missing = entries
    .filter(entry => entry.status !== 'covered' && entry.status !== 'unavailable')
    .map(entry => entry.recordType);
  const unavailable = entries
    .filter(entry => entry.status === 'unavailable')
    .map(entry => entry.recordType);

  return {
    complete: missing.length === 0,
    entries,
    missing,
    unavailable,
    generatedAt: isoDateToday()
  };
};

const buildEvidenceRecoveryQueries = (slots: Record<string, unknown>, addressDirectQueries: string[]) => {
  const addresses = Array.isArray(slots.address)
    ? slots.address.map(value => String(value || '').trim()).filter(Boolean)
    : [];
  const address = addresses[0] || '';
  const addressQuoted = address ? `"${address}"` : '';
  const city = Array.isArray(slots.city) ? String(slots.city[0] || '').trim() : '';
  const county = Array.isArray(slots.countyPrimary) ? String(slots.countyPrimary[0] || '').trim() : '';
  const state = Array.isArray(slots.state) ? String(slots.state[0] || '').trim() : '';
  const authorityPrimary = Array.isArray(slots.propertyAuthorityPrimary) ? String(slots.propertyAuthorityPrimary[0] || '').trim() : '';
  const authoritySecondary = Array.isArray(slots.propertyAuthoritySecondary) ? String(slots.propertyAuthoritySecondary[0] || '').trim() : '';

  const baseQueries = [
    `${county} ${authorityPrimary} parcel search`,
    `${county} ${authorityPrimary} property search`,
    `${county} assessor property card`,
    `${county} tax assessor parcel`,
    `${county} tax collector property`,
    `${county} recorder deed search`,
    `${county} GIS parcel map`,
    `${county} zoning GIS`,
    `${addressQuoted} ${authorityPrimary}`.trim(),
    `${addressQuoted} assessor`.trim(),
    `${addressQuoted} "property appraiser"`.trim(),
    `${addressQuoted} GIS parcel`.trim(),
    `${addressQuoted} parcel map site:.gov`.trim(),
    `${addressQuoted} property card site:.gov`.trim(),
    `${city ? `"${city}"` : ''} ${authoritySecondary} ${address}`.trim(),
    `${addressQuoted} ${city ? `"${city}"` : ''} ${state}`.trim()
  ].filter(Boolean);

  return uniqueList([...baseQueries, ...addressDirectQueries]);
};

const scoreEvidenceRecoveryQuery = (query: string) => {
  const lower = query.toLowerCase();
  let score = 0;
  if (lower.includes('assessor') || lower.includes('appraiser') || lower.includes('appraisal district')) score += 3;
  if (lower.includes('parcel') || lower.includes('property card')) score += 3;
  if (lower.includes('gis')) score += 3;
  if (lower.includes('tax') || lower.includes('collector')) score += 2;
  if (lower.includes('recorder') || lower.includes('clerk') || lower.includes('deed')) score += 2;
  if (lower.includes('zoning') || lower.includes('permit')) score += 1;
  if (lower.includes('site:.gov') || lower.includes('site:.us')) score += 2;
  return score;
};

const STATE_NAME_TO_CODE: Record<string, string> = {
  'alabama': 'AL',
  'alaska': 'AK',
  'arizona': 'AZ',
  'arkansas': 'AR',
  'california': 'CA',
  'colorado': 'CO',
  'connecticut': 'CT',
  'delaware': 'DE',
  'florida': 'FL',
  'georgia': 'GA',
  'hawaii': 'HI',
  'idaho': 'ID',
  'illinois': 'IL',
  'indiana': 'IN',
  'iowa': 'IA',
  'kansas': 'KS',
  'kentucky': 'KY',
  'louisiana': 'LA',
  'maine': 'ME',
  'maryland': 'MD',
  'massachusetts': 'MA',
  'michigan': 'MI',
  'minnesota': 'MN',
  'mississippi': 'MS',
  'missouri': 'MO',
  'montana': 'MT',
  'nebraska': 'NE',
  'nevada': 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  'ohio': 'OH',
  'oklahoma': 'OK',
  'oregon': 'OR',
  'pennsylvania': 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  'tennessee': 'TN',
  'texas': 'TX',
  'utah': 'UT',
  'vermont': 'VT',
  'virginia': 'VA',
  'washington': 'WA',
  'west virginia': 'WV',
  'wisconsin': 'WI',
  'wyoming': 'WY',
  'district of columbia': 'DC'
};

const STATE_NAME_REGEX = new RegExp(
  `\\b(${Object.keys(STATE_NAME_TO_CODE).sort((a, b) => b.length - a.length).map((name) => name.replace(/\\s+/g, '\\\\s+')).join('|')})\\b`,
  'i'
);

const normalizeStateCode = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length === 2 && /^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();
  const mapped = STATE_NAME_TO_CODE[trimmed.toLowerCase()];
  return mapped || '';
};

const extractLocationHint = (topic: string) => {
  const match = topic.match(/\\b(?:of|in|from|near|around|outside|outside of)\\s+([^,]+(?:,\\s*[^,]+)?)$/i);
  return match ? match[1].trim() : topic.trim();
};

const parseCityState = (value: string): { city: string; state: string } => {
  const cleaned = value.replace(/\\s+/g, ' ').trim();
  if (!cleaned) return { city: '', state: '' };

  const commaParts = cleaned.split(',').map(p => p.trim()).filter(Boolean);
  if (commaParts.length >= 2) {
    const stateCandidate = normalizeStateCode(commaParts[commaParts.length - 1]);
    if (stateCandidate) {
      return { city: commaParts.slice(0, -1).join(', '), state: stateCandidate };
    }
  }

  const abbrMatch = cleaned.match(/^(.*)\\s+([A-Za-z]{2})$/);
  if (abbrMatch) {
    const stateCandidate = normalizeStateCode(abbrMatch[2]);
    if (stateCandidate) {
      return { city: abbrMatch[1].trim(), state: stateCandidate };
    }
  }

  const nameMatch = cleaned.match(new RegExp(`^(.*)\\s+${STATE_NAME_REGEX.source}$`, 'i'));
  if (nameMatch) {
    const stateCandidate = normalizeStateCode(nameMatch[2]);
    if (stateCandidate) {
      return { city: nameMatch[1].trim(), state: stateCandidate };
    }
  }

  return { city: '', state: '' };
};

const extractCityStateFromTopic = (topic: string) => {
  const hint = extractLocationHint(topic);
  const parsedHint = parseCityState(hint);
  if (parsedHint.city || parsedHint.state) return parsedHint;
  return parseCityState(topic);
};

const collectFindingsText = (findings: Array<{ content?: string }>) => {
  const combined = findings.map(f => f.content || '').join(' ');
  return normalizeForMatch(combined);
};

const extractSourceDomainsFromFindings = (findings: Array<{ rawSources?: any[] }>) => {
  const domains: string[] = [];
  findings.forEach((finding: any) => {
    const sources = Array.isArray(finding?.rawSources) ? finding.rawSources : [];
    sources.forEach((source: any) => {
      const uri = typeof source === 'string' ? source : source?.uri;
      const domain = normalizeDomain(uri || '');
      if (domain) domains.push(domain);
    });
  });
  return uniqueList(domains);
};

const countNameVariantsUsed = (usedQueries: Set<string>, nameVariants: string[]) => {
  const normalizedQueries = Array.from(usedQueries).map(normalizeForMatch);
  const normalizedVariants = uniqueList(nameVariants.map(normalizeForMatch)).filter(Boolean);
  let matched = 0;
  normalizedVariants.forEach(variant => {
    if (normalizedQueries.some(query => query.includes(variant))) {
      matched += 1;
    }
  });
  return matched;
};

const evaluateVerticalExhaustion = (context: {
  topic: string;
  selectedVerticalIds: string[];
  nameVariants: string[];
  usedQueries: Set<string>;
  findings: Array<{ content?: string; rawSources?: any[] }>;
  addressLike: boolean;
  companyDomainHint?: string;
  brandDomainHint?: string;
}) => {
  const reasons: string[] = [];
  if (context.selectedVerticalIds.length === 0) {
    return { blockEarlyStop: false, reasons };
  }

  const findingsText = collectFindingsText(context.findings);
  const sourceDomains = extractSourceDomainsFromFindings(context.findings);
  const hasKeyword = (keywords: string[]) => keywords.some(keyword => findingsText.includes(keyword));
  const hasDomain = (domain?: string) => {
    if (!domain) return false;
    const normalized = normalizeDomain(domain);
    return sourceDomains.some(d => d === normalized || d.endsWith(`.${normalized}`));
  };

  if (context.selectedVerticalIds.includes('individual')) {
    const employmentKeywords = [
      'employed',
      'employment',
      'works at',
      'worked at',
      'working at',
      'job title',
      'occupation',
      'position',
      'ceo',
      'founder',
      'president',
      'director',
      'manager',
      'engineer',
      'consultant',
      'attorney',
      'professor',
      'teacher',
      'nurse',
      'doctor',
      'researcher',
      'analyst'
    ];
    const employmentFound = hasKeyword(employmentKeywords);
    const variantTarget = context.nameVariants.length === 0 ? 0 : Math.min(5, context.nameVariants.length);
    const variantsUsed = countNameVariantsUsed(context.usedQueries, context.nameVariants);
    if (!employmentFound && variantTarget > 0 && variantsUsed < variantTarget) {
      reasons.push(`Individual: employment not found; ${variantsUsed}/${variantTarget} name variants attempted.`);
    } else if (!employmentFound && variantTarget === 0) {
      reasons.push('Individual: employment signal not found.');
    }
  }

  if (context.selectedVerticalIds.includes('corporation')) {
    const corpKeywords = [
      'headquarters',
      'founded',
      'incorporated',
      'revenue',
      'funding',
      'subsidiary',
      'executive team',
      'ceo',
      'cfo',
      'annual report',
      '10-k',
      'ownership',
      'acquired'
    ];
    const domainHit = hasDomain(context.companyDomainHint);
    if (!domainHit && !hasKeyword(corpKeywords)) {
      reasons.push('Corporation: missing leadership/financials/ownership signals.');
    }
  }

  if (context.selectedVerticalIds.includes('product')) {
    const productKeywords = [
      'datasheet',
      'manual',
      'spec',
      'specification',
      'price',
      'msrp',
      'firmware',
      'release notes',
      'features'
    ];
    const domainHit = hasDomain(context.brandDomainHint);
    if (!domainHit && !hasKeyword(productKeywords)) {
      reasons.push('Product: missing specs/pricing/support signals.');
    }
  }

  if (context.selectedVerticalIds.includes('location')) {
    const locationKeywords = context.addressLike
      ? ['parcel', 'assessor', 'tax collector', 'property card', 'assessment']
      : ['population', 'city council', 'mayor', 'zoning', 'budget', 'county', 'police', 'crime rate'];
    if (!hasKeyword(locationKeywords)) {
      reasons.push('Location: missing governance or parcel/assessment signals.');
    }
  }

  if (context.selectedVerticalIds.includes('event')) {
    const eventKeywords = [
      'timeline',
      'official report',
      'press release',
      'aftermath',
      'casualties',
      'sequence of events',
      'investigation'
    ];
    if (!hasKeyword(eventKeywords)) {
      reasons.push('Event: missing timeline or primary source signals.');
    }
  }

  if (context.selectedVerticalIds.includes('technical_concept')) {
    const technicalKeywords = [
      'implementation',
      'github',
      'benchmark',
      'performance',
      'paper',
      'arxiv',
      'api',
      'tutorial'
    ];
    if (!hasKeyword(technicalKeywords)) {
      reasons.push('Technical concept: missing implementation or academic signals.');
    }
  }

  if (context.selectedVerticalIds.includes('nontechnical_concept')) {
    const nontechnicalKeywords = [
      'definition',
      'origin',
      'etymology',
      'theory',
      'critique',
      'history',
      'movement'
    ];
    if (!hasKeyword(nontechnicalKeywords)) {
      reasons.push('Non-technical concept: missing definition or historical signals.');
    }
  }

  if (context.selectedVerticalIds.includes('creative_work')) {
    const creativeKeywords = [
      'plot',
      'ending',
      'review',
      'box office',
      'director',
      'author',
      'cast',
      'release'
    ];
    if (!hasKeyword(creativeKeywords)) {
      reasons.push('Creative work: missing reception or plot/credit signals.');
    }
  }

  if (context.selectedVerticalIds.includes('reception')) {
    const receptionKeywords = [
      'review',
      'reviews',
      'rating',
      'ratings',
      'critic',
      'critics',
      'audience',
      'sentiment',
      'award',
      'awards',
      'score',
      'metacritic',
      'rottentomatoes',
      'goodreads',
      'imdb'
    ];
    if (!hasKeyword(receptionKeywords)) {
      reasons.push('Reception: missing review, ratings, or awards signals.');
    }
  }

  if (context.selectedVerticalIds.includes('medical_subject')) {
    const medicalKeywords = [
      'symptoms',
      'treatment',
      'clinical',
      'prevalence',
      'mortality',
      'guidelines',
      'diagnosis'
    ];
    if (!hasKeyword(medicalKeywords)) {
      reasons.push('Medical subject: missing clinical or treatment signals.');
    }
  }

  if (context.selectedVerticalIds.includes('legal_matter')) {
    const legalKeywords = [
      'statute',
      'regulation',
      'case',
      'holding',
      'jurisdiction',
      'opinion',
      'legal analysis'
    ];
    if (!hasKeyword(legalKeywords)) {
      reasons.push('Legal matter: missing statutory or case-law signals.');
    }
  }

  return { blockEarlyStop: reasons.length > 0, reasons };
};

type WeightedVertical = { id: string; weight: number; reason?: string };
type TacticPackEntry = {
  verticalId: string;
  verticalLabel: string;
  subtopicId: string;
  subtopicLabel: string;
  methodId: string;
  methodLabel: string;
  expanded: Array<{
    id: string;
    template: string;
    query: string;
    slots: Record<string, string>;
    unresolvedSlots: string[];
    verticalId: string;
    subtopicId: string;
    methodId: string;
    provenance?: any[];
    verticalLabel: string;
    subtopicLabel: string;
    methodLabel: string;
  }>;
};

type ClassificationSummary = {
  verticals: WeightedVertical[];
  selected: WeightedVertical[];
  confidence: number;
  isUncertain: boolean;
  notes?: string;
};

type ExhaustionTracker = {
  rounds: ExhaustionMetrics[];
  seenQueries: Set<string>;
  seenSources: Set<string>;
  seenDomains: Set<string>;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const recordExhaustionRound = (
  tracker: ExhaustionTracker,
  label: string,
  queries: string[],
  sources: string[]
) => {
  const uniqueQueries = uniqueList(queries);
  const newQueries = uniqueQueries.filter(q => !tracker.seenQueries.has(q));
  const queryNoveltyRatio = newQueries.length / Math.max(1, uniqueQueries.length);

  const uniqueSources = uniqueList(sources);
  const newSources = uniqueSources.filter(s => !tracker.seenSources.has(s));
  const uniqueDomains = uniqueList(uniqueSources.map(src => normalizeDomain(src)).filter(Boolean));
  const newDomains = uniqueDomains.filter(d => !tracker.seenDomains.has(d));

  const domainGain = newDomains.length / Math.max(1, uniqueDomains.length);
  const sourceGain = newSources.length / Math.max(1, uniqueSources.length);
  const diminishingReturnsScore = clamp(
    1 - (0.4 * domainGain + 0.3 * sourceGain + 0.3 * clamp(queryNoveltyRatio, 0, 1)),
    0,
    1
  );

  const metrics: ExhaustionMetrics = {
    round: tracker.rounds.length + 1,
    label,
    totalQueries: queries.length,
    uniqueQueries: uniqueQueries.length,
    queryNoveltyRatio,
    newDomains: newDomains.length,
    totalDomains: tracker.seenDomains.size + newDomains.length,
    newSources: newSources.length,
    totalSources: tracker.seenSources.size + newSources.length,
    diminishingReturnsScore
  };

  newQueries.forEach(q => tracker.seenQueries.add(q));
  newSources.forEach(s => tracker.seenSources.add(s));
  newDomains.forEach(d => tracker.seenDomains.add(d));
  tracker.rounds.push(metrics);

  return metrics;
};

const computeExhaustionScore = (metrics: ExhaustionMetrics) => {
  const noveltyScore = clamp(1 - metrics.queryNoveltyRatio, 0, 1);
  const domainScore = clamp(1 - metrics.newDomains / Math.max(1, metrics.totalDomains), 0, 1);
  const sourceScore = clamp(1 - metrics.newSources / Math.max(1, metrics.totalSources), 0, 1);
  return clamp(
    0.5 * metrics.diminishingReturnsScore + 0.2 * noveltyScore + 0.15 * domainScore + 0.15 * sourceScore,
    0,
    1
  );
};

const formatWeightedVerticals = (verticals: WeightedVertical[]) => {
  return verticals.map(v => `${v.id} (${v.weight.toFixed(2)})`).join(', ');
};

const buildNameVariants = (topic: string) => {
  const cleaned = topic.replace(/\s+/g, ' ').trim();
  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length < 2) return [];
  const suffixes = new Set(['jr', 'sr', 'ii', 'iii', 'iv', 'v']);
  const rawLast = parts[parts.length - 1];
  const rawSuffix = suffixes.has(rawLast.toLowerCase()) ? rawLast : '';
  const baseParts = rawSuffix ? parts.slice(0, -1) : parts.slice();
  if (baseParts.length < 2) return [];
  const first = baseParts[0];
  const last = baseParts[baseParts.length - 1];
  const middleParts = baseParts.slice(1, -1);
  const middle = middleParts.join(' ');
  const middleInitials = middleParts.map(p => p[0]).join(' ');
  const suffix = rawSuffix ? ` ${rawSuffix}` : '';

  const variants = [
    `${first} ${last}${suffix}`.trim(),
    `${last}, ${first}${suffix}`.trim(),
    `${first} ${middle} ${last}${suffix}`.trim(),
    `${first} ${middleInitials} ${last}${suffix}`.trim(),
    `${first[0]}. ${last}${suffix}`.trim(),
    `${first} ${last}`.trim(),
    `${last} ${first}`.trim()
  ];

  return uniqueList(variants.filter(v => v.replace(/\s+/g, '').length >= 4));
};

const extractDomainFromTopic = (topic: string) => {
  const match = topic.match(/([a-z0-9-]+\.)+[a-z]{2,}/i);
  if (!match) return '';
  const raw = match[0].toLowerCase();
  return raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
};

const extractCityFromTopic = (topic: string) => {
  const parsed = extractCityStateFromTopic(topic);
  return parsed.city || '';
};

const extractCountyFromTopic = (topic: string) => {
  const match = topic.match(/([a-zA-Z\\s]+)\\s+county\\b/i);
  return match ? match[0].trim() : '';
};

const extractStateFromTopic = (topic: string) => {
  const parsed = extractCityStateFromTopic(topic);
  return parsed.state || '';
};

type MetroExpansion = {
  id: string;
  label: string;
  state: string;
  cityAliases: string[];
  cities: string[];
  coreCounties: string[];
  outerCounties: string[];
};

const METRO_EXPANSIONS: MetroExpansion[] = [
  {
    id: 'dallas_fort_worth',
    label: 'Dallas-Fort Worth-Arlington',
    state: 'TX',
    cityAliases: [
      'dallas',
      'fort worth',
      'arlington',
      'plano',
      'irving',
      'garland',
      'frisco',
      'mckinney',
      'denton',
      'richardson',
      'lewisville',
      'mesquite',
      'carrollton',
      'grand prairie'
    ],
    cities: [
      'Dallas',
      'Fort Worth',
      'Arlington',
      'Plano',
      'Irving',
      'Garland',
      'Frisco',
      'McKinney',
      'Denton',
      'Richardson',
      'Lewisville',
      'Mesquite',
      'Carrollton',
      'Grand Prairie'
    ],
    coreCounties: [
      'Dallas',
      'Tarrant',
      'Collin',
      'Denton',
      'Ellis',
      'Hunt',
      'Johnson',
      'Kaufman',
      'Parker',
      'Rockwall',
      'Wise'
    ],
    outerCounties: [
      'Erath',
      'Navarro',
      'Palo Pinto',
      'Hood',
      'Somervell'
    ]
  }
];

const MAX_CITY_EXPANSION = 14;
const MAX_COUNTY_EXPANSION = 18;

const formatCityName = (city: string) => {
  return city.trim();
};

const formatCountyWithState = (county: string, state: string) => {
  if (!county) return '';
  const base = /\\bcounty\\b/i.test(county) ? county : `${county} County`;
  if (!state) return base;
  const normalized = base.toLowerCase();
  if (normalized.includes(`, ${state.toLowerCase()}`) || normalized.endsWith(` ${state.toLowerCase()}`)) {
    return base;
  }
  return `${base}, ${state}`;
};

const findMetroExpansion = (city: string, state: string) => {
  if (!city || !state) return undefined;
  const normalizedCity = normalizeForMatch(city);
  return METRO_EXPANSIONS.find(metro =>
    metro.state === state && metro.cityAliases.includes(normalizedCity)
  );
};

const buildGeoExpansion = (city: string, state: string, county: string) => {
  const metro = findMetroExpansion(city, state);
  const primaryCity = city ? formatCityName(city) : '';
  const primaryCounty = county ? formatCountyWithState(county, state) : '';
  const metroCities = (metro?.cities || []).map(name => formatCityName(name));
  const coreCounties = (metro?.coreCounties || []).map(name => formatCountyWithState(name, state));
  const regionCounties = uniqueList([
    ...(metro?.coreCounties || []),
    ...(metro?.outerCounties || [])
  ]).map(name => formatCountyWithState(name, state));

  const metroCityList = uniqueList([primaryCity, ...metroCities].filter(Boolean)).slice(0, MAX_CITY_EXPANSION);
  const metroCountyList = uniqueList([primaryCounty || coreCounties[0], ...coreCounties].filter(Boolean)).slice(0, MAX_COUNTY_EXPANSION);
  const regionCountyList = uniqueList([primaryCounty || coreCounties[0], ...regionCounties].filter(Boolean)).slice(0, MAX_COUNTY_EXPANSION);

  return {
    primaryCity,
    metroCities: metroCityList,
    primaryCounty: primaryCounty || (coreCounties[0] || ''),
    metroCounties: metroCountyList,
    regionCounties: regionCountyList
  };
};

const buildPropertyAuthorityTerms = (state: string) => {
  if (state === 'TX') {
    return {
      primary: ['"central appraisal district"'],
      secondary: ['"appraisal district"', '"tax assessor-collector"']
    };
  }
  return {
    primary: ['"assessor"'],
    secondary: ['"property appraiser"', '"tax collector"', '"recorder of deeds"']
  };
};

const normalizeHandle = (topic: string) => {
  const cleaned = topic.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned.length >= 3 ? cleaned.slice(0, 24) : '';
};

const buildSlotValues = (topic: string, nameVariants: string[], addressLike: boolean) => {
  const cleaned = topic.trim();
  const addressVariants = addressLike ? uniqueList(normalizeAddressVariants(cleaned)) : [];
  const addressSlotValues = addressLike
    ? (addressVariants.length > 0 ? addressVariants : [cleaned])
    : [];
  const topicVariants = addressLike
    ? (addressSlotValues.length > 0 ? addressSlotValues : [cleaned])
    : [cleaned];
  const domain = extractDomainFromTopic(cleaned);
  const city = extractCityFromTopic(cleaned);
  const county = extractCountyFromTopic(cleaned);
  const state = extractStateFromTopic(cleaned);
  const geoExpansion = buildGeoExpansion(city, state, county);
  const propertyAuthorityTerms = buildPropertyAuthorityTerms(state);
  const handle = normalizeHandle(cleaned);
  const names = nameVariants.length > 0 ? nameVariants : [cleaned];
  const countyValue = county ? [formatCountyWithState(county, state)] : (addressLike ? [city || cleaned] : []);
  const countyPrimary = geoExpansion.primaryCounty ? [geoExpansion.primaryCounty] : countyValue;
  const countyMetro = geoExpansion.metroCounties.length > 0 ? geoExpansion.metroCounties : countyPrimary;
  const countyRegion = geoExpansion.regionCounties.length > 0 ? geoExpansion.regionCounties : countyMetro;
  const cityMetro = geoExpansion.metroCities.length > 0 ? geoExpansion.metroCities : (city ? [city] : []);
  const cityExpanded = cityMetro;

  return {
    topic: topicVariants,
    name: names,
    handle: handle ? [handle] : [],
    hometown: city ? [city] : [],
    company: [cleaned],
    companyDomain: domain ? [domain] : [],
    product: [cleaned],
    brandDomain: domain ? [domain] : [],
    city: city ? [city] : [cleaned],
    cityExpanded,
    cityMetro,
    county: countyPrimary,
    countyPrimary,
    countyMetro,
    countyRegion,
    countyExpanded: countyRegion,
    propertyAuthorityPrimary: propertyAuthorityTerms.primary,
    propertyAuthoritySecondary: propertyAuthorityTerms.secondary,
    address: addressSlotValues,
    event: [cleaned],
    concept: [cleaned],
    alternative: [],
    opposingConcept: [],
    title: [cleaned],
    condition: [cleaned],
    drug: [],
    law: [cleaned],
    statuteCitation: [],
    billName: [],
    caseName: [cleaned],
    opposing: [],
    legalAction: [],
    state: state ? [state] : [],
    stateOrCountry: state ? [state] : []
  };
};

const buildAddressDirectQueries = (slots: Record<string, unknown>) => {
  const addresses = Array.isArray(slots.address)
    ? slots.address.map(value => String(value || '').trim()).filter(Boolean)
    : [];
  if (addresses.length === 0) return [];
  const city = Array.isArray(slots.city) ? String(slots.city[0] || '') : '';
  const county = Array.isArray(slots.countyPrimary) ? String(slots.countyPrimary[0] || '') : '';
  const state = Array.isArray(slots.state) ? String(slots.state[0] || '') : '';
  const authorityPrimary = Array.isArray(slots.propertyAuthorityPrimary) ? String(slots.propertyAuthorityPrimary[0] || '') : '';
  const authoritySecondary = Array.isArray(slots.propertyAuthoritySecondary) ? String(slots.propertyAuthoritySecondary[0] || '') : '';

  return uniqueList(addresses.flatMap((address) => {
    const addressQuoted = `"${address}"`;
    return [
      `${addressQuoted} "property search"`,
      `${addressQuoted} "property card"`,
      `${addressQuoted} parcel`,
      `${addressQuoted} "parcel map"`,
      `${addressQuoted} zoning`,
      `${addressQuoted} permits`,
      `${addressQuoted} "code violations"`,
      `${addressQuoted} "tax records"`,
      `${addressQuoted} "assessment history"`,
      `${addressQuoted} GIS`,
      `${city ? `"${city}"` : ''} ${authorityPrimary} ${address}`.trim(),
      `${county ? `"${county}"` : ''} ${authorityPrimary} ${address}`.trim(),
      `${county ? `"${county}"` : ''} ${authoritySecondary} ${address}`.trim(),
      `${addressQuoted} ${city ? `"${city}"` : ''} ${state}`.trim()
    ];
  })).filter(Boolean);
};

const buildTacticPacks = (
  taxonomy: { verticals: any[] },
  selectedVerticalIds: string[],
  slots: Record<string, unknown>
) => {
  const packs: TacticPackEntry[] = [];
  const expandedAll: TacticPackEntry['expanded'] = [];

  for (const vertical of taxonomy.verticals || []) {
    if (!selectedVerticalIds.includes(vertical.id)) continue;
    for (const subtopic of vertical.subtopics || []) {
      const expandedForSubtopic: TacticPackEntry['expanded'] = [];
      for (const method of subtopic.methods || []) {
        const expanded = expandTacticTemplates(method.tactics || [], slots, { allowUnresolved: false });
        const hydrated = expanded.map((item) => ({
          ...item,
          verticalId: vertical.id,
          subtopicId: subtopic.id,
          methodId: method.id,
          verticalLabel: vertical.label,
          subtopicLabel: subtopic.label,
          methodLabel: method.label || method.id
        }));
        expandedForSubtopic.push(...hydrated);
      }
      if (expandedForSubtopic.length > 0) {
        const entry: TacticPackEntry = {
          verticalId: vertical.id,
          verticalLabel: vertical.label,
          subtopicId: subtopic.id,
          subtopicLabel: subtopic.label,
          methodId: expandedForSubtopic[0].methodId,
          methodLabel: expandedForSubtopic[0].methodLabel,
          expanded: expandedForSubtopic
        };
        packs.push(entry);
        expandedAll.push(...expandedForSubtopic);
      }
    }
  }

  return { packs, expandedAll };
};

const normalizeClassification = (
  raw: any,
  validIds: Set<string>,
  fallbackHints: string[]
): ClassificationSummary => {
  const rawVerticals = Array.isArray(raw?.verticals) ? raw.verticals : [];
  let verticals: WeightedVertical[] = rawVerticals
    .map((entry: any) => ({
      id: String(entry?.id || '').trim(),
      weight: Number(entry?.weight),
      reason: typeof entry?.reason === 'string' ? entry.reason : undefined
    }))
    .filter(v => v.id && validIds.has(v.id));

  if (verticals.length === 0) {
    const fallback = fallbackHints.filter(id => validIds.has(id));
    verticals = fallback.length > 0
      ? fallback.map(id => ({ id, weight: 1 / fallback.length }))
      : [{ id: 'general_discovery', weight: 1 }];
  }

  const sum = verticals.reduce((acc, v) => acc + (Number.isFinite(v.weight) ? v.weight : 0), 0);
  if (sum <= 0) {
    const uniform = 1 / verticals.length;
    verticals = verticals.map(v => ({ ...v, weight: uniform }));
  } else {
    verticals = verticals.map(v => ({ ...v, weight: v.weight / sum }));
  }

  verticals.sort((a, b) => b.weight - a.weight);

  const top = verticals[0];
  const second = verticals[1];
  const confidence = clamp(
    typeof raw?.confidence === 'number' ? raw.confidence : top.weight,
    0,
    1
  );
  const isUncertain =
    raw?.isUncertain === true ||
    confidence < 0.6 ||
    top.weight < 0.5 ||
    (second ? top.weight - second.weight < 0.1 : false);

  let selected = verticals.filter(v => v.weight >= 0.25 || (top && top.weight - v.weight <= 0.15 && v.weight >= 0.1));
  if (selected.length === 0) selected = [top];
  if (selected.length > 1) selected = selected.filter(v => v.id !== 'general_discovery');
  if (selected.length === 0) selected = [top];

  return {
    verticals,
    selected,
    confidence,
    isUncertain,
    notes: typeof raw?.notes === 'string' ? raw.notes : undefined
  };
};

const buildVerticalSeedSectors = (selected: WeightedVertical[], verticalLabels: Map<string, string>, topic: string) => {
  return selected.map((vertical) => {
    const label = verticalLabels.get(vertical.id) || vertical.id;
    const queryTemplate = VERTICAL_SEED_QUERIES[vertical.id] || '{topic} overview';
    const initialQuery = queryTemplate.replace('{topic}', topic);
    return {
      name: `Vertical: ${label}`,
      focus: `Vertical branch: ${label}`,
      initialQuery
    };
  });
};

const dedupeParagraphs = (text: string) => {
  const parts = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    if (seen.has(part)) continue;
    seen.add(part);
    out.push(part);
  }
  return out.join('\n\n');
};

const DEFAULT_METHOD_AUDIT = "Deep Drill Protocol: 3-Stage Recursive Verification.";

const isReportLike = (value: any): value is FinalReport => {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof value.title === 'string' &&
    typeof value.summary === 'string' &&
    Array.isArray(value.sections)
  );
};

const buildNarrativeMessage = (phase: string, decision: string, action: string, outcome?: string) => {
  const parts = [phase, `Decision: ${decision}`, `Action: ${action}`];
  if (outcome) parts.push(`Outcome: ${outcome}`);
  return parts.join(' | ');
};

type KnowledgeBase = {
  domains: string[];
  methods: string[];
  lastUpdated: number;
};

const loadKnowledgeBase = (): KnowledgeBase => {
  try {
    const stored = localStorage.getItem('overseer_kb');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        domains: Array.isArray(parsed?.domains) ? parsed.domains : [],
        methods: Array.isArray(parsed?.methods) ? parsed.methods : [],
        lastUpdated: typeof parsed?.lastUpdated === 'number' ? parsed.lastUpdated : Date.now()
      };
    }
  } catch (_) {
    // ignore
  }
  return { domains: [], methods: [], lastUpdated: Date.now() };
};

const saveKnowledgeBase = (kb: KnowledgeBase) => {
  try {
    localStorage.setItem('overseer_kb', JSON.stringify(kb));
  } catch (_) {
    // ignore
  }
};

export const useOverseer = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  const findingsRef = useRef<Finding[]>([]);
  const runVersionRef = useRef(0);
  const runIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    try {
      const storedSkills = localStorage.getItem('overseer_skills');
      if (storedSkills) {
        const parsed = JSON.parse(storedSkills);
        if (Array.isArray(parsed)) setSkills(parsed);
      }
    } catch (e) {
      console.error("Failed to load skills", e);
    }
  }, []);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const appendLog = (agentId: string, agentName: string, message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: generateId(),
      timestamp: Date.now(),
      agentId,
      agentName,
      message,
      type
    }]);
  };

  const applyAgentUpdate = (id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const appendAgent = (agent: Agent) => {
    setAgents(prev => [...prev, agent]);
  };

  const logResetEvent = (input: { reason: string; runId: string | null; cancellationStatus: string }) => {
    console.info('[Overseer] run reset', input);
  };

  const resetRun = useCallback((reason = 'user_reset') => {
    const activeRunId = runIdRef.current;
    const controller = abortControllerRef.current;
    let cancellationStatus = 'no-controller';
    if (controller) {
      if (!controller.signal.aborted) {
        controller.abort(reason);
      }
      cancellationStatus = controller.signal.aborted ? 'aborted' : 'pending';
    }
    logResetEvent({ reason, runId: activeRunId, cancellationStatus });
    runVersionRef.current += 1;
    abortControllerRef.current = null;
    runIdRef.current = null;
    setIsRunning(false);
    isRunningRef.current = false;
    setAgents([]);
    setLogs([]);
    setReport(null);
    setFindings([]);
    findingsRef.current = [];
  }, []);

  const startResearch = useCallback(async (topic: string, provider: LLMProvider, apiKey: string, runConfig?: {
    minAgents?: number;
    maxAgents?: number;
    maxMethodAgents?: number;
    forceExhaustion?: boolean;
    minRounds?: number;
    maxRounds?: number;
    earlyStopDiminishingScore?: number;
    earlyStopNoveltyRatio?: number;
    earlyStopNewDomains?: number;
    earlyStopNewSources?: number;
    modelOverrides?: ModelOverrides;
  }) => {
    const previousRunId = runIdRef.current;
    const previousController = abortControllerRef.current;
    if (previousController && !previousController.signal.aborted) {
      previousController.abort('new_run');
      logResetEvent({
        reason: 'new_run',
        runId: previousRunId,
        cancellationStatus: previousController.signal.aborted ? 'aborted' : 'pending'
      });
    }

    const runVersion = runVersionRef.current + 1;
    runVersionRef.current = runVersion;
    const runId = generateId();
    runIdRef.current = runId;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    const isActive = () => runVersionRef.current === runVersion && !signal.aborted;
    const ensureActive = () => {
      if (!isActive()) {
        throw createAbortError('Run aborted');
      }
    };
    const runSafely = async <T,>(promise: Promise<T>) => {
      ensureActive();
      const result = await promise;
      ensureActive();
      return result;
    };

    const addLog = (agentId: string, agentName: string, message: string, type: LogEntry['type'] = 'info') => {
      if (!isActive()) return;
      appendLog(agentId, agentName, message, type);
    };
    const updateAgent = (id: string, updates: Partial<Agent>) => {
      if (!isActive()) return;
      applyAgentUpdate(id, updates);
    };
    const addAgent = (agent: Agent) => {
      if (!isActive()) return;
      appendAgent(agent);
    };
    const setReportSafe = (nextReport: FinalReport | null) => {
      if (!isActive()) return;
      setReport(nextReport);
    };
    const setIsRunningSafe = (value: boolean) => {
      if (runVersionRef.current !== runVersion) return;
      isRunningRef.current = value;
      setIsRunning(value);
    };
    const pushFinding = (finding: Finding | any) => {
      if (!isActive()) return;
      findingsRef.current.push(finding);
    };

    setIsRunningSafe(true);
    setAgents([]);
    setLogs([]);
    setReport(null);
    setFindings([]);
    findingsRef.current = [];

    const resolveNumber = (value: any, fallback: number) => {
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
    };
    const envMin = resolveNumber(process.env.MIN_AGENT_COUNT, MIN_AGENT_COUNT);
    const envMax = resolveNumber(process.env.MAX_AGENT_COUNT, MAX_AGENT_COUNT);
    const envMaxMethod = resolveNumber(process.env.MAX_METHOD_AGENTS, MAX_METHOD_AGENTS);

    const minAgents = Math.max(1, resolveNumber(runConfig?.minAgents, envMin));
    const maxAgents = Math.max(minAgents, resolveNumber(runConfig?.maxAgents, envMax));
    const maxMethodAgents = Math.max(1, resolveNumber(runConfig?.maxMethodAgents, envMaxMethod));
    const forceExhaustion = runConfig?.forceExhaustion === true;
    const minRounds = Math.max(1, resolveNumber(runConfig?.minRounds, MIN_SEARCH_ROUNDS));
    const maxRounds = Math.max(minRounds, resolveNumber(runConfig?.maxRounds, MAX_SEARCH_ROUNDS));
    const earlyStopDiminishingScore = clamp(
      Number.isFinite(Number(runConfig?.earlyStopDiminishingScore))
        ? Number(runConfig?.earlyStopDiminishingScore)
        : EARLY_STOP_DIMINISHING_SCORE,
      0,
      1
    );
    const earlyStopNoveltyRatio = clamp(
      Number.isFinite(Number(runConfig?.earlyStopNoveltyRatio))
        ? Number(runConfig?.earlyStopNoveltyRatio)
        : EARLY_STOP_NOVELTY_RATIO,
      0,
      1
    );
    const earlyStopNewDomains = Math.max(0, resolveNumber(runConfig?.earlyStopNewDomains, EARLY_STOP_NEW_DOMAINS));
    const earlyStopNewSources = Math.max(0, resolveNumber(runConfig?.earlyStopNewSources, EARLY_STOP_NEW_SOURCES));
    const modelOverrides = runConfig?.modelOverrides;
    const requestOptions = { signal };
    const knowledgeBase = loadKnowledgeBase();
    let evidenceRecoveryCache = pruneEvidenceRecoveryCache(loadEvidenceRecoveryCache());
    const usedQueries = new Set<string>();
    const methodCandidateQueries: string[] = [];
    const methodQuerySources = new Map<string, string[]>();
    const methodQueryMeta = new Map<string, { source: string; verticalId?: string; subtopicId?: string; methodId?: string; tacticId?: string; template?: string }>();
    const exhaustionTracker: ExhaustionTracker = {
      rounds: [],
      seenQueries: new Set<string>(),
      seenSources: new Set<string>(),
      seenDomains: new Set<string>()
    };
    const taxonomy = getResearchTaxonomy();
    const taxonomySummary = summarizeTaxonomy(taxonomy);
    const taxonomySummaryForClassifier = taxonomy.verticals.map(v => ({
      id: v.id,
      label: v.label,
      blueprintFields: v.blueprintFields
    }));
    const verticalLabels = new Map(taxonomy.verticals.map(v => [v.id, v.label]));
    let taxonomyProposalBudget = Math.min(4, maxAgents);
    let taxonomyGrowthQueue = Promise.resolve();

    const registerMethodQuery = (
      query: string,
      meta: { source: string; verticalId?: string; subtopicId?: string; methodId?: string; tacticId?: string; template?: string }
    ) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      if (!methodQueryMeta.has(trimmed)) {
        methodQueryMeta.set(trimmed, meta);
      }
    };
    
    // --- 0. INITIALIZATION ---
    const overseerId = INITIAL_OVERSEER_ID;
    const overseer: Agent = {
      id: overseerId,
      name: 'Overseer Alpha',
      type: AgentType.OVERSEER,
      status: AgentStatus.THINKING,
      task: 'Orchestrate Deep Drill Protocol',
      reasoning: ['Initializing...', 'Loading Skill Matrix...'],
      findings: []
    };
    addAgent(overseer);
    const logOverseer = (
      phase: string,
      decision: string,
      action: string,
      outcome?: string,
      type: LogEntry['type'] = 'info'
    ) => {
      addLog(overseerId, overseer.name, buildNarrativeMessage(phase, decision, action, outcome), type);
    };
    logOverseer('PHASE 0: INIT', 'start run', 'initialize providers + taxonomy', `topic "${topic}"`, 'action');
    try {
      if (isSystemTestTopic(topic)) {
        logOverseer(
          'PHASE 0: SYSTEM TEST',
          'detected test phrase',
          'bypass external LLM and run smoke flow',
          `vertical ${SYSTEM_TEST_VERTICAL_ID}`,
          'success'
        );

        const testSource = {
          uri: 'https://example.com/system-test',
          title: 'System Test Source',
          domain: 'example.com',
          provider: 'system',
          kind: 'web'
        };
        const testFinding: Finding = {
          source: 'System Test Researcher',
          content: 'System test search executed with minimal tokens.',
          confidence: 1,
          url: testSource.uri
        };

        const researcherId = generateId();
        const researcher: Agent = {
          id: researcherId,
          name: 'System Test Researcher',
          type: AgentType.RESEARCHER,
          status: AgentStatus.SEARCHING,
          task: 'System test search',
          reasoning: [`Test phrase: ${SYSTEM_TEST_PHRASE}`],
          findings: [],
          parentId: overseerId
        };
        addAgent(researcher);
        addLog(researcherId, researcher.name, 'Deployed for system test.', 'info');
        await wait(60, signal);
        updateAgent(researcherId, {
          status: AgentStatus.COMPLETE,
          findings: [testFinding],
          reasoning: ['Completed minimal token search.']
        });
        addLog(researcherId, researcher.name, 'System test search complete.', 'success');
        pushFinding({ ...testFinding, rawSources: [testSource] } as any);

        const criticId = generateId();
        const critic: Agent = {
          id: criticId,
          name: 'System Test Critic',
          type: AgentType.CRITIC,
          status: AgentStatus.ANALYZING,
          task: 'System test critique',
          reasoning: ['Validate minimal agent coverage.'],
          findings: [],
          parentId: overseerId
        };
        addAgent(critic);
        addLog(criticId, critic.name, 'Running critique pass.', 'info');
        await wait(40, signal);
        updateAgent(criticId, {
          status: AgentStatus.COMPLETE,
          reasoning: ['No gaps detected in system test.']
        });
        addLog(criticId, critic.name, 'Critique complete.', 'success');

        const synthesizerId = generateId();
        const synthesizer: Agent = {
          id: synthesizerId,
          name: 'System Test Synthesizer',
          type: AgentType.SYNTHESIZER,
          status: AgentStatus.THINKING,
          task: 'System test synthesis',
          reasoning: ['Compile system test report.'],
          findings: [],
          parentId: overseerId
        };
        addAgent(synthesizer);
        addLog(synthesizerId, synthesizer.name, 'Synthesizing system test report.', 'info');
        await wait(40, signal);
        updateAgent(synthesizerId, {
          status: AgentStatus.COMPLETE,
          reasoning: ['Report ready.']
        });
        addLog(synthesizerId, synthesizer.name, 'Synthesis complete.', 'success');

        const agentSummary = 'Agents spawned: Overseer Alpha, System Test Researcher, System Test Critic, System Test Synthesizer.';
        setReportSafe({
          title: 'System Test Report',
          summary: `System test mode executed. ${agentSummary}`,
          sections: [
            {
              title: 'System Test Summary',
              content: `Test phrase detected. Vertical ${SYSTEM_TEST_VERTICAL_ID} selected. ${agentSummary}`,
              sources: [testSource.uri]
            }
          ],
          visualizations: [],
          provenance: {
            totalSources: 1,
            methodAudit: 'System test run'
          },
          schemaVersion: 1
        });

        updateAgent(overseerId, { status: AgentStatus.COMPLETE });
        logOverseer(
          'PHASE 0: SYSTEM TEST',
          'complete',
          'deliver system test report',
          'minimal token path executed',
          'success'
        );
        setIsRunningSafe(false);
        return;
      }
      if (provider === 'openai') {
        initializeOpenAI(apiKey);
      } else {
        initializeGemini(apiKey);
      }

      const generateSectorAnalysis = provider === 'openai' ? generateSectorAnalysisOpenAI : generateSectorAnalysisGemini;
      const performDeepResearch = provider === 'openai' ? performDeepResearchOpenAI : performDeepResearchGemini;
      const critiqueAndFindGaps = provider === 'openai' ? critiqueAndFindGapsOpenAI : critiqueAndFindGapsGemini;
      const synthesizeGrandReport = provider === 'openai' ? synthesizeGrandReportOpenAI : synthesizeGrandReportGemini;
      const extractResearchMethods = provider === 'openai' ? extractResearchMethodsOpenAI : extractResearchMethodsGemini;
      const validateReport = provider === 'openai' ? validateReportOpenAI : validateReportGemini;
      const proposeTaxonomyGrowth = provider === 'openai' ? proposeTaxonomyGrowthOpenAI : proposeTaxonomyGrowthGemini;
      const classifyResearchVertical = provider === 'openai' ? classifyResearchVerticalOpenAI : classifyResearchVerticalGemini;

      const validVerticalIds = new Set(taxonomy.verticals.map(v => v.id));
      const hintVerticals = inferVerticalHints(topic);
      let classificationRaw = await runSafely(classifyResearchVertical({
        topic,
        taxonomySummary: taxonomySummaryForClassifier,
        hintVerticalIds: hintVerticals
      }, modelOverrides, requestOptions));
      let classification = normalizeClassification(classificationRaw, validVerticalIds, hintVerticals);
      const weightSummary = classification.verticals.map(v => `${v.id}:${v.weight.toFixed(2)}`).join(', ') || 'none';
      const selectedSummary = classification.selected.map(v => `${v.id}:${v.weight.toFixed(2)}`).join(', ') || 'none';
      logOverseer(
        'PHASE 0: VERTICAL CLASSIFICATION',
        `select ${selectedSummary}${classification.isUncertain ? ' (uncertain)' : ''}`,
        `weights ${weightSummary}`,
        `confidence ${classification.confidence.toFixed(2)}`,
        'action'
      );

      if (classification.isUncertain) {
        const generalTemplates = listTacticsForVertical(taxonomy, 'general_discovery');
        const discoveryTopicVariants = isAddressLike(topic)
          ? normalizeAddressVariants(topic)
          : [topic];
        const expanded = expandTacticTemplates(generalTemplates, { topic: discoveryTopicVariants }, { allowUnresolved: false });
        const discoveryQueries = uniqueList(expanded.map(e => e.query)).slice(0, Math.min(2, maxMethodAgents));

        if (discoveryQueries.length > 0) {
          logOverseer(
            'PHASE 0B: GENERAL DISCOVERY',
            'reduce classification uncertainty',
            `spawn ${discoveryQueries.length} scouts`,
            `queries ${discoveryQueries.join(' | ')}`,
            'action'
          );
          const discoveryTexts: string[] = [];
          for (let i = 0; i < discoveryQueries.length; i++) {
            ensureActive();
            const query = discoveryQueries[i];
            const agentId = generateId();
            const agent: Agent = {
              id: agentId,
              name: `General Discovery ${i + 1}`,
              type: AgentType.RESEARCHER,
              status: AgentStatus.SEARCHING,
              task: 'General discovery',
              reasoning: [`Discovery query: ${query}`],
              findings: [],
              parentId: overseerId
            };
            addAgent(agent);
            addLog(agentId, agent.name, `Deployed for: ${query}`, 'info');

            const result = await runSafely(performDeepResearch(
              agent.name,
              'General discovery',
              query,
              (msg) => addLog(agentId, agent.name, msg, 'info'),
              { modelOverrides, signal }
            ));

            updateAgent(agentId, {
              status: AgentStatus.COMPLETE,
              reasoning: [`Indexed ${result.sources.length} sources`, `Data Volume: ${result.text.length} chars`]
            });
            addLog(agentId, agent.name, `General Discovery Complete. Sources Vetted: ${result.sources.length}`, 'success');
            usedQueries.add(query);
            if (result.text) discoveryTexts.push(result.text);
          }

          const contextText = discoveryTexts.join('\n').substring(0, 12000);
          if (contextText.trim()) {
            classificationRaw = await runSafely(classifyResearchVertical({
              topic,
              taxonomySummary: taxonomySummaryForClassifier,
              hintVerticalIds: hintVerticals,
              contextText
            }, modelOverrides, requestOptions));
            classification = normalizeClassification(classificationRaw, validVerticalIds, hintVerticals);
            const reweightSummary = classification.verticals.map(v => `${v.id}:${v.weight.toFixed(2)}`).join(', ') || 'none';
            const reselectedSummary = classification.selected.map(v => `${v.id}:${v.weight.toFixed(2)}`).join(', ') || 'none';
            logOverseer(
              'PHASE 0B: RECLASSIFY',
              `select ${reselectedSummary}${classification.isUncertain ? ' (uncertain)' : ''}`,
              `weights ${reweightSummary}`,
              `confidence ${classification.confidence.toFixed(2)}`,
              'action'
            );
          }
        }
      }

      const selectedVerticals = classification.selected;
      const selectedVerticalIds = selectedVerticals.map(v => v.id);
      const nameVariants = selectedVerticalIds.includes('individual') ? buildNameVariants(topic) : [];
      const blueprintSelections = selectedVerticalIds.map(id => {
        const vertical = taxonomy.verticals.find(v => v.id === id);
        return {
          id,
          label: vertical?.label || id,
          fields: vertical?.blueprintFields || []
        };
      });

      if (selectedVerticals.length > 1) {
        logOverseer(
          'PHASE 0: HYBRID BRANCHING',
          'multiple verticals selected',
          'prepare parallel subtopic packs',
          `verticals ${selectedVerticalIds.join(' + ')}`,
          'action'
        );
      }

      if (blueprintSelections.length > 0) {
        const blueprintSummary = blueprintSelections
          .map(b => `${b.label}: ${b.fields.join(', ') || 'no fields'}`)
          .join(' | ');
        logOverseer(
          'PHASE 0: BLUEPRINT',
          'load expected fields',
          `fields ${blueprintSummary}`,
          `verticals ${selectedVerticalIds.join(', ') || 'none'}`,
          'info'
        );
      }

      if (nameVariants.length > 0) {
        logOverseer(
          'PHASE 0: NAME VARIANTS',
          'expand person aliases',
          'generate search variants',
          `variants ${nameVariants.join(' | ')}`,
          'info'
        );
      }

      const slotValues = buildSlotValues(topic, nameVariants, isAddressLike(topic));
      const slotValuesAny = slotValues as Record<string, unknown>;
      const companyDomainHint = Array.isArray(slotValuesAny.companyDomain) ? String(slotValuesAny.companyDomain[0] || '') : '';
      const brandDomainHint = Array.isArray(slotValuesAny.brandDomain) ? String(slotValuesAny.brandDomain[0] || '') : '';
      const { packs: tacticPacks, expandedAll: expandedTactics } = buildTacticPacks(taxonomy, selectedVerticalIds, slotValues);
      const addressLike = isAddressLike(topic);
      const topicVariants = addressLike && Array.isArray(slotValuesAny.topic)
        ? slotValuesAny.topic.map(value => String(value || '').trim()).filter(Boolean)
        : [topic];
      const addressDirectQueries = addressLike
        ? buildAddressDirectQueries(slotValues as Record<string, unknown>)
        : [];
      if (addressDirectQueries.length > 0) {
        const parcelPackIndex = tacticPacks.findIndex(pack => pack.verticalId === 'location' && pack.subtopicId === 'parcel_real_estate');
        const addressExpanded = addressDirectQueries.map((query, index) => ({
          id: `location-parcel-address-direct-${index + 1}`,
          template: query,
          query,
          verticalId: 'location',
          subtopicId: 'parcel_real_estate',
          methodId: 'address_direct',
          verticalLabel: 'Location (City / Region / Property)',
          subtopicLabel: 'Parcel/Real Estate',
          methodLabel: 'Address Direct'
        }));
        if (parcelPackIndex >= 0) {
          tacticPacks[parcelPackIndex].expanded.push(...addressExpanded);
        } else if (selectedVerticalIds.includes('location')) {
          tacticPacks.push({
            verticalId: 'location',
            verticalLabel: 'Location (City / Region / Property)',
            subtopicId: 'parcel_real_estate',
            subtopicLabel: 'Parcel/Real Estate',
            methodId: 'address_direct',
            methodLabel: 'Address Direct',
            expanded: addressExpanded
          });
        }
        expandedTactics.push(...addressExpanded);
      }
      const tacticPackQueries = uniqueList(expandedTactics.map(t => t.query));
      const subtopicSeedQueries = uniqueList(
        tacticPacks.map(pack => pack.expanded[0]?.query).filter(Boolean) as string[]
      );
      const subtopicLabelMap = new Map<string, string>();
      const methodLabelMap = new Map<string, string>();
      tacticPacks.forEach(pack => {
        subtopicLabelMap.set(`${pack.verticalId}:${pack.subtopicId}`, pack.subtopicLabel);
        methodLabelMap.set(`${pack.verticalId}:${pack.subtopicId}:${pack.methodId}`, pack.methodLabel);
      });

      const uniqueTemplates = uniqueList(expandedTactics.map(t => t.template));
      const coverageByVertical = new Map<string, { subtopics: number; tactics: number }>();
      tacticPacks.forEach(pack => {
        const entry = coverageByVertical.get(pack.verticalId) || { subtopics: 0, tactics: 0 };
        entry.subtopics += 1;
        entry.tactics += pack.expanded.length;
        coverageByVertical.set(pack.verticalId, entry);
      });
      const coverageSummary = Array.from(coverageByVertical.entries()).map(([id, stats]) => {
        const label = verticalLabels.get(id) || id;
        return `${label}: ${stats.subtopics} subtopics, ${stats.tactics} tactics`;
      }).join(' | ') || 'none';
      logOverseer(
        'PHASE 0.7: COVERAGE',
        `select ${selectedVerticalIds.length} verticals`,
        `tactic packs ${tacticPacks.length}, tactics ${expandedTactics.length}`,
        coverageSummary,
        'info'
      );

      tacticPacks.forEach(pack => {
        const templates = uniqueList(pack.expanded.map(t => t.template));
        logOverseer(
          'PHASE 0.7: TACTIC PACK',
          `select ${pack.verticalLabel} · ${pack.subtopicLabel}`,
          `templates ${templates.join(' | ')}`,
          `expanded ${pack.expanded.length} queries`,
          'info'
        );
      });

      const selectedTaxonomySummary = taxonomySummary.filter(v => selectedVerticalIds.includes(v.id));
      const taxonomySummaryText = selectedTaxonomySummary
        .map(v => {
          const verticalDesc = v.description ? ` - ${v.description}` : '';
          const subtopicText = v.subtopics
            .map(s => s.description ? `${s.label} (${s.id}): ${s.description}` : `${s.label} (${s.id})`)
            .join(', ');
          return `${v.label} (${v.id})${verticalDesc}: ${subtopicText}`;
        })
        .join(' | ');
      const blueprintSummaryText = blueprintSelections
        .map(b => `${b.label} (${b.id}): ${b.fields.join(', ') || 'none'}`)
        .join(' | ');
      const templateLimit = 40;
      const limitedTemplates = uniqueTemplates.slice(0, templateLimit);
      const templateContextText = limitedTemplates.join(' | ')
        + (uniqueTemplates.length > templateLimit ? ` | +${uniqueTemplates.length - templateLimit} more` : '');
      const researchContextText = [
        `Selected Verticals: ${selectedVerticals.map(v => `${v.id}:${v.weight.toFixed(2)}`).join(', ') || 'none'}`,
        `Blueprint Fields: ${blueprintSummaryText || 'none'}`,
        `Taxonomy Subtopics: ${taxonomySummaryText || 'none'}`,
        `Tactic Templates: ${templateContextText || 'none'}`
      ].join('\n').substring(0, 8000);

      const buildPackLabelForQuery = (query: string) => {
        const meta = methodQueryMeta.get(query);
        if (!meta?.verticalId) return '';
        const verticalLabel = verticalLabels.get(meta.verticalId) || meta.verticalId;
        const subtopicLabel = meta.subtopicId
          ? (subtopicLabelMap.get(`${meta.verticalId}:${meta.subtopicId}`) || meta.subtopicId)
          : '';
        const methodLabel = meta.methodId
          ? (methodLabelMap.get(`${meta.verticalId}:${meta.subtopicId}:${meta.methodId}`) || meta.methodId)
          : '';
        return [verticalLabel, subtopicLabel, methodLabel].filter(Boolean).join(' · ');
      };

      const buildAgentNameForQuery = (base: string, query: string, index: number) => {
        const packLabel = buildPackLabelForQuery(query);
        const ordinal = index + 1;
        return packLabel ? `${base} · ${packLabel} #${ordinal}` : `${base} ${ordinal}`;
      };

      for (const tactic of expandedTactics) {
        registerMethodQuery(tactic.query, {
          source: 'taxonomy',
          verticalId: tactic.verticalId,
          subtopicId: tactic.subtopicId,
          methodId: tactic.methodId,
          tacticId: tactic.id,
          template: tactic.template
        });
      }

      const enqueueTaxonomyGrowth = (context: { agentId: string; agentName: string; focus: string; resultText: string }) => {
        if (taxonomyProposalBudget <= 0) return;
        if (!context.resultText || context.resultText.length < 400) return;
        taxonomyProposalBudget -= 1;
        const hintVerticals = selectedVerticalIds.length > 0 ? selectedVerticalIds : inferVerticalHints(topic);
        const snippet = context.resultText.substring(0, 8000);

        taxonomyGrowthQueue = taxonomyGrowthQueue.then(async () => {
          if (!isActive()) return;
          try {
            const proposals = await runSafely(proposeTaxonomyGrowth({
              topic,
              agentName: context.agentName,
              agentFocus: context.focus,
              findingsText: snippet,
              taxonomySummary,
              hintVerticalIds: hintVerticals
            }, modelOverrides, requestOptions));
            const vetResult = vetAndPersistTaxonomyProposals(proposals, {
              topic,
              agentId: context.agentId,
              agentName: context.agentName,
              note: `focus:${context.focus}`
            });
            if (vetResult.accepted > 0) {
              const acceptedPreview = vetResult.acceptedItems.slice(0, 5).join(' | ');
              logOverseer(
                'PHASE 2: TAXONOMY GROWTH',
                `accept ${vetResult.accepted} proposals`,
                `templates ${acceptedPreview || 'none'}`,
                `provenance agent=${context.agentName} focus=${context.focus}`,
                'success'
              );
            }
            if (vetResult.rejected > 0) {
              const rejectedPreview = vetResult.rejectedItems
                .slice(0, 5)
                .map(item => `${item.item} (${item.reason})`)
                .join(' | ');
              logOverseer(
                'PHASE 2: TAXONOMY GROWTH',
                `reject ${vetResult.rejected} proposals`,
                `templates ${rejectedPreview || 'none'}`,
                `provenance agent=${context.agentName} focus=${context.focus}`,
                'warning'
              );
            }
          } catch (e: any) {
            logOverseer(
              'PHASE 2: TAXONOMY GROWTH',
              'error while vetting proposals',
              'skip persistence',
              e?.message || 'Unknown error',
              'warning'
            );
          }
        });
      };

      // --- PHASE 0.5: METHOD DISCOVERY (HOW TO RESEARCH THE TOPIC) ---
      const discoveryTemplates = (selectedVerticalIds.includes('location') && isAddressLike(topic))
        ? METHOD_DISCOVERY_TEMPLATES_ADDRESS
        : (selectedVerticalIds.includes('individual') ? METHOD_DISCOVERY_TEMPLATES_PERSON : METHOD_DISCOVERY_TEMPLATES_GENERAL);
      const discoveryTopics = nameVariants.length > 0 ? nameVariants : (addressLike ? topicVariants : [topic]);
      const discoveryTemplateQueries = uniqueList(
        discoveryTemplates.flatMap(t => discoveryTopics.map(name => t.replace('{topic}', name)))
      );
      const tacticDiscoveryQueries = uniqueList(
        tacticPacks.flatMap(pack => pack.expanded.slice(1, 3).map(t => t.query))
      );
      const forcedDiscoveryQueries = discoveryTemplateQueries
        .filter(q => q.toLowerCase().includes('public records'))
        .slice(0, 1);
      const discoveryQueries = uniqueList([
        ...forcedDiscoveryQueries,
        ...(tacticDiscoveryQueries.length > 0 ? tacticDiscoveryQueries : subtopicSeedQueries),
        ...discoveryTemplateQueries
      ]).slice(0, Math.min(6, maxMethodAgents));
      discoveryTemplateQueries.forEach(q => registerMethodQuery(q, { source: 'method_discovery_template' }));
      if (discoveryQueries.length > 0) {
        logOverseer(
          'PHASE 0.5: METHOD DISCOVERY',
          'collect method candidates',
          `spawn ${discoveryQueries.length} scouts`,
          `queries ${discoveryQueries.join(' | ')}`,
          'action'
        );
          const discoveryPromises = discoveryQueries.map(async (query: string, index: number) => {
          await wait(index * 600, signal);
          ensureActive();
          const agentId = generateId();
          const agent: Agent = {
            id: agentId,
            name: buildAgentNameForQuery('Method Discovery', query, index),
            type: AgentType.RESEARCHER,
            status: AgentStatus.SEARCHING,
            task: 'Discover research methods',
            reasoning: [`Method discovery query: ${query}`],
            findings: [],
            parentId: overseerId
          };
          addAgent(agent);
          addLog(agentId, agent.name, `Deployed for: ${query}`, 'info');

          const result = await runSafely(performDeepResearch(
            agent.name,
            'Method discovery',
            query,
            (msg) => addLog(agentId, agent.name, msg, 'info'),
            { modelOverrides, role: 'method_discovery', signal }
          ));

          enqueueTaxonomyGrowth({
            agentId,
            agentName: agent.name,
            focus: 'Method discovery',
            resultText: result.text || ''
          });

          updateAgent(agentId, {
            status: AgentStatus.COMPLETE,
            reasoning: [`Indexed ${result.sources.length} sources`, `Data Volume: ${result.text.length} chars`]
          });
          addLog(agentId, agent.name, `Method Discovery Complete. Sources Vetted: ${result.sources.length}`, 'success');

          const methods = await runSafely(extractResearchMethods(
            topic,
            result.text,
            researchContextText,
            modelOverrides,
            requestOptions
          ));
          const extracted = Array.isArray(methods?.methods) ? methods.methods : [];
          const extractedQueries = extracted.map((m: any) => m?.query).filter(Boolean);
          extractedQueries.forEach((q: string) => registerMethodQuery(q, { source: 'llm_method_discovery' }));
          methodCandidateQueries.push(...extractedQueries);
          usedQueries.add(query);
        });

        await runSafely(Promise.all(discoveryPromises));
      }

      // --- PHASE 1: DIMENSIONAL MAPPING (SECTORS) ---
      logOverseer(
        'PHASE 1: DIMENSIONAL MAPPING',
        'derive sector plan',
        'request sector analysis with taxonomy + blueprint context',
        undefined,
        'action'
      );
      const sectorPlan = await runSafely(generateSectorAnalysis(
        topic,
        skills,
        researchContextText,
        modelOverrides,
        requestOptions
      ));
      const rawSectors = sectorPlan && Array.isArray(sectorPlan.sectors) ? sectorPlan.sectors : [];
      const weightMap = new Map(selectedVerticals.map(v => [v.id, v.weight]));
      const orderedPacks = [...tacticPacks].sort((a, b) => {
        return (weightMap.get(b.verticalId) || 0) - (weightMap.get(a.verticalId) || 0);
      });
      const subtopicSectors = orderedPacks
        .flatMap((pack) => {
          const templateSeeds: typeof pack.expanded = [];
          const seenTemplates = new Set<string>();
          for (const tactic of pack.expanded) {
            const key = tactic.template;
            if (seenTemplates.has(key)) continue;
            seenTemplates.add(key);
            templateSeeds.push(tactic);
          }
          const seeds = (pack.verticalId === 'individual' && pack.subtopicId === 'assets')
            ? templateSeeds.slice(0, 2)
            : templateSeeds.slice(0, 1);
          return seeds.map((seed, index) => ({
            name: index === 0
              ? `${pack.verticalLabel} · ${pack.subtopicLabel}`
              : `${pack.verticalLabel} · ${pack.subtopicLabel} ${index + 1}`,
            focus: `${pack.verticalLabel} / ${pack.subtopicLabel}`,
            initialQuery: seed.query
          }));
        })
        .filter((sector) => Boolean(sector?.initialQuery)) as Array<{ name: string; focus: string; initialQuery: string }>;
      const queryTopic = addressLike && topicVariants.length > 0 ? topicVariants[0] : topic;
      const verticalSeeds = subtopicSectors.length > 0
        ? []
        : buildVerticalSeedSectors(selectedVerticals, verticalLabels, queryTopic);
      let sectors = [
        ...subtopicSectors,
        ...verticalSeeds,
        ...rawSectors.map((sector: any, index: number) => {
        const name = sector?.name || sector?.title || `Researcher ${index + 1}`;
        const focus = sector?.focus || sector?.dimension || name || "General Research";
        const initialQuery = sector?.initialQuery || sector?.initial_query || `${queryTopic} ${focus}`;
        return { ...sector, name, focus, initialQuery };
        })
      ];

      const sectorSeen = new Set<string>();
      sectors = sectors.filter((sector) => {
        const key = `${sector.name}|${sector.initialQuery}`;
        if (sectorSeen.has(key)) return false;
        sectorSeen.add(key);
        return true;
      });

      updateAgent(overseerId, { 
        reasoning: [...overseer.reasoning, `Identified ${sectors.length} critical sectors`, ...sectors.map((s:any) => `• ${s.name}: ${s.focus}`)],
        status: AgentStatus.IDLE 
      });

      if (sectors.length === 0) sectors.push({ name: "General Researcher", focus: "Overview", initialQuery: queryTopic });
      if (sectors.length < minAgents) {
        const templates = tacticPackQueries.length > 0
          ? tacticPackQueries
          : uniqueList(
            (isAddressLike(topic) ? METHOD_TEMPLATES_ADDRESS : METHOD_TEMPLATES_GENERAL)
              .flatMap(t => (addressLike ? topicVariants : [topic]).map(value => t.replace('{topic}', value)))
          );
        const needed = minAgents - sectors.length;
        for (let i = 0; i < needed; i++) {
          const fallbackQuery = templates[i % templates.length] || topic;
          sectors.push({
            name: buildAgentNameForQuery('Method Scout', fallbackQuery, i),
            focus: 'Method-based deep search',
            initialQuery: fallbackQuery
          });
        }
      }
      if (sectors.length > maxAgents) {
        const trimmed = sectors.slice(0, maxAgents);
        if (subtopicSectors.length > maxAgents) {
          logOverseer(
            'PHASE 1: AGENT CAP',
            'subtopic packs exceed cap',
            'trim sector list',
            `cap ${maxAgents}, packs ${subtopicSectors.length}`,
            'warning'
          );
        }
        sectors = trimmed;
      }
      sectors.forEach((s: any) => usedQueries.add(s.initialQuery));

      // --- PHASE 2: MULTI-ROUND SEARCH LOOP ---
      const methodTemplates = isAddressLike(topic) ? METHOD_TEMPLATES_ADDRESS : METHOD_TEMPLATES_GENERAL;
      const methodQueriesBase = tacticPackQueries.length > 0
        ? tacticPackQueries
        : uniqueList(methodTemplates.flatMap(t => (addressLike ? topicVariants : [topic]).map(value => t.replace('{topic}', value))));
      if (tacticPackQueries.length === 0) {
        methodQueriesBase.forEach(q => registerMethodQuery(q, { source: 'method_template_fallback' }));
      }
      const methodQueriesFromKB = uniqueList(
        (addressLike ? topicVariants : [topic]).flatMap(value => knowledgeBase.domains.map(d => `site:${d} ${value}`))
      );
      const methodQueriesFromKBMethods = uniqueList(
        (knowledgeBase.methods || []).flatMap((q) =>
          q.includes('{topic}')
            ? (addressLike ? topicVariants : [topic]).map(value => q.replace('{topic}', value))
            : [q]
        )
      );
      methodQueriesFromKB.forEach(q => registerMethodQuery(q, { source: 'knowledge_base_domain' }));
      methodQueriesFromKBMethods.forEach(q => registerMethodQuery(q, { source: 'knowledge_base_method' }));
      methodCandidateQueries.forEach(q => registerMethodQuery(q, { source: 'llm_method_discovery' }));
      const methodQueries = uniqueList([
        ...methodQueriesBase,
        ...methodQueriesFromKB,
        ...methodQueriesFromKBMethods,
        ...methodCandidateQueries
      ]).slice(0, Math.max(maxMethodAgents, maxMethodAgents * maxRounds));

      logOverseer(
        'PHASE 2: LOOP CONFIG',
        forceExhaustion ? 'forceExhaustion enabled' : 'forceExhaustion disabled',
        `minRounds ${minRounds}, maxRounds ${maxRounds}`,
        `thresholds diminish>=${earlyStopDiminishingScore.toFixed(2)} novelty<=${earlyStopNoveltyRatio.toFixed(2)} newDomains<=${earlyStopNewDomains} newSources<=${earlyStopNewSources}`,
        'info'
      );

      const shouldStopAfterRound = (round: number, metrics: ExhaustionMetrics) => {
        if (forceExhaustion) return false;
        if (round < minRounds) return false;
        if (metrics.diminishingReturnsScore < earlyStopDiminishingScore) return false;
        const lowNovelty = metrics.queryNoveltyRatio <= earlyStopNoveltyRatio;
        const lowSources = metrics.newSources <= earlyStopNewSources;
        const lowDomains = metrics.newDomains <= earlyStopNewDomains;
        return lowNovelty || (lowSources && lowDomains);
      };

      let loopStopReason: string | null = null;
      let loopStopDetail: string | null = null;
      let loopStopRound: number | null = null;

      for (let round = 1; round <= maxRounds; round += 1) {
        ensureActive();
        const roundQueries: string[] = [];
        const roundSources: string[] = [];
        const roundSectors = round === 1 ? sectors : [];

        if (roundSectors.length > 0) {
          logOverseer(
            `PHASE 2: DEEP DRILL (ROUND ${round}/${maxRounds})`,
            'run recursive analysis',
            `spawn ${roundSectors.length} agents`,
            `queries ${roundSectors.map(s => s.initialQuery).join(' | ')}`,
            'action'
          );
          roundSectors.forEach((s: any) => roundQueries.push(s.initialQuery));
          const agentPromises = roundSectors.map(async (sector: any, index: number) => {
            // Stagger starts slightly to avoid instant rate limit hits (though unlikely with client-side)
            await wait(index * 1000, signal);
            ensureActive();

            const agentId = generateId();
            const agent: Agent = {
              id: agentId,
              name: sector.name,
              type: AgentType.RESEARCHER,
              status: AgentStatus.SEARCHING,
              task: sector.focus,
              reasoning: [`Starting Level 1 Search: ${sector.initialQuery}`],
              findings: [],
              parentId: overseerId
            };
            addAgent(agent);
            addLog(agentId, agent.name, `Deployed for: ${sector.focus}`, 'info');

            // The "10x" Loop: Broad -> Analyze -> verify -> verification searches
            const result = await runSafely(performDeepResearch(
              agent.name,
              sector.focus,
              sector.initialQuery,
              (msg) => addLog(agentId, agent.name, msg, 'info'),
              { modelOverrides, l1Role: 'deep_research_l1', l2Role: 'deep_research_l2', signal }
            ));
            roundSources.push(...result.sources.map(s => s.uri).filter(Boolean));

            enqueueTaxonomyGrowth({
              agentId,
              agentName: agent.name,
              focus: sector.focus,
              resultText: result.text || ''
            });

            const newFinding: Finding = {
              source: agent.name,
              content: result.text,
              confidence: 0.9,
              url: result.sources.map(s => s.uri).join(', ') // Store all URLs
            };

            updateAgent(agentId, {
              status: AgentStatus.COMPLETE,
              findings: [newFinding],
              reasoning: [`Indexed ${result.sources.length} sources`, `Data Volume: ${result.text.length} chars`]
            });

            addLog(agentId, agent.name, `Sector Analysis Complete. Sources Vetted: ${result.sources.length}`, 'success');
            pushFinding({ ...newFinding, ...{ rawSources: result.sources } } as any);
          });

          await runSafely(Promise.all(agentPromises));
        }

        const maxAdditionalAgents = Math.max(0, maxAgents - roundSectors.length);
        const methodQueriesToRun = methodQueries
          .filter(q => !usedQueries.has(q))
          .slice(0, Math.min(maxAdditionalAgents, maxMethodAgents));
        methodQueriesToRun.forEach(q => {
          usedQueries.add(q);
          roundQueries.push(q);
        });

        if (methodQueriesToRun.length > 0) {
          logOverseer(
            `PHASE 2B: METHOD AUDIT (ROUND ${round}/${maxRounds})`,
            'expand coverage with independent queries',
            `spawn ${methodQueriesToRun.length} agents`,
            `queries ${methodQueriesToRun.join(' | ')}`,
            'action'
          );
          const methodAgentPromises = methodQueriesToRun.map(async (query: string, index: number) => {
            await wait(index * 700, signal);
            ensureActive();
            const agentId = generateId();
            const agent: Agent = {
              id: agentId,
              name: buildAgentNameForQuery(round === 1 ? 'Method Audit' : `Method Audit R${round}`, query, index),
              type: AgentType.RESEARCHER,
              status: AgentStatus.SEARCHING,
              task: 'Independent method audit',
              reasoning: [`Independent query: ${query}`],
              findings: [],
              parentId: overseerId
            };
            addAgent(agent);
            addLog(agentId, agent.name, `Deployed for: ${query}`, 'info');

            const result = await runSafely(performDeepResearch(
              agent.name,
              'Independent method audit',
              query,
              (msg) => addLog(agentId, agent.name, msg, 'info'),
              { modelOverrides, role: 'method_audit', signal }
            ));
            roundSources.push(...result.sources.map(s => s.uri).filter(Boolean));
            enqueueTaxonomyGrowth({
              agentId,
              agentName: agent.name,
              focus: 'Independent method audit',
              resultText: result.text || ''
            });
            methodQuerySources.set(query, result.sources.map(s => s.uri));

            const newFinding: Finding = {
              source: agent.name,
              content: result.text,
              confidence: 0.85,
              url: result.sources.map(s => s.uri).join(', ')
            };

            updateAgent(agentId, {
              status: AgentStatus.COMPLETE,
              findings: [newFinding],
              reasoning: [`Indexed ${result.sources.length} sources`, `Data Volume: ${result.text.length} chars`]
            });

            addLog(agentId, agent.name, `Method Audit Complete. Sources Vetted: ${result.sources.length}`, 'success');
            pushFinding({ ...newFinding, ...{ rawSources: result.sources } } as any);
          });

          await runSafely(Promise.all(methodAgentPromises));
        } else if (round === 1) {
          logOverseer(
            'PHASE 2B: METHOD AUDIT',
            'agent cap reached',
            'skip method audit',
            `cap ${maxAgents}`,
            'warning'
          );
        }

        if (roundQueries.length === 0) {
          loopStopReason = 'no queries remaining';
          loopStopDetail = 'no sector or method queries available';
          loopStopRound = round;
          break;
        }

        const metrics = recordExhaustionRound(exhaustionTracker, `round_${round}`, roundQueries, roundSources);
        logOverseer(
          `PHASE 2: EXHAUSTION METRICS (ROUND ${round}/${maxRounds})`,
          'evaluate stop thresholds',
          `novelty ${metrics.queryNoveltyRatio.toFixed(2)} newDomains ${metrics.newDomains}/${metrics.totalDomains} newSources ${metrics.newSources}/${metrics.totalSources}`,
          `diminishing ${metrics.diminishingReturnsScore.toFixed(2)} queries ${metrics.uniqueQueries}/${metrics.totalQueries}`,
          'info'
        );
        const baseStop = shouldStopAfterRound(round, metrics);
        if (baseStop) {
          const verticalGate = evaluateVerticalExhaustion({
            topic,
            selectedVerticalIds,
            nameVariants,
            usedQueries,
            findings: findingsRef.current as Array<{ content?: string; rawSources?: any[] }>,
            addressLike: isAddressLike(topic),
            companyDomainHint,
            brandDomainHint
          });
          if (verticalGate.blockEarlyStop) {
            logOverseer(
              'PHASE 2: EXHAUSTION GATE',
              'override early stop',
              'continue search',
              verticalGate.reasons.join(' | '),
              'info'
            );
          } else {
            loopStopReason = 'early stop thresholds met';
            loopStopDetail = `round ${round} met novelty/domains/sources thresholds`;
            loopStopRound = round;
            break;
          }
        }
      }

      if (!loopStopReason) {
        loopStopReason = 'max rounds reached';
        loopStopDetail = `completed ${maxRounds} rounds`;
        loopStopRound = maxRounds;
      }
      if (loopStopReason) {
        const detail = loopStopRound ? `${loopStopDetail || ''} (round ${loopStopRound})`.trim() : (loopStopDetail || undefined);
        logOverseer(
          'PHASE 2: LOOP EXIT',
          loopStopReason,
          'halt additional rounds',
          detail,
          'info'
        );
      }

      // --- PHASE 3: CROSS-EXAMINATION (GAP FILL) ---
      updateAgent(overseerId, { status: AgentStatus.ANALYZING });
      logOverseer(
        'PHASE 3: RED TEAM',
        'audit for contradictions + gaps',
        'analyze aggregate findings with taxonomy context',
        undefined,
        'action'
      );
      
      const allFindingsText = findingsRef.current.map(f => f.content).join('\n');
      const critique = await runSafely(critiqueAndFindGaps(
        topic,
        allFindingsText,
        researchContextText,
        modelOverrides,
        requestOptions
      ));
      const latestMetrics = exhaustionTracker.rounds[exhaustionTracker.rounds.length - 1];
      const exhaustionScore = latestMetrics ? computeExhaustionScore(latestMetrics) : 0;
      const isExhausted = latestMetrics ? exhaustionScore >= earlyStopDiminishingScore : false;

      if ((forceExhaustion || !isExhausted) && critique.newMethod) {
         logOverseer(
           'PHASE 3: RED TEAM',
           'gap detected',
           'spawn gap-fill agent',
           critique.gapAnalysis || 'gap identified',
           'warning'
         );
         
         const gapAgentId = generateId();
         const gapAgent: Agent = {
            id: gapAgentId,
            name: `Gap Hunter: ${critique.newMethod.name}`,
            type: AgentType.RESEARCHER,
            status: AgentStatus.SEARCHING,
            task: critique.newMethod.task,
            reasoning: [`Targeting Blindspot: ${critique.newMethod.query}`],
            findings: [],
            parentId: overseerId
         };
         addAgent(gapAgent);
         
         const gapSources: string[] = [];
         // Use Deep Research even for the gap fill
         const gapResult = await runSafely(performDeepResearch(
             gapAgent.name, 
             critique.newMethod.task, 
             critique.newMethod.query, 
             (msg) => addLog(gapAgentId, gapAgent.name, msg, 'info'),
             { modelOverrides, role: 'gap_hunter', signal }
         ));
         gapSources.push(...gapResult.sources.map(s => s.uri).filter(Boolean));

         enqueueTaxonomyGrowth({
           agentId: gapAgentId,
           agentName: gapAgent.name,
           focus: critique.newMethod.task,
           resultText: gapResult.text || ''
         });

         const gapFinding = {
             source: gapAgent.name,
             content: gapResult.text,
             confidence: 0.9,
             rawSources: gapResult.sources
         };
         updateAgent(gapAgentId, { status: AgentStatus.COMPLETE });
         pushFinding(gapFinding as any);
         recordExhaustionRound(
           exhaustionTracker,
           'gap_fill',
           [critique.newMethod.query],
           gapSources
         );
      } else if (critique.newMethod) {
        logOverseer(
          'PHASE 3: RED TEAM',
          'gap detected but exhaustion high',
          'skip gap-fill agent',
          `exhaustionScore ${exhaustionScore.toFixed(2)}`,
          'info'
        );
      } else {
        logOverseer(
          'PHASE 3: RED TEAM',
          'no critical gaps detected',
          'proceed to exhaustion test',
          `exhaustionScore ${exhaustionScore.toFixed(2)}`,
          'success'
        );
      }

      // --- PHASE 3B: EXHAUSTION TEST (INDEPENDENT SEARCH) ---
      const currentSources = findingsRef.current.flatMap((f: any) => f.rawSources || []);
      const currentDomainCount = new Set(currentSources.map((s: any) => normalizeDomain(s.uri))).size;
      const shouldExhaust =
        forceExhaustion ||
        !isExhausted ||
        currentDomainCount < Math.max(6, Math.floor(minAgents / 2));

      if (shouldExhaust) {
        const remainingCapacity = Math.max(0, maxAgents - findingsRef.current.length);
        const exhaustTemplates = isAddressLike(topic) ? METHOD_TEMPLATES_ADDRESS : METHOD_TEMPLATES_GENERAL;
        const exhaustBase = tacticPackQueries.length > 0
          ? tacticPackQueries
          : uniqueList(exhaustTemplates.flatMap(t => (addressLike ? topicVariants : [topic]).map(value => t.replace('{topic}', value))));
        const exhaustFromDomains = uniqueList(
          (addressLike ? topicVariants : [topic]).flatMap(value => knowledgeBase.domains.map(d => `site:${d} ${value}`))
        );
        const exhaustFromMethods = uniqueList(
          (knowledgeBase.methods || []).flatMap((q) =>
            q.includes('{topic}')
              ? (addressLike ? topicVariants : [topic]).map(value => q.replace('{topic}', value))
              : [q]
          )
        );
        const exhaustQueries = uniqueList([...exhaustBase, ...exhaustFromDomains, ...exhaustFromMethods])
          .filter(q => !usedQueries.has(q))
          .slice(0, Math.min(remainingCapacity, maxMethodAgents));

        if (exhaustQueries.length > 0) {
          logOverseer(
            'PHASE 3B: EXHAUSTION TEST',
            'validate completeness',
            `spawn ${exhaustQueries.length} scouts`,
            `queries ${exhaustQueries.join(' | ')}`,
            'action'
          );
          const phase3BSources: string[] = [];
          const exhaustPromises = exhaustQueries.map(async (query: string, index: number) => {
            await wait(index * 700, signal);
            ensureActive();
            const agentId = generateId();
            const agent: Agent = {
              id: agentId,
              name: buildAgentNameForQuery('Exhaustion Scout', query, index),
              type: AgentType.RESEARCHER,
              status: AgentStatus.SEARCHING,
              task: 'Exhaustion test',
              reasoning: [`Independent query: ${query}`],
              findings: [],
              parentId: overseerId
            };
            addAgent(agent);
            addLog(agentId, agent.name, `Deployed for: ${query}`, 'info');

            const result = await runSafely(performDeepResearch(
              agent.name,
              'Exhaustion test',
              query,
              (msg) => addLog(agentId, agent.name, msg, 'info'),
              { modelOverrides, role: 'exhaustion_scout', signal }
            ));
            phase3BSources.push(...result.sources.map(s => s.uri).filter(Boolean));
            enqueueTaxonomyGrowth({
              agentId,
              agentName: agent.name,
              focus: 'Exhaustion test',
              resultText: result.text || ''
            });
            methodQuerySources.set(query, result.sources.map(s => s.uri));

            const newFinding: Finding = {
              source: agent.name,
              content: result.text,
              confidence: 0.85,
              url: result.sources.map(s => s.uri).join(', ')
            };

            updateAgent(agentId, {
              status: AgentStatus.COMPLETE,
              findings: [newFinding],
              reasoning: [`Indexed ${result.sources.length} sources`, `Data Volume: ${result.text.length} chars`]
            });

            addLog(agentId, agent.name, `Exhaustion Scout Complete. Sources Vetted: ${result.sources.length}`, 'success');
            pushFinding({ ...newFinding, ...{ rawSources: result.sources } } as any);
            usedQueries.add(query);
          });

          await runSafely(Promise.all(exhaustPromises));
          recordExhaustionRound(exhaustionTracker, 'exhaustion_test', exhaustQueries, phase3BSources);
        } else {
          logOverseer(
            'PHASE 3B: EXHAUSTION TEST',
            'no remaining unique methods',
            'skip exhaustion scouts',
            undefined,
            'warning'
          );
        }
      }

      // --- PHASE 3C: EVIDENCE RECOVERY (ADDRESS-LIKE) ---
      if (addressLike) {
        const collectSources = () => findingsRef.current.flatMap((f: any) => Array.isArray(f.rawSources) ? f.rawSources : []);
        let evidenceStatus = evaluateEvidence(collectSources());
        if (!evidenceStatus.meetsAll) {
          logOverseer(
            'PHASE 3C: EVIDENCE RECOVERY',
            EVIDENCE_RECOVERY_ERROR_TAXONOMY.threshold_unmet.summary,
            'prioritize authoritative property records + GIS layers',
            `sources total ${evidenceStatus.totalSources}, authoritative ${evidenceStatus.authoritativeSources}, maxAuthorityScore ${evidenceStatus.maxAuthorityScore}`,
            'warning'
          );

          const recoveryQueries = buildEvidenceRecoveryQueries(slotValuesAny, addressDirectQueries);
          const scoredQueries = recoveryQueries
            .map(query => ({ query, score: scoreEvidenceRecoveryQuery(query) }))
            .sort((a, b) => b.score - a.score);
          const queryScoreMap = new Map(scoredQueries.map(item => [item.query, item.score]));

          const neededTotal = Math.max(0, MIN_EVIDENCE_TOTAL_SOURCES - evidenceStatus.totalSources);
          const neededAuthoritative = Math.max(0, MIN_EVIDENCE_AUTHORITATIVE_SOURCES - evidenceStatus.authoritativeSources);
          const targetQueries = Math.min(
            EVIDENCE_RECOVERY_MAX_QUERIES,
            Math.max(1, neededTotal + neededAuthoritative)
          );
          const candidateQueries = scoredQueries.filter(({ query }) => !usedQueries.has(query));
          const priorityQueries = candidateQueries.filter(({ score }) => score >= EVIDENCE_RECOVERY_PRIORITY_SCORE_MIN);
          const fallbackQueries = candidateQueries
            .filter(({ score }) => score < EVIDENCE_RECOVERY_PRIORITY_SCORE_MIN)
            .slice(0, EVIDENCE_RECOVERY_MAX_FALLBACK_QUERIES);
          const queriesToRun = [...priorityQueries, ...fallbackQueries]
            .slice(0, targetQueries)
            .map(item => item.query);

          if (queriesToRun.length === 0) {
            logOverseer(
              'PHASE 3C: EVIDENCE RECOVERY',
              'no recovery queries available',
              'skip recovery pass',
              'all candidate queries already used',
              'warning'
            );
          } else {
            const recoveryDeadline = Date.now() + EVIDENCE_RECOVERY_TOTAL_TIME_BUDGET_MS;
            let recoveryTimedOut = false;
            const recoverySources: string[] = [];
            for (const [index, query] of queriesToRun.entries()) {
              ensureActive();
              if (Date.now() >= recoveryDeadline) {
                recoveryTimedOut = true;
                break;
              }

              const queryScore = queryScoreMap.get(query) ?? 0;
              if (queryScore < EVIDENCE_RECOVERY_PRIORITY_SCORE_MIN
                && evidenceStatus.meetsAuthoritative
                && evidenceStatus.meetsAuthorityScore) {
                logOverseer(
                  'PHASE 3C: EVIDENCE RECOVERY',
                  'priority stopping rule triggered',
                  'skip low-priority recovery queries',
                  'authoritative thresholds already satisfied',
                  'info'
                );
                break;
              }

              usedQueries.add(query);

              const agentId = generateId();
              const agentName = buildAgentNameForQuery('Evidence Recovery', query, index);
              const agent: Agent = {
                id: agentId,
                name: agentName,
                type: AgentType.RESEARCHER,
                status: AgentStatus.SEARCHING,
                task: 'Evidence recovery',
                reasoning: [`Recovery query: ${query}`],
                findings: [],
                parentId: overseerId
              };
              addAgent(agent);
              addLog(agentId, agentName, `Evidence recovery query: ${query}`, 'info');

              const cacheKey = buildEvidenceRecoveryCacheKey(provider, topic, query);
              const cached = evidenceRecoveryCache[cacheKey];
              const cacheFresh = cached ? Date.now() - cached.timestamp <= EVIDENCE_RECOVERY_CACHE_TTL_MS : false;

              if (cached && cacheFresh && cached.sources.length > 0) {
                const cachedFinding: Finding = {
                  source: agentName,
                  content: cached.text || 'Cached evidence recovery result.',
                  confidence: 0.85,
                  url: cached.sources.map(s => s.uri).join(', ')
                };
                updateAgent(agentId, {
                  status: AgentStatus.COMPLETE,
                  findings: [cachedFinding],
                  reasoning: ['cache hit', `sources ${cached.sources.length}`]
                });
                addLog(agentId, agentName, `Cache hit. Sources: ${cached.sources.length}`, 'success');
                pushFinding({ ...cachedFinding, ...{ rawSources: cached.sources } } as any);
                recoverySources.push(...cached.sources.map(s => s.uri));
                evidenceStatus = evaluateEvidence(collectSources());
                if (evidenceStatus.meetsAll) {
                  break;
                }
                continue;
              }

              let attempt = 0;
              let result: { text: string; sources: NormalizedSource[] } | null = null;
              while (attempt < EVIDENCE_RECOVERY_MAX_ATTEMPTS) {
                ensureActive();
                if (Date.now() >= recoveryDeadline) {
                  recoveryTimedOut = true;
                  break;
                }
                attempt += 1;
                try {
                  result = await runSafely(performDeepResearch(
                    agentName,
                    'Evidence recovery',
                    query,
                    (msg) => addLog(agentId, agentName, msg, 'info'),
                    { modelOverrides, l1Role: 'deep_research_l1', l2Role: 'deep_research_l2', signal }
                  ));
                } catch (err: any) {
                  if (err?.name === 'AbortError') throw err;
                  result = null;
                }

                if (result && result.sources.length > 0) break;
                if (attempt < EVIDENCE_RECOVERY_MAX_ATTEMPTS) {
                  const delay = EVIDENCE_RECOVERY_BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 250;
                  if (Date.now() + delay >= recoveryDeadline) {
                    recoveryTimedOut = true;
                    break;
                  }
                  await wait(delay, signal);
                }
              }

              if (recoveryTimedOut) {
                updateAgent(agentId, {
                  status: AgentStatus.FAILED,
                  reasoning: ['time budget exceeded during evidence recovery']
                });
                break;
              }

              if (!result || result.sources.length === 0) {
                updateAgent(agentId, { status: AgentStatus.FAILED });
                logOverseer(
                  'PHASE 3C: EVIDENCE RECOVERY',
                  EVIDENCE_RECOVERY_ERROR_TAXONOMY.recovery_failed.summary,
                  'query failed',
                  query,
                  'warning'
                );
                continue;
              }

              const resultText = result.text || '';
              const trimmedText = resultText.length > EVIDENCE_RECOVERY_MAX_TEXT_CHARS
                ? `${resultText.slice(0, EVIDENCE_RECOVERY_MAX_TEXT_CHARS)}\n...[truncated]`
                : resultText;
              evidenceRecoveryCache[cacheKey] = {
                text: trimmedText,
                sources: result.sources,
                timestamp: Date.now()
              };
              evidenceRecoveryCache = pruneEvidenceRecoveryCache(evidenceRecoveryCache);
              saveEvidenceRecoveryCache(evidenceRecoveryCache);

              const recoveryFinding: Finding = {
                source: agentName,
                content: trimmedText,
                confidence: 0.85,
                url: result.sources.map(s => s.uri).join(', ')
              };
              updateAgent(agentId, {
                status: AgentStatus.COMPLETE,
                findings: [recoveryFinding],
                reasoning: [`Indexed ${result.sources.length} sources`, 'evidence recovery complete']
              });
              addLog(agentId, agentName, `Evidence recovery complete. Sources: ${result.sources.length}`, 'success');
              pushFinding({ ...recoveryFinding, ...{ rawSources: result.sources } } as any);
              recoverySources.push(...result.sources.map(s => s.uri));

              evidenceStatus = evaluateEvidence(collectSources());
              if (evidenceStatus.meetsAll) {
                break;
              }
            }

            if (recoveryTimedOut) {
              logOverseer(
                'PHASE 3C: EVIDENCE RECOVERY',
                EVIDENCE_RECOVERY_ERROR_TAXONOMY.recovery_timeout.summary,
                'time budget exceeded',
                `budget ${EVIDENCE_RECOVERY_TOTAL_TIME_BUDGET_MS}ms`,
                'warning'
              );
            }

            if (recoverySources.length > 0) {
              recordExhaustionRound(
                exhaustionTracker,
                'evidence_recovery',
                queriesToRun,
                recoverySources
              );
            }
          }

          evidenceStatus = evaluateEvidence(collectSources());
          if (!evidenceStatus.meetsAll) {
            logOverseer(
              'PHASE 3C: EVIDENCE RECOVERY',
              EVIDENCE_RECOVERY_ERROR_TAXONOMY.recovery_exhausted.summary,
              'thresholds still unmet',
              `sources total ${evidenceStatus.totalSources}, authoritative ${evidenceStatus.authoritativeSources}, maxAuthorityScore ${evidenceStatus.maxAuthorityScore}`,
              'warning'
            );
          } else {
            logOverseer(
              'PHASE 3C: EVIDENCE RECOVERY',
              'thresholds met after recovery',
              'resume synthesis',
              `sources total ${evidenceStatus.totalSources}, authoritative ${evidenceStatus.authoritativeSources}, maxAuthorityScore ${evidenceStatus.maxAuthorityScore}`,
              'success'
            );
          }
        }
      }

      // --- PHASE 4: GRAND SYNTHESIS ---
      updateAgent(overseerId, { status: AgentStatus.THINKING });
      logOverseer(
        'PHASE 4: GRAND SYNTHESIS',
        'compile report',
        'synthesize findings with citations',
        undefined,
        'info'
      );

      const allRawSources = findingsRef.current.flatMap((f: any) => f.rawSources || []);
      const allowedSources = uniqueList(allRawSources.map((s: any) => s.uri).filter(Boolean));
      const finalReportData = await runSafely(synthesizeGrandReport(
        topic,
        findingsRef.current,
        allowedSources,
        modelOverrides,
        requestOptions
      ));
      const rawText = (finalReportData as any)?.__rawText;
      if (rawText) {
        const providerLabel = provider === 'openai' ? 'openai' : 'gemini';
        logOverseer(
          'PHASE 4: SYNTHESIS',
          'non-JSON output',
          'persist raw output to sessionStorage',
          `keys overseer_synthesis_raw_${providerLabel}_initial/_retry`,
          'warning'
        );
      }
      
      // Calculate total unique sources across all agents
      const uniqueSourceCount = allowedSources.length;

      const baseReport = isReportLike(finalReportData)
        ? finalReportData
        : finalReportData && typeof finalReportData === 'object' && !(finalReportData as any).__rawText
          ? coerceReportData(finalReportData, topic)
          : null;

      let reportFromRaw: FinalReport | null = null;
      if (rawText) {
        const parsed = buildReportFromRawText(rawText, topic);
        if (parsed.report) {
          reportFromRaw = parsed.report;
        } else if (!looksLikeJsonText(rawText)) {
          const maxRawChars = 50000;
          const rawClean = dedupeParagraphs(rawText);
          const rawForReport = rawClean.length > maxRawChars ? `${rawClean.slice(0, maxRawChars)}\n...[truncated]` : rawClean;
          reportFromRaw = {
            title: baseReport?.title || `Deep Dive: ${topic}`,
            summary: "Synthesis returned unstructured output. See report sections.",
            sections: [{
              title: "Synthesis Output",
              content: rawForReport,
              sources: []
            }],
            provenance: {
              totalSources: 0,
              methodAudit: baseReport?.provenance?.methodAudit || DEFAULT_METHOD_AUDIT
            }
          };
        } else {
          reportFromRaw = {
            title: baseReport?.title || `Deep Dive: ${topic}`,
            summary: "Synthesis returned malformed JSON. The raw output is stored in sessionStorage for debugging.",
            sections: [{
              title: "Synthesis Output Unavailable",
              content: "The synthesis model returned malformed JSON. Please re-run the report or try a smaller topic. Raw output is stored in sessionStorage for debugging.",
              sources: []
            }],
            provenance: {
              totalSources: 0,
              methodAudit: baseReport?.provenance?.methodAudit || DEFAULT_METHOD_AUDIT
            }
          };
        }
      }

      const normalizedReport = reportFromRaw || baseReport || {
        title: `Deep Dive: ${topic}`,
        summary: "Synthesis output unavailable. Please re-run the report.",
        sections: [{
          title: "Synthesis Incomplete",
          content: "The model did not return a structured report. Try a smaller topic, or re-run with more sources.",
          sources: []
        }],
        provenance: {
          totalSources: 0,
          methodAudit: DEFAULT_METHOD_AUDIT
        }
      };

      const parsedSections = Array.isArray(normalizedReport.sections) ? normalizedReport.sections : [];
      const allowedSet = new Set(allowedSources);
      let filteredOutCount = 0;
      let sections = parsedSections.map((section: any) => {
        const sources = Array.isArray(section?.sources) ? section.sources.filter((s: string) => allowedSet.has(s)) : [];
        const removed = Array.isArray(section?.sources) ? section.sources.length - sources.length : 0;
        filteredOutCount += Math.max(0, removed);
        return { ...section, sources };
      });
      const parsedVisualizations = Array.isArray((normalizedReport as any)?.visualizations)
        ? (normalizedReport as any).visualizations
        : [];
      const visualizations = parsedVisualizations.map((viz: any) => {
        const sources = Array.isArray(viz?.sources) ? viz.sources.filter((s: string) => allowedSet.has(s)) : [];
        const removed = Array.isArray(viz?.sources) ? viz.sources.length - sources.length : 0;
        filteredOutCount += Math.max(0, removed);
        return { ...viz, sources };
      });
      if (filteredOutCount > 0) {
        logOverseer(
          'PHASE 4: SOURCE FILTER',
          'remove non-grounded links',
          `filtered ${filteredOutCount} sources`,
          'bibliography pruned',
          'warning'
        );
      }
      let summary = typeof normalizedReport.summary === 'string' && normalizedReport.summary.trim().length > 0
        ? normalizedReport.summary
        : "Summary generation failed.";

      if (sections.length === 0) {
        logOverseer(
          'PHASE 4: SYNTHESIS',
          'missing structured sections',
          'inject fallback section',
          undefined,
          'warning'
        );
        sections = [{
          title: "Synthesis Incomplete",
          content: "The model did not return a structured report. Try a smaller topic, or re-run with more sources.",
          sources: []
        }];
      }

      const reportTitle = normalizedReport.title || `Deep Dive: ${topic}`;
      let reportCandidate = {
        title: reportTitle,
        summary,
        sections,
        visualizations,
        provenance: {
          totalSources: uniqueSourceCount,
          methodAudit: normalizedReport.provenance?.methodAudit || DEFAULT_METHOD_AUDIT
        },
        schemaVersion: typeof (normalizedReport as any)?.schemaVersion === 'number' ? (normalizedReport as any).schemaVersion : 1
      };

      const validation = await runSafely(validateReport(
        topic,
        reportCandidate,
        allowedSources,
        modelOverrides,
        requestOptions
      ));
      const isValid = validation?.isValid === true;
      if (!isValid) {
        const issues = Array.isArray(validation?.issues)
          ? validation.issues.map((issue: any) => {
              if (typeof issue === 'string') return issue;
              try {
                return JSON.stringify(issue);
              } catch (_) {
                return String(issue);
              }
            })
          : [];
        logOverseer(
          'PHASE 4: VALIDATION',
          'report failed validation',
          'append issues to report',
          issues.slice(0, 3).join(' | ') || 'Unspecified issues',
          'warning'
        );
        sections = [
          ...sections,
          {
            title: "Validation Issues",
            content: issues.length > 0 ? issues.join('\n') : "Validation failed. Claims may be unsupported.",
            sources: []
          }
        ];
        reportCandidate = {
          ...reportCandidate,
          sections
        };
      }

      const reportSources = uniqueList(sections.flatMap((s: any) => Array.isArray(s?.sources) ? s.sources : []));
      const sourceMap = new Map((allRawSources as NormalizedSource[]).map(source => [source.uri, source]));
      const reportSourceDetails: NormalizedSource[] = reportSources.map((uri) => {
        const mapped = sourceMap.get(uri);
        if (mapped) return mapped;
        return {
          uri,
          title: '',
          domain: normalizeDomain(uri),
          provider: 'unknown',
          kind: 'unknown'
        };
      });
      const primaryRecordCoverage = addressLike
        ? evaluatePrimaryRecordCoverage(reportSourceDetails, buildJurisdictionFromSlots(slotValuesAny, addressLike))
        : undefined;
      if (primaryRecordCoverage) {
        reportCandidate = {
          ...reportCandidate,
          provenance: {
            ...reportCandidate.provenance,
            primaryRecordCoverage
          }
        };
        if (!primaryRecordCoverage.complete) {
          logOverseer(
            'PHASE 4: PRIMARY RECORDS',
            'primary records checklist incomplete',
            'suppress complete badge',
            `missing ${primaryRecordCoverage.missing.join(', ') || 'none'}`,
            'warning'
          );
        }
      }
      if (isValid) {
        const newDomains = uniqueList(reportSources.map((s: string) => normalizeDomain(s)));
        const validatedMethods = Array.from(methodQuerySources.entries())
          .filter(([_, sources]) => sources.some(src => reportSources.includes(src)))
          .map(([query]) => query);
        const mergedDomains = uniqueList([...(knowledgeBase.domains || []), ...newDomains]).slice(-300);
        const mergedMethods = uniqueList([...(knowledgeBase.methods || []), ...validatedMethods]).slice(-300);
        saveKnowledgeBase({
          domains: mergedDomains,
          methods: mergedMethods,
          lastUpdated: Date.now()
        });
      } else {
        logOverseer(
          'PHASE 4: KNOWLEDGE BASE',
          'skip update',
          'validation failed',
          undefined,
          'warning'
        );
      }

      setReportSafe(reportCandidate);
      
      updateAgent(overseerId, { status: AgentStatus.COMPLETE });
      logOverseer(
        'PHASE 4: COMPLETE',
        'final report ready',
        'deliver report to UI',
        undefined,
        'success'
      );

    } catch (e: any) {
      if (signal.aborted || runVersionRef.current !== runVersion || e?.name === 'AbortError') {
        return;
      }
      console.error(e);
      logOverseer(
        'PHASE 4: FAILURE',
        'system error',
        'abort run',
        e.message,
        'error'
      );
      updateAgent(overseerId, { status: AgentStatus.FAILED });
      if (e.message && (e.message.toLowerCase().includes("api key") || e.message.includes("401"))) {
        setIsRunningSafe(false);
      }
    }
  }, [skills]);

  return { agents, logs, report, isRunning, startResearch, resetRun, skills };
};
