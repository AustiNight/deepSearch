# Cloudflare Pages Migration Plan (Staged, No Downtime)

This plan keeps GitHub Pages production deploy active while you bring Cloudflare Pages online in parallel.

## Current State

- GitHub Pages remains the production static host (`pages.yml`).
- Cloudflare Worker deploys on every `main` push (`deploy-worker.yml`).
- New Cloudflare Pages deploy workflow is added (`deploy-cloudflare-pages.yml`) and runs on `main` only after configuration.

## ACTION REQUIRED 1: Create Cloudflare Pages Project

1. Open Cloudflare dashboard.
2. Go to **Workers & Pages**.
3. Create a **Pages** project named `deepsearches-app` (or your preferred name).
4. Choose **Direct Upload** mode (we deploy from GitHub Actions with Wrangler).
5. Set production branch to `main`.
6. Keep the generated `*.pages.dev` URL for verification.

## ACTION REQUIRED 2: Configure GitHub Secrets and Variable

Add these in GitHub repository settings:

- **Secrets and variables -> Actions -> Secrets**
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- **Secrets and variables -> Actions -> Variables**
  - `CLOUDFLARE_PAGES_PROJECT_NAME` = your Pages project name (example: `deepsearches-app`)

Notes:
- The API token must include Cloudflare Pages deploy permissions in addition to Worker deploy permissions.
- Once the variable is set, `deploy-cloudflare-pages.yml` auto-runs on every `main` push.

## ACTION REQUIRED 3: Run First Manual Deployment

1. Open GitHub Actions -> **Deploy Cloudflare Pages**.
2. Click **Run workflow**.
3. Leave inputs empty unless you need overrides.
4. Confirm success of the `Deploy Cloudflare Pages (Direct Upload)` step.

Expected result:
- A deployment appears in Cloudflare Pages for the `main` branch.
- Site is reachable at your `*.pages.dev` URL.

## Verification Checklist (Before DNS Cutover)

1. Open the `*.pages.dev` URL.
2. Validate static app load and route handling.
3. Verify `/api/*` calls still work through your Worker path.
4. If API calls fail from `*.pages.dev`, add the exact Pages origin to Worker CORS allowlist (`ALLOWED_ORIGINS`) and redeploy Worker.
5. Run a real search and confirm report generation + citations.
6. Confirm no CORS/auth regressions under Cloudflare Access.

## ACTION REQUIRED 4: DNS Cutover (When Ready)

1. In Cloudflare Pages project, add custom domain:
   - `deepsearches.app`
   - `www.deepsearches.app` (if used)
2. Update DNS records to point at Cloudflare Pages targets.
3. Keep GitHub Pages workflow enabled for rollback safety until stability is confirmed.

## Rollback

If any production issue appears after cutover:

1. Revert DNS records to the previous GitHub Pages target.
2. Trigger `pages.yml` deployment manually if needed.
3. Keep Worker deployment unchanged.

## Post-Cutover Cleanup

After stable operation:

1. Disable or remove GitHub Pages workflow (`pages.yml`).
2. Update docs that currently reference GitHub Pages as primary host.
3. Keep Cloudflare Pages + Worker deploy workflows pinned to Wrangler `4.71.0` or newer approved version.
