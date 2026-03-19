import type {
  LLMProvider,
  ModelOverrides,
  OperatorTuning,
  OpenDataAuthConfig,
  OpenDataRuntimeConfig,
  RunConfig,
  SourceLearningStats,
  UniversalSettingsPayload
} from '../types';

export const SETTINGS_SCHEMA_VERSION: 1;

export const sanitizeModelOverrides: (overrides: unknown) => ModelOverrides;
export const sanitizeAllowlistEntries: (entries: unknown) => string[];
export const sanitizeRunConfig: (rawRunConfig: unknown, defaults: RunConfig) => RunConfig;
export const sanitizeOperatorTuning: (rawTuning: unknown) => OperatorTuning;
export const sanitizeSourceLearning: (rawLearning: unknown, maxEntries?: number) => SourceLearningStats[];

export const buildUniversalSettingsPayload: (input: {
  provider: LLMProvider | string;
  runConfig: RunConfig;
  modelOverrides?: ModelOverrides | null;
  accessAllowlist?: string[] | null;
  keyOverrides?: { google?: string | null; openai?: string | null } | null;
  openDataConfig?: OpenDataRuntimeConfig | null;
  openDataAuth?: OpenDataAuthConfig | null;
  operatorTuning?: OperatorTuning | null;
  sourceLearning?: SourceLearningStats[] | null;
  defaults?: { runConfig: RunConfig };
}) => UniversalSettingsPayload;

export const normalizeUniversalSettingsPayload: (
  rawPayload: unknown,
  defaults: { provider: LLMProvider; runConfig: RunConfig }
) => UniversalSettingsPayload | null;
