# Ralph Tasks

## Guardrails (Non-Negotiable)
- Zero-cost default stack (no paid services required to run)
- Frontend hosted on GitHub Pages
- API hosted on Cloudflare Worker + KV
- Same-origin API via `https://deepsearches.app/api/*`
- No secrets committed to repo
- Changes must not require user approvals to proceed

- [x] Epic: Settings UI for Optional Open-Data Keys
  - [x] Add a Settings UI section that lists optional keys (Socrata app token, ArcGIS API key, optional geocoding key if supported) with clear “not required” language
  - [x] Explain zero-cost mode defaults and what improves with keys (rate limits, reliability, throughput) without changing core functionality
  - [x] Link to public setup instructions for each optional key and summarize required fields/format
  - [x] Add validation messaging that treats missing keys as “OK” and only warns about rate limiting
  - [x] Add telemetry-free local UI hints that keys are stored securely and never required for baseline operation
  - [x] Review UI copy to explicitly disclose keys remain client-only and are never sent to Worker/KV
  - [x] Gate Settings UI persistence toggle on Storage Policy module wiring (no toggle exposure before policy enforcement)
  - [x] Acceptance: Settings UI clearly indicates optional keys are not required, the app functions without them, keys never leave client storage or sync to Worker/KV, the persistence toggle is default-off and requires explicit consent, and adding keys improves scalability only

- [x] Epic: Transparency Map Scaling + Auto-Updates
  - [x] Set Transparency Map default scale to 80% (CSS transform or layout scaling) without affecting readability or responsiveness
  - [x] Ensure the scaled map maintains legible typography and column alignment across mobile/tablet/desktop breakpoints
  - [x] Implement an auto-update mechanism for the Transparency Map that re-renders whenever taxonomy/blueprint/vertical/method/tactic sources change
  - [x] Add a single source of truth for Transparency Map data (derived from taxonomy + settings) and recompute on load, settings save, and taxonomy updates
  - [x] Define update triggers and performance budget (event sources, debounce/throttle rules, max recompute time)
  - [x] Define and implement a map invalidation event contract (settings save, taxonomy fetch completion, blueprint updates)
  - [x] Add tests or assertions for each update trigger to prevent silent drift
  - [x] Add a lightweight integrity check to verify the map includes all known verticals/subtopics and flags missing items
  - [x] Acceptance: Transparency Map renders at 80% scale by default and stays current when new verticals/methods/tactics are added without manual edits

- [x] Epic: Storage Policy Layer + Migration
- [x] Define a centralized storage policy module (e.g., `services/storagePolicy.ts`) that governs where each data class may be stored (memory, sessionStorage, localStorage)
  - [x] Codify data classes and policies: settings metadata, run config, model overrides, allowlist, optional keys, open-data index, geocode cache, evidence recovery cache, KB, SLO history, raw synthesis debug
  - [x] Enumerate legacy storage keys and expected migration/purge behavior per key
  - [x] Enforce default storage tiers: optional keys -> sessionStorage (default), non-secrets -> localStorage, sensitive run data -> memory only
  - [x] Add TTL and size limits in the storage policy for caches (open-data index, geocode cache, evidence recovery cache)
  - [x] Add schema versioning + migration hooks for storage entries (especially open-data index and settings metadata)
  - [x] Add one-time migration: move existing optional keys from localStorage to sessionStorage on first load under new policy
  - [x] Delete legacy localStorage key entries after migration to prevent lingering sensitive data
  - [x] Add opt-out behavior: purge optional keys from all storage when persistence is disabled
  - [x] Version and document migration steps, including downgrade/cleanup paths for legacy entries
  - [x] Add a client-side guard that prevents keys from being persisted to localStorage unless explicitly opted in
  - [x] Add tests/asserts that block optional key writes to localStorage unless opt-in is explicitly set
  - [x] Add a settings UI toggle to allow optional key persistence (default-off, warnings + explicit consent, re-consent on schema version bump)
- [x] Migrate existing storage calls in `App.tsx`, `hooks/useOverseer.ts`, and `services/*` to use the storage policy module
  - [x] Ensure storage policy enforces same-origin API + no secret exfiltration (keys never leave client, no KV writes)
  - [x] Add tests for storage policy enforcement (keys default to sessionStorage, caches respect TTL, and disallowed writes are blocked)
  - [x] Define test strategy for storage policy (unit vs integration, storage mocks, and Worker constraints)
  - [ ] Acceptance: all storage reads/writes route through the policy module; keys are never persisted server-side; defaults align to zero-cost guardrails

- [x] Epic: Same-Origin + Telemetry Safeguards
  - [ ] Add runtime/assert or lint rule that fails on any non-`/api/*` fetch in frontend code, including RAG endpoints
  - [ ] Add tests that verify same-origin enforcement for client API calls and RAG endpoints
  - [ ] Add Worker-side outbound allowlist that blocks external fetches beyond approved public APIs (or none) and logs violations safely
  - [ ] Add telemetry/logging redaction guard that blocks or strips keys, addresses, and token-like query fragments from any payloads
  - [ ] Add shared redaction utility used by both frontend and Worker logging/telemetry paths
  - [ ] Add tests that ensure Worker logs and telemetry never contain secrets or address PII
  - [ ] Add tests that ensure telemetry/logging never contains secrets or address PII
  - [ ] Add production routing validation for GitHub Pages → Worker API path mapping (CORS, path routing, and local dev parity)
  - [ ] Define concrete routing validation steps (smoke test or config check) without requiring approvals
  - [ ] Define test strategy for same-origin and telemetry safeguards (lint, unit, and integration coverage)
  - [ ] Add CI gating for same-origin and storage policy tests (minimum unit coverage)
  - [ ] Acceptance: all client fetches are same-origin, and telemetry/logs are free of keys, addresses, or tokens

- [x] Epic: Secret Scanning + History Scrub
  - [ ] Verify CI already runs secret scanning; if missing, add CI secret scan with clear allowlist policy
  - [ ] Add pre-commit secret scan hook to block known key patterns and large sensitive blobs
  - [ ] Add a documented history-scrub procedure for accidental secret commits (local-only, no secrets in repo), and wire it into incident response steps
  - [ ] Add tests or CI checks to ensure secret scanning is enforced on PRs
  - [ ] Acceptance: secret scanning runs in CI and pre-commit, and a documented history-scrub procedure exists and is validated

- [x] Epic: Address-First Evidence Enforcement (Property Reports)
  - [ ] Implement a section-level evidence gate that blocks “Governance” and “Economy” sections from using macro-scale sources when address/parcel evidence is missing; instead, render a `DataGap` with specific portal/endpoint pointers
  - [ ] Add an “address evidence minimum” checklist for property reports: CAD/assessor OR tax roll, permits/BOA/case logs, police incident/311 signals if available, zoning/land-use layer, and parcel geometry
  - [ ] Enforce address/parcel-first sourcing order in method discovery: address/parcel datasets → jurisdictional records → neighborhood/tract → city/metro context (context must be labeled as non-local)
  - [ ] Add a report-level “Scale Compatibility” check that downgrades confidence if any section relies on citywide data without a parcel/neighborhood bridge dataset
  - [ ] Update golden tests/snapshots and UI messaging to reflect new `DataGap` outcomes from enforcement changes
  - [ ] Gate Dallas-specific enforcement tests to run only after the Dallas Evidence Pack is implemented
  - [ ] Add tests with a known address that fail if the report uses only macro sources without parcel-level evidence
  - [ ] Acceptance: for an address input, the report either (a) includes parcel/address evidence for governance/economy sections, or (b) explicitly marks those sections as `DataGap` and excludes macro-only claims from the verdict

- [x] Epic: Dallas Address Evidence Pack (Socrata + CAD)
  - [x] Add a Dallas-specific evidence pack that uses Socrata Discovery + SODA to locate and query “Police Incidents” and tabular “311 Service Requests” datasets using address variants and pre‑2023 date filters
  - [x] Implement address variant generation for Socrata queries (e.g., `819 S VAN BUREN AVE`, `819 S VAN BUREN`, `819 VAN BUREN`) and add a fallback to geocoded radius if string match fails
  - [x] Add a dataset shape detector that rejects non‑tabular map layers and automatically searches for tabular alternatives via Discovery results
  - [x] Add a CAD/assessor lookup path for Dallas (appraisal district / tax assessor) and map parcel IDs into the report as primary governance keys
  - [x] Cache dataset schemas and field mappings for Dallas datasets to stabilize queries across schema drift
  - [x] Add schema drift handling: if Dallas dataset fields change, return a `DataGap` with dataset IDs and query attempts
  - [x] Define PII handling for incident/311 datasets (field allowlist, redaction rules, retention limits, and safe-display policy)
  - [x] Acceptance: for the test address, the system can surface at least one address‑tied police incident or 311 record when present, or explicitly mark those datasets as unavailable with the exact dataset IDs and query attempts logged

- [x] Epic: Report Cleanliness & Validation Output
  - [ ] Separate “Method Audit” into a collapsible methodology section; keep the main report focused on address‑level findings and data gaps
  - [ ] Add UI/UX handling for `DataGap` sections created by enforcement changes, with explicit labels and suppression of “Overseer Verified”
  - [ ] Add a citation-quality check that flags sections with “No verified sources” and prevents them from being labeled “Overseer Verified”
  - [ ] Update golden tests/snapshots for report-cleanliness changes to avoid regressions
  - [ ] Acceptance: report renders without `[object Object]`, the main narrative is address‑focused, method details are separated, and all sections either carry verified citations or are marked as data gaps

- [x] Epic: Discovery + SODA RAG Integration for Agent Guidance
  - [ ] Register the Socrata RAG artifacts in-repo as first-class references (Discovery API + SODA API): `docs/Discovery_API.rag.json`, `docs/Discovery_API.rag.chunks.jsonl`, `docs/Discovery_API.rag.endpoints.jsonl`, `docs/Discovery_API_2.rag.json`, `docs/Discovery_API_2.rag.chunks.jsonl`, `docs/Socrata.rag.bundle.jsonl`, `docs/Socrata.rag.index.json`
  - [ ] Add a RAG loader/indexer that can read `docs/Socrata.rag.bundle.jsonl` locally (no external vector DB), build a lightweight in-memory index (BM25/TF-IDF by default; embeddings only if pre-existing, local, offline, and free), and expose query APIs to agents via the same-origin API
  - [ ] Add a build/refresh command (script + `package.json` entry) to regenerate RAG artifacts from source docs using `scripts/parse_discovery_api.py`, and ensure it never pulls remote data or requires secrets
  - [ ] Add a retrieval utility that filters by `doc_id` and `source_file` to enable targeted lookup (e.g., discovery-only vs SODA-only)
  - [ ] Update method-discovery / search-planning prompts to explicitly consult the Socrata RAG before composing discovery queries or SODA requests; require citing the exact parameter rules and endpoint format from RAG
  - [ ] Add a query-planning helper that uses RAG to fill in required Discovery API parameters, valid filters, and pagination semantics; reject unknown params unless explicitly supported in RAG
  - [ ] Add a SODA endpoint constructor helper that uses RAG to choose correct endpoint paths (v2 vs v3), and document zero-cost default behavior (anonymous mode + optional app token)
  - [ ] Add an explicit guardrail: forbid external embedding APIs or paid vector DBs; retrieval must remain zero-cost and local
  - [ ] Add a build-time or test-time guard that fails on any non-local embedding or vector client dependency
  - [ ] Decide RAG index storage strategy (in-memory vs KV cache), set size limits/eviction, and align with zero-cost constraints
  - [ ] Add a validation step: if a dataset is non-tabular or requires auth/token, record a `DataGap` and select fallback datasets or skip with explanation
  - [ ] Add usage telemetry (local only, no external send) to track which RAG chunks are used and whether they improved discovery success
  - [ ] Route RAG telemetry through the shared redaction utility and add tests ensuring no address/keys/tokens appear in telemetry
  - [ ] Add unit tests for RAG ingestion (parsing, indexing, retrieval) and for query planning using the RAG (e.g., `categories`, `domains`, `tags`, `limit`, `order`)
  - [ ] Add a small “Developer Reference” panel (read-only) that can surface the relevant RAG snippet for the current query context without exposing secrets
  - [ ] Ensure Developer Reference panel fetches data via `/api/*` only (no direct file fetches)
  - [ ] Acceptance: when running discovery planning, the system demonstrates it can retrieve the relevant RAG chunk for a parameter/endpoint, uses it to build valid queries, and avoids unsupported parameters; SODA endpoint construction follows RAG-defined formats; all calls remain same-origin and zero-cost by default

## Dependency Order

- Implement Storage Policy Layer + Migration
- Implement Same-Origin + Telemetry Safeguards
- Implement Secret Scanning + History Scrub
- Add UI updates (Settings optional keys after storage policy, Transparency Map scaling)
- Report Cleanliness & Validation Output
- Add Discovery + SODA RAG Integration for Agent Guidance
- Implement Address-First Evidence Enforcement (Property Reports)
- Implement Dallas Address Evidence Pack (Socrata + CAD)
