import React, { useState, useEffect } from 'react';
import { Activity, Brain, Settings, Search, Terminal, RotateCcw, Zap, Database, Trash2, Save } from 'lucide-react';
import { useOverseer } from './hooks/useOverseer';
import { AgentGraph } from './components/AgentGraph';
import { LogTerminal } from './components/LogTerminal';
import { ReportView } from './components/ReportView';
import { TransparencyPanel } from './components/TransparencyPanel';
import { LLMProvider, ModelOverrides, ModelRole, OpenDataAuthConfig, RunConfig, UniversalSettingsPayload } from './types';
import { getOpenAIModelDefaults, loadModelOverrides, saveModelOverrides } from './services/modelOverrides';
import { fetchAllowlist, updateAllowlist } from './services/accessAllowlistService';
import { fetchUniversalSettings, updateUniversalSettings } from './services/universalSettingsService';
import { buildUniversalSettingsPayload, normalizeUniversalSettingsPayload } from './services/universalSettingsPayload';
import { isSystemTestTopic } from './data/verticalLogic';
import { querySocrataRag } from './services/socrataRagClient';
import type { RagQueryHit } from './services/ragIndex';
import {
  clearOpenDataPersistentConfig,
  getOpenDataConfig,
  getOpenDataPersistencePreference,
  setOpenDataPersistencePreference,
  updateOpenDataConfig
} from './services/openDataConfig';
import { dispatchTransparencyMapInvalidate } from './services/transparencyMapEvents';
import {
  hasLocalSettingsSnapshot,
  readAllowlist,
  readAllowlistUpdatedAt,
  readProvider,
  readProviderKey,
  readRunConfig,
  readSettingsMetadata,
  readSettingsMigrationComplete,
  readUnlocked,
  isOptionalKeysPersistenceSupported,
  updateSettingsMetadata,
  writeAllowlist,
  writeAllowlistUpdatedAt,
  writeProvider,
  writeProviderKey,
  writeRunConfig,
  writeSettingsMigrationComplete,
  writeUnlocked
} from './services/storagePolicy';
import {
  SETTINGS_UPDATED_EVENT,
  MIN_AGENT_COUNT,
  MAX_AGENT_COUNT,
  MAX_METHOD_AGENTS,
  MIN_SEARCH_ROUNDS,
  MAX_SEARCH_ROUNDS,
  EARLY_STOP_DIMINISHING_SCORE,
  EARLY_STOP_NOVELTY_RATIO,
  EARLY_STOP_NEW_DOMAINS,
  EARLY_STOP_NEW_SOURCES
} from './constants';

const ENV_GEMINI_KEY = (process.env.GEMINI_API_KEY || '').trim();
const ENV_OPENAI_KEY = (process.env.OPENAI_API_KEY || '').trim();
const ENV_PROVIDER_RAW = (process.env.LLM_PROVIDER || '').trim().toLowerCase();
const ENV_PROVIDER = (ENV_PROVIDER_RAW === 'google' || ENV_PROVIDER_RAW === 'openai') ? ENV_PROVIDER_RAW : '';
const DEFAULT_PROVIDER: LLMProvider = (ENV_PROVIDER as LLMProvider) || (ENV_OPENAI_KEY && !ENV_GEMINI_KEY ? 'openai' : 'google');
const ENV_ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();
const REQUIRES_PASSWORD = ENV_ADMIN_PASSWORD.length > 0;
const PROXY_BASE_URL = (process.env.PROXY_BASE_URL || '').trim();
const USE_PROXY = PROXY_BASE_URL.length > 0;
const parseEnvNumber = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};
const parseEnvFloat = (value: string | undefined, fallback: number, min = 0, max = 1) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};
const ENV_MIN_AGENTS = parseEnvNumber(process.env.MIN_AGENT_COUNT, MIN_AGENT_COUNT);
const ENV_MAX_AGENTS = parseEnvNumber(process.env.MAX_AGENT_COUNT, MAX_AGENT_COUNT);
const ENV_MAX_METHOD_AGENTS = parseEnvNumber(process.env.MAX_METHOD_AGENTS, MAX_METHOD_AGENTS);
const ENV_MIN_ROUNDS = parseEnvNumber(process.env.MIN_SEARCH_ROUNDS, MIN_SEARCH_ROUNDS);
const ENV_MAX_ROUNDS = parseEnvNumber(process.env.MAX_SEARCH_ROUNDS, MAX_SEARCH_ROUNDS);
const ENV_EARLY_STOP_DIMINISHING = parseEnvFloat(process.env.EARLY_STOP_DIMINISHING_SCORE, EARLY_STOP_DIMINISHING_SCORE);
const ENV_EARLY_STOP_NOVELTY = parseEnvFloat(process.env.EARLY_STOP_NOVELTY_RATIO, EARLY_STOP_NOVELTY_RATIO);
const ENV_EARLY_STOP_NEW_DOMAINS = parseEnvNumber(process.env.EARLY_STOP_NEW_DOMAINS, EARLY_STOP_NEW_DOMAINS);
const ENV_EARLY_STOP_NEW_SOURCES = parseEnvNumber(process.env.EARLY_STOP_NEW_SOURCES, EARLY_STOP_NEW_SOURCES);

const DEFAULT_RUN_CONFIG: RunConfig = {
  minAgents: ENV_MIN_AGENTS,
  maxAgents: ENV_MAX_AGENTS,
  maxMethodAgents: ENV_MAX_METHOD_AGENTS,
  forceExhaustion: false,
  minRounds: ENV_MIN_ROUNDS,
  maxRounds: ENV_MAX_ROUNDS,
  earlyStopDiminishingScore: ENV_EARLY_STOP_DIMINISHING,
  earlyStopNoveltyRatio: ENV_EARLY_STOP_NOVELTY,
  earlyStopNewDomains: ENV_EARLY_STOP_NEW_DOMAINS,
  earlyStopNewSources: ENV_EARLY_STOP_NEW_SOURCES
};

const MODEL_NAME_PATTERN = /^[A-Za-z0-9._:-]+$/;
const isModelNameValid = (value: string) => MODEL_NAME_PATTERN.test(value.trim());
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OPENAI_MODEL_SUGGESTIONS = [
  'gpt-5-codex',
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4o',
  'gpt-4o-mini'
];

const MODEL_ROLE_CONFIG: Array<{ role: ModelRole; label: string; help: string }> = [
  { role: 'overseer_planning', label: 'Overseer Planning', help: 'Plans the run; fast model usually fine.' },
  { role: 'method_discovery', label: 'Method Discovery', help: 'Builds search tactics; fast model is cost-friendly.' },
  { role: 'sector_analysis', label: 'Sector Analysis', help: 'Maps angles; reasoning model boosts coverage.' },
  { role: 'deep_research_l1', label: 'Deep Research L1', help: 'First-pass research; fast model controls cost.' },
  { role: 'deep_research_l2', label: 'Deep Research L2', help: 'Follow-up dives; stronger model improves recall.' },
  { role: 'method_audit', label: 'Method Audit', help: 'Audits method quality; fast model is usually enough.' },
  { role: 'gap_hunter', label: 'Gap Hunter', help: 'Finds missing leads; reasoning model recommended.' },
  { role: 'exhaustion_scout', label: 'Exhaustion Scout', help: 'Tests saturation; fast model is fine.' },
  { role: 'critique', label: 'Critique', help: 'Critiques findings; reasoning model recommended.' },
  { role: 'synthesis', label: 'Synthesis', help: 'Writes the report; larger model recommended.' },
  { role: 'validation', label: 'Validation', help: 'Validates results; reasoning model recommended.' }
];

const sanitizeModelOverrideDraft = (overrides: ModelOverrides): ModelOverrides => {
  const sanitized: ModelOverrides = {};
  for (const { role } of MODEL_ROLE_CONFIG) {
    const value = (overrides[role] || '').trim();
    if (value && isModelNameValid(value)) {
      sanitized[role] = value;
    }
  }
  return sanitized;
};

const parseAllowlistText = (text: string) => {
  const entries: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  const chunks = text.split(/[\n,]+/);
  for (const chunk of chunks) {
    const value = chunk.trim().toLowerCase();
    if (!value) continue;
    if (!EMAIL_PATTERN.test(value)) {
      invalid.push(value);
      continue;
    }
    if (seen.has(value)) continue;
    seen.add(value);
    entries.push(value);
  }
  return { entries, invalid };
};

const sanitizeOpenDataAuth = (input: OpenDataAuthConfig): OpenDataAuthConfig => {
  const normalize = (value?: string) => {
    const trimmed = (value || '').trim();
    return trimmed ? trimmed : undefined;
  };
  return {
    socrataAppToken: normalize(input.socrataAppToken),
    arcgisApiKey: normalize(input.arcgisApiKey),
    geocodingEmail: normalize(input.geocodingEmail),
    geocodingKey: normalize(input.geocodingKey)
  };
};

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [provider, setProvider] = useState<LLMProvider>(DEFAULT_PROVIDER);
  const [keyOverrides, setKeyOverrides] = useState<{ google: string; openai: string }>({ google: '', openai: '' });
  const [runConfig, setRunConfig] = useState<RunConfig>({ ...DEFAULT_RUN_CONFIG });
  const [modelOverrides, setModelOverrides] = useState<ModelOverrides>({});
  const [draftProvider, setDraftProvider] = useState<LLMProvider>(DEFAULT_PROVIDER);
  const [draftKeys, setDraftKeys] = useState<{ google: string; openai: string }>({ google: '', openai: '' });
  const [draftRunConfig, setDraftRunConfig] = useState<RunConfig>({ ...DEFAULT_RUN_CONFIG });
  const [draftModelOverrides, setDraftModelOverrides] = useState<ModelOverrides>({});
  const [draftOpenDataAuth, setDraftOpenDataAuth] = useState<OpenDataAuthConfig>(() => ({ ...getOpenDataConfig().auth }));
  const [openDataPersist, setOpenDataPersist] = useState<boolean>(() => getOpenDataPersistencePreference());
  const [optionalKeysPolicyReady] = useState<boolean>(() => isOptionalKeysPersistenceSupported());
  const [ragQuery, setRagQuery] = useState('catalog/v1 search_context q limit offset');
  const [ragHits, setRagHits] = useState<RagQueryHit[]>([]);
  const [ragStatus, setRagStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [ragError, setRagError] = useState('');
  const [bulkModelValue, setBulkModelValue] = useState('');
  const [accessAllowlist, setAccessAllowlist] = useState<string[]>([]);
  const [draftAllowlistText, setDraftAllowlistText] = useState('');
  const [allowlistInput, setAllowlistInput] = useState('');
  const [allowlistInputError, setAllowlistInputError] = useState('');
  const [allowlistCopyStatus, setAllowlistCopyStatus] = useState('');
  const [allowlistUpdatedAt, setAllowlistUpdatedAt] = useState<string | null>(null);
  const [allowlistSyncStatus, setAllowlistSyncStatus] = useState<{ tone: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [allowlistSyncing, setAllowlistSyncing] = useState(false);
  const [settingsSyncStatus, setSettingsSyncStatus] = useState<{ tone: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [settingsSyncing, setSettingsSyncing] = useState(false);
  const [settingsUpdatedAt, setSettingsUpdatedAt] = useState<string | null>(null);
  const [settingsUpdatedBy, setSettingsUpdatedBy] = useState<string | null>(null);
  const [settingsVersion, setSettingsVersion] = useState<number | null>(null);
  const [settingsConflict, setSettingsConflict] = useState<UniversalSettingsPayload | null>(null);
  const [settingsConflictMeta, setSettingsConflictMeta] = useState<{ updatedAt: string | null; updatedBy: string | null; version: number | null } | null>(null);
  const [settingsCloudStatus, setSettingsCloudStatus] = useState<'unknown' | 'available' | 'unavailable' | 'unauthorized'>('unknown');
  const [showSettings, setShowSettings] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showTransparency, setShowTransparency] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!REQUIRES_PASSWORD);
  const [showAuth, setShowAuth] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [pendingAction, setPendingAction] = useState<'settings' | 'start' | null>(null);

  const dispatchSettingsUpdate = (detail?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    try {
      window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail }));
      dispatchTransparencyMapInvalidate({
        source: 'settings-save',
        reason: 'settings update dispatched',
        changes: ['settings']
      });
    } catch (_) {
      // ignore
    }
  };

  const handleRagLookup = async () => {
    const query = ragQuery.trim();
    if (!query) {
      setRagError('Enter a query to search the RAG bundle.');
      return;
    }
    setRagStatus('loading');
    setRagError('');
    try {
      const hits = await querySocrataRag(query, { topK: 4 });
      setRagHits(hits);
      if (hits.length === 0) {
        setRagError('No snippets matched.');
      }
      setRagStatus('idle');
    } catch (_) {
      setRagStatus('error');
      setRagError('RAG lookup failed.');
    }
  };

  const persistSettingsMetadata = (meta: { updatedAt?: string | null; updatedBy?: string | null; version?: number | null }) => {
    const updatedAt = meta.updatedAt ?? null;
    const updatedBy = meta.updatedBy ?? null;
    const version = typeof meta.version === 'number' ? meta.version : null;
    setSettingsUpdatedAt(updatedAt);
    setSettingsUpdatedBy(updatedBy);
    setSettingsVersion(version);
    updateSettingsMetadata({ updatedAt, updatedBy, version });
    dispatchSettingsUpdate({ updatedAt, updatedBy, version, source: 'cloud' });
  };

  const applySettingsPayload = (payload: UniversalSettingsPayload, options?: { updateDraft?: boolean }) => {
    setProvider(payload.provider);
    setRunConfig(payload.runConfig);
    setModelOverrides(payload.modelOverrides);
    writeProvider(payload.provider);
    writeRunConfig(payload.runConfig);
    saveModelOverrides(payload.modelOverrides);
    if (Array.isArray(payload.accessAllowlist)) {
      setAccessAllowlist(payload.accessAllowlist);
      writeAllowlist(JSON.stringify(payload.accessAllowlist));
    }
    if (options?.updateDraft) {
      setDraftProvider(payload.provider);
      setDraftRunConfig(payload.runConfig);
      setDraftModelOverrides(payload.modelOverrides);
      if (Array.isArray(payload.accessAllowlist)) {
        setDraftAllowlistText(payload.accessAllowlist.join('\n'));
      }
    }
  };

  const recordLocalSettingsUpdate = () => {
    const stamp = new Date().toISOString();
    updateSettingsMetadata({ localUpdatedAt: stamp });
    dispatchSettingsUpdate({ localUpdatedAt: stamp, source: 'local' });
  };

  const areAllowlistsEqual = (left: string[], right: string[]) => {
    if (left.length !== right.length) return false;
    const setLeft = new Set(left);
    for (const entry of right) {
      if (!setLeft.has(entry)) return false;
    }
    return true;
  };

  const refreshAllowlistFromWorker = async (showStatus: boolean, updateDraft = false) => {
    setAllowlistSyncing(true);
    if (showStatus) {
      setAllowlistSyncStatus({ tone: 'info', message: 'SYNCING ACCESS ALLOWLIST…' });
    }
    try {
      const data = await fetchAllowlist();
      const entries = Array.isArray(data?.entries) ? data.entries : [];
      setAccessAllowlist(entries);
      writeAllowlist(JSON.stringify(entries));
      if (data?.updatedAt) {
        setAllowlistUpdatedAt(data.updatedAt);
        writeAllowlistUpdatedAt(data.updatedAt);
      } else {
        setAllowlistUpdatedAt(null);
        writeAllowlistUpdatedAt(null);
      }
      if (updateDraft) {
        setDraftAllowlistText(entries.join('\n'));
      }
      if (showStatus) {
        const stamp = data?.updatedAt ? ` (updated ${new Date(data.updatedAt).toLocaleString()})` : '';
        setAllowlistSyncStatus({ tone: 'success', message: `ALLOWLIST SYNCED${stamp}` });
      }
    } catch (err) {
      if (showStatus) {
        const message = err instanceof Error ? err.message : 'Allowlist sync failed.';
        setAllowlistSyncStatus({ tone: 'error', message: `SYNC FAILED: ${message}` });
      }
    } finally {
      setAllowlistSyncing(false);
    }
  };

  const syncUniversalSettingsFromCloud = async (localSnapshot: UniversalSettingsPayload, hasLocalSettings: boolean) => {
    setSettingsSyncing(true);
    try {
      const result = await fetchUniversalSettings();
      if (!result.ok) {
        const unauthorized = result.status === 401 || result.status === 403;
        setSettingsCloudStatus(unauthorized ? 'unauthorized' : 'unavailable');
        setSettingsSyncStatus({
          tone: unauthorized ? 'warning' : 'info',
          message: unauthorized
            ? 'Cloud settings unavailable (Access auth missing). Using local settings.'
            : 'Cloud settings unavailable. Using local settings.'
        });
        return;
      }

      setSettingsCloudStatus('available');
      const data = result.data;
      if (data.settings) {
        const normalized = normalizeUniversalSettingsPayload(data.settings, {
          provider: DEFAULT_PROVIDER,
          runConfig: DEFAULT_RUN_CONFIG
        });
        if (normalized) {
          applySettingsPayload(normalized);
          persistSettingsMetadata({
            updatedAt: data.updatedAt ?? null,
            updatedBy: data.updatedBy ?? null,
            version: data.version ?? null
          });
        }
        return;
      }

      const migrationComplete = readSettingsMigrationComplete();
      if (!migrationComplete && hasLocalSettings) {
        const migrationResult = await updateUniversalSettings(localSnapshot, null, null);
        if (migrationResult.ok) {
          persistSettingsMetadata({
            updatedAt: migrationResult.data.updatedAt ?? null,
            updatedBy: migrationResult.data.updatedBy ?? null,
            version: migrationResult.data.version ?? null
          });
          writeSettingsMigrationComplete(true);
          setSettingsSyncStatus({ tone: 'success', message: 'Migrated local settings to cloud.' });
        } else {
          setSettingsSyncStatus({
            tone: 'warning',
            message: `Settings migration failed: ${migrationResult.error}`
          });
        }
      }
    } catch (err) {
      setSettingsCloudStatus('unavailable');
      const message = err instanceof Error ? err.message : 'Cloud settings unavailable.';
      setSettingsSyncStatus({ tone: 'info', message });
    } finally {
      setSettingsSyncing(false);
    }
  };

  // Initialize from local storage if available
  useEffect(() => {
    const storedProvider = readProvider();
    const resolvedProvider = storedProvider === 'google' || storedProvider === 'openai' ? storedProvider : DEFAULT_PROVIDER;
    setProvider(resolvedProvider);

    const storedGoogle = readProviderKey('google') || '';
    const storedOpenAI = readProviderKey('openai') || '';
    setKeyOverrides({ google: storedGoogle, openai: storedOpenAI });

    let resolvedRunConfig: RunConfig = { ...DEFAULT_RUN_CONFIG };
    try {
      const parsed = readRunConfig();
      if (parsed && typeof parsed === 'object') {
        const minAgents = parseEnvNumber(parsed?.minAgents?.toString(), ENV_MIN_AGENTS);
        const maxAgents = parseEnvNumber(parsed?.maxAgents?.toString(), ENV_MAX_AGENTS);
        const maxMethodAgents = parseEnvNumber(parsed?.maxMethodAgents?.toString(), ENV_MAX_METHOD_AGENTS);
        const forceExhaustion = parsed?.forceExhaustion === true;
        const minRounds = parseEnvNumber(parsed?.minRounds?.toString(), ENV_MIN_ROUNDS);
        const maxRounds = parseEnvNumber(parsed?.maxRounds?.toString(), ENV_MAX_ROUNDS);
        const earlyStopDiminishingScore = parseEnvFloat(parsed?.earlyStopDiminishingScore?.toString(), ENV_EARLY_STOP_DIMINISHING);
        const earlyStopNoveltyRatio = parseEnvFloat(parsed?.earlyStopNoveltyRatio?.toString(), ENV_EARLY_STOP_NOVELTY);
        const earlyStopNewDomains = parseEnvNumber(parsed?.earlyStopNewDomains?.toString(), ENV_EARLY_STOP_NEW_DOMAINS);
        const earlyStopNewSources = parseEnvNumber(parsed?.earlyStopNewSources?.toString(), ENV_EARLY_STOP_NEW_SOURCES);
        resolvedRunConfig = {
          minAgents,
          maxAgents: Math.max(minAgents, maxAgents),
          maxMethodAgents,
          forceExhaustion,
          minRounds,
          maxRounds: Math.max(minRounds, maxRounds),
          earlyStopDiminishingScore,
          earlyStopNoveltyRatio,
          earlyStopNewDomains,
          earlyStopNewSources
        };
      }
    } catch (_) {
      // ignore
    }
    setRunConfig(resolvedRunConfig);

    const storedOverrides = sanitizeModelOverrideDraft(loadModelOverrides());
    setModelOverrides(storedOverrides);

    let resolvedAllowlist: string[] = [];
    try {
      const storedAllowlist = readAllowlist();
      if (storedAllowlist) {
        try {
          const parsed = JSON.parse(storedAllowlist);
          if (Array.isArray(parsed)) {
            resolvedAllowlist = parseAllowlistText(parsed.join('\n')).entries;
          } else if (typeof parsed === 'string') {
            resolvedAllowlist = parseAllowlistText(parsed).entries;
          }
        } catch (_) {
          resolvedAllowlist = parseAllowlistText(storedAllowlist).entries;
        }
      }
    } catch (_) {
      // ignore
    }
    setAccessAllowlist(resolvedAllowlist);

    try {
      const storedUpdatedAt = readAllowlistUpdatedAt();
      if (storedUpdatedAt) setAllowlistUpdatedAt(storedUpdatedAt);
    } catch (_) {
      // ignore
    }

    try {
      const meta = readSettingsMetadata();
      if (meta.updatedAt) setSettingsUpdatedAt(meta.updatedAt);
      if (meta.updatedBy) setSettingsUpdatedBy(meta.updatedBy);
      if (typeof meta.version === 'number') setSettingsVersion(meta.version);
    } catch (_) {
      // ignore
    }

    if (REQUIRES_PASSWORD) {
      try {
        if (readUnlocked()) setIsUnlocked(true);
      } catch (_) {
        // ignore
      }
    }

    const hasLocalSettings = hasLocalSettingsSnapshot();
    const localSnapshot = buildUniversalSettingsPayload({
      provider: resolvedProvider,
      runConfig: resolvedRunConfig,
      modelOverrides: storedOverrides,
      defaults: { runConfig: DEFAULT_RUN_CONFIG }
    });

    const init = async () => {
      await syncUniversalSettingsFromCloud(localSnapshot, hasLocalSettings);
      await refreshAllowlistFromWorker(false);
    };

    void init();
  }, []);

  const handleSaveKey = async () => {
    setSettingsSyncStatus(null);
    setSettingsConflict(null);
    setSettingsConflictMeta(null);
    const nextKeys = {
      google: draftKeys.google.trim(),
      openai: draftKeys.openai.trim()
    };
    const minAgents = Math.max(1, Math.floor(Number(draftRunConfig.minAgents) || ENV_MIN_AGENTS));
    const maxAgents = Math.max(minAgents, Math.floor(Number(draftRunConfig.maxAgents) || ENV_MAX_AGENTS));
    const maxMethodAgents = Math.max(1, Math.floor(Number(draftRunConfig.maxMethodAgents) || ENV_MAX_METHOD_AGENTS));
    const minRounds = Math.max(1, Math.floor(Number(draftRunConfig.minRounds) || ENV_MIN_ROUNDS));
    const maxRounds = Math.max(minRounds, Math.floor(Number(draftRunConfig.maxRounds) || ENV_MAX_ROUNDS));
    const rawDiminishing = Number(draftRunConfig.earlyStopDiminishingScore);
    const rawNovelty = Number(draftRunConfig.earlyStopNoveltyRatio);
    const rawNewDomains = Number(draftRunConfig.earlyStopNewDomains);
    const rawNewSources = Number(draftRunConfig.earlyStopNewSources);
    const earlyStopDiminishingScore = Math.max(0, Math.min(1, Number.isFinite(rawDiminishing) ? rawDiminishing : ENV_EARLY_STOP_DIMINISHING));
    const earlyStopNoveltyRatio = Math.max(0, Math.min(1, Number.isFinite(rawNovelty) ? rawNovelty : ENV_EARLY_STOP_NOVELTY));
    const earlyStopNewDomains = Math.max(0, Math.floor(Number.isFinite(rawNewDomains) ? rawNewDomains : ENV_EARLY_STOP_NEW_DOMAINS));
    const earlyStopNewSources = Math.max(0, Math.floor(Number.isFinite(rawNewSources) ? rawNewSources : ENV_EARLY_STOP_NEW_SOURCES));
    const nextRunConfig = {
      minAgents,
      maxAgents,
      maxMethodAgents,
      forceExhaustion: draftRunConfig.forceExhaustion,
      minRounds,
      maxRounds,
      earlyStopDiminishingScore,
      earlyStopNoveltyRatio,
      earlyStopNewDomains,
      earlyStopNewSources
    };

    setProvider(draftProvider);
    setKeyOverrides(nextKeys);
    setRunConfig(nextRunConfig);
    writeProvider(draftProvider);
    writeRunConfig(nextRunConfig);
    recordLocalSettingsUpdate();

    if (nextKeys.google) {
      writeProviderKey('google', nextKeys.google);
    } else {
      writeProviderKey('google', '');
    }
    if (nextKeys.openai) {
      writeProviderKey('openai', nextKeys.openai);
    } else {
      writeProviderKey('openai', '');
    }

    const nextOpenDataAuth = sanitizeOpenDataAuth(draftOpenDataAuth);
    updateOpenDataConfig({ auth: nextOpenDataAuth }, { persist: openDataPersist });
    if (openDataPersist) {
      setOpenDataPersistencePreference(true);
    } else {
      setOpenDataPersistencePreference(false);
      clearOpenDataPersistentConfig();
    }

    const sanitizedOverrides = sanitizeModelOverrideDraft(draftModelOverrides);
    setModelOverrides(sanitizedOverrides);
    saveModelOverrides(sanitizedOverrides);

    const sanitizedAllowlist = parseAllowlistText(draftAllowlistText).entries;
    const allowlistChanged = !areAllowlistsEqual(sanitizedAllowlist, accessAllowlist);
    let allowlistOk = true;
    if (allowlistChanged) {
      setAllowlistSyncStatus({ tone: 'info', message: 'SYNCING ACCESS ALLOWLIST…' });
      setAllowlistSyncing(true);
      try {
        const allowlistResult = await updateAllowlist(sanitizedAllowlist, allowlistUpdatedAt);
        if (allowlistResult.ok) {
          const { entries, updatedAt } = allowlistResult.data;
          const resolvedEntries = Array.isArray(entries) ? entries : sanitizedAllowlist;
          setAccessAllowlist(resolvedEntries);
          writeAllowlist(JSON.stringify(resolvedEntries));
          if (updatedAt) {
            setAllowlistUpdatedAt(updatedAt);
            writeAllowlistUpdatedAt(updatedAt);
          }
          setDraftAllowlistText(resolvedEntries.join('\n'));
          setAllowlistSyncStatus({
            tone: 'success',
            message: `SYNCED TO CLOUDFLARE ACCESS (${resolvedEntries.length} ENTRIES).`
          });
        } else if (allowlistResult.status === 409 || allowlistResult.status === 428) {
          allowlistOk = false;
          setAllowlistSyncStatus({
            tone: 'warning',
            message: 'ALLOWLIST CHANGED ON SERVER. REFRESH BEFORE RESUBMITTING.'
          });
        } else {
          allowlistOk = false;
          setAllowlistSyncStatus({
            tone: 'error',
            message: `SYNC FAILED: ${allowlistResult.error}`
          });
        }
      } catch (err) {
        allowlistOk = false;
        const message = err instanceof Error ? err.message : 'Allowlist sync failed.';
        setAllowlistSyncStatus({
          tone: 'error',
          message: `SYNC FAILED: ${message}`
        });
      } finally {
        setAllowlistSyncing(false);
      }
    }

    const settingsPayload = buildUniversalSettingsPayload({
      provider: draftProvider,
      runConfig: nextRunConfig,
      modelOverrides: sanitizedOverrides,
      defaults: { runConfig: DEFAULT_RUN_CONFIG }
    });

    let settingsOk = true;
    setSettingsSyncing(true);
    try {
      const settingsResult = await updateUniversalSettings(settingsPayload, settingsUpdatedAt, settingsVersion);
      if (settingsResult.ok) {
        setSettingsCloudStatus('available');
        persistSettingsMetadata({
          updatedAt: settingsResult.data.updatedAt ?? null,
          updatedBy: settingsResult.data.updatedBy ?? null,
          version: settingsResult.data.version ?? null
        });
        setSettingsSyncStatus({ tone: 'success', message: 'Settings synced to cloud.' });
      } else if (settingsResult.status === 409 || settingsResult.status === 428) {
        settingsOk = false;
        const conflictPayload = normalizeUniversalSettingsPayload(settingsResult.data?.settings, {
          provider: DEFAULT_PROVIDER,
          runConfig: DEFAULT_RUN_CONFIG
        });
        if (conflictPayload) {
          setSettingsConflict(conflictPayload);
          setSettingsConflictMeta({
            updatedAt: settingsResult.data?.updatedAt ?? null,
            updatedBy: settingsResult.data?.updatedBy ?? null,
            version: settingsResult.data?.version ?? null
          });
        }
        setSettingsSyncStatus({
          tone: 'warning',
          message: 'Cloud settings changed. Load latest settings before saving.'
        });
      } else {
        settingsOk = false;
        const unauthorized = settingsResult.status === 401 || settingsResult.status === 403;
        setSettingsCloudStatus(unauthorized ? 'unauthorized' : 'unavailable');
        setSettingsSyncStatus({
          tone: unauthorized ? 'warning' : 'error',
          message: `Cloud sync failed: ${settingsResult.error}`
        });
      }
    } catch (err) {
      settingsOk = false;
      const message = err instanceof Error ? err.message : 'Cloud sync failed.';
      setSettingsCloudStatus('unavailable');
      setSettingsSyncStatus({ tone: 'error', message: `Cloud sync failed: ${message}` });
    } finally {
      setSettingsSyncing(false);
    }

    if (allowlistOk && settingsOk) {
      setShowSettings(false);
    }
  };

  const handleClearKey = () => {
    setDraftKeys(prev => ({ ...prev, [draftProvider]: '' }));
  };

  const doOpenSettings = () => {
    setDraftProvider(provider);
    setDraftKeys(keyOverrides);
    setDraftRunConfig(runConfig);
    setDraftModelOverrides(modelOverrides);
    setDraftOpenDataAuth({ ...getOpenDataConfig().auth });
    setOpenDataPersist(getOpenDataPersistencePreference());
    setBulkModelValue('');
    setDraftAllowlistText(accessAllowlist.join('\n'));
    setAllowlistInput('');
    setAllowlistInputError('');
    setAllowlistCopyStatus('');
    setAllowlistSyncStatus(null);
    setShowSettings(true);
  };

  const handleLoadCloudSettings = () => {
    if (!settingsConflict) return;
    applySettingsPayload(settingsConflict, { updateDraft: true });
    if (settingsConflictMeta) {
      persistSettingsMetadata({
        updatedAt: settingsConflictMeta.updatedAt,
        updatedBy: settingsConflictMeta.updatedBy,
        version: settingsConflictMeta.version
      });
    }
    setSettingsConflict(null);
    setSettingsConflictMeta(null);
    setSettingsSyncStatus({ tone: 'info', message: 'Loaded cloud settings.' });
  };

  const openaiModelDefaults = getOpenAIModelDefaults();

  const handleApplyModelToAll = () => {
    const value = bulkModelValue.trim();
    if (!value || !isModelNameValid(value)) return;
    const nextOverrides: ModelOverrides = {};
    for (const { role } of MODEL_ROLE_CONFIG) {
      nextOverrides[role] = value;
    }
    setDraftModelOverrides(nextOverrides);
  };

  const handleResetModelOverrides = () => {
    setDraftModelOverrides({});
    setBulkModelValue('');
  };

  const handleOpenDataPersistToggle = (next: boolean) => {
    if (!optionalKeysPolicyReady) return;
    if (next) {
      const confirmed = window.confirm(
        'Persist optional open-data keys in localStorage across browser restarts? This is optional and stores keys only on this device.'
      );
      if (!confirmed) return;
    }
    setOpenDataPersist(next);
  };

  const socrataToken = (draftOpenDataAuth.socrataAppToken || '').trim();
  const arcgisApiKey = (draftOpenDataAuth.arcgisApiKey || '').trim();
  const geocodingEmail = (draftOpenDataAuth.geocodingEmail || '').trim();
  const geocodingKey = (draftOpenDataAuth.geocodingKey || '').trim();

  const { entries: draftAllowlistEntries, invalid: draftAllowlistInvalid } = parseAllowlistText(draftAllowlistText);

  const handleAddAllowlistEntry = () => {
    const value = allowlistInput.trim().toLowerCase();
    if (!value) return;
    if (!EMAIL_PATTERN.test(value)) {
      setAllowlistInputError('Invalid email format.');
      return;
    }
    setAllowlistInputError('');
    const nextEntries = draftAllowlistEntries.includes(value)
      ? draftAllowlistEntries
      : [...draftAllowlistEntries, value];
    setDraftAllowlistText(nextEntries.join('\n'));
    setAllowlistInput('');
  };

  const handleRemoveAllowlistEntry = () => {
    const value = allowlistInput.trim().toLowerCase();
    if (!value) return;
    setAllowlistInputError('');
    const nextEntries = draftAllowlistEntries.filter(entry => entry !== value);
    setDraftAllowlistText(nextEntries.join('\n'));
    setAllowlistInput('');
  };

  const handleCopyAllowlist = async () => {
    const payload = draftAllowlistEntries.join('\n');
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setAllowlistCopyStatus('COPIED');
    } catch (_) {
      setAllowlistCopyStatus('COPY FAILED');
    }
    window.setTimeout(() => setAllowlistCopyStatus(''), 2000);
  };

  const { agents, logs, report, isRunning, startResearch, resetRun, skills } = useOverseer();

  const effectiveKeys = {
    google: keyOverrides.google || ENV_GEMINI_KEY,
    openai: keyOverrides.openai || ENV_OPENAI_KEY
  };
  const effectiveKey = provider === 'google' ? effectiveKeys.google : effectiveKeys.openai;
  const hasKey = !!effectiveKey || USE_PROXY;
  const draftEffectiveKeys = {
    google: draftKeys.google || ENV_GEMINI_KEY,
    openai: draftKeys.openai || ENV_OPENAI_KEY
  };
  const draftEffectiveKey = draftProvider === 'google' ? draftEffectiveKeys.google : draftEffectiveKeys.openai;
  const draftHasKey = !!draftEffectiveKey;
  const draftUsingEnvKey = draftProvider === 'google' ? (!draftKeys.google && !!ENV_GEMINI_KEY) : (!draftKeys.openai && !!ENV_OPENAI_KEY);

  const requireAuth = (action: 'settings' | 'start') => {
    if (action === 'start' && isSystemTestTopic(topic)) return true;
    if (!REQUIRES_PASSWORD || isUnlocked) return true;
    setPendingAction(action);
    setAuthInput('');
    setAuthError('');
    setShowAuth(true);
    return false;
  };

  const doStart = () => {
    if (!topic.trim()) return;
    if (!effectiveKey && !USE_PROXY && !isSystemTestTopic(topic)) {
        openSettings();
        return;
    }
    startResearch(topic, provider, effectiveKey, { ...runConfig, modelOverrides });
  };

  const openSettings = () => {
    if (!requireAuth('settings')) return;
    doOpenSettings();
  };

  const handleStart = () => {
    if (!requireAuth('start')) return;
    doStart();
  };

  const handleAuthSubmit = () => {
    if (authInput !== ENV_ADMIN_PASSWORD) {
      setAuthError('Invalid password.');
      return;
    }
    setIsUnlocked(true);
    try {
      writeUnlocked(true);
    } catch (_) {
      // ignore
    }
    setShowAuth(false);
    const action = pendingAction;
    setPendingAction(null);
    if (action === 'settings') doOpenSettings();
    if (action === 'start') doStart();
  };

  const handleAuthCancel = () => {
    setShowAuth(false);
    setPendingAction(null);
    setAuthInput('');
    setAuthError('');
  };

  const handleNewSearch = () => {
    resetRun('user_reset');
    setTopic('');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyber-green selection:text-black flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-cyber-green" />
          <div>
            <h1 className="font-bold text-lg tracking-wider">DEEPSEARCH OVERSEER</h1>
            <div className="text-[10px] text-gray-500 font-mono tracking-widest">AUTONOMOUS RESEARCH PROTOCOL</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {skills.length > 0 && (
             <button
               onClick={() => setShowSkills(!showSkills)}
               className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-700 hover:border-cyber-blue transition-colors text-xs font-mono text-cyber-blue"
             >
               <Zap className="w-3 h-3" />
               SKILLS: {skills.length}
             </button>
           )}
           <button
             onClick={handleNewSearch}
             data-testid="new-search"
             className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-700 hover:border-cyber-green transition-colors text-xs font-mono text-cyber-green"
           >
             <RotateCcw className="w-3 h-3" />
             NEW SEARCH
           </button>
           <button
             onClick={openSettings}
             className={`p-2 rounded-full hover:bg-gray-800 transition-colors ${!hasKey ? 'animate-pulse text-yellow-500' : 'text-gray-400'}`}
             title="Configure API Key"
           >
             <Settings className="w-5 h-5" />
           </button>
           <button
             onClick={() => setShowTransparency(true)}
             className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400"
             title="Open Transparency Panel"
           >
             <Terminal className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuth && REQUIRES_PASSWORD && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4">
          <div className="bg-cyber-gray border border-gray-700 p-6 rounded-lg max-w-sm w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyber-blue"></div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-mono">
              ACCESS_CONTROL
            </h2>
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-mono">
                Enter password to {pendingAction === 'settings' ? 'access settings' : 'run search'}.
              </p>
              <input
                type="password"
                value={authInput}
                onChange={(e) => setAuthInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
                placeholder="Password"
                className="w-full bg-black border border-gray-700 rounded p-2 text-sm focus:border-cyber-blue outline-none transition-colors font-mono text-cyber-blue"
                autoFocus
              />
              {authError && (
                <p className="text-[10px] text-red-500 font-mono">{authError}</p>
              )}
              <div className="flex justify-between pt-2">
                <button
                  onClick={handleAuthCancel}
                  className="px-3 py-2 text-gray-400 hover:text-white rounded text-xs font-mono transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleAuthSubmit}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 hover:border-cyber-blue text-white font-mono text-xs uppercase tracking-widest transition-all"
                >
                  UNLOCK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-cyber-gray border border-gray-700 p-6 rounded-lg max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
             <div className="absolute top-0 left-0 w-full h-1 bg-cyber-green"></div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-mono">
              <Settings className="w-5 h-5" /> SYSTEM_CONFIG
            </h2>
            <div className="space-y-4 overflow-y-scroll pr-2 flex-1 min-h-0">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-2">LLM PROVIDER</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDraftProvider('google')}
                    className={`px-3 py-2 rounded border text-xs font-mono transition-colors ${draftProvider === 'google' ? 'border-cyber-green text-cyber-green bg-black' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    GOOGLE
                  </button>
                  <button
                    onClick={() => setDraftProvider('openai')}
                    className={`px-3 py-2 rounded border text-xs font-mono transition-colors ${draftProvider === 'openai' ? 'border-cyber-green text-cyber-green bg-black' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    OPENAI
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Example: choose OPENAI to use per-role model overrides; choose GOOGLE to run on Gemini with your Google key.
                </p>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">GEMINI_API_KEY</label>
                <input
                  type="password"
                  value={draftKeys.google}
                  onChange={(e) => setDraftKeys(prev => ({ ...prev, google: e.target.value }))}
                  placeholder={ENV_GEMINI_KEY ? 'Using .env.local' : 'AIza...'}
                  className="w-full bg-black border border-gray-700 rounded p-2 text-sm focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Leave blank to use `.env.local`. Get a free key at <a href="https://aistudio.google.com/" target="_blank" className="underline hover:text-cyber-green">Google AI Studio</a>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">OPENAI_API_KEY</label>
                <input
                  type="password"
                  value={draftKeys.openai}
                  onChange={(e) => setDraftKeys(prev => ({ ...prev, openai: e.target.value }))}
                  placeholder={ENV_OPENAI_KEY ? 'Using .env.local' : 'sk-...'}
                  className="w-full bg-black border border-gray-700 rounded p-2 text-sm focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Leave blank to use `.env.local`. Ensure your OpenAI key has access to the selected model.
                </p>
              </div>

              {draftProvider === 'openai' && (
                <div className="border border-gray-800 rounded p-3 bg-black/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-gray-400">OPENAI MODEL PER AGENT ROLE</label>
                    <button
                      onClick={handleResetModelOverrides}
                      className="text-[10px] font-mono text-gray-400 hover:text-white transition-colors"
                    >
                      RESET TO DEFAULTS
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1">APPLY TO ALL ROLES</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bulkModelValue}
                        onChange={(e) => setBulkModelValue(e.target.value)}
                        list="openai-model-suggestions"
                        placeholder="gpt-5-codex"
                        className="flex-1 bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                      />
                      <button
                        onClick={handleApplyModelToAll}
                        className="px-3 py-2 text-xs font-mono border border-gray-700 rounded text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                      >
                        APPLY
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Leave fields blank to use defaults from `OPENAI_MODEL_FAST/REASONING`.
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Example: set `gpt-4.1-mini` for all roles to reduce cost on quick scans.
                    </p>
                  </div>
                  <datalist id="openai-model-suggestions">
                    {OPENAI_MODEL_SUGGESTIONS.map((model) => (
                      <option key={model} value={model} />
                    ))}
                  </datalist>
                  <div className="space-y-3">
                    {MODEL_ROLE_CONFIG.map(({ role, label, help }) => {
                      const value = draftModelOverrides[role] || '';
                      const trimmed = value.trim();
                      const invalid = trimmed.length > 0 && !isModelNameValid(trimmed);
                      const defaultModel = openaiModelDefaults[role];
                      return (
                        <div key={role}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-mono text-gray-300">{label}</span>
                            <span className="text-[10px] font-mono text-gray-600">DEFAULT: {defaultModel}</span>
                          </div>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setDraftModelOverrides(prev => ({ ...prev, [role]: e.target.value }))}
                            list="openai-model-suggestions"
                            placeholder={defaultModel}
                            className={`w-full bg-black border rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono ${invalid ? 'border-red-600 text-red-400' : 'border-gray-700 text-cyber-green'}`}
                          />
                          <p className={`text-[10px] mt-1 ${invalid ? 'text-red-500' : 'text-gray-500'}`}>
                            {invalid ? 'Invalid model name; will fall back to default.' : help}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border border-gray-800 rounded p-3 bg-black/30 space-y-3">
                <label className="block text-xs font-mono text-gray-400">OPEN DATA KEYS (NOT REQUIRED)</label>
                <p className="text-[10px] text-gray-500">
                  Not required. Zero-cost mode uses anonymous public endpoints by default. Adding keys only improves rate limits, reliability, and throughput; core functionality stays the same.
                </p>
                <p className="text-[10px] text-gray-500">
                  Validation: leaving any field blank is OK. Any warning below only reflects potential rate limiting.
                </p>
                <p className="text-[10px] text-gray-500">
                  Local-only and telemetry-free: keys are stored securely in your browser storage (sessionStorage by default) and never transmitted off-device.
                </p>
                <p className="text-[10px] text-gray-500">
                  Keys stay client-only in this browser. Never synced to cloud settings, never sent to Worker/KV, and never included in telemetry.
                </p>
                {optionalKeysPolicyReady ? (
                  <>
                    <p className="text-[10px] text-gray-500">
                      Default storage is sessionStorage (clears on tab close). Enable persistence to keep keys across browser restarts.
                    </p>
                    <label className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                      <input
                        type="checkbox"
                        checked={openDataPersist}
                        onChange={(e) => handleOpenDataPersistToggle(e.target.checked)}
                      />
                      PERSIST OPTIONAL KEYS (LOCALSTORAGE, OFF BY DEFAULT)
                    </label>
                    <p className="text-[10px] text-gray-500">
                      Requires explicit consent. Turn off to keep keys session-only and clear any persistent copy.
                    </p>
                  </>
                ) : (
                  <p className="text-[10px] text-gray-500">
                    Persistence controls are unavailable in this environment. Optional keys will remain session-only.
                  </p>
                )}
                <p className="text-[10px] text-gray-500">
                  US-only address policy is enabled by default. Non-US addresses are flagged as out-of-scope and skip US record gates + portal queries. Toggle via
                  <span className="font-mono"> featureFlags.usOnlyAddressPolicy</span>.
                </p>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 mb-1">SOCRATA_APP_TOKEN</label>
                  <input
                    type="password"
                    value={draftOpenDataAuth.socrataAppToken || ''}
                    onChange={(e) => setDraftOpenDataAuth(prev => ({ ...prev, socrataAppToken: e.target.value }))}
                    placeholder="X-App-Token"
                    className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Field format: App Token (`X-App-Token`) value as a raw token string (no prefix). Create it in the Socrata developer portal. <a href="https://dev.socrata.com/docs/app-tokens.html" target="_blank" className="underline hover:text-cyber-green">Socrata setup</a>.
                  </p>
                  {socrataToken ? (
                    <p className="text-[10px] text-cyber-green font-mono">Token configured. Higher rate limits enabled.</p>
                  ) : (
                    <p className="text-[10px] text-yellow-500 font-mono">OK: missing token. Anonymous mode stays enabled; requests may be rate limited.</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 mb-1">ARCGIS_API_KEY</label>
                  <input
                    type="password"
                    value={draftOpenDataAuth.arcgisApiKey || ''}
                    onChange={(e) => setDraftOpenDataAuth(prev => ({ ...prev, arcgisApiKey: e.target.value }))}
                    placeholder="AAPK..."
                    className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Field format: API key token string (often starts with `AAPK`). Paste the full token with no `token=` prefix. <a href="https://developers.arcgis.com/documentation/security-and-authentication/api-keys/" target="_blank" className="underline hover:text-cyber-green">ArcGIS API keys</a>.
                  </p>
                  {arcgisApiKey ? (
                    <p className="text-[10px] text-cyber-green font-mono">Key configured. Higher throughput enabled.</p>
                  ) : (
                    <p className="text-[10px] text-yellow-500 font-mono">OK: missing key. Anonymous mode stays enabled; requests may be rate limited.</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 mb-1">GEOCODING_CONTACT_EMAIL</label>
                  <input
                    type="email"
                    value={draftOpenDataAuth.geocodingEmail || ''}
                    onChange={(e) => setDraftOpenDataAuth(prev => ({ ...prev, geocodingEmail: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Field format: contact email address for Nominatim usage compliance (format: you@example.com). <a href="https://operations.osmfoundation.org/policies/nominatim/" target="_blank" className="underline hover:text-cyber-green">Nominatim policy</a>.
                  </p>
                  {geocodingEmail ? (
                    <p className="text-[10px] text-cyber-green font-mono">Contact email configured.</p>
                  ) : (
                    <p className="text-[10px] text-yellow-500 font-mono">OK: no contact email set. Nominatim still works but may be rate limited.</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 mb-1">GEOCODING_API_KEY (IF SUPPORTED)</label>
                  <input
                    type="password"
                    value={draftOpenDataAuth.geocodingKey || ''}
                    onChange={(e) => setDraftOpenDataAuth(prev => ({ ...prev, geocodingKey: e.target.value }))}
                    placeholder="Optional provider token"
                    className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Reserved for key-based geocoders (not enabled by default). Field format: provider API key string (paste full token, no prefix). Leave blank for Nominatim. <a href="https://nominatim.org/release-docs/latest/api/Overview/" target="_blank" className="underline hover:text-cyber-green">Nominatim overview</a>.
                  </p>
                  {geocodingKey ? (
                    <p className="text-[10px] text-cyber-green font-mono">Key stored locally for supported providers.</p>
                  ) : (
                    <p className="text-[10px] text-yellow-500 font-mono">OK: no provider key set. Nominatim remains active; requests may be rate limited.</p>
                  )}
                </div>
              </div>

              <div className="border border-gray-800 rounded p-3 bg-black/30 space-y-2">
                <label className="block text-xs font-mono text-gray-400">DEVELOPER REFERENCE (SOCRATA RAG)</label>
                <p className="text-[10px] text-gray-500">
                  Read-only snippets from the local Socrata RAG bundle. No secrets, no external calls.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    placeholder="catalog/v1 search_context q limit offset"
                    className="flex-1 bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                  />
                  <button
                    onClick={handleRagLookup}
                    disabled={ragStatus === 'loading'}
                    className="px-3 py-2 text-xs font-mono border border-gray-700 rounded text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ragStatus === 'loading' ? 'LOOKING…' : 'LOOKUP'}
                  </button>
                </div>
                {ragError && (
                  <p className="text-[10px] text-yellow-500 font-mono">{ragError}</p>
                )}
                <div className="max-h-48 overflow-y-auto border border-gray-800 rounded p-2 text-[10px] font-mono text-gray-300 space-y-2 bg-black/40">
                  {ragHits.length === 0 ? (
                    <span className="text-gray-600">No RAG snippets loaded.</span>
                  ) : (
                    ragHits.map((hit) => (
                      <div key={hit.id} className="space-y-1">
                        <div className="text-[10px] text-gray-500">
                          {hit.id} {hit.doc_id ? `· ${hit.doc_id}` : ''}
                        </div>
                        <div className="whitespace-pre-wrap">{hit.text}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border border-gray-800 rounded p-3 bg-black/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono text-gray-400">CLOUDFLARE ACCESS ALLOWLIST</label>
                  <div className="flex items-center gap-2">
                    {allowlistCopyStatus && (
                      <span className="text-[10px] font-mono text-gray-500">{allowlistCopyStatus}</span>
                    )}
                    <button
                      onClick={() => refreshAllowlistFromWorker(true, true)}
                      disabled={allowlistSyncing}
                      className="text-[10px] font-mono text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {allowlistSyncing ? 'SYNCING…' : 'REFRESH'}
                    </button>
                    <button
                      onClick={handleCopyAllowlist}
                      className="text-[10px] font-mono text-gray-400 hover:text-white transition-colors"
                    >
                      COPY ALLOWLIST
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={draftAllowlistText}
                  onChange={(e) => setDraftAllowlistText(e.target.value)}
                  placeholder="user@example.com&#10;teammate@company.com"
                  className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={allowlistInput}
                    onChange={(e) => {
                      setAllowlistInput(e.target.value);
                      if (allowlistInputError) setAllowlistInputError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAllowlistEntry()}
                    placeholder="person@domain.com"
                    className="flex-1 bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                  />
                  <button
                    onClick={handleAddAllowlistEntry}
                    className="px-3 py-2 text-xs font-mono border border-gray-700 rounded text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                  >
                    ADD
                  </button>
                  <button
                    onClick={handleRemoveAllowlistEntry}
                    className="px-3 py-2 text-xs font-mono border border-gray-700 rounded text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                  >
                    REMOVE
                  </button>
                </div>
                {allowlistInputError && (
                  <p className="text-[10px] text-red-500 font-mono">{allowlistInputError}</p>
                )}
                {draftAllowlistInvalid.length > 0 && (
                  <p className="text-[10px] text-yellow-500 font-mono">
                    Invalid entries ignored: {draftAllowlistInvalid.slice(0, 3).join(', ')}
                    {draftAllowlistInvalid.length > 3 ? '…' : ''}
                  </p>
                )}
                {allowlistSyncStatus && (
                  <p
                    className={`text-[10px] font-mono ${
                      allowlistSyncStatus.tone === 'success'
                        ? 'text-cyber-green'
                        : allowlistSyncStatus.tone === 'warning'
                          ? 'text-yellow-500'
                          : allowlistSyncStatus.tone === 'error'
                            ? 'text-red-500'
                            : 'text-gray-500'
                    }`}
                  >
                    {allowlistSyncStatus.message}
                  </p>
                )}
                {allowlistUpdatedAt && (
                  <p className="text-[10px] text-gray-500 font-mono">
                    Last synced: {new Date(allowlistUpdatedAt).toLocaleString()}
                  </p>
                )}
                <p className="text-[10px] text-gray-500">
                  Synced to Cloudflare Access on Save. This helper only prepares an Access policy allowlist; it does not secure the client app.
                </p>
                <p className="text-[10px] text-gray-500">
                  Example: copy the list below into Cloudflare Access → Include → Emails in when syncing is unavailable.
                </p>
                <pre className="text-[10px] text-gray-500 bg-black/60 border border-gray-800 rounded p-2 whitespace-pre-wrap font-mono">
{`Include
  Emails in
    user@example.com
    teammate@company.com`}
                </pre>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-2">SEARCH LIMITS</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1">MIN_AGENTS</label>
                    <input
                      type="number"
                      min={1}
                      value={draftRunConfig.minAgents}
                      onChange={(e) => setDraftRunConfig(prev => ({ ...prev, minAgents: Number(e.target.value) }))}
                      className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1">MAX_AGENTS</label>
                    <input
                      type="number"
                      min={1}
                      value={draftRunConfig.maxAgents}
                      onChange={(e) => setDraftRunConfig(prev => ({ ...prev, maxAgents: Number(e.target.value) }))}
                      className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1">MAX_METHOD</label>
                    <input
                      type="number"
                      min={1}
                      value={draftRunConfig.maxMethodAgents}
                      onChange={(e) => setDraftRunConfig(prev => ({ ...prev, maxMethodAgents: Number(e.target.value) }))}
                      className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Example: MAX_AGENTS 20 widens coverage but can slow the UI; MAX_METHOD 3 keeps method discovery focused.
                </p>
                <label className="mt-3 flex items-center gap-2 text-xs font-mono text-gray-400">
                  <input
                    type="checkbox"
                    checked={draftRunConfig.forceExhaustion}
                    onChange={(e) => setDraftRunConfig(prev => ({ ...prev, forceExhaustion: e.target.checked }))}
                  />
                  FORCE EXHAUSTION
                </label>
                <p className="text-[10px] text-gray-500 mt-1">
                  When enabled, the Overseer always runs the exhaustion test and spawns extra scouts up to the max cap.
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Example: enable for regulated topics where you want extra passes even if critique says "complete."
                </p>
                <label className="block text-xs font-mono text-gray-400 mt-4 mb-2">ROUND CONTROL</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1">MIN_ROUNDS</label>
                    <input
                      type="number"
                      min={1}
                      value={draftRunConfig.minRounds}
                      onChange={(e) => setDraftRunConfig(prev => ({ ...prev, minRounds: Number(e.target.value) }))}
                      className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1">MAX_ROUNDS</label>
                    <input
                      type="number"
                      min={1}
                      value={draftRunConfig.maxRounds}
                      onChange={(e) => setDraftRunConfig(prev => ({ ...prev, maxRounds: Number(e.target.value) }))}
                      className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Example: MIN_ROUNDS 2 / MAX_ROUNDS 6 ensures a second pass while still capping long runs.
                </p>
                <label className="block text-xs font-mono text-gray-400 mt-4 mb-2">EARLY STOP THRESHOLDS</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1">DIMINISHING</label>
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={draftRunConfig.earlyStopDiminishingScore}
                      onChange={(e) => setDraftRunConfig(prev => ({ ...prev, earlyStopDiminishingScore: Number(e.target.value) }))}
                      className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1">NOVELTY</label>
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={draftRunConfig.earlyStopNoveltyRatio}
                      onChange={(e) => setDraftRunConfig(prev => ({ ...prev, earlyStopNoveltyRatio: Number(e.target.value) }))}
                      className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1">NEW DOMAINS</label>
                    <input
                      type="number"
                      min={0}
                      value={draftRunConfig.earlyStopNewDomains}
                      onChange={(e) => setDraftRunConfig(prev => ({ ...prev, earlyStopNewDomains: Number(e.target.value) }))}
                      className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1">NEW SOURCES</label>
                    <input
                      type="number"
                      min={0}
                      value={draftRunConfig.earlyStopNewSources}
                      onChange={(e) => setDraftRunConfig(prev => ({ ...prev, earlyStopNewSources: Number(e.target.value) }))}
                      className="w-full bg-black border border-gray-700 rounded p-2 text-xs focus:border-cyber-green outline-none transition-colors font-mono text-cyber-green"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Early stop triggers when diminishing returns are high and novelty or new-source counts fall below thresholds.
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Example: set NOVELTY 0.2 and NEW SOURCES 1 to stop sooner on well-trodden topics.
                </p>
              </div>

              {settingsSyncStatus && (
                <p
                  className={`text-[10px] font-mono ${
                    settingsSyncStatus.tone === 'success'
                      ? 'text-cyber-green'
                      : settingsSyncStatus.tone === 'warning'
                        ? 'text-yellow-500'
                        : settingsSyncStatus.tone === 'error'
                          ? 'text-red-500'
                          : 'text-gray-500'
                  }`}
                >
                  {settingsSyncStatus.message}
                </p>
              )}
              {settingsConflict && (
                <button
                  onClick={handleLoadCloudSettings}
                  className="px-3 py-2 text-xs font-mono border border-yellow-500 text-yellow-400 hover:text-yellow-200 hover:border-yellow-300 rounded transition-colors"
                >
                  LOAD CLOUD SETTINGS
                </button>
              )}
              {settingsUpdatedAt && (
                <p className="text-[10px] text-gray-500 font-mono">
                  Cloud settings: {new Date(settingsUpdatedAt).toLocaleString()}
                  {settingsUpdatedBy ? ` · ${settingsUpdatedBy}` : ''}
                  {typeof settingsVersion === 'number' ? ` · v${settingsVersion}` : ''}
                </p>
              )}

              <div className="flex justify-between pt-2">
                 <button
                  onClick={handleClearKey}
                  className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-900/20 rounded text-xs font-mono transition-colors"
                  title="Clear override for selected provider"
                >
                  <Trash2 className="w-4 h-4" /> CLEAR OVERRIDE
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-3 py-2 text-gray-400 hover:text-white rounded text-xs font-mono transition-colors"
                  >
                    CLOSE
                  </button>
                  <button
                    onClick={handleSaveKey}
                    disabled={allowlistSyncing || settingsSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-cyber-gray border border-gray-600 hover:border-cyber-green hover:bg-gray-800 text-white font-mono text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" /> Save Configuration
                  </button>
                </div>
              </div>
              {!draftHasKey && !USE_PROXY && (
                <p className="text-[10px] text-yellow-500 font-mono">
                  No API key detected for provider: {draftProvider.toUpperCase()}.
                </p>
              )}
              {draftHasKey && draftUsingEnvKey && !USE_PROXY && (
                <p className="text-[10px] text-gray-500 font-mono">
                  Using `.env.local` for {draftProvider.toUpperCase()}.
                </p>
              )}
              {USE_PROXY && (
                <p className="text-[10px] text-gray-500 font-mono">
                  Proxy enabled: keys are stored server-side.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skills Modal */}
      {showSkills && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-cyber-gray border border-gray-700 p-6 rounded-lg max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
             <div className="absolute top-0 left-0 w-full h-1 bg-cyber-blue"></div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 font-mono text-cyber-blue">
                  <Database className="w-5 h-5" /> NEURAL_SKILL_MATRIX
                </h2>
                <button onClick={() => setShowSkills(false)} className="text-gray-500 hover:text-white">✕</button>
             </div>
             
             <div className="overflow-y-auto pr-2 space-y-3">
               {skills.map(skill => (
                 <div key={skill.id} className="p-4 bg-black/40 border border-gray-800 rounded hover:border-cyber-blue/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                       <span className="font-bold text-white text-sm">{skill.name}</span>
                       <span className="text-[10px] text-gray-500 font-mono">{new Date(skill.acquiredAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{skill.description}</p>
                    <div className="text-[10px] font-mono text-gray-600 bg-black p-2 rounded truncate">
                      QUERY_TEMPLATE: {skill.queryTemplate}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      <TransparencyPanel open={showTransparency} onClose={() => setShowTransparency(false)} />

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 relative">
        
        {/* Input Phase */}
        {!isRunning && !report && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-2xl w-full space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                  Initiate Research Protocol
                </h2>
                <p className="text-gray-400">
                  The Overseer will orchestrate agents to exhaustively research your topic, testing hypotheses and finding gaps in public knowledge.
                </p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-green to-cyber-blue rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative flex bg-black rounded-lg p-2 border border-gray-800 items-center">
                  <Search className="ml-3 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    placeholder="Enter research vector (e.g., 'Solid State Battery breakthroughs')"
                    data-testid="search-input"
                    className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder-gray-700 font-mono"
                    autoFocus
                  />
                  <button 
                    onClick={handleStart}
                    data-testid="start-search"
                    className="bg-gray-900 hover:bg-cyber-green hover:text-black text-white px-6 py-2 rounded-md transition-all font-mono text-sm border border-gray-700 hover:border-cyber-green"
                  >
                    INITIALIZE
                  </button>
                </div>
              </div>

              <div className="flex gap-4 justify-center text-xs text-gray-600 font-mono">
                 <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> LIVE WEB SEARCH</span>
                 <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> REASONING MODEL</span>
                 <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> FULL TRANSPARENCY</span>
              </div>
            </div>
          </div>
        )}

        {/* Processing Phase */}
        {(isRunning || (agents.length > 0 && !report)) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
             {/* Left: Agent Graph */}
             <div className="lg:col-span-2 bg-black/50 border border-gray-800 rounded-lg overflow-hidden flex flex-col relative">
                <div className="absolute top-0 left-0 p-4 z-10">
                   <h3 className="text-sm font-mono text-gray-400 flex items-center gap-2">
                     <Activity className="w-4 h-4 text-cyber-blue" />
                     AGENT ORCHESTRATION GRAPH
                   </h3>
                </div>
                <AgentGraph agents={agents} />
             </div>

             {/* Right: Logs */}
             <div className="lg:col-span-1 h-full min-h-0 flex flex-col">
                <LogTerminal logs={logs} />
             </div>
          </div>
        )}

        {/* Report Phase */}
        {report && (
           <div className="animate-in fade-in duration-500">
              <div className="mb-6 flex justify-between items-center">
                 <button 
                   onClick={handleNewSearch}
                   className="text-gray-500 hover:text-white flex items-center gap-2 text-sm bg-gray-900 px-3 py-2 rounded border border-gray-800"
                 >
                    <RotateCcw className="w-4 h-4" /> New Search
                 </button>
              </div>
              <ReportView report={report} />
           </div>
        )}

      </main>
    </div>
  );
};

export default App;
