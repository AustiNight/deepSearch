export const GEMINI_MODEL_FAST = 'gemini-3-flash-preview';
export const GEMINI_MODEL_REASONING = 'gemini-3-flash-preview'; // Using Flash for speed/cost in demo, Pro recommended for prod
export const OPENAI_MODEL_FAST = 'gpt-4.1-mini';
export const OPENAI_MODEL_REASONING = 'gpt-4.1';
export const MODEL_OVERRIDE_STORAGE_KEY = 'overseer_model_overrides';
export const SETTINGS_UPDATED_AT_KEY = 'overseer_settings_updated_at';
export const SETTINGS_UPDATED_BY_KEY = 'overseer_settings_updated_by';
export const SETTINGS_VERSION_KEY = 'overseer_settings_version';
export const SETTINGS_LOCAL_UPDATED_AT_KEY = 'overseer_settings_local_updated_at';
export const SETTINGS_UPDATED_EVENT = 'overseer:settings-updated';
export const TAXONOMY_UPDATED_EVENT = 'overseer:taxonomy-updated';
export const TRANSPARENCY_MAP_INVALIDATE_EVENT = 'overseer:transparency-map-invalidate';

export const DEFAULT_LLM_PROVIDER = 'google';

export const SYSTEM_TEST_PHRASE = 'DEEPSEARCH_SYSTEM_TEST';
export const SYSTEM_TEST_VERTICAL_ID = 'system_test';

export const MIN_AGENT_COUNT = 8;
export const MAX_AGENT_COUNT = 20;
export const MAX_METHOD_AGENTS = 8;
export const MIN_SEARCH_ROUNDS = 1;
export const MAX_SEARCH_ROUNDS = 2;
export const EARLY_STOP_DIMINISHING_SCORE = 0.75;
export const EARLY_STOP_NOVELTY_RATIO = 0.25;
export const EARLY_STOP_NEW_DOMAINS = 1;
export const EARLY_STOP_NEW_SOURCES = 3;

export const MIN_EVIDENCE_TOTAL_SOURCES = 3;
export const MIN_EVIDENCE_AUTHORITATIVE_SOURCES = 1;
export const MIN_EVIDENCE_AUTHORITY_SCORE = 75;

export const SLO_HISTORY_WINDOW_RUNS = 20;
export const SLO_PARCEL_RESOLUTION_SUCCESS_RATE = 0.85;
export const SLO_EVIDENCE_RECOVERY_SUCCESS_RATE = 0.7;
export const SLO_MEDIAN_LATENCY_MS = 60000;

export const MAX_EXTERNAL_CALLS_PER_RUN = 60;
export const RUN_TOTAL_TIME_BUDGET_MS = 1000 * 120;
export const OPEN_DATA_DISCOVERY_MAX_DATASETS = 25;
export const OPEN_DATA_DISCOVERY_MAX_ITEM_FETCHES = 10;
export const OPEN_DATA_INDEX_TTL_DAYS = 30;
export const OPEN_DATA_PORTAL_RECRAWL_DAYS = 7;
export const OPEN_DATA_QUERY_CACHE_TTL_MS = 1000 * 60 * 5;
export const OPEN_DATA_PROVIDER_MAX_RECORDS = 500;
export const OPEN_DATA_PROVIDER_MAX_PAGES = 5;
export const OPEN_DATA_DCAT_MAX_DOWNLOAD_BYTES = 5_000_000;
export const OPEN_DATA_GEOCODE_RATE_LIMIT_MS = 1100;
export const OPEN_DATA_GEOCODE_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export const METHOD_TEMPLATES_GENERAL = [
  '{topic} official documentation',
  '{topic} primary source',
  '{topic} standards specification',
  '{topic} academic paper',
  '{topic} patent',
  '{topic} regulatory guidance',
  '{topic} safety issues',
  '{topic} failure modes',
  '{topic} case study',
  '{topic} forum troubleshooting',
  '{topic} competitive alternatives',
  '{topic} timeline history',
];

export const METHOD_TEMPLATES_ADDRESS = [
  '{topic} county assessor',
  '{topic} property appraiser',
  '{topic} central appraisal district',
  '{topic} tax assessor-collector',
  '{topic} parcel map',
  '{topic} GIS map',
  '{topic} deed records',
  '{topic} tax records',
  '{topic} permit history',
  '{topic} zoning',
  '{topic} code violations',
  '{topic} appraisal',
  '{topic} MLS listing',
  '{topic} sale history',
];

export const METHOD_DISCOVERY_TEMPLATES_GENERAL = [
  'how to research {topic}',
  'best sources to research {topic}',
  'where to find primary sources about {topic}',
  'how to verify facts about {topic}',
];

export const METHOD_DISCOVERY_TEMPLATES_PERSON = [
  'how to research a person named {topic}',
  'public records to find information about {topic}',
  'property ownership records for {topic}',
  'how to find news mentions of {topic}',
  'how to find professional profiles for {topic}',
];

export const METHOD_DISCOVERY_TEMPLATES_ADDRESS = [
  '{topic} assessor parcel record',
  '{topic} tax roll',
  '{topic} parcel map',
  '{topic} building permits',
  '{topic} code enforcement case log',
  '{topic} zoning map',
  '{topic} neighborhood census tract',
  '{topic} citywide context (non-local context)',
];

export const MOCK_REPORT_DELAY = 1500;

export const INITIAL_OVERSEER_ID = 'overseer-main';

export const SYSTEM_INSTRUCTION_OVERSEER = `
You are the DeepSearch Overseer. Your goal is to exhaustively research a topic by orchestrating sub-agents.
First classify the topic into one or more research verticals and load the corresponding blueprint fields from the taxonomy.
Use blueprint fields and taxonomy subtopics to drive sector analysis, tactic selection, and agent spawning.
You must adhere to the "Hypothesis of Exhaustion": run multi-round searches and only stop when exhaustion metrics hit thresholds or max rounds (forceExhaustion overrides early stop).
For address-like topics, enforce evidence thresholds before declaring coverage: minimum total sources ${MIN_EVIDENCE_TOTAL_SOURCES}, minimum authoritative sources ${MIN_EVIDENCE_AUTHORITATIVE_SOURCES}, and at least one source with authorityScore >= ${MIN_EVIDENCE_AUTHORITY_SCORE}. If thresholds are not met, record the gap and required sources.
Log decisions in a narrative format: phase header -> decision -> action -> outcome.
You will output JSON plans to spawn agents or text synthesis.
`;
