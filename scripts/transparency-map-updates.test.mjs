import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const readText = (relativePath) => {
  const fullPath = path.join(ROOT, relativePath);
  return fs.readFileSync(fullPath, "utf8");
};

const requiredPatterns = [
  { file: "constants.ts", pattern: "TRANSPARENCY_MAP_INVALIDATE_EVENT" },
  { file: "data/transparencyTable.ts", pattern: "TRANSPARENCY_MAP_UPDATE_POLICY" },
  { file: "data/transparencyTable.ts", pattern: "settings-save" },
  { file: "data/transparencyTable.ts", pattern: "taxonomy-update" },
  { file: "data/transparencyTable.ts", pattern: "blueprint-update" },
  { file: "services/transparencyMapEvents.ts", pattern: "dispatchTransparencyMapInvalidate" },
  { file: "services/transparencyMapStore.ts", pattern: "buildTransparencyMapSnapshot" },
  { file: "App.tsx", pattern: "dispatchTransparencyMapInvalidate" },
  { file: "data/researchTaxonomy.ts", pattern: "dispatchTransparencyMapInvalidate" },
  { file: "components/TransparencyPanel.tsx", pattern: "TRANSPARENCY_MAP_INVALIDATE_EVENT" },
  { file: "components/TransparencyPanel.tsx", pattern: "buildTransparencyMapSnapshot" }
];

const errors = [];

for (const check of requiredPatterns) {
  const content = readText(check.file);
  if (!content.includes(check.pattern)) {
    errors.push(`${check.file} missing ${check.pattern}`);
  }
}

if (errors.length > 0) {
  console.error("Transparency map update contract check failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("transparency-map-updates.test.mjs: ok");
