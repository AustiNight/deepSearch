# Ralph Tasks

- [x] Epic: Define model‑override architecture for OpenAI agent roles
  - [x] Enumerate every OpenAI call site and map each to a distinct agent role (Overseer planning, Method Discovery, Sector Analysis, Deep Research L1/L2, Method Audit, Gap Hunter, Exhaustion Scout, Critique, Synthesis, Validation) in a short design note (e.g., `docs/model-roles.md`)
  - [x] Define a `ModelOverrides` type in `types.ts` with explicit keys per role and optional values (blank = default model)
  - [x] Add a single persisted settings object in localStorage (e.g., `overseer_model_overrides`) that stores the role->model mapping
  - [x] Define precedence rules: UI override > env default (`OPENAI_MODEL_FAST/REASONING`) > service hard default
  - [x] Add a small helper that resolves the model for a role (e.g., `resolveModelForRole(role, overrides, defaults)`)
  - [x] Validate that every OpenAI call site has a named role and a resolved model (acceptance criteria)

- [x] Epic: Implement OpenAI model selector UI in Settings dialog
  - [x] Add a “OpenAI Model per Agent Role” section in the settings UI (likely in `App.tsx`) that is only visible when provider = OpenAI
  - [x] Provide a dropdown or editable select for each role with sensible defaults (e.g., `gpt-5-codex`, `gpt-4.1`, `gpt-4.1-mini`), plus a custom text entry option for advanced models
  - [x] Persist model choices to `overseer_model_overrides` and hydrate them on load
  - [x] Add “Apply to all roles” and “Reset to defaults” controls for fast configuration
  - [x] Add concise help text per role explaining impact and cost/quality tradeoffs (e.g., “Deep Research: more expensive but higher recall”, “Synthesis: reasoning‑heavy; larger model recommended”)
  - [x] Add a fixed-height, scrollable container for the Settings dialog content so all settings are reachable on small screens; ensure the scroll bar is visible and stable
  - [x] Ensure empty/invalid entries fall back to defaults and do not break the run (acceptance criteria)

- [x] Epic: Wire model overrides into OpenAI service calls
  - [x] Update `hooks/useOverseer.ts` to pass `modelOverrides` in `startResearch` run config
  - [x] Update `services/openaiService.ts` to accept optional model overrides for each role and route each call through `resolveModelForRole`
  - [x] Ensure `performDeepResearch`, `generateSectorAnalysis`, `critiqueAndFindGaps`, `synthesizeGrandReport`, and `validateReport` each use the role‑specific override
  - [x] Add minimal logging to confirm resolved model per role at runtime (guarded to avoid noisy logs)
  - [x] Validate that switching a role model in UI changes the model used in the next run (acceptance criteria)

- [x] Epic: Add email allowlist management controls to Settings dialog
  - [x] Add a “Cloudflare Access Allowlist” section to the settings UI with a multi‑line textarea and add/remove controls
  - [x] Normalize and validate email entries (trim, lowercase, remove duplicates; basic email format check)
  - [x] Persist allowlist to localStorage (e.g., `overseer_access_allowlist`)
  - [x] Add “Copy allowlist” button to export a newline‑separated list for Cloudflare Access policy entry
  - [x] Add help text clarifying this is for Access policy configuration (does not enforce client‑side security), with a short example policy snippet
  - [x] Validate that the allowlist is retained across reloads and can be exported cleanly (acceptance criteria)

- [x] Epic: Expand help text for all settings with concrete examples
  - [x] Add inline help text for provider selection, agent caps, exhaustion settings, and the new model/allowlist controls
  - [x] Provide at least one example per setting showing impact (e.g., “Max agents 20 = wider coverage but slower UI”; “Force exhaustion = extra rounds even if critique says complete”)
  - [x] Ensure help text is concise and doesn’t crowd the UI (acceptance criteria)

- [x] Epic: Update repo documentation for new settings
  - [x] Update `README.md` with a Settings section covering model overrides and Cloudflare Access allowlist usage
  - [x] Add or update `docs/cloudflare-access.md` with email allowlist workflow, where to paste it in Cloudflare Access, and how it ties to `deepsearches.app`
  - [x] Add or update `docs/settings.md` describing each setting and the model‑role mapping table
  - [x] Verify docs match the UI labels and storage keys (acceptance criteria)

- [x] Epic: Fix synthesis output to render plain‑English report (not JSON string)
  - [x] Identify where JSON is leaking to the UI (e.g., `ReportView.tsx` rendering raw `finalReport` or raw `__rawText`), and map all code paths that display report content
  - [x] Ensure `synthesizeGrandReport` returns structured data; if parsing fails, convert structured JSON into readable prose sections rather than dumping the JSON string
  - [x] Add a fallback renderer that formats report JSON into human‑readable markdown (Use dynamic sections based on content delivered... some common examples might be Executive Brief, Key Metrics Table, Sector Analysis, Consensus & Conflicts, Bibliography but will differ by vertical)
  - [x] Update validation and error messages so raw JSON is never displayed to end users (log raw JSON to sessionStorage only)
  - [x] Add acceptance check: with a known topic, the report body is plain English prose and not JSON text

- [x] Epic: Correct Person/Entity vertical bias toward “tax assessor/collector roles”
  - [x] Audit the Person/Entity taxonomy and prompt templates to remove/avoid role‑bias language that causes searching for people who *are* tax assessors/collectors rather than searching tax records *about* the named person
  - [x] Update Person/Entity blueprint to explicitly include “property ownership records for the named person” and “appraisal district search for the person’s name”
  - [x] Add targeted tactics that bind the person’s name to property records and appraisal searches (e.g., `\"{name}\" \"property search\" \"appraisal district\"`, `\"{name}\" \"property records\" \"county\"`)
  - [x] Add acceptance check: searching “Jonathan Aulson of Dallas Texas” produces queries that search property records for Jonathan Aulson, not people with assessor/collector job titles

- [x] Epic: Expand Person/Entity property searches to {Primary Location(s)} + {Surrounding Cities and Counties within reasonable search radius based on typical human migration behavior} appraisal districts
  - [x] Add a geo‑expansion rule: when the person query includes a city (e.g., Dallas, TX), include the city’s central appraisal district first, then expand to nearby metros/adjacent counties within a reasonable radius (DFW & surrounding counties for Dallas)
  - [x] Encode {Primary Location(s)} + {Surrounding Cities and Counties within reasonable search radius based on typical human migration behavior} appraisal districts expansion list in the Person/Entity tactics:
    - [x] Determine how to know whether a Location is expected to have a CAD or Tax Assessor-Collector, whether its based on population or other factors, and what other data tools may exist online publicly which allow for a records search for person / entity by name, address, or location and ensure those sources and their notes on use are made visible in the approprate vertical(s) to the search agents
    - [x] Determine based on reliable research what the typical human behavior pattern is for migration over the course of 1, 5, 10, 15, 25, 50, lifetime years and make that information usable by search agents to inform the area in which to search for any vertical involving property ownership based on the span of time involved
    - [x] Encode logic into person and address/property searches that will, when searching for property ownership, search appropriately for either a CAD or Tax Assessor-Collector website or online data tool which allows for searching or finding via name or address or geolocation info, whatever factor is known or guessed about the topic
    - [x] Encode logic into person and address/property searches that will, when expanding a search based on human migration behavior, prioritize the expected result of a CAD vs Tax Assessor-Collector website or online data tool based on the criteria it was previosly discovered to drive such a difference in search modality & information system
  - [x] Compile and document the specific data sources used to derive migration heuristics (e.g., public migration datasets, census/IRS flows, academic sources) and encode the final heuristics into a dedicated doc for agent consumption
  - [x] Translate migration research into a concrete, testable expansion heuristic (e.g., distance tiers by time horizon, state/metro boundaries, cap on county expansion count) and encode it into tactics
  - [x] Add privacy/safety guardrails for property/person searches (avoid doxxing, require public records sources, avoid sensitive data categories) and surface these in the Person/Entity vertical guidance
  - [x] Add tactics that combine the person’s name with each CAD/County site (site‑restricted queries + site search patterns)
  - [x] Add acceptance check: query “Jonathan Aulson of Dallas Texas”triggers Dallas CAD first and then expands to the full DFW CAD or Tax Assessor-Collector website or online data tool as outlined above, including 2023 purchase visibility in Dallas CAD
  - [x] Add acceptance check: query expansion uses the defined heuristic tiers and CAD/Tax Assessor-Collector prioritization logic without relying on external data availability

- [x] Epic: Immediate Cloudflare Access allowlist sync via Worker + KV
  - [x] Add a KV binding for allowlist storage (name it `ACCESS_ALLOWLIST_KV`) in `wrangler.toml`, and include it in the Worker `Env` interface in `workers/worker.ts`
  - [x] Add per-environment KV namespace scaffolding (dev/stage/prod) and document the required `wrangler` bindings and namespace IDs in repo docs/config comments
  - [x] Implement allowlist normalization in the Worker (trim, lowercase, de-dup, basic email validation) matching the UI logic in `App.tsx`, with a safe cap (e.g., 500 entries) and clear validation errors
  - [x] Add a new Worker endpoint `/api/access/allowlist` with:
    - [x] `GET` to return the stored list and metadata (updated timestamp, count)
    - [x] `PUT` or `POST` to accept `{ entries: string[] }`, normalize/validate, persist to KV, then update Cloudflare Access policy
  - [x] Gate the endpoint using Cloudflare Access auth (verify `Cf-Access-Jwt-Assertion` or enforce Access-protected routes) and `Cf-Access-Authenticated-User-Email`, plus optional admin allowlist env var (e.g., `ALLOWLIST_ADMIN_EMAILS`); return 403 if unauthenticated/unauthorized
  - [x] Add optimistic concurrency: `GET` returns `updatedAt`/`version`, `PUT` requires `expectedUpdatedAt` (or `If-Match`) and returns 409 on stale writes
  - [x] Implement Cloudflare Access policy update flow in the Worker using secrets:
    - [x] `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `CF_ACCESS_APP_ID`, `CF_ACCESS_POLICY_ID`
    - [x] Fetch the current policy, locate or create the email-include rule, preserve all other include/exclude/require blocks, and avoid reordering unrelated policy rules
    - [x] Handle Cloudflare API errors, rate limits, and retries (bounded), and never log secrets
  - [x] Return a structured response `{ entries, updatedAt, updatedBy, policyUpdated }` and error messages that are safe for the UI
  - [x] Add server-side logging for success/failure (no PII beyond counts and domain summaries) and store `updatedBy`/`updatedAt` metadata in KV
  - [x] Define CORS expectations and request size limits for browser-originated calls (align with `ALLOWED_ORIGINS` in the Worker)
  - [x] Acceptance: POSTing a valid list updates KV and the Access policy; GET returns the same list and updated timestamp

- [x] Epic: Wire Settings UI to immediate allowlist sync
  - [ ] Add a small API helper that targets the proxy base URL (same approach as `PROXY_BASE_URL` in `services/*Service.ts`) for `/api/access/allowlist`
  - [ ] On Settings Save in `App.tsx`, call the Worker endpoint with the normalized entries and show a clear success/error status near the allowlist controls
  - [ ] On app load (or Settings open), call `GET /api/access/allowlist` to hydrate `overseer_access_allowlist` in localStorage; include `updatedAt` for optimistic concurrency and fall back to localStorage if the fetch fails
  - [ ] If the Worker returns 409 stale update, surface a conflict message and prompt a refresh before resubmitting
  - [ ] Ensure UI never sends or stores any secrets; only the email list is transmitted
  - [ ] Update allowlist copy text to reflect “synced to Cloudflare Access on Save” and surface Worker failure messages
  - [ ] Acceptance: saving the allowlist immediately updates Cloudflare Access and the UI shows a synced status without manual copy/paste

- [x] Epic: CI/CD reconciliation from KV (no secrets in repo)
  - [x] Update `.ralph/CICD.sh` to fetch the allowlist from KV (via Worker `GET /api/access/allowlist`) and use it as the single input for Access policy updates
  - [x] Keep the curl call stubbed with TODOs (no real endpoints or payloads); document required env vars and access assumptions
  - [x] Add a safe diff/summary output (counts + domain summaries) and exit non-zero on stale KV or Access update failures
  - [x] Acceptance: CI/CD script can retrieve the current allowlist from KV and is ready for a safe policy update implementation

- [x] Epic: Documentation for immediate sync + KV source of truth
  - [ ] Update `docs/cloudflare-access.md` to describe: UI Save → Worker → KV → Access policy, plus required Worker secrets and KV binding
  - [ ] Update `docs/settings.md` to note that allowlist is now synced server-side on Save and reconciled by CI/CD
  - [ ] Update `README.md` Settings section to reference the new sync flow and the KV-backed source of truth
  - [ ] Acceptance: docs match UI labels, storage keys, Worker endpoints, and secret names

- [x] Epic: Render markdown tables as responsive data tables in final report
  - [ ] Audit where report markdown is rendered (e.g., `components/ReportView.tsx`, `ReactMarkdown` usage) and identify the exact code path that renders markdown tables today
  - [ ] Select a data table component native to the stack (React + Tailwind/Vite) that is lightweight, supports SSR-safe rendering, prints cleanly, and can be themed for light/dark
  - [ ] Define the exact markdown renderer integration (e.g., `react-markdown` `components` override for `table`, `thead`, `tbody`, `tr`, `th`, `td`) and ensure semantic/a11y requirements (header scopes, captions, readable contrast)
  - [ ] Implement a markdown table renderer that maps markdown table nodes to the data table component (or a table wrapper) with:
    - [ ] Responsive behavior (horizontal scroll on mobile, stacked headers on narrow widths if supported)
    - [ ] Clear print styles (no truncation, legible typography, borders visible, no dark backgrounds)
    - [ ] Light/dark theming aligned with existing design tokens
  - [ ] Add a small test fixture or story (static report mock) that includes a markdown table and verify rendering on mobile/tablet/desktop breakpoints
  - [ ] Acceptance: when a report section includes a markdown table, the UI renders it as a responsive data table that prints legibly and adapts to light/dark modes

- [x] Epic: Add visualization components + prompt guidance for charts/media
  - [x] Survey and select chart/media components that are efficient and well supported by the current stack (e.g., multi-series charts, bar/line/area/pie, images, simple embeds), documenting tradeoffs and bundle size impact
  - [x] Extend the report schema to include a `visualizations` array with `type`, `title`, `data`, `caption`, and `sources`, add schema versioning (or robust fallback) in `types.ts`, and update report rendering to display them
  - [x] Define size limits and safety constraints for visualization data (max series/points, max table rows, image URL validation and length caps, optional allowlist or proxy for external images)
  - [x] Add renderers for at least 3 chart types (e.g., bar/line/area) and 1 media type (image with caption + source attribution), with responsive layouts and light/dark styles
  - [x] Update synthesis prompt(s) to encourage a visualization when the data is best communicated visually, and to emit the correct `visualizations` objects for the chosen components (after schema/rendering are stable)
  - [x] Ensure validations and fallbacks gracefully handle missing or malformed visualization data and unknown types
  - [x] Add a visualization test fixture (static report mock) that exercises chart + image rendering in light/dark and print views across mobile/tablet/desktop breakpoints
  - [x] Acceptance: when the model includes visualization data, the final report renders charts/images using the selected components and remains responsive across mobile/tablet/desktop

- [x] Epic: Map the full public-info surface area (OSINT / OpenData / PI techniques) and wire it into vertical search
  - [ ] Define scope boundaries and phased delivery for the catalog (e.g., Phase 1: US public sources with max N items per category; Phase 2: expand internationally), and document the limits in the catalog output
  - [ ] Build a comprehensive catalog of public internet-accessible information resources and techniques, including (but not limited to):
    - [ ] Government Open Data portals (city/county/state/federal), including 911/311 call datasets, incident logs, EMS/fire calls, code violations, permits, inspections, budgets, and open GIS layers
    - [ ] Public safety and crime data sources, including police blotters, arrest logs, jail rosters, court calendars, and incident dashboards
    - [ ] Property and land records (assessor, appraiser, parcel, GIS, deed/recorder, tax collector)
    - [ ] Business registries, licensing boards, professional licenses, contractor permits, and regulatory filings
    - [ ] Court records (civil/criminal), bankruptcy, liens, judgments, and enforcement actions
    - [ ] FOIA/records request techniques and portals, including how to locate public records request endpoints
    - [ ] Education and institutional records, including school board minutes, district budgets, and campus crime logs (Clery)
    - [ ] Transportation and infrastructure data (transit ridership, traffic incidents, road work, FAA, maritime, rail)
    - [ ] Health and environmental data (public health dashboards, inspections, EPA/State environmental databases)
    - [ ] Social and community signals (neighborhood forums, local news archives, community boards)
    - [ ] Marketplaces and resale listings (e.g., Amazon/eBay/Walmart/Facebook Marketplace/ShopGoodwill) for product ownership signals
    - [ ] OSINT techniques used by private investigators (public records triangulation, address association, identity graphing)
    - [ ] Technologist techniques (OSINT tooling, advanced search operators, reverse image search, domain/host intelligence)
  - [ ] For each catalog item, define: what it is, how it’s accessed, what fields are typically available, and which vertical(s) it supports
  - [ ] Add explicit safety/ethics constraints for OSINT usage (no doxxing, only public records, avoid sensitive categories), and surface these constraints in vertical guidance
  - [ ] For each technique/site that does not map cleanly to existing verticals, propose a new vertical with id/label, blueprint fields, subtopics, tactics, and hint rules
  - [ ] Add a task to update existing verticals to include relevant OpenData / OSINT sources and fields from the catalog
  - [ ] Encode catalog findings into taxonomy tactics and blueprint fields so they are used by the live search workflow (not just documentation)
  - [ ] Add acceptance: every cataloged public resource appears in at least one vertical’s tactics or is captured by a newly proposed vertical

- [x] Epic: Add Reception as a new top-level vertical with correct taxonomy + logic
  - [x] Add a new `reception` vertical to `data/researchTaxonomy.ts` with:
    - [x] Blueprint fields that reflect review/reception coverage (e.g., criticScores, audienceScores, reviewSources, reviewQuotes, sentiment, awards, comparisons, controversy)
    - [x] Subtopics that mirror the provided table row: Review sources (RottenTomatoes/Goodreads/Metacritic/OMDB/Amazon), Thematic Analysis, Production History, Credits/Personnel, Cast, Ending/Plot
    - [x] Tactics for each subtopic, including review aggregators and common review surfaces
  - [x] Add `reception` to the vertical seed query map (e.g., `{topic} review`)
  - [x] Update `inferVerticalHints` to allow `reception` to trigger directly (e.g., review/ratings/critic/sentiment terms) and to be hinted alongside creative_work
  - [x] Update `evaluateVerticalExhaustion` with reception-specific coverage checks (review/ratings/critic/audience/awards keywords)
  - [x] Ensure the selection logic can include `reception` alongside other verticals without discarding it unnecessarily
  - [x] Add tests/fixtures to validate reception hinting, seed query generation, and coexistence with `creative_work`
  - [x] Acceptance: a topic like “The Great Gatsby reviews” selects `reception` and triggers reception tactics; a topic like “The Great Gatsby” can include both `creative_work` and `reception`

- [x] Epic: Update vertical blueprint fields and tactics to match the revised table (and wire into search workflow)
  - [ ] Update blueprint fields per the provided table edits:
    - [ ] Individual: add voter registration; add OpenData search by Locations
    - [ ] Corporation: ensure tech stack includes Github/BuiltWith/StackShare
    - [ ] Product: add Amazon/eBay/Walmart/Facebook Marketplace/ShopGoodwill listings
    - [ ] Location: add actuarial analysis by location/age/risk factor
    - [ ] Event: add historical studies and anthropological discourse; add actuarial analysis by location/age/risk factor
    - [ ] Medical: add homeopathic theories; add actuarial analysis by location/age/risk factor
    - [ ] Legal: add local government OpenData search results by Location; add actuarial analysis by location/age/risk factor
    - [ ] General discovery: add actuarial analysis by location/age/risk factor
  - [ ] Add or update tactics to reflect these new fields (e.g., listings search for product, OpenData/actuarial for location/event/medical/legal)
  - [ ] Ensure slots exist and are populated for any new tactic templates (e.g., `city`, `county`, `state`, `address`, `year`)
  - [ ] Verify that all new fields have supporting tactic coverage so they can appear in sector mapping and agent spawning
  - [ ] Update taxonomy schema/types and any validators so new blueprint fields and tactics are formally supported
  - [ ] Add tests/fixtures that confirm the updated fields/tactics are exercised in the live workflow (seed queries, sector mapping, exhaustion gating)
  - [ ] Acceptance: the updated taxonomy directly affects sector seeds, method discovery, and exhaustion gating in a live run

- [ ] Epic: Fill the vertical logic table and keep it consistent with code
  - [ ] Update the vertical logic table to include missing data for `creative_work` and to add the new `reception` vertical row
  - [ ] Ensure the table’s “Subtopics + example tactic themes” and “Seed Query Template” are sourced from the taxonomy and seed map (single source of truth)
  - [ ] Define the single source of truth for table generation (taxonomy + seed map + hint logic) and implement a generator or snapshot script
  - [ ] Generate the missing cell content for `creative_work` and `reception` so the table is complete and accurate
  - [ ] Add a validation step (script or test) that fails if the table drifts from taxonomy/seed mapping/hint logic
  - [ ] Acceptance: table matches live taxonomy + logic and updates automatically when taxonomy changes

- [ ] Epic: Add a Transparency UI panel for verticals, blueprints, subtopics, tactics
  - [ ] Build a new UI component that is collapsed/hidden by default but accessible to any user (no auth gate)
  - [ ] The component must display all verticals, blueprint fields, subtopics, methods, and tactics in a 16:9 desktop viewport without scrolling
  - [ ] Design layout for dense presentation (multi-column grid, compact typography, clear grouping) with light/dark support and print-friendly styling
  - [ ] Provide a “presentation mode” toggle that formats the view for stakeholder review (no scroll, all content visible, consistent spacing)
  - [ ] Source data directly from the taxonomy/seed logic so the display always matches the live search workflow
  - [ ] Add a layout-capacity check (test or build-time guard) that fails if taxonomy growth would force scrolling, and define a scaling strategy to fit content
  - [ ] Define a fallback policy for taxonomy growth that exceeds layout capacity (e.g., auto-scale typography and column count while preserving full visibility)
  - [ ] Acceptance: on a 16:9 desktop screen, the full transparency panel renders without scroll and includes all verticals/blueprints/subtopics/tactics
