import { resolveProxyBaseUrl } from "./proxyBaseUrl";

const API_PREFIX = "/api/";

const isBrowser = () => typeof window !== "undefined";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const buildApiFetchHint = (url: string) => {
  if (!isBrowser()) return "";
  try {
    const target = new URL(url, window.location.origin);
    if (!target.pathname.startsWith(API_PREFIX)) return "";
    const crossOrigin = target.origin !== window.location.origin;
    if (crossOrigin) {
      return ` Cross-origin API target (${target.origin}) detected. Ensure ALLOWED_ORIGINS includes ${window.location.origin} and that Cloudflare Access session/auth is valid for ${target.origin}.`;
    }
    return " API request appears same-origin. If this persists, re-authenticate with Cloudflare Access and retry.";
  } catch (_) {
    return "";
  }
};

const getBaseUrl = () => {
  const base = resolveProxyBaseUrl();
  return base ? normalizeBaseUrl(base) : "";
};

const isAccessLoginRedirect = (response: Response) => {
  if (response.type === "opaqueredirect") return true;
  if (response.status < 300 || response.status >= 400) return false;
  const location = response.headers.get("location") || "";
  if (!location) return false;
  const normalized = location.toLowerCase();
  return normalized.includes("cloudflareaccess.com") || normalized.includes("/cdn-cgi/access/login/");
};

const diagnoseAccessAuthFailure = async (url: string) => {
  if (!isBrowser()) return null;
  try {
    const probe = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      redirect: "manual",
    });
    if (isAccessLoginRedirect(probe)) {
      return "Cloudflare Access authentication is required or expired. Re-authenticate and retry.";
    }
  } catch (_) {
    // Ignore probe failures and fall back to the original fetch error.
  }
  return null;
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
    const accessAuthMessage = await diagnoseAccessAuthFailure(url);
    const message = accessAuthMessage || (error instanceof Error ? error.message : String(error ?? "Unknown fetch error"));
    const hint = buildApiFetchHint(url);
    throw new Error(`Failed to fetch API endpoint ${url}: ${message}${hint}`);
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
