**Storage Policy**
This project centralizes client storage behavior in `services/storagePolicy.ts` to enforce guardrails and keep all storage writes in one place.

**Data Classes and Tiers**
- Settings metadata, run config, model overrides, allowlist, open-data settings, SLO history, knowledge base: `localStorage` (non-secrets).
- Optional open-data keys: `sessionStorage` by default, `localStorage` only after explicit consent.
- Caches (open-data index, geocode cache, evidence recovery cache): `localStorage` with TTL and size limits.
- Raw synthesis debug: memory-only with truncation.

**Client-Only Guardrail**
- Storage policy is client-only and does not write to Worker/KV or any network destination.

**Opt-Out Behavior**
- Disabling persistence after it was enabled clears optional keys from both localStorage and sessionStorage.

**Migrations**
- Legacy open-data config is split into non-secret settings + optional keys, and legacy localStorage entries are removed.
- Optional open-data keys are moved from legacy localStorage into sessionStorage on first load.
- Settings metadata migrates from legacy per-key storage into a versioned record.

**Downgrade and Cleanup**
- If downgrading to a build before `storagePolicy.ts`, remove `overseer_open_data_auth_v1` and `overseer_open_data_settings_v2` to avoid stale reads.
- Legacy keys that can be safely cleared when troubleshooting: `overseer_open_data_config`, `overseer_open_data_config_session`, `overseer_open_data_persist`.

**Test Strategy**
- Unit-level tests with storage mocks live in `scripts/storage-policy.test.mjs`.
- These verify optional key persistence rules, cache TTL pruning, and size caps.
- Integration coverage relies on existing UI/system tests; no Worker storage usage is permitted because Workers lack `localStorage`.
