import { useState, useCallback, useRef, useEffect } from 'react';
import { Agent, AgentStatus, AgentType, LogEntry, FinalReport, Finding, Skill, LLMProvider } from '../types';
import { initializeGemini, generateSectorAnalysis as generateSectorAnalysisGemini, performDeepResearch as performDeepResearchGemini, critiqueAndFindGaps as critiqueAndFindGapsGemini, synthesizeGrandReport as synthesizeGrandReportGemini, extractResearchMethods as extractResearchMethodsGemini, validateReport as validateReportGemini } from '../services/geminiService';
import { initializeOpenAI, generateSectorAnalysis as generateSectorAnalysisOpenAI, performDeepResearch as performDeepResearchOpenAI, critiqueAndFindGaps as critiqueAndFindGapsOpenAI, synthesizeGrandReport as synthesizeGrandReportOpenAI, extractResearchMethods as extractResearchMethodsOpenAI, validateReport as validateReportOpenAI } from '../services/openaiService';
import { INITIAL_OVERSEER_ID, METHOD_TEMPLATES_GENERAL, METHOD_TEMPLATES_ADDRESS, METHOD_DISCOVERY_TEMPLATES_GENERAL, METHOD_DISCOVERY_TEMPLATES_PERSON, METHOD_DISCOVERY_TEMPLATES_ADDRESS, MIN_AGENT_COUNT, MAX_AGENT_COUNT, MAX_METHOD_AGENTS } from '../constants';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

const normalizeDomain = (url: string) => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.startsWith('www.') ? host.slice(4) : host;
  } catch (_) {
    return '';
  }
};

const isAddressLike = (topic: string) => {
  const hasNumber = /\d{2,}/.test(topic);
  const hasStreet = /\b(ave|avenue|st|street|rd|road|blvd|boulevard|ln|lane|dr|drive|ct|court|cir|circle|way|pkwy|parkway|pl|place|hwy|highway)\b/i.test(topic);
  const hasZip = /\b\d{5}(?:-\d{4})?\b/.test(topic);
  return (hasNumber && hasStreet) || hasZip;
};

const isPersonLike = (topic: string) => {
  const parts = topic.trim().split(/\s+/);
  if (parts.length < 2) return false;
  if (/\d/.test(topic)) return false;
  return true;
};

const uniqueList = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const dedupeParagraphs = (text: string) => {
  const parts = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    if (seen.has(part)) continue;
    seen.add(part);
    out.push(part);
  }
  return out.join('\n\n');
};

type KnowledgeBase = {
  domains: string[];
  methods: string[];
  lastUpdated: number;
};

const loadKnowledgeBase = (): KnowledgeBase => {
  try {
    const stored = localStorage.getItem('overseer_kb');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        domains: Array.isArray(parsed?.domains) ? parsed.domains : [],
        methods: Array.isArray(parsed?.methods) ? parsed.methods : [],
        lastUpdated: typeof parsed?.lastUpdated === 'number' ? parsed.lastUpdated : Date.now()
      };
    }
  } catch (_) {
    // ignore
  }
  return { domains: [], methods: [], lastUpdated: Date.now() };
};

const saveKnowledgeBase = (kb: KnowledgeBase) => {
  try {
    localStorage.setItem('overseer_kb', JSON.stringify(kb));
  } catch (_) {
    // ignore
  }
};

export const useOverseer = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  const findingsRef = useRef<Finding[]>([]);

  useEffect(() => {
    try {
      const storedSkills = localStorage.getItem('overseer_skills');
      if (storedSkills) {
        const parsed = JSON.parse(storedSkills);
        if (Array.isArray(parsed)) setSkills(parsed);
      }
    } catch (e) {
      console.error("Failed to load skills", e);
    }
  }, []);

  const addLog = (agentId: string, agentName: string, message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: generateId(),
      timestamp: Date.now(),
      agentId,
      agentName,
      message,
      type
    }]);
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addAgent = (agent: Agent) => {
    setAgents(prev => [...prev, agent]);
  };

  const startResearch = useCallback(async (topic: string, provider: LLMProvider, apiKey: string, runConfig?: { minAgents?: number; maxAgents?: number; maxMethodAgents?: number; forceExhaustion?: boolean }) => {
    setIsRunning(true);
    setAgents([]);
    setLogs([]);
    setReport(null);
    setFindings([]);
    findingsRef.current = [];

    const resolveNumber = (value: any, fallback: number) => {
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
    };
    const envMin = resolveNumber(process.env.MIN_AGENT_COUNT, MIN_AGENT_COUNT);
    const envMax = resolveNumber(process.env.MAX_AGENT_COUNT, MAX_AGENT_COUNT);
    const envMaxMethod = resolveNumber(process.env.MAX_METHOD_AGENTS, MAX_METHOD_AGENTS);

    const minAgents = Math.max(1, resolveNumber(runConfig?.minAgents, envMin));
    const maxAgents = Math.max(minAgents, resolveNumber(runConfig?.maxAgents, envMax));
    const maxMethodAgents = Math.max(1, resolveNumber(runConfig?.maxMethodAgents, envMaxMethod));
    const forceExhaustion = runConfig?.forceExhaustion === true;
    const knowledgeBase = loadKnowledgeBase();
    const usedQueries = new Set<string>();
    const methodCandidateQueries: string[] = [];
    const methodQuerySources = new Map<string, string[]>();
    
    // --- 0. INITIALIZATION ---
    const overseerId = INITIAL_OVERSEER_ID;
    const overseer: Agent = {
      id: overseerId,
      name: 'Overseer Alpha',
      type: AgentType.OVERSEER,
      status: AgentStatus.THINKING,
      task: 'Orchestrate Deep Drill Protocol',
      reasoning: ['Initializing...', 'Loading Skill Matrix...'],
      findings: []
    };
    addAgent(overseer);
    addLog(overseerId, overseer.name, `Protocol Started: "${topic}"`, 'action');

    try {
      if (provider === 'openai') {
        initializeOpenAI(apiKey);
      } else {
        initializeGemini(apiKey);
      }

      const generateSectorAnalysis = provider === 'openai' ? generateSectorAnalysisOpenAI : generateSectorAnalysisGemini;
      const performDeepResearch = provider === 'openai' ? performDeepResearchOpenAI : performDeepResearchGemini;
      const critiqueAndFindGaps = provider === 'openai' ? critiqueAndFindGapsOpenAI : critiqueAndFindGapsGemini;
      const synthesizeGrandReport = provider === 'openai' ? synthesizeGrandReportOpenAI : synthesizeGrandReportGemini;
      const extractResearchMethods = provider === 'openai' ? extractResearchMethodsOpenAI : extractResearchMethodsGemini;
      const validateReport = provider === 'openai' ? validateReportOpenAI : validateReportGemini;

      // --- PHASE 0.5: METHOD DISCOVERY (HOW TO RESEARCH THE TOPIC) ---
      const discoveryTemplates = isAddressLike(topic)
        ? METHOD_DISCOVERY_TEMPLATES_ADDRESS
        : (isPersonLike(topic) ? METHOD_DISCOVERY_TEMPLATES_PERSON : METHOD_DISCOVERY_TEMPLATES_GENERAL);
      const discoveryQueries = uniqueList(discoveryTemplates.map(t => t.replace('{topic}', topic))).slice(0, Math.min(3, maxMethodAgents));
      if (discoveryQueries.length > 0) {
        addLog(overseerId, overseer.name, `PHASE 0.5: METHOD DISCOVERY - Spawning ${discoveryQueries.length} scouts to learn how to research the topic.`, 'action');
        const discoveryPromises = discoveryQueries.map(async (query: string, index: number) => {
          await new Promise(resolve => setTimeout(resolve, index * 600));
          const agentId = generateId();
          const agent: Agent = {
            id: agentId,
            name: `Method Discovery ${index + 1}`,
            type: AgentType.RESEARCHER,
            status: AgentStatus.SEARCHING,
            task: 'Discover research methods',
            reasoning: [`Method discovery query: ${query}`],
            findings: [],
            parentId: overseerId
          };
          addAgent(agent);
          addLog(agentId, agent.name, `Deployed for: ${query}`, 'info');

          const result = await performDeepResearch(
            agent.name,
            'Method discovery',
            query,
            (msg) => addLog(agentId, agent.name, msg, 'info')
          );

          updateAgent(agentId, {
            status: AgentStatus.COMPLETE,
            reasoning: [`Indexed ${result.sources.length} sources`, `Data Volume: ${result.text.length} chars`]
          });
          addLog(agentId, agent.name, `Method Discovery Complete. Sources Vetted: ${result.sources.length}`, 'success');

          const methods = await extractResearchMethods(topic, result.text);
          const extracted = Array.isArray(methods?.methods) ? methods.methods : [];
          const extractedQueries = extracted.map((m: any) => m?.query).filter(Boolean);
          methodCandidateQueries.push(...extractedQueries);
          usedQueries.add(query);
        });

        await Promise.all(discoveryPromises);
      }

      // --- PHASE 1: DIMENSIONAL MAPPING (SECTORS) ---
      addLog(overseerId, overseer.name, 'PHASE 1: DIMENSIONAL MAPPING - Splitting topic into sectors.', 'action');
      const sectorPlan = await generateSectorAnalysis(topic, skills);
      const rawSectors = sectorPlan && Array.isArray(sectorPlan.sectors) ? sectorPlan.sectors : [];
      let sectors = rawSectors.map((sector: any, index: number) => {
        const name = sector?.name || sector?.title || `Researcher ${index + 1}`;
        const focus = sector?.focus || sector?.dimension || name || "General Research";
        const initialQuery = sector?.initialQuery || sector?.initial_query || `${topic} ${focus}`;
        return { ...sector, name, focus, initialQuery };
      });

      updateAgent(overseerId, { 
        reasoning: [...overseer.reasoning, `Identified ${sectors.length} critical sectors`, ...sectors.map((s:any) => `• ${s.name}: ${s.focus}`)],
        status: AgentStatus.IDLE 
      });

      if (sectors.length === 0) sectors.push({ name: "General Researcher", focus: "Overview", initialQuery: topic });
      if (sectors.length < minAgents) {
        const templates = (isAddressLike(topic) ? METHOD_TEMPLATES_ADDRESS : METHOD_TEMPLATES_GENERAL)
          .map(t => t.replace('{topic}', topic));
        const needed = minAgents - sectors.length;
        for (let i = 0; i < needed; i++) {
          const fallbackQuery = templates[i % templates.length] || topic;
          sectors.push({
            name: `Method Scout ${i + 1}`,
            focus: 'Method-based deep search',
            initialQuery: fallbackQuery
          });
        }
      }
      if (sectors.length > maxAgents) {
        sectors = sectors.slice(0, maxAgents);
      }
      sectors.forEach((s: any) => usedQueries.add(s.initialQuery));

      // --- PHASE 2: PARALLEL RECURSIVE SEARCH ---
      addLog(overseerId, overseer.name, `PHASE 2: DEEP DRILL - Spawning ${sectors.length} agents for recursive analysis.`, 'action');
      
      const agentPromises = sectors.map(async (sector: any, index: number) => {
          // Stagger starts slightly to avoid instant rate limit hits (though unlikely with client-side)
          await new Promise(resolve => setTimeout(resolve, index * 1000));

          const agentId = generateId();
          const agent: Agent = {
            id: agentId,
            name: sector.name,
            type: AgentType.RESEARCHER,
            status: AgentStatus.SEARCHING,
            task: sector.focus,
            reasoning: [`Starting Level 1 Search: ${sector.initialQuery}`],
            findings: [],
            parentId: overseerId
          };
          addAgent(agent);
          addLog(agentId, agent.name, `Deployed for: ${sector.focus}`, 'info');

          // The "10x" Loop: Broad -> Analyze -> verify -> verification searches
          const result = await performDeepResearch(
              agent.name, 
              sector.focus, 
              sector.initialQuery, 
              (msg) => addLog(agentId, agent.name, msg, 'info')
          );
          
          const newFinding: Finding = {
            source: agent.name,
            content: result.text,
            confidence: 0.9,
            url: result.sources.map(s => s.uri).join(', ') // Store all URLs
          };
          
          updateAgent(agentId, { 
            status: AgentStatus.COMPLETE,
            findings: [newFinding],
            reasoning: [`Indexed ${result.sources.length} sources`, `Data Volume: ${result.text.length} chars`]
          });
          
          addLog(agentId, agent.name, `Sector Analysis Complete. Sources Vetted: ${result.sources.length}`, 'success');
          findingsRef.current.push({ ...newFinding, ...{ rawSources: result.sources } } as any);
      });

      await Promise.all(agentPromises);

      // --- PHASE 2B: METHOD AUDIT (INDEPENDENT SEARCH) ---
      const methodTemplates = isAddressLike(topic) ? METHOD_TEMPLATES_ADDRESS : METHOD_TEMPLATES_GENERAL;
      const methodQueriesBase = methodTemplates.map(t => t.replace('{topic}', topic));
      const methodQueriesFromKB = knowledgeBase.domains.map(d => `site:${d} ${topic}`);
      const methodQueriesFromKBMethods = (knowledgeBase.methods || []).map((q) => q.includes('{topic}') ? q.replace('{topic}', topic) : q);
      const methodQueries = uniqueList([
        ...methodQueriesBase,
        ...methodQueriesFromKB,
        ...methodQueriesFromKBMethods,
        ...methodCandidateQueries
      ]).slice(0, maxMethodAgents);

      const maxAdditionalAgents = Math.max(0, maxAgents - sectors.length);
      const methodQueriesToRun = methodQueries.filter(q => !usedQueries.has(q)).slice(0, maxAdditionalAgents);
      methodQueriesToRun.forEach(q => usedQueries.add(q));

      if (methodQueriesToRun.length > 0) {
        addLog(overseerId, overseer.name, `PHASE 2B: METHOD AUDIT - Spawning ${methodQueriesToRun.length} independent search agents.`, 'action');
        const methodAgentPromises = methodQueriesToRun.map(async (query: string, index: number) => {
          await new Promise(resolve => setTimeout(resolve, index * 700));
          const agentId = generateId();
          const agent: Agent = {
            id: agentId,
            name: `Method Audit ${index + 1}`,
            type: AgentType.RESEARCHER,
            status: AgentStatus.SEARCHING,
            task: 'Independent method audit',
            reasoning: [`Independent query: ${query}`],
            findings: [],
            parentId: overseerId
          };
          addAgent(agent);
          addLog(agentId, agent.name, `Deployed for: ${query}`, 'info');

          const result = await performDeepResearch(
            agent.name,
            'Independent method audit',
            query,
            (msg) => addLog(agentId, agent.name, msg, 'info')
          );
          methodQuerySources.set(query, result.sources.map(s => s.uri));

          const newFinding: Finding = {
            source: agent.name,
            content: result.text,
            confidence: 0.85,
            url: result.sources.map(s => s.uri).join(', ')
          };

          updateAgent(agentId, {
            status: AgentStatus.COMPLETE,
            findings: [newFinding],
            reasoning: [`Indexed ${result.sources.length} sources`, `Data Volume: ${result.text.length} chars`]
          });

          addLog(agentId, agent.name, `Method Audit Complete. Sources Vetted: ${result.sources.length}`, 'success');
          findingsRef.current.push({ ...newFinding, ...{ rawSources: result.sources } } as any);
        });

        await Promise.all(methodAgentPromises);
      } else {
        addLog(overseerId, overseer.name, 'PHASE 2B: METHOD AUDIT - Skipped (agent cap reached).', 'warning');
      }

      // --- PHASE 3: CROSS-EXAMINATION (GAP FILL) ---
      updateAgent(overseerId, { status: AgentStatus.ANALYZING });
      addLog(overseerId, overseer.name, 'PHASE 3: RED TEAM - Analyzing aggregate data for contradictions.', 'action');
      
      const allFindingsText = findingsRef.current.map(f => f.content).join('\n');
      const critique = await critiqueAndFindGaps(topic, allFindingsText);

      if (!critique.isExhaustive && critique.newMethod) {
         addLog(overseerId, overseer.name, `CRITIQUE: Major Blindspot - ${critique.gapAnalysis}`, 'warning');
         
         const gapAgentId = generateId();
         const gapAgent: Agent = {
            id: gapAgentId,
            name: `Gap Hunter: ${critique.newMethod.name}`,
            type: AgentType.RESEARCHER,
            status: AgentStatus.SEARCHING,
            task: critique.newMethod.task,
            reasoning: [`Targeting Blindspot: ${critique.newMethod.query}`],
            findings: [],
            parentId: overseerId
         };
         addAgent(gapAgent);
         
         // Use Deep Research even for the gap fill
         const gapResult = await performDeepResearch(
             gapAgent.name, 
             critique.newMethod.task, 
             critique.newMethod.query, 
             (msg) => addLog(gapAgentId, gapAgent.name, msg, 'info')
         );

         const gapFinding = {
             source: gapAgent.name,
             content: gapResult.text,
             confidence: 0.9,
             rawSources: gapResult.sources
         };
         updateAgent(gapAgentId, { status: AgentStatus.COMPLETE });
         findingsRef.current.push(gapFinding as any);
      } else {
        addLog(overseerId, overseer.name, 'Red Team Assessment: Sufficient data density achieved.', 'success');
      }

      // --- PHASE 3B: EXHAUSTION TEST (INDEPENDENT SEARCH) ---
      const currentSources = findingsRef.current.flatMap((f: any) => f.rawSources || []);
      const currentDomainCount = new Set(currentSources.map((s: any) => normalizeDomain(s.uri))).size;
      const shouldExhaust =
        forceExhaustion ||
        !critique.isExhaustive ||
        currentDomainCount < Math.max(6, Math.floor(minAgents / 2));

      if (shouldExhaust) {
        const remainingCapacity = Math.max(0, maxAgents - findingsRef.current.length);
        const exhaustTemplates = isAddressLike(topic) ? METHOD_TEMPLATES_ADDRESS : METHOD_TEMPLATES_GENERAL;
        const exhaustBase = exhaustTemplates.map(t => t.replace('{topic}', topic));
        const exhaustFromDomains = knowledgeBase.domains.map(d => `site:${d} ${topic}`);
        const exhaustFromMethods = (knowledgeBase.methods || []).map((q) => q.includes('{topic}') ? q.replace('{topic}', topic) : q);
        const exhaustQueries = uniqueList([...exhaustBase, ...exhaustFromDomains, ...exhaustFromMethods])
          .filter(q => !usedQueries.has(q))
          .slice(0, Math.min(remainingCapacity, maxMethodAgents));

        if (exhaustQueries.length > 0) {
          addLog(overseerId, overseer.name, `PHASE 3B: EXHAUSTION TEST - Spawning ${exhaustQueries.length} additional scouts.`, 'action');
          const exhaustPromises = exhaustQueries.map(async (query: string, index: number) => {
            await new Promise(resolve => setTimeout(resolve, index * 700));
            const agentId = generateId();
            const agent: Agent = {
              id: agentId,
              name: `Exhaustion Scout ${index + 1}`,
              type: AgentType.RESEARCHER,
              status: AgentStatus.SEARCHING,
              task: 'Exhaustion test',
              reasoning: [`Independent query: ${query}`],
              findings: [],
              parentId: overseerId
            };
            addAgent(agent);
            addLog(agentId, agent.name, `Deployed for: ${query}`, 'info');

            const result = await performDeepResearch(
              agent.name,
              'Exhaustion test',
              query,
              (msg) => addLog(agentId, agent.name, msg, 'info')
            );
            methodQuerySources.set(query, result.sources.map(s => s.uri));

            const newFinding: Finding = {
              source: agent.name,
              content: result.text,
              confidence: 0.85,
              url: result.sources.map(s => s.uri).join(', ')
            };

            updateAgent(agentId, {
              status: AgentStatus.COMPLETE,
              findings: [newFinding],
              reasoning: [`Indexed ${result.sources.length} sources`, `Data Volume: ${result.text.length} chars`]
            });

            addLog(agentId, agent.name, `Exhaustion Scout Complete. Sources Vetted: ${result.sources.length}`, 'success');
            findingsRef.current.push({ ...newFinding, ...{ rawSources: result.sources } } as any);
            usedQueries.add(query);
          });

          await Promise.all(exhaustPromises);
        } else {
          addLog(overseerId, overseer.name, 'PHASE 3B: EXHAUSTION TEST - No remaining unique methods.', 'warning');
        }
      }

      // --- PHASE 4: GRAND SYNTHESIS ---
      updateAgent(overseerId, { status: AgentStatus.THINKING });
      addLog(overseerId, overseer.name, 'PHASE 4: GRAND SYNTHESIS - Compiling "Deep Dive" Report...', 'info');

      const allRawSources = findingsRef.current.flatMap((f: any) => f.rawSources || []);
      const allowedSources = uniqueList(allRawSources.map((s: any) => s.uri).filter(Boolean));
      const finalReportData = await synthesizeGrandReport(topic, findingsRef.current, allowedSources);
      const rawText = (finalReportData as any)?.__rawText;
      if (rawText) {
        const providerLabel = provider === 'openai' ? 'openai' : 'gemini';
        addLog(
          overseerId,
          overseer.name,
          `SYNTHESIS WARNING: Non-JSON output. Raw stored in sessionStorage keys "overseer_synthesis_raw_${providerLabel}_initial" and "_retry". Displaying raw output section.`,
          'warning'
        );
      }
      
      // Calculate total unique sources across all agents
      const uniqueSourceCount = allowedSources.length;

      const parsedSections = Array.isArray((finalReportData as any)?.sections) ? (finalReportData as any).sections : [];
      const allowedSet = new Set(allowedSources);
      let filteredOutCount = 0;
      let sections = parsedSections.map((section: any) => {
        const sources = Array.isArray(section?.sources) ? section.sources.filter((s: string) => allowedSet.has(s)) : [];
        const removed = Array.isArray(section?.sources) ? section.sources.length - sources.length : 0;
        filteredOutCount += Math.max(0, removed);
        return { ...section, sources };
      });
      if (filteredOutCount > 0) {
        addLog(overseerId, overseer.name, `SOURCE FILTER: Removed ${filteredOutCount} non-grounded links from bibliography.`, 'warning');
      }
      let summary = (finalReportData as any)?.summary || "Summary generation failed.";
      if (rawText) {
        const maxRawChars = 50000;
        const rawClean = dedupeParagraphs(rawText);
        const rawForReport = rawClean.length > maxRawChars ? `${rawClean.slice(0, maxRawChars)}\n...[truncated]` : rawClean;
        if (sections.length === 0) {
          sections = [{
            title: "Raw Synthesis Output (Unstructured)",
            content: rawForReport,
            sources: []
          }];
        }
        if (summary === "Summary generation failed.") {
          summary = "Synthesis returned unstructured output. See raw output section.";
        }
      } else if (sections.length === 0) {
        addLog(overseerId, overseer.name, 'SYNTHESIS WARNING: No structured sections returned.', 'warning');
        sections = [{
          title: "Synthesis Incomplete",
          content: "The model did not return a structured report. Try a smaller topic, or re-run with more sources.",
          sources: []
        }];
      }

      const reportTitle = finalReportData.title || `Deep Dive: ${topic}`;
      let reportCandidate = {
        title: reportTitle,
        summary,
        sections,
        provenance: {
          totalSources: uniqueSourceCount,
          methodAudit: finalReportData.provenance?.methodAudit || "Deep Drill Protocol: 3-Stage Recursive Verification."
        }
      };

      const validation = await validateReport(topic, reportCandidate, allowedSources);
      const isValid = validation?.isValid === true;
      if (!isValid) {
        const issues = Array.isArray(validation?.issues) ? validation.issues : [];
        addLog(overseerId, overseer.name, `VALIDATION FAILED: ${issues.slice(0, 3).join(' | ') || 'Unspecified issues.'}`, 'warning');
        sections = [
          ...sections,
          {
            title: "Validation Issues",
            content: issues.length > 0 ? issues.join('\n') : "Validation failed. Claims may be unsupported.",
            sources: []
          }
        ];
        reportCandidate = {
          ...reportCandidate,
          sections
        };
      }

      const reportSources = uniqueList(sections.flatMap((s: any) => Array.isArray(s?.sources) ? s.sources : []));
      if (isValid) {
        const newDomains = uniqueList(reportSources.map((s: string) => normalizeDomain(s)));
        const validatedMethods = Array.from(methodQuerySources.entries())
          .filter(([_, sources]) => sources.some(src => reportSources.includes(src)))
          .map(([query]) => query);
        const mergedDomains = uniqueList([...(knowledgeBase.domains || []), ...newDomains]).slice(-300);
        const mergedMethods = uniqueList([...(knowledgeBase.methods || []), ...validatedMethods]).slice(-300);
        saveKnowledgeBase({
          domains: mergedDomains,
          methods: mergedMethods,
          lastUpdated: Date.now()
        });
      } else {
        addLog(overseerId, overseer.name, 'KNOWLEDGE BASE: Update skipped due to validation failure.', 'warning');
      }

      setReport(reportCandidate);
      
      updateAgent(overseerId, { status: AgentStatus.COMPLETE });
      addLog(overseerId, overseer.name, 'Protocol Complete. Report Ready.', 'success');

    } catch (e: any) {
      console.error(e);
      addLog(overseerId, overseer.name, `SYSTEM FAILURE: ${e.message}`, 'error');
      updateAgent(overseerId, { status: AgentStatus.FAILED });
      if (e.message && (e.message.toLowerCase().includes("api key") || e.message.includes("401"))) {
        setIsRunning(false);
      }
    }
  }, [skills]);

  return { agents, logs, report, isRunning, startResearch, skills };
};
