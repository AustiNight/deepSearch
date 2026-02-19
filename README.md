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
- Universal settings sync: **Save Configuration** syncs non-secret settings (provider, run config, model overrides) to the cloud using the Cloudflare Access identity. On success, the modal closes; on errors or conflicts it stays open and shows status details.

## Search & Runs

- **New Search** is always available in the header and cancels the active run, clears run state, and keeps saved settings and API keys intact.

More details in `docs/settings.md`, `docs/universal-settings.md`, `docs/cloudflare-access.md`, and `docs/data-privacy-posture.md`.

## Changelog

See `CHANGELOG.md` for UI/search release notes.

## Cloudflare Worker Proxy (Recommended for Production)

To keep API keys off the client, deploy the included Worker and point the frontend at it.

1. Install and login to Wrangler:
   `npm i -g wrangler`
   `wrangler login`
2. Set Worker secrets:
   `wrangler secret put OPENAI_API_KEY`
   `wrangler secret put GEMINI_API_KEY`
3. Deploy the Worker:
   `wrangler deploy`
4. Set the Worker URL in `.env.local`:
   `PROXY_BASE_URL=https://<your-worker>.<your-subdomain>.workers.dev`
5. Rebuild or restart the frontend dev server.

Notes:
- If `PROXY_BASE_URL` is set, the app will use the proxy and no client API keys are required.
- `ADMIN_PASSWORD` is a client-side gate, not a security boundary. Real security comes from the proxy.
