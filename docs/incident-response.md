# Incident Response

## Secret Exposure (Accidental Commit)
If a secret is committed or appears in git history, handle it locally and avoid copying the secret into the repo.

1. Revoke or rotate the credential immediately (provider console or Cloudflare).
2. Remove the secret from the working tree and local config files.
3. Verify the working tree is clean of secrets:
   `npm run test:secrets`
4. Scrub git history (local-only):
   - Remove an entire file:
     `git filter-repo --path path/to/file --invert-paths`
   - Replace a specific token value:
     - Create a replacement file outside the repo (example: `/tmp/secret-replacements.txt`).
     - Add one line per token: `ACTUAL_SECRET==>REDACTED`
     - Run: `git filter-repo --replace-text /tmp/secret-replacements.txt`
5. Force-push the rewritten history and coordinate with the team to rebase or re-clone.
6. Validate again:
   - `npm run test:secrets`
   - `git log -S "<partial-token-or-identifier>"` (avoid pasting the full secret)

Notes
- Do not store replacement files inside the repo.
- If a token appears in tags or release artifacts, rewrite or delete them as well.
- Update any incident tracking notes and document the rotation in the provider console.
