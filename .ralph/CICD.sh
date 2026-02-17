#!/usr/bin/env bash
set -euo pipefail

# CI/CD template for deepSearch
# - Safe placeholders only
# - No secrets in this file
# - Provide required values via environment variables

log() {
  printf '[CICD] %s\n' "$*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

curl_request() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  shift 3 || true
  local -a headers=("$@")

  local attempt=1
  local max_attempts=3
  local delay=2

  while true; do
    local headers_file
    local body_file
    headers_file="$(mktemp)"
    body_file="$(mktemp)"

    local -a args=(
      --silent
      --show-error
      --fail
      --location
      --connect-timeout 10
      --max-time 30
      -X "$method"
      -D "$headers_file"
      -o "$body_file"
    )

    if [[ -n "$data" ]]; then
      args+=(--header "Content-Type: application/json" --data "$data")
    fi

    if (( ${#headers[@]} > 0 )); then
      local header
      for header in "${headers[@]}"; do
        args+=(--header "$header")
      done
    fi

    if curl "${args[@]}" "$url"; then
      CURL_BODY="$(cat "$body_file")"
      CURL_STATUS="$(awk 'NR==1 {print $2}' "$headers_file")"
      CURL_ETAG="$(awk -F': ' 'tolower($1)=="etag" {print $2}' "$headers_file" | tr -d '\r')"
      rm -f "$headers_file" "$body_file"
      return 0
    fi

    local exit_code=$?
    local status=""
    if [[ -s "$headers_file" ]]; then
      status="$(awk 'NR==1 {print $2}' "$headers_file")"
    fi
    rm -f "$headers_file" "$body_file"

    if (( attempt >= max_attempts )); then
      log "HTTP request failed after ${attempt} attempts (exit ${exit_code}${status:+, status ${status}})"
      return 1
    fi

    log "HTTP request failed (attempt ${attempt}/${max_attempts}); retrying in ${delay}s"
    sleep "$delay"
    delay=$((delay * 2))
    attempt=$((attempt + 1))
  done
}

log "Install dependencies (placeholder)"
# TODO: Replace with your package manager command if different
npm install

log "Build project (placeholder)"
# TODO: Replace with your build command if different
npm run build

log "Cloudflare Access allowlist sync via Worker"
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
# - ALLOWLIST_EXPECTED_UPDATED_AT (stale guard; compare to Worker response)
#
# Access assumptions:
# - The Worker route is protected by Cloudflare Access.
# - CI uses an Access service token (client id/secret) to call the Worker.
#
# Rollback behavior:
# - Abort only (no automatic policy rollback).

required=(
  ALLOWLIST_ENDPOINT
  CF_ACCESS_CLIENT_ID
  CF_ACCESS_CLIENT_SECRET
  CF_API_TOKEN
  CF_ACCOUNT_ID
  CF_ACCESS_APP_ID
  CF_ACCESS_POLICY_ID
)
missing=()
for var in "${required[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    missing+=("$var")
  fi
done
if (( ${#missing[@]} > 0 )); then
  log "Allowlist sync blocked: missing required env vars: ${missing[*]}"
  exit 1
fi

log "Fetch allowlist from Worker"
if ! curl_request "GET" "$ALLOWLIST_ENDPOINT" "" \
  "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" \
  "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}"; then
  fail "Allowlist fetch failed"
fi

worker_response="$CURL_BODY"
worker_etag="$CURL_ETAG"

if ! parsed=$(ALLOWLIST_JSON="$worker_response" python3 - <<'PY'
import json
import os
import re
import sys
from collections import Counter

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

try:
    data = json.loads(os.environ["ALLOWLIST_JSON"])
except Exception as exc:
    print(f"invalid_json:{exc}", file=sys.stderr)
    sys.exit(1)

entries = data.get("entries")
updated_at = data.get("updatedAt")
if not isinstance(entries, list) or not updated_at:
    print("missing_fields", file=sys.stderr)
    sys.exit(2)

clean = []
invalid = 0
seen = set()
for item in entries:
    if not isinstance(item, str):
        invalid += 1
        continue
    value = item.strip().lower()
    if not value:
        continue
    if not EMAIL_PATTERN.match(value):
        invalid += 1
        continue
    if value in seen:
        continue
    seen.add(value)
    clean.append(value)

if invalid:
    print(f"invalid_count={invalid}", file=sys.stderr)
    sys.exit(3)

counts = Counter()
for entry in clean:
    _, domain = entry.split("@", 1)
    if domain:
        counts[domain.lower()] += 1
summary = ", ".join([f"{domain}:{count}" for domain, count in counts.most_common(5)]) or "none"

print(updated_at)
print(json.dumps(clean, separators=(",", ":")))
print(len(clean))
print(summary)
PY
); then
  log "Allowlist fetch failed: invalid JSON, missing fields, or invalid emails"
  exit 2
fi

IFS=$'\n' read -r worker_updated_at entries_json entry_count domain_summary <<<"$parsed"

allowlist_version_source="updatedAt"
allowlist_version="$worker_updated_at"
if [[ -n "$worker_etag" ]]; then
  allowlist_version_source="ETag"
  allowlist_version="$worker_etag"
fi

if [[ -n "$worker_etag" && "$worker_updated_at" != "$worker_etag" ]]; then
  log "Warning: Worker updatedAt does not match ETag; using ${allowlist_version_source}"
fi

if [[ -n "${ALLOWLIST_EXPECTED_UPDATED_AT:-}" && "$allowlist_version" != "$ALLOWLIST_EXPECTED_UPDATED_AT" ]]; then
  log "Stale allowlist detected: expected ${ALLOWLIST_EXPECTED_UPDATED_AT}, got ${allowlist_version} (${allowlist_version_source})"
  exit 2
fi

log "Allowlist summary: ${entry_count} entries, version=${allowlist_version} (${allowlist_version_source})"
log "Allowlist domain summary: ${domain_summary}"
log "Rollback strategy: abort-only (no automatic policy rollback)"

policy_url="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/access/apps/${CF_ACCESS_APP_ID}/policies/${CF_ACCESS_POLICY_ID}"

log "Fetch current Cloudflare Access policy"
if ! curl_request "GET" "$policy_url" "" "Authorization: Bearer ${CF_API_TOKEN}"; then
  fail "Access policy fetch failed"
fi

policy_json="$CURL_BODY"
policy_etag="$CURL_ETAG"

if ! payload=$(CURRENT_POLICY_JSON="$policy_json" ALLOWLIST_ENTRIES_JSON="$entries_json" python3 - <<'PY'
import json
import os
import sys

try:
    policy = json.loads(os.environ["CURRENT_POLICY_JSON"])
except Exception as exc:
    print(f"invalid_policy_json:{exc}", file=sys.stderr)
    sys.exit(1)

if not policy.get("success"):
    print("policy_success_false", file=sys.stderr)
    sys.exit(2)

result = policy.get("result")
if not isinstance(result, dict):
    print("policy_result_invalid", file=sys.stderr)
    sys.exit(2)

name = result.get("name")
decision = result.get("decision")
if not name or not decision:
    print("policy_missing_required_fields", file=sys.stderr)
    sys.exit(2)

include = result.get("include")
if not isinstance(include, list):
    print("policy_include_invalid", file=sys.stderr)
    sys.exit(2)

exclude = result.get("exclude")
if exclude is None:
    exclude = []
if not isinstance(exclude, list):
    print("policy_exclude_invalid", file=sys.stderr)
    sys.exit(2)

require = result.get("require")
if require is None:
    require = []
if not isinstance(require, list):
    print("policy_require_invalid", file=sys.stderr)
    sys.exit(2)

try:
    entries = json.loads(os.environ["ALLOWLIST_ENTRIES_JSON"])
except Exception as exc:
    print(f"invalid_entries_json:{exc}", file=sys.stderr)
    sys.exit(2)

if not isinstance(entries, list):
    print("entries_invalid", file=sys.stderr)
    sys.exit(2)

email_rules = [{"email": {"email": entry}} for entry in entries]

def is_email_rule(rule):
    return isinstance(rule, dict) and "email" in rule

updated_include = []
inserted = False
for rule in include:
    if is_email_rule(rule):
        if not inserted:
            updated_include.extend(email_rules)
            inserted = True
        continue
    if isinstance(rule, dict):
        updated_include.append(rule)

if not inserted:
    updated_include.extend(email_rules)

if len(updated_include) == 0:
    print("empty_include", file=sys.stderr)
    sys.exit(3)


def get_field(obj, snake, camel):
    if snake in obj:
        return obj[snake]
    if camel in obj:
        return obj[camel]
    return None

payload = {
    "name": name,
    "decision": decision,
    "include": updated_include,
    "exclude": exclude,
    "require": require,
    "precedence": get_field(result, "precedence", "precedence"),
    "session_duration": get_field(result, "session_duration", "sessionDuration"),
    "purpose_justification_required": get_field(
        result, "purpose_justification_required", "purposeJustificationRequired"
    ),
    "purpose_justification_prompt": get_field(
        result, "purpose_justification_prompt", "purposeJustificationPrompt"
    ),
    "approval_required": get_field(result, "approval_required", "approvalRequired"),
    "approval_groups": get_field(result, "approval_groups", "approvalGroups"),
    "isolation_required": get_field(result, "isolation_required", "isolationRequired"),
}

payload = {k: v for k, v in payload.items() if v is not None}

print(json.dumps(payload, separators=(",", ":")))
PY
); then
  fail "Access policy merge failed"
fi

policy_headers=("Authorization: Bearer ${CF_API_TOKEN}")
if [[ -n "$policy_etag" ]]; then
  policy_headers+=("If-Match: ${policy_etag}")
  log "Policy concurrency: using If-Match with ETag"
else
  log "Policy concurrency: no ETag provided; proceeding without If-Match"
fi

log "Update Cloudflare Access policy"
if ! curl_request "PUT" "$policy_url" "$payload" "${policy_headers[@]}"; then
  log "Access policy update failed; aborting without rollback"
  exit 3
fi

update_response="$CURL_BODY"
if ! UPDATE_RESPONSE="$update_response" python3 - <<'PY'
import json
import os
import sys

try:
    data = json.loads(os.environ["UPDATE_RESPONSE"])
except Exception as exc:
    print(f"invalid_update_response:{exc}", file=sys.stderr)
    sys.exit(1)

if not data.get("success"):
    print("update_success_false", file=sys.stderr)
    sys.exit(2)
PY
; then
  log "Access policy update failed; aborting without rollback"
  exit 3
fi

log "Allowlist sync complete"
