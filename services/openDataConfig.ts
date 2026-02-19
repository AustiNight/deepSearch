import type { OpenDataRuntimeConfig, OpenDataFeatureFlags, OpenDataAuthConfig } from "../types";
import { COMPLIANCE_POLICY } from "../data/compliancePolicy";
import {
  clearOptionalKeys,
  clearOpenDataSettings,
  getOptionalKeysPersistencePreference,
  readOpenDataSettings,
  readOptionalKeys,
  setOptionalKeysPersistencePreference,
  writeOpenDataSettings,
  writeOptionalKeys
} from "./storagePolicy";

export const getOpenDataPersistencePreference = () => getOptionalKeysPersistencePreference();

export const setOpenDataPersistencePreference = (persist: boolean) => {
  setOptionalKeysPersistencePreference(persist);
};

export const clearOpenDataPersistentConfig = () => {
  clearOptionalKeys("persistent");
};

const defaultFlags: OpenDataFeatureFlags = {
  autoIngestion: false,
  evidenceRecovery: true,
  gatingEnforcement: true,
  usOnlyAddressPolicy: true
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
  const settingsRecord = readOpenDataSettings();
  const auth = readOptionalKeys();
  const hasAuth = Boolean(
    auth?.socrataAppToken
    || auth?.arcgisApiKey
    || auth?.geocodingEmail
    || auth?.geocodingKey
  );
  if (!settingsRecord && !hasAuth) return null;
  return mergeConfig({
    ...(settingsRecord?.config || {}),
    auth
  });
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
        : defaultConfig.featureFlags.gatingEnforcement,
      usOnlyAddressPolicy: typeof input.featureFlags?.usOnlyAddressPolicy === "boolean"
        ? input.featureFlags.usOnlyAddressPolicy
        : defaultConfig.featureFlags.usOnlyAddressPolicy
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
  writeOpenDataSettings({
    zeroCostMode: config.zeroCostMode,
    allowPaidAccess: config.allowPaidAccess,
    featureFlags: config.featureFlags
  });
  writeOptionalKeys(config.auth, { persist: options?.persist });
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
  clearOpenDataSettings();
  clearOptionalKeys("all");
  return memoryConfig;
};
