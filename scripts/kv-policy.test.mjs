import assert from "node:assert/strict";
import { buildAllowlistMetadata, stripSettingsForKv } from "../workers/kvPolicy.ts";

const runConfig = {
  minAgents: 2,
  maxAgents: 4,
  maxMethodAgents: 2,
  forceExhaustion: false,
  minRounds: 1,
  maxRounds: 2,
  earlyStopDiminishingScore: 0.5,
  earlyStopNoveltyRatio: 0.2,
  earlyStopNewDomains: 1,
  earlyStopNewSources: 2,
};

const settingsInput = {
  schemaVersion: 1,
  provider: "openai",
  runConfig,
  modelOverrides: { synthesis: "gpt-4.1-mini" },
  accessAllowlist: ["user@example.com"],
  apiKey: "sk-test-should-not-leak",
};

const stripped = stripSettingsForKv(settingsInput);
assert.equal(stripped.provider, "openai");
assert.deepEqual(stripped.runConfig, runConfig);
assert.ok(!("accessAllowlist" in stripped));
assert.ok(!("apiKey" in stripped));

const metadata = await buildAllowlistMetadata({
  entries: ["user@example.com", "other@example.com"],
  updatedAt: "2025-01-01T00:00:00Z",
  version: 3,
});

assert.equal(metadata.count, 2);
assert.equal(metadata.updatedBy, null);
assert.equal(metadata.version, 3);
assert.equal(metadata.updatedAt, "2025-01-01T00:00:00Z");
assert.ok(typeof metadata.entriesHash === "string");
assert.equal(metadata.entriesHash.length, 64);

console.log("kv-policy.test.mjs: ok");
