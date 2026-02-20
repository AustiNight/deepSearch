import { apiFetch } from "./apiClient";
import type { RagQueryFilters, RagQueryHit } from "./ragIndex";
import { recordRagUsage } from "./ragTelemetry";

const cache = new Map<string, RagQueryHit[]>();

const buildCacheKey = (query: string, filters?: RagQueryFilters, topK?: number) => {
  const filterKey = JSON.stringify(filters || {});
  return `${query}|${topK || 6}|${filterKey}`;
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

export const fetchSocrataDiscoveryRag = async () => {
  return querySocrataRag("catalog/v1 search_context q limit offset tags categories", {
    topK: 4,
    filters: { docIds: ["socrata_discovery"] },
    context: "socrata_discovery_prompt"
  });
};

export const fetchSocrataSodaRag = async () => {
  return querySocrataRag("SODA /resource/{id}.json /api/v3/views/{id}/query.json app token", {
    topK: 4,
    filters: { docIds: ["socrata_soda_api"] },
    context: "socrata_soda_prompt"
  });
};
