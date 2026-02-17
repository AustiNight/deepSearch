#!/usr/bin/env bash
set -euo pipefail

# CI/CD template for deepSearch
# - Safe placeholders only
# - No secrets in this file
# - Provide required values via environment variables

log() {
  printf '[CICD] %s\n' "$*"
}

log "Install dependencies (placeholder)"
# TODO: Replace with your package manager command if different
npm install

log "Build project (placeholder)"
# TODO: Replace with your build command if different
npm run build

log "Cloudflare Access allowlist sync via Worker (stub)"
# Required environment variables (set in your CI secret store):
# - ALLOWLIST_ENDPOINT (e.g., https://<worker-domain>/api/access/allowlist)
# - CF_ACCESS_CLIENT_ID (Access service token)
# - CF_ACCESS_CLIENT_SECRET (Access service token)
# - CF_API_TOKEN
# - CF_ACCOUNT_ID
# - CF_ACCESS_APP_ID
# - CF_ACCESS_POLICY_ID
#
# Optional:
# - ALLOWLIST_EXPECTED_UPDATED_AT (stale KV guard; compare to Worker response)
# - ALLOWLIST_JSON (local/testing stub for Worker response)
#
# Access assumptions:
# - The Worker route is protected by Cloudflare Access.
# - CI uses an Access service token (client id/secret) to call the Worker.

if [[ -z "${ALLOWLIST_ENDPOINT:-}" || -z "${CF_ACCESS_CLIENT_ID:-}" || -z "${CF_ACCESS_CLIENT_SECRET:-}" || -z "${CF_API_TOKEN:-}" || -z "${CF_ACCOUNT_ID:-}" || -z "${CF_ACCESS_APP_ID:-}" || -z "${CF_ACCESS_POLICY_ID:-}" ]]; then
  log "Skipping allowlist sync: missing required env vars"
  exit 0
fi

log "Fetch allowlist from Worker (stub)"
# TODO: Replace placeholder with the real call.
# allowlist_json=$(curl -sS "${ALLOWLIST_ENDPOINT}" \
#   -H "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" \
#   -H "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}")

allowlist_json="${ALLOWLIST_JSON:-}"
if [[ -z "$allowlist_json" ]]; then
  log "Skipping allowlist sync: no ALLOWLIST_JSON set (stub for curl output)"
  exit 0
fi

if ! updated_at=$(ALLOWLIST_JSON="$allowlist_json" python3 - <<'PY'
import json, os, sys
try:
    data = json.loads(os.environ["ALLOWLIST_JSON"])
except Exception as exc:
    print(f"invalid_json:{exc}", file=sys.stderr)
    sys.exit(1)
updated = data.get("updatedAt")
if not updated:
    print("missing_updatedAt", file=sys.stderr)
    sys.exit(2)
print(updated)
PY
); then
  log "Allowlist fetch failed: invalid JSON or missing updatedAt"
  exit 2
fi

if [[ -n "${ALLOWLIST_EXPECTED_UPDATED_AT:-}" && "$updated_at" != "$ALLOWLIST_EXPECTED_UPDATED_AT" ]]; then
  log "Stale allowlist detected: expected ${ALLOWLIST_EXPECTED_UPDATED_AT}, got ${updated_at}"
  exit 2
fi

if ! entries=$(ALLOWLIST_JSON="$allowlist_json" python3 - <<'PY'
import json, os, sys
data = json.loads(os.environ["ALLOWLIST_JSON"])
entries = data.get("entries") or []
if not isinstance(entries, list):
    print("entries_not_list", file=sys.stderr)
    sys.exit(1)
clean = []
for entry in entries:
    value = str(entry).strip().lower()
    if value:
        clean.append(value)
print("\n".join(clean))
PY
); then
  log "Allowlist fetch failed: invalid entries list"
  exit 2
fi

entry_count=$(printf '%s\n' "$entries" | sed '/^$/d' | wc -l | tr -d ' ')
domain_summary=$(printf '%s\n' "$entries" | awk -F@ 'NF==2 {c[$2]++} END {for (d in c) print c[d], d}' | sort -nr)

log "Allowlist summary: ${entry_count} entries, updatedAt=${updated_at}"
if [[ -n "$domain_summary" ]]; then
  log "Allowlist domain summary (count domain):"
  printf '%s\n' "$domain_summary" | while IFS= read -r line; do
    log "$line"
  done
fi

entries_json=$(ALLOWLIST_ENTRIES="$entries" python3 - <<'PY'
import json, os
entries = [line for line in os.environ["ALLOWLIST_ENTRIES"].splitlines() if line.strip()]
print(json.dumps(entries))
PY
)

# TODO: Build the Access policy payload using entries_json as the single input.
payload='{"todo":"Build Access policy payload from entries_json"}'

log "Update Access policy (stub)"
# TODO: Perform the API call to update the Access policy allowlist.
# Keep this as a placeholder to avoid leaking real endpoints or payloads.
# response=$(curl -sS -X PUT "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/access/apps/${CF_ACCESS_APP_ID}/policies/${CF_ACCESS_POLICY_ID}" \
#   -H "Authorization: Bearer ${CF_API_TOKEN}" \
#   -H "Content-Type: application/json" \
#   --data "$payload") || access_update_status=$?

access_update_status=0
if [[ $access_update_status -ne 0 ]]; then
  log "Access policy update failed"
  exit 3
fi

log "Allowlist update stub complete"
