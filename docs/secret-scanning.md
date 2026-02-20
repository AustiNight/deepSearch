# Secret Scanning

## CI Policy
- The Guardrails workflow runs `npm run test:secrets` on every pull request and on `main`.
- Allowlist rules live in `scripts/secret-allowlist.json`. Keep entries minimal and document why a path or pattern is safe.

## Pre-Commit Hook
1. Install git hooks (local-only):
   `npm run hooks:install`
2. The pre-commit hook runs `scripts/precommit-secret-scan.mjs` and blocks:
   - Known key/token patterns (same rules as `test:secrets`).
   - Staged files larger than 1,000,000 bytes (unless allowlisted).

If you need a temporary exception for a synthetic fixture, add a narrow path or pattern to `scripts/secret-allowlist.json` and remove it as soon as possible.

## Incident Response
If a secret is committed, follow the history scrub procedure in `docs/incident-response.md`.
