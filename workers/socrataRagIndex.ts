import {
  buildRagIndexFromJsonl,
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

const socrataIndex = buildRagIndexFromJsonl(SOCRATA_RAG_BUNDLE_JSONL, INDEX_OPTIONS);

export const querySocrataRag = (query: string, options?: RagQueryOptions): RagQueryHit[] => {
  return socrataIndex.query(query, options);
};
