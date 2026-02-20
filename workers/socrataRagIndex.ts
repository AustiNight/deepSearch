import { buildRagIndexFromJsonl, RagQueryOptions, RagQueryHit } from "../services/ragIndex";
import { SOCRATA_RAG_BUNDLE_JSONL } from "./socrataRagBundle";

// In-memory index only (zero-cost); no KV caching. Keep size bounded.
const INDEX_OPTIONS = {
  maxChunks: 2500,
  minTokenLength: 2,
  allowEmbeddings: false
};

const socrataIndex = buildRagIndexFromJsonl(SOCRATA_RAG_BUNDLE_JSONL, INDEX_OPTIONS);

export const querySocrataRag = (query: string, options?: RagQueryOptions): RagQueryHit[] => {
  return socrataIndex.query(query, options);
};
