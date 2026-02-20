import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { buildRagIndexFromJsonl } = await import("../services/ragIndex.ts");
const { SOCRATA_RAG_ARTIFACTS } = await import("../data/ragReferences.ts");

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const artifact of SOCRATA_RAG_ARTIFACTS) {
  const artifactPath = path.resolve(rootDir, artifact.path);
  assert.ok(fs.existsSync(artifactPath), `Missing RAG artifact: ${artifact.path}`);
}

const bundle = fs.readFileSync(new URL("../docs/Socrata.rag.bundle.jsonl", import.meta.url), "utf8");
const index = buildRagIndexFromJsonl(bundle);

const discoveryHits = index.query("catalog/v1 search_context q limit", {
  topK: 3,
  filters: { docIds: ["socrata_discovery"] }
});
assert.ok(discoveryHits.length > 0, "Expected discovery RAG hits.");

const sodaHits = index.query("/api/v3/views/{id}/query.json app token", {
  topK: 3,
  filters: { docIds: ["socrata_soda_api"] }
});
assert.ok(sodaHits.length > 0, "Expected SODA RAG hits.");

console.log("rag-index.test.mjs: ok");
