import assert from "node:assert/strict";
import fs from "node:fs";

const { buildRagIndexFromJsonl } = await import("../services/ragIndex.ts");

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
