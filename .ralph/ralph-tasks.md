# Ralph Tasks

- [ ] Epic: Implement CI/CD allowlist sync (Worker → Access policy)
  - [ ] Replace the stubbed Worker fetch in `.ralph/CICD.sh` with a real `curl` to `ALLOWLIST_ENDPOINT` using Access service token headers (`CF-Access-Client-Id`, `CF-Access-Client-Secret`)
  - [ ] Parse Worker response and enforce required fields (`entries`, `updatedAt`); fail fast on invalid JSON or missing fields
  - [ ] Add robust HTTP error handling: timeouts, retries/backoff, `--fail`, and non‑zero exits on network/HTTP failures
  - [ ] Enforce stale‑write protection: compare `updatedAt` against `ALLOWLIST_EXPECTED_UPDATED_AT` (or `ETag` if provided) and exit non‑zero on mismatch
  - [ ] Fetch current Cloudflare Access policy before updating, validate the shape, and merge deterministically to preserve non‑email include/exclude/require blocks
  - [ ] Define concurrency precedence (`ETag`+`If-Match` vs `updatedAt`) and enforce it consistently in the update flow
  - [ ] Add a preflight permission check for `CF_API_TOKEN` and required IDs, with a clear failure message
  - [ ] Validate entries are valid emails before building the payload; log only counts and domain summaries
  - [ ] Define rollback/abort behavior if policy update fails mid‑run (abort only, or restore from snapshot)
  - [ ] Replace the Access policy update stub with a real `PUT` to the Cloudflare Access policy API using `CF_API_TOKEN` and the account/app/policy IDs
  - [ ] Emit safe summary output (entry count + domain summary), never printing full emails or secrets
  - [ ] Acceptance: CI/CD script fetches the allowlist from the Worker, updates the Access policy, and exits non‑zero on stale or failed updates

- [ ] Epic: Add an automated smoke test for allowlist endpoint + UI sync contract
  - [ ] Add a script (e.g., `scripts/allowlist-smoke.mjs`) that:
    - [ ] Calls `GET /api/access/allowlist` via `ALLOWLIST_ENDPOINT` and validates `entries`, `updatedAt`, and `count`
    - [ ] Optionally performs a `PUT` update when `ALLOWLIST_SMOKE_UPDATE=1` using `expectedUpdatedAt` to verify optimistic concurrency
    - [ ] Sends Access service token headers (`CF-Access-Client-Id`, `CF-Access-Client-Secret`) when updating
    - [ ] Emits a concise pass/fail summary without logging emails or secrets
  - [ ] Add an `npm` script entry (e.g., `allowlist:smoke`) and document required env vars in the script header
  - [ ] Add timeouts and explicit non‑zero exit codes for network/HTTP failures in the smoke test
  - [ ] Wire `allowlist:smoke` into CI with a read‑only default (GET‑only) and a gated update mode
  - [ ] Acceptance: running the smoke test with required env vars returns success on valid GET and fails on stale `expectedUpdatedAt`
