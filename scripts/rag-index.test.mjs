import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { buildRagIndexFromJsonl, parseJsonl } = await import("../services/ragIndex.ts");
const { SOCRATA_RAG_ARTIFACTS } = await import("../data/ragReferences.ts");

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const parsed = parseJsonl(`{"id":"a","text":"alpha"}\n{broken}\n{"id":"b","text":"beta"}\n`);
assert.equal(parsed.length, 2, "Expected parseJsonl to ignore malformed lines.");

const smallChunks = [
  { id: "one", text: "alpha beta", tags: ["alpha"], doc_id: "doc1", source_file: "doc1.md", type: "section" },
  { id: "two", text: "gamma delta", tags: ["delta"], doc_id: "doc2", source_file: "doc2.md", type: "endpoint" }
];
const smallJsonl = smallChunks.map((chunk) => JSON.stringify(chunk)).join("\n");

const smallIndex = buildRagIndexFromJsonl(smallJsonl, { maxChunks: 1 });
assert.equal(smallIndex.query("gamma").length, 0, "Expected indexing to respect maxChunks.");

const retrievalIndex = buildRagIndexFromJsonl(smallJsonl);
assert.ok(
  retrievalIndex.query("gamma", { filters: { tags: ["delta"] } }).length > 0,
  "Expected tag filter to retrieve matching chunk."
);
assert.equal(
  retrievalIndex.query("gamma", { filters: { docIds: ["doc1"] } }).length,
  0,
  "Expected docId filter to exclude non-matching chunks."
);
assert.ok(
  retrievalIndex.query("gamma", { filters: { sourceFiles: ["doc2.md"] } }).length > 0,
  "Expected source file filter to retrieve matching chunk."
);
assert.ok(
  retrievalIndex.query("gamma", { filters: { types: ["endpoint"] } }).length > 0,
  "Expected type filter to retrieve matching chunk."
);

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
