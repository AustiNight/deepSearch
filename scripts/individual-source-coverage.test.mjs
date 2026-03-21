import assert from "node:assert/strict";

import {
  buildIndividualVerificationQueries,
  classifyIndividualSourceClass,
  computeIndividualSourceCoverage
} from "../services/personDiscovery.ts";

const coverage = computeIndividualSourceCoverage([
  { uri: "https://www.tabc.texas.gov/public-information/tabc-public-inquiry/" },
  { uri: "https://www.dallasnews.com/food/2026/01/01/chef-profile/" },
  { uri: "https://www.linkedin.com/in/margaret-alvis/" },
  { uri: "https://www.linkedin.com/in/margaret-alvis/" }
]);

assert.equal(coverage.meetsAll, true, "Expected one domain for each individual coverage class.");
assert.equal(coverage.counts.official, 1);
assert.equal(coverage.counts.news, 1);
assert.equal(coverage.counts.social, 1);

assert.equal(
  classifyIndividualSourceClass({ uri: "https://www.linkedin.com/in/jane-doe/" }),
  "social",
  "LinkedIn should classify as social."
);
assert.equal(
  classifyIndividualSourceClass({ uri: "https://news.google.com/articles/ABC" }),
  "news",
  "news.google.com should classify as news."
);
assert.equal(
  classifyIndividualSourceClass({ uri: "https://city.gov/records" }),
  "official",
  ".gov should classify as official."
);

const queries = buildIndividualVerificationQueries({
  topic: "Chef Margaret Alvis of Dallas Texas",
  nameVariants: ["Margaret Alvis", "Alvis, Margaret"],
  city: "Dallas",
  state: "TX",
  missingClasses: ["news", "social"]
});

assert.ok(queries.some((query) => query.includes("site:news.google.com")), "Expected a news verification query.");
assert.ok(queries.some((query) => query.includes("site:linkedin.com")), "Expected a social verification query.");
assert.ok(
  !queries.some((query) => query.includes("site:.gov")),
  "Did not expect official-class queries when official coverage is already satisfied."
);

console.log("individual source coverage test ok");
