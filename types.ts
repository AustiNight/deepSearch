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
