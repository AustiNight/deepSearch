# Open Data Portal Integration

## Zero-Cost Mode
- Default behavior uses public, anonymous endpoints.
- Socrata SODA defaults to v2 `/resource/{id}.json` unless a token is available and v3 is explicitly requested.
- SODA endpoint construction is RAG-backed; v3 endpoints are only chosen when opt-in + app token are present.
- Providers that require paid access are skipped and surfaced as `DataGap` entries.
- Compliance gates block datasets with restrictive licenses/terms or stale updates.

## Optional Tokens (Never Required)
- Socrata app token (`X-App-Token`) improves rate limits but is optional.
- ArcGIS API key (`token` query param) is optional and used only when provided.

## Providers
- Socrata: discovery via `https://api.us.socrata.com/api/catalog/v1` with `search_context={domain}` (EU domains use `api.eu.socrata.com`), metadata via `/api/views/{id}.json`, data via `/resource/{id}.json` (v2) or `/api/v3/views/{id}/query.json` (v3).
- ArcGIS: discovery via `/sharing/rest/search`, item metadata via `/sharing/rest/content/items/{id}`, layer queries via `{layerUrl}/query` with `outSR=4326`.
- DCAT: catalog ingestion from `data.json`/`catalog.json`, distributions fetched via `accessURL`/`downloadURL`.

## Same-Origin Routing
- Frontend calls route through `/api/open-data/fetch` to enforce same-origin API usage.
- The worker proxy forwards requests to public open-data endpoints and does not persist any request data.

## Spatial Queries
- All geometry queries normalize to EPSG:4326.
- Server-side queries are preferred; local spatial joins are capped at 500 features.

## Geocoding Defaults
- Default geocoding uses Nominatim with strict rate limiting (1 req/sec) and local caching.
- Include a contact email when available to comply with Nominatim usage guidance.

## Auto-Ingestion
- `autoIngestOpenDataPortals` supports triggered or scheduled ingestion.
- Dataset fields and distributions are cached in the local index for method discovery and evidence recovery hints.

## Budgets + Caching
- Cache TTLs are tuned to reduce external calls within run-level budgets (`MAX_EXTERNAL_CALLS_PER_RUN` / `RUN_TOTAL_TIME_BUDGET_MS`).
- Index TTL and portal recrawl cadence are enforced in `services/openDataDiscovery.ts`.

## RAG Index Storage
- Storage strategy: in-memory only (no KV cache) to preserve zero-cost constraints.
- Size limits: index caps at 2,500 chunks with a 1.5M total character budget and 8,000 chars per chunk.
- Eviction behavior: extra chunks are dropped once limits are hit; the index rebuilds on worker restart.
