const MODEL_ROLES = [
  'overseer_planning',
  'method_discovery',
  'sector_analysis',
  'deep_research_l1',
  'deep_research_l2',
  'method_audit',
  'gap_hunter',
  'exhaustion_scout',
  'critique',
  'synthesis',
  'validation'
];

const MODEL_NAME_PATTERN = /^[A-Za-z0-9._:-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SETTINGS_SCHEMA_VERSION = 1;

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const sanitizeModelOverrides = (overrides) => {
  if (!isPlainObject(overrides)) return {};
  const sanitized = {};
  for (const role of MODEL_ROLES) {
    const raw = overrides[role];
    if (typeof raw !== 'string') continue;
    const value = raw.trim();
    if (!value || !MODEL_NAME_PATTERN.test(value)) continue;
    sanitized[role] = value;
  }
  return sanitized;
};

export const sanitizeAllowlistEntries = (entries) => {
  const rawEntries = Array.isArray(entries) ? entries : [];
  const seen = new Set();
  const sanitized = [];
  for (const entry of rawEntries) {
    if (typeof entry !== 'string') continue;
    const value = entry.trim().toLowerCase();
    if (!value || !EMAIL_PATTERN.test(value)) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    sanitized.push(value);
  }
  return sanitized;
};

export const sanitizeRunConfig = (rawRunConfig, defaults) => {
  const base = isPlainObject(rawRunConfig) ? rawRunConfig : {};
  const fallback = isPlainObject(defaults) ? defaults : {};

  const minAgents = Math.max(1, Math.floor(toNumber(base.minAgents, fallback.minAgents)));
  const maxAgents = Math.max(minAgents, Math.floor(toNumber(base.maxAgents, fallback.maxAgents || minAgents)));
  const maxMethodAgents = Math.max(1, Math.floor(toNumber(base.maxMethodAgents, fallback.maxMethodAgents || 1)));
  const minRounds = Math.max(1, Math.floor(toNumber(base.minRounds, fallback.minRounds || 1)));
  const maxRounds = Math.max(minRounds, Math.floor(toNumber(base.maxRounds, fallback.maxRounds || minRounds)));

  const earlyStopDiminishingScore = clamp(
    toNumber(base.earlyStopDiminishingScore, fallback.earlyStopDiminishingScore || 0),
    0,
    1
  );
  const earlyStopNoveltyRatio = clamp(
    toNumber(base.earlyStopNoveltyRatio, fallback.earlyStopNoveltyRatio || 0),
    0,
    1
  );
  const earlyStopNewDomains = Math.max(0, Math.floor(toNumber(base.earlyStopNewDomains, fallback.earlyStopNewDomains || 0)));
  const earlyStopNewSources = Math.max(0, Math.floor(toNumber(base.earlyStopNewSources, fallback.earlyStopNewSources || 0)));

  return {
    minAgents,
    maxAgents,
    maxMethodAgents,
    forceExhaustion: base.forceExhaustion === true,
    minRounds,
    maxRounds,
    earlyStopDiminishingScore,
    earlyStopNoveltyRatio,
    earlyStopNewDomains,
    earlyStopNewSources
  };
};

export const buildUniversalSettingsPayload = (input) => {
  const provider = input?.provider === 'openai' ? 'openai' : 'google';
  const runConfigDefaults = input?.defaults?.runConfig || input?.runConfig || {};
  const runConfig = sanitizeRunConfig(input?.runConfig, runConfigDefaults);
  const modelOverrides = sanitizeModelOverrides(input?.modelOverrides);
  const accessAllowlist = sanitizeAllowlistEntries(input?.accessAllowlist);
  const payload = {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    provider,
    runConfig,
    modelOverrides
  };
  if (Object.prototype.hasOwnProperty.call(input || {}, 'accessAllowlist')) {
    payload.accessAllowlist = accessAllowlist;
  }
  return payload;
};

export const normalizeUniversalSettingsPayload = (rawPayload, defaults) => {
  if (!isPlainObject(rawPayload)) return null;
  const rawVersion = Number(rawPayload.schemaVersion ?? SETTINGS_SCHEMA_VERSION);
  if (rawVersion !== SETTINGS_SCHEMA_VERSION) return null;
  const provider = rawPayload.provider === 'openai' || rawPayload.provider === 'google'
    ? rawPayload.provider
    : (defaults?.provider === 'openai' ? 'openai' : 'google');

  const runConfig = sanitizeRunConfig(rawPayload.runConfig, defaults?.runConfig || {});
  const modelOverrides = sanitizeModelOverrides(rawPayload.modelOverrides);
  const hasAllowlist = Object.prototype.hasOwnProperty.call(rawPayload, 'accessAllowlist');
  const accessAllowlist = hasAllowlist ? sanitizeAllowlistEntries(rawPayload.accessAllowlist) : undefined;

  const payload = {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    provider,
    runConfig,
    modelOverrides
  };
  if (hasAllowlist) {
    payload.accessAllowlist = accessAllowlist;
  }
  return payload;
};
