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

**Schema Versions (Current)**
- `overseer_settings_metadata_v1` schema `1`.
- `overseer_open_data_auth_v1` schema `1`.
- `overseer_open_data_persist_v2` schema `1` with consent version `1`.
- `overseer_open_data_settings_v2` schema `1`.
- `overseer_open_data_index` schema `1`.
- `overseer_geocode_cache_v1` (entry timestamps + TTL enforced; not versioned).
- `overseer_evidence_recovery_cache_v2` (entry timestamps + TTL enforced; not versioned).
- `overseer_dallas_schema_cache_v1` (entry timestamps + TTL enforced; not versioned).

**Migration Procedure**
1. Bump the schema version constant in `services/storagePolicy.ts` for the affected record.
2. Add a migration entry in the corresponding `*_MIGRATIONS` array to transform from the previous version to the new version.
3. Update `docs/storage-policy.md` with the new schema version and a summary of the transformation.
4. If a safe transform is not possible, return `null` from the migration and let the loader invalidate the record (it will be removed and re-created on next write).
5. Add or update tests in `scripts/storage-policy.test.mjs` to cover the old-schema fixture and the expected output.

**Downgrade and Cleanup**
- Downgrades intentionally invalidate unknown schema versions. If a record's `schemaVersion` is higher than the current version, it is removed and re-created on the next write.
- To downgrade to a build before `storagePolicy.ts`, remove these keys to avoid stale reads: `overseer_open_data_auth_v1`, `overseer_open_data_settings_v2`, `overseer_open_data_persist_v2`, `overseer_open_data_index`, `overseer_geocode_cache_v1`, `overseer_evidence_recovery_cache_v2`, `overseer_dallas_schema_cache_v1`.
- If a downgrade targets a specific schema rollback, remove only the affected key(s) and keep unrelated caches intact.

**Legacy Keys and Migration Behavior**
- `overseer_open_data_config` (localStorage): legacy combined open-data config. On migration, split into `overseer_open_data_auth_v1` (sessionStorage, auth only when present) and `overseer_open_data_settings_v2` (localStorage), then remove this key.
- `overseer_open_data_config_session` (sessionStorage): same as above, then remove this key.
- `overseer_open_data_persist` (localStorage): legacy boolean persistence flag. Replaced by `overseer_open_data_persist_v2` consent record; remove legacy key without data carryover.
- `overseer_settings_updated_at`, `overseer_settings_updated_by`, `overseer_settings_version`, `overseer_settings_local_updated_at` (localStorage): legacy settings metadata. Migrated into `overseer_settings_metadata_v1` and legacy keys are removed.

**Legacy Cleanup Checklist**
- Safe to remove when troubleshooting legacy carryover: `overseer_open_data_config`, `overseer_open_data_config_session`, `overseer_open_data_persist`, `overseer_settings_updated_at`, `overseer_settings_updated_by`, `overseer_settings_version`, `overseer_settings_local_updated_at`.

**Test Strategy**
- Unit tests (`scripts/storage-policy.test.mjs`) run in Node with in-memory storage mocks that emulate `localStorage`/`sessionStorage`. These cover:
- Optional key persistence rules (session-only by default, localStorage only with explicit consent).
- Cache TTL pruning, size caps, and schema migration behavior.
- Guardrails that block disallowed writes and enforce schema version invalidation.
- Integration coverage stays in the browser/UI layer to confirm settings flows, migrations, and persistence toggles behave end-to-end.
- Worker constraints: no storage policy code is executed in Workers because Workers lack `localStorage`/`sessionStorage`; Worker tests should assert client-only usage and zero server-side persistence of optional keys.
