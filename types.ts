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
  confidence?: number;
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

export type PrimaryRecordCoverageStatus =
  | 'covered'
  | 'missing'
  | 'unavailable'
  | 'restricted'
  | 'partial'
  | 'unknown';

export interface PrimaryRecordCoverageEntry {
  recordType: string;
  status: PrimaryRecordCoverageStatus;
  availabilityStatus?: string;
  availabilityDetails?: string;
  matchedSources?: string[];
}

export interface PrimaryRecordCoverage {
  complete: boolean;
  entries: PrimaryRecordCoverageEntry[];
  missing: string[];
  unavailable: string[];
  generatedAt?: IsoDateString;
}

export interface ParcelResolutionMetrics {
  attempted: boolean;
  success: boolean;
  method?: 'assessor' | 'gis';
  latencyMs?: number;
  assessorCandidates?: number;
  gisCandidates?: number;
  ambiguity?: boolean;
  failureReason?: DataGapReasonCode | 'not_attempted';
  derivedFrom?: 'workflow' | 'primary_record_coverage';
}

export interface EvidenceRecoveryMetrics {
  needed: boolean;
  attempted: boolean;
  success: boolean;
  timedOut?: boolean;
  exhausted?: boolean;
  totalQueries?: number;
  executedQueries?: number;
  sourcesRecovered?: number;
  latencyMs?: number;
}

export interface ConfidenceQualityMetrics {
  averageSectionConfidence: number;
  minSectionConfidence: number;
  sectionsMeasured: number;
  coveragePenalty?: number;
  proxyScore: number;
}

export interface RunMetrics {
  runLatencyMs?: number;
  parcelResolution?: ParcelResolutionMetrics;
  evidenceRecovery?: EvidenceRecoveryMetrics;
  confidenceQuality?: ConfidenceQualityMetrics;
}

export interface FinalReport {
  title: string;
  summary: string;
  sections: ReportSection[];
  visualizations?: Visualization[];
  provenance: {
    totalSources: number;
    methodAudit: string;
    primaryRecordCoverage?: PrimaryRecordCoverage;
    datasetCompliance?: DatasetComplianceEntry[];
    compliance?: ComplianceSummary;
    runMetrics?: RunMetrics;
  };
  schemaVersion?: number;
  propertyDossier?: PropertyDossier;
}

export type IsoDateString = string;
export type IsoDateTimeString = string;
export type CurrencyCode = string;
export type AreaUnit = 'sq_ft' | 'acres';
export type DistanceUnit = 'ft' | 'm' | 'mi' | 'km';

export type SourceTaxonomy =
  | 'authoritative'
  | 'quasi_official'
  | 'aggregator'
  | 'social'
  | 'unknown';

export type ComplianceMode = 'audit' | 'enforce';

export type ComplianceGateStatus = 'clear' | 'signoff_required';

export type ComplianceBlockedSource = {
  uri: string;
  domain: string;
  reason: string;
  datasetTitle?: string;
  datasetId?: string;
};

export type ComplianceReviewItem = {
  reason: string;
  datasetTitle?: string;
  datasetId?: string;
  portalUrl?: string;
};

export type ComplianceSummary = {
  mode: ComplianceMode;
  signoffRequired: boolean;
  signoffProvided: boolean;
  gateStatus: ComplianceGateStatus;
  blockedSources: ComplianceBlockedSource[];
  zeroCostMode?: boolean;
  reviewRequired?: boolean;
  reviewItems?: ComplianceReviewItem[];
  notes?: string[];
};

export interface CitationSource {
  id: string;
  url: string;
  title?: string;
  publisher?: string;
  sourceType?: SourceTaxonomy;
  retrievedAt?: IsoDateTimeString;
  sourceUpdatedAt?: IsoDateString;
  dataCurrency?: {
    asOf?: IsoDateString;
    ageDays?: number;
  };
}

export interface CitationSourceRef {
  sourceId: string;
  page?: string;
  section?: string;
  quote?: string;
  note?: string;
}

export interface ClaimCitation {
  id: string;
  fieldPath: string;
  claim: string;
  value?: string | number | boolean | null;
  unit?: string;
  confidence?: number;
  citations: CitationSourceRef[];
  derivation?: string;
  createdAt?: IsoDateString;
}

export interface SourcePointer {
  label: string;
  portalUrl?: string;
  endpoint?: string;
  query?: string;
  notes?: string;
}

export type DataGapSeverity = 'critical' | 'major' | 'minor' | 'info';
export type DataGapStatus =
  | 'missing'
  | 'unavailable'
  | 'restricted'
  | 'stale'
  | 'ambiguous'
  | 'conflict';
export type DataGapReasonCode =
  | 'geocode_failed'
  | 'parcel_not_found'
  | 'data_unavailable'
  | 'parcel_ambiguous'
  | 'authoritative_sources_missing'
  | 'confidence_below_minimum';

export interface DataGap {
  id: string;
  fieldPath?: string;
  recordType?: string;
  description: string;
  reason: string;
  reasonCode?: DataGapReasonCode;
  expectedSources?: SourcePointer[];
  severity?: DataGapSeverity;
  status?: DataGapStatus;
  detectedAt?: IsoDateString;
  impact?: string;
}

export interface PostalAddress {
  address1?: string;
  address2?: string;
  city?: string;
  county?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface GeoPoint {
  lat: number;
  lon: number;
  accuracyMeters?: number;
}

export interface Jurisdiction {
  city?: string;
  county?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface PropertySubject {
  address: string;
  normalizedAddress?: string;
  jurisdiction?: Jurisdiction;
  geo?: GeoPoint;
  parcelId?: string;
  accountId?: string;
}

export interface ParcelInfo {
  parcelId?: string;
  accountId?: string;
  situsAddress?: string;
  legalDescription?: string;
  mapReference?: string;
  subdivision?: string;
  lot?: string;
  block?: string;
  landUseCode?: string;
  landUseDescription?: string;
  lotSize?: {
    value: number;
    unit: AreaUnit;
  };
  buildingAreaSqFt?: number;
  yearBuilt?: number;
  unitCount?: number;
}

export type OwnerType = 'individual' | 'entity' | 'government' | 'trust' | 'unknown';

export interface OwnershipTransfer {
  transferDate?: IsoDateString;
  recordedDate?: IsoDateString;
  priceUsd?: number;
  grantor?: string;
  grantee?: string;
  instrument?: string;
  documentId?: string;
  documentUrl?: string;
}

export interface OwnershipInfo {
  ownerName?: string;
  ownerType?: OwnerType;
  mailingAddress?: PostalAddress;
  ownershipStartDate?: IsoDateString;
  lastTransferDate?: IsoDateString;
  lastTransferPriceUsd?: number;
  deedInstrument?: string;
  deedBookPage?: string;
  ownershipHistory?: OwnershipTransfer[];
}

export interface TaxAppraisal {
  assessmentYear?: number;
  assessedValueUsd?: number;
  marketValueUsd?: number;
  landValueUsd?: number;
  improvementValueUsd?: number;
  taxableValueUsd?: number;
  taxAmountUsd?: number;
  taxRatePct?: number;
  exemptions?: string[];
  taxStatus?: string;
}

export interface ZoningSetbacks {
  frontFt?: number;
  rearFt?: number;
  sideFt?: number;
}

export interface ZoningLandUse {
  zoningCode?: string;
  zoningDescription?: string;
  overlayDistricts?: string[];
  futureLandUse?: string;
  landUseDesignation?: string;
  lotCoveragePct?: number;
  far?: number;
  maxHeightFt?: number;
  setbacks?: ZoningSetbacks;
}

export interface PermitRecord {
  permitId?: string;
  permitType?: string;
  status?: string;
  issuedDate?: IsoDateString;
  finalDate?: IsoDateString;
  valuationUsd?: number;
  workDescription?: string;
  contractor?: string;
}

export interface CodeViolation {
  caseId?: string;
  status?: string;
  openedDate?: IsoDateString;
  resolvedDate?: IsoDateString;
  description?: string;
  fineUsd?: number;
}

export interface PermitsAndCode {
  permits?: PermitRecord[];
  codeViolations?: CodeViolation[];
}

export interface EnvironmentalSite {
  siteName?: string;
  program?: string;
  epaId?: string;
  distance?: {
    value: number;
    unit: DistanceUnit;
  };
  status?: string;
}

export interface HazardsEnvironmental {
  floodZone?: string;
  femaPanel?: string;
  floodRiskPercentile?: number;
  wildfireRisk?: string;
  seismicZone?: string;
  environmentalSites?: EnvironmentalSite[];
}

export interface NeighborhoodContext {
  censusTract?: string;
  censusBlockGroup?: string;
  neighborhood?: string;
  schoolDistrict?: string;
  communityPlanArea?: string;
  cityCouncilDistrict?: string;
}

export interface PropertyDossier {
  schemaVersion: number;
  subject: PropertySubject;
  parcel?: ParcelInfo;
  ownership?: OwnershipInfo;
  taxAppraisal?: TaxAppraisal;
  zoningLandUse?: ZoningLandUse;
  permitsAndCode?: PermitsAndCode;
  hazardsEnvironmental?: HazardsEnvironmental;
  neighborhoodContext?: NeighborhoodContext;
  dataGaps: DataGap[];
  claims: ClaimCitation[];
  sources: CitationSource[];
}

export type OpenDataPortalType = 'socrata' | 'arcgis' | 'dcat' | 'unknown';

export interface DatasetComplianceFields {
  license?: string;
  licenseUrl?: string;
  termsOfService?: string;
  termsUrl?: string;
  accessConstraints?: string[];
}

export interface OpenDatasetMetadata {
  id: string;
  portalType: OpenDataPortalType;
  portalUrl: string;
  datasetId?: string;
  title: string;
  description?: string;
  source?: string;
  lastUpdated?: IsoDateString;
  license?: string;
  licenseUrl?: string;
  termsOfService?: string;
  termsUrl?: string;
  accessConstraints?: string[];
  dataUrl?: string;
  homepageUrl?: string;
  tags?: string[];
  retrievedAt: IsoDateTimeString;
}

export interface OpenDatasetIndex {
  schemaVersion: number;
  updatedAt: IsoDateTimeString;
  datasets: OpenDatasetMetadata[];
}

export interface DatasetComplianceEntry extends DatasetComplianceFields {
  datasetId?: string;
  title: string;
  portalType?: OpenDataPortalType;
  portalUrl?: string;
  dataUrl?: string;
  homepageUrl?: string;
  source?: string;
  retrievedAt?: IsoDateTimeString;
  lastUpdated?: IsoDateString;
  attribution?: string;
  attributionRequired?: boolean;
  attributionStatus?: 'ok' | 'missing' | 'invalid';
  complianceAction?: 'allow' | 'block' | 'review';
  complianceNotes?: string[];
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
