import type { OpenDatasetMetadata } from "../types";
import { readLocalJson, writeLocalJson } from "./storagePolicy";

export type OpenDataDatasetTelemetryEntry = {
  attempts: number;
  successes: number;
  failures: number;
  totalHits: number;
  textSuccesses: number;
  geometrySuccesses: number;
  lastAttemptAt: number;
  lastSuccessAt?: number;
  updatedAt: number;
};

type DatasetTelemetryRecord = Record<string, OpenDataDatasetTelemetryEntry>;

const DATASET_TELEMETRY_STORAGE_KEY = "overseer_open_data_dataset_telemetry_v1";
const MAX_DATASET_TELEMETRY_ENTRIES = 300;
const DATASET_TELEMETRY_STALE_MS = 1000 * 60 * 60 * 24 * 90;

let memoryStore: DatasetTelemetryRecord | null = null;

const normalizePortalUrl = (value: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "").toLowerCase();
  return `https://${trimmed}`.replace(/\/$/, "").toLowerCase();
};

const normalizeToken = (value?: string) => String(value || "").trim().toLowerCase();

const buildDatasetTelemetryKey = (dataset: {
  portalType?: string;
  portalUrl?: string;
  datasetId?: string;
  id?: string;
  title?: string;
}) => {
  const portalType = normalizeToken(dataset.portalType);
  const portalUrl = normalizePortalUrl(dataset.portalUrl || "");
  const datasetId = normalizeToken(dataset.datasetId);
  const fallbackId = normalizeToken(dataset.id);
  const title = normalizeToken(dataset.title);
  const idPart = datasetId || fallbackId || title;
  if (!portalUrl || !idPart) return "";
  return [portalType || "unknown", portalUrl, idPart].join("|");
};

const sanitizeNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const sanitizeEntry = (entry: any): OpenDataDatasetTelemetryEntry | null => {
  if (!entry || typeof entry !== "object") return null;
  const attempts = Math.max(0, Math.floor(sanitizeNumber(entry.attempts)));
  const successes = Math.max(0, Math.floor(sanitizeNumber(entry.successes)));
  const failures = Math.max(0, Math.floor(sanitizeNumber(entry.failures)));
  const totalHits = Math.max(0, Math.floor(sanitizeNumber(entry.totalHits)));
  const textSuccesses = Math.max(0, Math.floor(sanitizeNumber(entry.textSuccesses)));
  const geometrySuccesses = Math.max(0, Math.floor(sanitizeNumber(entry.geometrySuccesses)));
  const lastAttemptAt = Math.max(0, Math.floor(sanitizeNumber(entry.lastAttemptAt)));
  const lastSuccessAt = Math.max(0, Math.floor(sanitizeNumber(entry.lastSuccessAt)));
  const updatedAt = Math.max(0, Math.floor(sanitizeNumber(entry.updatedAt)));
  if (!lastAttemptAt && !updatedAt) return null;
  return {
    attempts,
    successes,
    failures,
    totalHits,
    textSuccesses,
    geometrySuccesses,
    lastAttemptAt,
    lastSuccessAt: lastSuccessAt || undefined,
    updatedAt: updatedAt || lastAttemptAt
  };
};

const pruneRecord = (record: DatasetTelemetryRecord): DatasetTelemetryRecord => {
  const now = Date.now();
  const entries = Object.entries(record)
    .map(([key, value]) => [key, sanitizeEntry(value)] as const)
    .filter(([, value]) => Boolean(value))
    .filter(([, value]) => {
      const lastSeenAt = Math.max(value?.lastAttemptAt || 0, value?.updatedAt || 0);
      return now - lastSeenAt <= DATASET_TELEMETRY_STALE_MS;
    })
    .sort((a, b) => (b[1]?.updatedAt || 0) - (a[1]?.updatedAt || 0))
    .slice(0, MAX_DATASET_TELEMETRY_ENTRIES);
  return Object.fromEntries(entries as Array<[string, OpenDataDatasetTelemetryEntry]>);
};

const loadStore = (): DatasetTelemetryRecord => {
  if (memoryStore) return memoryStore;
  const raw = readLocalJson<DatasetTelemetryRecord>(DATASET_TELEMETRY_STORAGE_KEY);
  const normalized = raw && typeof raw === "object" ? pruneRecord(raw) : {};
  memoryStore = normalized;
  return memoryStore;
};

const persistStore = () => {
  if (typeof window === "undefined") return;
  const record = pruneRecord(loadStore());
  memoryStore = record;
  writeLocalJson(DATASET_TELEMETRY_STORAGE_KEY, record);
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const getOpenDataDatasetTelemetry = (dataset: OpenDatasetMetadata) => {
  const key = buildDatasetTelemetryKey(dataset);
  if (!key) return undefined;
  const entry = loadStore()[key];
  return entry ? { ...entry } : undefined;
};

export const scoreOpenDataDatasetTelemetry = (dataset: OpenDatasetMetadata) => {
  const entry = getOpenDataDatasetTelemetry(dataset);
  if (!entry || entry.attempts <= 0) return 0;
  const attempts = Math.max(1, entry.attempts);
  const successRate = clamp(entry.successes / attempts, 0, 1);
  const failureRate = clamp(entry.failures / attempts, 0, 1);
  const averageHitsPerSuccess = entry.successes > 0 ? entry.totalHits / entry.successes : 0;
  const hitStrength = clamp(averageHitsPerSuccess / 30, 0, 1);
  const recencyDays = entry.lastSuccessAt
    ? Math.max(0, (Date.now() - entry.lastSuccessAt) / (1000 * 60 * 60 * 24))
    : Number.POSITIVE_INFINITY;
  const recencyBoost = recencyDays <= 7 ? 1 : recencyDays <= 30 ? 0.6 : recencyDays <= 90 ? 0.2 : 0;
  const confidence = clamp(Math.log2(attempts + 1) / 4, 0.2, 1);
  const raw = (successRate * 10) + (hitStrength * 4) + (recencyBoost * 2) - (failureRate * 8);
  return Math.round(clamp(raw * confidence, -12, 16));
};

export const recordOpenDataDatasetTelemetry = (input: {
  dataset: OpenDatasetMetadata;
  mode: "text" | "geometry";
  hits?: number;
  errored?: boolean;
  attempted?: boolean;
}) => {
  if (input.attempted === false) return;
  const key = buildDatasetTelemetryKey(input.dataset);
  if (!key) return;
  const now = Date.now();
  const store = loadStore();
  const current = store[key] || {
    attempts: 0,
    successes: 0,
    failures: 0,
    totalHits: 0,
    textSuccesses: 0,
    geometrySuccesses: 0,
    lastAttemptAt: 0,
    updatedAt: 0
  };
  const hits = Math.max(0, Math.floor(sanitizeNumber(input.hits)));
  current.attempts += 1;
  current.lastAttemptAt = now;
  current.updatedAt = now;
  if (input.errored) {
    current.failures += 1;
  } else if (hits > 0) {
    current.successes += 1;
    current.totalHits += hits;
    current.lastSuccessAt = now;
    if (input.mode === "text") {
      current.textSuccesses += 1;
    } else {
      current.geometrySuccesses += 1;
    }
  }
  store[key] = current;
  persistStore();
};

export const resetOpenDataDatasetTelemetry = () => {
  memoryStore = {};
  persistStore();
};
