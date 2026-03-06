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
  keyOverrides: {
    openai: "sk-test-should-not-leak",
    google: "AIza-test-should-not-leak"
  },
  openDataConfig: {
    zeroCostMode: true,
    allowPaidAccess: true,
    featureFlags: {
      autoIngestion: true,
      evidenceRecovery: true,
      gatingEnforcement: true,
      usOnlyAddressPolicy: false,
      datasetTelemetryRanking: true,
      socrataPreferV3: true
    },
    auth: {
      socrataAppToken: "token-123"
    }
  }
};

const stripped = stripSettingsForKv(settingsInput);
assert.equal(stripped.provider, "openai");
assert.deepEqual(stripped.runConfig, runConfig);
assert.ok(!("accessAllowlist" in stripped));
assert.equal(stripped.keyOverrides?.openai, "sk-test-should-not-leak");
assert.equal(stripped.keyOverrides?.google, "AIza-test-should-not-leak");
assert.equal(stripped.openDataConfig?.auth?.socrataAppToken, "token-123");
assert.equal(stripped.openDataConfig?.allowPaidAccess, false);
assert.equal(stripped.openDataConfig?.featureFlags?.datasetTelemetryRanking, true);
assert.equal(stripped.openDataConfig?.featureFlags?.socrataPreferV3, true);

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
