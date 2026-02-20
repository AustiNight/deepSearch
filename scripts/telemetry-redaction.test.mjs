import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const readText = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const redaction = await import("../services/redaction.ts");
const {
  redactSensitiveText,
  redactSensitiveValue,
  __redactionInternals
} = redaction;

const sample = "Report for 123 Main St with api_key=sk-test-123 and token=abcd";
const redactedSample = redactSensitiveText(sample);
assert.ok(!redactedSample.includes("123 Main St"));
assert.ok(!redactedSample.includes("sk-test-123"));
assert.ok(redactedSample.includes(__redactionInternals.REDACTED_ADDRESS));

const payload = {
  address: "456 Elm St",
  token: "token-xyz",
  nested: {
    endpoint: "https://example.com/search?q=789 Oak St&api_key=sk-test-999"
  }
};
const redactedPayload = redactSensitiveValue(payload);
assert.equal(redactedPayload.address, __redactionInternals.REDACTED_ADDRESS);
assert.equal(redactedPayload.token, __redactionInternals.REDACTED_VALUE);
assert.ok(!JSON.stringify(redactedPayload).includes("Oak St"));
assert.ok(!JSON.stringify(redactedPayload).includes("sk-test-999"));

const telemetry = await import("../services/portalErrorTelemetry.ts");
telemetry.resetPortalErrorMetrics();
telemetry.recordPortalError({
  portalUrl: "https://data.example.org/search?address=123 Main St&api_key=sk-test-123",
  endpoint: "https://data.example.org/resource?q=456 Pine St&token=abcd",
  status: 429
});
const metrics = telemetry.getPortalErrorMetrics();
const metricsText = JSON.stringify(metrics);
assert.ok(!metricsText.includes("Main St"));
assert.ok(!metricsText.includes("sk-test-123"));

const workerSource = readText("workers/worker.ts");
assert.ok(workerSource.includes("installLogRedactionGuard"));

const indexSource = readText("index.tsx");
assert.ok(indexSource.includes("installLogRedactionGuard"));

console.log("telemetry-redaction.test.mjs: ok");
