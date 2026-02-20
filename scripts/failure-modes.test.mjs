import assert from "node:assert/strict";

import { coerceReportData } from "../services/reportFormatter.ts";
import {
  resetPortalErrorMetrics,
  recordPortalError,
  getPortalErrorMetrics
} from "../services/portalErrorTelemetry.ts";
import { resolveParcelWorkflow } from "../services/parcelResolution.ts";
import { buildCitationRegistry, buildPropertyDossier } from "../services/propertyDossier.ts";

const schemaDriftReport = coerceReportData(
  {
    title: "Legacy Report",
    executiveSummary: "Legacy summary should be used when summary is missing.",
    schemaVersion: "two",
    sections: { legacySection: "Legacy body" },
    provenance: {
      totalSources: "not-a-number",
      primaryRecordCoverage: { entries: "invalid" },
      datasetCompliance: [{ portalType: "unknown" }]
    }
  },
  "Legacy Topic"
);

assert.equal(schemaDriftReport.summary, "Legacy summary should be used when summary is missing.");
assert.equal(schemaDriftReport.schemaVersion, 1);
assert.ok(schemaDriftReport.sections.length > 0, "Expected sections to be synthesized for schema drift payloads.");
assert.ok(
  schemaDriftReport.sections.some((section) => section.title === "Executive Summary"),
  "Expected executiveSummary to be lifted into a section for legacy schemas."
);
assert.equal(schemaDriftReport.provenance.totalSources, 0);
assert.equal(schemaDriftReport.provenance.primaryRecordCoverage, undefined);
assert.equal(schemaDriftReport.provenance.datasetCompliance, undefined);

resetPortalErrorMetrics();
recordPortalError({
  status: 429,
  portalType: "socrata",
  portalUrl: "https://data.example.gov",
  endpoint: "https://api.us.socrata.com/api/catalog/v1?search_context=data.example.gov&q=parcel"
});
recordPortalError({
  status: 503,
  portalType: "arcgis",
  portalUrl: "https://gis.example.gov",
  endpoint: "https://gis.example.gov/sharing/rest/search"
});

const portalMetrics = getPortalErrorMetrics();
assert.equal(portalMetrics?.total, 2);
assert.equal(portalMetrics?.byCode.http_429, 1);
assert.equal(portalMetrics?.byCode.http_503, 1);
assert.equal(portalMetrics?.byStatus?.["429"], 1);
assert.equal(portalMetrics?.byStatus?.["503"], 1);
assert.ok((portalMetrics?.samples?.length || 0) >= 2, "Expected portal error samples for 429/503 failures.");

const mixedParcelResult = await resolveParcelWorkflow(
  {
    address: "123 Main St, Plano, TX",
    normalizedAddress: "123 Main St, Plano, TX"
  },
  {
    assessorLookup: async () => [
      {
        parcelId: "123-45-678",
        situsAddress: "123 Main St, Plano, TX",
        source: "assessor"
      },
      {
        parcelId: "12345678",
        situsAddress: "123 Main St, Plano, TX",
        source: "assessor"
      }
    ]
  }
);

assert.equal(mixedParcelResult.assessorCandidates.length, 1);
assert.equal(mixedParcelResult.resolutionMethod, "assessor");
assert.ok(mixedParcelResult.parcel?.parcelId, "Expected parcel to resolve after deduping mixed formats.");
assert.ok(
  !mixedParcelResult.dataGaps.some((gap) => gap.status === "ambiguous"),
  "Mixed parcel formats should dedupe without ambiguity."
);

const missingGeometryResult = await resolveParcelWorkflow(
  {
    address: "789 Oak St, Plano, TX"
  },
  {
    geocode: async () => ({
      point: { lat: 1, lon: 1 },
      normalizedAddress: "789 Oak St, Plano, TX",
      confidence: 0.7
    }),
    assessorLookup: async () => [],
    gisParcelLayer: async () => [
      {
        parcelId: "GIS-100"
      }
    ]
  }
);

assert.ok(
  missingGeometryResult.dataGaps.some((gap) => gap.reasonCode === "parcel_not_found"),
  "Missing geometry should yield parcel_not_found DataGap when GIS join fails."
);

const baseSources = [
  {
    uri: "https://county.gov/assessor/parcel/123",
    title: "County Assessor Parcel",
    domain: "county.gov",
    provider: "openai",
    kind: "web"
  }
];

const freshRegistry = buildCitationRegistry(baseSources);
freshRegistry.sources[0].dataCurrency = { ageDays: 10 };

const staleRegistry = buildCitationRegistry(baseSources);
staleRegistry.sources[0].dataCurrency = { ageDays: 1200 };

const sections = [
  {
    title: "Parcel & Legal",
    content: "Parcel ID 123-45-678 appears in the assessor record.",
    sources: [baseSources[0].uri]
  }
];

const freshDossier = buildPropertyDossier({
  topic: "123 Main St, Plano, TX",
  addressLike: true,
  sections,
  registry: freshRegistry
});

const staleDossier = buildPropertyDossier({
  topic: "123 Main St, Plano, TX",
  addressLike: true,
  sections,
  registry: staleRegistry
});

const freshConfidence = freshDossier.claims[0]?.confidence ?? 0;
const staleConfidence = staleDossier.claims[0]?.confidence ?? 0;

assert.ok(
  freshConfidence > staleConfidence,
  "Expected stale datasets to reduce confidence relative to fresh data."
);

console.log("failure-modes.test.mjs: ok");
