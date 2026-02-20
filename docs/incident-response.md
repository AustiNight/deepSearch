# Incident Response

## Secret Exposure (Accidental Commit)
If a secret is committed or appears in git history, handle it locally and avoid copying the secret into the repo.

1. Revoke or rotate the credential immediately (provider console or Cloudflare).
2. Remove the secret from the working tree and local config files.
3. Verify the working tree is clean of secrets:
   `npm run test:secrets`
4. Run the local history scrub procedure below.
5. Force-push the rewritten history and coordinate with the team to rebase or re-clone.
6. Validate again:
   - `npm run test:secrets`
   - `git log -S "<partial-token-or-identifier>"` (avoid pasting the full secret)

## History Scrub Procedure (Local-Only)
Do all steps locally. Do not paste or store the full secret inside the repo.

1. Identify where the secret exists without copying it verbatim:
   - `git log -S "<partial-token-or-identifier>"`
   - `rg -n "<partial-token-or-identifier>" .`
2. Choose the scrub method:
   - Remove an entire file from history:
     `git filter-repo --path path/to/file --invert-paths`
   - Replace a specific token value:
     - Create a replacement file outside the repo (example: `/tmp/secret-replacements.txt`).
     - Add one line per token: `ACTUAL_SECRET==>REDACTED`
     - Run: `git filter-repo --replace-text /tmp/secret-replacements.txt`
3. Clean local references after rewriting history:
   - `git reflog expire --expire=now --all`
   - `git gc --prune=now`
4. Re-run the secret scan before pushing:
   `npm run test:secrets`

Notes
- Do not store replacement files inside the repo.
- If a token appears in tags or release artifacts, rewrite or delete them as well.
- Update any incident tracking notes and document the rotation in the provider console.
