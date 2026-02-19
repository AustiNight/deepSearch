# Universal Settings Sync

**Identity And Auth**
Universal settings are tied to the Cloudflare Access identity presented to the worker. Requests must include `Cf-Access-Authenticated-User-Email` and `Cf-Access-Jwt-Assertion`. The email header is used as the per-user storage key.

**Storage Model**
Settings are stored in Cloudflare KV under `SETTINGS_KV` using the key format `user_settings:<sha256(email)>`. Each record contains the settings payload (no allowlist, no keys) plus metadata for conflict detection. The Access email is hashed before storage to avoid PII in KV keys.

**Settings Schema**
Schema version: `1`

Fields
- `schemaVersion` (number)
- `provider` (`google` or `openai`)
- `runConfig` (object)
- `modelOverrides` (object)

RunConfig fields
- `minAgents`
- `maxAgents`
- `maxMethodAgents`
- `forceExhaustion`
- `minRounds`
- `maxRounds`
- `earlyStopDiminishingScore`
- `earlyStopNoveltyRatio`
- `earlyStopNewDomains`
- `earlyStopNewSources`

**Versioning Strategy**
The `schemaVersion` value is required. Unknown versions are rejected by the worker. The client normalizes missing fields to defaults before saving.

**Conflict Handling**
The worker maintains `updatedAt` and `version` for each settings record. Clients must send `expectedUpdatedAt` or `expectedVersion` on update. If the stored version has changed, the worker responds with `409` and returns the latest settings for review.

**Source Of Truth Rules**
- Server settings are authoritative when the cloud endpoint is reachable.
- Local storage is used as a fallback when the cloud endpoint is unavailable.
- If a conflict occurs, the server copy wins after the user loads the latest cloud settings.

Example scenarios
- Device A saves settings, Device B reloads and receives Device A changes from the server.
- Device A saves offline and the cloud is unreachable. Local settings apply until a successful cloud sync.
- Device A saves while Device B also updates. Device A receives a conflict and must load the newer cloud settings before retrying.

**Migration From Local Storage**
If the cloud record is missing and local storage contains settings, the client performs a one-time import. The migration flag is set only after a successful cloud write. If migration fails, the client keeps local settings and retries later.

**Storage Governance**
Retention is indefinite unless manually cleared. Payloads are capped at 50 KB. KV records exclude PII (no email allowlists, no access emails) and never store API keys. Worker logs record update events and version numbers without persisting PII.
