# Cloudflare Access Deployment Notes

## Purpose
This project is intended to be served at `https://deepsearches.app` (GitHub Pages behind Cloudflare Access). These notes capture the expected Access setup and how to manage the email allowlist from the app UI.

## Cloudflare Zero Trust App Expectations
- Create a Zero Trust Access application for `https://deepsearches.app`.
- Authentication method: One-time PIN via email.
- Policy: email allowlist (no public access).

## Allowlist Sync Workflow (UI → Worker → KV → Access Policy)
The Settings modal provides a **CLOUDFLARE ACCESS ALLOWLIST** section and syncs it on Save when the Worker proxy is configured.

1. Open **SYSTEM_CONFIG** and add emails under **CLOUDFLARE ACCESS ALLOWLIST**.
2. Click **SAVE**. The app calls the Worker endpoint `POST /api/access/allowlist` (relative to `PROXY_BASE_URL`).
3. The Worker normalizes and stores the list in KV (`ACCESS_ALLOWLIST_KV`) and updates the Cloudflare Access policy.
4. A successful response includes the updated list and timestamp.

Notes:
- The allowlist helper is a convenience for policy entry; it does not secure the client app.
- The KV list is the source of truth. CI/CD reconciliation reads from KV and applies policy updates.
- Manual fallback: **COPY ALLOWLIST** still formats the list for Cloudflare Access → Include → Emails in.

## Worker Endpoint Contract
The Worker endpoint is guarded by Cloudflare Access. Requests must include Access headers (`Cf-Access-Jwt-Assertion` and `Cf-Access-Authenticated-User-Email`).

- `GET /api/access/allowlist` returns `{ entries, updatedAt, updatedBy, version, count }` plus `ETag: <updatedAt>`.
- `POST`/`PUT /api/access/allowlist` accepts `{ entries, expectedUpdatedAt }`.
  - If `expectedUpdatedAt` (or `If-Match`) is missing and the KV list already exists, the Worker responds with `428`.
  - If `expectedUpdatedAt` is stale, the Worker responds with `409` and the current list/metadata.

## Required Worker Bindings and Secrets
Configure these in `wrangler.toml` and the Worker environment:

- KV binding: `ACCESS_ALLOWLIST_KV`
- Optional admin allowlist: `ALLOWLIST_ADMIN_EMAILS` (comma-separated emails)
- Access policy update secrets:
  - `CF_API_TOKEN`
  - `CF_ACCOUNT_ID`
  - `CF_ACCESS_APP_ID`
  - `CF_ACCESS_POLICY_ID`
- CORS: ensure the UI origin is included in `ALLOWED_ORIGINS`.

## Headers Guidance (Caching + CSP Compatibility)
If Cloudflare is fronting GitHub Pages, configure headers in Cloudflare (or via a Worker/Pages custom headers if you add one later). Suggested guidance:
- HTML: `Cache-Control: no-cache` or short `max-age` to ensure Access/login changes propagate quickly.
- Static assets (hashed build output): `Cache-Control: public, max-age=31536000, immutable`.
- If you enforce a CSP, ensure it allows Cloudflare Access resources. At minimum, allow `https://*.cloudflareaccess.com` for the directives your Access login flow needs (commonly `script-src`, `connect-src`, and `frame-src`). Verify the exact directives in Cloudflare's Access docs before locking this down.
