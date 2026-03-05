import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  normalizeSourcesFromResponse,
  normalizeSourcesFromText,
  normalizeGeminiResponseSources,
  normalizeOpenAIResponseSources
} from "../services/sourceNormalization.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const fixturesPath = path.join(projectRoot, "tests/fixtures/source-normalization-fixtures.json");
const snapshotPath = path.join(projectRoot, "tests/fixtures/source-normalization.snap.json");

const fixtures = JSON.parse(fs.readFileSync(fixturesPath, "utf8"));

const snapshotData = {
  openai_annotations: normalizeOpenAIResponseSources(fixtures.openai_annotations.response).sources,
  openai_web_search_call: normalizeOpenAIResponseSources(fixtures.openai_web_search_call.response).sources,
  gemini_grounding: normalizeGeminiResponseSources(fixtures.gemini_grounding.response).sources,
  gemini_missing_title: normalizeGeminiResponseSources(fixtures.gemini_missing_title.response).sources
};

const stableOpenAI = normalizeOpenAIResponseSources(fixtures.stable_topic_openai.response).sources;
const stableGemini = normalizeGeminiResponseSources(fixtures.stable_topic_gemini.response).sources;

assert.ok(
  stableOpenAI.length > 0,
  "Expected OpenAI default model fixture to yield at least one normalized source."
);
assert.ok(
  stableGemini.length > 0,
  "Expected Gemini default model fixture to yield at least one normalized source."
);

const fallbackText = `
  Portal data.cityofchicago.org has dataset ydgz-vkrp.
  Also see datacatalog.cookcountyil.gov/resource/abcd-1234 and https://example.gov/path?utm_source=test.
`;
const fallbackTextSources = normalizeSourcesFromText(fallbackText, "openai").sources;
assert.ok(
  fallbackTextSources.some((source) => source.uri === "https://data.cityofchicago.org/resource/ydgz-vkrp"),
  "Expected text fallback to infer Socrata resource URL from domain + dataset id."
);
assert.ok(
  fallbackTextSources.some((source) => source.uri === "https://datacatalog.cookcountyil.gov/resource/abcd-1234"),
  "Expected text fallback to normalize bare-domain URLs with dataset paths."
);
assert.ok(
  fallbackTextSources.some((source) => source.uri === "https://example.gov/path"),
  "Expected text fallback to normalize tracking query params."
);

const fallbackResponse = {
  references: [
    {
      portalUrl: "https://data.cityofchicago.org",
      datasetId: "ydgz-vkrp",
      title: "Cook County Parcels"
    },
    {
      domain: "datacatalog.cookcountyil.gov",
      id: "abcd-1234",
      datasetName: "Assessor records"
    }
  ],
  links: [
    { href: "records.example.gov/doc/42?utm_medium=email", title: "Recorder index" }
  ]
};
const fallbackResponseSources = normalizeSourcesFromResponse(fallbackResponse, "google").sources;
assert.ok(
  fallbackResponseSources.some((source) => source.uri === "https://data.cityofchicago.org/resource/ydgz-vkrp"),
  "Expected response fallback to build dataset resource URL from structured portal+dataset fields."
);
assert.ok(
  fallbackResponseSources.some((source) => source.uri === "https://datacatalog.cookcountyil.gov/resource/abcd-1234"),
  "Expected response fallback to infer URLs from domain + dataset id in structured objects."
);
assert.ok(
  fallbackResponseSources.some((source) => source.uri === "https://records.example.gov/doc/42"),
  "Expected response fallback to normalize href fields with tracking params."
);

if (process.env.UPDATE_SNAPSHOTS === "1") {
  fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshotData, null, 2)}\n`, "utf8");
  console.log("Updated source normalization snapshots.");
} else {
  const expected = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  assert.deepStrictEqual(snapshotData, expected);
  console.log("Source normalization snapshots match.");
}
