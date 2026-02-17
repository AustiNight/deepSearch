# Ralph Tasks

- [x] Epic: Define model‑override architecture for OpenAI agent roles
  - [x] Enumerate every OpenAI call site and map each to a distinct agent role (Overseer planning, Method Discovery, Sector Analysis, Deep Research L1/L2, Method Audit, Gap Hunter, Exhaustion Scout, Critique, Synthesis, Validation) in a short design note (e.g., `docs/model-roles.md`)
  - [x] Define a `ModelOverrides` type in `types.ts` with explicit keys per role and optional values (blank = default model)
  - [x] Add a single persisted settings object in localStorage (e.g., `overseer_model_overrides`) that stores the role->model mapping
  - [x] Define precedence rules: UI override > env default (`OPENAI_MODEL_FAST/REASONING`) > service hard default
  - [x] Add a small helper that resolves the model for a role (e.g., `resolveModelForRole(role, overrides, defaults)`)
  - [x] Validate that every OpenAI call site has a named role and a resolved model (acceptance criteria)

- [ ] Epic: Implement OpenAI model selector UI in Settings dialog
  - [ ] Add a “OpenAI Model per Agent Role” section in the settings UI (likely in `App.tsx`) that is only visible when provider = OpenAI
  - [ ] Provide a dropdown or editable select for each role with sensible defaults (e.g., `gpt-5-codex`, `gpt-4.1`, `gpt-4.1-mini`), plus a custom text entry option for advanced models
  - [ ] Persist model choices to `overseer_model_overrides` and hydrate them on load
  - [ ] Add “Apply to all roles” and “Reset to defaults” controls for fast configuration
  - [ ] Add concise help text per role explaining impact and cost/quality tradeoffs (e.g., “Deep Research: more expensive but higher recall”, “Synthesis: reasoning‑heavy; larger model recommended”)
  - [ ] Ensure empty/invalid entries fall back to defaults and do not break the run (acceptance criteria)

- [ ] Epic: Wire model overrides into OpenAI service calls
  - [ ] Update `hooks/useOverseer.ts` to pass `modelOverrides` in `startResearch` run config
  - [ ] Update `services/openaiService.ts` to accept optional model overrides for each role and route each call through `resolveModelForRole`
  - [ ] Ensure `performDeepResearch`, `generateSectorAnalysis`, `critiqueAndFindGaps`, `synthesizeGrandReport`, and `validateReport` each use the role‑specific override
  - [ ] Add minimal logging to confirm resolved model per role at runtime (guarded to avoid noisy logs)
  - [ ] Validate that switching a role model in UI changes the model used in the next run (acceptance criteria)

- [ ] Epic: Add email allowlist management controls to Settings dialog
  - [ ] Add a “Cloudflare Access Allowlist” section to the settings UI with a multi‑line textarea and add/remove controls
  - [ ] Normalize and validate email entries (trim, lowercase, remove duplicates; basic email format check)
  - [ ] Persist allowlist to localStorage (e.g., `overseer_access_allowlist`)
  - [ ] Add “Copy allowlist” button to export a newline‑separated list for Cloudflare Access policy entry
  - [ ] Add help text clarifying this is for Access policy configuration (does not enforce client‑side security), with a short example policy snippet
  - [ ] Validate that the allowlist is retained across reloads and can be exported cleanly (acceptance criteria)

- [ ] Epic: Expand help text for all settings with concrete examples
  - [ ] Add inline help text for provider selection, agent caps, exhaustion settings, and the new model/allowlist controls
  - [ ] Provide at least one example per setting showing impact (e.g., “Max agents 20 = wider coverage but slower UI”; “Force exhaustion = extra rounds even if critique says complete”)
  - [ ] Ensure help text is concise and doesn’t crowd the UI (acceptance criteria)

- [ ] Epic: Update repo documentation for new settings
  - [ ] Update `README.md` with a Settings section covering model overrides and Cloudflare Access allowlist usage
  - [ ] Add or update `docs/cloudflare-access.md` with email allowlist workflow, where to paste it in Cloudflare Access, and how it ties to `deepsearches.app`
  - [ ] Add or update `docs/settings.md` describing each setting and the model‑role mapping table
  - [ ] Verify docs match the UI labels and storage keys (acceptance criteria)
