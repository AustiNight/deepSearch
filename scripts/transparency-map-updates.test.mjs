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

const transparencyTable = readText("data/transparencyTable.ts");
const eventSourceMatch = transparencyTable.match(/eventSources:\s*\[([\s\S]*?)\]/);
const contractMatch = transparencyTable.match(
  /TRANSPARENCY_MAP_INVALIDATION_CONTRACT[\s\S]*?=\s*{([\s\S]*?)};\s*/
);

const extractQuoted = (text) => {
  const values = [];
  const matcher = /['"]([^'"]+)['"]/g;
  let match;
  while ((match = matcher.exec(text))) {
    values.push(match[1]);
  }
  return values;
};

const extractObjectKeys = (text) => {
  const keys = [];
  const matcher = /['"]([^'"]+)['"]\s*:/g;
  let match;
  while ((match = matcher.exec(text))) {
    keys.push(match[1]);
  }
  return keys;
};

const eventSources = eventSourceMatch ? extractQuoted(eventSourceMatch[1]) : [];
const contractSources = contractMatch ? extractObjectKeys(contractMatch[1]) : [];

const requiredSourceLocations = {
  "panel-open": ["components/TransparencyPanel.tsx"],
  "settings-save": ["App.tsx"],
  "settings-storage": ["components/TransparencyPanel.tsx"],
  "taxonomy-update": ["data/researchTaxonomy.ts"],
  "taxonomy-storage": ["components/TransparencyPanel.tsx"],
  "blueprint-update": ["data/researchTaxonomy.ts"]
};

const errors = [];

for (const check of requiredPatterns) {
  const content = readText(check.file);
  if (!content.includes(check.pattern)) {
    errors.push(`${check.file} missing ${check.pattern}`);
  }
}

if (!eventSourceMatch) {
  errors.push("data/transparencyTable.ts missing TRANSPARENCY_MAP_UPDATE_POLICY.eventSources");
}

if (!contractMatch) {
  errors.push("data/transparencyTable.ts missing TRANSPARENCY_MAP_INVALIDATION_CONTRACT");
}

if (eventSources.length > 0) {
  const eventSourceSet = new Set(eventSources);
  const contractSet = new Set(contractSources);
  for (const source of eventSourceSet) {
    if (!contractSet.has(source)) {
      errors.push(`TRANSPARENCY_MAP_INVALIDATION_CONTRACT missing source ${source}`);
    }
    const locations = requiredSourceLocations[source];
    if (!locations) {
      errors.push(`No dispatch assertion configured for transparency map source ${source}`);
      continue;
    }
    const missingInLocations = locations.filter((file) => {
      const content = readText(file);
      return !content.includes(`'${source}'`) && !content.includes(`"${source}"`);
    });
    if (missingInLocations.length > 0) {
      errors.push(`Source ${source} not dispatched in ${missingInLocations.join(", ")}`);
    }
  }
  for (const source of contractSet) {
    if (!eventSourceSet.has(source)) {
      errors.push(`TRANSPARENCY_MAP_UPDATE_POLICY.eventSources missing contract source ${source}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Transparency map update contract check failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("transparency-map-updates.test.mjs: ok");
