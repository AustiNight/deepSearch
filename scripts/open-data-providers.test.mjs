import assert from "node:assert/strict";

import { createOpenDataProvider } from "../services/openDataProviders.ts";
import { getOpenDataConfig, updateOpenDataConfig, resetOpenDataConfig } from "../services/openDataConfig.ts";
import { resolveParcelFromOpenDataPortal } from "../services/openDataParcelResolution.ts";
import { buildDallasAddressVariants } from "../services/dallasEvidencePack.ts";
import { resolveParcelWorkflow } from "../services/parcelResolution.ts";
import { runOpenDataParcelResolutionPhase } from "../services/openDataPhase3C.ts";

const buildResponse = (body, { status = 200, headers = {} } = {}) => {
  const ok = status >= 200 && status < 300;
  return {
    ok,
    status,
    headers: new Headers(headers),
    async json() {
      return body;
    },
    async text() {
      return typeof body === "string" ? body : JSON.stringify(body);
    }
  };
};

const buildProxyFetch = (handler) => {
  return async (url, options = {}) => {
    const targetUrl = String(url);
    if (!targetUrl.includes("/api/open-data/fetch")) {
      throw new Error(`Unexpected URL ${url}`);
    }
    const body = options?.body ? JSON.parse(options.body) : {};
    const target = body?.url || "";
    if (process.env.DEBUG_PROXY) {
      console.log("[proxy]", target);
    }
    return handler(target, body, options);
  };
};

const runSocrataTests = async () => {
  const calls = [];
  updateOpenDataConfig({ auth: { socrataAppToken: "token-123" } });
  global.fetch = buildProxyFetch((target, body) => {
    calls.push({ target, body });
    if (String(target).includes("/api/catalog/v1")) {
      return buildResponse({
        results: [
          { resource: { id: "abcd", name: "Parcel Dataset", updatedAt: "2024-01-01", description: "Parcel data" } }
        ]
      });
    }
    if (String(target).includes("/api/views/abcd.json")) {
      return buildResponse({
        name: "Parcel Dataset",
        columns: [
          { fieldName: "parcel_id", dataTypeName: "text" },
          { fieldName: "site_address", dataTypeName: "text" },
          { fieldName: "location", dataTypeName: "location" }
        ]
      });
    }
    if (String(target).includes("/resource/abcd.json")) {
      return buildResponse([
        { parcel_id: "P-123", location: { type: "Point", coordinates: [-97.1, 32.9] } }
      ]);
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const provider = createOpenDataProvider({ portalUrl: "https://data.example.gov", portalType: "socrata" });
  const datasets = await provider.discoverDatasets("parcel", 1);
  assert.equal(datasets.length, 1);
  assert.equal(datasets[0].datasetId, "abcd");
  const fields = await provider.listFields("abcd");
  assert.ok(fields.some((field) => field.isGeometry), "Expected geometry field.");
  const result = await provider.queryByText({ datasetId: "abcd", searchText: "123" });
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].attributes.parcel_id, "P-123");
  const textQueryCall = calls.find((call) => call.target.includes("/resource/abcd.json"));
  assert.ok(textQueryCall, "Expected Socrata text query call.");
  assert.ok(
    textQueryCall.target.includes("%24where="),
    "Expected field-aware Socrata text query ($where) when searchable fields are present."
  );

  const searchCall = calls.find((call) => call.target.includes("/api/catalog/v1"));
  assert.ok(searchCall, "Expected Socrata discovery call.");
  assert.equal(searchCall.body.headers["X-App-Token"], "token-123");
  assert.ok(searchCall.target.includes("domains=data.example.gov"), "Expected Socrata discovery domain filter.");
  assert.ok(searchCall.target.includes("only=datasets"), "Expected Socrata discovery dataset-only filter.");
  assert.ok(searchCall.target.includes("order=updated_at+desc"), "Expected Socrata discovery recency ordering.");
};

const runSocrataValidationTests = async () => {
  const updatedAt = new Date().toISOString();
  updateOpenDataConfig({ auth: { socrataAppToken: "token-123" } });
  global.fetch = buildProxyFetch((target) => {
    if (String(target).includes("nominatim.openstreetmap.org/search")) {
      return buildResponse([
        { lat: "0.5", lon: "0.5", display_name: "123 Main St" }
      ]);
    }
    if (String(target).includes("/api/catalog/v1")) {
      return buildResponse({
        results: [
          {
            resource: {
              id: "map-1",
              name: "Parcel Map",
              updatedAt,
              description: "Map layer",
              license: "Public Domain"
            },
            metadata: { termsOfService: "https://example.gov/terms" }
          },
          {
            resource: {
              id: "good-1",
              name: "Parcel Table",
              updatedAt,
              description: "Tabular parcel data",
              license: "Public Domain"
            },
            metadata: { termsOfService: "https://example.gov/terms" }
          }
        ]
      });
    }
    if (String(target).includes("/api/views/map-1.json")) {
      return buildResponse({
        name: "Parcel Map",
        displayType: "map",
        viewType: "map"
      });
    }
    if (String(target).includes("/api/views/good-1.json")) {
      return buildResponse({
        name: "Parcel Table",
        columns: [{ fieldName: "location", dataTypeName: "location" }]
      });
    }
    if (String(target).includes("/resource/good-1.json")) {
      return buildResponse([
        { parcel_id: "P-999", location: { type: "Point", coordinates: [-97.1, 32.9] } }
      ]);
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const result = await resolveParcelFromOpenDataPortal({
    address: "123 Main St",
    portalUrl: "https://data.example.gov",
    portalType: "socrata"
  });
  assert.equal(result.parcel?.parcelId, "P-999");
  const hasNonTabularGap = result.dataGaps.some((gap) => {
    return (gap.description || "").toLowerCase().includes("not a tabular dataset")
      || (gap.reason || "").toLowerCase().includes("not tabular");
  });
  assert.ok(hasNonTabularGap, "Expected non-tabular dataset gap.");
};

const runNodeProxyFallbackTest = async () => {
  const calls = [];
  global.fetch = async (url) => {
    const target = String(url);
    calls.push(target);
    if (target.includes("/api/open-data/fetch")) {
      throw new TypeError("Failed to parse URL from /api/open-data/fetch");
    }
    if (target.includes("/api/catalog/v1")) {
      return buildResponse({
        results: [
          { resource: { id: "fall-1", name: "Parcel Dataset", updatedAt: "2024-01-01", description: "Parcel data" } }
        ]
      });
    }
    if (target.includes("/api/views/fall-1.json")) {
      return buildResponse({
        name: "Parcel Dataset",
        columns: [
          { fieldName: "parcel_id", dataTypeName: "text" },
          { fieldName: "site_address", dataTypeName: "text" }
        ]
      });
    }
    if (target.includes("/resource/fall-1.json")) {
      return buildResponse([
        { parcel_id: "NF-1", site_address: "123 MAIN ST" }
      ]);
    }
    throw new Error(`Unexpected URL ${target}`);
  };

  const provider = createOpenDataProvider({ portalUrl: "https://fallback.example.gov", portalType: "socrata" });
  const datasets = await provider.discoverDatasets("parcel", 1);
  assert.equal(datasets.length, 1);
  const result = await provider.queryByText({ datasetId: "fall-1", searchText: "123 MAIN ST" });
  assert.equal(result.records.length, 1);
  assert.ok(calls.includes("/api/open-data/fetch"), "Expected initial proxy call attempt.");
  assert.ok(
    calls.some((call) => call.startsWith("https://") && (call.includes("/api/catalog/v1") || call.includes("/api/views/fall-1.json"))),
    "Expected direct fetch fallback to target endpoint."
  );
};

const runArcGisTests = async () => {
  const calls = [];
  global.fetch = buildProxyFetch((target, body) => {
    calls.push({ target, body });
    if (String(target).includes("/sharing/rest/search")) {
      return buildResponse({
        results: [
          { id: "item-1", title: "Parcel Layer", url: "https://gis.example.gov/arcgis/rest/services/Parcels/FeatureServer" }
        ]
      });
    }
    if (String(target).includes("/sharing/rest/content/items/item-1")) {
      return buildResponse({
        id: "item-1",
        title: "Parcel Layer",
        url: "https://gis.example.gov/arcgis/rest/services/Parcels/FeatureServer",
        modified: 1700000000000
      });
    }
    if (String(target).endsWith("FeatureServer?f=json")) {
      return buildResponse({ layers: [{ id: 0, name: "Parcels" }] });
    }
    if (String(target).endsWith("FeatureServer/0?f=json")) {
      return buildResponse({ fields: [{ name: "SITE_ADDR", type: "esriFieldTypeString" }] });
    }
    if (String(target).includes("FeatureServer/0/query")) {
      return buildResponse({
        features: [
          {
            attributes: { SITE_ADDR: "123 Main St", PARCEL_ID: "ARC-1" },
            geometry: { rings: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] }
          }
        ],
        exceededTransferLimit: false
      });
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const provider = createOpenDataProvider({ portalUrl: "https://gis.example.gov", portalType: "arcgis" });
  const datasets = await provider.discoverDatasets("parcel", 1);
  assert.equal(datasets.length, 1);
  const result = await provider.queryByGeometry({
    datasetId: "item-1",
    point: { lat: 0.5, lon: 0.5 }
  });
  assert.equal(result.records.length, 1);
  const queryCall = calls.find((call) => call.target.includes("FeatureServer/0/query"));
  assert.ok(queryCall && queryCall.target.includes("outSR=4326"), "Expected ArcGIS query with outSR=4326.");
};

const runDcatTests = async () => {
  global.fetch = buildProxyFetch((target) => {
    if (String(target).endsWith("/data.json")) {
      return buildResponse({
        dataset: [
          {
            identifier: "d1",
            title: "Parcel Data",
            distribution: [
              { downloadURL: "https://data.example.org/parcel.json" }
            ]
          }
        ]
      });
    }
    if (String(target).includes("parcel.json")) {
      return buildResponse([
        {
          parcel_id: "D-1",
          address: "123 Main St",
          geometry: {
            type: "Polygon",
            coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
          }
        }
      ]);
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const provider = createOpenDataProvider({ portalUrl: "https://data.example.org", portalType: "dcat" });
  const datasets = await provider.discoverDatasets("parcel", 1);
  if (process.env.DEBUG_PROXY) {
    console.log("[dcat datasets]", datasets);
  }
  assert.equal(datasets.length, 1);
  const textResult = await provider.queryByText({ datasetId: "d1", searchText: "123 Main" });
  assert.equal(textResult.records.length, 1);
  const geoResult = await provider.queryByGeometry({
    datasetId: "d1",
    point: { lat: 0.5, lon: 0.5 }
  });
  assert.equal(geoResult.records.length, 1);
};

const runDcatWeightedMatchingTest = async () => {
  global.fetch = buildProxyFetch((target) => {
    if (String(target).endsWith("/data.json")) {
      return buildResponse({
        dataset: [
          {
            identifier: "weighted-1",
            title: "County Assessor PIN Roll",
            description: "Official property parcel roll",
            distribution: [
              { downloadURL: "https://weighted.example.org/assessor.json" }
            ]
          }
        ]
      });
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const provider = createOpenDataProvider({ portalUrl: "https://weighted.example.org", portalType: "dcat" });
  const datasets = await provider.discoverDatasets("parcel assessor apn pin property", 5);
  assert.ok(datasets.some((dataset) => dataset.datasetId === "weighted-1"), "Expected token-weighted DCAT discovery match.");
};

const runUnknownPortalProviderTest = async () => {
  global.fetch = buildProxyFetch((target) => {
    if (String(target).includes("/api/catalog/v1")) {
      return buildResponse({
        results: [
          { resource: { id: "ukn1-2345", name: "Parcel Registry", description: "Parcel records", updatedAt: "2025-01-01" } }
        ]
      });
    }
    if (String(target).includes("/api/views/ukn1-2345.json")) {
      return buildResponse({
        name: "Parcel Registry",
        columns: [{ fieldName: "parcel_id", dataTypeName: "text" }]
      });
    }
    if (String(target).includes("/resource/ukn1-2345.json")) {
      return buildResponse([
        { parcel_id: "U-1", site_address: "123 Main St" }
      ]);
    }
    if (String(target).includes("/sharing/rest/search")) {
      return buildResponse({ results: [] });
    }
    if (String(target).endsWith("/data.json") || String(target).endsWith("/catalog.json")) {
      return buildResponse({ dataset: [] });
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const provider = createOpenDataProvider({ portalUrl: "https://records.example.us", portalType: "unknown" });
  const datasets = await provider.discoverDatasets("parcel", 3);
  assert.ok(datasets.length > 0, "Expected unknown provider to probe multiple portal backends.");
  const result = await provider.queryByText({ datasetId: "ukn1-2345", searchText: "123 Main" });
  assert.equal(result.records.length, 1);
};

const runSpatialJoinParcelTest = async () => {
  global.fetch = buildProxyFetch((target) => {
    if (String(target).includes("nominatim.openstreetmap.org/search")) {
      return buildResponse([
        { lat: "0.5", lon: "0.5", display_name: "123 Main St" }
      ]);
    }
    if (String(target).endsWith("/data.json")) {
      return buildResponse({
        dataset: [
          {
            identifier: "parcel-layer",
            title: "Parcel Layer",
            license: "Public Domain",
            termsOfUse: "Public use",
            distribution: [
              { downloadURL: "https://spatial.example.org/parcel-geo.json" }
            ]
          }
        ]
      });
    }
    if (String(target).includes("parcel-geo.json")) {
      return buildResponse([
        {
          parcel_id: "G-1",
          geometry: {
            type: "Polygon",
            coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
          }
        }
      ]);
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const result = await resolveParcelFromOpenDataPortal({
    address: "123 Main St",
    portalUrl: "https://spatial.example.org",
    portalType: "dcat"
  });
  assert.equal(result.parcel?.parcelId, "G-1");
  assert.equal(result.resolutionMethod, "gis");
  assert.ok(result.sources?.length > 0, "Expected citation sources from open data.");
  assert.ok(result.claims?.length > 0, "Expected parcel claims with citations.");
};

const runSecondaryEvidenceClaimsTest = async () => {
  global.fetch = buildProxyFetch((target) => {
    if (String(target).includes("nominatim.openstreetmap.org/search")) {
      return buildResponse([]);
    }
    if (String(target).endsWith("/data.json")) {
      return buildResponse({
        dataset: [
          {
            identifier: "parcel-main",
            title: "Parcel Assessment Records",
            distribution: [
              { downloadURL: "https://multisource.example.org/parcel.json" }
            ]
          },
          {
            identifier: "permit-main",
            title: "Building Permit Records",
            distribution: [
              { downloadURL: "https://multisource.example.org/permits.json" }
            ]
          }
        ]
      });
    }
    if (String(target).includes("/parcel.json")) {
      return buildResponse([
        { parcel_id: "PX-100", site_address: "123 Main St" }
      ]);
    }
    if (String(target).includes("/permits.json")) {
      return buildResponse([
        { permit_id: "PM-1", parcel_id: "PX-100", permit_address: "123 Main St" }
      ]);
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const result = await resolveParcelFromOpenDataPortal({
    address: "123 Main St",
    portalUrl: "https://multisource.example.org",
    portalType: "dcat"
  });
  const sourceUrls = (result.sources || []).map((source) => source.url || "");
  assert.ok(
    sourceUrls.some((url) => url.includes("parcel-main")) && sourceUrls.some((url) => url.includes("permit-main")),
    "Expected parcel and permit datasets to both contribute citation sources."
  );
  assert.ok(
    (result.claims || []).some((claim) => claim.fieldPath === "/permitsAndCode/permits"),
    "Expected secondary record claim for permits."
  );
};

const runAssessorAmbiguityFallsBackToGisTest = async () => {
  const result = await resolveParcelWorkflow(
    {
      address: "123 Main St",
      normalizedAddress: "123 MAIN ST"
    },
    {
      geocode: async () => ({
        point: { lat: 0.5, lon: 0.5 }
      }),
      assessorLookup: async () => ([
        { parcelId: "A-1", source: "assessor", situsAddress: "123 MAIN ST" },
        { parcelId: "A-2", source: "assessor", situsAddress: "123 MAIN STREET" }
      ]),
      gisParcelLayer: async () => ([
        {
          parcelId: "GIS-1",
          situsAddress: "123 MAIN ST",
          geometry: {
            type: "Polygon",
            coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
          }
        }
      ])
    }
  );
  assert.equal(result.parcel?.parcelId, "GIS-1");
  assert.equal(result.resolutionMethod, "gis");
};

const runAssessorUnitTieBreakTest = async () => {
  const result = await resolveParcelWorkflow(
    {
      address: "510 W ERIE ST 2-1, CHICAGO, IL",
      normalizedAddress: "510 W ERIE ST 2-1, CHICAGO, IL"
    },
    {
      geocode: async () => null,
      assessorLookup: async () => ([
        { parcelId: "P-UNIT-1", source: "assessor", situsAddress: "510 W ERIE ST 2-1" },
        { parcelId: "P-UNIT-2", source: "assessor", situsAddress: "510 W ERIE ST 2-10" }
      ])
    }
  );
  assert.equal(result.parcel?.parcelId, "P-UNIT-1");
  assert.equal(result.resolutionMethod, "assessor");
};

const runAssessorYearTieBreakTest = async () => {
  const result = await resolveParcelWorkflow(
    {
      address: "501 N CLINTON ST P-436, CHICAGO, IL",
      normalizedAddress: "501 N CLINTON ST P-436, CHICAGO, IL"
    },
    {
      geocode: async () => null,
      assessorLookup: async () => ([
        {
          parcelId: "PIN-OLD",
          source: "assessor",
          situsAddress: "501 N CLINTON ST P-436",
          attributes: { year: "2001", pin: "17091121061434" }
        },
        {
          parcelId: "PIN-NEW",
          source: "assessor",
          situsAddress: "501 N CLINTON ST P-436",
          attributes: { year: "2024", pin: "17091121071434" }
        }
      ])
    }
  );
  assert.equal(result.parcel?.parcelId, "PIN-NEW");
  assert.equal(result.resolutionMethod, "assessor");
};

const runPhase3COrchestrationTest = async () => {
  const attempts = [];
  const result = await runOpenDataParcelResolutionPhase(
    {
      topic: "123 Main St, Plano, TX",
      portalCandidates: [
        "https://skip.example.gov",
        "https://empty.example.gov",
        "https://success.example.gov",
        "https://later.example.gov"
      ],
      phaseLabel: "PHASE 3C: OPEN DATA PARCEL"
    },
    {
      canUseExternalCall: (_phase, portalUrl) => {
        if (portalUrl.includes("skip.")) {
          return { allowed: false, reason: "external_call_budget", detail: "cap reached" };
        }
        return { allowed: true, reason: null };
      },
      normalizeSource: (source) => {
        if (!source?.url) return null;
        return {
          uri: source.url,
          title: source.title || "Open data source",
          domain: "example.gov",
          provider: "system",
          kind: "citation"
        };
      },
      resolvePortal: async ({ portalUrl }) => {
        attempts.push(portalUrl);
        if (portalUrl.includes("empty.")) {
          return {
            parcel: undefined,
            datasetsUsed: [],
            sources: [],
            dataGaps: [{ id: "gap-1", description: "No parcel", reason: "none", status: "missing" }]
          };
        }
        if (portalUrl.includes("later.")) {
          return {
            parcel: { parcelId: "P-888" },
            resolutionMethod: "assessor",
            datasetsUsed: [{ datasetId: "d2" }],
            sources: [{ url: `${portalUrl}/resource/d2`, title: "Later parcel table" }],
            dataGaps: []
          };
        }
        return {
          parcel: { parcelId: "P-777" },
          resolutionMethod: "gis",
          datasetsUsed: [{ datasetId: "d1" }],
          sources: [{ url: `${portalUrl}/resource/d1`, title: "Parcel table" }],
          dataGaps: [{ id: "gap-2", description: "Minor", reason: "partial", status: "missing" }]
        };
      }
    }
  );

  assert.deepEqual(attempts, ["https://empty.example.gov", "https://success.example.gov", "https://later.example.gov"]);
  assert.equal(result.attempts.length, 4);
  assert.ok(result.attempts[0].skipped, "Expected first portal to be skipped by guardrail.");
  assert.equal(result.finding?.portalUrl, "https://success.example.gov");
  assert.equal(result.finding?.parcelId, "P-777");
  assert.equal(Array.isArray(result.findings) ? result.findings.length : 0, 2);
  assert.ok((result.dataGaps || []).length >= 2, "Expected data gaps to aggregate across attempts.");
};

const runCalibrationModePublicAssessorOverrideTest = async () => {
  updateOpenDataConfig({
    zeroCostMode: true,
    allowPaidAccess: false,
    auth: {}
  });
  global.fetch = buildProxyFetch((target) => {
    if (String(target).includes("nominatim.openstreetmap.org/search")) {
      return buildResponse([
        { lat: "0.5", lon: "0.5", display_name: "120 Zinnia Ln" }
      ]);
    }
    if (String(target).endsWith("/data.json")) {
      return buildResponse({
        dataset: [
          {
            identifier: "parcel-assessor-1",
            title: "County Parcel Assessor Data",
            description: "Official parcel dataset",
            distribution: [
              { downloadURL: "https://data.county.example.gov/parcel.json" }
            ]
          }
        ]
      });
    }
    if (String(target).includes("/parcel.json")) {
      return buildResponse([
        {
          parcel_id: "CAL-1",
          site_address: "120 ZINNIA LN",
          geometry: {
            type: "Polygon",
            coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
          }
        }
      ]);
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const withoutCalibration = await resolveParcelFromOpenDataPortal({
    address: "120 ZINNIA LN, HUTTO, TX 78634",
    portalUrl: "https://data.county.example.gov",
    portalType: "dcat"
  });
  assert.equal(withoutCalibration.parcel?.parcelId, "CAL-1");

  const withCalibration = await resolveParcelFromOpenDataPortal({
    address: "120 ZINNIA LN, HUTTO, TX 78634",
    portalUrl: "https://data.county.example.gov",
    portalType: "dcat",
    calibration: {
      enabled: true,
      includeDiagnostics: true,
      relaxPublicAssessorReviewGates: true
    }
  });
  assert.equal(withCalibration.parcel?.parcelId, "CAL-1");
  assert.ok(
    Array.isArray(withCalibration.diagnostics?.evaluatedDatasets) && withCalibration.diagnostics.evaluatedDatasets.length > 0,
    "Expected calibration mode diagnostics to include evaluated datasets."
  );
};

const runAssessorQueryFanOutTest = async () => {
  updateOpenDataConfig({
    zeroCostMode: true,
    allowPaidAccess: false,
    auth: {}
  });
  global.fetch = buildProxyFetch((target) => {
    if (String(target).includes("nominatim.openstreetmap.org/search")) {
      return buildResponse([]);
    }
    if (String(target).endsWith("/data.json")) {
      return buildResponse({
        dataset: [
          {
            identifier: "parcel-fanout-1",
            title: "County Parcel Assessor Data",
            description: "Official parcel dataset",
            distribution: [
              { downloadURL: "https://fanout.example.gov/parcel.csv" }
            ]
          }
        ]
      });
    }
    if (String(target).includes("/parcel.csv")) {
      return buildResponse("parcel_id,site_address\nFAN-1,120 ZINNIA LN");
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const result = await resolveParcelFromOpenDataPortal({
    address: "120 ZINNIA LN, HUTTO, TX 78634",
    portalUrl: "https://fanout.example.gov",
    portalType: "dcat",
    calibration: {
      enabled: true,
      relaxPublicAssessorReviewGates: true
    }
  });
  assert.equal(result.parcel?.parcelId, "FAN-1");
  assert.equal(result.resolutionMethod, "assessor");
};

const runAssessorUnitRecallFanOutTest = async () => {
  updateOpenDataConfig({
    zeroCostMode: true,
    allowPaidAccess: false,
    auth: {}
  });
  const rows = [];
  for (let i = 101; i <= 180; i += 1) {
    rows.push(`R-${i},"1401 LITTLE ELM TRL #${i}, CEDAR PARK, TX 78613"`);
  }
  rows.push('R529748,"1401 LITTLE ELM TRL #409, CEDAR PARK, TX 78613"');
  const csv = ["parcel_id,site_address", ...rows].join("\n");

  global.fetch = buildProxyFetch((target) => {
    if (String(target).includes("nominatim.openstreetmap.org/search")) {
      return buildResponse([]);
    }
    if (String(target).endsWith("/data.json")) {
      return buildResponse({
        dataset: [
          {
            identifier: "parcel-unit-recall",
            title: "County Parcel Assessor Data",
            description: "Official parcel dataset",
            distribution: [
              { downloadURL: "https://fanout-unit.example.gov/unit-recall.csv" }
            ]
          }
        ]
      });
    }
    if (String(target).includes("/unit-recall.csv")) {
      return buildResponse(csv);
    }
    throw new Error(`Unexpected URL ${target}`);
  });

  const result = await resolveParcelFromOpenDataPortal({
    address: "1401 LITTLE ELM TRL #409, CEDAR PARK, TX 78613",
    portalUrl: "https://fanout-unit.example.gov",
    portalType: "dcat",
    calibration: {
      enabled: true,
      relaxPublicAssessorReviewGates: true
    }
  });
  assert.equal(
    result.parcel?.parcelId,
    "R529748",
    JSON.stringify({
      parcel: result.parcel,
      method: result.resolutionMethod,
      candidates: (result.assessorCandidates || []).slice(0, 5).map((candidate) => ({
        parcelId: candidate.parcelId,
        situsAddress: candidate.situsAddress
      })),
      diagnostics: result.diagnostics,
      gaps: (result.dataGaps || []).slice(0, 3).map((gap) => gap.reason)
    })
  );
  assert.equal(result.resolutionMethod, "assessor");
};

const runZeroCostGuardTests = () => {
  updateOpenDataConfig({
    zeroCostMode: true,
    allowPaidAccess: true,
    auth: { socrataAppToken: "token-123" }
  });
  const config = getOpenDataConfig();
  assert.equal(config.zeroCostMode, true);
  assert.equal(config.allowPaidAccess, false);
};

const runDallasVariantTest = () => {
  const variants = buildDallasAddressVariants("819 S Van Buren Ave, Dallas, TX");
  assert.ok(variants.includes("819 S VAN BUREN AVE"), "Expected full suffix variant.");
  assert.ok(variants.includes("819 S VAN BUREN"), "Expected suffix-stripped variant.");
  assert.ok(variants.includes("819 VAN BUREN"), "Expected direction-stripped variant.");
};

await runSocrataTests();
await runSocrataValidationTests();
await runNodeProxyFallbackTest();
await runArcGisTests();
await runDcatTests();
await runDcatWeightedMatchingTest();
await runUnknownPortalProviderTest();
await runSpatialJoinParcelTest();
await runSecondaryEvidenceClaimsTest();
await runAssessorAmbiguityFallsBackToGisTest();
await runAssessorUnitTieBreakTest();
await runAssessorYearTieBreakTest();
await runPhase3COrchestrationTest();
await runCalibrationModePublicAssessorOverrideTest();
await runAssessorQueryFanOutTest();
await runAssessorUnitRecallFanOutTest();
await runZeroCostGuardTests();
runDallasVariantTest();
resetOpenDataConfig();
