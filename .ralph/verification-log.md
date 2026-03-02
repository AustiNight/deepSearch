# Verification Log

## Compliance Rules (Non-Negotiable)
- Never record secret values or secret fragments (no partial prefixes, suffixes, hashes, screenshots, or clipboard dumps).
- Record operator identity for every action.
- Record UTC timestamps for start/end and key checkpoints.
- Record the command that was executed and the resulting output summary.
- Keep all evidence terminal-based for routine operations; dashboard access is break-glass and must be explicitly justified.

## Rotation Evidence Template

Copy this template for each rotation event.

```markdown
### Rotation Event: <YYYY-MM-DD>
- Operator: <name> (<role: primary|backup>)
- Backup witness (optional): <name>
- Rotation mode: terminal-only (`wrangler` token auth)
- Worker: `deepsearch`
- Start UTC: <timestamp>
- End UTC: <timestamp>
- Duration: <minutes>

#### Command Evidence
1. `<command>`
   - UTC: <timestamp>
   - Output summary: <summary without secrets>
2. `<command>`
   - UTC: <timestamp>
   - Output summary: <summary without secrets>

#### Smoke Test Evidence
- Endpoint: `https://deepsearches.app/api/openai/responses`
- HTTP status: <status>
- `invalid_api_key` present: <yes|no>
- Responses API JSON valid: <yes|no>
- Outcome: <pass|fail>

#### Acceptance Check
- Completed in under 10 minutes (preflight start -> successful smoke test): <yes|no>
- Cloudflare dashboard login used: <yes|no>
- `OpenAI proxy error 401: invalid_api_key` observed: <yes|no>
```

## Incident Response Template (Invalid/Revoked Keys)

Use when smoke tests or preflight detect `HTTP 401` or `invalid_api_key`.

```markdown
### Incident Event: <YYYY-MM-DD>
- Operator: <name>
- Incident trigger: <401|invalid_api_key|other>
- Detection UTC: <timestamp>
- Affected worker: `deepsearch`

#### Timeline
1. <timestamp> - Detection command and output summary.
2. <timestamp> - Rollback command and output summary.
3. <timestamp> - Post-rollback verification command(s) and output summary.
4. <timestamp> - Smoke test result.

#### Recovery Outcome
- Service restored: <yes|no>
- Follow-up actions: <new key issued|token revoked/replaced|backup drill scheduled>
- Dashboard break-glass required: <yes|no + reason>

#### Compliance Confirmation
- No secret values/fragments logged: <confirmed>
```

## Operational Cadence and Handoff Tracking
- Quarterly key rotation cadence: `Q1/Q2/Q3/Q4` each year.
- Quarterly backup-operator drill cadence: `Q1/Q2/Q3/Q4` each year.
- Named handoff path: `PrimaryOperator -> BackupOperator (Terminal-Only Rotation Drill)`.

```markdown
### Cadence Checkpoint: <YYYY-Q#>
- Primary operator: <name>
- Backup operator: <name>
- Rotation completed: <yes|no>
- Backup drill completed without Cloudflare UI access: <yes|no>
- Evidence links: <runbook execution notes>
- Next due date: <YYYY-MM-DD>
```

## Change Log Entries

### Documentation Update: 2026-03-02
- Operator: Codex (documentation automation)
- Scope: Added production OpenAI key ownership model, delegated token policy, Wrangler-only rotation runbook, incident template, and cadence/handoff controls.
- Files:
  - `README.md`
  - `.ralph/runbooks/openai-worker-secret-rotation.md`
  - `.ralph/verification-log.md`
- Post-change compliance step: `npm run test:secrets`
- Execution UTC start: `2026-03-02T22:09:41Z`
- Execution UTC end: `2026-03-02T22:09:41Z`
- Command output summary:
  - `secret-scan.test.mjs: ok`
  - Exit status: `0`
- Result: pass
