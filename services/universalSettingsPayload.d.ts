import type { LLMProvider, ModelOverrides, RunConfig, UniversalSettingsPayload } from '../types';

export const SETTINGS_SCHEMA_VERSION: 1;

export const sanitizeModelOverrides: (overrides: unknown) => ModelOverrides;
export const sanitizeAllowlistEntries: (entries: unknown) => string[];
export const sanitizeRunConfig: (rawRunConfig: unknown, defaults: RunConfig) => RunConfig;

export const buildUniversalSettingsPayload: (input: {
  provider: LLMProvider | string;
  runConfig: RunConfig;
  modelOverrides?: ModelOverrides | null;
  accessAllowlist?: string[] | null;
  defaults?: { runConfig: RunConfig };
}) => UniversalSettingsPayload;

export const normalizeUniversalSettingsPayload: (
  rawPayload: unknown,
  defaults: { provider: LLMProvider; runConfig: RunConfig }
) => UniversalSettingsPayload | null;
