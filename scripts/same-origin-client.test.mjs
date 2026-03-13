import assert from "node:assert/strict";

const originalBase = process.env.PROXY_BASE_URL;

const setBase = (value) => {
  if (value === null) {
    delete process.env.PROXY_BASE_URL;
    return;
  }
  process.env.PROXY_BASE_URL = value;
};

let lastFetchUrl = null;
let lastFetchInit = null;

const originalFetch = globalThis.fetch;

globalThis.fetch = async (input, init) => {
  lastFetchUrl = typeof input === "string" ? input : input?.url;
  lastFetchInit = init;
  return {
    ok: true,
    json: async () => ({ hits: [] })
  };
};

const { apiFetch } = await import("../services/apiClient.ts");

setBase("https://app.local");
await apiFetch("/api/ok");
assert.equal(lastFetchUrl, "https://app.local/api/ok");
assert.equal(lastFetchInit, undefined);

await assert.rejects(
  () => apiFetch("/not-api"),
  /Blocked non-API endpoint request/
);

await assert.rejects(
  () => apiFetch("https://app.local/not-api"),
  /Blocked non-API endpoint request/
);

await assert.rejects(
  () => apiFetch("https://evil.example/api/ok"),
  /Blocked non same-origin API request/
);

const { querySocrataRag } = await import("../services/socrataRagClient.ts");

await querySocrataRag(`test query ${Date.now()}`);
assert.equal(lastFetchUrl, "https://app.local/api/rag/query");

globalThis.window = { location: { origin: "https://deepsearches.app" } };
let calls = 0;
globalThis.fetch = async (_input, init) => {
  calls += 1;
  if (calls === 1) {
    throw new TypeError("Failed to fetch");
  }
  if (init?.redirect === "manual") {
    return {
      status: 302,
      type: "basic",
      headers: new Headers({
        location:
          "https://deepsearches.cloudflareaccess.com/cdn-cgi/access/login/deepsearches.app",
      }),
    };
  }
  return { ok: true };
};

await assert.rejects(
  () => apiFetch("/api/settings", { credentials: "include" }),
  /Cloudflare Access authentication is required or expired/
);

if (originalBase === undefined) {
  delete process.env.PROXY_BASE_URL;
} else {
  process.env.PROXY_BASE_URL = originalBase;
}

if (originalFetch) {
  globalThis.fetch = originalFetch;
}

console.log("same-origin-client.test.mjs: ok");
