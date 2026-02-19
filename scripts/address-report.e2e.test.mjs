import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { coerceReportData } from "../services/reportFormatter.ts";
import { applySectionConfidences, buildCitationRegistry, buildPropertyDossier } from "../services/propertyDossier.ts";
import { enforceCompliance } from "../services/complianceEnforcement.ts";
import { buildEvidenceGateReasons, evaluateEvidence } from "../services/evidenceGating.ts";
import { persistOpenDatasetMetadata } from "../services/openDataDiscovery.ts";
import { evaluatePrimaryRecordCoverage } from "../services/primaryRecordCoverage.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const fixturesPath = path.join(projectRoot, "tests/fixtures/address-report-fixture.json");
const snapshotPath = path.join(projectRoot, "tests/fixtures/address-report.snap.json");

const fixture = JSON.parse(fs.readFileSync(fixturesPath, "utf8"));

const FIXED_NOW = new Date("2025-02-01T12:00:00Z");
const RealDate = Date;
globalThis.Date = class extends RealDate {
  constructor(...args) {
    if (args.length === 0) {
      return new RealDate(FIXED_NOW);
    }
    return new RealDate(...args);
  }
  static now() {
    return FIXED_NOW.getTime();
  }
  static parse(value) {
    return RealDate.parse(value);
  }
  static UTC(...args) {
    return RealDate.UTC(...args);
  }
};

let randomSeed = 42;
Math.random = () => {
  randomSeed = (randomSeed * 1664525 + 1013904223) % 4294967296;
  return randomSeed / 4294967296;
};

const createMemoryStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    }
  };
};

globalThis.window = {
  localStorage: createMemoryStorage()
};

if (Array.isArray(fixture.datasets) && fixture.datasets.length > 0) {
  persistOpenDatasetMetadata(fixture.datasets);
}

const reportCandidate = coerceReportData(fixture.report, fixture.topic);
const reportSources = Array.from(
  new Set(
    reportCandidate.sections.flatMap((section) => (Array.isArray(section.sources) ? section.sources : []))
  )
);
const sourceMap = new Map(fixture.sources.map((source) => [source.uri, source]));
const reportSourceDetails = reportSources.map((uri) => {
  const mapped = sourceMap.get(uri);
  if (mapped) return mapped;
  return {
    uri,
    title: "",
    domain: "",
    provider: "unknown",
    kind: "unknown"
  };
});

const complianceResult = enforceCompliance(reportSourceDetails);
const provenance = {
  ...reportCandidate.provenance,
  compliance: complianceResult.summary
};
if (complianceResult.datasetCompliance.length > 0) {
  provenance.datasetCompliance = complianceResult.datasetCompliance;
}

const primaryRecordCoverage = evaluatePrimaryRecordCoverage(reportSourceDetails, fixture.jurisdiction);
provenance.primaryRecordCoverage = primaryRecordCoverage;

const citationRegistry = buildCitationRegistry(reportSourceDetails);
const propertyDossier = buildPropertyDossier({
  topic: fixture.topic,
  addressLike: true,
  jurisdiction: fixture.jurisdiction,
  sections: reportCandidate.sections,
  registry: citationRegistry,
  primaryRecordCoverage
});

const reportWithConfidence = {
  ...reportCandidate,
  sections: applySectionConfidences(reportCandidate.sections, citationRegistry, propertyDossier.dataGaps),
  provenance,
  propertyDossier
};

const evidenceStatus = evaluateEvidence(reportSourceDetails);
const snapshotData = {
  topic: fixture.topic,
  report: reportWithConfidence,
  evidence: {
    status: evidenceStatus,
    reasons: buildEvidenceGateReasons(evidenceStatus)
  }
};

const normalizedSnapshot = JSON.parse(JSON.stringify(snapshotData));

assert.ok(propertyDossier.claims.length > 0, "Expected property dossier claims to be populated.");
assert.ok(
  primaryRecordCoverage.missing.includes("code_enforcement"),
  "Expected code enforcement to be missing in primary record coverage."
);
assert.ok(
  (provenance.datasetCompliance || []).length > 0,
  "Expected dataset compliance entries from frozen dataset fixtures."
);

if (process.env.UPDATE_SNAPSHOTS === "1") {
  fs.writeFileSync(snapshotPath, `${JSON.stringify(normalizedSnapshot, null, 2)}\n`, "utf8");
  console.log("Updated address report snapshots.");
} else {
  const expected = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  assert.deepStrictEqual(normalizedSnapshot, expected);
  console.log("Address report snapshots match.");
}
