import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const readText = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const cname = readText("CNAME").trim();
assert.ok(cname.length > 0, "CNAME must declare the production domain.");

const wrangler = readText("wrangler.toml");
const allowedMatch = wrangler.match(/ALLOWED_ORIGINS\s*=\s*\"([^\"]+)\"/);
assert.ok(allowedMatch, "wrangler.toml must define ALLOWED_ORIGINS.");
const allowedOrigins = allowedMatch[1].split(",").map((value) => value.trim());
assert.ok(
  allowedOrigins.includes(`https://${cname}`),
  "ALLOWED_ORIGINS must include the CNAME origin."
);
if (!cname.startsWith("www.")) {
  assert.ok(
    allowedOrigins.includes(`https://www.${cname}`),
    "ALLOWED_ORIGINS must include the www origin for the CNAME."
  );
}

const apiClient = readText("services/apiClient.ts");
assert.ok(/API_PREFIX\s*=\s*\"\/api\/\"/.test(apiClient), "API client must enforce /api/ prefix.");

const proxyBaseUrl = readText("services/proxyBaseUrl.ts");
assert.ok(
  /window\.location\.origin/.test(proxyBaseUrl),
  "proxyBaseUrl must default to window.location.origin for same-origin routing."
);

const viteConfig = readText("vite.config.ts");
assert.ok(
  /process\.env\.PROXY_BASE_URL/.test(viteConfig),
  "vite.config.ts must expose PROXY_BASE_URL for local dev parity."
);

const sameOriginGuard = readText("services/sameOriginGuard.ts");
assert.ok(
  /resolveProxyBaseUrl/.test(sameOriginGuard),
  "sameOriginGuard must derive the allowed origin from resolveProxyBaseUrl."
);

const worker = readText("workers/worker.ts");
assert.ok(
  /Access-Control-Allow-Origin/.test(worker),
  "worker must emit Access-Control-Allow-Origin in CORS headers."
);
assert.ok(
  /Access-Control-Allow-Credentials/.test(worker),
  "worker must emit Access-Control-Allow-Credentials in CORS headers."
);
assert.ok(
  /Vary\": \"Origin\"/.test(worker) || /Vary": "Origin"/.test(worker),
  "worker must set Vary: Origin in CORS headers."
);

const pathMatches = [...worker.matchAll(/url\.pathname\s*===\s*["']([^"']+)["']/g)].map((match) => match[1]);
assert.ok(pathMatches.length > 0, "worker must define explicit API routes.");
const nonApiPaths = pathMatches.filter((route) => !route.startsWith("/api/"));
assert.deepEqual(nonApiPaths, [], "worker routes must be scoped to /api/*.");

console.log("routing-parity.test.mjs: ok");
