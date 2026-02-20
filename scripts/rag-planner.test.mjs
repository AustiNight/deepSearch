import assert from "node:assert/strict";

const { planSocrataDiscoveryQuery, planSocrataSodaEndpoint } = await import("../services/socrataRagPlanner.ts");

const plan = planSocrataDiscoveryQuery({
  portalUrl: "https://data.example.gov",
  query: "parcel",
  limit: 5,
  offset: 10,
  filters: {
    categories: "public safety",
    domains: "data.example.gov",
    tags: "311",
    foo: "bar"
  }
});

assert.ok(plan.endpoint.includes("api.us.socrata.com/api/catalog/v1"), "Expected catalog endpoint.");
assert.ok(plan.endpoint.includes("search_context=data.example.gov"), "Expected search_context param.");
assert.ok(plan.endpoint.includes("q=parcel"), "Expected q param.");
assert.ok(plan.endpoint.includes("limit=5"), "Expected limit param.");
assert.ok(plan.endpoint.includes("offset=10"), "Expected offset param.");
assert.ok(plan.unknownParams.includes("foo"), "Expected unknown param to be reported.");

const sodaDefault = planSocrataSodaEndpoint({ datasetId: "abcd" });
assert.equal(sodaDefault.version, "2.1");
assert.ok(sodaDefault.path.includes("/resource/abcd.json"));

const sodaV3 = planSocrataSodaEndpoint({ datasetId: "abcd", preferV3: true, hasAppToken: true });
assert.equal(sodaV3.version, "3.0");
assert.ok(sodaV3.path.includes("/api/v3/views/abcd/query.json"));

console.log("rag-planner.test.mjs: ok");
