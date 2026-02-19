import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const readText = (relativePath) => {
  const fullPath = path.join(ROOT, relativePath);
  return fs.readFileSync(fullPath, "utf8");
};

const exists = (relativePath) => fs.existsSync(path.join(ROOT, relativePath));

const errors = [];

const compliancePolicy = readText("data/compliancePolicy.ts");
if (!/zeroCostMode:\s*true/.test(compliancePolicy)) {
  errors.push("COMPLIANCE_POLICY.zeroCostMode must be true.");
}

const openDataConfig = readText("services/openDataConfig.ts");
if (!/autoIngestion:\s*false/.test(openDataConfig)) {
  errors.push("Open data auto-ingestion must default to false.");
}
if (!/allowPaidAccess:\s*false/.test(openDataConfig)) {
  errors.push("Open data allowPaidAccess must default to false.");
}
if (!/zeroCostMode\s*\?\s*false\s*:/.test(openDataConfig)) {
  errors.push("Open data paid access must be gated by zeroCostMode.");
}

const wranglerToml = readText("wrangler.toml");
if (!/main\s*=\s*"workers\/worker\.ts"/.test(wranglerToml)) {
  errors.push("wrangler.toml must target workers/worker.ts.");
}
if (!/kv_namespaces\s*=/.test(wranglerToml)) {
  errors.push("wrangler.toml must define kv_namespaces bindings.");
}

const apiClient = readText("services/apiClient.ts");
if (!/API_PREFIX\s*=\s*"\/api\/"/.test(apiClient)) {
  errors.push("API client must enforce /api/ prefix.");
}
if (!/Blocked non-API endpoint request/.test(apiClient)) {
  errors.push("API client must block non-/api requests.");
}

if (!exists("CNAME")) {
  errors.push("CNAME file missing at repo root (GitHub Pages guardrail).");
}

const pagesWorkflow = readText(".github/workflows/pages.yml");
if (!/actions\/deploy-pages/.test(pagesWorkflow) || !/upload-pages-artifact/.test(pagesWorkflow)) {
  errors.push("GitHub Pages workflow must upload and deploy Pages artifacts.");
}

if (errors.length > 0) {
  console.error("Guardrail check failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("guardrails-check.mjs: ok");
