import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
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

if (process.env.UPDATE_SNAPSHOTS === "1") {
  fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshotData, null, 2)}\n`, "utf8");
  console.log("Updated source normalization snapshots.");
} else {
  const expected = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  assert.deepStrictEqual(snapshotData, expected);
  console.log("Source normalization snapshots match.");
}
