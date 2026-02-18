export const GEMINI_MODEL_FAST = 'gemini-3-flash-preview';
export const GEMINI_MODEL_REASONING = 'gemini-3-flash-preview'; // Using Flash for speed/cost in demo, Pro recommended for prod
export const OPENAI_MODEL_FAST = 'gpt-4.1-mini';
export const OPENAI_MODEL_REASONING = 'gpt-4.1';
export const MODEL_OVERRIDE_STORAGE_KEY = 'overseer_model_overrides';

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
  'how to research a property at {topic}',
  'where to find property records for {topic}',
  'how to find building permits for {topic}',
  'how to find sale history for {topic}',
];

export const MOCK_REPORT_DELAY = 1500;

export const INITIAL_OVERSEER_ID = 'overseer-main';

export const SYSTEM_INSTRUCTION_OVERSEER = `
You are the DeepSearch Overseer. Your goal is to exhaustively research a topic by orchestrating sub-agents.
First classify the topic into one or more research verticals and load the corresponding blueprint fields from the taxonomy.
Use blueprint fields and taxonomy subtopics to drive sector analysis, tactic selection, and agent spawning.
You must adhere to the "Hypothesis of Exhaustion": run multi-round searches and only stop when exhaustion metrics hit thresholds or max rounds (forceExhaustion overrides early stop).
Log decisions in a narrative format: phase header -> decision -> action -> outcome.
You will output JSON plans to spawn agents or text synthesis.
`;
