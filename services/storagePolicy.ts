import { MODEL_OVERRIDE_STORAGE_KEY, OPEN_DATA_INDEX_TTL_DAYS } from "../constants";
import type {
  OpenDataAuthConfig,
  OpenDataFeatureFlags,
  OpenDataRuntimeConfig,
  OpenDatasetIndex
} from "../types";
import {
  SETTINGS_LOCAL_UPDATED_AT_KEY,
  SETTINGS_UPDATED_AT_KEY,
  SETTINGS_UPDATED_BY_KEY,
  SETTINGS_VERSION_KEY
} from "../constants";

type StorageTier = "memory" | "session" | "local";

type OptionalKeyPersistRecord = {
  schemaVersion: number;
  consentVersion: number;
  persist: boolean;
  updatedAt: string;
};

export type SettingsMetadata = {
  updatedAt: string | null;
  updatedBy: string | null;
  version: number | null;
  localUpdatedAt: string | null;
};

export type OptionalKeysRecord = {
  schemaVersion: number;
  updatedAt: string;
  auth: OpenDataAuthConfig;
};

export type OpenDataSettingsRecord = {
  schemaVersion: number;
  updatedAt: string;
  config: Pick<OpenDataRuntimeConfig, "zeroCostMode" | "allowPaidAccess" | "featureFlags">;
};

export type GeocodeCacheEntry = {
  value: unknown;
  expiresAt: number;
};

export type GeocodeCacheRecord = Record<string, GeocodeCacheEntry>;

export type EvidenceRecoveryCacheEntry = {
  text: string;
  sources: unknown[];
  timestamp: number;
};

export type EvidenceRecoveryCacheRecord = Record<string, EvidenceRecoveryCacheEntry>;

type StorageWriteResult = {
  storedIn: StorageTier;
  blockedLocal?: boolean;
};

const DAY_MS = 1000 * 60 * 60 * 24;

const SETTINGS_METADATA_SCHEMA_VERSION = 1;
const OPTIONAL_KEYS_SCHEMA_VERSION = 1;
const OPTIONAL_KEYS_PERSIST_SCHEMA_VERSION = 1;
const OPTIONAL_KEYS_CONSENT_VERSION = 1;
const OPEN_DATA_SETTINGS_SCHEMA_VERSION = 1;
export const OPEN_DATA_INDEX_SCHEMA_VERSION = 1;

export const EVIDENCE_RECOVERY_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
export const EVIDENCE_RECOVERY_MAX_CACHE_ENTRIES = 200;
export const GEOCODE_CACHE_MAX_ENTRIES = 200;
const OPEN_DATA_INDEX_MAX_ENTRIES = 500;
const OPEN_DATA_INDEX_MAX_BYTES = 1_500_000;
const RAW_SYNTHESIS_MAX_CHARS = 200000;

const SETTINGS_METADATA_STORAGE_KEY = "overseer_settings_metadata_v1";
const SETTINGS_MIGRATION_KEY = "overseer_settings_migrated";
const PROVIDER_STORAGE_KEY = "overseer_provider";
const RUN_CONFIG_STORAGE_KEY = "overseer_run_config";
const ACCESS_ALLOWLIST_STORAGE_KEY = "overseer_access_allowlist";
const ACCESS_ALLOWLIST_UPDATED_AT_KEY = "overseer_access_allowlist_updated_at";
const PROVIDER_KEY_STORAGE: Record<"google" | "openai", string> = {
  google: "overseer_api_key_google",
  openai: "overseer_api_key_openai"
};
const OPTIONAL_KEYS_STORAGE_KEY = "overseer_open_data_auth_v1";
const OPTIONAL_KEYS_PERSISTENCE_KEY = "overseer_open_data_persist_v2";
const OPTIONAL_KEYS_MIGRATION_KEY = "overseer_open_data_auth_migrated_v1";
const OPEN_DATA_SETTINGS_STORAGE_KEY = "overseer_open_data_settings_v2";
const LEGACY_OPEN_DATA_STORAGE_KEY = "overseer_open_data_config";
const LEGACY_OPEN_DATA_SESSION_KEY = "overseer_open_data_config_session";
const LEGACY_OPEN_DATA_PERSIST_KEY = "overseer_open_data_persist";
const OPEN_DATA_INDEX_STORAGE_KEY = "overseer_open_data_index";
const GEOCODE_CACHE_STORAGE_KEY = "overseer_geocode_cache_v1";
const EVIDENCE_RECOVERY_CACHE_STORAGE_KEY = "overseer_evidence_recovery_cache_v2";
const KNOWLEDGE_BASE_STORAGE_KEY = "overseer_kb";
const SKILLS_STORAGE_KEY = "overseer_skills";
const SLO_HISTORY_STORAGE_KEY = "overseer_slo_history";
const SYNTHESIS_RAW_PREFIX = "overseer_synthesis_raw";
const LOG_MODELS_STORAGE_KEY = "overseer_log_models";
const UNLOCKED_STORAGE_KEY = "overseer_unlocked";

const isStorageAvailable = (storage?: Storage | null) => {
  if (!storage) return false;
  try {
    const testKey = "__storage_policy_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (_) {
    return false;
  }
};

const getLocalStorage = () => {
  if (typeof window === "undefined") return null;
  const storage = window.localStorage;
  return isStorageAvailable(storage) ? storage : null;
};

const getSessionStorage = () => {
  if (typeof window === "undefined") return null;
  const storage = window.sessionStorage;
  return isStorageAvailable(storage) ? storage : null;
};

const memoryStore = new Map<string, string>();

const readRaw = (tier: StorageTier, key: string) => {
  if (tier === "memory") return memoryStore.get(key) ?? null;
  const storage = tier === "local" ? getLocalStorage() : getSessionStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch (_) {
    return null;
  }
};

const writeRaw = (tier: StorageTier, key: string, value: string): boolean => {
  if (tier === "memory") {
    memoryStore.set(key, value);
    return true;
  }
  const storage = tier === "local" ? getLocalStorage() : getSessionStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch (_) {
    // ignore storage failures
    return false;
  }
};

const removeRaw = (tier: StorageTier, key: string) => {
  if (tier === "memory") {
    memoryStore.delete(key);
    return;
  }
  const storage = tier === "local" ? getLocalStorage() : getSessionStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch (_) {
    // ignore
  }
};

const safeJsonParse = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (_) {
    return null;
  }
};

const measureBytes = (value: string) => {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.byteLength(value, "utf8");
  }
  return value.length;
};

const isNonEmptyAuth = (auth: OpenDataAuthConfig | undefined | null) => {
  if (!auth) return false;
  return Boolean(
    (auth.socrataAppToken && auth.socrataAppToken.trim())
    || (auth.arcgisApiKey && auth.arcgisApiKey.trim())
    || (auth.geocodingEmail && auth.geocodingEmail.trim())
    || (auth.geocodingKey && auth.geocodingKey.trim())
  );
};

const normalizeAuth = (auth?: OpenDataAuthConfig | null): OpenDataAuthConfig => ({
  socrataAppToken: auth?.socrataAppToken?.trim() || undefined,
  arcgisApiKey: auth?.arcgisApiKey?.trim() || undefined,
  geocodingEmail: auth?.geocodingEmail?.trim() || undefined,
  geocodingKey: auth?.geocodingKey?.trim() || undefined
});

const normalizeFeatureFlags = (flags?: Partial<OpenDataFeatureFlags>): OpenDataFeatureFlags => ({
  autoIngestion: flags?.autoIngestion === true,
  evidenceRecovery: flags?.evidenceRecovery !== false,
  gatingEnforcement: flags?.gatingEnforcement !== false,
  usOnlyAddressPolicy: flags?.usOnlyAddressPolicy !== false
});

const pickOpenDataSettings = (config?: Partial<OpenDataRuntimeConfig> | null) => ({
  zeroCostMode: config?.zeroCostMode === true,
  allowPaidAccess: config?.allowPaidAccess === true,
  featureFlags: normalizeFeatureFlags(config?.featureFlags)
});

const readPersistRecord = (): OptionalKeyPersistRecord | null => {
  const storage = getLocalStorage();
  if (!storage) return null;
  const parsed = safeJsonParse<OptionalKeyPersistRecord>(storage.getItem(OPTIONAL_KEYS_PERSISTENCE_KEY));
  if (!parsed || typeof parsed !== "object") return null;
  if (parsed.schemaVersion !== OPTIONAL_KEYS_PERSIST_SCHEMA_VERSION || parsed.consentVersion !== OPTIONAL_KEYS_CONSENT_VERSION) {
    storage.removeItem(OPTIONAL_KEYS_PERSISTENCE_KEY);
    return null;
  }
  return parsed;
};

export const getOptionalKeysPersistencePreference = (): boolean => {
  const record = readPersistRecord();
  return record?.persist === true;
};

export const setOptionalKeysPersistencePreference = (persist: boolean) => {
  const storage = getLocalStorage();
  if (!storage) return;
  if (!persist) {
    const wasPersisting = getOptionalKeysPersistencePreference();
    storage.removeItem(OPTIONAL_KEYS_PERSISTENCE_KEY);
    // purge any lingering local copy when persistence is disabled
    removeRaw("local", OPTIONAL_KEYS_STORAGE_KEY);
    if (wasPersisting) {
      clearOptionalKeys("all");
    }
    return;
  }
  const record: OptionalKeyPersistRecord = {
    schemaVersion: OPTIONAL_KEYS_PERSIST_SCHEMA_VERSION,
    consentVersion: OPTIONAL_KEYS_CONSENT_VERSION,
    persist: true,
    updatedAt: new Date().toISOString()
  };
  try {
    storage.setItem(OPTIONAL_KEYS_PERSISTENCE_KEY, JSON.stringify(record));
  } catch (_) {
    // ignore
  }
};

export const clearOptionalKeysPersistencePreference = () => {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.removeItem(OPTIONAL_KEYS_PERSISTENCE_KEY);
};

const allowOptionalKeysInLocal = () => getOptionalKeysPersistencePreference();

const migrateLegacyOpenDataConfig = () => {
  const local = getLocalStorage();
  const session = getSessionStorage();
  if (!local && !session) return;
  if (local?.getItem(OPTIONAL_KEYS_MIGRATION_KEY) === "true") return;

  const legacyLocal = safeJsonParse<any>(local?.getItem(LEGACY_OPEN_DATA_STORAGE_KEY) ?? null);
  const legacySession = safeJsonParse<any>(session?.getItem(LEGACY_OPEN_DATA_SESSION_KEY) ?? null);
  const legacy = legacyLocal || legacySession;
  if (legacy && typeof legacy === "object") {
    const auth = normalizeAuth(legacy.auth);
    if (isNonEmptyAuth(auth)) {
      const record: OptionalKeysRecord = {
        schemaVersion: OPTIONAL_KEYS_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        auth
      };
      writeRaw("session", OPTIONAL_KEYS_STORAGE_KEY, JSON.stringify(record));
    }
    const settings = pickOpenDataSettings(legacy);
    const record: OpenDataSettingsRecord = {
      schemaVersion: OPEN_DATA_SETTINGS_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      config: settings
    };
    writeRaw("local", OPEN_DATA_SETTINGS_STORAGE_KEY, JSON.stringify(record));
  }

  local?.removeItem(LEGACY_OPEN_DATA_STORAGE_KEY);
  session?.removeItem(LEGACY_OPEN_DATA_SESSION_KEY);
  local?.removeItem(LEGACY_OPEN_DATA_PERSIST_KEY);
  local?.setItem(OPTIONAL_KEYS_MIGRATION_KEY, "true");
};

const ensureOpenDataMigration = (() => {
  let done = false;
  return () => {
    if (done) return;
    migrateLegacyOpenDataConfig();
    done = true;
  };
})();

export const readOptionalKeys = (): OpenDataAuthConfig => {
  ensureOpenDataMigration();
  const allowLocal = allowOptionalKeysInLocal();
  const localRecord = safeJsonParse<OptionalKeysRecord>(readRaw("local", OPTIONAL_KEYS_STORAGE_KEY));
  const sessionRecord = safeJsonParse<OptionalKeysRecord>(readRaw("session", OPTIONAL_KEYS_STORAGE_KEY));

  if (localRecord && (!allowLocal || localRecord.schemaVersion !== OPTIONAL_KEYS_SCHEMA_VERSION)) {
    removeRaw("local", OPTIONAL_KEYS_STORAGE_KEY);
  }
  if (sessionRecord && sessionRecord.schemaVersion !== OPTIONAL_KEYS_SCHEMA_VERSION) {
    removeRaw("session", OPTIONAL_KEYS_STORAGE_KEY);
  }

  const chosen = allowLocal
    ? (localRecord?.schemaVersion === OPTIONAL_KEYS_SCHEMA_VERSION ? localRecord : sessionRecord)
    : (sessionRecord?.schemaVersion === OPTIONAL_KEYS_SCHEMA_VERSION ? sessionRecord : localRecord);

  return normalizeAuth(chosen?.auth);
};

export const writeOptionalKeys = (
  auth: OpenDataAuthConfig,
  options?: { persist?: boolean }
): StorageWriteResult => {
  ensureOpenDataMigration();
  const normalized = normalizeAuth(auth);
  const hasAuth = isNonEmptyAuth(normalized);
  const allowLocal = allowOptionalKeysInLocal();
  const wantsLocal = options?.persist === true || (options?.persist === undefined && allowLocal);
  const target: StorageTier = wantsLocal && allowLocal ? "local" : "session";
  const record: OptionalKeysRecord = {
    schemaVersion: OPTIONAL_KEYS_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    auth: normalized
  };

  if (!hasAuth) {
    removeRaw("local", OPTIONAL_KEYS_STORAGE_KEY);
    removeRaw("session", OPTIONAL_KEYS_STORAGE_KEY);
    return { storedIn: target };
  }

  if (target === "local") {
    const stored = writeRaw("local", OPTIONAL_KEYS_STORAGE_KEY, JSON.stringify(record));
    if (!stored) {
      writeRaw("session", OPTIONAL_KEYS_STORAGE_KEY, JSON.stringify(record));
      return { storedIn: "session", blockedLocal: true };
    }
    removeRaw("session", OPTIONAL_KEYS_STORAGE_KEY);
    return { storedIn: "local" };
  }

  writeRaw("session", OPTIONAL_KEYS_STORAGE_KEY, JSON.stringify(record));
  if (wantsLocal && !allowLocal) {
    removeRaw("local", OPTIONAL_KEYS_STORAGE_KEY);
    return { storedIn: "session", blockedLocal: true };
  }
  return { storedIn: "session" };
};

export const clearOptionalKeys = (scope: "persistent" | "all" = "all") => {
  if (scope === "persistent") {
    removeRaw("local", OPTIONAL_KEYS_STORAGE_KEY);
    return;
  }
  removeRaw("local", OPTIONAL_KEYS_STORAGE_KEY);
  removeRaw("session", OPTIONAL_KEYS_STORAGE_KEY);
};

export const readOpenDataSettings = (): OpenDataSettingsRecord | null => {
  ensureOpenDataMigration();
  const record = safeJsonParse<OpenDataSettingsRecord>(readRaw("local", OPEN_DATA_SETTINGS_STORAGE_KEY));
  if (!record || record.schemaVersion !== OPEN_DATA_SETTINGS_SCHEMA_VERSION) {
    if (record) removeRaw("local", OPEN_DATA_SETTINGS_STORAGE_KEY);
    return null;
  }
  return record;
};

export const writeOpenDataSettings = (config: Pick<OpenDataRuntimeConfig, "zeroCostMode" | "allowPaidAccess" | "featureFlags">) => {
  ensureOpenDataMigration();
  const record: OpenDataSettingsRecord = {
    schemaVersion: OPEN_DATA_SETTINGS_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    config: {
      zeroCostMode: config.zeroCostMode === true,
      allowPaidAccess: config.allowPaidAccess === true,
      featureFlags: normalizeFeatureFlags(config.featureFlags)
    }
  };
  writeRaw("local", OPEN_DATA_SETTINGS_STORAGE_KEY, JSON.stringify(record));
};

export const clearOpenDataSettings = () => {
  removeRaw("local", OPEN_DATA_SETTINGS_STORAGE_KEY);
};

export const readSettingsMetadata = (): SettingsMetadata => {
  const fallback: SettingsMetadata = {
    updatedAt: null,
    updatedBy: null,
    version: null,
    localUpdatedAt: null
  };
  const storage = getLocalStorage();
  if (!storage) return fallback;
  const record = safeJsonParse<{ schemaVersion: number; meta: SettingsMetadata }>(storage.getItem(SETTINGS_METADATA_STORAGE_KEY));
  if (record && record.schemaVersion === SETTINGS_METADATA_SCHEMA_VERSION) {
    return {
      updatedAt: record.meta.updatedAt ?? null,
      updatedBy: record.meta.updatedBy ?? null,
      version: typeof record.meta.version === "number" ? record.meta.version : null,
      localUpdatedAt: record.meta.localUpdatedAt ?? null
    };
  }

  const updatedAt = storage.getItem(SETTINGS_UPDATED_AT_KEY);
  const updatedBy = storage.getItem(SETTINGS_UPDATED_BY_KEY);
  const versionRaw = storage.getItem(SETTINGS_VERSION_KEY);
  const localUpdatedAt = storage.getItem(SETTINGS_LOCAL_UPDATED_AT_KEY);
  const version = versionRaw && Number.isFinite(Number(versionRaw)) ? Number(versionRaw) : null;
  const migrated: SettingsMetadata = {
    updatedAt: updatedAt || null,
    updatedBy: updatedBy || null,
    version,
    localUpdatedAt: localUpdatedAt || null
  };
  const migratedRecord = { schemaVersion: SETTINGS_METADATA_SCHEMA_VERSION, meta: migrated };
  try {
    storage.setItem(SETTINGS_METADATA_STORAGE_KEY, JSON.stringify(migratedRecord));
    storage.removeItem(SETTINGS_UPDATED_AT_KEY);
    storage.removeItem(SETTINGS_UPDATED_BY_KEY);
    storage.removeItem(SETTINGS_VERSION_KEY);
    storage.removeItem(SETTINGS_LOCAL_UPDATED_AT_KEY);
  } catch (_) {
    // ignore
  }
  return migrated;
};

export const updateSettingsMetadata = (patch: Partial<SettingsMetadata>): SettingsMetadata => {
  const current = readSettingsMetadata();
  const next: SettingsMetadata = {
    updatedAt: patch.updatedAt ?? current.updatedAt ?? null,
    updatedBy: patch.updatedBy ?? current.updatedBy ?? null,
    version: typeof patch.version === "number" ? patch.version : current.version ?? null,
    localUpdatedAt: patch.localUpdatedAt ?? current.localUpdatedAt ?? null
  };
  const storage = getLocalStorage();
  if (!storage) return next;
  const record = { schemaVersion: SETTINGS_METADATA_SCHEMA_VERSION, meta: next };
  try {
    storage.setItem(SETTINGS_METADATA_STORAGE_KEY, JSON.stringify(record));
  } catch (_) {
    // ignore
  }
  return next;
};

export const readSettingsMigrationComplete = () => {
  return readRaw("local", SETTINGS_MIGRATION_KEY) === "true";
};

export const writeSettingsMigrationComplete = (value: boolean) => {
  if (value) {
    writeRaw("local", SETTINGS_MIGRATION_KEY, "true");
  } else {
    removeRaw("local", SETTINGS_MIGRATION_KEY);
  }
};

export const readProvider = () => readRaw("local", PROVIDER_STORAGE_KEY);
export const writeProvider = (provider: string) => {
  if (provider) {
    writeRaw("local", PROVIDER_STORAGE_KEY, provider);
  } else {
    removeRaw("local", PROVIDER_STORAGE_KEY);
  }
};

export const readRunConfig = () => safeJsonParse<unknown>(readRaw("local", RUN_CONFIG_STORAGE_KEY));
export const writeRunConfig = (config: unknown) => {
  writeRaw("local", RUN_CONFIG_STORAGE_KEY, JSON.stringify(config));
};

export const readLocalJson = <T>(key: string): T | null => safeJsonParse<T>(readRaw("local", key));
export const writeLocalJson = (key: string, value: unknown) => {
  writeRaw("local", key, JSON.stringify(value));
};

export const readProviderKey = (provider: "google" | "openai") => readRaw("local", PROVIDER_KEY_STORAGE[provider]) ?? "";
export const writeProviderKey = (provider: "google" | "openai", value: string) => {
  if (value) {
    writeRaw("local", PROVIDER_KEY_STORAGE[provider], value);
  } else {
    removeRaw("local", PROVIDER_KEY_STORAGE[provider]);
  }
};

export const readAllowlist = () => readRaw("local", ACCESS_ALLOWLIST_STORAGE_KEY);
export const writeAllowlist = (value: string) => writeRaw("local", ACCESS_ALLOWLIST_STORAGE_KEY, value);
export const readAllowlistUpdatedAt = () => readRaw("local", ACCESS_ALLOWLIST_UPDATED_AT_KEY);
export const writeAllowlistUpdatedAt = (value: string | null) => {
  if (value) {
    writeRaw("local", ACCESS_ALLOWLIST_UPDATED_AT_KEY, value);
  } else {
    removeRaw("local", ACCESS_ALLOWLIST_UPDATED_AT_KEY);
  }
};

export const hasLocalSettingsSnapshot = () => Boolean(
  readRaw("local", PROVIDER_STORAGE_KEY)
  || readRaw("local", RUN_CONFIG_STORAGE_KEY)
  || readRaw("local", ACCESS_ALLOWLIST_STORAGE_KEY)
  || readRaw("local", MODEL_OVERRIDE_STORAGE_KEY)
);

export const readModelOverridesRaw = () => safeJsonParse<unknown>(readRaw("local", MODEL_OVERRIDE_STORAGE_KEY));
export const writeModelOverridesRaw = (value: unknown) => {
  writeRaw("local", MODEL_OVERRIDE_STORAGE_KEY, JSON.stringify(value));
};

export const readOpenDataIndex = (): OpenDatasetIndex => {
  const fallback: OpenDatasetIndex = {
    schemaVersion: OPEN_DATA_INDEX_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    datasets: []
  };
  const raw = readRaw("local", OPEN_DATA_INDEX_STORAGE_KEY);
  if (!raw) return fallback;
  const parsed = safeJsonParse<OpenDatasetIndex>(raw);
  if (!parsed || parsed.schemaVersion !== OPEN_DATA_INDEX_SCHEMA_VERSION || !Array.isArray(parsed.datasets)) {
    removeRaw("local", OPEN_DATA_INDEX_STORAGE_KEY);
    return fallback;
  }
  if (parsed.expiresAt) {
    const expiresMs = Date.parse(parsed.expiresAt);
    if (Number.isFinite(expiresMs) && Date.now() > expiresMs) {
      removeRaw("local", OPEN_DATA_INDEX_STORAGE_KEY);
      return fallback;
    }
  }
  const updatedMs = Date.parse(parsed.updatedAt);
  if (Number.isFinite(updatedMs)) {
    const ageDays = (Date.now() - updatedMs) / DAY_MS;
    if (ageDays > OPEN_DATA_INDEX_TTL_DAYS) {
      removeRaw("local", OPEN_DATA_INDEX_STORAGE_KEY);
      return fallback;
    }
  }
  return parsed;
};

export const writeOpenDataIndex = (index: OpenDatasetIndex) => {
  const next: OpenDatasetIndex = {
    ...index,
    schemaVersion: OPEN_DATA_INDEX_SCHEMA_VERSION,
    datasets: Array.isArray(index.datasets)
      ? index.datasets.slice(0, OPEN_DATA_INDEX_MAX_ENTRIES)
      : []
  };
  let payload = JSON.stringify(next);
  if (measureBytes(payload) > OPEN_DATA_INDEX_MAX_BYTES) {
    const trimmed = { ...next, datasets: next.datasets.slice(0, Math.floor(OPEN_DATA_INDEX_MAX_ENTRIES / 2)) };
    payload = JSON.stringify(trimmed);
  }
  writeRaw("local", OPEN_DATA_INDEX_STORAGE_KEY, payload);
};

export const readGeocodeCache = (): GeocodeCacheRecord => {
  const raw = readRaw("local", GEOCODE_CACHE_STORAGE_KEY);
  const parsed = safeJsonParse<GeocodeCacheRecord>(raw);
  if (!parsed || typeof parsed !== "object") return {};
  const now = Date.now();
  const entries = Object.entries(parsed)
    .filter(([_, entry]) => entry && typeof entry.expiresAt === "number" && entry.expiresAt > now)
    .sort((a, b) => (b[1].expiresAt - a[1].expiresAt))
    .slice(0, GEOCODE_CACHE_MAX_ENTRIES);
  return Object.fromEntries(entries);
};

export const writeGeocodeCache = (cache: GeocodeCacheRecord) => {
  const now = Date.now();
  const entries = Object.entries(cache)
    .filter(([_, entry]) => entry && typeof entry.expiresAt === "number" && entry.expiresAt > now)
    .sort((a, b) => (b[1].expiresAt - a[1].expiresAt))
    .slice(0, GEOCODE_CACHE_MAX_ENTRIES);
  const payload = JSON.stringify(Object.fromEntries(entries));
  writeRaw("local", GEOCODE_CACHE_STORAGE_KEY, payload);
};

export const readEvidenceRecoveryCache = (): EvidenceRecoveryCacheRecord => {
  const raw = readRaw("local", EVIDENCE_RECOVERY_CACHE_STORAGE_KEY);
  const parsed = safeJsonParse<EvidenceRecoveryCacheRecord>(raw);
  if (!parsed || typeof parsed !== "object") return {};
  const now = Date.now();
  const entries = Object.entries(parsed)
    .filter(([_, entry]) => entry && typeof entry.timestamp === "number" && now - entry.timestamp <= EVIDENCE_RECOVERY_CACHE_TTL_MS)
    .sort((a, b) => b[1].timestamp - a[1].timestamp)
    .slice(0, EVIDENCE_RECOVERY_MAX_CACHE_ENTRIES);
  return Object.fromEntries(entries);
};

export const writeEvidenceRecoveryCache = (cache: EvidenceRecoveryCacheRecord) => {
  const now = Date.now();
  const entries = Object.entries(cache)
    .filter(([_, entry]) => entry && typeof entry.timestamp === "number" && now - entry.timestamp <= EVIDENCE_RECOVERY_CACHE_TTL_MS)
    .sort((a, b) => b[1].timestamp - a[1].timestamp)
    .slice(0, EVIDENCE_RECOVERY_MAX_CACHE_ENTRIES);
  const payload = JSON.stringify(Object.fromEntries(entries));
  writeRaw("local", EVIDENCE_RECOVERY_CACHE_STORAGE_KEY, payload);
};

export const readKnowledgeBaseRaw = () => safeJsonParse<unknown>(readRaw("local", KNOWLEDGE_BASE_STORAGE_KEY));
export const writeKnowledgeBaseRaw = (value: unknown) => {
  writeRaw("local", KNOWLEDGE_BASE_STORAGE_KEY, JSON.stringify(value));
};

export const readSkillsRaw = () => safeJsonParse<unknown>(readRaw("local", SKILLS_STORAGE_KEY));

export const readSloHistoryRaw = () => safeJsonParse<unknown>(readRaw("local", SLO_HISTORY_STORAGE_KEY));
export const writeSloHistoryRaw = (value: unknown) => {
  writeRaw("local", SLO_HISTORY_STORAGE_KEY, JSON.stringify(value));
};

export const writeRawSynthesisDebug = (provider: "openai" | "gemini", attempt: "initial" | "retry", raw: string) => {
  const truncated = raw.length > RAW_SYNTHESIS_MAX_CHARS ? `${raw.slice(0, RAW_SYNTHESIS_MAX_CHARS)}\n...[truncated]` : raw;
  writeRaw("memory", `${SYNTHESIS_RAW_PREFIX}_${provider}_${attempt}`, truncated);
};

export const readLogModelsPreference = () => readRaw("local", LOG_MODELS_STORAGE_KEY) === "true";

export const readUnlocked = () => readRaw("session", UNLOCKED_STORAGE_KEY) === "true";
export const writeUnlocked = (value: boolean) => {
  if (value) {
    writeRaw("session", UNLOCKED_STORAGE_KEY, "true");
  } else {
    removeRaw("session", UNLOCKED_STORAGE_KEY);
  }
};

export const getStoragePolicySummary = () => ({
  optionalKeys: {
    defaultTier: "session",
    localAllowed: allowOptionalKeysInLocal()
  },
  nonSecrets: "local",
  sensitiveRunData: "memory"
});

export const __internalStorageKeys = {
  OPTIONAL_KEYS_STORAGE_KEY,
  OPTIONAL_KEYS_PERSISTENCE_KEY,
  OPEN_DATA_INDEX_STORAGE_KEY,
  GEOCODE_CACHE_STORAGE_KEY,
  EVIDENCE_RECOVERY_CACHE_STORAGE_KEY
};
