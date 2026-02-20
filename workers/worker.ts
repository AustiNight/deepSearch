import { GoogleGenAI } from "@google/genai";
import { buildAllowlistMetadata, hashEntries, hashValue, stripSettingsForKv } from "./kvPolicy";
import { installLogRedactionGuard, redactSensitiveValue } from "../services/redaction";

export interface Env {
  OPENAI_API_KEY: string;
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS?: string;
  ACCESS_ALLOWLIST_KV: KVNamespace;
  SETTINGS_KV: KVNamespace;
  ALLOWLIST_ADMIN_EMAILS?: string;
  CF_API_TOKEN?: string;
  CF_ACCOUNT_ID?: string;
  CF_ACCESS_APP_ID?: string;
  CF_ACCESS_POLICY_ID?: string;
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
};

const ACCESS_ALLOWLIST_KEY = "access_allowlist";
const SETTINGS_KEY_PREFIX = "user_settings:";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MODEL_NAME_PATTERN = /^[A-Za-z0-9._:-]+$/;
const MAX_ALLOWLIST_ENTRIES = 500;
const MAX_ALLOWLIST_BODY_BYTES = 50_000;
const MAX_SETTINGS_BODY_BYTES = 50_000;
const MAX_OPEN_DATA_PROXY_BODY_BYTES = 20_000;
const SETTINGS_SCHEMA_VERSION = 1;
const ACCESS_JWT_HEADER = "Cf-Access-Jwt-Assertion";
const ACCESS_EMAIL_HEADER = "Cf-Access-Authenticated-User-Email";

const OPEN_DATA_PROXY_ALLOWED_HEADERS = new Set([
  "accept",
  "x-app-token"
]);

installLogRedactionGuard();

const getCorsHeaders = (origin: string | null, env: Env) => {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  let allowOrigin = "*";
  if (origin) {
    if (allowed.length === 0 || allowed.includes(origin)) {
      allowOrigin = origin;
    } else {
      allowOrigin = allowed[0] || origin;
    }
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": [
      "Content-Type",
      "Authorization",
      "If-Match",
      ACCESS_JWT_HEADER,
      ACCESS_EMAIL_HEADER,
    ].join(", "),
    "Access-Control-Expose-Headers": "ETag",
    "Vary": "Origin",
  };
};

type AllowlistRecord = {
  updatedAt: string;
  updatedBy: string | null;
  version: number;
  count: number;
  entriesHash: string;
};

type RunConfig = {
  minAgents: number;
  maxAgents: number;
  maxMethodAgents: number;
  forceExhaustion: boolean;
  minRounds: number;
  maxRounds: number;
  earlyStopDiminishingScore: number;
  earlyStopNoveltyRatio: number;
  earlyStopNewDomains: number;
  earlyStopNewSources: number;
};

type SettingsPayload = {
  schemaVersion: number;
  provider: "google" | "openai";
  runConfig: RunConfig;
  modelOverrides: Record<string, string>;
};

type SettingsRecord = {
  settings: SettingsPayload;
  updatedAt: string;
  updatedBy: string | null;
  version: number;
};

const MODEL_ROLES = [
  "overseer_planning",
  "method_discovery",
  "sector_analysis",
  "deep_research_l1",
  "deep_research_l2",
  "method_audit",
  "gap_hunter",
  "exhaustion_scout",
  "critique",
  "synthesis",
  "validation",
];

const RUN_CONFIG_DEFAULTS: RunConfig = {
  minAgents: 8,
  maxAgents: 20,
  maxMethodAgents: 8,
  forceExhaustion: false,
  minRounds: 1,
  maxRounds: 2,
  earlyStopDiminishingScore: 0.75,
  earlyStopNoveltyRatio: 0.25,
  earlyStopNewDomains: 1,
  earlyStopNewSources: 3,
};

const getAdminEmails = (env: Env) => {
  const raw = (env.ALLOWLIST_ADMIN_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return new Set(raw);
};

const normalizeAllowlistEntries = (rawEntries: unknown) => {
  if (!Array.isArray(rawEntries)) {
    return { entries: [], invalid: [], error: "entries must be an array of strings." };
  }
  const entries: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  for (const item of rawEntries) {
    if (typeof item !== "string") {
      invalid.push(String(item));
      continue;
    }
    const value = item.trim().toLowerCase();
    if (!value) continue;
    if (!EMAIL_PATTERN.test(value)) {
      invalid.push(value);
      continue;
    }
    if (seen.has(value)) continue;
    seen.add(value);
    entries.push(value);
  }
  return { entries, invalid, error: "" };
};

const getSettingsStorageKey = async (email: string) => {
  const hashed = await hashValue(email);
  return `${SETTINGS_KEY_PREFIX}${hashed}`;
};

const getLegacySettingsKey = (email: string) => `${SETTINGS_KEY_PREFIX}${email}`;

const isPrivateHostname = (hostname: string) => {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".local")) return true;

  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const parts = ipv4Match.slice(1).map((value) => Number(value));
    if (parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return true;
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
    return false;
  }

  if (lower.includes(":")) {
    if (lower === "::1") return true;
    if (lower.startsWith("fe80:")) return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  }

  return false;
};

type OutboundContext = "open-data" | "openai" | "gemini" | "cloudflare";

const OUTBOUND_ALLOWED_HOSTS: Record<Exclude<OutboundContext, "open-data">, Set<string>> = {
  openai: new Set(["api.openai.com"]),
  gemini: new Set(["generativelanguage.googleapis.com"]),
  cloudflare: new Set(["api.cloudflare.com"])
};

const isAllowedOutbound = (url: URL, context: OutboundContext) => {
  if (context === "open-data") {
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (isPrivateHostname(url.hostname)) return false;
    return true;
  }
  const allowed = OUTBOUND_ALLOWED_HOSTS[context];
  if (!allowed || !allowed.has(url.hostname.toLowerCase())) return false;
  return url.protocol === "https:";
};

const logOutboundViolation = (detail: { context: OutboundContext; url: string; reason: string }) => {
  console.warn("Outbound fetch blocked.", redactSensitiveValue(detail));
};

const assertOutboundAllowed = (url: URL, context: OutboundContext) => {
  if (isAllowedOutbound(url, context)) return;
  logOutboundViolation({
    context,
    url: url.toString(),
    reason: context === "open-data" ? "disallowed open-data target" : "host not in allowlist"
  });
  throw new Error("Outbound fetch blocked by allowlist.");
};

const outboundFetch = async (target: string, options: RequestInit, context: OutboundContext) => {
  let url: URL;
  try {
    url = new URL(target);
  } catch (_) {
    throw new Error("Invalid outbound URL.");
  }
  assertOutboundAllowed(url, context);
  return fetch(url.toString(), options);
};

const createScopedFetch = (context: OutboundContext) => {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    return outboundFetch(url, init || {}, context);
  };
};

const sanitizeProxyHeaders = (raw: unknown) => {
  if (!raw || typeof raw !== "object") return {};
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!OPEN_DATA_PROXY_ALLOWED_HEADERS.has(key.toLowerCase())) continue;
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    headers[key] = trimmed;
  }
  if (!headers["Accept"] && !headers["accept"]) {
    headers["Accept"] = "application/json,text/plain;q=0.9,*/*;q=0.8";
  }
  headers["User-Agent"] = "deepsearches-open-data-proxy";
  return headers;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const toNumber = (value: unknown, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeRunConfig = (rawConfig: unknown): RunConfig => {
  const base = (rawConfig && typeof rawConfig === "object") ? (rawConfig as Record<string, unknown>) : {};
  const minAgents = Math.max(1, Math.floor(toNumber(base.minAgents, RUN_CONFIG_DEFAULTS.minAgents)));
  const maxAgents = Math.max(minAgents, Math.floor(toNumber(base.maxAgents, RUN_CONFIG_DEFAULTS.maxAgents)));
  const maxMethodAgents = Math.max(1, Math.floor(toNumber(base.maxMethodAgents, RUN_CONFIG_DEFAULTS.maxMethodAgents)));
  const minRounds = Math.max(1, Math.floor(toNumber(base.minRounds, RUN_CONFIG_DEFAULTS.minRounds)));
  const maxRounds = Math.max(minRounds, Math.floor(toNumber(base.maxRounds, RUN_CONFIG_DEFAULTS.maxRounds)));

  const earlyStopDiminishingScore = clamp(
    toNumber(base.earlyStopDiminishingScore, RUN_CONFIG_DEFAULTS.earlyStopDiminishingScore),
    0,
    1
  );
  const earlyStopNoveltyRatio = clamp(
    toNumber(base.earlyStopNoveltyRatio, RUN_CONFIG_DEFAULTS.earlyStopNoveltyRatio),
    0,
    1
  );
  const earlyStopNewDomains = Math.max(
    0,
    Math.floor(toNumber(base.earlyStopNewDomains, RUN_CONFIG_DEFAULTS.earlyStopNewDomains))
  );
  const earlyStopNewSources = Math.max(
    0,
    Math.floor(toNumber(base.earlyStopNewSources, RUN_CONFIG_DEFAULTS.earlyStopNewSources))
  );

  return {
    minAgents,
    maxAgents,
    maxMethodAgents,
    forceExhaustion: base.forceExhaustion === true,
    minRounds,
    maxRounds,
    earlyStopDiminishingScore,
    earlyStopNoveltyRatio,
    earlyStopNewDomains,
    earlyStopNewSources,
  };
};

const normalizeModelOverrides = (rawOverrides: unknown) => {
  if (!rawOverrides || typeof rawOverrides !== "object") return {};
  const overrides = rawOverrides as Record<string, unknown>;
  const sanitized: Record<string, string> = {};
  for (const role of MODEL_ROLES) {
    const value = overrides[role];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed || !MODEL_NAME_PATTERN.test(trimmed)) continue;
    sanitized[role] = trimmed;
  }
  return sanitized;
};

const normalizeSettingsPayload = (rawPayload: unknown) => {
  if (!rawPayload || typeof rawPayload !== "object") {
    return { error: "settings payload required." };
  }
  const payload = rawPayload as Record<string, unknown>;
  const schemaVersion = Number(payload.schemaVersion ?? SETTINGS_SCHEMA_VERSION);
  if (schemaVersion !== SETTINGS_SCHEMA_VERSION) {
    return { error: "Unsupported settings schema version." };
  }
  const provider = payload.provider === "openai" ? "openai" : "google";
  const runConfig = normalizeRunConfig(payload.runConfig);
  const modelOverrides = normalizeModelOverrides(payload.modelOverrides);
  const settings: SettingsPayload = {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    provider,
    runConfig,
    modelOverrides,
  };
  return { settings };
};

const summarizeDomains = (entries: string[], max = 5) => {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const [, domainRaw] = entry.split("@");
    if (!domainRaw) continue;
    const domain = domainRaw.toLowerCase();
    counts.set(domain, (counts.get(domain) || 0) + 1);
  }
  const summary = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([domain, count]) => `${domain}:${count}`)
    .join(", ");
  return summary || "none";
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options: RequestInit, attempts = 3, context: OutboundContext) => {
  let lastResponse: Response | null = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await outboundFetch(url, options, context);
    lastResponse = response;
    if (!response.ok && (response.status >= 500 || response.status === 429)) {
      if (attempt < attempts - 1) {
        await delay(400 * (attempt + 1));
        continue;
      }
    }
    return response;
  }
  return lastResponse as Response;
};

const isEmailRule = (rule: unknown) => {
  if (!rule || typeof rule !== "object") return false;
  return "email" in (rule as Record<string, unknown>);
};

const replaceEmailIncludeRules = (includeRules: unknown[], emailRules: Array<Record<string, unknown>>) => {
  const updated: Array<Record<string, unknown>> = [];
  let inserted = false;
  for (const rule of includeRules) {
    if (isEmailRule(rule)) {
      if (!inserted) {
        updated.push(...emailRules);
        inserted = true;
      }
      continue;
    }
    if (rule && typeof rule === "object") {
      updated.push(rule as Record<string, unknown>);
    }
  }
  if (!inserted) {
    updated.push(...emailRules);
  }
  return updated;
};

const getPolicyField = <T>(policy: Record<string, unknown>, snake: string, camel: string) => {
  if (snake in policy) return policy[snake] as T;
  if (camel in policy) return policy[camel] as T;
  return undefined;
};

const fetchAccessPolicy = async (env: Env) => {
  const { CF_API_TOKEN, CF_ACCOUNT_ID, CF_ACCESS_APP_ID, CF_ACCESS_POLICY_ID } = env;
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !CF_ACCESS_APP_ID || !CF_ACCESS_POLICY_ID) {
    throw new Error("Cloudflare Access policy secrets are not configured.");
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/access/apps/${CF_ACCESS_APP_ID}/policies/${CF_ACCESS_POLICY_ID}`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${CF_API_TOKEN}`,
  };

  const currentResponse = await fetchWithRetry(url, { method: "GET", headers }, 3, "cloudflare");
  const currentText = await currentResponse.text();
  let currentJson: any;
  try {
    currentJson = JSON.parse(currentText);
  } catch (_) {
    throw new Error("Unable to parse Cloudflare policy response.");
  }
  if (!currentResponse.ok || !currentJson?.success) {
    throw new Error("Failed to fetch Cloudflare Access policy.");
  }
  return {
    policy: currentJson.result as Record<string, unknown>,
    url,
    headers
  };
};

const extractAllowlistEntries = (policy: Record<string, unknown>) => {
  const includeRules = Array.isArray(policy.include) ? policy.include : [];
  const entries: string[] = [];
  for (const rule of includeRules) {
    if (!rule || typeof rule !== "object") continue;
    const emailRule = (rule as Record<string, any>).email;
    if (!emailRule) continue;
    if (typeof emailRule === "string") {
      entries.push(emailRule);
      continue;
    }
    if (typeof emailRule === "object" && typeof emailRule.email === "string") {
      entries.push(emailRule.email);
    }
  }
  return Array.from(new Set(entries.map((entry) => entry.trim().toLowerCase()).filter(Boolean))).sort();
};

const updateAccessPolicy = async (env: Env, entries: string[]) => {
  const { policy: currentPolicy, url, headers } = await fetchAccessPolicy(env);
  const includeRules = Array.isArray(currentPolicy.include) ? currentPolicy.include : [];
  const emailRules = entries.map((entry) => ({ email: { email: entry } }));
  const updatedInclude = replaceEmailIncludeRules(includeRules, emailRules);
  if (updatedInclude.length === 0) {
    throw new Error("Allowlist update would remove all include rules.");
  }

  const payload: Record<string, unknown> = {
    name: currentPolicy.name,
    decision: currentPolicy.decision,
    include: updatedInclude,
    exclude: getPolicyField(currentPolicy, "exclude", "exclude") || [],
    require: getPolicyField(currentPolicy, "require", "require") || [],
    precedence: getPolicyField<number>(currentPolicy, "precedence", "precedence"),
    session_duration: getPolicyField<string>(currentPolicy, "session_duration", "sessionDuration"),
    purpose_justification_required: getPolicyField<boolean>(
      currentPolicy,
      "purpose_justification_required",
      "purposeJustificationRequired"
    ),
    purpose_justification_prompt: getPolicyField<string>(
      currentPolicy,
      "purpose_justification_prompt",
      "purposeJustificationPrompt"
    ),
    approval_required: getPolicyField<boolean>(currentPolicy, "approval_required", "approvalRequired"),
    approval_groups: getPolicyField<unknown[]>(currentPolicy, "approval_groups", "approvalGroups"),
    isolation_required: getPolicyField<boolean>(currentPolicy, "isolation_required", "isolationRequired"),
  };

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) delete payload[key];
  }

  const updateResponse = await fetchWithRetry(
    url,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    },
    3,
    "cloudflare"
  );
  const updateText = await updateResponse.text();
  let updateJson: any;
  try {
    updateJson = JSON.parse(updateText);
  } catch (_) {
    throw new Error("Unable to parse Cloudflare policy update response.");
  }
  if (!updateResponse.ok || !updateJson?.success) {
    throw new Error("Failed to update Cloudflare Access policy.");
  }
};

const readJsonBody = async (request: Request, maxBytes: number) => {
  const text = await request.text();
  if (text.length > maxBytes) {
    return { error: "Request body too large." };
  }
  try {
    return { data: JSON.parse(text) };
  } catch (_) {
    return { error: "Invalid JSON payload." };
  }
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/api/open-data/fetch") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405, corsHeaders);
      }
      const { data, error } = await readJsonBody(request, MAX_OPEN_DATA_PROXY_BODY_BYTES);
      if (error) {
        return json({ error }, 400, corsHeaders);
      }
      const target = typeof data?.url === "string" ? data.url.trim() : "";
      if (!target) {
        return json({ error: "Target URL required." }, 400, corsHeaders);
      }
      let targetUrl: URL;
      try {
        targetUrl = new URL(target);
      } catch (_) {
        return json({ error: "Invalid target URL." }, 400, corsHeaders);
      }
      if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
        return json({ error: "Unsupported URL protocol." }, 400, corsHeaders);
      }
      if (isPrivateHostname(targetUrl.hostname)) {
        return json({ error: "Blocked private network target." }, 400, corsHeaders);
      }

      const headers = sanitizeProxyHeaders(data?.headers);
      let upstream: Response;
      try {
        upstream = await outboundFetch(targetUrl.toString(), { method: "GET", headers }, "open-data");
      } catch (_) {
        return json({ error: "Upstream fetch failed." }, 502, corsHeaders);
      }

      const responseHeaders = new Headers(corsHeaders);
      const contentType = upstream.headers.get("content-type");
      if (contentType) responseHeaders.set("Content-Type", contentType);
      const cacheControl = upstream.headers.get("cache-control");
      if (cacheControl) responseHeaders.set("Cache-Control", cacheControl);
      const lastModified = upstream.headers.get("last-modified");
      if (lastModified) responseHeaders.set("Last-Modified", lastModified);
      const etag = upstream.headers.get("etag");
      if (etag) responseHeaders.set("ETag", etag);

      return new Response(upstream.body, {
        status: upstream.status,
        headers: responseHeaders
      });
    }

    if (url.pathname === "/api/access/allowlist") {
      if (request.method !== "GET" && request.method !== "POST" && request.method !== "PUT") {
        return json({ error: "Method not allowed" }, 405, corsHeaders);
      }

      const getPolicyTimestamp = (policy: Record<string, unknown>) => {
        return getPolicyField<string>(policy, "updated_at", "updatedAt")
          || getPolicyField<string>(policy, "modified_on", "modifiedOn")
          || null;
      };

      const loadAllowlistSnapshot = async () => {
        const { policy } = await fetchAccessPolicy(env);
        const entries = extractAllowlistEntries(policy);
        const entriesHash = await hashEntries(entries);
        const stored = await env.ACCESS_ALLOWLIST_KV.get<AllowlistRecord>(ACCESS_ALLOWLIST_KEY, "json");
        const policyUpdatedAt = getPolicyTimestamp(policy);
        const updatedAt = stored?.updatedAt || policyUpdatedAt || new Date().toISOString();
        const version = stored?.version || 0;
        const record: AllowlistRecord = {
          updatedAt,
          updatedBy: null,
          version,
          count: entries.length,
          entriesHash,
        };

        if (!stored || stored.entriesHash !== entriesHash || stored.count !== entries.length || stored.updatedBy) {
          await env.ACCESS_ALLOWLIST_KV.put(ACCESS_ALLOWLIST_KEY, JSON.stringify(record));
        }

        return { entries, record };
      };

      if (request.method === "GET") {
        try {
          const { entries, record } = await loadAllowlistSnapshot();
          const responseBody = {
            entries,
            updatedAt: record.updatedAt || null,
            updatedBy: record.updatedBy || null,
            version: record.version,
            count: entries.length,
            policyUpdated: false,
          };
          const headers = {
            ...corsHeaders,
            "ETag": record.updatedAt || "",
          };
          return json(responseBody, 200, headers);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to fetch allowlist.";
          return json({ error: message }, 502, corsHeaders);
        }
      }

      const accessJwt = request.headers.get(ACCESS_JWT_HEADER);
      const accessEmail = request.headers.get(ACCESS_EMAIL_HEADER)?.toLowerCase() || "";
      if (!accessJwt || !accessEmail) {
        return json({ error: "Access authentication required." }, 403, corsHeaders);
      }
      const adminEmails = getAdminEmails(env);
      if (adminEmails.size > 0 && !adminEmails.has(accessEmail)) {
        return json({ error: "Not authorized to update allowlist." }, 403, corsHeaders);
      }

      const { data, error } = await readJsonBody(request, MAX_ALLOWLIST_BODY_BYTES);
      if (error) {
        return json({ error }, 400, corsHeaders);
      }
      const expectedUpdatedAt = (data?.expectedUpdatedAt || request.headers.get("If-Match") || "").trim();

      const stored = await env.ACCESS_ALLOWLIST_KV.get<AllowlistRecord>(ACCESS_ALLOWLIST_KEY, "json");
      if (stored?.updatedAt && !expectedUpdatedAt) {
        return json({ error: "expectedUpdatedAt is required for updates.", updatedAt: stored.updatedAt }, 428, corsHeaders);
      }
      if (stored?.updatedAt && expectedUpdatedAt && stored.updatedAt !== expectedUpdatedAt) {
        try {
          const { entries, record } = await loadAllowlistSnapshot();
          return json({
            error: "Allowlist has been updated since last fetch.",
            updatedAt: record.updatedAt,
            updatedBy: record.updatedBy,
            entries,
            count: entries.length,
            version: record.version,
          }, 409, corsHeaders);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Allowlist has been updated since last fetch.";
          return json({ error: message }, 409, corsHeaders);
        }
      }

      const normalized = normalizeAllowlistEntries(data?.entries);
      if (normalized.error) {
        return json({ error: normalized.error }, 400, corsHeaders);
      }
      if (normalized.invalid.length > 0) {
        return json({ error: "Invalid email entries.", invalid: normalized.invalid }, 400, corsHeaders);
      }
      if (normalized.entries.length > MAX_ALLOWLIST_ENTRIES) {
        return json({ error: `Allowlist exceeds ${MAX_ALLOWLIST_ENTRIES} entries.` }, 400, corsHeaders);
      }

      try {
        await updateAccessPolicy(env, normalized.entries);
      } catch (err) {
        console.error("Allowlist policy update failed.", {
          count: normalized.entries.length,
          domains: summarizeDomains(normalized.entries),
        });
        const message = err instanceof Error ? err.message : "Policy update failed.";
        return json({ error: message }, 502, corsHeaders);
      }

      const updatedAt = new Date().toISOString();
      const record = await buildAllowlistMetadata({
        entries: normalized.entries,
        updatedAt,
        version: (stored?.version || 0) + 1,
      });
      await env.ACCESS_ALLOWLIST_KV.put(ACCESS_ALLOWLIST_KEY, JSON.stringify(record));
      console.log("Allowlist updated.", {
        count: normalized.entries.length,
        domains: summarizeDomains(normalized.entries),
      });

      return json({
        entries: normalized.entries,
        updatedAt: record.updatedAt,
        updatedBy: record.updatedBy,
        version: record.version,
        count: normalized.entries.length,
        policyUpdated: true,
      }, 200, corsHeaders);
    }

    if (url.pathname === "/api/settings") {
      if (request.method !== "GET" && request.method !== "PUT") {
        return json({ error: "Method not allowed" }, 405, corsHeaders);
      }

      const accessJwt = request.headers.get(ACCESS_JWT_HEADER);
      const accessEmail = request.headers.get(ACCESS_EMAIL_HEADER)?.toLowerCase() || "";
      if (!accessJwt || !accessEmail) {
        return json({ error: "Access authentication required." }, 401, corsHeaders);
      }

      const storageKey = await getSettingsStorageKey(accessEmail);
      const legacyStorageKey = getLegacySettingsKey(accessEmail);

      const loadStoredSettings = async () => {
        const current = await env.SETTINGS_KV.get<SettingsRecord>(storageKey, "json");
        if (current) {
          return { record: current, key: storageKey, legacy: false };
        }
        const legacy = await env.SETTINGS_KV.get<SettingsRecord>(legacyStorageKey, "json");
        if (legacy) {
          return { record: legacy, key: legacyStorageKey, legacy: true };
        }
        return { record: null, key: storageKey, legacy: false };
      };

      if (request.method === "GET") {
        const { record: stored, legacy } = await loadStoredSettings();
        let resolved = stored
          ? {
            settings: stripSettingsForKv(stored.settings),
            updatedAt: stored.updatedAt,
            updatedBy: null,
            version: stored.version,
          }
          : null;
        if (stored && (legacy || stored.updatedBy)) {
          await env.SETTINGS_KV.put(storageKey, JSON.stringify(resolved));
          if (legacy) {
            await env.SETTINGS_KV.delete(legacyStorageKey);
          }
        }
        const responseBody = {
          settings: resolved ? resolved.settings : null,
          updatedAt: resolved?.updatedAt || null,
          updatedBy: resolved?.updatedBy || null,
          version: resolved?.version || 0,
        };
        const headers = {
          ...corsHeaders,
          "ETag": resolved?.updatedAt || "",
        };
        return json(responseBody, 200, headers);
      }

      const { data, error } = await readJsonBody(request, MAX_SETTINGS_BODY_BYTES);
      if (error) {
        return json({ error }, 400, corsHeaders);
      }

      const expectedUpdatedAt = (data?.expectedUpdatedAt || request.headers.get("If-Match") || "").trim();
      const expectedVersionRaw = data?.expectedVersion;
      const expectedVersion = Number.isFinite(Number(expectedVersionRaw)) ? Number(expectedVersionRaw) : null;
      const { record: stored, legacy } = await loadStoredSettings();
      const storedSanitized = stored
        ? {
          settings: stripSettingsForKv(stored.settings),
          updatedAt: stored.updatedAt,
          updatedBy: null,
          version: stored.version,
        }
        : null;
      const redactStoredIfNeeded = async () => {
        if (stored && (legacy || stored.updatedBy)) {
          await env.SETTINGS_KV.put(storageKey, JSON.stringify(storedSanitized));
          if (legacy) {
            await env.SETTINGS_KV.delete(legacyStorageKey);
          }
        }
      };

      if (stored?.updatedAt && !expectedUpdatedAt && expectedVersion === null) {
        return json({
          error: "expectedUpdatedAt or expectedVersion is required for updates.",
          updatedAt: stored.updatedAt,
          version: stored.version,
        }, 428, corsHeaders);
      }

      if (stored?.updatedAt) {
        if (expectedUpdatedAt && stored.updatedAt !== expectedUpdatedAt) {
          await redactStoredIfNeeded();
          return json({
            error: "Settings have been updated since last fetch.",
            updatedAt: storedSanitized?.updatedAt || null,
            updatedBy: storedSanitized?.updatedBy || null,
            version: storedSanitized?.version || 0,
            settings: storedSanitized?.settings || null,
          }, 409, corsHeaders);
        }
        if (expectedVersion !== null && stored.version !== expectedVersion) {
          await redactStoredIfNeeded();
          return json({
            error: "Settings version mismatch.",
            updatedAt: storedSanitized?.updatedAt || null,
            updatedBy: storedSanitized?.updatedBy || null,
            version: storedSanitized?.version || 0,
            settings: storedSanitized?.settings || null,
          }, 409, corsHeaders);
        }
      }

      const { settings, error: settingsError } = normalizeSettingsPayload(data?.settings);
      if (settingsError) {
        return json({ error: settingsError }, 400, corsHeaders);
      }

      const updatedAt = new Date().toISOString();
      const record: SettingsRecord = {
        settings: stripSettingsForKv(settings as SettingsPayload),
        updatedAt,
        updatedBy: null,
        version: (stored?.version || 0) + 1,
      };
      await env.SETTINGS_KV.put(storageKey, JSON.stringify(record));
      if (legacy) {
        await env.SETTINGS_KV.delete(legacyStorageKey);
      }
      console.log("Settings updated.", {
        email: accessEmail,
        version: record.version,
        provider: record.settings.provider,
        modelOverrides: Object.keys(record.settings.modelOverrides || {}).length,
      });

      return json({
        settings: record.settings,
        updatedAt: record.updatedAt,
        updatedBy: record.updatedBy,
        version: record.version,
      }, 200, corsHeaders);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, corsHeaders);
    }

    if (url.pathname === "/api/openai/responses") {
      if (!env.OPENAI_API_KEY) {
        return json({ error: "OPENAI_API_KEY not configured" }, 500, corsHeaders);
      }
      const body = await request.json();
      const upstream = await outboundFetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      }, "openai");
      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    if (url.pathname === "/api/gemini/generateContent") {
      if (!env.GEMINI_API_KEY) {
        return json({ error: "GEMINI_API_KEY not configured" }, 500, corsHeaders);
      }
      const payload = await request.json();
      const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY, fetch: createScopedFetch("gemini") });
      const response = await genAI.models.generateContent(payload);
      const out = {
        text: response.text,
        candidates: response.candidates || [],
      };
      return json(out, 200, corsHeaders);
    }

    return json({ error: "Not found" }, 404, corsHeaders);
  }
};
