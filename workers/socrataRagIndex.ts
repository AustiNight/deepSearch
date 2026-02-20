import {
  parseJsonl,
  RagChunk,
  RagIndex,
  RagQueryOptions,
  RagQueryHit,
  RAG_INDEX_LIMITS,
  RAG_INDEX_STORAGE_STRATEGY
} from "../services/ragIndex";
import { RAG_GUARDRAILS, assertRagGuardrails } from "../services/ragGuardrails";
import { SOCRATA_RAG_BUNDLE_JSONL } from "./socrataRagBundle";

// In-memory index only (zero-cost); no KV caching. Keep size bounded.
const INDEX_OPTIONS = {
  ...RAG_INDEX_LIMITS,
  minTokenLength: 2,
  allowEmbeddings: RAG_GUARDRAILS.allowEmbeddings
};

assertRagGuardrails({
  allowEmbeddings: INDEX_OPTIONS.allowEmbeddings,
  usesExternalVectorDb: false,
  usesRemoteIndex: RAG_INDEX_STORAGE_STRATEGY !== "memory"
});

const socrataChunks = parseJsonl<RagChunk>(SOCRATA_RAG_BUNDLE_JSONL);
const socrataIndex = new RagIndex(socrataChunks, INDEX_OPTIONS);
const socrataChunkMap = new Map(socrataChunks.map((chunk) => [chunk.id, chunk]));

export const querySocrataRag = (query: string, options?: RagQueryOptions): RagQueryHit[] => {
  return socrataIndex.query(query, options);
};

export const getSocrataRagChunksById = (ids: string[], limit = 12): RagChunk[] => {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const raw of ids || []) {
    const value = (raw || "").trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    unique.push(value);
    if (unique.length >= limit) break;
  }
  const chunks: RagChunk[] = [];
  for (const id of unique) {
    const chunk = socrataChunkMap.get(id);
    if (chunk) chunks.push(chunk);
  }
  return chunks;
};
