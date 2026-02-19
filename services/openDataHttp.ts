import type { OpenDataPortalType } from "../types";
import { recordPortalError } from "./portalErrorTelemetry";
import { apiFetch } from "./apiClient";

export type PortalRequestContext = {
  portalType?: OpenDataPortalType;
  portalUrl?: string;
  endpoint?: string;
};

export type FetchResult<T> =
  | { ok: true; status: number; data: T; headers: Headers }
  | { ok: false; status: number; data: null; error: string; headers: Headers };

const rateLimitState = new Map<string, number>();

export const enforceRateLimit = async (key: string, minIntervalMs: number) => {
  if (!minIntervalMs || minIntervalMs <= 0) return;
  const now = Date.now();
  const last = rateLimitState.get(key) || 0;
  const waitMs = last + minIntervalMs - now;
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  rateLimitState.set(key, Date.now());
};

const parseRetryAfterMs = (headers: Headers) => {
  const retryAfter = headers.get("retry-after");
  if (!retryAfter) return null;
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const parsed = Date.parse(retryAfter);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, parsed - Date.now());
};

const shouldRetry = (status: number) => {
  return status === 429 || status === 503 || status === 500 || status === 502 || status === 504;
};

const recordError = (context: PortalRequestContext, status: number, kind?: "network" | "invalid_json") => {
  recordPortalError({
    status,
    portalType: context.portalType,
    portalUrl: context.portalUrl,
    endpoint: context.endpoint,
    kind: kind === "invalid_json" ? "invalid_json" : kind === "network" ? "network" : undefined
  });
};

const buildHeaders = (headers?: Record<string, string>) => {
  if (!headers) return undefined;
  const normalized: Record<string, string> = {};
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (trimmed) normalized[key] = trimmed;
  });
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const proxyFetch = async (
  url: string,
  options: { headers?: Record<string, string>; signal?: AbortSignal },
  context: PortalRequestContext
) => {
  const body = {
    url,
    headers: options.headers,
    portalType: context.portalType,
    portalUrl: context.portalUrl
  };
  return apiFetch("/api/open-data/fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options.signal
  });
};

export const fetchJsonWithRetry = async <T>(
  url: string,
  options: { headers?: Record<string, string>; signal?: AbortSignal; retries?: number; minDelayMs?: number } = {},
  context: PortalRequestContext = {}
): Promise<FetchResult<T>> => {
  const retries = Math.max(0, Math.floor(options.retries ?? 2));
  const minDelayMs = Math.max(0, options.minDelayMs ?? 200);
  const headers = buildHeaders(options.headers);
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const res = await proxyFetch(url, { headers, signal: options.signal }, context);
      if (!res.ok) {
        recordError({ ...context, endpoint: url }, res.status);
        if (attempt < retries && shouldRetry(res.status)) {
          const retryAfterMs = parseRetryAfterMs(res.headers);
          const backoff = retryAfterMs ?? minDelayMs * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          attempt += 1;
          continue;
        }
        return { ok: false, status: res.status, data: null, error: `HTTP ${res.status}`, headers: res.headers };
      }
      try {
        const data = await res.json();
        return { ok: true, status: res.status, data: data as T, headers: res.headers };
      } catch (err) {
        recordError({ ...context, endpoint: url }, res.status, "invalid_json");
        return { ok: false, status: res.status, data: null, error: "Invalid JSON", headers: res.headers };
      }
    } catch (err) {
      recordError({ ...context, endpoint: url }, 0, "network");
      if (attempt < retries) {
        const backoff = minDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        attempt += 1;
        continue;
      }
      return { ok: false, status: 0, data: null, error: "Network error", headers: new Headers() };
    }
  }
  return { ok: false, status: 0, data: null, error: "Retry exhausted", headers: new Headers() };
};

export const fetchTextWithRetry = async (
  url: string,
  options: { headers?: Record<string, string>; signal?: AbortSignal; retries?: number; minDelayMs?: number } = {},
  context: PortalRequestContext = {}
): Promise<FetchResult<string>> => {
  const retries = Math.max(0, Math.floor(options.retries ?? 2));
  const minDelayMs = Math.max(0, options.minDelayMs ?? 200);
  const headers = buildHeaders(options.headers);
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const res = await proxyFetch(url, { headers, signal: options.signal }, context);
      if (!res.ok) {
        recordError({ ...context, endpoint: url }, res.status);
        if (attempt < retries && shouldRetry(res.status)) {
          const retryAfterMs = parseRetryAfterMs(res.headers);
          const backoff = retryAfterMs ?? minDelayMs * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          attempt += 1;
          continue;
        }
        return { ok: false, status: res.status, data: null, error: `HTTP ${res.status}`, headers: res.headers };
      }
      const data = await res.text();
      return { ok: true, status: res.status, data, headers: res.headers };
    } catch (err) {
      recordError({ ...context, endpoint: url }, 0, "network");
      if (attempt < retries) {
        const backoff = minDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        attempt += 1;
        continue;
      }
      return { ok: false, status: 0, data: null, error: "Network error", headers: new Headers() };
    }
  }
  return { ok: false, status: 0, data: null, error: "Retry exhausted", headers: new Headers() };
};
