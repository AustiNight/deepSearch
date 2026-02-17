# OpenAI Model Role Map

This note defines how OpenAI call sites map to agent roles and how model selection is resolved.

## Storage
The per-role overrides are stored as a single JSON object in localStorage under `overseer_model_overrides`. Keys match `ModelRole` in `types.ts`. Missing or blank values mean "use default".

## Precedence
1. UI override from `overseer_model_overrides`.
2. Env defaults: `OPENAI_MODEL_FAST` and `OPENAI_MODEL_REASONING`.
3. Service hard defaults in `constants.ts`.

## Role Map
| Role key | OpenAI call sites | Default tier |
| --- | --- | --- |
| `overseer_planning` | `classifyResearchVertical` (Phase 0) and `proposeTaxonomyGrowth` (Phase 2 queue) in `services/openaiService.ts`, invoked from `hooks/useOverseer.ts` | Fast |
| `method_discovery` | `performDeepResearch` for Method Discovery agents (Phase 0.5) plus `extractResearchMethods` in `services/openaiService.ts` | Fast |
| `sector_analysis` | `generateSectorAnalysis` (Phase 1) in `services/openaiService.ts` | Reasoning |
| `deep_research_l1` | `performDeepResearch` Step 1 broad search for sector agents (Phase 2) via `singleSearch` | Fast |
| `deep_research_l2` | `performDeepResearch` Step 2 drill-down planning and Step 3 verification searches for sector agents | Fast |
| `method_audit` | `performDeepResearch` for Method Audit agents (Phase 2B) | Fast |
| `gap_hunter` | `performDeepResearch` for Gap Hunter agents (Phase 3) | Fast |
| `exhaustion_scout` | `performDeepResearch` for Exhaustion Scouts (Phase 3B) | Fast |
| `critique` | `critiqueAndFindGaps` (Phase 3) in `services/openaiService.ts` | Reasoning |
| `synthesis` | `synthesizeGrandReport` initial and retry passes (Phase 4) in `services/openaiService.ts` | Fast |
| `validation` | `validateReport` (Phase 4 validation) in `services/openaiService.ts` | Reasoning |

## Notes
Every OpenAI call site is tagged with exactly one role. For `performDeepResearch`, the role is determined by the agent context in `hooks/useOverseer.ts` so Method Audit, Gap Hunter, and Exhaustion Scout runs can override models independently of primary Deep Research.
