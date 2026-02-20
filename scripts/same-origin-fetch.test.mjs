import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CHECK_DIRS = ["services", "hooks", "components", "data"];
const ROOT_FILES = ["App.tsx", "index.tsx", "constants.ts", "types.ts"];
const ALLOWED_FILES = new Set([
  "services/apiClient.ts"
]);

const shouldScan = (filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx");

const readText = (filePath) => fs.readFileSync(filePath, "utf8");

const walk = (dir, entries = []) => {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name.startsWith(".")) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      walk(full, entries);
      continue;
    }
    entries.push(full);
  }
  return entries;
};

const violations = [];

for (const dir of CHECK_DIRS) {
  const absolute = path.join(ROOT, dir);
  if (!fs.existsSync(absolute)) continue;
  const files = walk(absolute).filter((file) => shouldScan(file));
  for (const file of files) {
    const relative = path.relative(ROOT, file).replace(/\\/g, "/");
    if (ALLOWED_FILES.has(relative)) continue;
    const content = readText(file);
    if (content.includes("fetch(")) {
      violations.push(relative);
    }
  }
}

for (const file of ROOT_FILES) {
  const absolute = path.join(ROOT, file);
  if (!fs.existsSync(absolute)) continue;
  const content = readText(absolute);
  if (content.includes("fetch(")) {
    violations.push(file);
  }
}

if (violations.length > 0) {
  console.error("Direct fetch usage detected outside the API client:");
  violations.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log("Same-origin fetch check passed.");
