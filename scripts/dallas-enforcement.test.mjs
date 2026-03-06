import assert from "node:assert/strict";

import { runDallasEvidencePack, buildDallasAddressVariants } from "../services/dallasEvidencePack.ts";
import { buildOpenDataPortalCandidates } from "../services/openDataPortalCandidates.ts";
import { geocodeAddress } from "../services/openDataGeocoding.ts";
import { resetOpenDataConfig, updateOpenDataConfig } from "../services/openDataConfig.ts";

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
    return handler(target, body);
  };
};

const runDallasAddressVariantCoverageTest = () => {
  const variants = buildDallasAddressVariants("819 S Van Buren Ave, Dallas, TX 75208");
  assert.ok(variants.includes("819 S VAN BUREN AVE"), "Expected full normalized Dallas address variant.");
  assert.ok(variants.includes("819 VAN BUREN"), "Expected direction-stripped variant.");
  assert.ok(variants.includes("S VAN BUREN AVE"), "Expected number-stripped street variant.");
  assert.ok(
    variants.includes("VAN BUREN AVE") || variants.includes("S VAN BUREN"),
    "Expected broad street-fragment variant."
  );
};

const runPortalCandidateSanitizationTest = () => {
  const malformed = buildOpenDataPortalCandidates({
    country: "US",
    state: "TX",
    county: "Dallas",
    city: "819 S Van Buren Ave Dallas"
  }, {
    includeHeuristicPortals: true
  });

  assert.ok(
    !malformed.some((url) => /819|svanburen/i.test(url)),
    `Expected malformed address-like city token to be excluded from portal heuristics. Got: ${malformed.slice(0, 5).join(", ")}`
  );
};

const runDallasPackFullHistoryQueryTest = async () => {
  const calls = [];
  updateOpenDataConfig({
    zeroCostMode: true,
    allowPaidAccess: false,
    auth: { socrataAppToken: "token-123" }
  });

  global.fetch = buildProxyFetch((target) => {
    const normalized = String(target);
    calls.push(normalized);

    if (normalized.includes("Dallas_Address_Points_Locator/GeocodeServer/findAddressCandidates")) {
      return buildResponse({
        candidates: [
          {
            address: "819 S VAN BUREN AVE, DALLAS, TX 75208",
            score: 99,
            location: { x: -96.83, y: 32.74 }
          }
        ]
      });
    }

    if (normalized.includes("/api/catalog/v1")) {
      return buildResponse({
        results: [
          { resource: { id: "qv6i-rri7", name: "Police Incidents" } },
          { resource: { id: "i2q3-6wr4", name: "311 Service Requests" } },
          { resource: { id: "hy5f-5hrv", name: "Parcel Shapefile" } }
        ]
      });
    }

    if (normalized.includes("/api/views/qv6i-rri7.json")) {
      return buildResponse({
        name: "Police Incidents",
        viewType: "tabular",
        displayType: "table",
        columns: [
          { fieldName: "incident_id", dataTypeName: "text" },
          { fieldName: "incident_date", dataTypeName: "calendar_date" },
          { fieldName: "incident_address", dataTypeName: "text" },
          { fieldName: "offense", dataTypeName: "text" },
          { fieldName: "location", dataTypeName: "location" }
        ]
      });
    }

    if (normalized.includes("/api/views/i2q3-6wr4.json")) {
      return buildResponse({
        name: "311 Service Requests",
        viewType: "tabular",
        displayType: "table",
        columns: [
          { fieldName: "service_request_number", dataTypeName: "text" },
          { fieldName: "created_date", dataTypeName: "calendar_date" },
          { fieldName: "service_request_address", dataTypeName: "text" },
          { fieldName: "service_request_type", dataTypeName: "text" },
          { fieldName: "location", dataTypeName: "location" }
        ]
      });
    }

    if (normalized.includes("/api/views/hy5f-5hrv.json")) {
      return buildResponse({
        name: "Parcel Shapefile",
        viewType: "tabular",
        displayType: "table",
        columns: [
          { fieldName: "parcel_id", dataTypeName: "text" },
          { fieldName: "site_address", dataTypeName: "text" },
          { fieldName: "location", dataTypeName: "location" }
        ]
      });
    }

    if (normalized.includes("/resource/qv6i-rri7.json")) {
      return buildResponse([
        {
          incident_id: "P-1",
          incident_date: "2025-12-12T13:00:00.000",
          incident_address: "819 S VAN BUREN AVE",
          offense: "THEFT",
          location: { type: "Point", coordinates: [-96.83, 32.74] }
        }
      ]);
    }

    if (normalized.includes("/resource/i2q3-6wr4.json")) {
      return buildResponse([
        {
          service_request_number: "SR-1",
          created_date: "2025-11-05T09:30:00.000",
          service_request_address: "819 S VAN BUREN AVE",
          service_request_type: "Code Compliance",
          location: { type: "Point", coordinates: [-96.83, 32.74] }
        }
      ]);
    }

    if (normalized.includes("/resource/hy5f-5hrv.json")) {
      return buildResponse([
        {
          parcel_id: "PARCEL-1",
          site_address: "819 S VAN BUREN AVE",
          location: { type: "Point", coordinates: [-96.83, 32.74] }
        }
      ]);
    }

    throw new Error(`Unexpected URL ${normalized}`);
  });

  const result = await runDallasEvidencePack({
    address: "819 S Van Buren Ave, Dallas, TX 75208",
    jurisdiction: {
      country: "US",
      state: "TX",
      county: "Dallas",
      city: "Dallas"
    }
  });

  const policeAttempts = result.queryAttempts.filter((attempt) => attempt.datasetKind === "police" && attempt.queryType !== "discovery");
  const serviceAttempts = result.queryAttempts.filter((attempt) => attempt.datasetKind === "service311" && attempt.queryType !== "discovery");
  const parcelAttempts = result.queryAttempts.filter((attempt) => attempt.datasetKind === "parcel" && attempt.queryType !== "discovery");

  assert.ok(policeAttempts.some((attempt) => attempt.matched > 0), "Expected police dataset address query to return rows.");
  assert.ok(serviceAttempts.some((attempt) => attempt.matched > 0), "Expected 311 dataset address query to return rows.");
  assert.ok(parcelAttempts.some((attempt) => attempt.matched > 0), "Expected parcel dataset query to return rows.");

  const allQueries = [...policeAttempts, ...serviceAttempts, ...parcelAttempts].map((attempt) => attempt.query || "").join("\n");
  assert.ok(!/2023-01-01/i.test(allQueries), "Did not expect hard-coded pre-2023 filtering in Dallas queries.");

  const policeRequest = calls.find((call) => call.includes("/resource/qv6i-rri7.json")) || "";
  const request311 = calls.find((call) => call.includes("/resource/i2q3-6wr4.json")) || "";
  assert.ok(!decodeURIComponent(policeRequest).includes("< '2023-01-01"), "Police query URL should not include pre-2023 cutoff.");
  assert.ok(!decodeURIComponent(request311).includes("< '2023-01-01"), "311 query URL should not include pre-2023 cutoff.");
};

const runGeocoderFallbackTest = async () => {
  const calls = [];
  global.fetch = buildProxyFetch((target) => {
    const normalized = String(target);
    calls.push(normalized);
    if (normalized.includes("Dallas_Address_Points_Locator/GeocodeServer/findAddressCandidates")) {
      return buildResponse({ candidates: [] });
    }
    if (normalized.includes("geocoding.geo.census.gov/geocoder/locations/onelineaddress")) {
      return buildResponse({
        result: {
          addressMatches: [
            {
              matchedAddress: "819 S VAN BUREN AVE, DALLAS, TX, 75208",
              coordinates: { x: -96.83, y: 32.74 }
            }
          ]
        }
      });
    }
    if (normalized.includes("nominatim.openstreetmap.org/search")) {
      return buildResponse([]);
    }
    throw new Error(`Unexpected URL ${normalized}`);
  });

  const geocode = await geocodeAddress({
    address: "819 S Van Buren Ave, Dallas, TX 75208",
    addressVariants: ["819 S VAN BUREN AVE DALLAS TX 75208"],
    jurisdiction: {
      country: "US",
      state: "TX",
      county: "Dallas",
      city: "Dallas"
    }
  });

  assert.ok(geocode?.point, "Expected geocode fallback chain to resolve coordinates.");
  assert.equal(geocode?.provider, "census");
  assert.ok(
    calls.some((call) => call.includes("Dallas_Address_Points_Locator/GeocodeServer/findAddressCandidates")),
    "Expected Dallas geocoder attempt before fallback."
  );
  assert.ok(
    calls.some((call) => call.includes("geocoding.geo.census.gov/geocoder/locations/onelineaddress")),
    "Expected Census geocoder fallback attempt."
  );
};

runDallasAddressVariantCoverageTest();
runPortalCandidateSanitizationTest();
await runGeocoderFallbackTest();
await runDallasPackFullHistoryQueryTest();
resetOpenDataConfig();
