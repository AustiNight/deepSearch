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

export interface FinalReport {
  title: string;
  summary: string;
  sections: ReportSection[];
  provenance: {
    totalSources: number;
    methodAudit: string;
  };
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
