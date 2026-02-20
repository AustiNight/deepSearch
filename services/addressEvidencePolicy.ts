import type {
  DataGap,
  Jurisdiction,
  NormalizedSource,
  PrimaryRecordCoverage,
  ReportSection,
  SourcePointer
} from "../types";
import { DATA_SOURCE_CONTRACTS } from "../data/dataSourceContracts";
import { getOpenDatasetIndex } from "./openDataDiscovery";

const isoDateToday = () => new Date().toISOString().slice(0, 10);
const createGapId = () => `gap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSourceText = (source: NormalizedSource) =>
  normalizeText(`${source.title || ""} ${source.domain || ""} ${source.uri || ""}`);

const hasAnySourceMatch = (sources: NormalizedSource[], pattern: RegExp) =>
  sources.some((source) => pattern.test(getSourceText(source)));

const ASSESSOR_TAX_PATTERN = /assessor|appraiser|appraisal|cad\b|parcel|apn|pin|property card|tax roll|tax collector|treasurer|tax bill/;
const PERMIT_CASE_PATTERN = /permit|inspection|code enforcement|code violation|case log|casefile|case file|board of adjustment|boa\b/;
const ZONING_PATTERN = /zoning|land use|land-use|planning|zoning map|land use map|future land use/;
const PARCEL_GEOMETRY_PATTERN = /parcel.*(map|layer|geometry|gis|feature server|featureserver|polygon|boundary)|gis.*parcel|parcel.*feature server|feature server.*parcel/;
const POLICE_311_PATTERN = /police|incident|crime|911|311|service request|calls for service/;

const NEIGHBORHOOD_PATTERN = /neighborhood|tract|block group|census tract|community area/;
const CITY_METRO_PATTERN = /citywide|city of|metro|metropolitan|countywide|regional|region|statewide|state of|national|county\b/;

type SourceScale = "address" | "neighborhood" | "macro" | "unknown";

const classifySourceScale = (source: NormalizedSource): SourceScale => {
  const text = getSourceText(source);
  if (ASSESSOR_TAX_PATTERN.test(text) || PERMIT_CASE_PATTERN.test(text) || ZONING_PATTERN.test(text)) {
    return "address";
  }
  if (NEIGHBORHOOD_PATTERN.test(text)) return "neighborhood";
  if (CITY_METRO_PATTERN.test(text)) return "macro";
  return "unknown";
};

const fillTemplate = (template: string, jurisdiction?: Jurisdiction) => {
  let result = template;
  const normalizeToken = (value?: string) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (jurisdiction?.county) {
    result = result.replace(/\{county\}/g, normalizeToken(jurisdiction.county));
  }
  if (jurisdiction?.state) {
    result = result.replace(/\{state\}/g, normalizeToken(jurisdiction.state));
  }
  if (jurisdiction?.city) {
    result = result.replace(/\{city\}/g, normalizeToken(jurisdiction.city));
  }
  return result;
};

const expectedSourcesForRecord = (recordType: string, jurisdiction?: Jurisdiction): SourcePointer[] => {
  const contract = DATA_SOURCE_CONTRACTS.find((entry) => entry.recordType === recordType);
  if (!contract) return [];
  return contract.endpoints.map((endpoint) => ({
    label: endpoint.label,
    portalUrl: endpoint.portalUrlTemplate ? fillTemplate(endpoint.portalUrlTemplate, jurisdiction) : undefined,
    endpoint: endpoint.endpointTemplate ? fillTemplate(endpoint.endpointTemplate, jurisdiction) : undefined
  }));
};

const mergeExpectedSources = (recordTypes: string[], jurisdiction?: Jurisdiction) => {
  const merged: SourcePointer[] = [];
  const seen = new Set<string>();
  recordTypes.forEach((recordType) => {
    expectedSourcesForRecord(recordType, jurisdiction).forEach((pointer) => {
      const key = `${pointer.label}|${pointer.portalUrl || ""}|${pointer.endpoint || ""}`;
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(pointer);
    });
  });
  return merged;
};

const recordCovered = (coverage: PrimaryRecordCoverage | undefined, recordTypes: string[]) => {
  if (!coverage?.entries) return false;
  return coverage.entries.some((entry) => recordTypes.includes(entry.recordType) && entry.status === "covered");
};

const buildDataGap = (input: {
  recordType: string;
  description: string;
  reason: string;
  reasonCode?: DataGap["reasonCode"];
  status: DataGap["status"];
  severity: DataGap["severity"];
  expectedSources?: SourcePointer[];
  impact?: string;
}): DataGap => ({
  id: createGapId(),
  recordType: input.recordType,
  description: input.description,
  reason: input.reason,
  reasonCode: input.reasonCode,
  status: input.status,
  severity: input.severity,
  expectedSources: input.expectedSources,
  impact: input.impact,
  detectedAt: isoDateToday()
});

const collectOpenDataPortals = (sources: NormalizedSource[]) => {
  const portals = new Set<string>();
  sources.forEach((source) => {
    if (!source.uri) return;
    try {
      const url = new URL(source.uri);
      portals.add(`${url.protocol}//${url.hostname}`);
    } catch (_) {
      return;
    }
  });
  return Array.from(portals);
};

const collectPolice311Pointers = (sources: NormalizedSource[]) => {
  const index = getOpenDatasetIndex();
  if (!Array.isArray(index.datasets) || index.datasets.length === 0) return [];
  const portals = collectOpenDataPortals(sources);
  const candidates = index.datasets.filter((dataset) => {
    if (!Array.isArray(dataset.tags) || dataset.tags.length === 0) return false;
    const tagText = dataset.tags.map((tag) => tag.toLowerCase());
    const matchesTag = tagText.some((tag) => tag.includes("311") || tag.includes("police") || tag.includes("incident") || tag.includes("crime"));
    if (!matchesTag) return false;
    if (portals.length === 0) return true;
    return portals.some((portal) => dataset.portalUrl?.includes(portal));
  });
  return candidates.slice(0, 3).map((dataset) => ({
    label: dataset.title || "Police/311 dataset",
    portalUrl: dataset.portalUrl,
    endpoint: dataset.dataUrl || dataset.homepageUrl
  }));
};

export type AddressEvidenceChecklist = {
  dataGaps: DataGap[];
  hasParcelEvidence: boolean;
};

export const evaluateAddressEvidenceMinimum = (input: {
  sources: NormalizedSource[];
  jurisdiction?: Jurisdiction;
  primaryRecordCoverage?: PrimaryRecordCoverage;
}): AddressEvidenceChecklist => {
  const { sources, jurisdiction, primaryRecordCoverage } = input;
  const dataGaps: DataGap[] = [];

  const hasAssessorOrTax = recordCovered(primaryRecordCoverage, ["assessor_parcel", "tax_collector"])
    || hasAnySourceMatch(sources, ASSESSOR_TAX_PATTERN);
  const hasPermitsOrCases = recordCovered(primaryRecordCoverage, ["permits", "code_enforcement"])
    || hasAnySourceMatch(sources, PERMIT_CASE_PATTERN);
  const hasZoning = recordCovered(primaryRecordCoverage, ["zoning_gis"])
    || hasAnySourceMatch(sources, ZONING_PATTERN);
  const hasParcelGeometry = hasAnySourceMatch(sources, PARCEL_GEOMETRY_PATTERN);
  const hasPolice311 = hasAnySourceMatch(sources, POLICE_311_PATTERN);
  const police311Pointers = collectPolice311Pointers(sources);

  if (!hasAssessorOrTax) {
    dataGaps.push(buildDataGap({
      recordType: "assessor_or_tax",
      description: "Assessor/CAD record or tax roll coverage was not found for this address.",
      reason: "Parcel-level property record evidence is missing.",
      reasonCode: "address_evidence_minimum_missing",
      status: "missing",
      severity: "major",
      expectedSources: mergeExpectedSources(["assessor_parcel", "tax_collector"], jurisdiction),
      impact: "Governance and economy sections should not rely on macro data without parcel-level records."
    }));
  }

  if (!hasPermitsOrCases) {
    dataGaps.push(buildDataGap({
      recordType: "permits_or_cases",
      description: "Permits, BOA, or case log evidence was not located for the property address.",
      reason: "No permits/case log sources were confirmed for this address.",
      reasonCode: "address_evidence_minimum_missing",
      status: "missing",
      severity: "major",
      expectedSources: mergeExpectedSources(["permits", "code_enforcement"], jurisdiction),
      impact: "Missing permit/case evidence reduces confidence in governance enforcement findings."
    }));
  }

  if (!hasZoning) {
    dataGaps.push(buildDataGap({
      recordType: "zoning_land_use",
      description: "Zoning or land-use layer evidence was not located for the property address.",
      reason: "No zoning/land-use sources were confirmed.",
      reasonCode: "address_evidence_minimum_missing",
      status: "missing",
      severity: "major",
      expectedSources: mergeExpectedSources(["zoning_gis"], jurisdiction),
      impact: "Zoning context is required before comparing against citywide policy data."
    }));
  }

  if (!hasParcelGeometry) {
    dataGaps.push(buildDataGap({
      recordType: "parcel_geometry",
      description: "Parcel geometry (GIS parcel layer) was not located for the property address.",
      reason: "No parcel map or parcel geometry source was confirmed.",
      reasonCode: "address_evidence_minimum_missing",
      status: "missing",
      severity: "major",
      expectedSources: mergeExpectedSources(["assessor_parcel"], jurisdiction),
      impact: "Parcel geometry is required to anchor jurisdictional and neighborhood context."
    }));
  }

  if (!hasPolice311 && police311Pointers.length > 0) {
    dataGaps.push(buildDataGap({
      recordType: "police_311_signals",
      description: "Police incident or 311 signals were not located for the property address.",
      reason: "Available open-data signals were not confirmed in the report sources.",
      reasonCode: "address_evidence_minimum_missing",
      status: "missing",
      severity: "minor",
      expectedSources: police311Pointers,
      impact: "Public safety signals may change local governance and risk context."
    }));
  }

  const hasParcelEvidence = hasAssessorOrTax || hasParcelGeometry;

  return { dataGaps, hasParcelEvidence };
};

export type GovernanceEconomyGateResult = {
  sections: ReportSection[];
  dataGaps: DataGap[];
};

const normalizeSectionLabel = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const isGovernanceSection = (title: string) => {
  const normalized = normalizeSectionLabel(title);
  return normalized.includes("governance") || normalized.includes("government") || normalized.includes("policy");
};

const isEconomySection = (title: string) => {
  const normalized = normalizeSectionLabel(title);
  return normalized.includes("economy") || normalized.includes("economic") || normalized.includes("employment");
};

export const enforceGovernanceEconomyGate = (input: {
  sections: ReportSection[];
  sources: NormalizedSource[];
  jurisdiction?: Jurisdiction;
  hasParcelEvidence: boolean;
}): GovernanceEconomyGateResult => {
  if (input.hasParcelEvidence === true) {
    return { sections: input.sections, dataGaps: [] };
  }

  const sourceByUrl = new Map(input.sources.map((source) => [source.uri, source]));
  const dataGaps: DataGap[] = [];
  const gatedSections = input.sections.map((section) => {
    const normalizedTitle = normalizeSectionLabel(section.title);
    const isTarget = isGovernanceSection(normalizedTitle) || isEconomySection(normalizedTitle);
    if (!isTarget) return section;

    const sectionSources = (section.sources || [])
      .map((uri) => sourceByUrl.get(uri))
      .filter((source): source is NormalizedSource => Boolean(source));
    const hasMacro = sectionSources.some((source) => classifySourceScale(source) === "macro");
    const hasBridge = sectionSources.some((source) => {
      const scale = classifySourceScale(source);
      return scale === "address" || scale === "neighborhood";
    });

    if (!hasMacro || hasBridge) return section;

    const recordType = isGovernanceSection(normalizedTitle) ? "governance_section" : "economy_section";
    const expectedSources = mergeExpectedSources(
      ["assessor_parcel", "tax_collector", "permits", "code_enforcement", "zoning_gis"],
      input.jurisdiction
    );
    dataGaps.push(buildDataGap({
      recordType,
      description: `${section.title} blocked: address/parcel evidence is required before using macro-scale sources.`,
      reason: "Macro-scale sources were present without parcel-level evidence.",
      reasonCode: "macro_only_section",
      status: "missing",
      severity: "major",
      expectedSources,
      impact: "Macro-only claims are excluded until parcel/address evidence is confirmed."
    }));

    return {
      ...section,
      content: `Data Gap: ${section.title} requires parcel/address evidence before macro-scale context can be used. See Data Gaps & Next Steps for specific portal/endpoint pointers.`,
      sources: []
    };
  });

  return { sections: gatedSections, dataGaps };
};

export type ScaleCompatibilityIssue = {
  sectionTitle: string;
  penalty: number;
};

const SCALE_COMPATIBILITY_PENALTY = 0.65;

export const evaluateScaleCompatibility = (sections: ReportSection[], sources: NormalizedSource[]) => {
  const sourceByUrl = new Map(sources.map((source) => [source.uri, source]));
  const issues: ScaleCompatibilityIssue[] = [];

  sections.forEach((section) => {
    const sectionSources = (section.sources || [])
      .map((uri) => sourceByUrl.get(uri))
      .filter((source): source is NormalizedSource => Boolean(source));
    if (sectionSources.length === 0) return;

    const hasMacro = sectionSources.some((source) => classifySourceScale(source) === "macro");
    if (!hasMacro) return;

    const hasBridge = sectionSources.some((source) => {
      const scale = classifySourceScale(source);
      return scale === "address" || scale === "neighborhood";
    });
    if (hasBridge) return;

    issues.push({ sectionTitle: section.title, penalty: SCALE_COMPATIBILITY_PENALTY });
  });

  return issues;
};

export const applyScaleCompatibility = (sections: ReportSection[], issues: ScaleCompatibilityIssue[]) => {
  if (issues.length === 0) return sections;
  const penaltyByTitle = new Map(issues.map((issue) => [issue.sectionTitle, issue.penalty]));
  return sections.map((section) => {
    const penalty = penaltyByTitle.get(section.title);
    if (!penalty || typeof section.confidence !== "number") return section;
    const nextConfidence = Math.max(0, Math.min(1, section.confidence * penalty));
    return { ...section, confidence: nextConfidence };
  });
};

export type AddressEvidencePolicyResult = {
  sections: ReportSection[];
  dataGaps: DataGap[];
  scaleCompatibility: ScaleCompatibilityIssue[];
};

export const enforceAddressEvidencePolicy = (input: {
  sections: ReportSection[];
  sources: NormalizedSource[];
  jurisdiction?: Jurisdiction;
  primaryRecordCoverage?: PrimaryRecordCoverage;
}): AddressEvidencePolicyResult => {
  const checklist = evaluateAddressEvidenceMinimum({
    sources: input.sources,
    jurisdiction: input.jurisdiction,
    primaryRecordCoverage: input.primaryRecordCoverage
  });

  const gate = enforceGovernanceEconomyGate({
    sections: input.sections,
    sources: input.sources,
    jurisdiction: input.jurisdiction,
    hasParcelEvidence: checklist.hasParcelEvidence
  });

  const scaleCompatibility = evaluateScaleCompatibility(gate.sections, input.sources);

  return {
    sections: gate.sections,
    dataGaps: [...checklist.dataGaps, ...gate.dataGaps],
    scaleCompatibility
  };
};
