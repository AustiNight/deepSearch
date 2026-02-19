# Cache Migration + Backfill Plan (Reports + Dataset Index)

## Scope
This plan covers schema changes that impact:
- Cached reports (any persisted `FinalReport` or `PropertyDossier` output stored outside in-memory run state).
- The open-data dataset index stored in `localStorage` (key `overseer_open_data_index`).

Current run state is in-memory only. If report caching is introduced (localStorage, KV, or other persistence), it must follow this plan.

## Versioning Rules
1. Every cached report payload must include `schemaVersion` and `propertyDossier.schemaVersion`.
2. Every dataset index payload must include `schemaVersion` (`OpenDatasetIndex.schemaVersion`).
3. Any breaking schema change requires a schema version bump and a migration decision (transform or invalidate).
4. Unknown schema versions must be treated as incompatible and must not be trusted.

## Cached Reports Plan
### Storage Envelope
Persist cached reports as a versioned envelope with mandatory metadata:
- `schemaVersion` (report schema version)
- `propertyDossierSchemaVersion`
- `createdAt` (ISO timestamp)
- `topicHash` (hashed topic/address input, no raw PII)
- `report` (the cached `FinalReport`)
- `sourcesDigest` (hash of source list for staleness detection)

### Migration Strategy
1. Backward-compatible change:
   - Provide a migration function that adds new optional fields with defaults.
   - If a field is now required, mark report `stale` and schedule regeneration.
2. Breaking change:
   - Invalidate the cache (new storage key suffix or clear incompatible entries).
   - Require regeneration on next access.

### Backfill Steps
1. On load, scan cached entries.
2. If `schemaVersion` or `propertyDossierSchemaVersion` is older:
   - Attempt `migrateReportCacheVnToVnPlus1` when defined.
   - If migration fails or is not defined, mark entry `stale` and drop it.
3. Rebuild stale entries by re-running synthesis and re-populating `PropertyDossier`.
4. Enforce privacy: never store raw address strings, only hashed keys.

### Failure Handling
- If regeneration fails, drop the cache entry and surface a retry prompt in the UI.
- Log only hashed identifiers and schema versions (no PII).

## Open Dataset Index Plan
### Migration Strategy
1. `loadOpenDatasetIndex` must read `schemaVersion` from storage.
2. If `schemaVersion` < current:
   - Attempt `migrateOpenDatasetIndexVnToVnPlus1` for additive changes.
   - For incompatible changes, discard and rebuild via discovery crawl.
3. If `schemaVersion` > current:
   - Treat as incompatible and return an empty index to avoid stale data.

### Backfill Steps
1. For migrated entries with missing fields (license, terms, access constraints):
   - Re-fetch metadata using the portal provider endpoints.
2. For datasets with unknown portal types or invalid URLs:
   - Mark `complianceAction=review` and keep the entry, but exclude from evidence recovery.
3. For stale datasets:
   - Re-check `lastUpdated` and update `retrievedAt`.

## Operational Checklist (When Schema Changes)
1. Bump the relevant schema version constant.
2. Add a migration function or explicit invalidation rule.
3. Add unit tests for migration, including an old-schema fixture.
4. Update this plan and release notes.
5. Verify backfill via a local run with pre-change cached data.

## Testing + Verification
- Fixture tests for at least one previous schema version.
- Validation checks that required fields exist after migration.
- Telemetry counters for migrations, invalidations, and backfills.

## Observability
- Record counts of migrated vs invalidated entries in run logs (no PII).
- Surface a warning banner in the UI if a cached report was invalidated.
