import assert from "node:assert/strict";

const { buildSocrataSodaEndpoint, planSocrataDiscoveryQuery, planSocrataSodaEndpoint } = await import("../services/socrataRagPlanner.ts");

const plan = planSocrataDiscoveryQuery({
  portalUrl: "https://data.example.gov",
  query: "parcel",
  limit: 5,
  offset: 10,
  filters: {
    categories: "public safety",
    domains: "data.example.gov",
    tags: "311",
    order: "updated_at desc",
    foo: "bar"
  }
});

assert.ok(plan.endpoint.includes("api.us.socrata.com/api/catalog/v1"), "Expected catalog endpoint.");
assert.ok(plan.endpoint.includes("search_context=data.example.gov"), "Expected search_context param.");
assert.ok(plan.endpoint.includes("q=parcel"), "Expected q param.");
assert.ok(plan.endpoint.includes("limit=5"), "Expected limit param.");
assert.ok(plan.endpoint.includes("offset=10"), "Expected offset param.");
assert.equal(plan.params.order, "updated_at desc");
assert.ok(plan.unknownParams.includes("foo"), "Expected unknown param to be reported.");
assert.ok(!plan.endpoint.includes("foo="), "Expected unknown param to be rejected.");
assert.ok(!plan.unknownParams.includes("categories"));
assert.ok(!plan.unknownParams.includes("domains"));
assert.ok(!plan.unknownParams.includes("tags"));

const planClamped = planSocrataDiscoveryQuery({
  portalUrl: "https://data.example.gov",
  query: "parcel",
  limit: 5000
});
assert.equal(planClamped.params.limit, "1000", "Expected limit to clamp to 1000.");

const planWithCustom = planSocrataDiscoveryQuery({
  portalUrl: "https://data.example.gov",
  query: "parcel",
  filters: {
    custom_key: "value"
  },
  allowCustomMetadata: true
});
assert.ok(planWithCustom.endpoint.includes("custom_key=value"), "Expected custom metadata param to be included when allowed.");
assert.ok(
  planWithCustom.warnings.some((warning) => warning.includes("Custom metadata param")),
  "Expected custom metadata warning."
);

const sodaDefault = planSocrataSodaEndpoint({ datasetId: "abcd" });
assert.equal(sodaDefault.version, "2.1");
assert.ok(sodaDefault.path.includes("/resource/abcd.json"));

const sodaV3 = planSocrataSodaEndpoint({ datasetId: "abcd", preferV3: true, hasAppToken: true });
assert.equal(sodaV3.version, "3.0");
assert.ok(sodaV3.path.includes("/api/v3/views/abcd/query.json"));

const sodaUrlDefault = buildSocrataSodaEndpoint({
  portalUrl: "https://data.example.gov",
  datasetId: "abcd",
  params: new URLSearchParams({ "$limit": "1" })
});
assert.ok(sodaUrlDefault.url.startsWith("https://data.example.gov/resource/abcd.json?"));

const sodaUrlV3 = buildSocrataSodaEndpoint({
  portalUrl: "data.example.gov",
  datasetId: "abcd",
  preferV3: true,
  hasAppToken: true
});
assert.ok(sodaUrlV3.url.startsWith("https://data.example.gov/api/v3/views/abcd/query.json"));

console.log("rag-planner.test.mjs: ok");
