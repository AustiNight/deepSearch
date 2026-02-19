import type {
  ModelOverrides,
  ModelRole,
  NormalizedSource,
  Skill,
  SourceNormalizationDiagnostics
} from "../types";
import { isAddressLike } from "../data/verticalLogic";
import {
  MIN_EVIDENCE_AUTHORITATIVE_SOURCES,
  MIN_EVIDENCE_AUTHORITY_SCORE,
  MIN_EVIDENCE_TOTAL_SOURCES
} from "../constants";
import type { TaxonomyProposalBundle } from "../data/researchTaxonomy";
import { parseJsonFromText, tryParseJsonFromText } from "./jsonUtils";
import { coerceReportData } from "./reportFormatter";
import { getOpenAIModelDefaults, resolveModelForRole } from "./modelOverrides";
import {
  formatSourceDiagnosticsMessage,
  normalizeOpenAIResponseSources,
  normalizeSourcesFromResponse,
  normalizeSourcesFromText,
  recordEmptySources
} from "./sourceNormalization";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
import { resolveProxyBaseUrl } from "./proxyBaseUrl";

const PROXY_BASE_URL = resolveProxyBaseUrl();
const USE_PROXY = PROXY_BASE_URL.length > 0;

let openAIKey: string | null = null;

type RequestOptions = {
  signal?: AbortSignal;
};

export const initializeOpenAI = (apiKey?: string) => {
  if (USE_PROXY) return;
  if (!apiKey) throw new Error("OpenAI API key required");
  openAIKey = apiKey;
};

const ensureOpenAIReady = () => {
  if (USE_PROXY) return;
  ensureOpenAIReady();
};

const loggedModelRoles = new Set<ModelRole>();
const shouldLogResolvedModels = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage?.getItem("overseer_log_models") === "true";
  } catch (_) {
    return false;
  }
};

const resolveRoleModel = (role: ModelRole, overrides?: ModelOverrides) => {
  const model = resolveModelForRole(role, overrides, getOpenAIModelDefaults());
  if (shouldLogResolvedModels() && !loggedModelRoles.has(role)) {
    console.info(`[OpenAI] Using model "${model}" for role "${role}".`);
    loggedModelRoles.add(role);
  }
  return model;
};

const requestOpenAI = async (body: Record<string, unknown>, options?: RequestOptions) => {
  if (USE_PROXY) {
    const res = await fetch(`${PROXY_BASE_URL}/api/openai/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
      signal: options?.signal
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI proxy error ${res.status}: ${text}`);
    }
    return res.json();
  }

  ensureOpenAIReady();
  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAIKey}`,
    },
    body: JSON.stringify(body),
    signal: options?.signal
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${text}`);
  }

  return res.json();
};

const extractOutputText = (resp: any): string => {
  if (typeof resp?.output_text === "string") return resp.output_text;
  const output = Array.isArray(resp?.output) ? resp.output : [];
  const parts: string[] = [];

  for (const item of output) {
    if (item?.type !== "message" || !Array.isArray(item?.content)) continue;
    for (const part of item.content) {
      if (typeof part?.text === "string") parts.push(part.text);
      if (part?.type === "output_text" && typeof part?.text === "string") parts.push(part.text);
    }
  }

  return parts.join("");
};

const logSourceDiagnostics = (
  logCallback: ((msg: string) => void) | undefined,
  input: { model: string; query: string; diagnostics: SourceNormalizationDiagnostics }
) => {
  if (!logCallback) return;
  logCallback(formatSourceDiagnosticsMessage(input));
};

const supportsJsonSchema = (model: string) => {
  const normalized = model.toLowerCase();
  return normalized.startsWith("gpt-4o") || normalized.startsWith("gpt-4.1");
};

const REPORT_SCHEMA = {
  type: "object",
  properties: {
    schemaVersion: { type: "number" },
    title: { type: "string" },
    summary: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          sources: { type: "array", items: { type: "string" } }
        },
        required: ["title", "content", "sources"],
        additionalProperties: false
      }
    },
    visualizations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          title: { type: "string" },
          caption: { type: "string" },
          sources: { type: "array", items: { type: "string" } },
          data: { type: "object" }
        },
        required: ["type", "title", "data"],
        additionalProperties: false
      }
    },
    provenance: {
      type: "object",
      properties: {
        totalSources: { type: "number" },
        methodAudit: { type: "string" }
      },
      required: ["totalSources", "methodAudit"],
      additionalProperties: false
    }
  },
  required: ["title", "summary", "sections", "provenance"],
  additionalProperties: false
};

const isValidReportData = (data: any) => {
  if (!data || typeof data !== "object") return false;
  if (typeof data.title !== "string") return false;
  if (typeof data.summary !== "string") return false;
  if (!Array.isArray(data.sections)) return false;
  for (const section of data.sections) {
    if (!section || typeof section !== "object") return false;
    if (typeof section.title !== "string") return false;
    if (typeof section.content !== "string") return false;
    if (!Array.isArray(section.sources)) return false;
  }
  if (data.visualizations !== undefined && !Array.isArray(data.visualizations)) return false;
  return true;
};

const jsonRequest = async (model: string, prompt: string, options?: RequestOptions) => {
  const resp = await requestOpenAI({
    model,
    input: prompt,
    text: { format: { type: "json_object" } },
  }, options);
  const text = extractOutputText(resp);
  return parseJsonFromText(text || "{}");
};

export const classifyResearchVertical = async (input: {
  topic: string;
  taxonomySummary: Array<{ id: string; label: string; blueprintFields?: string[] }>;
  hintVerticalIds?: string[];
  contextText?: string;
}, modelOverrides?: ModelOverrides, options?: RequestOptions) => {
  ensureOpenAIReady();
  const model = resolveRoleModel('overseer_planning', modelOverrides);
  const summaryLines = input.taxonomySummary.map((v) => {
    const fields = Array.isArray(v.blueprintFields) && v.blueprintFields.length > 0
      ? ` fields: ${v.blueprintFields.join(", ")}`
      : "";
    return `${v.id} (${v.label})${fields}`;
  }).join("\n");
  const hints = Array.isArray(input.hintVerticalIds) && input.hintVerticalIds.length > 0
    ? input.hintVerticalIds.join(", ")
    : "none";
  const contextSnippet = input.contextText ? input.contextText.substring(0, 6000) : "";

  const prompt = `
    Topic: "${input.topic}"
    Vertical Hints: ${hints}

    Available Verticals:
    ${summaryLines}

    Optional Context:
    ${contextSnippet || "none"}

    Task: Classify the topic into one or more verticals from the list above.
    Return JSON with:
    - verticals: [{ id, weight, reason }]
    - isUncertain: boolean
    - confidence: number (0-1)
    Notes:
    - Weights must sum to 1.
    - Include multiple verticals if the topic spans them (hybrid).
    - If unsure, set isUncertain true and lower confidence.
  `;

  try {
    return await jsonRequest(model, prompt, options);
  } catch (_) {
    return { verticals: [], isUncertain: true, confidence: 0 };
  }
};

export const extractResearchMethods = async (
  topic: string,
  sourceText: string,
  contextText?: string,
  modelOverrides?: ModelOverrides,
  options?: RequestOptions
) => {
  ensureOpenAIReady();
  const model = resolveRoleModel('method_discovery', modelOverrides);
  const prompt = `
    Topic: "${topic}"
    Research Context (taxonomy + blueprint):
    ${contextText || "none"}

    SOURCE TEXT:
    ${sourceText.substring(0, 8000)}

    Extract multiple distinct research methods and concrete search queries that would help research the topic.
    Use the context to avoid duplicating existing tactic templates and to cover blueprint fields.
    Return JSON.
  `;
  try {
    return await jsonRequest(model, prompt, options);
  } catch (_) {
    return { methods: [] };
  }
};

export const proposeTaxonomyGrowth = async (input: {
  topic: string;
  agentName: string;
  agentFocus: string;
  findingsText: string;
  taxonomySummary: Array<{ id: string; label: string; subtopics: Array<{ id: string; label: string }> }>;
  hintVerticalIds?: string[];
}, modelOverrides?: ModelOverrides, options?: RequestOptions): Promise<TaxonomyProposalBundle> => {
  ensureOpenAIReady();
  const model = resolveRoleModel('overseer_planning', modelOverrides);
  const summaryLines = input.taxonomySummary.map((v) => {
    const subs = v.subtopics.map(s => `${s.id} (${s.label})`).join(", ");
    return `${v.id} (${v.label}): ${subs}`;
  }).join("\n");
  const hints = Array.isArray(input.hintVerticalIds) && input.hintVerticalIds.length > 0
    ? input.hintVerticalIds.join(", ")
    : "none";

  const prompt = `
    Topic: "${input.topic}"
    Agent: ${input.agentName}
    Focus: ${input.agentFocus}
    Vertical Hints: ${hints}

    Existing Taxonomy (verticals and subtopics):
    ${summaryLines}

    Findings Snippet:
    ${input.findingsText.substring(0, 8000)}

    Propose taxonomy growth for future research. Focus on NEW search query templates (tactics) that are not already in the taxonomy.
    Use placeholders like {topic}, {name}, {company}, {companyDomain}, {product}, {brandDomain}, {city}, {cityExpanded}, {cityMetro}, {county}, {countyPrimary}, {countyMetro}, {countyRegion}, {countyExpanded}, {state}, {address}, {propertyAuthorityPrimary}, {propertyAuthoritySecondary}, {year}, {event}, {concept}, {title}, {condition}, {drug}, {law}, {statuteCitation}, {billName}.
    Prefer adding tactics to existing subtopics. Only propose a new subtopic or vertical if the taxonomy clearly lacks coverage.

    Return JSON with:
    - tactics: [{ verticalId, subtopicId, template, notes? }]
    - subtopics: [{ verticalId, id?, label, description?, tactics: [{ template, notes? }] }]
    - verticals: [{ id?, label, description?, blueprintFields, subtopics: [{ id?, label, tactics: [{ template, notes? }] }] }]

    Limits: max 5 tactics, max 1 subtopic, max 1 vertical. If nothing useful, return empty arrays.
  `;

  try {
    return await jsonRequest(model, prompt, options);
  } catch (_) {
    return { tactics: [], subtopics: [], verticals: [] };
  }
};

export const validateReport = async (
  topic: string,
  report: any,
  allowedSources: string[] = [],
  modelOverrides?: ModelOverrides,
  options?: RequestOptions
) => {
  ensureOpenAIReady();
  const model = resolveRoleModel('validation', modelOverrides);
  const prompt = `
    Topic: "${topic}"
    Allowed Sources:
    ${allowedSources.join('\n')}

    Report JSON:
    ${JSON.stringify(report).substring(0, 20000)}

    You are an independent reviewer. Verify that claims include inline citations from allowed sources.
    Flag any unsupported claims, fabricated links, or missing citations.
    Return JSON with:
    - isValid: boolean
    - confidence: number (0-1)
    - issues: array of objects with:
      - sectionTitle: string
      - claim: string (short excerpt)
      - problem: one of "missing_citation", "unsupported_claim", "fabricated_link", "source_not_allowed", "other"
      - missingCitations?: string[] (expected sources or "none" if unknown)
      - citedSources?: string[] (sources found in the report for this claim)
      - notes?: string
      - message: string (human-readable; must mention section + missing citations if applicable)
  `;
  try {
    return await jsonRequest(model, prompt, options);
  } catch (_) {
    return { isValid: false, issues: ["Validation failed."], confidence: 0 };
  }
};

const storeRawSynthesis = (raw: string, attempt: "initial" | "retry") => {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const maxChars = 200000;
      const stored = raw.length > maxChars ? `${raw.slice(0, maxChars)}\n...[truncated]` : raw;
      window.sessionStorage.setItem(`overseer_synthesis_raw_openai_${attempt}`, stored);
    }
  } catch (_) {
    // ignore storage errors
  }
  console.warn(`[SYNTHESIS RAW openai ${attempt}]`, raw);
};

const jsonRequestWithRaw = async (model: string, prompt: string, options?: RequestOptions) => {
  const format = supportsJsonSchema(model)
    ? { type: "json_schema", name: "deep_dive_report", schema: REPORT_SCHEMA, strict: true }
    : { type: "json_object" };
  const resp = await requestOpenAI({
    model,
    input: prompt,
    text: { format }
  }, options);
  const raw = extractOutputText(resp);
  const parsed = tryParseJsonFromText(raw || "");
  return { raw: raw || "", parsed };
};

// --- PHASE 1: SECTOR ANALYSIS ---
export const generateSectorAnalysis = async (
  topic: string,
  skills: Skill[] = [],
  contextText?: string,
  modelOverrides?: ModelOverrides,
  options?: RequestOptions
) => {
  ensureOpenAIReady();
  const model = resolveRoleModel('sector_analysis', modelOverrides);
  const currentDate = new Date().toDateString();

  const prompt = `
    Topic: "${topic}"
    Current Date: ${currentDate}
    Research Context (taxonomy + blueprint):
    ${contextText || "none"}

    You are the Research Director. We need a 360-degree view of this topic.
    Break this topic down into 8-12 DISTINCT SECTORS or DIMENSIONS that require separate investigation.
    Examples: "Economic Impact", "Technical Architecture", "Competitor Landscape", "Historical Context", "Future Risks".

    Do NOT just give generic names. Make the tasks specific and include a concrete initialQuery for each sector.
    Ensure sectors collectively cover blueprint fields and key taxonomy subtopics.

    Return JSON.
  `;

  try {
    return await jsonRequest(model, prompt, options);
  } catch (error) {
    console.error("Sector analysis failed:", error);
    return {
      sectors: [
        { name: "Generalist", focus: "General Overview", initialQuery: `${topic} overview` },
        { name: "Critic", focus: "Critical Analysis", initialQuery: `${topic} problems and failures` },
        { name: "Futurist", focus: "Future Outlook", initialQuery: `${topic} future trends` }
      ],
      reasoning: "Fallback due to error."
    };
  }
};

// --- PHASE 2: RECURSIVE DEEP DRILL ---
const singleSearch = async (
  query: string,
  context: string,
  model: string,
  logCallback?: (msg: string) => void,
  options?: RequestOptions
): Promise<{ text: string; sources: NormalizedSource[] }> => {
  ensureOpenAIReady();
  try {
    const response = await requestOpenAI({
      model,
      input: `Context: ${context}\n\nTask: Search for "${query}".\nExtract hard data, dates, and specific names.`,
      tools: [{ type: "web_search" }],
      tool_choice: "auto",
    }, options);

    const text = extractOutputText(response);
    const normalization = normalizeOpenAIResponseSources(response);
    let sources = normalization.sources;
    let fallbackDiagnostics: SourceNormalizationDiagnostics | null = null;

    if (sources.length === 0) {
      const responseFallback = normalizeSourcesFromResponse(response, "openai");
      if (responseFallback.sources.length > 0) {
        sources = responseFallback.sources;
        fallbackDiagnostics = responseFallback.diagnostics;
        normalization.diagnostics.fallbackUsed = true;
      }
    }

    if (sources.length === 0 && text) {
      const fallback = normalizeSourcesFromText(text, "openai");
      if (fallback.sources.length > 0) {
        sources = fallback.sources;
        fallbackDiagnostics = fallback.diagnostics;
        normalization.diagnostics.fallbackUsed = true;
      }
    }

    logSourceDiagnostics(logCallback, {
      model,
      query,
      diagnostics: normalization.diagnostics
    });

    if (fallbackDiagnostics) {
      logSourceDiagnostics(logCallback, {
        model,
        query,
        diagnostics: fallbackDiagnostics
      });
    }

    if (sources.length === 0 && text) {
      logCallback?.(`Warning: OpenAI model "${model}" returned text without sources for "${query}".`);
      recordEmptySources({ provider: "openai", model, query });
    }

    return { text, sources };
  } catch (e) {
    if ((e as any)?.name === 'AbortError') throw e;
    console.warn(`Search failed for ${query}`, e);
    return { text: "", sources: [] };
  }
};

type DeepResearchModelOptions = {
  modelOverrides?: ModelOverrides;
  role?: ModelRole;
  l1Role?: ModelRole;
  l2Role?: ModelRole;
  signal?: AbortSignal;
};

export const performDeepResearch = async (
  agentName: string,
  focus: string,
  initialQuery: string,
  logCallback: (msg: string) => void,
  options?: DeepResearchModelOptions
) => {
  ensureOpenAIReady();
  const currentDate = new Date().toDateString();
  const overrideRole = options?.role;
  const l1Role = overrideRole ?? options?.l1Role ?? 'deep_research_l1';
  const l2Role = overrideRole ?? options?.l2Role ?? 'deep_research_l2';
  const l1Model = resolveRoleModel(l1Role, options?.modelOverrides);
  const l2Model = resolveRoleModel(l2Role, options?.modelOverrides);

  // Step 1: Broad Search
  logCallback(`Initiating Level 1 Scan: "${initialQuery}"`);
  const level1 = await singleSearch(
    initialQuery,
    `Current Date: ${currentDate}. Agent: ${agentName}. Focus: ${focus}`,
    l1Model,
    logCallback,
    { signal: options?.signal }
  );

  if (!level1.text) return { text: "Search failed.", sources: [] };

  // Step 2: Analyze & Generate Drill-Down Queries
  logCallback("Analyzing L1 data for gaps. Generating verification queries...");
  const drillDownPrompt = `
    Source Material: "${level1.text.substring(0, 5000)}"

    You are ${agentName}. Your focus is ${focus}.
    Analyze the search results above.
    Identify 3 specific claims, numbers, or sub-topics that are VAGUE, SUSPICIOUS, or KEY to the topic but lack detail.

    Generate 3 specific follow-up Google Search queries to drill deeper into these specific points.
    Return JSON.
  `;

  let drillQueries: string[] = [];
  try {
    const plan = await jsonRequest(l2Model, drillDownPrompt, { signal: options?.signal });
    if (Array.isArray(plan.queries)) drillQueries = plan.queries;
  } catch (e) {
    drillQueries = [`${initialQuery} statistics`, `${initialQuery} criticism`, `${initialQuery} latest news`];
  }
  if (drillQueries.length === 0) {
    drillQueries = [`${initialQuery} statistics`, `${initialQuery} criticism`, `${initialQuery} latest news`];
  }

  // Step 3: Execute Parallel Drill-Downs
  logCallback(`Level 2 Drill-Down: Executing ${drillQueries.length} verification searches...`);
  const level2Results = await Promise.all(
    drillQueries.map(q => singleSearch(q, `Verifying claims for ${focus}`, l2Model, logCallback, { signal: options?.signal }))
  );

  // Step 4: Synthesize Findings
  const allSources = [...level1.sources, ...level2Results.flatMap(r => r.sources)];
  // Remove duplicate URLs
  const uniqueSources = Array.from(new Map(allSources.map((item: any) => [item.uri, item])).values());

  const combinedText = `
    LEVEL 1 FINDINGS (Broad):
    ${level1.text}

    LEVEL 2 FINDINGS (Deep Dive / Verification):
    ${level2Results.map((r, i) => `Query: ${drillQueries[i]}\nResult: ${r.text}`).join("\n---\n")}
  `;

  logCallback(`Research Complete. Indexed ${uniqueSources.length} unique sources.`);

  return {
    text: combinedText,
    sources: uniqueSources
  };
};

// --- PHASE 3: CRITIQUE ---
export const critiqueAndFindGaps = async (
  topic: string,
  currentFindings: string,
  contextText?: string,
  modelOverrides?: ModelOverrides,
  options?: RequestOptions
) => {
  ensureOpenAIReady();
  const model = resolveRoleModel('critique', modelOverrides);

  const currentDate = new Date().toDateString();
  const prompt = `
    Topic: ${topic}
    Current Date: ${currentDate}
    Research Context (taxonomy + blueprint):
    ${contextText || "none"}
    Current Findings Summary: ${currentFindings.substring(0, 15000)}...

    You are the "Red Team" Critic.

    CRITICAL RULE: Trust external data (search results) over your internal training data for dates/events after 2023.

    CHECKLIST:
    1. Are there conflicting numbers?
    2. Did we only find positive news? (We need the negatives).
    3. Is there a "Competitor" or "Alternative" we completely missed?
    4. Are any blueprint fields or taxonomy subtopics still missing?

    If MAJOR gaps, propose a specific gap-fill search.

    Return JSON.
  `;

  try {
    return await jsonRequest(model, prompt, options);
  } catch (error) {
    return { isExhaustive: true, gapAnalysis: "Critique failed, assuming exhaustive." };
  }
};

// --- PHASE 4: GRAND SYNTHESIS ---
export const synthesizeGrandReport = async (
  topic: string,
  allFindings: any[],
  allowedSources: string[] = [],
  modelOverrides?: ModelOverrides,
  options?: RequestOptions
) => {
  ensureOpenAIReady();
  const model = resolveRoleModel('synthesis', modelOverrides);
  const currentDate = new Date().toDateString();
  const allowRawStorage = !isAddressLike(topic);

  // Combine huge amount of text
  const combinedText = allFindings.map(f => `
    AGENT: ${f.source}
    FOCUS: ${f.focus}
    RAW DATA: ${f.content}
  `).join("\n====================\n");

  const allowedSourcesText = allowedSources.length > 0
    ? `ALLOWED SOURCES (ordered by authority + recency; prefer earlier sources when conflicts occur):\n${allowedSources.join('\n')}\n`
    : `ALLOWED SOURCES: none provided\n`;

  const addressDirective = isAddressLike(topic)
    ? `
    ADDRESS DOSSIER REQUIREMENTS (address-like topic detected):
    - Resolve parcel/address identifiers first (parcel/account, legal description if present).
    - Include official records: appraisal district / assessor, tax collector, county clerk deed chain, zoning, permits/inspections, code violations, GIS parcel map, flood/insurance risk.
    - Add a "Property Dossier" section with subsections: Parcel & Legal, Ownership/Transfers, Tax & Appraisal, Zoning/Land Use, Permits & Code, Hazards/Environmental, Neighborhood Context, Data Gaps & Next Steps.
    - If a data item is not found, write the exact label "Source not found" (no synonyms) and list the exact portal/record system or endpoint that should contain it.
    - The "Data Gaps & Next Steps" subsection is REQUIRED and must enumerate every missing record/field with an exact portal/endpoint pointer (URL if known, otherwise portal name + endpoint path + query entry point).
    - Evidence thresholds: minimum total sources ${MIN_EVIDENCE_TOTAL_SOURCES}, minimum authoritative sources ${MIN_EVIDENCE_AUTHORITATIVE_SOURCES}, and at least one source with authorityScore >= ${MIN_EVIDENCE_AUTHORITY_SCORE}. If unmet, explicitly note the shortfall in "Data Gaps & Next Steps".
    `
    : '';

  const buildPrompt = (input: string, strict: boolean) => `
    Topic: ${topic}
    Current Date: ${currentDate}
    INPUT DATA:
    ${input}

    ${allowedSourcesText}

    You are the Chief Intelligence Officer. Write a "DEEP DIVE" RESEARCH REPORT.
    ${addressDirective}

    RULES:
    1. **NO FLUFF**. Every sentence must convey a fact or analysis.
    2. **CLAIM-LEVEL CITATIONS REQUIRED**. Every sentence with a factual claim must end with one or more inline URL citations from allowed sources. Do not rely on section-level citations or the bibliography alone.
    3. **BIBLIOGRAPHY IS MANDATORY**. Use ONLY allowed sources. If you cannot support a claim from allowed sources, explicitly say "Source not found" and avoid numeric claims.
    4. **COMPARE & CONTRAST**. Do not just list facts. Compare Option A vs Option B with numbers.
    5. **SOURCE PRIORITY**: Prefer higher-authority sources (government/official > quasi-official > aggregator > social) and the most recent evidence. When sources conflict, prioritize authority first, then recency.
    6. **HYPOTHESIS**: Based on the data, what is the strongest conclusion?

    STRUCTURE:
    - **Executive Brief**: The bottom line (Verdict).
    - **Key Metrics Table**: A Markdown table comparing key options/entities.
    - **Sector Analysis**: Deep dive into the dimensions found (Economic, Technical, etc).
    - **Consensus & Conflicts**: What do sources agree on? Where do they disagree?
    - **Master Bibliography**: List of distinct URLs referenced.
    - **Visualizations (optional)**: If a chart or image would clarify the data, include a \`visualizations\` array.
      Chart schema: { type: "bar"|"line"|"area", title, caption?, sources: [urls], data: { labels: string[], series: [{ name, data: number[] }], unit? } }.
      Image schema: { type: "image", title, caption?, sources: [urls], data: { url, alt?, width?, height? } }.
      Keep charts to max 4 series and max 24 points. If no visualization is needed, return \`visualizations: []\`.

    OUTPUT JSON FIELDS:
    { schemaVersion: 1, title, summary, sections, visualizations, provenance }

    Tone: Academic, rigorous, exhausted.

    ${strict ? "Return ONLY a valid JSON object. Do not include markdown, code fences, or extra text." : "Return JSON."}
  `;

  const initialPrompt = buildPrompt(combinedText.substring(0, 100000), false);
  const initial = await jsonRequestWithRaw(model, initialPrompt, options);
  const initialParsed = initial.parsed.data;
  if (initialParsed && isValidReportData(initialParsed) && initialParsed.sections.length > 0) {
    return coerceReportData(initialParsed, topic);
  }
  if (initial.raw && allowRawStorage) storeRawSynthesis(initial.raw, "initial");
  const initialFallback = initialParsed ? coerceReportData(initialParsed, topic) : null;

  const retryPrompt = buildPrompt(combinedText.substring(0, 40000), true);
  const retry = await jsonRequestWithRaw(model, retryPrompt, options);
  const retryParsed = retry.parsed.data;
  if (retryParsed && isValidReportData(retryParsed) && retryParsed.sections.length > 0) {
    return coerceReportData(retryParsed, topic);
  }
  if (retry.raw && allowRawStorage) storeRawSynthesis(retry.raw, "retry");
  if (retryParsed) {
    return coerceReportData(retryParsed, topic);
  }
  if (initialFallback) {
    return initialFallback;
  }

  return {
    __rawText: retry.raw || initial.raw,
    __parseError: retry.parsed.error?.message || initial.parsed.error?.message || "JSON parse failed"
  };
};
