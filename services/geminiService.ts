import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL_FAST, GEMINI_MODEL_REASONING } from "../constants";
import { Skill } from "../types";
import { parseJsonFromText, tryParseJsonFromText } from "./jsonUtils";

const PROXY_BASE_URL = (process.env.PROXY_BASE_URL || '').trim();
const USE_PROXY = PROXY_BASE_URL.length > 0;
let genAI: GoogleGenAI | null = null;

export const initializeGemini = (apiKey?: string) => {
  if (USE_PROXY) return;
  if (!apiKey) throw new Error("Gemini API key required");
  genAI = new GoogleGenAI({ apiKey });
};

const callGemini = async (payload: { model: string; contents: any; config?: any }) => {
  if (USE_PROXY) {
    const res = await fetch(`${PROXY_BASE_URL}/api/gemini/generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini proxy error ${res.status}: ${text}`);
    }
    return res.json();
  }
  if (!genAI) throw new Error("Gemini not initialized");
  return genAI.models.generateContent(payload as any);
};

const storeRawSynthesis = (raw: string, attempt: "initial" | "retry") => {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const maxChars = 200000;
      const stored = raw.length > maxChars ? `${raw.slice(0, maxChars)}\n...[truncated]` : raw;
      window.sessionStorage.setItem(`overseer_synthesis_raw_gemini_${attempt}`, stored);
    }
  } catch (_) {
    // ignore storage errors
  }
  console.warn(`[SYNTHESIS RAW gemini ${attempt}]`, raw);
};

export const extractResearchMethods = async (topic: string, sourceText: string) => {
  const prompt = `
    Topic: "${topic}"
    SOURCE TEXT:
    ${sourceText.substring(0, 8000)}

    Extract multiple distinct research methods and concrete search queries that would help research the topic.
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
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return parseJsonFromText(response.text || "{}");
  } catch (error) {
    return { methods: [] };
  }
};

export const validateReport = async (topic: string, report: any, allowedSources: string[] = []) => {
  const prompt = `
    Topic: "${topic}"
    Allowed Sources:
    ${allowedSources.join('\n')}

    Report JSON:
    ${JSON.stringify(report).substring(0, 20000)}

    You are an independent reviewer. Verify that claims include inline citations from allowed sources.
    Flag any unsupported claims, fabricated links, or missing citations.
    Return JSON with isValid, issues (array), confidence (0-1).
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
            issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.NUMBER }
          }
        }
      }
    });
    return parseJsonFromText(response.text || "{}");
  } catch (error) {
    return { isValid: false, issues: ["Validation failed."], confidence: 0 };
  }
};

// --- PHASE 1: SECTOR ANALYSIS ---
export const generateSectorAnalysis = async (topic: string, skills: Skill[] = []) => {
  const currentDate = new Date().toDateString();

  const prompt = `
    Topic: "${topic}"
    Current Date: ${currentDate}
    
    You are the Research Director. We need a 360-degree view of this topic.
    Break this topic down into 8-12 DISTINCT SECTORS or DIMENSIONS that require separate investigation.
    Examples: "Economic Impact", "Technical Architecture", "Competitor Landscape", "Historical Context", "Future Risks".
    
    Do NOT just give generic names. Make the tasks specific and include a concrete initialQuery for each sector.
    
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
    });

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

const singleSearch = async (query: string, context: string = ""): Promise<{ text: string, sources: any[] }> => {
    try {
        const response = await callGemini({
            model: GEMINI_MODEL_FAST,
            contents: `Context: ${context}\n\nTask: Search for "${query}".\nExtract hard data, dates, and specific names.`,
            config: searchToolConfig
        });
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
            .filter(Boolean) || [];
            
        return { text: response.text || "", sources };
    } catch (e) {
        console.warn(`Search failed for ${query}`, e);
        return { text: "", sources: [] };
    }
};

export const performDeepResearch = async (agentName: string, focus: string, initialQuery: string, logCallback: (msg: string) => void) => {
    const currentDate = new Date().toDateString();
    
    // Step 1: Broad Search
    logCallback(`Initiating Level 1 Scan: "${initialQuery}"`);
    const level1 = await singleSearch(initialQuery, `Current Date: ${currentDate}. Agent: ${agentName}. Focus: ${focus}`);
    
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
        });
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
        drillQueries.map(q => singleSearch(q, `Verifying claims for ${focus}`))
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
export const critiqueAndFindGaps = async (topic: string, currentFindings: string) => {
  const currentDate = new Date().toDateString();
  const prompt = `
    Topic: ${topic}
    Current Date: ${currentDate}
    Current Findings Summary: ${currentFindings.substring(0, 15000)}...

    You are the "Red Team" Critic.
    
    CRITICAL RULE: Trust external data (search results) over your internal training data for dates/events after 2023.

    CHECKLIST:
    1. Are there conflicting numbers?
    2. Did we only find positive news? (We need the negatives).
    3. Is there a "Competitor" or "Alternative" we completely missed?
    
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
    });

    return parseJsonFromText(response.text || "{}");
  } catch (error) {
    return { isExhaustive: true, gapAnalysis: "Critique failed, assuming exhaustive." };
  }
};

// --- PHASE 4: GRAND SYNTHESIS ---
export const synthesizeGrandReport = async (topic: string, allFindings: any[], allowedSources: string[] = []) => {
  const currentDate = new Date().toDateString();

  // Combine huge amount of text
  const combinedText = allFindings.map(f => `
    AGENT: ${f.source}
    FOCUS: ${f.focus}
    RAW DATA: ${f.content}
  `).join("\n====================\n");

  const allowedSourcesText = allowedSources.length > 0
    ? `ALLOWED SOURCES (use ONLY these URLs in citations and bibliography):\n${allowedSources.join('\n')}\n`
    : `ALLOWED SOURCES: none provided\n`;

  const buildPrompt = (input: string, strict: boolean) => `
    Topic: ${topic}
    Current Date: ${currentDate}
    INPUT DATA:
    ${input} 

    ${allowedSourcesText}
    
    You are the Chief Intelligence Officer. Write a "DEEP DIVE" RESEARCH REPORT.

    RULES:
    1. **NO FLUFF**. Every sentence must convey a fact or analysis.
    2. **CITATIONS REQUIRED**. Include inline citations as URLs from allowed sources for factual claims.
    3. **BIBLIOGRAPHY IS MANDATORY**. Use ONLY allowed sources. If you cannot support a claim from allowed sources, explicitly say "Source not found" and avoid numeric claims.
    4. **COMPARE & CONTRAST**. Do not just list facts. Compare Option A vs Option B with numbers.
    5. **HYPOTHESIS**: Based on the data, what is the strongest conclusion?
    
    STRUCTURE:
    - **Executive Brief**: The bottom line (Verdict).
    - **Key Metrics Table**: A Markdown table comparing key options/entities.
    - **Sector Analysis**: Deep dive into the dimensions found (Economic, Technical, etc).
    - **Consensus & Conflicts**: What do sources agree on? Where do they disagree?
    - **Master Bibliography**: List of distinct URLs referenced.

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
            }
          }
        }
      }
    });

    return response.text || "";
  };

  const initialPrompt = buildPrompt(combinedText.substring(0, 100000), false);
  const initialRaw = await request(initialPrompt);
  const initialParsed = tryParseJsonFromText(initialRaw);
  if (initialParsed.data) return initialParsed.data;
  storeRawSynthesis(initialRaw, "initial");

  const retryPrompt = buildPrompt(combinedText.substring(0, 40000), true);
  const retryRaw = await request(retryPrompt);
  const retryParsed = tryParseJsonFromText(retryRaw);
  if (retryParsed.data) return retryParsed.data;
  storeRawSynthesis(retryRaw, "retry");

  return {
    __rawText: retryRaw || initialRaw,
    __parseError: retryParsed.error?.message || initialParsed.error?.message || "JSON parse failed"
  };
};
