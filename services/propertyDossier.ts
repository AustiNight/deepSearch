import type {
  PropertyDossier,
  ReportSection,
  NormalizedSource,
  CitationSource,
  CitationSourceRef,
  ClaimCitation,
  DataGap,
  Jurisdiction,
  PrimaryRecordCoverage,
  SourcePointer,
  SourceTaxonomy
} from "../types";
import { normalizeAddressVariants } from "./addressNormalization";
import { DATA_SOURCE_CONTRACTS } from "../data/dataSourceContracts";

const GOVERNMENT_DOMAIN_PATTERN = /(?:\.gov$|\.gov\.|\.mil$|\.mil\.)/i;
const PRIMARY_RECORD_PATTERN = /assessor|appraiser|appraisal|cad|property|parcel|tax|treasurer|recorder|clerk|register|gis|zoning|planning|permit|code\s*enforcement|deed/i;
const OPEN_DATA_PATTERN = /opendata|open-data|data\.|socrata|arcgis|esri|gis|catalog|dataset|hub/i;

const AGGREGATOR_DOMAINS = new Set([
  "zillow.com",
  "redfin.com",
  "realtor.com",
  "trulia.com",
  "loopnet.com",
  "propertyshark.com",
  "homes.com",
  "apartments.com"
]);

const SOCIAL_DOMAINS = new Set([
  "facebook.com",
  "twitter.com",
  "x.com",
  "reddit.com",
  "instagram.com",
  "tiktok.com",
  "linkedin.com"
]);

const SOURCE_TYPE_BASE_SCORES: Record<SourceTaxonomy, number> = {
  authoritative: 90,
  quasi_official: 70,
  aggregator: 50,
  social: 20,
  unknown: 35
};

const DOSSIER_SECTION_DEFS = [
  { label: "Parcel & Legal", aliases: ["parcel", "parcel and legal", "parcel/legal"], fieldPath: "/parcel", recordType: "assessor_parcel" },
  { label: "Ownership/Transfers", aliases: ["ownership", "ownership and transfers", "ownership/transfers"], fieldPath: "/ownership", recordType: "deed_recorder" },
  { label: "Tax & Appraisal", aliases: ["tax", "tax and appraisal", "tax/appraisal"], fieldPath: "/taxAppraisal", recordType: "tax_appraisal" },
  { label: "Zoning/Land Use", aliases: ["zoning", "zoning and land use", "land use", "zoning/land use"], fieldPath: "/zoningLandUse", recordType: "zoning_gis" },
  { label: "Permits & Code", aliases: ["permits", "permits and code", "code", "permits/code"], fieldPath: "/permitsAndCode", recordType: "permits" },
  { label: "Hazards/Environmental", aliases: ["hazards", "hazards and environmental", "environmental", "hazards/environmental"], fieldPath: "/hazardsEnvironmental", recordType: "hazards_environmental" },
  { label: "Neighborhood Context", aliases: ["neighborhood", "neighborhood context"], fieldPath: "/neighborhoodContext", recordType: "neighborhood_context" },
  { label: "Data Gaps & Next Steps", aliases: ["data gaps", "next steps", "data gaps and next steps"], fieldPath: "/dataGaps" }
];

const RECORD_TYPE_MAX_AGE_DAYS: Record<string, number> = {
  assessor_parcel: 730,
  tax_appraisal: 730,
  tax_collector: 540,
  deed_recorder: 36500,
  zoning_gis: 1095,
  permits: 1825,
  code_enforcement: 1095,
  hazards_environmental: 1825,
  neighborhood_context: 3650
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const isoDateToday = () => new Date().toISOString().slice(0, 10);

const normalizeLabel = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const findSectionDef = (title: string) => {
  const normalized = normalizeLabel(title);
  return DOSSIER_SECTION_DEFS.find((def) => {
    if (normalized.includes(normalizeLabel(def.label))) return true;
    return def.aliases.some((alias) => normalized.includes(normalizeLabel(alias)));
  });
};

const extractHeading = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const hashMatch = trimmed.match(/^#{2,6}\s*(.+)$/);
  if (hashMatch) return hashMatch[1].trim();
  const boldMatch = trimmed.match(/^\*\*(.+)\*\*$/);
  if (boldMatch) return boldMatch[1].trim();
  const colonMatch = trimmed.match(/^([A-Za-z][A-Za-z0-9 &/]+):\s*$/);
  if (colonMatch) return colonMatch[1].trim();
  return null;
};

const extractDossierSubsections = (content: string) => {
  const lines = content.split(/\r?\n/);
  const sections = new Map<string, string[]>();
  let currentLabel: string | null = null;

  for (const line of lines) {
    const heading = extractHeading(line);
    if (heading) {
      const def = findSectionDef(heading);
      if (def) {
        currentLabel = def.label;
        if (!sections.has(currentLabel)) sections.set(currentLabel, []);
        continue;
      }
    }

    if (currentLabel) {
      sections.get(currentLabel)?.push(line);
    }
  }

  const result = new Map<string, string>();
  sections.forEach((lines, label) => {
    const text = lines.join("\n").trim();
    if (text) result.set(label, text);
  });
  return result;
};

const formatSnippet = (content: string) => {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const sentenceMatch = trimmed.match(/^(.*?[.!?])\s/);
  const snippet = sentenceMatch ? sentenceMatch[1] : trimmed.slice(0, 180);
  return snippet.length > 180 ? `${snippet.slice(0, 177)}...` : snippet;
};

const normalizeDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch (_) {
    return "";
  }
};

const classifySourceType = (url: string, title?: string): SourceTaxonomy => {
  const domain = normalizeDomain(url);
  const text = `${domain} ${title || ""} ${url}`.toLowerCase();

  if (SOCIAL_DOMAINS.has(domain) || /facebook|twitter|x\.com|reddit|instagram|tiktok|linkedin|nextdoor/i.test(text)) {
    return "social";
  }
  if (AGGREGATOR_DOMAINS.has(domain) || /zillow|redfin|realtor|trulia|loopnet|propertyshark|homes\.com|apartments\.com|corelogic|realtytrac|attom/i.test(text)) {
    return "aggregator";
  }

  const isGovDomain = GOVERNMENT_DOMAIN_PATTERN.test(domain);
  const hasRecordKeywords = PRIMARY_RECORD_PATTERN.test(text);
  const isOpenDataPortal = OPEN_DATA_PATTERN.test(text);

  if (isGovDomain && hasRecordKeywords) return "authoritative";
  if (isGovDomain) return "quasi_official";
  if (isOpenDataPortal) return "quasi_official";

  return "unknown";
};

const scoreAuthority = (source: CitationSource) => {
  const base = SOURCE_TYPE_BASE_SCORES[source.sourceType ?? "unknown"] ?? SOURCE_TYPE_BASE_SCORES.unknown;
  const domain = normalizeDomain(source.url || "");
  const text = `${domain} ${source.title || ""} ${source.url || ""}`.toLowerCase();
  let score = base;

  if (GOVERNMENT_DOMAIN_PATTERN.test(domain)) score += 5;
  if (PRIMARY_RECORD_PATTERN.test(text)) score += 5;
  if (/(parcel|account|permit|record|case|roll|parcelid|accountid|permitid)/i.test(source.url || "")) {
    score += 5;
  }

  if (source.sourceType === "aggregator") score -= 10;
  if (source.sourceType === "social") score -= 15;
  if (!source.publisher || source.publisher.trim().length === 0) score -= 5;

  return clamp(score, 0, 100);
};

const computeAgeDays = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const ageDays = Math.max(0, (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));
  return ageDays;
};

const computeRecencyComponent = (sources: CitationSource[], recordType?: string) => {
  const maxAgeDays = recordType ? RECORD_TYPE_MAX_AGE_DAYS[recordType] : undefined;
  const ages = sources
    .map((source) => {
      if (typeof source.dataCurrency?.ageDays === "number") return source.dataCurrency.ageDays;
      if (source.dataCurrency?.asOf) return computeAgeDays(source.dataCurrency.asOf);
      if (source.sourceUpdatedAt) return computeAgeDays(source.sourceUpdatedAt);
      if (source.retrievedAt) return computeAgeDays(source.retrievedAt);
      return null;
    })
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (ages.length === 0) return 0.5;
  const minAgeDays = Math.min(...ages);
  if (!maxAgeDays || !Number.isFinite(maxAgeDays)) return clamp(1 - minAgeDays / 1825, 0, 1);
  return clamp(1 - minAgeDays / maxAgeDays, 0, 1);
};

const computeCorroborationComponent = (sources: CitationSource[]) => {
  const keys = sources.map((source) => source.publisher || normalizeDomain(source.url || "")).filter(Boolean);
  const unique = new Set(keys);
  if (unique.size <= 1) return 0.35;
  if (unique.size === 2) return 0.7;
  return 1;
};

const computeConsistencyComponent = (dataGaps: DataGap[], fieldPath?: string, recordType?: string) => {
  const relevant = dataGaps.filter((gap) => {
    if (fieldPath && gap.fieldPath && gap.fieldPath.startsWith(fieldPath)) return true;
    if (recordType && gap.recordType === recordType) return true;
    return false;
  });
  if (relevant.some((gap) => gap.status === "conflict")) return 0;
  if (relevant.some((gap) => gap.status === "ambiguous")) return 0.5;
  return 1;
};

const computeConfidence = (
  citations: CitationSourceRef[],
  sourceById: Map<string, CitationSource>,
  dataGaps: DataGap[],
  fieldPath?: string,
  recordType?: string
) => {
  const sources = citations
    .map((citation) => sourceById.get(citation.sourceId))
    .filter((source): source is CitationSource => Boolean(source));
  if (sources.length === 0) return 0;

  const authorityScores = sources.map(scoreAuthority);
  const maxAuthority = Math.max(...authorityScores);
  const authorityComponent = clamp(maxAuthority / 100, 0, 1);
  const recencyComponent = computeRecencyComponent(sources, recordType);
  const corroborationComponent = computeCorroborationComponent(sources);
  const consistencyComponent = computeConsistencyComponent(dataGaps, fieldPath, recordType);

  return clamp(
    0.5 * authorityComponent + 0.25 * recencyComponent + 0.15 * corroborationComponent + 0.1 * consistencyComponent,
    0,
    1
  );
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

const buildCoverageDataGaps = (
  coverage?: PrimaryRecordCoverage,
  jurisdiction?: Jurisdiction
): DataGap[] => {
  if (!coverage) return [];
  return coverage.entries
    .filter((entry) => entry.status !== "covered")
    .map((entry) => {
      const status = entry.status ?? "missing";
      const severity = status === "missing" || status === "restricted" ? "major" : "minor";
      return {
        id: `gap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        recordType: entry.recordType,
        description: `Primary record ${entry.recordType.replace(/_/g, " ")} is ${status}.`,
        reason: entry.availabilityDetails || entry.availabilityStatus || `Record status is ${status}.`,
        expectedSources: expectedSourcesForRecord(entry.recordType, jurisdiction),
        severity,
        status,
        detectedAt: isoDateToday(),
        impact: status === "missing"
          ? "Missing primary records reduce confidence in this section."
          : "Record coverage is incomplete for this section."
      };
    });
};

export type CitationRegistry = {
  sources: CitationSource[];
  sourceIdByUrl: Map<string, string>;
  sourceById: Map<string, CitationSource>;
};

export const buildCitationRegistry = (reportSources: NormalizedSource[]): CitationRegistry => {
  const sourceIdByUrl = new Map<string, string>();
  const sourceById = new Map<string, CitationSource>();
  const sources: CitationSource[] = [];

  reportSources.forEach((source, index) => {
    const id = `src-${index + 1}`;
    const sourceType = classifySourceType(source.uri, source.title);
    const citationSource: CitationSource = {
      id,
      url: source.uri,
      title: source.title,
      publisher: source.domain,
      sourceType
    };
    sources.push(citationSource);
    sourceIdByUrl.set(source.uri, id);
    sourceById.set(id, citationSource);
  });

  return { sources, sourceIdByUrl, sourceById };
};

export const applySectionConfidences = (
  sections: ReportSection[],
  registry: CitationRegistry,
  dataGaps: DataGap[] = []
): ReportSection[] => {
  return sections.map((section) => {
    const sectionSources = Array.isArray(section.sources) ? section.sources : [];
    const citations: CitationSourceRef[] = sectionSources
      .map((url) => registry.sourceIdByUrl.get(url))
      .filter((id): id is string => Boolean(id))
      .map((sourceId) => ({ sourceId }));
    const def = findSectionDef(section.title);
    const recordType = def?.recordType;
    const fieldPath = def?.fieldPath;
    const confidence = computeConfidence(citations, registry.sourceById, dataGaps, fieldPath, recordType);
    return { ...section, confidence };
  });
};

export type PropertyDossierBuildInput = {
  topic: string;
  addressLike: boolean;
  jurisdiction?: Jurisdiction;
  sections: ReportSection[];
  registry: CitationRegistry;
  primaryRecordCoverage?: PrimaryRecordCoverage;
  dataGaps?: DataGap[];
};

export const buildPropertyDossier = (input: PropertyDossierBuildInput): PropertyDossier => {
  const normalizedAddress = input.addressLike
    ? normalizeAddressVariants(input.topic)[0] || input.topic
    : undefined;
  const subject = {
    address: input.topic,
    normalizedAddress,
    jurisdiction: input.jurisdiction
  };

  const dataGaps = [
    ...buildCoverageDataGaps(input.primaryRecordCoverage, input.jurisdiction),
    ...(input.dataGaps || [])
  ];
  const claims: ClaimCitation[] = [];
  const claimFieldPaths = new Set<string>();

  const propertySections = input.sections.filter((section) => {
    const def = findSectionDef(section.title);
    return Boolean(def && def.fieldPath);
  });

  for (const section of propertySections) {
    const def = findSectionDef(section.title);
    if (!def || !def.fieldPath) continue;
    if (claimFieldPaths.has(def.fieldPath)) continue;

    const sectionSources = Array.isArray(section.sources) ? section.sources : [];
    const citations: CitationSourceRef[] = sectionSources
      .map((url) => input.registry.sourceIdByUrl.get(url))
      .filter((id): id is string => Boolean(id))
      .map((sourceId) => ({ sourceId }));
    if (citations.length === 0) continue;

    const snippet = formatSnippet(section.content);
    const confidence = computeConfidence(citations, input.registry.sourceById, dataGaps, def.fieldPath, def.recordType);

    claims.push({
      id: `claim-${claims.length + 1}`,
      fieldPath: def.fieldPath,
      claim: snippet || `Section summary for ${def.label}.`,
      citations,
      confidence,
      createdAt: isoDateToday()
    });
    claimFieldPaths.add(def.fieldPath);
  }

  const dossierSection = input.sections.find((section) => normalizeLabel(section.title).includes("property dossier"));
  if (dossierSection) {
    const subsections = extractDossierSubsections(dossierSection.content);
    subsections.forEach((text, label) => {
      const def = findSectionDef(label);
      if (!def || !def.fieldPath || claimFieldPaths.has(def.fieldPath)) return;

      const sectionSources = Array.isArray(dossierSection.sources) ? dossierSection.sources : [];
      const citations: CitationSourceRef[] = sectionSources
        .map((url) => input.registry.sourceIdByUrl.get(url))
        .filter((id): id is string => Boolean(id))
        .map((sourceId) => ({ sourceId }));
      if (citations.length === 0) return;

      const snippet = formatSnippet(text);
      const confidence = computeConfidence(citations, input.registry.sourceById, dataGaps, def.fieldPath, def.recordType);

      claims.push({
        id: `claim-${claims.length + 1}`,
        fieldPath: def.fieldPath,
        claim: snippet || `Section summary for ${def.label}.`,
        citations,
        confidence,
        createdAt: isoDateToday()
      });
      claimFieldPaths.add(def.fieldPath);
    });
  }

  return {
    schemaVersion: 1,
    subject,
    dataGaps,
    claims,
    sources: input.registry.sources
  } as PropertyDossier;
};
