# Overseer Workflow Map

## Scope
This document maps the current Overseer workflow and the target architecture for the next refactor. It is based on `hooks/useOverseer.ts`, `services/openaiService.ts`, `services/geminiService.ts`, and `constants.ts`.

## Current Workflow (Overseer Orchestration)
1. Phase 0: Initialization
   Sets run state, clears prior session, loads knowledge base from `localStorage` (`overseer_kb`), configures agent caps, initializes provider, and creates the Overseer agent. (`hooks/useOverseer.ts`)
2. Phase 0.5: Method Discovery
   Chooses discovery templates by topic shape (address/person/general), spawns up to 3 method discovery agents (capped by `maxMethodAgents`), runs `performDeepResearch`, and extracts method queries via `extractResearchMethods`. (`hooks/useOverseer.ts`, `constants.ts`, `services/*Service.ts`)
3. Phase 1: Dimensional Mapping (Sector Analysis)
   Calls `generateSectorAnalysis` to produce sectors with `name`, `focus`, `initialQuery`. Falls back to default sectors if empty. Pads up to `minAgents` and caps at `maxAgents`. (`hooks/useOverseer.ts`, `services/*Service.ts`)
4. Phase 2: Deep Drill (Parallel Recursive Search)
   Spawns one agent per sector. Each agent runs `performDeepResearch` (broad search -> drill-down queries -> verification searches) and returns findings + sources. (`hooks/useOverseer.ts`, `services/*Service.ts`)
5. Phase 2B: Method Audit (Independent Search)
   Builds method queries from `METHOD_TEMPLATES_*`, knowledge-base domains/methods, and method-discovery candidates. Spawns additional agents within remaining capacity. (`hooks/useOverseer.ts`, `constants.ts`)
6. Phase 3: Cross-Examination (Red Team Critique)
   Calls `critiqueAndFindGaps` on aggregated findings. If critique indicates gaps and supplies a new method, spawns a single gap-fill agent. (`hooks/useOverseer.ts`, `services/*Service.ts`)
7. Phase 3B: Exhaustion Test (Single Extra Pass)
   Computes a lightweight exhaustion condition (forceExhaustion OR critique not exhaustive OR low domain count). If triggered, spawns additional exhaustion scouts from unused method templates and knowledge-base queries. (`hooks/useOverseer.ts`)
8. Phase 4: Grand Synthesis
   Calls `synthesizeGrandReport`, filters sources, validates the report with `validateReport`, updates knowledge base if valid, and completes the run. (`hooks/useOverseer.ts`, `services/*Service.ts`)

## Current Agent Spawning Points
1. Method Discovery Agents (Phase 0.5)
   Names: `Method Discovery {n}`. Task: "Discover research methods". Spawned from `METHOD_DISCOVERY_TEMPLATES_*`.
2. Sector Agents (Phase 2)
   Names from `generateSectorAnalysis`. Task: sector focus. One agent per sector.
3. Method Audit Agents (Phase 2B)
   Names: `Method Audit {n}`. Task: independent method audit. Spawned from templates, KB domains, KB methods, and method discovery candidates.
4. Gap Hunter (Phase 3)
   Name: `Gap Hunter: {critique.newMethod.name}`. Task: critique-proposed gap fill.
5. Exhaustion Scouts (Phase 3B)
   Names: `Exhaustion Scout {n}`. Task: exhaustion test. Spawned from unused method queries.

## Current Loop Boundaries
1. Overseer phase transitions: 0 -> 0.5 -> 1 -> 2 -> 2B -> 3 -> 3B -> 4.
2. `performDeepResearch` internal loop (per agent):
   Step 1: Level 1 broad search.
   Step 2: Generate 3 drill-down queries.
   Step 3: Run parallel Level 2 searches for drill-down queries.
   Step 4: Synthesize Level 1 + Level 2 findings into a single result.
3. Critique to Gap Fill boundary: gap-fill agent is spawned only when `critique.isExhaustive` is false and `critique.newMethod` exists.
4. Exhaustion Test boundary: exhaustion scouts spawn only if `forceExhaustion` is true OR critique not exhaustive OR low domain count.
5. Knowledge base update boundary: KB is updated only if report validation succeeds.

## Insertion Points For New Architecture
1. Vertical Classification
   Insert before Phase 0.5. It should decide verticals and load blueprint fields before any method discovery or sector analysis.
2. Taxonomy-Based Tactics
   Replace or augment method discovery templates and `METHOD_TEMPLATES_*` used in Phases 0.5, 2B, and 3B. Also seed sector analysis with taxonomy subtopics and tactic packs.
3. Hybrid Branching
   Insert between classification and sector mapping. If multiple verticals are selected, branch into multiple subtopic packs and spawn agents per vertical in parallel.
4. Probabilistic Exhaustion Heuristics
   Replace current Phase 3B boolean gate with per-round exhaustion metrics and multi-round loop control (not just a single extra pass).
5. Blueprint-Aware Synthesis
   Feed blueprint fields to sector analysis and synthesis, and log blueprint field coverage before report generation.

## Target Data Flow (Planned)
Input -> Vertical Classification -> Blueprint (fields expected) -> Tactic Library -> Agent Spawning -> Multi-round Exhaustion -> Synthesis

## Checklist: Phases And Loop Boundaries
- [ ] Phase 0: Initialization
- [ ] Phase 0.5: Method Discovery
- [ ] Phase 1: Dimensional Mapping (Sector Analysis)
- [ ] Phase 2: Deep Drill (Parallel Recursive Search)
- [ ] Phase 2B: Method Audit (Independent Search)
- [ ] Phase 3: Cross-Examination (Red Team Critique)
- [ ] Phase 3B: Exhaustion Test (Single Extra Pass)
- [ ] Phase 4: Grand Synthesis
- [ ] Loop Boundary: Overseer phase transitions (0 -> 0.5 -> 1 -> 2 -> 2B -> 3 -> 3B -> 4)
- [ ] Loop Boundary: `performDeepResearch` internal 4-step cycle
- [ ] Loop Boundary: Critique -> Gap Fill conditional
- [ ] Loop Boundary: Exhaustion gate (forceExhaustion or critique or domain count)
- [ ] Loop Boundary: Knowledge base update only on validation success
