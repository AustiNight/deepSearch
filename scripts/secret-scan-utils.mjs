import fs from "node:fs";
import path from "node:path";

export const ROOT = new URL("..", import.meta.url).pathname;
const ALLOWLIST_PATH = path.join(ROOT, "scripts", "secret-allowlist.json");

export const loadAllowlist = () => {
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

export const buildAllowlist = (allowlist) => ({
  allowPaths: new Set(allowlist.paths),
  allowPatterns: allowlist.patterns.map((pattern) => new RegExp(pattern, "i")),
});

export const patternDefs = [
  { name: "OpenAI key", regex: /sk-[A-Za-z0-9_-]{20,}/g },
  { name: "Google API key", regex: /AIza[0-9A-Za-z-_]{20,}/g },
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "Slack token", regex: /xox[baprs]-[0-9A-Za-z-]{10,}/g },
  { name: "GitHub token", regex: /ghp_[0-9A-Za-z]{30,}/g },
  { name: "Private key block", regex: /-----BEGIN (?:RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY-----/g },
];

export const isBinary = (buffer) => buffer.includes(0);

export const redactMatch = (match) => {
  if (match.length <= 8) return "***";
  return `${match.slice(0, 4)}…${match.slice(-4)}`;
};

export const isAllowed = (allowlist, relativePath, match) => {
  if (allowlist.allowPaths.has(relativePath)) return true;
  return allowlist.allowPatterns.some((pattern) => pattern.test(match));
};
