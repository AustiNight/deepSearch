# Ralph Tasks

## Guardrails (Non-Negotiable)
- Zero-cost infrastructure only: GitHub Pages + Cloudflare Worker/Access free tier; only allowed paid cost is the custom domain (deepsearches.app).
- Strategic objectives cannot change: produce highly detailed, multi-perspective reports with token efficiency vs average AI search prompting; rely heavily on free public data APIs from localities; maintain a search strategy that learns from success.
- Non-goals: frivolous token usage; incurring stack costs beyond what is necessary to deliver strategic value.
- Compliance: no secrets committed to the repo.
- Deployment: no additional constraints at this time (future app marketplace roadmap is not a current requirement).

- [x] Epic: Production OpenAI Key Operations Without Cloudflare Dashboard Login
  - [x] Define and document the canonical secret ownership model for this app: single production `OPENAI_API_KEY` stored in a shared family/designated-proxy password manager vault, with one primary operator and at least one backup operator.
  - [x] Define and document a delegated Cloudflare API-token policy for routine operations (no dashboard login): required env vars `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; token scope limited to the `deepsearch` Worker in the production account; minimum permissions required for `wrangler secret put/list` and deployment inspection; token expiry max 90 days; explicit revocation + replacement procedure.
  - [x] Update `README.md` Cloudflare Worker section to separate routine operations (API token + terminal workflow) from break-glass access (dashboard), and remove `wrangler login` as the default path for secret rotation.
  - [x] Create a runbook at `.ralph/runbooks/openai-worker-secret-rotation.md` with an end-to-end Wrangler-only workflow (no app code changes), including:
    - [x] Preconditions: pinned Wrangler version, token-based auth (not dashboard session), target worker `deepsearch`, and operator identity/ownership checks.
    - [x] Preflight: validate token auth and account context, validate replacement OpenAI key before cutover, and capture a start timestamp for the timed rotation window.
    - [x] Rotation command: `npx wrangler secret put OPENAI_API_KEY --name deepsearch` with explicit instruction to preserve previous key in vault as rollback value before replacement.
    - [x] Verification commands: `npx wrangler secret list --name deepsearch` and `npx wrangler deployments list --name deepsearch`.
    - [x] Deterministic production smoke test command against `https://deepsearches.app/api/openai/responses` with pass/fail criteria: not HTTP 401, no `invalid_api_key` in body, and valid Responses API JSON payload.
    - [x] Rollback procedure: restore previous key via the same `wrangler secret put` flow, re-run verification commands, and re-run deterministic smoke test.
  - [x] Add an incident-response section for invalid/revoked keys with a compliance-safe log template in `.ralph/verification-log.md` that explicitly forbids recording secret values/fragments and requires command outputs, timestamps, and operator identity.
  - [x] Add a post-change compliance step: run `npm run test:secrets` after runbook/doc updates and record the result in `.ralph/verification-log.md`.
  - [x] Add an operational cadence: quarterly key rotation, quarterly backup-operator drill (family/designated proxy), and a named handoff path that proves terminal-only rotation can be completed without Cloudflare UI access.
  - [x] Acceptance: any authorized operator can complete key rotation in under 10 minutes (timed from preflight start to successful smoke test), without app code changes and without Cloudflare dashboard login, with evidence in `.ralph/verification-log.md` showing executed commands, HTTP outcomes, and absence of `OpenAI proxy error 401: invalid_api_key`.
