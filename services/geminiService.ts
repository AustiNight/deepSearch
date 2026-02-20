import { GoogleGenAI, Type } from "@google/genai";
import { resolveProxyBaseUrl } from "./proxyBaseUrl";
import { apiFetch } from "./apiClient";
import { GEMINI_MODEL_FAST, GEMINI_MODEL_REASONING } from "../constants";
import { isAddressLike } from "../data/verticalLogic";
import {
  MIN_EVIDENCE_AUTHORITATIVE_SOURCES,
  MIN_EVIDENCE_AUTHORITY_SCORE,
  MIN_EVIDENCE_TOTAL_SOURCES
} from "../constants";
import type { ModelOverrides, ModelRole, NormalizedSource, Skill, SourceNormalizationDiagnostics } from "../types";
import type { TaxonomyProposalBundle } from "../data/researchTaxonomy";
import { parseJsonFromText, tryParseJsonFromText } from "./jsonUtils";
import { coerceReportData } from "./reportFormatter";
import {
  formatSourceDiagnosticsMessage,
  normalizeGeminiResponseSources,
  normalizeSourcesFromResponse,
  normalizeSourcesFromText,
  recordEmptySources
} from "./sourceNormalization";
import { writeRawSynthesisDebug } from "./storagePolicy";
import { fetchSocrataDiscoveryRag, fetchSocrataSodaRag } from "./socrataRagClient";

const PROXY_BASE_URL = resolveProxyBaseUrl();
const USE_PROXY = PROXY_BASE_URL.length > 0;
let genAI: GoogleGenAI | null = null;

type RequestOptions = {
  signal?: AbortSignal;
};

export const initializeGemini = (apiKey?: string) => {
  if (USE_PROXY) return;
  if (!apiKey) throw new Error("Gemini API key required");
  genAI = new GoogleGenAI({ apiKey });
};

const callGemini = async (payload: { model: string; contents: any; config?: any }, options?: RequestOptions) => {
  if (USE_PROXY) {
    const res = await apiFetch("/api/gemini/generateContent", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify(payload),
      signal: options?.signal
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini proxy error ${res.status}: ${text}`);
    }
    return res.json();
  }
  if (!genAI) throw new Error("Gemini not initialized");
  return genAI.models.generateContent({ ...(payload as any), signal: options?.signal } as any);
};

const storeRawSynthesis = (raw: string, attempt: "initial" | "retry") => {
  writeRawSynthesisDebug("gemini", attempt, raw);
  console.warn(`[SYNTHESIS RAW gemini ${attempt}]`, raw);
};

export const classifyResearchVertical = async (input: {
  topic: string;
  taxonomySummary: Array<{ id: string; label: string; blueprintFields?: string[] }>;
  hintVerticalIds?: string[];
  contextText?: string;
}, _modelOverrides?: ModelOverrides, options?: RequestOptions) => {
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
    const response = await callGemini({
      model: GEMINI_MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verticals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  weight: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                }
              }
            },
            isUncertain: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            notes: { type: Type.STRING }
          }
        }
      }
    }, options);
    return parseJsonFromText(response.text || "{}");
  } catch (error) {
    return { verticals: [], isUncertain: true, confidence: 0 };
  }
};

export const extractResearchMethods = async (
  topic: string,
  sourceText: string,
  contextText?: string,
  _modelOverrides?: ModelOverrides,
  options?: RequestOptions
) => {
  const formatRagHits = (hits: Array<{ id: string; text: string; doc_id?: string }>) => {
    if (!hits || hits.length === 0) return "none";
    return hits
      .map((hit) => `- [${hit.id}${hit.doc_id ? `|${hit.doc_id}` : ""}] ${hit.text.substring(0, 600)}`)
      .join("\n");
  };
  const [discoveryRag, sodaRag] = await Promise.all([
    fetchSocrataDiscoveryRag().catch(() => []),
    fetchSocrataSodaRag().catch(() => [])
  ]);
  const addressOrderDirective = isAddressLike(topic)
    ? `
    Address-first order required:
    1) Parcel/address datasets (assessor/CAD, tax roll, parcel map)
    2) Jurisdictional records (permits, code enforcement, zoning/land use, recorder)
    3) Neighborhood/tract context
    4) City/metro context labeled as "non-local context"
    If you include city/metro queries, append "(non-local context)" to the query.
    `
    : '';
  const prompt = `
    Topic: "${topic}"
    Research Context (taxonomy + blueprint):
    ${contextText || "none"}

    Socrata RAG Reference (use ONLY if you propose Socrata discovery or SODA requests):
    Discovery API:
    ${formatRagHits(discoveryRag)}

    SODA API:
    ${formatRagHits(sodaRag)}

    SOURCE TEXT:
    ${sourceText.substring(0, 8000)}

    Extract multiple distinct research methods and concrete search queries that would help research the topic.
    Use the context to avoid duplicating existing tactic templates and to cover blueprint fields.
    If you propose Socrata discovery or SODA requests, you MUST cite the exact parameter rules and endpoint format from the RAG reference above.
    Include a field \`ragEvidence\` on any Socrata-related method with the chunk ids you used (e.g., [\"section-purpose-1\"]). 
    ${addressOrderDirective}
    Return JSON.
  `;

  try {
    const response = await callGemini({
      model: GEMINI_MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            methods: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  query: { type: Type.STRING },
                  description: { type: Type.STRING },
                  ragEvidence: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    }, options);
    return parseJsonFromText(response.text || "{}");
  } catch (error) {
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
}, _modelOverrides?: ModelOverrides, options?: RequestOptions): Promise<TaxonomyProposalBundle> => {
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
    const response = await callGemini({
      model: GEMINI_MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tactics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  verticalId: { type: Type.STRING },
                  subtopicId: { type: Type.STRING },
                  methodId: { type: Type.STRING },
                  template: { type: Type.STRING },
                  notes: { type: Type.STRING }
                }
              }
            },
            subtopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  verticalId: { type: Type.STRING },
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tactics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        template: { type: Type.STRING },
                        notes: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            verticals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  blueprintFields: { type: Type.ARRAY, items: { type: Type.STRING } },
                  subtopics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING },
                        description: { type: Type.STRING },
                        tactics: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              template: { type: Type.STRING },
                              notes: { type: Type.STRING }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }, options);
    return parseJsonFromText(response.text || "{}");
  } catch (error) {
    return { tactics: [], subtopics: [], verticals: [] };
  }
};

export const validateReport = async (
  topic: string,
  report: any,
  allowedSources: string[] = [],
  _modelOverrides?: ModelOverrides,
  options?: RequestOptions
) => {
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
    const response = await callGemini({
      model: GEMINI_MODEL_REASONING,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionTitle: { type: Type.STRING },
                  claim: { type: Type.STRING },
                  problem: { type: Type.STRING },
                  missingCitations: { type: Type.ARRAY, items: { type: Type.STRING } },
                  citedSources: { type: Type.ARRAY, items: { type: Type.STRING } },
                  notes: { type: Type.STRING },
                  message: { type: Type.STRING }
                }
              }
            },
            confidence: { type: Type.NUMBER }
          }
        }
      }
    }, options);
    return parseJsonFromText(response.text || "{}");
  } catch (error) {
    return { isValid: false, issues: ["Validation failed."], confidence: 0 };
  }
};

// --- PHASE 1: SECTOR ANALYSIS ---
export const generateSectorAnalysis = async (
  topic: string,
  skills: Skill[] = [],
  contextText?: string,
  _modelOverrides?: ModelOverrides,
  options?: RequestOptions
) => {
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
    const response = await callGemini({
      model: GEMINI_MODEL_REASONING,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sectors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the specialist agent (e.g. 'EconAnalyst')" },
                  focus: { type: Type.STRING, description: "The specific dimension to research" },
                  initialQuery: { type: Type.STRING, description: "The starting search query for this sector" }
                }
              }
            },
            reasoning: { type: Type.STRING }
          }
        }
      }
    }, options);

    return parseJsonFromText(response.text || "{}");
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
const searchToolConfig = { tools: [{ googleSearch: {} }] };

const logSourceDiagnostics = (
  logCallback: ((msg: string) => void) | undefined,
  input: { model: string; query: string; diagnostics: SourceNormalizationDiagnostics }
) => {
  if (!logCallback) return;
  logCallback(formatSourceDiagnosticsMessage(input));
};

const singleSearch = async (
  query: string,
  context: string = "",
  logCallback?: (msg: string) => void,
  options?: RequestOptions
): Promise<{ text: string; sources: NormalizedSource[] }> => {
    try {
        const response = await callGemini({
            model: GEMINI_MODEL_FAST,
            contents: `Context: ${context}\n\nTask: Search for "${query}".\nExtract hard data, dates, and specific names.`,
            config: searchToolConfig
        }, options);

        const text = response.text || "";
        const normalization = normalizeGeminiResponseSources(response);
        let sources = normalization.sources;
        let fallbackDiagnostics: SourceNormalizationDiagnostics | null = null;

        if (sources.length === 0) {
          const responseFallback = normalizeSourcesFromResponse(response, "google");
          if (responseFallback.sources.length > 0) {
            sources = responseFallback.sources;
            fallbackDiagnostics = responseFallback.diagnostics;
            normalization.diagnostics.fallbackUsed = true;
          }
        }

        if (sources.length === 0 && text) {
          const fallback = normalizeSourcesFromText(text, "google");
          if (fallback.sources.length > 0) {
            sources = fallback.sources;
            fallbackDiagnostics = fallback.diagnostics;
            normalization.diagnostics.fallbackUsed = true;
          }
        }

        logSourceDiagnostics(logCallback, {
          model: GEMINI_MODEL_FAST,
          query,
          diagnostics: normalization.diagnostics
        });

        if (fallbackDiagnostics) {
          logSourceDiagnostics(logCallback, {
            model: GEMINI_MODEL_FAST,
            query,
            diagnostics: fallbackDiagnostics
          });
        }

        if (sources.length === 0 && text) {
          logCallback?.(`Warning: Gemini model \"${GEMINI_MODEL_FAST}\" returned text without sources for \"${query}\".`);
          recordEmptySources({ provider: "google", model: GEMINI_MODEL_FAST, query });
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
    const currentDate = new Date().toDateString();
    
    // Step 1: Broad Search
    logCallback(`Initiating Level 1 Scan: "${initialQuery}"`);
    const level1 = await singleSearch(
      initialQuery,
      `Current Date: ${currentDate}. Agent: ${agentName}. Focus: ${focus}`,
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
        const planResp = await callGemini({
            model: GEMINI_MODEL_FAST,
            contents: drillDownPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        queries: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        }, { signal: options?.signal });
        const plan = parseJsonFromText(planResp.text || "{}");
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
        drillQueries.map(q => singleSearch(q, `Verifying claims for ${focus}`, logCallback, { signal: options?.signal }))
    );

    // Step 4: Synthesize Findings
    const allSources = [...level1.sources, ...level2Results.flatMap(r => r.sources)];
    // Remove duplicate URLs
    const uniqueSources = Array.from(new Map(allSources.map(item => [item.uri, item])).values());
    
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

// --- PHASE 3: CRITIQUE (UNCHANGED BUT ROBUST) ---
export const critiqueAndFindGaps = async (
  topic: string,
  currentFindings: string,
  contextText?: string,
  _modelOverrides?: ModelOverrides,
  options?: RequestOptions
) => {
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
    const response = await callGemini({
      model: GEMINI_MODEL_REASONING,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isExhaustive: { type: Type.BOOLEAN },
            gapAnalysis: { type: Type.STRING },
            newMethod: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                task: { type: Type.STRING },
                query: { type: Type.STRING }
              },
              nullable: true
            }
          }
        }
      }
    }, options);

    return parseJsonFromText(response.text || "{}");
  } catch (error) {
    return { isExhaustive: true, gapAnalysis: "Critique failed, assuming exhaustive." };
  }
};

// --- PHASE 4: GRAND SYNTHESIS ---
export const synthesizeGrandReport = async (
  topic: string,
  allFindings: any[],
  allowedSources: string[] = [],
  _modelOverrides?: ModelOverrides,
  options?: RequestOptions
) => {
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
    - Address-first order: parcel/address datasets → jurisdictional records → neighborhood/tract context → city/metro context (label city/metro as non-local).
    - Governance/Economy sections must be Data Gaps if parcel/address evidence is missing; do not use macro-only claims.
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

  const request = async (prompt: string) => {
    const response = await callGemini({
      model: GEMINI_MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schemaVersion: { type: Type.NUMBER },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  sources: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            provenance: {
              type: Type.OBJECT,
              properties: {
                totalSources: { type: Type.NUMBER },
                methodAudit: { type: Type.STRING }
              }
            },
            visualizations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  caption: { type: Type.STRING },
                  sources: { type: Type.ARRAY, items: { type: Type.STRING } },
                  data: { type: Type.OBJECT }
                }
              }
            }
          }
        }
      }
    }, options);

    return response.text || "";
  };

  const initialPrompt = buildPrompt(combinedText.substring(0, 100000), false);
  const initialRaw = await request(initialPrompt);
  const initialParsed = tryParseJsonFromText(initialRaw);
  if (initialParsed.data) return coerceReportData(initialParsed.data, topic);
  if (allowRawStorage) storeRawSynthesis(initialRaw, "initial");

  const retryPrompt = buildPrompt(combinedText.substring(0, 40000), true);
  const retryRaw = await request(retryPrompt);
  const retryParsed = tryParseJsonFromText(retryRaw);
  if (retryParsed.data) return coerceReportData(retryParsed.data, topic);
  if (allowRawStorage) storeRawSynthesis(retryRaw, "retry");

  return {
    __rawText: retryRaw || initialRaw,
    __parseError: retryParsed.error?.message || initialParsed.error?.message || "JSON parse failed"
  };
};
