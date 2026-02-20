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

const pkg = JSON.parse(readText("package.json"));
const depNames = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });
const bannedDeps = [
  "@pinecone-database/pinecone",
  "pinecone",
  "weaviate",
  "qdrant",
  "@qdrant/js-client-rest",
  "@zilliz/milvus2-sdk-node",
  "milvus",
  "chromadb",
  "lancedb",
  "voyageai",
  "cohere-ai",
  "langchain",
  "@langchain",
  "llamaindex",
  "vectara",
  "supabase",
  "redis-om",
  "elasticsearch",
  "opensearch"
];
const bannedFound = depNames.filter((dep) => (
  bannedDeps.some((banned) => dep === banned || dep.startsWith(`${banned}/`))
));
if (bannedFound.length > 0) {
  errors.push(`Vector/embedding client dependencies are disallowed: ${bannedFound.join(", ")}`);
}

if (!exists("CNAME")) {
  errors.push("CNAME file missing at repo root (GitHub Pages guardrail).");
}

if (!exists(".githooks/pre-commit")) {
  errors.push("Pre-commit hook missing at .githooks/pre-commit.");
} else {
  const precommitHook = readText(".githooks/pre-commit");
  if (!/precommit-secret-scan\.mjs/.test(precommitHook)) {
    errors.push("Pre-commit hook must run the secret scan script.");
  }
}

if (!exists("docs/incident-response.md")) {
  errors.push("Incident response guide missing at docs/incident-response.md.");
} else {
  const incidentResponse = readText("docs/incident-response.md");
  if (!/History Scrub Procedure/.test(incidentResponse)) {
    errors.push("Incident response guide must document a history scrub procedure.");
  }
  if (!/git filter-repo/.test(incidentResponse)) {
    errors.push("History scrub procedure must reference git filter-repo usage.");
  }
}

const pagesWorkflow = readText(".github/workflows/pages.yml");
if (!/actions\/deploy-pages/.test(pagesWorkflow) || !/upload-pages-artifact/.test(pagesWorkflow)) {
  errors.push("GitHub Pages workflow must upload and deploy Pages artifacts.");
}

const guardrailsWorkflow = readText(".github/workflows/guardrails.yml");
if (!/pull_request\s*:/.test(guardrailsWorkflow)) {
  errors.push("Guardrails workflow must run on pull_request.");
}
if (!/test:secrets/.test(guardrailsWorkflow)) {
  errors.push("Guardrails workflow must run test:secrets.");
}

if (errors.length > 0) {
  console.error("Guardrail check failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("guardrails-check.mjs: ok");
