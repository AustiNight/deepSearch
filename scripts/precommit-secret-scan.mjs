import { spawnSync } from "node:child_process";
import {
  ROOT,
  buildAllowlist,
  isAllowed,
  isBinary,
  loadAllowlist,
  patternDefs,
  redactMatch,
} from "./secret-scan-utils.mjs";

const MAX_BLOB_BYTES = 1_000_000;
const allowlist = buildAllowlist(loadAllowlist());

const runGit = (args) =>
  spawnSync("git", args, {
    cwd: ROOT,
    encoding: "buffer",
  });

const listStagedFiles = () => {
  const result = runGit(["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMR"]);
  if (result.status !== 0) return [];
  return result.stdout
    .toString("utf8")
    .split("\0")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const readStagedFile = (relativePath) => {
  const result = runGit(["show", `:${relativePath}`]);
  if (result.status !== 0) return null;
  return result.stdout;
};

const stagedFiles = listStagedFiles();
if (stagedFiles.length === 0) {
  process.exit(0);
}

const violations = [];
const largeFiles = [];

for (const relativePath of stagedFiles) {
  if (allowlist.allowPaths.has(relativePath)) continue;
  const buffer = readStagedFile(relativePath);
  if (!buffer) continue;

  if (buffer.length > MAX_BLOB_BYTES) {
    largeFiles.push({
      file: relativePath,
      size: buffer.length,
    });
    continue;
  }

  if (isBinary(buffer)) continue;
  const content = buffer.toString("utf8");

  for (const { name, regex } of patternDefs) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const matchedValue = match[0];
      if (isAllowed(allowlist, relativePath, matchedValue)) continue;
      violations.push({
        file: relativePath,
        type: name,
        match: redactMatch(matchedValue),
      });
    }
  }
}

if (largeFiles.length > 0 || violations.length > 0) {
  if (largeFiles.length > 0) {
    console.error("Pre-commit blocked: large staged file(s) detected.");
    for (const item of largeFiles) {
      console.error(`- ${item.file} (${item.size} bytes)`);
    }
    console.error(`Max allowed size: ${MAX_BLOB_BYTES} bytes.`);
  }
  if (violations.length > 0) {
    console.error("Pre-commit blocked: potential secrets found in staged files.");
    for (const violation of violations) {
      console.error(`- ${violation.file} (${violation.type}): ${violation.match}`);
    }
  }
  process.exit(1);
}
