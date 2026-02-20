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

console.log("routing-parity.test.mjs: ok");
