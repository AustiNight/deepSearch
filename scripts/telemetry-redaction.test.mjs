import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const readText = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const redaction = await import("../services/redaction.ts");
const {
  redactSensitiveText,
  redactSensitiveTextWithPatterns,
  redactSensitiveValue,
  installLogRedactionGuard,
  __redactionInternals
} = redaction;

const sample = "Report for 123 Main St with ?api_key=sk-test-123 and token=abcd";
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

const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};
const captured = {
  log: null,
  info: null,
  warn: null,
  error: null,
  debug: null,
};
const capture = (method) => (...args) => {
  captured[method] = args;
};

console.log = capture("log");
console.info = capture("info");
console.warn = capture("warn");
console.error = capture("error");
console.debug = capture("debug");

installLogRedactionGuard();
console.warn("Worker log test", {
  address: "123 Main St",
  token: "sk-test-123",
  endpoint: "https://example.com/search?q=456 Pine St&api_key=sk-test-999",
});

const workerLogText = JSON.stringify(captured.warn || []);
assert.ok(!workerLogText.includes("Main St"));
assert.ok(!workerLogText.includes("sk-test-123"));
assert.ok(workerLogText.includes(__redactionInternals.REDACTED_ADDRESS));

console.log = originalConsole.log;
console.info = originalConsole.info;
console.warn = originalConsole.warn;
console.error = originalConsole.error;
console.debug = originalConsole.debug;

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

const zipPattern = /Dallas\s+TX\s+75202/gi;
const zipLog = redactSensitiveTextWithPatterns("Investigating Dallas TX 75202 for permits.", [zipPattern]);
assert.ok(!zipLog.includes("75202"));
assert.ok(zipLog.includes(__redactionInternals.REDACTED_ADDRESS));

const overseerSource = readText("hooks/useOverseer.ts");
assert.ok(
  overseerSource.includes("redactSensitiveTextWithPatterns(message, addressRedactionPatterns)"),
  "Overseer logging must redact messages with address patterns."
);
assert.ok(
  overseerSource.includes("buildAddressRedactionPatterns(topic)"),
  "Overseer should build address redaction patterns from the topic."
);

const workerSource = readText("workers/worker.ts");
assert.ok(workerSource.includes("installLogRedactionGuard"));
assert.ok(workerSource.includes("redactSensitiveValue"));

const indexSource = readText("index.tsx");
assert.ok(indexSource.includes("installLogRedactionGuard"));

console.log("telemetry-redaction.test.mjs: ok");
