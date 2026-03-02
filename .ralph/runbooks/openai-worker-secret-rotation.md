# Production OpenAI Worker Secret Rotation (Wrangler-Only)

## Objective
Rotate production `OPENAI_API_KEY` for Worker `deepsearch` using terminal-only Wrangler commands (no Cloudflare dashboard login), no app code changes, and complete within 10 minutes from preflight start to successful smoke test.

## Canonical Secret Ownership Model
- A single production `OPENAI_API_KEY` is stored in the shared family/designated-proxy password manager vault.
- One primary operator owns routine execution and scheduling.
- At least one backup operator has equivalent vault access plus delegated Cloudflare API-token access.
- Before every rotation, preserve the previous production key in the vault as the rollback value.

## Delegated Cloudflare API-Token Policy (Routine Operations)
- Required environment variables: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- Token scope: production account, limited to Worker `deepsearch`.
- Minimum permissions required:
  - Workers Scripts write/edit (for `wrangler secret put`).
  - Workers Scripts read (for `wrangler secret list`).
  - Workers Deployments read (for `wrangler deployments list`).
- Token max lifetime: 90 days.
- Revocation/replacement policy:
  1. Revoke the existing delegated token.
  2. Issue a replacement with the same scope and max 90-day expiry.
  3. Update operator shell environment.
  4. Verify with `npx wrangler@${WRANGLER_VERSION} whoami`.
  5. Log revocation/replacement evidence in `.ralph/verification-log.md` without token value/fragments.

## Preconditions
1. Wrangler version is pinned for this session:
   `export WRANGLER_VERSION=<approved-version>`
2. Token auth is configured (not dashboard session):
   `export CLOUDFLARE_API_TOKEN=<delegated-token>`
   `export CLOUDFLARE_ACCOUNT_ID=<production-account-id>`
3. Target Worker is `deepsearch`.
4. Operator identity and ownership checks are completed:
   - Operator confirms identity and role (primary or backup operator).
   - Operator confirms active access to the shared vault entry for production `OPENAI_API_KEY`.

## Preflight
1. Capture timed-window start timestamp:
   `export ROTATION_START_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)" && echo "$ROTATION_START_UTC"`
2. Validate Wrangler auth and account context:
   `npx wrangler@${WRANGLER_VERSION} whoami`
   `npx wrangler@${WRANGLER_VERSION} deployments list --name deepsearch`
3. Validate replacement OpenAI key before cutover (do not log key value):

```bash
read -rsp "Replacement OPENAI_API_KEY: " NEW_OPENAI_API_KEY
printf '\n'
KEY_VALIDATE_HTTP="$(curl -sS -o /tmp/openai-key-validate.json -w '%{http_code}' \
  -H "Authorization: Bearer ${NEW_OPENAI_API_KEY}" \
  https://api.openai.com/v1/models)"
if [ "$KEY_VALIDATE_HTTP" != "200" ] || rg -q "invalid_api_key" /tmp/openai-key-validate.json; then
  echo "Preflight failed: replacement OpenAI key is invalid or revoked."
  exit 1
fi
unset NEW_OPENAI_API_KEY
```

## Rotation Command
Before replacing the Worker secret, preserve the previous production key in the vault as rollback value.

`npx wrangler secret put OPENAI_API_KEY --name deepsearch`

## Verification Commands
Run both commands immediately after rotation:

`npx wrangler secret list --name deepsearch`

`npx wrangler deployments list --name deepsearch`

## Deterministic Production Smoke Test
Run this against `https://deepsearches.app/api/openai/responses`:

```bash
SMOKE_RAW="$(curl -sS -w '\n%{http_code}' \
  -H 'Content-Type: application/json' \
  -X POST 'https://deepsearches.app/api/openai/responses' \
  --data '{"model":"gpt-4.1-mini","input":"Return exactly: DS_SMOKE_OK"}')"
SMOKE_STATUS="$(printf '%s\n' "$SMOKE_RAW" | tail -n1)"
SMOKE_BODY="$(printf '%s\n' "$SMOKE_RAW" | sed '$d')"
printf '%s\n' "$SMOKE_BODY" | jq . >/dev/null
if [ "$SMOKE_STATUS" = "401" ]; then
  echo "FAIL: HTTP 401"
  exit 1
fi
if printf '%s\n' "$SMOKE_BODY" | rg -q "invalid_api_key"; then
  echo "FAIL: invalid_api_key detected"
  exit 1
fi
printf '%s\n' "$SMOKE_BODY" | jq -e '.object == "response" and (.id | type == "string")' >/dev/null
```

Pass criteria:
- HTTP status is not `401`.
- Response body does not contain `invalid_api_key`.
- Body is valid JSON and contains a valid Responses API payload (`object == "response"` and string `id`).

## Rollback Procedure
1. Retrieve the previous production key from the vault rollback entry.
2. Restore the prior key using the same command:
   `npx wrangler secret put OPENAI_API_KEY --name deepsearch`
3. Re-run verification commands:
   `npx wrangler secret list --name deepsearch`
   `npx wrangler deployments list --name deepsearch`
4. Re-run the deterministic smoke test above.
5. Record rollback timestamps, commands, and outcomes in `.ralph/verification-log.md`.

## Incident Response: Invalid/Revoked Key
Trigger this flow when any of the following appears:
- `HTTP 401` from the smoke test endpoint.
- `invalid_api_key` in proxy response body.
- OpenAI key-validation preflight fails.

Response steps:
1. Contain: stop rollout and restore rollback key immediately.
2. Validate recovery: run verification commands plus smoke test.
3. Replace compromised/revoked key in vault with a newly issued key.
4. Rotate delegated Cloudflare token if compromise scope is unclear.
5. Log incident timeline, operator identity, commands, and outcomes in `.ralph/verification-log.md` (never log secret values/fragments).

## Operational Cadence and Handoff Path
- Quarterly: rotate production `OPENAI_API_KEY`.
- Quarterly: run a backup-operator drill (family/designated proxy) using terminal-only rotation flow.
- Named handoff path: `PrimaryOperator -> BackupOperator (Terminal-Only Rotation Drill)`.
- Drill evidence requirement: successful full rotation + smoke test completed by backup operator without Cloudflare UI access, documented in `.ralph/verification-log.md`.
