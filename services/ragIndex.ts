export type RagChunk = {
  id: string;
  type?: string;
  title?: string;
  path?: string[];
  text: string;
  tags?: string[];
  source_file?: string;
  doc_id?: string;
};

export type RagQueryFilters = {
  docIds?: string[];
  sourceFiles?: string[];
  types?: string[];
  tags?: string[];
};

export type RagQueryOptions = {
  topK?: number;
  filters?: RagQueryFilters;
};

export type RagQueryHit = RagChunk & {
  score: number;
};

export type RagIndexOptions = {
  maxChunks?: number;
  minTokenLength?: number;
  stopWords?: Set<string>;
  allowEmbeddings?: boolean;
};

const DEFAULT_STOP_WORDS = new Set([
  "the",
  "and",
  "or",
  "a",
  "an",
  "to",
  "of",
  "in",
  "for",
  "on",
  "by",
  "with",
  "from",
  "at",
  "as",
  "is",
  "are",
  "be",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "into",
  "over",
  "under",
  "their",
  "your",
  "our",
  "we",
  "you",
  "they",
  "them",
  "was",
  "were",
  "but",
  "not",
  "can",
  "will",
  "should",
  "may",
  "might",
  "if",
  "else",
  "when",
  "where",
  "what",
  "which",
  "who",
  "how",
  "why",
  "about",
  "more",
  "less"
]);

const DEFAULT_MIN_TOKEN_LENGTH = 2;
const DEFAULT_MAX_CHUNKS = 2500;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const normalizeToken = (value: string) => value.toLowerCase();

const tokenize = (text: string, options: RagIndexOptions) => {
  const minLen = options.minTokenLength ?? DEFAULT_MIN_TOKEN_LENGTH;
  const stopWords = options.stopWords ?? DEFAULT_STOP_WORDS;
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= minLen && !stopWords.has(token));
};

export const parseJsonl = <T = any>(jsonl: string): T[] => {
  if (!jsonl) return [];
  const lines = jsonl.split(/\r?\n/);
  const records: T[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      records.push(JSON.parse(trimmed) as T);
    } catch (_) {
      // ignore malformed lines
    }
  }
  return records;
};

type IndexDoc = {
  chunk: RagChunk;
  length: number;
  termFreq: Map<string, number>;
};

export class RagIndex {
  private readonly docs: IndexDoc[];
  private readonly docFreq: Map<string, number>;
  private readonly avgDocLength: number;
  private readonly options: RagIndexOptions;

  constructor(chunks: RagChunk[], options: RagIndexOptions = {}) {
    assertRagGuardrails({ allowEmbeddings: options.allowEmbeddings });
    this.options = options;
    const maxChunks = options.maxChunks ?? DEFAULT_MAX_CHUNKS;
    const trimmed = chunks.slice(0, maxChunks);
    const docs: IndexDoc[] = [];
    const docFreq = new Map<string, number>();
    let totalLength = 0;

    for (const chunk of trimmed) {
      const text = chunk.text || "";
      const tokens = tokenize(text, options);
      if (tokens.length === 0) continue;
      const termFreq = new Map<string, number>();
      tokens.forEach((token) => {
        const normalized = normalizeToken(token);
        termFreq.set(normalized, (termFreq.get(normalized) || 0) + 1);
      });
      for (const token of new Set(tokens.map(normalizeToken))) {
        docFreq.set(token, (docFreq.get(token) || 0) + 1);
      }
      docs.push({ chunk, length: tokens.length, termFreq });
      totalLength += tokens.length;
    }

    this.docs = docs;
    this.docFreq = docFreq;
    this.avgDocLength = docs.length > 0 ? totalLength / docs.length : 0;
  }

  query(query: string, options: RagQueryOptions = {}): RagQueryHit[] {
    const q = (query || "").trim();
    if (!q) return [];
    const tokens = tokenize(q, this.options);
    if (tokens.length === 0) return [];
    const filteredDocs = this.applyFilters(this.docs, options.filters);

    const k1 = 1.2;
    const b = 0.75;
    const scores: Array<{ doc: IndexDoc; score: number }> = [];
    const docCount = filteredDocs.length || 1;

    for (const doc of filteredDocs) {
      let score = 0;
      for (const rawToken of tokens) {
        const token = normalizeToken(rawToken);
        const df = this.docFreq.get(token) || 0;
        if (!df) continue;
        const tf = doc.termFreq.get(token) || 0;
        if (!tf) continue;
        const idf = Math.log(1 + (docCount - df + 0.5) / (df + 0.5));
        const denom = tf + k1 * (1 - b + b * (doc.length / (this.avgDocLength || 1)));
        score += idf * ((tf * (k1 + 1)) / denom);
      }
      if (score > 0) scores.push({ doc, score });
    }

    scores.sort((a, b2) => b2.score - a.score);
    const topK = clamp(options.topK ?? 6, 1, 25);
    return scores.slice(0, topK).map(({ doc, score }) => ({
      ...doc.chunk,
      score
    }));
  }

  private applyFilters(docs: IndexDoc[], filters?: RagQueryFilters): IndexDoc[] {
    if (!filters) return docs;
    const docIds = filters.docIds && filters.docIds.length > 0 ? new Set(filters.docIds) : null;
    const sourceFiles = filters.sourceFiles && filters.sourceFiles.length > 0
      ? new Set(filters.sourceFiles)
      : null;
    const types = filters.types && filters.types.length > 0 ? new Set(filters.types) : null;
    const tags = filters.tags && filters.tags.length > 0 ? new Set(filters.tags) : null;

    return docs.filter(({ chunk }) => {
      if (docIds && (!chunk.doc_id || !docIds.has(chunk.doc_id))) return false;
      if (sourceFiles && (!chunk.source_file || !sourceFiles.has(chunk.source_file))) return false;
      if (types && (!chunk.type || !types.has(chunk.type))) return false;
      if (tags && (!chunk.tags || chunk.tags.every((tag) => !tags.has(tag)))) return false;
      return true;
    });
  }
}

export const buildRagIndexFromJsonl = (jsonl: string, options: RagIndexOptions = {}) => {
  const chunks = parseJsonl<RagChunk>(jsonl);
  return new RagIndex(chunks, options);
};
import { assertRagGuardrails } from "./ragGuardrails";
