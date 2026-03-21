import assert from "node:assert/strict";

import {
  buildIndividualRecallQueries,
  buildPersonNameVariants,
  extractLikelyPersonName
} from "../services/personDiscovery.ts";

const topic = "Chef Margaret Alvis of Dallas Texas";

const extracted = extractLikelyPersonName(topic);
assert.equal(extracted, "Margaret Alvis", "Expected role/location stripping for person topic.");

const variants = buildPersonNameVariants(topic);
assert.ok(variants.includes("Margaret Alvis"), "Expected canonical name variant.");
assert.ok(variants.some((value) => value.includes("Alvis")), "Expected surname-based variant.");

const queries = buildIndividualRecallQueries({
  topic,
  nameVariants: variants,
  city: "Dallas",
  state: "TX"
});

assert.ok(
  queries.some((query) => query.includes("\"Margaret Alvis\" official website")),
  "Expected official website recall query."
);
assert.ok(
  queries.some((query) => query.startsWith("site:instagram.com")),
  "Expected social recall query for Instagram."
);
assert.ok(
  queries.some((query) => query.includes("\"Dallas TX\"")),
  "Expected location-aware recall query."
);

console.log("person discovery test ok");
