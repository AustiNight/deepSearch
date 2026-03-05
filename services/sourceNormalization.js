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
const MAX_FALLBACK_DATASET_RESOURCE_CANDIDATES = 40;
const URL_LIKE_PATTERN = /(?:https?:\/\/|www\.)[^\s<>")\]]+|(?:\b[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+(?:\/[^\s<>")\]]*)?)/gi;
const DATASET_ID_PATTERN = /\b[a-z0-9]{4}-[a-z0-9]{4}\b/gi;

const URL_FIELD_KEYS = [
  "url",
  "uri",
  "href",
  "link",
  "sourceUrl",
  "sourceURL",
  "webUrl",
  "webURL",
  "dataUrl",
  "dataURL",
  "homepageUrl",
  "homepageURL",
  "endpoint"
];
const TITLE_FIELD_KEYS = ["title", "name", "label", "sourceTitle", "description"];
const SNIPPET_FIELD_KEYS = ["snippet", "summary", "excerpt", "quote", "context"];
const PORTAL_FIELD_KEYS = ["portalUrl", "portal", "domain", "host", "site"];

const isNonEmptyString = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

const normalizeDomain = (url) => {
  return url.hostname.replace(/^www\./i, "").toLowerCase();
};

const cleanToken = (value) => {
  return String(value || "")
    .trim()
    .replace(/^[("'[\s]+/, "")
    .replace(/[)"'\].,;:!?]+$/, "");
};

const normalizeDatasetId = (value) => {
  const match = String(value || "").toLowerCase().match(DATASET_ID_PATTERN);
  return match ? match[0] : null;
};

const normalizeHostCandidate = (value) => {
  const token = cleanToken(value);
  if (!token || token.includes("@")) return null;
  const withoutProtocol = token
    .replace(/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//, "")
    .replace(/^\/+/, "");
  const host = withoutProtocol
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();
  if (!host || host.includes("_")) return null;
  const labels = host.split(".").filter(Boolean);
  if (labels.length < 2) return null;
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,63}$/i.test(tld)) return null;
  if (!labels.every((label) => /^[a-z0-9-]+$/i.test(label) && !label.startsWith("-") && !label.endsWith("-"))) {
    return null;
  }
  return host;
};

const toHttpsIfDomainLike = (value) => {
  const token = cleanToken(value);
  if (!token) return null;
  if (/^https?:\/\//i.test(token)) return token;
  if (!normalizeHostCandidate(token)) return null;
  return `https://${token}`;
};

const extractDatasetIds = (text) => {
  const out = new Set();
  if (!isNonEmptyString(text)) return out;
  for (const match of String(text).toLowerCase().matchAll(DATASET_ID_PATTERN)) {
    if (match[0]) out.add(match[0]);
  }
  return out;
};

const extractUrlLikeTokens = (text) => {
  if (!isNonEmptyString(text)) return [];
  const out = [];
  const matches = String(text).match(URL_LIKE_PATTERN) || [];
  for (const rawMatch of matches) {
    const cleaned = cleanToken(rawMatch);
    if (!cleaned) continue;
    const uri = toHttpsIfDomainLike(cleaned);
    if (!uri) continue;
    out.push(uri);
  }
  return out;
};

const getStringField = (obj, keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (isNonEmptyString(value)) return value.trim();
  }
  return undefined;
};

const getObjectDomains = (obj) => {
  const domains = new Set();
  for (const key of PORTAL_FIELD_KEYS) {
    const value = obj?.[key];
    if (!isNonEmptyString(value)) continue;
    const host = normalizeHostCandidate(value);
    if (host) domains.add(host);
  }
  return domains;
};

const pushCandidate = (state, input) => {
  if (!input) return;
  const uri = toHttpsIfDomainLike(input.uri || input.url || "");
  if (!uri) return;
  state.candidates.push({
    uri,
    title: isNonEmptyString(input.title) ? input.title : undefined,
    snippet: isNonEmptyString(input.snippet) ? input.snippet : undefined,
    kind: input.kind || "citation"
  });
  const host = normalizeHostCandidate(uri);
  if (host) state.domains.add(host);
};

const createFallbackExtractionState = () => ({
  candidates: [],
  domains: new Set(),
  datasetIds: new Set()
});

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

const collectFromText = (text, state) => {
  const tokens = extractUrlLikeTokens(text);
  tokens.forEach((uri) => {
    pushCandidate(state, { uri, title: uri, kind: "citation" });
  });
  const datasetIds = extractDatasetIds(text);
  datasetIds.forEach((datasetId) => state.datasetIds.add(datasetId));
};

const collectDatasetIdsFromObject = (obj, state) => {
  for (const [key, value] of Object.entries(obj || {})) {
    if (!isNonEmptyString(value)) continue;
    const normalized = normalizeDatasetId(value);
    if (!normalized) continue;
    const lowerKey = String(key || "").toLowerCase();
    const shouldAccept =
      lowerKey.includes("dataset")
      || lowerKey.includes("resource")
      || lowerKey.includes("view")
      || lowerKey.includes("table")
      || (lowerKey === "id" && (isNonEmptyString(obj?.portalUrl) || isNonEmptyString(obj?.portal) || isNonEmptyString(obj?.domain)));
    if (!shouldAccept) continue;
    state.datasetIds.add(normalized);
  }
};

const collectFromObject = (value, state, depth = 0) => {
  if (depth > 8 || value == null) return;
  if (typeof value === "string") {
    collectFromText(value, state);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectFromObject(item, state, depth + 1));
    return;
  }
  if (typeof value !== "object") return;

  const obj = value;

  const objectDomains = getObjectDomains(obj);
  objectDomains.forEach((domain) => state.domains.add(domain));
  collectDatasetIdsFromObject(obj, state);

  const directUri = getStringField(obj, URL_FIELD_KEYS);
  if (directUri) {
    pushCandidate(state, {
      uri: directUri,
      title: getStringField(obj, TITLE_FIELD_KEYS),
      snippet: getStringField(obj, SNIPPET_FIELD_KEYS),
      kind: "citation"
    });
  }

  const explicitDatasetId = normalizeDatasetId(obj?.datasetId || obj?.resourceId || obj?.viewId || obj?.tableId);
  if (explicitDatasetId) {
    state.datasetIds.add(explicitDatasetId);
    objectDomains.forEach((domain) => {
      pushCandidate(state, {
        uri: `https://${domain}/resource/${explicitDatasetId}`,
        title: getStringField(obj, TITLE_FIELD_KEYS),
        snippet: getStringField(obj, SNIPPET_FIELD_KEYS),
        kind: "citation"
      });
    });
  }

  for (const [key, nested] of Object.entries(obj)) {
    const lowerKey = String(key || "").toLowerCase();
    if (lowerKey.includes("dataset") && isNonEmptyString(nested)) {
      const datasetId = normalizeDatasetId(nested);
      if (datasetId) state.datasetIds.add(datasetId);
    }
    collectFromObject(nested, state, depth + 1);
  }
};

const appendDatasetResourceCandidates = (state) => {
  if (state.datasetIds.size === 0 || state.domains.size === 0) return;
  let emitted = 0;
  for (const domain of state.domains.values()) {
    if (emitted >= MAX_FALLBACK_DATASET_RESOURCE_CANDIDATES) break;
    for (const datasetId of state.datasetIds.values()) {
      if (emitted >= MAX_FALLBACK_DATASET_RESOURCE_CANDIDATES) break;
      pushCandidate(state, {
        uri: `https://${domain}/resource/${datasetId}`,
        title: `${domain} dataset ${datasetId}`,
        kind: "citation"
      });
      emitted += 1;
    }
  }
};

export const normalizeSourcesFromText = (text, provider) => {
  const diagnostics = buildDiagnostics(provider);
  diagnostics.fallbackUsed = true;
  const state = createFallbackExtractionState();
  collectFromText(text, state);
  appendDatasetResourceCandidates(state);
  const sources = normalizeCandidates(state.candidates, provider, diagnostics);
  return { sources, diagnostics };
};

export const normalizeSourcesFromResponse = (resp, provider) => {
  const diagnostics = buildDiagnostics(provider);
  diagnostics.fallbackUsed = true;
  const state = createFallbackExtractionState();
  collectFromObject(resp, state);
  appendDatasetResourceCandidates(state);
  const sources = normalizeCandidates(state.candidates, provider, diagnostics);
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

const EMPTY_SOURCE_MAX_ENTRIES = 100;
const emptySourceEntries = [];

export const recordEmptySources = ({ provider, model, query }) => {
  const entry = {
    provider,
    model,
    query: query ? query.slice(0, 160) : "",
    timestamp: Date.now()
  };
  emptySourceEntries.push(entry);
  if (emptySourceEntries.length > EMPTY_SOURCE_MAX_ENTRIES) {
    emptySourceEntries.splice(0, emptySourceEntries.length - EMPTY_SOURCE_MAX_ENTRIES);
  }
};
