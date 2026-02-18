/**
 * Canonical sources schema:
 * - uri: normalized URL (lowercased host, no hash, tracking params removed).
 * - title: preferred title, falls back to domain or uri.
 * - domain: hostname without www.
 * - provider: source provider (openai | google | system | unknown).
 * - kind: web | citation | unknown.
 * - snippet: optional source snippet.
 *
 * Normalization rules:
 * - Accept http/https only; strip hash and common tracking params.
 * - Remove default ports; keep path and query (minus tracking).
 * - Dedupe by normalized uri (first win).
 */
const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "yclid",
  "mc_cid",
  "mc_eid",
  "ref",
  "ref_src",
  "igshid",
  "spm",
  "mkt_tok"
]);

const MAX_URL_LENGTH = 2048;

const isNonEmptyString = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

const normalizeDomain = (url) => {
  return url.hostname.replace(/^www\./i, "").toLowerCase();
};

const normalizeUrlString = (value, errors) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_URL_LENGTH) {
    errors.push(`URL too long: ${trimmed.slice(0, 120)}...`);
    return null;
  }

  let url = null;
  try {
    url = new URL(trimmed);
  } catch (_) {
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
      try {
        url = new URL(`https://${trimmed}`);
      } catch (err) {
        errors.push(`Invalid URL: ${trimmed}`);
        return null;
      }
    } else {
      errors.push(`Invalid URL: ${trimmed}`);
      return null;
    }
  }

  if (!url) return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    errors.push(`Unsupported protocol: ${url.protocol}`);
    return null;
  }

  url.hash = "";
  if (url.protocol === "http:" && url.port === "80") url.port = "";
  if (url.protocol === "https:" && url.port === "443") url.port = "";

  const params = url.searchParams;
  for (const key of Array.from(params.keys())) {
    const lower = key.toLowerCase();
    if (lower.startsWith("utm_") || TRACKING_PARAMS.has(lower)) {
      params.delete(key);
    }
  }

  if (url.pathname === "/") url.pathname = "";

  return url.toString();
};

const buildDiagnostics = (provider) => ({
  provider,
  toolUsage: [],
  rawSourceCount: 0,
  normalizedSourceCount: 0,
  dedupedCount: 0,
  parseErrors: [],
  fallbackUsed: false
});

const normalizeCandidates = (candidates, provider, diagnostics) => {
  diagnostics.rawSourceCount = candidates.length;
  const seen = new Map();

  for (const candidate of candidates) {
    const uriRaw = isNonEmptyString(candidate.uri) ? candidate.uri : undefined;
    if (!uriRaw) {
      diagnostics.parseErrors.push("Missing URI on source candidate.");
      continue;
    }

    const normalizedUri = normalizeUrlString(uriRaw, diagnostics.parseErrors);
    if (!normalizedUri) continue;

    const titleRaw = isNonEmptyString(candidate.title) ? candidate.title.trim() : "";
    const url = new URL(normalizedUri);
    const domain = normalizeDomain(url);
    const title = titleRaw || domain || normalizedUri;
    const kind = candidate.kind || "unknown";
    const snippet = isNonEmptyString(candidate.snippet) ? candidate.snippet.trim() : undefined;

    if (!seen.has(normalizedUri)) {
      const source = {
        uri: normalizedUri,
        title,
        domain,
        provider,
        kind
      };
      if (snippet) source.snippet = snippet;
      seen.set(normalizedUri, source);
    }
  }

  diagnostics.normalizedSourceCount = seen.size;
  diagnostics.dedupedCount = Math.max(0, diagnostics.rawSourceCount - diagnostics.normalizedSourceCount);

  return Array.from(seen.values());
};

const extractUrlsFromText = (text) => {
  const urls = [];
  if (!text) return urls;
  const pattern = /https?:\/\/[^\s<>")\]]+/gi;
  const matches = text.match(pattern) || [];
  for (const match of matches) {
    const cleaned = match.replace(/[),.;]+$/, "");
    urls.push(cleaned);
  }
  return urls;
};

export const normalizeSourcesFromText = (text, provider) => {
  const diagnostics = buildDiagnostics(provider);
  diagnostics.fallbackUsed = true;
  const urlMatches = extractUrlsFromText(text);
  const candidates = urlMatches.map((uri) => ({ uri, title: uri, kind: "citation" }));
  const sources = normalizeCandidates(candidates, provider, diagnostics);
  return { sources, diagnostics };
};

export const normalizeOpenAIResponseSources = (resp) => {
  const diagnostics = buildDiagnostics("openai");
  const candidates = [];
  const toolUsage = new Set();

  const output = Array.isArray(resp?.output) ? resp.output : [];

  for (const item of output) {
    if (item?.type === "message" && Array.isArray(item?.content)) {
      for (const part of item.content) {
        const annotations = Array.isArray(part?.annotations) ? part.annotations : [];
        for (const ann of annotations) {
          if (ann?.type === "url_citation" && isNonEmptyString(ann?.url)) {
            candidates.push({
              uri: ann.url,
              title: isNonEmptyString(ann?.title) ? ann.title : undefined,
              kind: "citation"
            });
          }
        }
      }
    }

    if (item?.type === "web_search_call") {
      toolUsage.add("web_search");
      if (Array.isArray(item?.action?.sources)) {
        for (const src of item.action.sources) {
          candidates.push({
            uri: isNonEmptyString(src?.url) ? src.url : src?.uri,
            title: isNonEmptyString(src?.title) ? src.title : src?.name,
            snippet: isNonEmptyString(src?.snippet) ? src.snippet : undefined,
            kind: "web"
          });
        }
      }
    }

    if (isNonEmptyString(item?.type) && item.type.includes("web_search")) {
      toolUsage.add("web_search");
    }
  }

  diagnostics.toolUsage = Array.from(toolUsage.values());
  const sources = normalizeCandidates(candidates, "openai", diagnostics);
  return { sources, diagnostics };
};

export const normalizeGeminiResponseSources = (resp) => {
  const diagnostics = buildDiagnostics("google");
  const candidates = [];
  const toolUsage = new Set();

  const candidate = Array.isArray(resp?.candidates) ? resp.candidates[0] : null;
  const groundingChunks = candidate?.groundingMetadata?.groundingChunks;
  if (Array.isArray(groundingChunks)) {
    toolUsage.add("googleSearch");
    for (const chunk of groundingChunks) {
      const web = chunk?.web;
      if (!web) continue;
      candidates.push({
        uri: web?.uri,
        title: web?.title,
        snippet: web?.snippet,
        kind: "web"
      });
    }
  }

  if (candidate?.groundingMetadata) {
    toolUsage.add("googleSearch");
  }

  diagnostics.toolUsage = Array.from(toolUsage.values());
  const sources = normalizeCandidates(candidates, "google", diagnostics);
  return { sources, diagnostics };
};

const truncate = (value, max) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
};

export const formatSourceDiagnosticsMessage = (input) => {
  const { provider, model, query, diagnostics } = input;
  const toolLabel = diagnostics.toolUsage.length > 0 ? diagnostics.toolUsage.join(",") : "none";
  const errorCount = diagnostics.parseErrors.length;
  const base = [
    "Source metrics",
    `provider=${provider}`,
    model ? `model=${model}` : undefined,
    `tools=${toolLabel}`,
    `raw=${diagnostics.rawSourceCount}`,
    `normalized=${diagnostics.normalizedSourceCount}`,
    `deduped=${diagnostics.dedupedCount}`,
    `errors=${errorCount}`,
    `fallback=${diagnostics.fallbackUsed ? "yes" : "no"}`
  ].filter(Boolean).join(" ");

  const querySnippet = query ? ` query="${truncate(query, 80)}"` : "";
  const errorSnippet = errorCount > 0
    ? ` error_sample="${truncate(diagnostics.parseErrors[0], 120)}"`
    : "";

  return `${base}${querySnippet}${errorSnippet}`;
};

export const recordEmptySources = ({ provider, model, query }) => {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    const key = "overseer_empty_sources";
    const raw = window.sessionStorage.getItem(key);
    let parsed = [];
    if (raw) {
      parsed = JSON.parse(raw);
    }
    const entries = Array.isArray(parsed) ? parsed : [];
    const entry = {
      provider,
      model,
      query: query ? query.slice(0, 160) : "",
      timestamp: Date.now()
    };
    entries.push(entry);
    const capped = entries.slice(-100);
    window.sessionStorage.setItem(key, JSON.stringify(capped));
  } catch (_) {
    return;
  }
};
