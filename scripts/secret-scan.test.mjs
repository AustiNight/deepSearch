import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
const ALLOWLIST_PATH = path.join(ROOT, "scripts", "secret-allowlist.json");

const loadAllowlist = () => {
  if (!fs.existsSync(ALLOWLIST_PATH)) {
    return { paths: [], patterns: [] };
  }
  try {
    const raw = fs.readFileSync(ALLOWLIST_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      paths: Array.isArray(parsed.paths) ? parsed.paths : [],
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
    };
  } catch (_) {
    return { paths: [], patterns: [] };
  }
};

const allowlist = loadAllowlist();
const allowPaths = new Set(allowlist.paths);
const allowPatterns = allowlist.patterns.map((pattern) => new RegExp(pattern, "i"));

const patternDefs = [
  { name: "OpenAI key", regex: /sk-[A-Za-z0-9_-]{20,}/g },
  { name: "Google API key", regex: /AIza[0-9A-Za-z-_]{20,}/g },
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "Slack token", regex: /xox[baprs]-[0-9A-Za-z-]{10,}/g },
  { name: "GitHub token", regex: /ghp_[0-9A-Za-z]{30,}/g },
  { name: "Private key block", regex: /-----BEGIN (?:RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY-----/g },
];

const isBinary = (buffer) => buffer.includes(0);

const redactMatch = (match) => {
  if (match.length <= 8) return "***";
  return `${match.slice(0, 4)}…${match.slice(-4)}`;
};

const isAllowed = (relativePath, match) => {
  if (allowPaths.has(relativePath)) return true;
  return allowPatterns.some((pattern) => pattern.test(match));
};

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
      if (isAllowed(relativePath, matchedValue)) continue;
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
