import { apiFetch } from "./apiClient";
import type { RagChunk, RagQueryFilters, RagQueryHit } from "./ragIndex";
import { recordRagUsage } from "./ragTelemetry";

const cache = new Map<string, RagQueryHit[]>();

export type RagScopeInput = {
  docId?: string;
  docIds?: string[] | string;
  sourceFile?: string;
  sourceFiles?: string[] | string;
  types?: string[] | string;
  tags?: string[] | string;
};

const buildCacheKey = (query: string, filters?: RagQueryFilters, topK?: number) => {
  const filterKey = JSON.stringify(filters || {});
  return `${query}|${topK || 6}|${filterKey}`;
};

const normalizeFilterList = (value?: string | string[]) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  const cleaned = list.map((entry) => entry.trim()).filter(Boolean);
  return Array.from(new Set(cleaned)).sort();
};

export const buildRagFilters = (input?: RagScopeInput): RagQueryFilters | undefined => {
  if (!input) return undefined;
  const docIds = normalizeFilterList([...(input.docIds ? (Array.isArray(input.docIds) ? input.docIds : [input.docIds]) : []), ...(input.docId ? [input.docId] : [])]);
  const sourceFiles = normalizeFilterList([...(input.sourceFiles ? (Array.isArray(input.sourceFiles) ? input.sourceFiles : [input.sourceFiles]) : []), ...(input.sourceFile ? [input.sourceFile] : [])]);
  const types = normalizeFilterList(input.types);
  const tags = normalizeFilterList(input.tags);
  if (docIds.length === 0 && sourceFiles.length === 0 && types.length === 0 && tags.length === 0) return undefined;
  return { docIds, sourceFiles, types, tags };
};

export const querySocrataRag = async (query: string, options?: { topK?: number; filters?: RagQueryFilters; context?: string }) => {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const cacheKey = buildCacheKey(trimmed, options?.filters, options?.topK);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await apiFetch("/api/rag/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: trimmed,
      topK: options?.topK,
      filters: options?.filters
    })
  });
  if (!response.ok) return [];
  const data = await response.json();
  const hits = Array.isArray(data?.hits) ? data.hits as RagQueryHit[] : [];
  if (hits.length > 0) {
    recordRagUsage({ query: trimmed, hits, context: options?.context });
  }
  cache.set(cacheKey, hits);
  return hits;
};

export const fetchSocrataRagChunksById = async (ids: string[], options?: { limit?: number }) => {
  const cleaned = Array.from(new Set((ids || []).map((value) => (value || "").trim()).filter(Boolean)));
  if (cleaned.length === 0) return [];
  const response = await apiFetch("/api/rag/chunks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ids: cleaned,
      limit: options?.limit
    })
  });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data?.chunks) ? data.chunks as RagChunk[] : [];
};

export const querySocrataRagScoped = async (query: string, options?: {
  topK?: number;
  context?: string;
  docId?: string;
  docIds?: string[] | string;
  sourceFile?: string;
  sourceFiles?: string[] | string;
  types?: string[] | string;
  tags?: string[] | string;
}) => {
  const filters = buildRagFilters(options);
  return querySocrataRag(query, { topK: options?.topK, filters, context: options?.context });
};

export const fetchSocrataDiscoveryRag = async () => {
  return querySocrataRagScoped("catalog/v1 search_context q limit offset tags categories", {
    topK: 4,
    docId: "socrata_discovery",
    sourceFile: "docs/Discovery_API.md",
    context: "socrata_discovery_prompt"
  });
};

export const fetchSocrataSodaRag = async () => {
  return querySocrataRagScoped("SODA /resource/{id}.json /api/v3/views/{id}/query.json app token", {
    topK: 4,
    docId: "socrata_soda_api",
    sourceFile: "docs/Discovery_API_2.txt",
    context: "socrata_soda_prompt"
  });
};
