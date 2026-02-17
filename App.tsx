import React, { useState, useEffect } from 'react';
import { Activity, Brain, Settings, Search, Terminal, RotateCcw, Zap, Database, Trash2, Save } from 'lucide-react';
import { useOverseer } from './hooks/useOverseer';
import { AgentGraph } from './components/AgentGraph';
import { LogTerminal } from './components/LogTerminal';
import { ReportView } from './components/ReportView';
import { LLMProvider, ModelOverrides, ModelRole } from './types';
import { getOpenAIModelDefaults, loadModelOverrides, saveModelOverrides } from './services/modelOverrides';
import {
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

const MODEL_NAME_PATTERN = /^[A-Za-z0-9._:-]+$/;
const isModelNameValid = (value: string) => MODEL_NAME_PATTERN.test(value.trim());

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

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [provider, setProvider] = useState<LLMProvider>(DEFAULT_PROVIDER);
  const [keyOverrides, setKeyOverrides] = useState<{ google: string; openai: string }>({ google: '', openai: '' });
  const [runConfig, setRunConfig] = useState<{
    minAgents: number;
    maxAgents: number;
    maxMethodAgents: number;
    forceExhaustion: boolean;
    minRounds: number;
    maxRounds: number;
    earlyStopDiminishingScore: number;
    earlyStopNoveltyRatio: number;
    earlyStopNewDomains: number;
    earlyStopNewSources: number;
  }>({
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
  });
  const [modelOverrides, setModelOverrides] = useState<ModelOverrides>({});
  const [draftProvider, setDraftProvider] = useState<LLMProvider>(DEFAULT_PROVIDER);
  const [draftKeys, setDraftKeys] = useState<{ google: string; openai: string }>({ google: '', openai: '' });
  const [draftRunConfig, setDraftRunConfig] = useState<{
    minAgents: number;
    maxAgents: number;
    maxMethodAgents: number;
    forceExhaustion: boolean;
    minRounds: number;
    maxRounds: number;
    earlyStopDiminishingScore: number;
    earlyStopNoveltyRatio: number;
    earlyStopNewDomains: number;
    earlyStopNewSources: number;
  }>({
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
  });
  const [draftModelOverrides, setDraftModelOverrides] = useState<ModelOverrides>({});
  const [bulkModelValue, setBulkModelValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!REQUIRES_PASSWORD);
  const [showAuth, setShowAuth] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [pendingAction, setPendingAction] = useState<'settings' | 'start' | null>(null);

  // Initialize from local storage if available
  useEffect(() => {
    const storedProvider = localStorage.getItem('overseer_provider');
    if (storedProvider === 'google' || storedProvider === 'openai') {
      setProvider(storedProvider);
    }
    const storedGoogle = localStorage.getItem('overseer_api_key_google') || '';
    const storedOpenAI = localStorage.getItem('overseer_api_key_openai') || '';
    setKeyOverrides({ google: storedGoogle, openai: storedOpenAI });
    try {
      const storedConfig = localStorage.getItem('overseer_run_config');
      if (storedConfig) {
        const parsed = JSON.parse(storedConfig);
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
        setRunConfig({
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
        });
      }
    } catch (_) {
      // ignore
    }
    const storedOverrides = sanitizeModelOverrideDraft(loadModelOverrides());
    setModelOverrides(storedOverrides);
    if (REQUIRES_PASSWORD) {
      try {
        const unlocked = sessionStorage.getItem('overseer_unlocked') === 'true';
        if (unlocked) setIsUnlocked(true);
      } catch (_) {
        // ignore
      }
    }
  }, []);

  const handleSaveKey = () => {
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
    localStorage.setItem('overseer_provider', draftProvider);
    localStorage.setItem('overseer_run_config', JSON.stringify(nextRunConfig));

    if (nextKeys.google) {
      localStorage.setItem('overseer_api_key_google', nextKeys.google);
    } else {
      localStorage.removeItem('overseer_api_key_google');
    }
    if (nextKeys.openai) {
      localStorage.setItem('overseer_api_key_openai', nextKeys.openai);
    } else {
      localStorage.removeItem('overseer_api_key_openai');
    }

    const sanitizedOverrides = sanitizeModelOverrideDraft(draftModelOverrides);
    setModelOverrides(sanitizedOverrides);
    saveModelOverrides(sanitizedOverrides);

    setShowSettings(false);
  };

  const handleClearKey = () => {
    setDraftKeys(prev => ({ ...prev, [draftProvider]: '' }));
  };

  const doOpenSettings = () => {
    setDraftProvider(provider);
    setDraftKeys(keyOverrides);
    setDraftRunConfig(runConfig);
    setDraftModelOverrides(modelOverrides);
    setBulkModelValue('');
    setShowSettings(true);
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

  const { agents, logs, report, isRunning, startResearch, skills } = useOverseer();

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
    if (!REQUIRES_PASSWORD || isUnlocked) return true;
    setPendingAction(action);
    setAuthInput('');
    setAuthError('');
    setShowAuth(true);
    return false;
  };

  const doStart = () => {
    if (!topic.trim()) return;
    if (!effectiveKey && !USE_PROXY) {
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
      sessionStorage.setItem('overseer_unlocked', 'true');
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

  const resetApp = () => {
    window.location.reload();
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
             onClick={openSettings}
             className={`p-2 rounded-full hover:bg-gray-800 transition-colors ${!hasKey ? 'animate-pulse text-yellow-500' : 'text-gray-400'}`}
             title="Configure API Key"
           >
             <Settings className="w-5 h-5" />
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
          <div className="bg-cyber-gray border border-gray-700 p-6 rounded-lg max-w-md w-full shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-cyber-green"></div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-mono">
              <Settings className="w-5 h-5" /> SYSTEM_CONFIG
            </h2>
            <div className="space-y-4">
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
              </div>

              <div className="flex justify-between pt-2">
                 <button
                  onClick={handleClearKey}
                  className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-900/20 rounded text-xs font-mono transition-colors"
                  title="Clear override for selected provider"
                >
                  <Trash2 className="w-4 h-4" /> CLEAR OVERRIDE
                </button>
                <button
                  onClick={handleSaveKey}
                  className="flex items-center gap-2 px-4 py-2 bg-cyber-gray border border-gray-600 hover:border-cyber-green hover:bg-gray-800 text-white font-mono text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" /> Save Configuration
                </button>
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
                    className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder-gray-700 font-mono"
                    autoFocus
                  />
                  <button 
                    onClick={handleStart}
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
                   onClick={resetApp}
                   className="text-gray-500 hover:text-white flex items-center gap-2 text-sm bg-gray-900 px-3 py-2 rounded border border-gray-800"
                 >
                    <RotateCcw className="w-4 h-4" /> New Research
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
