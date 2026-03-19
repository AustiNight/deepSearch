import type { GeocodeResult, GeocodeInput } from "./parcelResolution";
import type { Jurisdiction } from "../types";
import { normalizeAddressVariants } from "./addressNormalization";
import { OPEN_DATA_GEOCODE_CACHE_TTL_MS, OPEN_DATA_GEOCODE_RATE_LIMIT_MS } from "../constants";
import { enforceRateLimit, fetchJsonWithRetry } from "./openDataHttp";
import { getOpenDataConfig } from "./openDataConfig";
import { readGeocodeCache, writeGeocodeCache } from "./storagePolicy";

type CachedGeocode = {
  value: GeocodeResult | null;
  expiresAt: number;
};

const memoryCache = new Map<string, CachedGeocode>();
const FAILED_GEOCODE_CACHE_TTL_MS = 60 * 1000;

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
const CENSUS_GEOCODER_ENDPOINT = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
const DALLAS_GEOCODER_ENDPOINT = "https://gis.dallascityhall.com/arcgis/rest/services/ToolServices/Dallas_Address_Points_Locator/GeocodeServer/findAddressCandidates";
const ARCGIS_WORLD_GEOCODER_ENDPOINT = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";

const loadCacheFromStorage = () => {
  const cached = readGeocodeCache();
  Object.entries(cached).forEach(([key, entry]) => {
    if (!entry || typeof entry !== "object") return;
    const expiresAt = Number((entry as any).expiresAt);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return;
    memoryCache.set(key, { value: (entry as any).value ?? null, expiresAt });
  });
};

const persistCache = () => {
  const payload: Record<string, CachedGeocode> = {};
  memoryCache.forEach((entry, key) => {
    if (entry.expiresAt > Date.now()) payload[key] = entry;
  });
  writeGeocodeCache(payload);
};

const cacheKey = (address: string) => address.toLowerCase().replace(/\s+/g, " ").trim();

const getCached = (address: string): GeocodeResult | null | undefined => {
  const key = cacheKey(address);
  const entry = memoryCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.value;
  if (entry) memoryCache.delete(key);
  return undefined;
};

const setCached = (address: string, value: GeocodeResult | null, ttlMs = OPEN_DATA_GEOCODE_CACHE_TTL_MS) => {
  const key = cacheKey(address);
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
  persistCache();
};

const parseConfidence = (value: unknown, scale = 1) => {
  if (typeof value === "number" && Number.isFinite(value)) return value / scale;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed / scale;
  }
  return undefined;
};

const parsePoint = (latValue: unknown, lonValue: unknown) => {
  const lat = Number(latValue);
  const lon = Number(lonValue);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
};

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

const buildCensusUrl = (address: string) => {
  const params = new URLSearchParams({
    address,
    benchmark: "Public_AR_Current",
    format: "json"
  });
  return `${CENSUS_GEOCODER_ENDPOINT}?${params.toString()}`;
};

const buildDallasGeocoderUrl = (address: string) => {
  const params = new URLSearchParams({
    f: "pjson",
    SingleLine: address,
    outSR: "4326",
    maxLocations: "1"
  });
  return `${DALLAS_GEOCODER_ENDPOINT}?${params.toString()}`;
};

const buildArcGisWorldGeocoderUrl = (address: string, apiKey?: string) => {
  const params = new URLSearchParams({
    f: "pjson",
    SingleLine: address,
    outSR: "4326",
    maxLocations: "1"
  });
  if (apiKey) {
    params.set("token", apiKey);
  }
  return `${ARCGIS_WORLD_GEOCODER_ENDPOINT}?${params.toString()}`;
};

const isLikelyDallasJurisdiction = (jurisdiction?: Jurisdiction) => {
  const city = String(jurisdiction?.city || "").toLowerCase();
  const county = String(jurisdiction?.county || "").toLowerCase();
  const state = String(jurisdiction?.state || "").toLowerCase();
  const dallasLike = city.includes("dallas") || county.includes("dallas");
  const texasLike = !state || state === "tx" || state === "texas";
  return dallasLike && texasLike;
};

const isLikelyUsJurisdiction = (jurisdiction?: Jurisdiction, address?: string) => {
  const country = String(jurisdiction?.country || "").toLowerCase();
  if (country === "us" || country === "usa" || country === "united states") return true;
  const value = String(address || "");
  return /\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/i.test(value);
};

const geocodeWithDallas = async (address: string): Promise<GeocodeResult | null> => {
  await enforceRateLimit("geocode:dallas", OPEN_DATA_GEOCODE_RATE_LIMIT_MS);
  const response = await fetchJsonWithRetry<any>(buildDallasGeocoderUrl(address), { retries: 1, minDelayMs: 400 }, {
    portalType: "arcgis",
    portalUrl: "https://gis.dallascityhall.com"
  });
  if (!response.ok || !response.data) return null;
  const candidates = Array.isArray(response.data?.candidates) ? response.data.candidates : [];
  if (candidates.length === 0) return null;
  const first = candidates[0];
  const point = parsePoint(first?.location?.y, first?.location?.x);
  if (!point) return null;
  return {
    point,
    normalizedAddress: typeof first?.address === "string" ? first.address : address,
    provider: "dallas-arcgis",
    confidence: parseConfidence(first?.score, 100)
  };
};

const geocodeWithCensus = async (address: string): Promise<GeocodeResult | null> => {
  await enforceRateLimit("geocode:census", OPEN_DATA_GEOCODE_RATE_LIMIT_MS);
  const response = await fetchJsonWithRetry<any>(buildCensusUrl(address), { retries: 1, minDelayMs: 400 }, {
    portalType: "unknown",
    portalUrl: "https://geocoding.geo.census.gov"
  });
  if (!response.ok || !response.data) return null;
  const matches = Array.isArray(response.data?.result?.addressMatches)
    ? response.data.result.addressMatches
    : [];
  if (matches.length === 0) return null;
  const first = matches[0];
  const point = parsePoint(first?.coordinates?.y, first?.coordinates?.x);
  if (!point) return null;
  return {
    point,
    normalizedAddress: typeof first?.matchedAddress === "string" ? first.matchedAddress : address,
    provider: "census",
    confidence: parseConfidence(first?.score, 100)
  };
};

const geocodeWithArcGisWorld = async (address: string): Promise<GeocodeResult | null> => {
  const config = getOpenDataConfig();
  const apiKey = (config.auth.arcgisApiKey || "").trim();
  if (!apiKey) return null;
  await enforceRateLimit("geocode:arcgis-world", OPEN_DATA_GEOCODE_RATE_LIMIT_MS);
  const response = await fetchJsonWithRetry<any>(buildArcGisWorldGeocoderUrl(address, apiKey), { retries: 1, minDelayMs: 400 }, {
    portalType: "arcgis",
    portalUrl: "https://geocode.arcgis.com"
  });
  if (!response.ok || !response.data) return null;
  const candidates = Array.isArray(response.data?.candidates) ? response.data.candidates : [];
  if (candidates.length === 0) return null;
  const first = candidates[0];
  const point = parsePoint(first?.location?.y, first?.location?.x);
  if (!point) return null;
  return {
    point,
    normalizedAddress: typeof first?.address === "string" ? first.address : address,
    provider: "arcgis-world",
    confidence: parseConfidence(first?.score, 100)
  };
};

const geocodeWithNominatim = async (address: string): Promise<GeocodeResult | null> => {
  const config = getOpenDataConfig();
  await enforceRateLimit("geocode:nominatim", OPEN_DATA_GEOCODE_RATE_LIMIT_MS);
  const response = await fetchJsonWithRetry<any[]>(buildNominatimUrl(address, config.auth.geocodingEmail), { retries: 1, minDelayMs: 500 }, {
    portalType: "unknown",
    portalUrl: "https://nominatim.openstreetmap.org"
  });
  if (!response.ok || !Array.isArray(response.data) || response.data.length === 0) return null;
  const first = response.data[0];
  const point = parsePoint(first?.lat, first?.lon);
  if (!point) return null;
  return {
    point,
    normalizedAddress: typeof first?.display_name === "string" ? first.display_name : address,
    provider: "nominatim",
    confidence: parseConfidence(first?.importance) ?? parseConfidence(first?.confidence)
  };
};

const uniqueAddresses = (input: string[]) => {
  const seen = new Set<string>();
  const out: string[] = [];
  input.forEach((value) => {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(normalized);
  });
  return out;
};

export const geocodeAddress = async (input: GeocodeInput): Promise<GeocodeResult | null> => {
  const address = input.address.trim();
  if (!address) return null;

  const candidates = uniqueAddresses([
    address,
    ...(Array.isArray(input.addressVariants) ? input.addressVariants : [])
  ]);

  for (const candidate of candidates) {
    const cached = getCached(candidate);
    if (cached !== undefined) {
      if (cached) {
        if (candidate !== address) {
          setCached(address, cached);
        }
        return cached;
      }
      continue;
    }

    let resolved: GeocodeResult | null = null;
    if (isLikelyDallasJurisdiction(input.jurisdiction)) {
      resolved = await geocodeWithDallas(candidate);
    }
    if (!resolved && isLikelyUsJurisdiction(input.jurisdiction, candidate)) {
      resolved = await geocodeWithCensus(candidate);
    }
    if (!resolved) {
      resolved = await geocodeWithArcGisWorld(candidate);
    }
    if (!resolved) {
      resolved = await geocodeWithNominatim(candidate);
    }

    if (resolved) {
      setCached(candidate, resolved);
      if (candidate !== address) {
        setCached(address, resolved);
      }
      return resolved;
    }

    setCached(candidate, null, FAILED_GEOCODE_CACHE_TTL_MS);
  }

  setCached(address, null, FAILED_GEOCODE_CACHE_TTL_MS);
  return null;
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
