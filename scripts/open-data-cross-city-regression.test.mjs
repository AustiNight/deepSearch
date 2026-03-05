import assert from "node:assert/strict";
import { buildOpenDataPortalCandidates } from "../services/openDataPortalCandidates.ts";
import { resolveCityOpenDataProfile } from "../services/cityOpenDataProfiles.ts";
import { resetOpenDataConfig, updateOpenDataConfig } from "../services/openDataConfig.ts";

const CROSS_CITY_SUITE = [
  {
    id: "dallas-tx",
    jurisdiction: { country: "US", state: "TX", county: "Dallas", city: "Dallas" },
    expectedPortalHints: ["dallasopendata.com"],
    expectedProfileId: "dallas"
  },
  {
    id: "knoxville-tn",
    jurisdiction: { country: "US", state: "TN", county: "Knox", city: "Knoxville" },
    expectedPortalHints: ["knoxvilletn.gov", "data.tennessee.gov"]
  },
  {
    id: "st-louis-mo",
    jurisdiction: { country: "US", state: "MO", county: "St. Louis", city: "St. Louis" },
    expectedPortalHints: ["stlouis-mo.gov", "data.mo.gov"],
    expectedProfileId: "st_louis"
  },
  {
    id: "chicago-il",
    jurisdiction: { country: "US", state: "IL", county: "Cook", city: "Chicago" },
    expectedPortalHints: ["data.cityofchicago.org", "datacatalog.cookcountyil.gov"]
  },
  {
    id: "miami-fl",
    jurisdiction: { country: "US", state: "FL", county: "Miami-Dade", city: "Miami" },
    expectedPortalHints: ["miamidade.gov", "data.florida.gov"]
  },
  {
    id: "new-york-ny",
    jurisdiction: { country: "US", state: "NY", county: "New York", city: "New York" },
    expectedPortalHints: ["cityofnewyork.us", "data.ny.gov"]
  }
];

updateOpenDataConfig({
  featureFlags: {
    autoIngestion: true,
    evidenceRecovery: true,
    gatingEnforcement: true,
    usOnlyAddressPolicy: true
  }
});

assert.equal(CROSS_CITY_SUITE[1].id, "knoxville-tn", "Knoxville must be second in cross-city priority.");

for (const item of CROSS_CITY_SUITE) {
  const candidates = buildOpenDataPortalCandidates(item.jurisdiction);
  assert.ok(candidates.length > 0, `Expected portal candidates for ${item.id}.`);
  if (Array.isArray(item.expectedPortalHints) && item.expectedPortalHints.length > 0) {
    const foundExpectedHint = item.expectedPortalHints.some((hint) => candidates.some((candidate) => candidate.includes(hint)));
    assert.ok(foundExpectedHint, `Expected seeded portal hint for ${item.id}.`);
  }
  const profile = resolveCityOpenDataProfile(item.jurisdiction);
  if (item.expectedProfileId) {
    assert.equal(profile?.id, item.expectedProfileId, `Expected city profile ${item.expectedProfileId} for ${item.id}.`);
  } else {
    assert.equal(profile, undefined, `Expected no city profile override for ${item.id}.`);
  }
}

resetOpenDataConfig();
