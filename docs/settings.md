# Settings

Open the **SYSTEM_CONFIG** modal (gear icon) to update runtime settings. If `ADMIN_PASSWORD` is set, you must unlock settings before editing.

## Storage Keys
The Settings modal persists configuration to localStorage. Keys are shown here so the UI and docs stay aligned.

| UI section | Storage key | Value type |
| --- | --- | --- |
| LLM provider | `overseer_provider` | `google` or `openai` |
| Gemini key override | `overseer_api_key_google` | string |
| OpenAI key override | `overseer_api_key_openai` | string |
| Search limits + round control | `overseer_run_config` | JSON object |
| OpenAI model overrides | `overseer_model_overrides` | JSON object keyed by role |
| Cloudflare Access allowlist | `overseer_access_allowlist` | JSON array of emails |

## LLM Provider
- **LLM PROVIDER**: chooses between Google Gemini and OpenAI. Persisted in `overseer_provider`. If `LLM_PROVIDER` is set in `.env.local`, it is used as the initial default.
- **GEMINI_API_KEY** and **OPENAI_API_KEY**: optional overrides. Leave blank to use `.env.local` values (`GEMINI_API_KEY`, `OPENAI_API_KEY`). Stored in `overseer_api_key_google` and `overseer_api_key_openai`.

## OpenAI Model Overrides
Visible only when **LLM PROVIDER** is set to OpenAI.

- **OPENAI MODEL PER AGENT ROLE**: per-role overrides stored in `overseer_model_overrides`. Empty fields fall back to defaults.
- **APPLY TO ALL ROLES**: sets the same model for every role.
- **RESET TO DEFAULTS**: clears overrides.
- Default resolution: UI override → `OPENAI_MODEL_FAST/OPENAI_MODEL_REASONING` → `constants.ts` defaults.

### Model Role Mapping
| UI label | Role key | Default tier | Default env |
| --- | --- | --- | --- |
| Overseer Planning | `overseer_planning` | Fast | `OPENAI_MODEL_FAST` |
| Method Discovery | `method_discovery` | Fast | `OPENAI_MODEL_FAST` |
| Sector Analysis | `sector_analysis` | Reasoning | `OPENAI_MODEL_REASONING` |
| Deep Research L1 | `deep_research_l1` | Fast | `OPENAI_MODEL_FAST` |
| Deep Research L2 | `deep_research_l2` | Fast | `OPENAI_MODEL_FAST` |
| Method Audit | `method_audit` | Fast | `OPENAI_MODEL_FAST` |
| Gap Hunter | `gap_hunter` | Fast | `OPENAI_MODEL_FAST` |
| Exhaustion Scout | `exhaustion_scout` | Fast | `OPENAI_MODEL_FAST` |
| Critique | `critique` | Reasoning | `OPENAI_MODEL_REASONING` |
| Synthesis | `synthesis` | Fast | `OPENAI_MODEL_FAST` |
| Validation | `validation` | Reasoning | `OPENAI_MODEL_REASONING` |

## Cloudflare Access Allowlist
- **CLOUDFLARE ACCESS ALLOWLIST**: normalized, de-duplicated email list stored in `overseer_access_allowlist`.
- **COPY ALLOWLIST**: formats the list for Cloudflare Access → Include → Emails in.
- This helper does not secure the client app; Cloudflare Access policy does.

See `docs/cloudflare-access.md` for the end-to-end workflow.

## Search Limits
Stored in `overseer_run_config`.

- **MIN_AGENTS**: minimum agents to spawn for a run. Defaults to `MIN_AGENT_COUNT`.
- **MAX_AGENTS**: upper cap for total agents. Defaults to `MAX_AGENT_COUNT`.
- **MAX_METHOD**: cap for method discovery agents. Defaults to `MAX_METHOD_AGENTS`.
- **FORCE EXHAUSTION**: forces an exhaustion pass even if critique would stop early.

## Round Control
Stored in `overseer_run_config`.

- **MIN_ROUNDS**: minimum research rounds. Defaults to `MIN_SEARCH_ROUNDS`.
- **MAX_ROUNDS**: maximum research rounds. Defaults to `MAX_SEARCH_ROUNDS`.

## Early Stop Thresholds
Stored in `overseer_run_config`.

- **DIMINISHING**: stop when diminishing returns score exceeds the threshold.
- **NOVELTY**: stop when query novelty ratio falls below the threshold.
- **NEW DOMAINS**: stop when new domains found per round falls below the threshold.
- **NEW SOURCES**: stop when new sources per round falls below the threshold.

Environment defaults for these values are `EARLY_STOP_DIMINISHING_SCORE`, `EARLY_STOP_NOVELTY_RATIO`, `EARLY_STOP_NEW_DOMAINS`, and `EARLY_STOP_NEW_SOURCES`.
