import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  buildAllowlist,
  isAllowed,
  isBinary,
  loadAllowlist,
  patternDefs,
  redactMatch,
} from "./secret-scan-utils.mjs";

const allowlist = buildAllowlist(loadAllowlist());

const listTrackedFiles = () => {
  try {
    const output = execSync("git ls-files -z", { cwd: ROOT });
    return output
      .toString("utf8")
      .split("\0")
      .map((entry) => entry.trim())
      .filter(Boolean);
  } catch (_) {
    return [];
  }
};

const files = listTrackedFiles();
if (files.length === 0) {
  console.log("secret-scan.test.mjs: no tracked files detected.");
  process.exit(0);
}

const violations = [];

for (const relativePath of files) {
  const fullPath = path.join(ROOT, relativePath);
  let buffer;
  try {
    buffer = fs.readFileSync(fullPath);
  } catch (_) {
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

if (violations.length > 0) {
  console.error("Secret scan failed. Potential secrets found:");
  for (const violation of violations) {
    console.error(`- ${violation.file} (${violation.type}): ${violation.match}`);
  }
  process.exit(1);
}

console.log("secret-scan.test.mjs: ok");
