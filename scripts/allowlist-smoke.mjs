#!/usr/bin/env node
/*
Allowlist smoke test for /api/access/allowlist.

Required env:
- ALLOWLIST_ENDPOINT: full URL to /api/access/allowlist

Optional env:
- CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET: Cloudflare Access service token (used for GET if provided; required for update)
- ALLOWLIST_SMOKE_UPDATE=1: perform a PUT update using expectedUpdatedAt
- ALLOWLIST_SMOKE_EXPECTED_UPDATED_AT: override expectedUpdatedAt sent in update
- ALLOWLIST_SMOKE_TIMEOUT_MS: request timeout in ms (default 10000)
*/

const DEFAULT_TIMEOUT_MS = 10_000;

const getEnv = (name) => {
  const value = process.env[name];
  return value ? value.trim() : "";
};

const fail = (message, code = 1) => {
  console.error(`[allowlist-smoke] ${message}`);
  process.exit(code);
};

const timeoutMs = Number(getEnv("ALLOWLIST_SMOKE_TIMEOUT_MS")) || DEFAULT_TIMEOUT_MS;
const endpoint = getEnv("ALLOWLIST_ENDPOINT");
if (!endpoint) {
  fail("Missing ALLOWLIST_ENDPOINT env var.", 2);
}

const accessClientId = getEnv("CF_ACCESS_CLIENT_ID");
const accessClientSecret = getEnv("CF_ACCESS_CLIENT_SECRET");

const buildAccessHeaders = () => {
  if (!accessClientId || !accessClientSecret) {
    return {};
  }
  return {
    "CF-Access-Client-Id": accessClientId,
    "CF-Access-Client-Secret": accessClientSecret,
  };
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
};

const parseJson = async (response) => {
  const text = await response.text();
  if (!text) {
    return { json: null, text: "" };
  }
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
};

const summarizeDomains = (entries = []) => {
  const counts = new Map();
  for (const entry of entries) {
    if (typeof entry !== "string") {
      continue;
    }
    const [, domain] = entry.split("@");
    if (!domain) {
      continue;
    }
    const normalized = domain.toLowerCase();
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  }
  if (counts.size === 0) {
    return "none";
  }
  const sorted = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    return a[0].localeCompare(b[0]);
  });
  return sorted
    .slice(0, 8)
    .map(([domain, count]) => `${domain}(${count})`)
    .join(", ");
};

const validateAllowlistPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return "Response payload is missing or not an object.";
  }
  if (!Array.isArray(payload.entries)) {
    return "Response payload is missing entries array.";
  }
  if (typeof payload.count !== "number") {
    return "Response payload is missing count number.";
  }
  if (payload.count !== payload.entries.length) {
    return "Response payload count does not match entries length.";
  }
  if (!(typeof payload.updatedAt === "string" || payload.updatedAt === null)) {
    return "Response payload updatedAt must be string or null.";
  }
  return "";
};

const formatErrorDetails = (payload) => {
  if (!payload || typeof payload !== "object") {
    return "";
  }
  const parts = [];
  if (payload.error) {
    parts.push(`error=${payload.error}`);
  }
  if (payload.updatedAt) {
    parts.push(`updatedAt=${payload.updatedAt}`);
  }
  if (Array.isArray(payload.entries)) {
    parts.push(`entries=${payload.entries.length}`);
  }
  if (typeof payload.count === "number") {
    parts.push(`count=${payload.count}`);
  }
  return parts.length > 0 ? parts.join(" ") : "";
};

const main = async () => {
  let response;
  try {
    response = await fetchWithTimeout(endpoint, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...buildAccessHeaders(),
      },
    });
  } catch (err) {
    const message = err && err.name === "AbortError" ? "GET request timed out." : "GET request failed.";
    fail(message, 2);
  }

  const { json: getPayload, text: getText } = await parseJson(response);
  if (!response.ok) {
    const details = formatErrorDetails(getPayload);
    const extra = details || (getText ? "" : "(empty body)");
    fail(`GET failed with status ${response.status}. ${extra}`.trim(), 2);
  }
  if (!getPayload) {
    fail("GET response is not valid JSON.", 2);
  }

  const validationError = validateAllowlistPayload(getPayload);
  if (validationError) {
    fail(`GET validation failed: ${validationError}`, 1);
  }

  const domainSummary = summarizeDomains(getPayload.entries);
  console.log(`[allowlist-smoke] GET ok: count=${getPayload.count} updatedAt=${getPayload.updatedAt || "null"} domains=${domainSummary}`);

  if (getEnv("ALLOWLIST_SMOKE_UPDATE") !== "1") {
    console.log("[allowlist-smoke] Update mode disabled (read-only).");
    return;
  }

  if (!accessClientId || !accessClientSecret) {
    fail("Update mode requires CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET.", 2);
  }

  const expectedUpdatedAt = getEnv("ALLOWLIST_SMOKE_EXPECTED_UPDATED_AT") || (getPayload.updatedAt || "");
  const updateBody = {
    entries: getPayload.entries,
    expectedUpdatedAt,
  };

  let updateResponse;
  try {
    updateResponse = await fetchWithTimeout(endpoint, {
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...buildAccessHeaders(),
      },
      body: JSON.stringify(updateBody),
    });
  } catch (err) {
    const message = err && err.name === "AbortError" ? "PUT request timed out." : "PUT request failed.";
    fail(message, 2);
  }

  const { json: updatePayload, text: updateText } = await parseJson(updateResponse);
  if (!updateResponse.ok) {
    const details = formatErrorDetails(updatePayload);
    const extra = details || (updateText ? "" : "(empty body)");
    fail(`PUT failed with status ${updateResponse.status}. ${extra}`.trim(), 2);
  }
  if (!updatePayload) {
    fail("PUT response is not valid JSON.", 2);
  }

  const updateValidationError = validateAllowlistPayload(updatePayload);
  if (updateValidationError) {
    fail(`PUT validation failed: ${updateValidationError}`, 1);
  }

  const updateDomains = summarizeDomains(updatePayload.entries);
  console.log(`[allowlist-smoke] PUT ok: count=${updatePayload.count} updatedAt=${updatePayload.updatedAt || "null"} domains=${updateDomains}`);
};

main().catch((err) => {
  console.error("[allowlist-smoke] Unexpected failure.", err instanceof Error ? err.message : err);
  process.exit(2);
});
