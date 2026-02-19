# Security Review: Key Storage, Logging, and Telemetry Redaction

Reviewed: 2026-02-19

## Scope
This review covers how API keys are stored, how logs handle sensitive data, and how telemetry is redacted before being attached to report provenance.

## Key Storage Review
- Client-side API keys are stored only in browser localStorage (`overseer_api_key_google`, `overseer_api_key_openai`).
- API keys are never included in the universal settings payload sent to the worker. The payload builder strips key fields and tests assert no keys are serialized.
- Worker-side provider keys are stored in Cloudflare Worker environment bindings and are never emitted in responses.

Files reviewed
- `App.tsx` (localStorage handling for key overrides)
- `services/universalSettingsPayload.js`
- `scripts/settings-serialization.test.mjs`
- `docs/settings.md`
- `workers/worker.ts`

Status
- Pass: keys are isolated to client localStorage or worker environment secrets, and are not sent to the server from the client settings flow.
- Residual risk: localStorage is plaintext. Recommended for trusted environments only.

## Logging Review
- Run logs redact address-like inputs using normalized address variants.
- Log messages now redact common API key/token patterns before display.
- Error logging uses redacted messages to avoid leaking secrets into console output or UI logs.

Files reviewed
- `hooks/useOverseer.ts`
- `docs/data-privacy-posture.md`

Status
- Pass: sensitive values are redacted from run logs and error messages.
- Follow-up: if new providers introduce additional key formats, add patterns to the redaction list.

## Telemetry Redaction Review
- Portal error telemetry collects counts and a small sample of endpoints/portal URLs for diagnostics.
- Telemetry now redacts sensitive query parameters (e.g., `api_key`, `token`) from URLs before storing in `runMetrics.portalErrors`.
- Run metrics are attached to report provenance and remain client-side unless explicitly exported.

Files reviewed
- `services/portalErrorTelemetry.ts`
- `services/openDataDiscovery.ts`
- `docs/portal-error-taxonomy.md`

Status
- Pass: portal error telemetry is sanitized for sensitive query parameters.
- Follow-up: if telemetry is ever shipped off-device, apply the same redaction and retention policy at the transport boundary.

## Open Questions
- None identified for the current implementation.
