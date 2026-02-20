import assert from "node:assert/strict";

import { coerceReportData } from "../services/reportFormatter.ts";
import { applySectionConfidences, buildCitationRegistry, buildPropertyDossier } from "../services/propertyDossier.ts";
import { applyScaleCompatibility, enforceAddressEvidencePolicy } from "../services/addressEvidencePolicy.ts";
import { evaluatePrimaryRecordCoverage } from "../services/primaryRecordCoverage.ts";

const fixture = {
  topic: "742 Evergreen Terrace, Springfield, IL 62704",
  jurisdiction: {
    country: "US",
    state: "IL",
    county: "Sangamon",
    city: "Springfield"
  },
  report: {
    title: "Property Governance Snapshot",
    summary: "Macro-only fixture to validate enforcement.",
    sections: [
      {
        title: "Governance",
        content: "Citywide governance context based on macro datasets.",
        sources: ["https://data.springfield.gov/resource/city-governance.json"]
      },
      {
        title: "Economy",
        content: "Metro economic indicators without parcel evidence.",
        sources: ["https://data.springfield.gov/resource/city-economy.json"]
      },
      {
        title: "Community Context",
        content: "Citywide demographic context.",
        sources: ["https://data.springfield.gov/resource/citywide-stats.json"]
      }
    ],
    provenance: {
      totalSources: 3,
      methodAudit: "Fixture: macro-only enforcement."
    },
    schemaVersion: 1
  },
  sources: [
    {
      uri: "https://data.springfield.gov/resource/city-governance.json",
      title: "Springfield Citywide Governance Indicators",
      domain: "data.springfield.gov",
      provider: "system",
      kind: "web"
    },
    {
      uri: "https://data.springfield.gov/resource/city-economy.json",
      title: "Springfield Metro Economy Dashboard",
      domain: "data.springfield.gov",
      provider: "system",
      kind: "web"
    },
    {
      uri: "https://data.springfield.gov/resource/citywide-stats.json",
      title: "Springfield Citywide Statistics",
      domain: "data.springfield.gov",
      provider: "system",
      kind: "web"
    }
  ]
};

let reportCandidate = coerceReportData(fixture.report, fixture.topic);
const sourceMap = new Map(fixture.sources.map((source) => [source.uri, source]));
let reportSources = Array.from(
  new Set(
    reportCandidate.sections.flatMap((section) => (Array.isArray(section.sources) ? section.sources : []))
  )
);
let reportSourceDetails = reportSources.map((uri) => {
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

const primaryRecordCoverage = evaluatePrimaryRecordCoverage(reportSourceDetails, fixture.jurisdiction);
const addressEvidencePolicy = enforceAddressEvidencePolicy({
  sections: reportCandidate.sections,
  sources: reportSourceDetails,
  jurisdiction: fixture.jurisdiction,
  primaryRecordCoverage
});

if (addressEvidencePolicy.sections !== reportCandidate.sections) {
  reportCandidate = {
    ...reportCandidate,
    sections: addressEvidencePolicy.sections
  };
  reportSources = Array.from(
    new Set(
      reportCandidate.sections.flatMap((section) => (Array.isArray(section.sources) ? section.sources : []))
    )
  );
  reportSourceDetails = reportSources.map((uri) => {
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
}

const citationRegistry = buildCitationRegistry(reportSourceDetails);
const propertyDossier = buildPropertyDossier({
  topic: fixture.topic,
  addressLike: true,
  jurisdiction: fixture.jurisdiction,
  sections: reportCandidate.sections,
  registry: citationRegistry,
  primaryRecordCoverage,
  dataGaps: addressEvidencePolicy.dataGaps
});

const baseSections = applySectionConfidences(reportCandidate.sections, citationRegistry, propertyDossier.dataGaps);
const scaledSections = applyScaleCompatibility(baseSections, addressEvidencePolicy.scaleCompatibility);

const governanceSection = scaledSections.find((section) => section.title === "Governance");
const economySection = scaledSections.find((section) => section.title === "Economy");
const communityBase = baseSections.find((section) => section.title === "Community Context");
const communityScaled = scaledSections.find((section) => section.title === "Community Context");

assert.ok(governanceSection, "Expected Governance section to exist.");
assert.ok(economySection, "Expected Economy section to exist.");
assert.equal(governanceSection.sources.length, 0, "Governance section should be gated and have no sources.");
assert.equal(economySection.sources.length, 0, "Economy section should be gated and have no sources.");

const gapRecordTypes = new Set(propertyDossier.dataGaps.map((gap) => gap.recordType));
assert.ok(gapRecordTypes.has("governance_section"), "Expected governance_section DataGap.");
assert.ok(gapRecordTypes.has("economy_section"), "Expected economy_section DataGap.");

assert.ok(communityBase?.confidence && communityScaled?.confidence, "Expected confidence scores for Community Context.");
assert.ok(
  (communityScaled?.confidence || 0) < (communityBase?.confidence || 0),
  "Expected scale compatibility downgrade for macro-only context section."
);

console.log("Address evidence enforcement checks passed.");
