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
const BOOLEAN_DEFAULTS = {
  autoIngestion: true,
  evidenceRecovery: true,
  gatingEnforcement: true,
  usOnlyAddressPolicy: false,
  datasetTelemetryRanking: true,
  socrataPreferV3: false
};
const OPERATOR_DEFAULTS = {
  explorationRatio: 0.35,
  preferredDomainWeight: 0.7,
  noveltyFloor: 0.2,
  authorityFloor: 70,
  validationStrictness: "balanced",
  phaseBudgets: {
    phase05: 6,
    phase2b: 8,
    phase3b: 8
  },
  sourcePolicy: {
    preferred: {},
    suppressed: {},
    blocked: []
  }
};

export const SETTINGS_SCHEMA_VERSION = 1;

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const sanitizeDomainWeightMap = (raw) => {
  if (!isPlainObject(raw)) return {};
  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    const domain = String(key || "").trim().toLowerCase();
    if (!domain) continue;
    out[domain] = clamp(toNumber(value, 0), 0, 1);
  }
  return out;
};

const sanitizeDomainList = (raw) => {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  const out = [];
  for (const value of list) {
    const domain = String(value || "").trim().toLowerCase();
    if (!domain || seen.has(domain)) continue;
    seen.add(domain);
    out.push(domain);
  }
  return out;
};

export const sanitizeOperatorTuning = (rawTuning) => {
  if (!isPlainObject(rawTuning)) return { ...OPERATOR_DEFAULTS, phaseBudgets: { ...OPERATOR_DEFAULTS.phaseBudgets }, sourcePolicy: { preferred: {}, suppressed: {}, blocked: [] } };
  const base = rawTuning;
  const strictness = base.validationStrictness === "strict" || base.validationStrictness === "permissive"
    ? base.validationStrictness
    : "balanced";
  return {
    explorationRatio: clamp(toNumber(base.explorationRatio, OPERATOR_DEFAULTS.explorationRatio), 0, 1),
    preferredDomainWeight: clamp(toNumber(base.preferredDomainWeight, OPERATOR_DEFAULTS.preferredDomainWeight), 0, 1),
    noveltyFloor: clamp(toNumber(base.noveltyFloor, OPERATOR_DEFAULTS.noveltyFloor), 0, 1),
    authorityFloor: clamp(toNumber(base.authorityFloor, OPERATOR_DEFAULTS.authorityFloor), 0, 100),
    validationStrictness: strictness,
    phaseBudgets: {
      phase05: Math.max(1, Math.floor(toNumber(base.phaseBudgets?.phase05, OPERATOR_DEFAULTS.phaseBudgets.phase05))),
      phase2b: Math.max(1, Math.floor(toNumber(base.phaseBudgets?.phase2b, OPERATOR_DEFAULTS.phaseBudgets.phase2b))),
      phase3b: Math.max(1, Math.floor(toNumber(base.phaseBudgets?.phase3b, OPERATOR_DEFAULTS.phaseBudgets.phase3b)))
    },
    sourcePolicy: {
      preferred: sanitizeDomainWeightMap(base.sourcePolicy?.preferred),
      suppressed: sanitizeDomainWeightMap(base.sourcePolicy?.suppressed),
      blocked: sanitizeDomainList(base.sourcePolicy?.blocked)
    }
  };
};

export const sanitizeSourceLearning = (rawLearning, maxEntries = 300) => {
  const entries = Array.isArray(rawLearning) ? rawLearning : [];
  const out = [];
  const seen = new Set();
  for (const entry of entries) {
    if (!isPlainObject(entry)) continue;
    const domain = String(entry.domain || "").trim().toLowerCase();
    if (!domain || seen.has(domain)) continue;
    seen.add(domain);
    out.push({
      domain,
      runsSeen: Math.max(0, Math.floor(toNumber(entry.runsSeen, 0))),
      runsValidated: Math.max(0, Math.floor(toNumber(entry.runsValidated, 0))),
      citationSurvivalRate: clamp(toNumber(entry.citationSurvivalRate, 0), 0, 1),
      authorityAvg: clamp(toNumber(entry.authorityAvg, 0), 0, 100),
      recencyAvg: clamp(toNumber(entry.recencyAvg, 0), 0, 1),
      lastSeenAt: Math.max(0, Math.floor(toNumber(entry.lastSeenAt, Date.now())))
    });
  }
  return out
    .sort((a, b) => b.lastSeenAt - a.lastSeenAt)
    .slice(0, Math.max(10, maxEntries));
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
  const estimatedCallLatencyMs = Math.max(500, Math.floor(toNumber(base.estimatedCallLatencyMs, fallback.estimatedCallLatencyMs || 0)));

  const normalizePriorityWeights = (raw, defaults) => {
    const rawWeights = isPlainObject(raw) ? raw : {};
    const fallbackWeights = isPlainObject(defaults) ? defaults : {};
    const methodDefaults = isPlainObject(fallbackWeights.method) ? fallbackWeights.method : {};
    const sectorDefaults = isPlainObject(fallbackWeights.sector) ? fallbackWeights.sector : {};
    const methodRaw = isPlainObject(rawWeights.method) ? rawWeights.method : {};
    const sectorRaw = isPlainObject(rawWeights.sector) ? rawWeights.sector : {};
    const norm = (value, fallbackValue) => clamp(toNumber(value, fallbackValue), 0, 1);
    return {
      method: {
        llm_method_discovery: norm(methodRaw.llm_method_discovery, methodDefaults.llm_method_discovery ?? 0.95),
        address_direct: norm(methodRaw.address_direct, methodDefaults.address_direct ?? 0.9),
        knowledge_base_method: norm(methodRaw.knowledge_base_method, methodDefaults.knowledge_base_method ?? 0.75),
        knowledge_base_domain: norm(methodRaw.knowledge_base_domain, methodDefaults.knowledge_base_domain ?? 0.6),
        method_template_fallback: norm(methodRaw.method_template_fallback, methodDefaults.method_template_fallback ?? 0.45)
      },
      sector: {
        subtopicBoost: norm(sectorRaw.subtopicBoost, sectorDefaults.subtopicBoost ?? 0.2),
        verticalSeedBase: norm(sectorRaw.verticalSeedBase, sectorDefaults.verticalSeedBase ?? 0.3),
        rawSectorBase: norm(sectorRaw.rawSectorBase, sectorDefaults.rawSectorBase ?? 0.25),
        fallback: norm(sectorRaw.fallback, sectorDefaults.fallback ?? 0.15)
      }
    };
  };
  const priorityWeights = normalizePriorityWeights(base.priorityWeights, fallback.priorityWeights || {});

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
    earlyStopNewSources,
    estimatedCallLatencyMs,
    priorityWeights
  };
};

export const sanitizeKeyOverrides = (overrides) => {
  if (!isPlainObject(overrides)) return {};
  const google = typeof overrides.google === 'string' ? overrides.google.trim() : '';
  const openai = typeof overrides.openai === 'string' ? overrides.openai.trim() : '';
  const sanitized = {};
  if (google) sanitized.google = google;
  if (openai) sanitized.openai = openai;
  return sanitized;
};

export const sanitizeOpenDataAuth = (auth) => {
  if (!isPlainObject(auth)) return {};
  const sanitized = {};
  if (typeof auth.socrataAppToken === 'string' && auth.socrataAppToken.trim()) {
    sanitized.socrataAppToken = auth.socrataAppToken.trim();
  }
  if (typeof auth.arcgisApiKey === 'string' && auth.arcgisApiKey.trim()) {
    sanitized.arcgisApiKey = auth.arcgisApiKey.trim();
  }
  if (typeof auth.geocodingEmail === 'string' && auth.geocodingEmail.trim()) {
    sanitized.geocodingEmail = auth.geocodingEmail.trim();
  }
  return sanitized;
};

export const sanitizeOpenDataConfig = (config) => {
  if (!isPlainObject(config)) return null;
  const zeroCostMode = config.zeroCostMode === true;
  const allowPaidAccess = zeroCostMode ? false : config.allowPaidAccess === true;
  const featureFlags = isPlainObject(config.featureFlags) ? config.featureFlags : {};
  return {
    zeroCostMode,
    allowPaidAccess,
    featureFlags: {
      autoIngestion: typeof featureFlags.autoIngestion === 'boolean'
        ? featureFlags.autoIngestion
        : BOOLEAN_DEFAULTS.autoIngestion,
      evidenceRecovery: typeof featureFlags.evidenceRecovery === 'boolean'
        ? featureFlags.evidenceRecovery
        : BOOLEAN_DEFAULTS.evidenceRecovery,
      gatingEnforcement: typeof featureFlags.gatingEnforcement === 'boolean'
        ? featureFlags.gatingEnforcement
        : BOOLEAN_DEFAULTS.gatingEnforcement,
      usOnlyAddressPolicy: typeof featureFlags.usOnlyAddressPolicy === 'boolean'
        ? featureFlags.usOnlyAddressPolicy
        : BOOLEAN_DEFAULTS.usOnlyAddressPolicy,
      datasetTelemetryRanking: typeof featureFlags.datasetTelemetryRanking === 'boolean'
        ? featureFlags.datasetTelemetryRanking
        : BOOLEAN_DEFAULTS.datasetTelemetryRanking,
      socrataPreferV3: typeof featureFlags.socrataPreferV3 === 'boolean'
        ? featureFlags.socrataPreferV3
        : BOOLEAN_DEFAULTS.socrataPreferV3
    },
    auth: sanitizeOpenDataAuth(config.auth)
  };
};

export const buildUniversalSettingsPayload = (input) => {
  const provider = input?.provider === 'openai' ? 'openai' : 'google';
  const runConfigDefaults = input?.defaults?.runConfig || input?.runConfig || {};
  const runConfig = sanitizeRunConfig(input?.runConfig, runConfigDefaults);
  const modelOverrides = sanitizeModelOverrides(input?.modelOverrides);
  const accessAllowlist = sanitizeAllowlistEntries(input?.accessAllowlist);
  const keyOverrides = sanitizeKeyOverrides(input?.keyOverrides);
  const openDataCandidate = sanitizeOpenDataConfig(input?.openDataConfig) || {
    zeroCostMode: true,
    allowPaidAccess: false,
    featureFlags: { ...BOOLEAN_DEFAULTS },
    auth: sanitizeOpenDataAuth(input?.openDataAuth)
  };
  const payload = {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    provider,
    runConfig,
    modelOverrides,
    keyOverrides,
    openDataConfig: openDataCandidate
  };
  if (Object.prototype.hasOwnProperty.call(input || {}, "operatorTuning")) {
    payload.operatorTuning = sanitizeOperatorTuning(input?.operatorTuning);
  }
  if (Object.prototype.hasOwnProperty.call(input || {}, "sourceLearning")) {
    payload.sourceLearning = sanitizeSourceLearning(input?.sourceLearning);
  }
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
  const keyOverrides = sanitizeKeyOverrides(rawPayload.keyOverrides);
  const openDataConfig = sanitizeOpenDataConfig(rawPayload.openDataConfig) || {
    zeroCostMode: true,
    allowPaidAccess: false,
    featureFlags: { ...BOOLEAN_DEFAULTS },
    auth: sanitizeOpenDataAuth(null)
  };

  const payload = {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    provider,
    runConfig,
    modelOverrides,
    keyOverrides,
    openDataConfig
  };
  if (Object.prototype.hasOwnProperty.call(rawPayload, "operatorTuning")) {
    payload.operatorTuning = sanitizeOperatorTuning(rawPayload.operatorTuning);
  }
  if (Object.prototype.hasOwnProperty.call(rawPayload, "sourceLearning")) {
    payload.sourceLearning = sanitizeSourceLearning(rawPayload.sourceLearning);
  }
  if (hasAllowlist) {
    payload.accessAllowlist = accessAllowlist;
  }
  return payload;
};
