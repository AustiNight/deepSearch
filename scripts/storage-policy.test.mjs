import assert from "node:assert/strict";

const createStorage = () => {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, String(value));
    },
    removeItem: (key) => {
      map.delete(key);
    },
    clear: () => {
      map.clear();
    },
    key: (index) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size;
    }
  };
};

globalThis.window = {
  localStorage: createStorage(),
  sessionStorage: createStorage()
};

const policy = await import("../services/storagePolicy.ts");

const {
  __internalStorageKeys,
  EVIDENCE_RECOVERY_CACHE_TTL_MS,
  GEOCODE_CACHE_MAX_ENTRIES,
  readEvidenceRecoveryCache,
  readGeocodeCache,
  readOpenDataIndex,
  readOptionalKeys,
  setOptionalKeysPersistencePreference,
  writeEvidenceRecoveryCache,
  writeGeocodeCache,
  writeOpenDataIndex,
  writeOptionalKeys
} = policy;

const { OPTIONAL_KEYS_STORAGE_KEY } = __internalStorageKeys;

const resetStorage = () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
};

const authPayload = { socrataAppToken: "token-123" };

resetStorage();
writeOptionalKeys(authPayload);
assert.equal(window.localStorage.getItem(OPTIONAL_KEYS_STORAGE_KEY), null);
assert.ok(window.sessionStorage.getItem(OPTIONAL_KEYS_STORAGE_KEY));
assert.equal(readOptionalKeys().socrataAppToken, "token-123");

resetStorage();
const blocked = writeOptionalKeys(authPayload, { persist: true });
assert.equal(blocked.blockedLocal, true);
assert.equal(window.localStorage.getItem(OPTIONAL_KEYS_STORAGE_KEY), null);
assert.ok(window.sessionStorage.getItem(OPTIONAL_KEYS_STORAGE_KEY));

resetStorage();
setOptionalKeysPersistencePreference(true);
writeOptionalKeys(authPayload, { persist: true });
assert.ok(window.localStorage.getItem(OPTIONAL_KEYS_STORAGE_KEY));
assert.equal(window.sessionStorage.getItem(OPTIONAL_KEYS_STORAGE_KEY), null);

resetStorage();
const now = Date.now();
writeEvidenceRecoveryCache({
  stale: { text: "old", sources: [], timestamp: now - EVIDENCE_RECOVERY_CACHE_TTL_MS - 1000 },
  fresh: { text: "new", sources: [], timestamp: now }
});
const evidenceCache = readEvidenceRecoveryCache();
assert.equal(Boolean(evidenceCache.stale), false);
assert.equal(Boolean(evidenceCache.fresh), true);

resetStorage();
const geocodePayload = {};
for (let i = 0; i < GEOCODE_CACHE_MAX_ENTRIES + 50; i += 1) {
  geocodePayload[`addr-${i}`] = { value: { point: { lat: i, lon: i } }, expiresAt: now + 10000 };
}
writeGeocodeCache(geocodePayload);
const geocodeCache = readGeocodeCache();
assert.ok(Object.keys(geocodeCache).length <= GEOCODE_CACHE_MAX_ENTRIES);

resetStorage();
const oldIso = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString();
writeOpenDataIndex({
  schemaVersion: 1,
  updatedAt: oldIso,
  datasets: [{ datasetId: "1", portalType: "socrata", portalUrl: "https://example.com", title: "Legacy" }]
});
const index = readOpenDataIndex();
assert.equal(index.datasets.length, 0);

console.log("storage-policy.test.mjs: ok");
