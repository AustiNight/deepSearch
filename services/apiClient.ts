import { resolveProxyBaseUrl } from "./proxyBaseUrl";

const API_PREFIX = "/api/";

const isBrowser = () => typeof window !== "undefined";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const getBaseUrl = () => {
  const base = resolveProxyBaseUrl();
  return base ? normalizeBaseUrl(base) : "";
};

const buildApiUrl = (input: string) => {
  if (!input) throw new Error("API path required.");
  if (input.startsWith("http://") || input.startsWith("https://")) {
    const base = getBaseUrl();
    if (!base) throw new Error("API base URL not configured.");
    const parsed = new URL(input);
    const baseUrl = new URL(base);
    if (parsed.origin !== baseUrl.origin) {
      throw new Error("Blocked non same-origin API request.");
    }
    if (!parsed.pathname.startsWith(API_PREFIX)) {
      throw new Error("Blocked non-API endpoint request.");
    }
    return input;
  }
  if (!input.startsWith(API_PREFIX)) {
    throw new Error("Blocked non-API endpoint request.");
  }
  const base = getBaseUrl();
  return base ? `${base}${input}` : input;
};

export const apiFetch = async (path: string, init?: RequestInit) => {
  const url = buildApiUrl(path);
  try {
    return await fetch(url, init);
  } catch (error) {
    if ((error as any)?.name === "AbortError") throw error;
    const message = error instanceof Error ? error.message : String(error ?? "Unknown fetch error");
    throw new Error(`Failed to fetch API endpoint ${url}: ${message}`);
  }
};

export const directFetch = async (url: string, init?: RequestInit) => {
  if (isBrowser()) {
    throw new Error("Direct fetch blocked in browser.");
  }
  try {
    return await fetch(url, init);
  } catch (error) {
    if ((error as any)?.name === "AbortError") throw error;
    const message = error instanceof Error ? error.message : String(error ?? "Unknown fetch error");
    throw new Error(`Failed to fetch URL ${url}: ${message}`);
  }
};
