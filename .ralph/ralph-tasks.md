# Ralph Tasks

- [ ] Epic: Fix default LLM models returning 0 sources
  - [ ] Reproduce with each default model in Settings (OpenAI + Gemini) and capture which provider/model pairs return empty sources
  - [ ] Trace source extraction paths for both providers (OpenAI Responses + Gemini generateContent) and verify the `sources` payload is populated end‑to‑end
  - [ ] Audit web search tool usage and source parsing to ensure citations/sources are surfaced (e.g., annotations, `web_search_call`, Gemini candidates)
  - [ ] Add guardrails: if a provider returns text without sources, attempt a fallback retrieval path or provide a clear diagnostic message
  - [ ] Add a deterministic fixture test (mock provider responses / fixed web-search fixture) that verifies non‑empty sources for default models on a stable topic
  - [ ] Acceptance: running a default model search returns >0 sources for a stable test topic and logs sources in the report UI

- [ ] Epic: Always-available “New Search” reset button
  - [ ] Add a persistent “New Search” control in the primary UI (visible even during errors or ongoing runs)
  - [ ] On click, reset run state (agents, logs, report, findings, progress flags) and cancel any in‑flight run safely using explicit abort semantics
  - [ ] Add a regression test to ensure no further logs or streaming updates appear after a reset
  - [ ] Ensure the reset does not clear saved settings or API keys
  - [ ] Acceptance: user can abort or recover from any state by clicking “New Search” and immediately start a fresh run

- [ ] Epic: Universal settings sync (cross-device) + Save behavior
  - [ ] Verify current Save behavior and identify why the dialog remains open
  - [ ] Ensure Save persists settings and closes the modal on success
  - [ ] If Save fails, keep the modal open and show a clear error status
  - [ ] Define the identity provider and auth mechanism for universal settings (e.g., Cloudflare Access email) and document the data model
  - [ ] Implement read/write endpoints to persist settings (provider, model overrides, run config, allowlist text, etc.)
  - [ ] Update the UI to load settings from the universal store on startup and save on “Save Configuration”
  - [ ] Add conflict handling (updatedAt/version) and fallback to localStorage if the remote store is unavailable
  - [ ] Define source‑of‑truth rules (server vs local) on conflict and document expected behavior
  - [ ] Add storage governance: retention, quotas, and audit/logging guidelines (no secrets)
  - [ ] Ensure secrets (API keys) are never stored or transmitted to the server; only non‑secret settings are synced
  - [ ] Acceptance: Save closes the dialog on success, and changes made on one device are reflected on another device after reload

- [ ] Epic: Redesign Transparency Map as a normalized table
  - [ ] Replace the current scaled layout with a 100% scale, full‑width normalized table
  - [ ] Table columns must include: `Vertical`, `Blueprint Fields`, `Subtopics`, `Methods/Tactics`, `Seed Query`, `Hint Rules`
  - [ ] Render one row per vertical; use bullet lists within cells that contain multiple values
  - [ ] Add sticky table headers for readability and ensure the table is responsive across common aspect ratios
  - [ ] Define performance constraints (expected row count, virtualization threshold) and optimize rendering accordingly
  - [ ] Ensure light/dark styling and print‑friendly output with readable contrasts
  - [ ] Acceptance: Transparency Map displays all verticals in a structured table with clear headers and bullet‑list cells at 100% scale

- [ ] Epic: Update documentation and release notes for UI/search changes
  - [ ] Document the New Search reset behavior and universal settings sync in `README.md` and `docs/settings.md`
  - [ ] Document the updated Transparency Map layout and any performance limits in `docs/vertical-logic.md` or a dedicated doc
  - [ ] Acceptance: docs reflect new UI behavior and sync semantics
