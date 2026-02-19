import type { OpenDataRuntimeConfig, OpenDataFeatureFlags, OpenDataAuthConfig } from "../types";
import { COMPLIANCE_POLICY } from "../data/compliancePolicy";

const STORAGE_KEY = "overseer_open_data_config";
const SESSION_STORAGE_KEY = "overseer_open_data_config_session";

const hasStorage = (storage?: Storage) => {
  if (!storage) return false;
  try {
    const testKey = "__open_data_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (_) {
    return false;
  }
};

const defaultFlags: OpenDataFeatureFlags = {
  autoIngestion: false,
  evidenceRecovery: true,
  gatingEnforcement: true
};

const defaultAuth: OpenDataAuthConfig = {};

const defaultConfig: OpenDataRuntimeConfig = {
  zeroCostMode: COMPLIANCE_POLICY.zeroCostMode,
  allowPaidAccess: false,
  featureFlags: defaultFlags,
  auth: defaultAuth
};

let memoryConfig: OpenDataRuntimeConfig | null = null;

const loadFromStorage = (): OpenDataRuntimeConfig | null => {
  if (typeof window === "undefined") return null;
  const storage = hasStorage(window.sessionStorage) ? window.sessionStorage : hasStorage(window.localStorage) ? window.localStorage : null;
  if (!storage) return null;
  const key = storage === window.sessionStorage ? SESSION_STORAGE_KEY : STORAGE_KEY;
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return mergeConfig(parsed as Partial<OpenDataRuntimeConfig>);
  } catch (_) {
    return null;
  }
};

const mergeConfig = (input: Partial<OpenDataRuntimeConfig>): OpenDataRuntimeConfig => {
  const zeroCostMode = typeof input.zeroCostMode === "boolean" ? input.zeroCostMode : defaultConfig.zeroCostMode;
  const allowPaidAccess = zeroCostMode
    ? false
    : typeof input.allowPaidAccess === "boolean"
      ? input.allowPaidAccess
      : defaultConfig.allowPaidAccess;

  return {
    zeroCostMode,
    allowPaidAccess,
    featureFlags: {
      autoIngestion: typeof input.featureFlags?.autoIngestion === "boolean"
        ? input.featureFlags.autoIngestion
        : defaultConfig.featureFlags.autoIngestion,
      evidenceRecovery: typeof input.featureFlags?.evidenceRecovery === "boolean"
        ? input.featureFlags.evidenceRecovery
        : defaultConfig.featureFlags.evidenceRecovery,
      gatingEnforcement: typeof input.featureFlags?.gatingEnforcement === "boolean"
        ? input.featureFlags.gatingEnforcement
        : defaultConfig.featureFlags.gatingEnforcement
    },
    auth: {
      socrataAppToken: input.auth?.socrataAppToken,
      arcgisApiKey: input.auth?.arcgisApiKey,
      geocodingEmail: input.auth?.geocodingEmail,
      geocodingKey: input.auth?.geocodingKey
    }
  };
};

const persistConfig = (config: OpenDataRuntimeConfig, options?: { persist?: boolean }) => {
  if (typeof window === "undefined") return;
  // Store in sessionStorage by default to reduce persistence of optional keys.
  const persist = options?.persist === true;
  const storage = persist && hasStorage(window.localStorage)
    ? window.localStorage
    : hasStorage(window.sessionStorage)
      ? window.sessionStorage
      : null;
  if (!storage) return;
  const key = storage === window.sessionStorage ? SESSION_STORAGE_KEY : STORAGE_KEY;
  try {
    storage.setItem(key, JSON.stringify(config));
  } catch (_) {
    // Ignore storage failures.
  }
};

export const getOpenDataConfig = (): OpenDataRuntimeConfig => {
  if (memoryConfig) return memoryConfig;
  const stored = loadFromStorage();
  if (stored) {
    memoryConfig = stored;
    return memoryConfig;
  }
  memoryConfig = { ...defaultConfig };
  return memoryConfig;
};

export const updateOpenDataConfig = (
  next: Partial<OpenDataRuntimeConfig>,
  options?: { persist?: boolean }
): OpenDataRuntimeConfig => {
  memoryConfig = mergeConfig({ ...(memoryConfig || defaultConfig), ...next });
  persistConfig(memoryConfig, options);
  return memoryConfig;
};

export const resetOpenDataConfig = () => {
  memoryConfig = { ...defaultConfig };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (_) {
      // ignore
    }
  }
  return memoryConfig;
};
