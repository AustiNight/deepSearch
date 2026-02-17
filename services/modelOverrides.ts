import { MODEL_OVERRIDE_STORAGE_KEY, OPENAI_MODEL_FAST, OPENAI_MODEL_REASONING } from "../constants";
import type { ModelOverrides, ModelRole } from "../types";

const MODEL_ROLES: ModelRole[] = [
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

const cleanModel = (value?: string) => (typeof value === "string" ? value.trim() : "");

export const getOpenAIModelDefaults = (): Record<ModelRole, string> => {
  const fast = (process.env.OPENAI_MODEL_FAST || OPENAI_MODEL_FAST).trim();
  const reasoning = (process.env.OPENAI_MODEL_REASONING || OPENAI_MODEL_REASONING).trim();
  return {
    overseer_planning: fast,
    method_discovery: fast,
    sector_analysis: reasoning,
    deep_research_l1: fast,
    deep_research_l2: fast,
    method_audit: fast,
    gap_hunter: fast,
    exhaustion_scout: fast,
    critique: reasoning,
    synthesis: fast,
    validation: reasoning
  };
};

export const resolveModelForRole = (
  role: ModelRole,
  overrides: ModelOverrides | undefined,
  defaults: Record<ModelRole, string>
) => {
  const override = cleanModel(overrides?.[role]);
  if (override) return override;
  return cleanModel(defaults?.[role]);
};

export const sanitizeModelOverrides = (overrides?: Partial<ModelOverrides> | null): ModelOverrides => {
  const sanitized: ModelOverrides = {};
  if (!overrides || typeof overrides !== "object") return sanitized;
  for (const role of MODEL_ROLES) {
    const value = cleanModel(overrides[role]);
    if (value) sanitized[role] = value;
  }
  return sanitized;
};

export const loadModelOverrides = (): ModelOverrides => {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(MODEL_OVERRIDE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return sanitizeModelOverrides(parsed);
  } catch (_) {
    return {};
  }
};

export const saveModelOverrides = (overrides: ModelOverrides) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const sanitized = sanitizeModelOverrides(overrides);
    window.localStorage.setItem(MODEL_OVERRIDE_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (_) {
    return;
  }
};
