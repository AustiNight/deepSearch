# Cloudflare Access Deployment Notes

## Purpose
This project is intended to be served on GitHub Pages with a custom domain and protected by Cloudflare Access. These notes capture the expected Access setup and the source of truth for the email allowlist.

## Cloudflare Zero Trust App Expectations
- Create a Zero Trust Access application for `https://deepsearches.app`.
- Authentication method: One-time PIN via email.
- Policy: email allowlist (no public access).

## Allowlist Source of Truth
The source of truth for authorized emails is this document.

### Allowlisted Emails
- (none yet)

### Update Process
1. Update the Access application policy in Cloudflare Zero Trust with the email add/remove.
2. Update this file in the `Allowlisted Emails` section to match the policy.
3. Note the change in the relevant deployment PR/commit message.

## Headers Guidance (Caching + CSP Compatibility)
If Cloudflare is fronting GitHub Pages, configure headers in Cloudflare (or via a Worker/Pages custom headers if you add one later). Suggested guidance:
- HTML: `Cache-Control: no-cache` or short `max-age` to ensure Access/login changes propagate quickly.
- Static assets (hashed build output): `Cache-Control: public, max-age=31536000, immutable`.
- If you enforce a CSP, ensure it allows Cloudflare Access resources. At minimum, allow `https://*.cloudflareaccess.com` for the directives your Access login flow needs (commonly `script-src`, `connect-src`, and `frame-src`). Verify the exact directives in Cloudflare's Access docs before locking this down.
