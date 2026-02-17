# Cloudflare Access Deployment Notes

## Purpose
This project is intended to be served at `https://deepsearches.app` (GitHub Pages behind Cloudflare Access). These notes capture the expected Access setup and how to manage the email allowlist from the app UI.

## Cloudflare Zero Trust App Expectations
- Create a Zero Trust Access application for `https://deepsearches.app`.
- Authentication method: One-time PIN via email.
- Policy: email allowlist (no public access).

## Allowlist Workflow
The Settings modal provides a **CLOUDFLARE ACCESS ALLOWLIST** helper that stores entries in localStorage (`overseer_access_allowlist`) and formats them for Cloudflare Access.

1. Open **SYSTEM_CONFIG** in the app and add emails under **CLOUDFLARE ACCESS ALLOWLIST**.
2. Click **COPY ALLOWLIST** to copy the normalized list.
3. In Cloudflare Zero Trust → Access → Applications → `deepsearches.app` → Policies, add or update:
   - Include → Emails in → paste the list.
4. Save the policy.

Notes:
- The allowlist helper is a convenience for policy entry; it does not secure the client app.
- If you update the Access policy directly in Cloudflare, also update the Settings allowlist so the UI stays in sync.

## Headers Guidance (Caching + CSP Compatibility)
If Cloudflare is fronting GitHub Pages, configure headers in Cloudflare (or via a Worker/Pages custom headers if you add one later). Suggested guidance:
- HTML: `Cache-Control: no-cache` or short `max-age` to ensure Access/login changes propagate quickly.
- Static assets (hashed build output): `Cache-Control: public, max-age=31536000, immutable`.
- If you enforce a CSP, ensure it allows Cloudflare Access resources. At minimum, allow `https://*.cloudflareaccess.com` for the directives your Access login flow needs (commonly `script-src`, `connect-src`, and `frame-src`). Verify the exact directives in Cloudflare's Access docs before locking this down.
