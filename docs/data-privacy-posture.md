# Data Privacy Posture (Address Inputs & Logs)

This policy defines how address inputs are handled as sensitive data (PII) in the client app, with a focus on logging and retention.

## Scope
- Applies to address-like topics detected via `isAddressLike` (street + number or ZIP).
- Treats raw addresses, normalized variants, and derived parcel identifiers as sensitive.

## Handling Rules
- **In-memory only for runs**: address inputs are used to drive queries and report generation during a run, but are not persisted by default.
- **Log redaction**: UI run logs replace any detected address strings with `[REDACTED_ADDRESS]`.
- **Evidence recovery cache**: disabled for address-like topics (no cached text/sources in `localStorage`).
- **Debug raw synthesis**: raw model output stored in `sessionStorage` is disabled for address-like topics.
- **No server-side persistence**: address inputs are not sent to any storage endpoint outside the configured LLM providers and open-data portals.

## Retention & Storage
- **Run state** (agents, logs, report) is in-memory only and cleared on **New Search** or reset.
- **Session storage** (raw synthesis debug data) is scoped to the browser tab and cleared on tab close; for address-like topics it is not written.
- **Local storage** evidence recovery cache (non-address topics only) is capped and TTL-based (7 days). Keys are hashed and do not store raw queries.

## Logging Guidance
- Avoid printing full addresses in console output, telemetry, or persisted logs.
- If troubleshooting is required for address-like topics, capture only redacted excerpts.

## Notes
- This policy does not alter the report content itself; it limits storage and logging of sensitive inputs.
- Future telemetry collection must follow the same redaction and retention constraints.
