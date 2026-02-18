export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

export enum AgentType {
  OVERSEER = 'OVERSEER',
  RESEARCHER = 'RESEARCHER',
  CRITIC = 'CRITIC', // Tests the hypothesis
  SYNTHESIZER = 'SYNTHESIZER',
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  task: string;
  reasoning: string[];
  findings: Finding[];
  parentId?: string;
}

export interface Finding {
  source: string;
  content: string;
  url?: string;
  confidence: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  agentId: string;
  agentName: string;
  message: string;
  type: 'info' | 'action' | 'success' | 'warning' | 'error';
}

export interface ReportSection {
  title: string;
  content: string;
  sources: string[];
}

export type VisualizationType = 'bar' | 'line' | 'area' | 'image';

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartData {
  labels: string[];
  series: ChartSeries[];
  unit?: string;
}

export interface VisualizationBase {
  type: VisualizationType;
  title: string;
  caption?: string;
  sources?: string[];
}

export interface ChartVisualization extends VisualizationBase {
  type: 'bar' | 'line' | 'area';
  data: ChartData;
}

export interface ImageVisualization extends VisualizationBase {
  type: 'image';
  data: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
}

export type Visualization = ChartVisualization | ImageVisualization;

export interface FinalReport {
  title: string;
  summary: string;
  sections: ReportSection[];
  visualizations?: Visualization[];
  provenance: {
    totalSources: number;
    methodAudit: string;
  };
  schemaVersion?: number;
}

export type TaxonomyProvenanceSource = 'seed' | 'agent_proposal' | 'overseer_vet' | 'manual';

export interface TaxonomyProvenance {
  source: TaxonomyProvenanceSource;
  timestamp: number;
  topic?: string;
  agentId?: string;
  agentName?: string;
  runId?: string;
  note?: string;
}

export interface ResearchTactic {
  id: string;
  template: string;
  notes?: string;
  provenance?: TaxonomyProvenance[];
}

export interface ResearchMethod {
  id: string;
  label: string;
  description?: string;
  tactics: ResearchTactic[];
}

export interface ResearchSubtopic {
  id: string;
  label: string;
  description?: string;
  methods: ResearchMethod[];
  provenance?: TaxonomyProvenance[];
}

export type BlueprintField = string;

export interface ResearchVertical {
  id: string;
  label: string;
  description?: string;
  blueprintFields: BlueprintField[];
  subtopics: ResearchSubtopic[];
  provenance?: TaxonomyProvenance[];
}

export interface ExhaustionMetrics {
  round: number;
  label: string;
  totalQueries: number;
  uniqueQueries: number;
  queryNoveltyRatio: number;
  newDomains: number;
  totalDomains: number;
  newSources: number;
  totalSources: number;
  diminishingReturnsScore: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  queryTemplate: string;
  acquiredAt: number;
}

export type LLMProvider = 'google' | 'openai';

export type SourceProvider = 'openai' | 'google' | 'system' | 'unknown';

export type SourceKind = 'web' | 'citation' | 'unknown';

export interface NormalizedSource {
  uri: string;
  title: string;
  domain: string;
  provider: SourceProvider;
  kind: SourceKind;
  snippet?: string;
}

export interface SourceNormalizationDiagnostics {
  provider: SourceProvider;
  toolUsage: string[];
  rawSourceCount: number;
  normalizedSourceCount: number;
  dedupedCount: number;
  parseErrors: string[];
  fallbackUsed: boolean;
}

export interface SourceNormalizationResult {
  sources: NormalizedSource[];
  diagnostics: SourceNormalizationDiagnostics;
}

export type ModelRole =
  | 'overseer_planning'
  | 'method_discovery'
  | 'sector_analysis'
  | 'deep_research_l1'
  | 'deep_research_l2'
  | 'method_audit'
  | 'gap_hunter'
  | 'exhaustion_scout'
  | 'critique'
  | 'synthesis'
  | 'validation';

export type ModelOverrides = {
  overseer_planning?: string;
  method_discovery?: string;
  sector_analysis?: string;
  deep_research_l1?: string;
  deep_research_l2?: string;
  method_audit?: string;
  gap_hunter?: string;
  exhaustion_scout?: string;
  critique?: string;
  synthesis?: string;
  validation?: string;
};

export type RunConfig = {
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
};

export type UniversalSettingsPayload = {
  schemaVersion: number;
  provider: LLMProvider;
  runConfig: RunConfig;
  modelOverrides: ModelOverrides;
  accessAllowlist: string[];
};

export type UniversalSettingsResponse = {
  settings: UniversalSettingsPayload | null;
  updatedAt: string | null;
  updatedBy?: string | null;
  version?: number;
};

export interface AppState {
  topic: string;
  isRunning: boolean;
  agents: Agent[];
  logs: LogEntry[];
  report: FinalReport | null;
  apiKey: string | null;
  skills: Skill[];
  provider?: LLMProvider;
}
