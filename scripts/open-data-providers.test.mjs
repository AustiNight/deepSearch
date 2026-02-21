import assert from "node:assert/strict";

import { createOpenDataProvider } from "../services/openDataProviders.ts";
import { getOpenDataConfig, updateOpenDataConfig, resetOpenDataConfig } from "../services/openDataConfig.ts";
import { resolveParcelFromOpenDataPortal } from "../services/openDataParcelResolution.ts";
import { buildDallasAddressVariants } from "../services/dallasEvidencePack.ts";

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
        columns: [{ fieldName: "location", dataTypeName: "location" }]
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

  const searchCall = calls.find((call) => call.target.includes("/api/catalog/v1"));
  assert.ok(searchCall, "Expected Socrata discovery call.");
  assert.equal(searchCall.body.headers["X-App-Token"], "token-123");
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
              { downloadURL: "https://data.example.org/parcel-geo.json" }
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
    portalUrl: "https://data.example.org",
    portalType: "dcat"
  });
  assert.equal(result.parcel?.parcelId, "G-1");
  assert.equal(result.resolutionMethod, "gis");
  assert.ok(result.sources?.length > 0, "Expected citation sources from open data.");
  assert.ok(result.claims?.length > 0, "Expected parcel claims with citations.");
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
await runArcGisTests();
await runDcatTests();
await runSpatialJoinParcelTest();
await runZeroCostGuardTests();
runDallasVariantTest();
resetOpenDataConfig();
