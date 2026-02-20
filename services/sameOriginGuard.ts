import { resolveProxyBaseUrl } from "./proxyBaseUrl";

const API_PREFIX = "/api/";

const resolveAllowedOrigin = () => {
  const base = resolveProxyBaseUrl();
  if (base) {
    try {
      return new URL(base).origin;
    } catch (_) {
      return base;
    }
  }
  return window.location.origin;
};

const resolveRequestUrl = (input: RequestInfo | URL) => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

declare global {
  interface Window {
    __sameOriginFetchGuardInstalled?: boolean;
  }
}

export const installSameOriginFetchGuard = () => {
  if (typeof window === "undefined") return;
  if (window.__sameOriginFetchGuardInstalled) return;
  if (typeof window.fetch !== "function") return;

  const allowedOrigin = resolveAllowedOrigin();
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = resolveRequestUrl(input);
    const resolved = new URL(raw, window.location.origin);

    if (resolved.origin !== allowedOrigin) {
      throw new Error("Blocked cross-origin fetch. Use same-origin /api/* endpoints.");
    }
    if (!resolved.pathname.startsWith(API_PREFIX)) {
      throw new Error("Blocked non-API fetch. Use /api/* endpoints.");
    }

    return originalFetch(input, init);
  };

  window.__sameOriginFetchGuardInstalled = true;
};
