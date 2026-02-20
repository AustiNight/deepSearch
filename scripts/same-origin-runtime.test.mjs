import assert from "node:assert/strict";

delete process.env.PROXY_BASE_URL;

const originalFetch = async (input) => {
  const url = typeof input === "string" ? input : input?.url;
  return { ok: true, url };
};

globalThis.window = {
  location: { origin: "https://app.local" },
  fetch: originalFetch,
  __sameOriginFetchGuardInstalled: false
};

const { installSameOriginFetchGuard } = await import("../services/sameOriginGuard.ts");

installSameOriginFetchGuard();

await window.fetch("/api/rag/query");

await assert.rejects(
  () => window.fetch("/not-api"),
  /Blocked non-API fetch/
);

await assert.rejects(
  () => window.fetch("https://evil.example/api/test"),
  /Blocked cross-origin fetch/
);

console.log("same-origin-runtime.test.mjs: ok");
