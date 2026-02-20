import type { RagQueryHit } from "./ragIndex";

export type RagUsageRecord = {
  id: string;
  query: string;
  chunkIds: string[];
  docIds: string[];
  context?: string;
  usedAt: number;
  success?: boolean;
};

const usageLog: RagUsageRecord[] = [];

const buildId = () => `rag-${Math.random().toString(36).slice(2, 10)}`;

export const recordRagUsage = (input: {
  query: string;
  hits: RagQueryHit[];
  context?: string;
}): RagUsageRecord => {
  const record: RagUsageRecord = {
    id: buildId(),
    query: input.query,
    chunkIds: input.hits.map((hit) => hit.id),
    docIds: input.hits.map((hit) => hit.doc_id || "unknown"),
    context: input.context,
    usedAt: Date.now()
  };
  usageLog.push(record);
  if (usageLog.length > 200) usageLog.shift();
  return record;
};

export const recordRagUsageById = (input: {
  query: string;
  chunkIds: string[];
  docIds?: string[];
  context?: string;
}): RagUsageRecord => {
  const record: RagUsageRecord = {
    id: buildId(),
    query: input.query,
    chunkIds: input.chunkIds,
    docIds: input.docIds && input.docIds.length > 0 ? input.docIds : input.chunkIds.map(() => "unknown"),
    context: input.context,
    usedAt: Date.now()
  };
  usageLog.push(record);
  if (usageLog.length > 200) usageLog.shift();
  return record;
};

export const recordRagOutcome = (id: string, success: boolean) => {
  const record = usageLog.find((entry) => entry.id === id);
  if (record) record.success = success;
};

export const getRagUsageLog = () => [...usageLog];

export const getRagUsageSummary = () => {
  const byChunk = new Map<string, { total: number; success: number }>();
  for (const entry of usageLog) {
    for (const chunkId of entry.chunkIds) {
      const item = byChunk.get(chunkId) || { total: 0, success: 0 };
      item.total += 1;
      if (entry.success) item.success += 1;
      byChunk.set(chunkId, item);
    }
  }
  return Array.from(byChunk.entries()).map(([chunkId, stats]) => ({
    chunkId,
    total: stats.total,
    success: stats.success
  }));
};
