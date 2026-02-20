import {
  MODEL_OVERRIDE_STORAGE_KEY,
  OPEN_DATA_GEOCODE_CACHE_TTL_MS,
  OPEN_DATA_INDEX_TTL_DAYS
} from "../constants";
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
export type StorageDataClassId =
  | "settings_metadata"
  | "run_config"
  | "model_overrides"
  | "allowlist"
  | "optional_keys"
  | "open_data_index"
  | "geocode_cache"
  | "evidence_recovery_cache"
  | "knowledge_base"
  | "slo_history"
  | "raw_synthesis_debug";

export type StorageDataClassPolicy = {
  id: StorageDataClassId;
  description: string;
  defaultTier: StorageTier;
  keys?: string[];
  keyPrefix?: string;
  cache?: {
    ttlMs?: number;
    maxEntries?: number;
    maxBytes?: number;
  };
  notes?: string;
};

type StorageMigration<T> = {
  fromVersion: number;
  toVersion: number;
  migrate: (record: any) => T | null;
};

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

type SettingsMetadataRecord = {
  schemaVersion: number;
  meta: SettingsMetadata;
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

export type DallasSchemaCacheEntry = {
  datasetId: string;
  portalUrl: string;
  schemaHash: string;
  fieldMap: Record<string, string | undefined>;
  fields: Array<{ name: string; type?: string }>;
  updatedAt: number;
  expiresAt: number;
};

export type DallasSchemaCacheRecord = Record<string, DallasSchemaCacheEntry>;

type StorageWriteResult = {
  storedIn: StorageTier;
  blockedLocal?: boolean;
};

const DAY_MS = 1000 * 60 * 60 * 24;
const OPEN_DATA_INDEX_TTL_MS = OPEN_DATA_INDEX_TTL_DAYS * DAY_MS;

const SETTINGS_METADATA_SCHEMA_VERSION = 1;
const OPTIONAL_KEYS_SCHEMA_VERSION = 1;
const OPTIONAL_KEYS_PERSIST_SCHEMA_VERSION = 1;
const OPTIONAL_KEYS_CONSENT_VERSION = 1;
const OPEN_DATA_SETTINGS_SCHEMA_VERSION = 1;
export const OPEN_DATA_INDEX_SCHEMA_VERSION = 1;

const SETTINGS_METADATA_MIGRATIONS: Array<StorageMigration<SettingsMetadataRecord>> = [
  {
    fromVersion: 0,
    toVersion: 1,
    migrate: (record: any) => {
      if (!record || typeof record !== "object") return null;
      if (record.meta && typeof record.meta === "object") {
        return { schemaVersion: 1, meta: normalizeSettingsMetadata(record.meta) };
      }
      return { schemaVersion: 1, meta: normalizeSettingsMetadata(record) };
    }
  }
];

const OPEN_DATA_INDEX_MIGRATIONS: Array<StorageMigration<OpenDatasetIndex>> = [
  {
    fromVersion: 0,
    toVersion: 1,
    migrate: (record: any) => {
      if (!record || typeof record !== "object") return null;
      return {
        schemaVersion: 1,
        updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : new Date().toISOString(),
        datasets: Array.isArray(record.datasets) ? record.datasets : [],
        portalCrawls: record.portalCrawls && typeof record.portalCrawls === "object" ? record.portalCrawls : undefined,
        expiresAt: typeof record.expiresAt === "string" ? record.expiresAt : undefined
      };
    }
  }
];

export const EVIDENCE_RECOVERY_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
export const EVIDENCE_RECOVERY_MAX_CACHE_ENTRIES = 200;
export const GEOCODE_CACHE_MAX_ENTRIES = 200;
const GEOCODE_CACHE_MAX_BYTES = 500_000;
const OPEN_DATA_INDEX_MAX_ENTRIES = 500;
const OPEN_DATA_INDEX_MAX_BYTES = 1_500_000;
const EVIDENCE_RECOVERY_CACHE_MAX_BYTES = 1_000_000;
const DALLAS_SCHEMA_CACHE_MAX_ENTRIES = 30;
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
const OPTIONAL_KEYS_PERSISTENCE_INVALIDATED_KEY = "overseer_open_data_persist_invalidated_v1";
const OPTIONAL_KEYS_MIGRATION_KEY = "overseer_open_data_auth_migrated_v1";
const OPTIONAL_KEYS_LOCAL_MIGRATION_KEY = "overseer_open_data_auth_migrated_v2";
const OPEN_DATA_SETTINGS_STORAGE_KEY = "overseer_open_data_settings_v2";
const LEGACY_OPEN_DATA_STORAGE_KEY = "overseer_open_data_config";
const LEGACY_OPEN_DATA_SESSION_KEY = "overseer_open_data_config_session";
const LEGACY_OPEN_DATA_PERSIST_KEY = "overseer_open_data_persist";
const OPEN_DATA_INDEX_STORAGE_KEY = "overseer_open_data_index";
const GEOCODE_CACHE_STORAGE_KEY = "overseer_geocode_cache_v1";
const EVIDENCE_RECOVERY_CACHE_STORAGE_KEY = "overseer_evidence_recovery_cache_v2";
const DALLAS_SCHEMA_CACHE_STORAGE_KEY = "overseer_dallas_schema_cache_v1";
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

const parseSchemaVersion = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
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
  if (tier === "local" && key === OPTIONAL_KEYS_STORAGE_KEY && !allowOptionalKeysInLocal()) {
    return false;
  }
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

const applyMigrations = <T>(
  record: any,
  currentVersion: number,
  targetVersion: number,
  migrations: Array<StorageMigration<T>>
): T | null => {
  if (!record || typeof record !== "object") return null;
  if (currentVersion === targetVersion) return record as T;
  const migrationMap = new Map<number, StorageMigration<T>>();
  for (const migration of migrations) {
    migrationMap.set(migration.fromVersion, migration);
  }
  let working: any = record;
  let version = currentVersion;
  while (version < targetVersion) {
    const migration = migrationMap.get(version);
    if (!migration) return null;
    const next = migration.migrate(working);
    if (!next || typeof next !== "object") return null;
    version = migration.toVersion;
    working = { ...next, schemaVersion: version };
  }
  if (version !== targetVersion) return null;
  return working as T;
};

const loadVersionedRecord = <T>(
  raw: string | null,
  currentSchemaVersion: number,
  migrations: Array<StorageMigration<T>>
) => {
  if (!raw) return { record: null, migrated: false, invalid: false };
  const parsed = safeJsonParse<any>(raw);
  if (!parsed || typeof parsed !== "object") {
    return { record: null, migrated: false, invalid: true };
  }
  const version = parseSchemaVersion(parsed.schemaVersion);
  if (version === currentSchemaVersion) {
    return { record: parsed as T, migrated: false, invalid: false };
  }
  if (version > currentSchemaVersion) {
    return { record: null, migrated: false, invalid: true };
  }
  const migrated = applyMigrations(parsed, version, currentSchemaVersion, migrations);
  if (!migrated) {
    return { record: null, migrated: false, invalid: true };
  }
  return { record: migrated, migrated: true, invalid: false };
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

const serializeCacheEntries = <T>(entries: Array<[string, T]>, maxBytes?: number) => {
  let trimmed = entries;
  let payload = JSON.stringify(Object.fromEntries(trimmed));
  if (!maxBytes || maxBytes <= 0) {
    return { entries: trimmed, payload };
  }
  while (trimmed.length > 0 && measureBytes(payload) > maxBytes) {
    trimmed = trimmed.slice(0, trimmed.length - 1);
    payload = JSON.stringify(Object.fromEntries(trimmed));
  }
  return { entries: trimmed, payload };
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

const normalizeSettingsMetadata = (input: any): SettingsMetadata => {
  const versionValue = input?.version;
  const version = typeof versionValue === "number"
    ? versionValue
    : (typeof versionValue === "string" && versionValue.trim() ? Number(versionValue) : NaN);
  return {
    updatedAt: typeof input?.updatedAt === "string" ? input.updatedAt : null,
    updatedBy: typeof input?.updatedBy === "string" ? input.updatedBy : null,
    version: Number.isFinite(version) ? version : null,
    localUpdatedAt: typeof input?.localUpdatedAt === "string" ? input.localUpdatedAt : null
  };
};

const markOptionalKeysPersistenceInvalidated = () => {
  writeRaw("session", OPTIONAL_KEYS_PERSISTENCE_INVALIDATED_KEY, "true");
};

const readPersistRecord = (): OptionalKeyPersistRecord | null => {
  const storage = getLocalStorage();
  if (!storage) return null;
  const parsed = safeJsonParse<OptionalKeyPersistRecord>(storage.getItem(OPTIONAL_KEYS_PERSISTENCE_KEY));
  if (!parsed || typeof parsed !== "object") return null;
  if (parsed.schemaVersion !== OPTIONAL_KEYS_PERSIST_SCHEMA_VERSION || parsed.consentVersion !== OPTIONAL_KEYS_CONSENT_VERSION) {
    storage.removeItem(OPTIONAL_KEYS_PERSISTENCE_KEY);
    markOptionalKeysPersistenceInvalidated();
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
  if (!persist) {
    if (storage) {
      storage.removeItem(OPTIONAL_KEYS_PERSISTENCE_KEY);
    }
    // purge any lingering copies when persistence is disabled
    clearOptionalKeys("all");
    return;
  }
  if (!storage) return;
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

export const isOptionalKeysPersistenceSupported = (): boolean => Boolean(getLocalStorage());

export const consumeOptionalKeysPersistenceInvalidation = (): boolean => {
  const value = readRaw("session", OPTIONAL_KEYS_PERSISTENCE_INVALIDATED_KEY) === "true";
  if (value) {
    removeRaw("session", OPTIONAL_KEYS_PERSISTENCE_INVALIDATED_KEY);
  }
  return value;
};

const allowOptionalKeysInLocal = () => getOptionalKeysPersistencePreference();

export const STORAGE_DATA_CLASS_POLICIES: Record<StorageDataClassId, StorageDataClassPolicy> = {
  settings_metadata: {
    id: "settings_metadata",
    description: "Settings version/updated metadata and last local sync info.",
    defaultTier: "local",
    keys: [SETTINGS_METADATA_STORAGE_KEY],
    notes: "Non-secret metadata for settings audits."
  },
  run_config: {
    id: "run_config",
    description: "User run configuration (non-secret preferences).",
    defaultTier: "local",
    keys: [RUN_CONFIG_STORAGE_KEY],
    notes: "May include user selections; avoid storing sensitive run data here."
  },
  model_overrides: {
    id: "model_overrides",
    description: "Model override config used for synthesis planning.",
    defaultTier: "local",
    keys: [MODEL_OVERRIDE_STORAGE_KEY],
    notes: "Non-secret configuration."
  },
  allowlist: {
    id: "allowlist",
    description: "Access allowlist data and its updated timestamp.",
    defaultTier: "local",
    keys: [ACCESS_ALLOWLIST_STORAGE_KEY, ACCESS_ALLOWLIST_UPDATED_AT_KEY],
    notes: "Non-secret access policy data."
  },
  optional_keys: {
    id: "optional_keys",
    description: "Optional open-data API keys (Socrata/ArcGIS/geocoding).",
    defaultTier: "session",
    keys: [OPTIONAL_KEYS_STORAGE_KEY, OPTIONAL_KEYS_PERSISTENCE_KEY],
    notes: "Session-only by default; local storage only when explicit consent is recorded."
  },
  open_data_index: {
    id: "open_data_index",
    description: "Cached open-data dataset index and discovery metadata.",
    defaultTier: "local",
    keys: [OPEN_DATA_INDEX_STORAGE_KEY],
    cache: {
      ttlMs: OPEN_DATA_INDEX_TTL_MS,
      maxEntries: OPEN_DATA_INDEX_MAX_ENTRIES,
      maxBytes: OPEN_DATA_INDEX_MAX_BYTES
    },
    notes: "TTL enforced via OPEN_DATA_INDEX_TTL_DAYS."
  },
  geocode_cache: {
    id: "geocode_cache",
    description: "Geocoding cache entries keyed by address.",
    defaultTier: "local",
    keys: [GEOCODE_CACHE_STORAGE_KEY],
    cache: {
      ttlMs: OPEN_DATA_GEOCODE_CACHE_TTL_MS,
      maxEntries: GEOCODE_CACHE_MAX_ENTRIES,
      maxBytes: GEOCODE_CACHE_MAX_BYTES
    },
    notes: "Entries include per-item expiration timestamps."
  },
  evidence_recovery_cache: {
    id: "evidence_recovery_cache",
    description: "Evidence recovery cache for fallback summarization.",
    defaultTier: "local",
    keys: [EVIDENCE_RECOVERY_CACHE_STORAGE_KEY],
    cache: {
      ttlMs: EVIDENCE_RECOVERY_CACHE_TTL_MS,
      maxEntries: EVIDENCE_RECOVERY_MAX_CACHE_ENTRIES,
      maxBytes: EVIDENCE_RECOVERY_CACHE_MAX_BYTES
    },
    notes: "Time-bounded cache with entry limit."
  },
  knowledge_base: {
    id: "knowledge_base",
    description: "Local knowledge base data for report generation.",
    defaultTier: "local",
    keys: [KNOWLEDGE_BASE_STORAGE_KEY]
  },
  slo_history: {
    id: "slo_history",
    description: "Client-side SLO history snapshots.",
    defaultTier: "local",
    keys: [SLO_HISTORY_STORAGE_KEY]
  },
  raw_synthesis_debug: {
    id: "raw_synthesis_debug",
    description: "Transient raw synthesis debug payloads.",
    defaultTier: "memory",
    keyPrefix: SYNTHESIS_RAW_PREFIX,
    notes: "Never persisted to session/local storage."
  }
};

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

const migrateOptionalKeysToSession = () => {
  const local = getLocalStorage();
  const session = getSessionStorage();
  if (!local || !session) return;
  if (local.getItem(OPTIONAL_KEYS_LOCAL_MIGRATION_KEY) === "true") return;

  const allowLocal = allowOptionalKeysInLocal();
  if (allowLocal) {
    local.setItem(OPTIONAL_KEYS_LOCAL_MIGRATION_KEY, "true");
    return;
  }

  const localRecord = safeJsonParse<OptionalKeysRecord>(local.getItem(OPTIONAL_KEYS_STORAGE_KEY));
  if (!localRecord || localRecord.schemaVersion !== OPTIONAL_KEYS_SCHEMA_VERSION) {
    if (localRecord) {
      local.removeItem(OPTIONAL_KEYS_STORAGE_KEY);
    }
    local.setItem(OPTIONAL_KEYS_LOCAL_MIGRATION_KEY, "true");
    return;
  }

  const normalized = normalizeAuth(localRecord.auth);
  if (!isNonEmptyAuth(normalized)) {
    local.removeItem(OPTIONAL_KEYS_STORAGE_KEY);
    local.setItem(OPTIONAL_KEYS_LOCAL_MIGRATION_KEY, "true");
    return;
  }

  const sessionRecord = safeJsonParse<OptionalKeysRecord>(session.getItem(OPTIONAL_KEYS_STORAGE_KEY));
  if (!sessionRecord || sessionRecord.schemaVersion !== OPTIONAL_KEYS_SCHEMA_VERSION) {
    if (sessionRecord && sessionRecord.schemaVersion !== OPTIONAL_KEYS_SCHEMA_VERSION) {
      session.removeItem(OPTIONAL_KEYS_STORAGE_KEY);
    }
    writeRaw("session", OPTIONAL_KEYS_STORAGE_KEY, JSON.stringify({ ...localRecord, auth: normalized }));
  }

  local.removeItem(OPTIONAL_KEYS_STORAGE_KEY);
  local.setItem(OPTIONAL_KEYS_LOCAL_MIGRATION_KEY, "true");
};

const cleanupLegacyOpenDataKeys = () => {
  const local = getLocalStorage();
  const session = getSessionStorage();
  if (!local && !session) return;

  local?.removeItem(LEGACY_OPEN_DATA_STORAGE_KEY);
  session?.removeItem(LEGACY_OPEN_DATA_SESSION_KEY);
  local?.removeItem(LEGACY_OPEN_DATA_PERSIST_KEY);

  const allowLocal = allowOptionalKeysInLocal();
  const localRecord = local ? safeJsonParse<OptionalKeysRecord>(local.getItem(OPTIONAL_KEYS_STORAGE_KEY)) : null;
  if (localRecord && (!allowLocal || localRecord.schemaVersion !== OPTIONAL_KEYS_SCHEMA_VERSION)) {
    local?.removeItem(OPTIONAL_KEYS_STORAGE_KEY);
  }
  const sessionRecord = session ? safeJsonParse<OptionalKeysRecord>(session.getItem(OPTIONAL_KEYS_STORAGE_KEY)) : null;
  if (sessionRecord && sessionRecord.schemaVersion !== OPTIONAL_KEYS_SCHEMA_VERSION) {
    session?.removeItem(OPTIONAL_KEYS_STORAGE_KEY);
  }
};

const ensureOpenDataMigration = (() => {
  let done = false;
  return () => {
    if (done) return;
    migrateLegacyOpenDataConfig();
    migrateOptionalKeysToSession();
    cleanupLegacyOpenDataKeys();
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

  const { record, migrated, invalid } = loadVersionedRecord<SettingsMetadataRecord>(
    storage.getItem(SETTINGS_METADATA_STORAGE_KEY),
    SETTINGS_METADATA_SCHEMA_VERSION,
    SETTINGS_METADATA_MIGRATIONS
  );
  if (record) {
    const normalized = normalizeSettingsMetadata(record.meta);
    if (migrated) {
      try {
        storage.setItem(
          SETTINGS_METADATA_STORAGE_KEY,
          JSON.stringify({ schemaVersion: SETTINGS_METADATA_SCHEMA_VERSION, meta: normalized })
        );
      } catch (_) {
        // ignore
      }
    }
    return normalized;
  }
  if (invalid) {
    storage.removeItem(SETTINGS_METADATA_STORAGE_KEY);
  }

  const updatedAt = storage.getItem(SETTINGS_UPDATED_AT_KEY);
  const updatedBy = storage.getItem(SETTINGS_UPDATED_BY_KEY);
  const versionRaw = storage.getItem(SETTINGS_VERSION_KEY);
  const localUpdatedAt = storage.getItem(SETTINGS_LOCAL_UPDATED_AT_KEY);
  const version = versionRaw && Number.isFinite(Number(versionRaw)) ? Number(versionRaw) : null;
  const migratedLegacy: SettingsMetadata = {
    updatedAt: updatedAt || null,
    updatedBy: updatedBy || null,
    version,
    localUpdatedAt: localUpdatedAt || null
  };
  const migratedRecord = { schemaVersion: SETTINGS_METADATA_SCHEMA_VERSION, meta: migratedLegacy };
  try {
    storage.setItem(SETTINGS_METADATA_STORAGE_KEY, JSON.stringify(migratedRecord));
    storage.removeItem(SETTINGS_UPDATED_AT_KEY);
    storage.removeItem(SETTINGS_UPDATED_BY_KEY);
    storage.removeItem(SETTINGS_VERSION_KEY);
    storage.removeItem(SETTINGS_LOCAL_UPDATED_AT_KEY);
  } catch (_) {
    // ignore
  }
  return migratedLegacy;
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
  const { record, migrated, invalid } = loadVersionedRecord<OpenDatasetIndex>(
    raw,
    OPEN_DATA_INDEX_SCHEMA_VERSION,
    OPEN_DATA_INDEX_MIGRATIONS
  );
  if (!record || !Array.isArray(record.datasets)) {
    if (invalid) removeRaw("local", OPEN_DATA_INDEX_STORAGE_KEY);
    return fallback;
  }
  if (migrated) {
    writeOpenDataIndex(record);
  }
  if (record.expiresAt) {
    const expiresMs = Date.parse(record.expiresAt);
    if (Number.isFinite(expiresMs) && Date.now() > expiresMs) {
      removeRaw("local", OPEN_DATA_INDEX_STORAGE_KEY);
      return fallback;
    }
  }
  const updatedMs = Date.parse(record.updatedAt);
  if (Number.isFinite(updatedMs)) {
    const ageMs = Date.now() - updatedMs;
    if (ageMs > OPEN_DATA_INDEX_TTL_MS) {
      removeRaw("local", OPEN_DATA_INDEX_STORAGE_KEY);
      return fallback;
    }
  }
  return record;
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
  const { payload } = serializeCacheEntries(entries, GEOCODE_CACHE_MAX_BYTES);
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
  const { payload } = serializeCacheEntries(entries, EVIDENCE_RECOVERY_CACHE_MAX_BYTES);
  writeRaw("local", EVIDENCE_RECOVERY_CACHE_STORAGE_KEY, payload);
};

export const readDallasSchemaCache = (): DallasSchemaCacheRecord => {
  const raw = readRaw("local", DALLAS_SCHEMA_CACHE_STORAGE_KEY);
  const parsed = safeJsonParse<DallasSchemaCacheRecord>(raw);
  if (!parsed || typeof parsed !== "object") return {};
  const now = Date.now();
  const entries = Object.entries(parsed)
    .filter(([_, entry]) => entry && typeof entry.expiresAt === "number" && entry.expiresAt > now)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(0, DALLAS_SCHEMA_CACHE_MAX_ENTRIES);
  return Object.fromEntries(entries);
};

export const writeDallasSchemaCache = (cache: DallasSchemaCacheRecord) => {
  const now = Date.now();
  const entries = Object.entries(cache)
    .filter(([_, entry]) => entry && typeof entry.expiresAt === "number" && entry.expiresAt > now)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(0, DALLAS_SCHEMA_CACHE_MAX_ENTRIES);
  const payload = JSON.stringify(Object.fromEntries(entries));
  writeRaw("local", DALLAS_SCHEMA_CACHE_STORAGE_KEY, payload);
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
  OPTIONAL_KEYS_PERSISTENCE_INVALIDATED_KEY,
  OPEN_DATA_INDEX_STORAGE_KEY,
  GEOCODE_CACHE_STORAGE_KEY,
  EVIDENCE_RECOVERY_CACHE_STORAGE_KEY,
  DALLAS_SCHEMA_CACHE_STORAGE_KEY
};
