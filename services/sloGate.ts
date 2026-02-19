import { RunMetrics, SloGateSummary, SloMetricSummary } from '../types';
import {
  SLO_EVIDENCE_RECOVERY_SUCCESS_RATE,
  SLO_HISTORY_WINDOW_RUNS,
  SLO_MEDIAN_LATENCY_MS,
  SLO_PARCEL_RESOLUTION_SUCCESS_RATE
} from '../constants';

type SloHistoryEntry = {
  timestamp: number;
  runLatencyMs?: number;
  parcelAttempted?: boolean;
  parcelSuccess?: boolean;
  evidenceNeeded?: boolean;
  evidenceSuccess?: boolean;
};

const SLO_HISTORY_STORAGE_KEY = 'overseer_slo_history';

const hasLocalStorage = () => typeof window !== 'undefined' && !!window.localStorage;

const loadHistory = (): SloHistoryEntry[] => {
  if (!hasLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(SLO_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry && typeof entry.timestamp === 'number');
  } catch {
    return [];
  }
};

const saveHistory = (history: SloHistoryEntry[]) => {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(SLO_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage failures
  }
};

const roundMetric = (value: number, digits = 3) => {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
};

const median = (values: number[]) => {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
};

const buildRateSummary = (target: number, actual: number | undefined, samples: number): SloMetricSummary => {
  if (!samples || actual === undefined) {
    return { target, actual, status: 'not_applicable', samples };
  }
  return {
    target,
    actual: roundMetric(actual),
    status: actual >= target ? 'met' : 'missed',
    samples
  };
};

const buildLatencySummary = (target: number, actual: number | undefined, samples: number): SloMetricSummary => {
  if (!samples || actual === undefined) {
    return { target, actual, status: 'not_applicable', samples };
  }
  const rounded = Math.round(actual);
  return {
    target,
    actual: rounded,
    status: rounded <= target ? 'met' : 'missed',
    samples
  };
};

export const evaluateSloGate = (runMetrics: RunMetrics): SloGateSummary => {
  const entry: SloHistoryEntry = {
    timestamp: Date.now()
  };

  if (Number.isFinite(runMetrics.runLatencyMs)) {
    entry.runLatencyMs = runMetrics.runLatencyMs;
  }

  if (runMetrics.parcelResolution) {
    entry.parcelAttempted = runMetrics.parcelResolution.attempted === true;
    entry.parcelSuccess = runMetrics.parcelResolution.success === true;
  }

  if (runMetrics.evidenceRecovery) {
    entry.evidenceNeeded = runMetrics.evidenceRecovery.needed === true;
    entry.evidenceSuccess = runMetrics.evidenceRecovery.success === true;
  }

  const history = [...loadHistory(), entry].slice(-SLO_HISTORY_WINDOW_RUNS);
  saveHistory(history);

  const parcelEntries = history.filter((item) => item.parcelAttempted);
  const parcelAttempts = parcelEntries.length;
  const parcelSuccesses = parcelEntries.filter((item) => item.parcelSuccess).length;
  const parcelRate = parcelAttempts > 0 ? parcelSuccesses / parcelAttempts : undefined;

  const evidenceEntries = history.filter((item) => item.evidenceNeeded);
  const evidenceAttempts = evidenceEntries.length;
  const evidenceSuccesses = evidenceEntries.filter((item) => item.evidenceSuccess).length;
  const evidenceRate = evidenceAttempts > 0 ? evidenceSuccesses / evidenceAttempts : undefined;

  const latencySamples = history
    .map((item) => item.runLatencyMs)
    .filter((value): value is number => Number.isFinite(value));
  const medianLatency = median(latencySamples);

  const parcelSummary = buildRateSummary(SLO_PARCEL_RESOLUTION_SUCCESS_RATE, parcelRate, parcelAttempts);
  const evidenceSummary = buildRateSummary(SLO_EVIDENCE_RECOVERY_SUCCESS_RATE, evidenceRate, evidenceAttempts);
  const latencySummary = buildLatencySummary(SLO_MEDIAN_LATENCY_MS, medianLatency, latencySamples.length);

  const gateReasons: string[] = [];
  if (parcelSummary.status === 'missed') {
    gateReasons.push(
      `Parcel resolution success rate ${parcelSummary.actual} below target ${parcelSummary.target} (${parcelSummary.samples} samples).`
    );
  }
  if (evidenceSummary.status === 'missed') {
    gateReasons.push(
      `Evidence recovery success rate ${evidenceSummary.actual} below target ${evidenceSummary.target} (${evidenceSummary.samples} samples).`
    );
  }
  if (latencySummary.status === 'missed') {
    gateReasons.push(
      `Median latency ${latencySummary.actual}ms above target ${latencySummary.target}ms (${latencySummary.samples} samples).`
    );
  }

  return {
    windowSize: SLO_HISTORY_WINDOW_RUNS,
    totalRuns: history.length,
    evaluatedAt: new Date().toISOString(),
    parcelResolution: parcelSummary,
    evidenceRecovery: evidenceSummary,
    medianLatencyMs: latencySummary,
    gateStatus: gateReasons.length > 0 ? 'blocked' : 'clear',
    gateReasons: gateReasons.length > 0 ? gateReasons : undefined
  };
};
