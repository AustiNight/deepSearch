<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/15nbWFNEYh8ec84B_f70xPi14fkgQW50J

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set API keys in [.env.local](.env.local):
   `GEMINI_API_KEY` for Google Gemini
   `OPENAI_API_KEY` for OpenAI
3. Optionally set `LLM_PROVIDER` to `google` or `openai` (defaults to Google unless only OpenAI is set)
4. Optionally set `OPENAI_MODEL_FAST` and `OPENAI_MODEL_REASONING`
5. Optional: set `ADMIN_PASSWORD` to lock settings and search behind a password prompt
6. Run the app:
   `npm run dev`

## Settings

Open the **SYSTEM_CONFIG** modal (gear icon) to adjust runtime settings.

- OpenAI model overrides: set **OPENAI MODEL PER AGENT ROLE** (only visible when `LLM_PROVIDER=openai`) to customize models per role. Overrides are stored in `overseer_model_overrides` and take precedence over `OPENAI_MODEL_FAST/OPENAI_MODEL_REASONING`.
- Cloudflare Access allowlist: manage **CLOUDFLARE ACCESS ALLOWLIST** entries and click **SAVE** to sync them to Cloudflare Access via the Worker (`/api/access/allowlist`). The Access policy is the source of truth; KV stores metadata only and the list is cached locally in `overseer_access_allowlist`. **COPY ALLOWLIST** remains as a manual fallback. This helper does not secure the client; Access policy does.
- Universal settings sync: **Save Configuration** syncs shared household settings to the cloud (provider, run config, model overrides, key overrides, open-data auth/settings) for all Cloudflare Access-approved users. On success, the modal closes; on errors or conflicts it stays open and shows status details.

## Search & Runs

- **New Search** is always available in the header and cancels the active run, clears run state, and keeps saved settings and API keys intact.

More details in `docs/settings.md`, `docs/universal-settings.md`, `docs/cloudflare-access.md`, and `docs/data-privacy-posture.md`.

## Changelog

See `CHANGELOG.md` for UI/search release notes.

## Cloudflare Pages Migration (Optional, Staged)

If you want to migrate static hosting from GitHub Pages to Cloudflare Pages, use the staged runbook:

- `docs/cloudflare-pages-migration.md`

Key behavior:

- GitHub Pages deploy remains active until you cut over DNS.
- Cloudflare Pages deploy is automated via `.github/workflows/deploy-cloudflare-pages.yml`.
- Automatic Cloudflare Pages deploy on `main` is enabled when repository variable `CLOUDFLARE_PAGES_PROJECT_NAME` is set.

## Cloudflare Worker Proxy (Recommended for Production)

To keep API keys off the client, deploy the included Worker and point the frontend at it.

### Routine Operations (Default: API Token + Terminal Workflow)

Use delegated API-token auth for all day-to-day deployment/secret operations. Do not use `wrangler login` for routine rotation.

1. Pin a Wrangler version for the session:
   `export WRANGLER_VERSION=<approved-version>`
2. Export required Cloudflare auth context:
   `export CLOUDFLARE_API_TOKEN=<delegated-token>`
   `export CLOUDFLARE_ACCOUNT_ID=<production-account-id>`
3. Deploy and inspect from terminal:
   `npx wrangler@${WRANGLER_VERSION} deploy --name deepsearch`
   `npx wrangler@${WRANGLER_VERSION} deployments list --name deepsearch`
4. Rotate Worker secrets from terminal:
   `npx wrangler@${WRANGLER_VERSION} secret put OPENAI_API_KEY --name deepsearch`
   `npx wrangler@${WRANGLER_VERSION} secret put GEMINI_API_KEY --name deepsearch`

### GitHub Actions Secrets Setup (Worker Deploy)

The `Deploy Worker` GitHub Actions workflow requires these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Configure them once:

1. In Cloudflare, open **My Profile → API Tokens → Create Token**.
2. Create a token for Worker deployments (template: **Edit Cloudflare Workers** or equivalent scoped custom token).
3. Scope the token to the production account that owns the `deepsearch` Worker.
4. Copy the token value (shown once at creation time).
5. In Cloudflare dashboard, copy the production **Account ID**.
6. In GitHub, open this repository.
7. Go to **Settings → Secrets and variables → Actions**.
8. Create secret `CLOUDFLARE_API_TOKEN` with the token value.
9. Create secret `CLOUDFLARE_ACCOUNT_ID` with the Account ID.
10. Run **Actions → Deploy Worker** (or push to `main`).

Verification:

- Workflow log should show:
  - `npx wrangler@${WRANGLER_VERSION} deploy --name deepsearch`
  - `npx wrangler@${WRANGLER_VERSION} deployments list --name deepsearch`

### Canonical Secret Ownership Model

- Production `OPENAI_API_KEY` is a single shared secret stored only in the family/designated-proxy password manager vault.
- One primary operator owns the routine rotation schedule.
- At least one backup operator has the same vault and API-token permissions for continuity and incident response.
- The previous production key is retained in vault history until post-rotation verification passes, then handled per vault retention policy.

### Delegated Cloudflare API-Token Policy (No Dashboard Login)

- Required environment variables: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- Scope: production account, constrained to Worker `deepsearch`.
- Minimum permissions for routine operations:
  - `wrangler secret put`: Workers Scripts write/edit permission.
  - `wrangler secret list`: Workers Scripts read permission.
  - `wrangler deployments list`: Workers Deployments read permission.
- Token expiry: maximum 90 days.
- Revocation + replacement procedure:
  1. Revoke current delegated token immediately (scheduled expiry, role change, or suspected compromise).
  2. Issue a replacement token with the same scoped permissions and a new expiry (<= 90 days).
  3. Update operator environment variables and verify terminal access with `npx wrangler@${WRANGLER_VERSION} whoami`.
  4. Record revocation/replacement details in `.ralph/verification-log.md` without secret/token values.

### Break-Glass Access (Cloudflare Dashboard)

Dashboard login is break-glass only. Use it only when token-based terminal workflow is unavailable (for example, token issuance outage or identity provider disruption). Any dashboard use must be logged in `.ralph/verification-log.md` with reason, start/end timestamps, and follow-up actions to restore token-only operation.

### OpenAI Key Rotation Runbook

Use `.ralph/runbooks/openai-worker-secret-rotation.md` for the timed, terminal-only procedure and rollback path.

Notes:
- If `PROXY_BASE_URL` is set, the app will use that proxy base and no client API keys are required.
- In local `vite` development, when `PROXY_BASE_URL` is not set, `/api/*` is proxied to `DEV_API_PROXY_TARGET` (default `http://127.0.0.1:8787`) so settings/allowlist endpoints resolve if `wrangler dev` is running.
- `ADMIN_PASSWORD` is a client-side gate, not a security boundary. Real security comes from the proxy.
