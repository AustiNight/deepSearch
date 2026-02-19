import type { GeocodeResult, GeocodeInput } from "./parcelResolution";
import { normalizeAddressVariants } from "./addressNormalization";
import { OPEN_DATA_GEOCODE_CACHE_TTL_MS, OPEN_DATA_GEOCODE_RATE_LIMIT_MS } from "../constants";
import { enforceRateLimit, fetchJsonWithRetry } from "./openDataHttp";
import { getOpenDataConfig } from "./openDataConfig";

type CachedGeocode = {
  value: GeocodeResult | null;
  expiresAt: number;
};

const GEOCODE_CACHE_KEY = "overseer_geocode_cache_v1";

const memoryCache = new Map<string, CachedGeocode>();

const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;

const loadCacheFromStorage = () => {
  if (!hasStorage()) return;
  try {
    const raw = window.localStorage.getItem(GEOCODE_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    Object.entries(parsed).forEach(([key, entry]) => {
      if (!entry || typeof entry !== "object") return;
      const expiresAt = Number((entry as any).expiresAt);
      if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return;
      memoryCache.set(key, { value: (entry as any).value ?? null, expiresAt });
    });
  } catch (_) {
    // ignore
  }
};

const persistCache = () => {
  if (!hasStorage()) return;
  try {
    const payload: Record<string, CachedGeocode> = {};
    memoryCache.forEach((entry, key) => {
      if (entry.expiresAt > Date.now()) payload[key] = entry;
    });
    window.localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(payload));
  } catch (_) {
    // ignore
  }
};

const cacheKey = (address: string) => address.toLowerCase().replace(/\s+/g, " ").trim();

const getCached = (address: string) => {
  const key = cacheKey(address);
  const entry = memoryCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.value;
  if (entry) memoryCache.delete(key);
  return null;
};

const setCached = (address: string, value: GeocodeResult | null) => {
  const key = cacheKey(address);
  memoryCache.set(key, { value, expiresAt: Date.now() + OPEN_DATA_GEOCODE_CACHE_TTL_MS });
  persistCache();
};

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

// Nominatim usage policy requires identifying the application and respecting strict rate limits.
// Provide a contact email via open data settings when possible, and keep the 1 req/sec guardrail.
const buildNominatimUrl = (address: string, email?: string) => {
  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    limit: "1",
    q: address
  });
  if (email) params.set("email", email);
  return `${NOMINATIM_ENDPOINT}?${params.toString()}`;
};

const parseConfidence = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

export const geocodeAddress = async (input: GeocodeInput): Promise<GeocodeResult | null> => {
  const address = input.address.trim();
  if (!address) return null;
  const cached = getCached(address);
  if (cached !== null) return cached;

  const config = getOpenDataConfig();
  await enforceRateLimit("nominatim", OPEN_DATA_GEOCODE_RATE_LIMIT_MS);
  const url = buildNominatimUrl(address, config.auth.geocodingEmail);
  const response = await fetchJsonWithRetry<any[]>(url, { retries: 1, minDelayMs: 500 }, {
    portalType: "unknown",
    portalUrl: "https://nominatim.openstreetmap.org"
  });
  if (!response.ok || !Array.isArray(response.data) || response.data.length === 0) {
    setCached(address, null);
    return null;
  }
  const first = response.data[0];
  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    setCached(address, null);
    return null;
  }
  const confidence = parseConfidence(first.importance) ?? parseConfidence(first.confidence);
  const normalizedAddress = typeof first.display_name === "string" ? first.display_name : address;
  const result: GeocodeResult = {
    point: {
      lat,
      lon
    },
    normalizedAddress,
    provider: "nominatim",
    confidence
  };
  setCached(address, result);
  return result;
};

export const addressToGeometry = async (input: { address: string; jurisdiction?: any }) => {
  const normalizedAddress = normalizeAddressVariants(input.address)[0] || input.address;
  const addressVariants = [normalizedAddress, ...normalizeAddressVariants(input.address)].filter(Boolean);
  const geocode = await geocodeAddress({ address: normalizedAddress, addressVariants, jurisdiction: input.jurisdiction });
  return {
    normalizedAddress,
    addressVariants,
    geocode
  };
};

loadCacheFromStorage();
