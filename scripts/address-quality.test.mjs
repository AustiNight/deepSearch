import assert from "node:assert/strict";

import { normalizeAddressVariants } from "../services/addressNormalization.ts";
import { resolveParcelWorkflow } from "../services/parcelResolution.ts";
import { buildCitationRegistry, buildPropertyDossier } from "../services/propertyDossier.ts";
import { evaluateEvidence, buildEvidenceGateReasons } from "../services/evidenceGating.ts";
import {
  MIN_EVIDENCE_TOTAL_SOURCES,
  MIN_EVIDENCE_AUTHORITATIVE_SOURCES,
  MIN_EVIDENCE_AUTHORITY_SCORE
} from "../constants.ts";

const makeSource = (overrides) => ({
  uri: "https://example.com/source",
  title: "Example Source",
  domain: "example.com",
  provider: "openai",
  kind: "web",
  ...overrides
});

const addressVariants = normalizeAddressVariants(
  "123 North Main Street Apt 5B, Springfield, IL 62704"
);
assert.ok(addressVariants.length > 0, "Expected normalized address variants.");
assert.ok(
  addressVariants.some((variant) =>
    variant.includes("123 N Main St") && variant.includes("Apt 5B")
  ),
  "Expected direction + street suffix + unit variant."
);
assert.ok(
  addressVariants.some((variant) => variant.includes("#5B")),
  "Expected hash unit variant."
);

const multiParcelResult = await resolveParcelWorkflow(
  {
    address: "456 Elm Street, Plano, TX",
    normalizedAddress: "456 Elm Street, Plano, TX"
  },
  {
    assessorLookup: async () => [
      {
        parcelId: "P-100",
        situsAddress: "456 Elm Street, Plano, TX",
        source: "assessor"
      },
      {
        parcelId: "P-200",
        situsAddress: "456 Elm Street, Plano, TX",
        source: "assessor"
      }
    ]
  }
);
assert.ok(
  multiParcelResult.dataGaps.some((gap) => gap.status === "ambiguous" && gap.fieldPath === "/subject/parcelId"),
  "Expected ambiguous parcel gap for multiple assessor matches."
);
assert.ok(!multiParcelResult.parcel, "Expected no parcel selected for ambiguous assessor matches.");

let capturedUnitVariants = [];
const unitOnlyResult = await resolveParcelWorkflow(
  {
    address: "Apt 4B"
  },
  {
    assessorLookup: async (input) => {
      capturedUnitVariants = input.addressVariants;
      return [];
    }
  }
);
assert.ok(
  capturedUnitVariants.includes("Apt 4B"),
  "Expected unit-only address to be preserved in variants."
);
assert.ok(
  unitOnlyResult.dataGaps.some((gap) => gap.reasonCode === "parcel_not_found"),
  "Expected parcel_not_found gap for unit-only address without matches."
);

const ruralResult = await resolveParcelWorkflow(
  {
    address: "RR 2 Box 123, Ruralville, TX"
  },
  {
    geocode: async () => ({
      point: { lat: 1, lon: 1 },
      normalizedAddress: "RR 2 Box 123, Ruralville, TX",
      confidence: 0.8
    }),
    gisParcelLayer: async () => [
      {
        parcelId: "GIS-123",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [0, 2],
              [2, 2],
              [2, 0],
              [0, 0]
            ]
          ]
        }
      }
    ]
  }
);
assert.equal(ruralResult.resolutionMethod, "gis");
assert.equal(ruralResult.parcel?.parcelId, "GIS-123");

const evidenceSources = [
  makeSource({
    uri: "https://county.gov/assessor/parcel/123",
    title: "County Assessor Parcel Records",
    domain: "county.gov"
  }),
  makeSource({
    uri: "https://city.gov/zoning/map",
    title: "City Zoning Map",
    domain: "city.gov"
  }),
  makeSource({
    uri: "https://example.com/neighborhood-report",
    title: "Neighborhood Report",
    domain: "example.com"
  })
];

const evidenceStatus = evaluateEvidence(evidenceSources);
assert.equal(evidenceStatus.totalSources, MIN_EVIDENCE_TOTAL_SOURCES);
assert.ok(
  evidenceStatus.authoritativeSources >= MIN_EVIDENCE_AUTHORITATIVE_SOURCES,
  "Expected at least one authoritative source."
);
assert.ok(
  evidenceStatus.maxAuthorityScore >= MIN_EVIDENCE_AUTHORITY_SCORE,
  "Expected authority score to meet threshold."
);
assert.ok(evidenceStatus.meetsAll, "Expected evidence gate to pass.");

const failingEvidenceStatus = evaluateEvidence([
  makeSource({
    uri: "https://zillow.com/listing/123",
    title: "Zillow Listing",
    domain: "zillow.com"
  }),
  makeSource({
    uri: "https://reddit.com/r/realestate/comments/1",
    title: "Reddit Thread",
    domain: "reddit.com"
  })
]);
const evidenceReasons = buildEvidenceGateReasons(failingEvidenceStatus);
assert.ok(
  evidenceReasons.some((reason) => reason.startsWith("total_sources_below_min")),
  "Expected total sources gate failure reason."
);
assert.ok(
  evidenceReasons.some((reason) => reason.startsWith("authoritative_sources_below_min")),
  "Expected authoritative sources gate failure reason."
);
assert.ok(
  evidenceReasons.some((reason) => reason.startsWith("authority_score_below_min")),
  "Expected authority score gate failure reason."
);

const dossierSources = [
  makeSource({
    uri: "https://county.gov/assessor/parcel/456",
    title: "County Assessor Parcel Records",
    domain: "county.gov"
  }),
  makeSource({
    uri: "https://county.gov/tax/roll/2023",
    title: "County Tax Roll 2023",
    domain: "county.gov"
  })
];

const registry = buildCitationRegistry(dossierSources);
const dossier = buildPropertyDossier({
  topic: "123 Main Street, Plano, TX",
  addressLike: true,
  jurisdiction: { city: "Plano", state: "TX" },
  sections: [
    {
      title: "Parcel & Legal",
      content: "Parcel ID 456-789 appears in the assessor record.",
      sources: [dossierSources[0].uri]
    },
    {
      title: "Tax & Appraisal",
      content: "Assessment year 2023 shows updated values.",
      sources: [dossierSources[1].uri]
    }
  ],
  registry,
  primaryRecordCoverage: {
    complete: false,
    entries: [
      {
        recordType: "permits",
        status: "missing",
        availabilityStatus: "missing"
      }
    ],
    missing: ["permits"],
    unavailable: [],
    generatedAt: "2025-01-01"
  }
});

assert.ok(dossier.subject.normalizedAddress, "Expected normalized address on dossier subject.");
assert.ok(
  dossier.claims.some((claim) => claim.fieldPath === "/parcel"),
  "Expected parcel claim to be populated."
);
assert.ok(
  dossier.claims.some((claim) => claim.fieldPath === "/taxAppraisal"),
  "Expected tax appraisal claim to be populated."
);
assert.ok(
  dossier.dataGaps.some((gap) => gap.recordType === "permits"),
  "Expected primary record coverage gap for permits."
);

console.log("address-quality.test.mjs: ok");
