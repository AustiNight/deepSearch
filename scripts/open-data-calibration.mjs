import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveParcelFromOpenDataPortal } from "../services/openDataParcelResolution.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const defaultSamplesPath = path.join(repoRoot, "data/ground-truth/address-samples.csv");
const samplesPath = process.env.GROUND_TRUTH_SAMPLES_PATH || defaultSamplesPath;

const normalizePortalUrl = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed}`.replace(/\/$/, "");
};

const normalizeParcelId = (value) => String(value || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

const normalizeStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "resolved") return "resolved";
  if (normalized === "ambiguous") return "ambiguous";
  if (normalized === "not_found" || normalized === "not-found" || normalized === "missing") return "not_found";
  return "resolved";
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === "\"") {
        if (text[i + 1] === "\"") {
          cell += "\"";
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === "\"") {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (ch === "\r") continue;
    cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  const normalizedRows = rows.filter((cells) => cells.some((value) => String(value || "").trim().length > 0));
  if (normalizedRows.length === 0) return [];
  const headers = normalizedRows[0].map((header) => String(header || "").trim());
  return normalizedRows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = String(values[index] || "").trim();
    });
    return record;
  });
};

const csvEscape = (value) => {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, "\"\"")}"`;
};

const buildPortalUrl = (row) => {
  const direct = normalizePortalUrl(row.portalUrl);
  if (direct) return direct;
  const sourceTokens = String(row.authoritativeSources || "")
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
  for (const token of sourceTokens) {
    if (!/^https?:\/\//i.test(token)) continue;
    try {
      const parsed = new URL(token);
      return normalizePortalUrl(parsed.origin);
    } catch (_) {
      continue;
    }
  }
  return "";
};

const pickPredictedStatus = (result) => {
  const parcelId = result?.parcel?.parcelId || result?.parcel?.accountId;
  if (parcelId) return "resolved";
  const hasAmbiguousGap = Array.isArray(result?.dataGaps)
    && result.dataGaps.some((gap) => String(gap?.status || "").toLowerCase() === "ambiguous");
  if (hasAmbiguousGap) return "ambiguous";
  return "not_found";
};

const summarizeBlockReasons = (diagnostics) => {
  if (!diagnostics || !Array.isArray(diagnostics.blockedDatasets)) return "";
  const reasons = [];
  for (const dataset of diagnostics.blockedDatasets) {
    const label = dataset.datasetId || dataset.title || "dataset";
    const blockReasons = Array.isArray(dataset.blockReasons) ? dataset.blockReasons : [];
    if (blockReasons.length === 0) {
      reasons.push(`${label}:blocked`);
      continue;
    }
    reasons.push(`${label}:${blockReasons.join("+")}`);
  }
  return reasons.join("|");
};

const computePass = (expectedStatus, predictedStatus, expectedParcelIds, predictedParcelId) => {
  if (expectedStatus === "resolved") {
    if (predictedStatus !== "resolved") return false;
    if (expectedParcelIds.length === 0) return Boolean(predictedParcelId);
    return expectedParcelIds.includes(normalizeParcelId(predictedParcelId));
  }
  if (expectedStatus === "ambiguous") return predictedStatus === "ambiguous";
  return predictedStatus === "not_found";
};

const toNumber = (value) => (value === 0 ? 0 : value ? Number(value) : 0);

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

if (!fs.existsSync(samplesPath)) {
  console.error(`Ground-truth file not found: ${samplesPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(samplesPath, "utf8");
const rows = parseCsv(raw);
if (rows.length === 0) {
  console.log(`No samples found in ${samplesPath}. Populate the CSV and rerun.`);
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
const runStamp = new Date().toISOString().replace(/[:.]/g, "-");
const runOutputDir = path.join(repoRoot, "data/ground-truth/run-outputs", today);
ensureDir(runOutputDir);

const results = [];
let attempted = 0;
let passed = 0;

for (const row of rows) {
  const sampleId = row.sampleId || `sample-${results.length + 1}`;
  const address = row.address || "";
  const expectedStatus = normalizeStatus(row.expectedStatus);
  const expectedParcelIds = String(row.expectedParcelIds || "")
    .split("|")
    .map((value) => normalizeParcelId(value))
    .filter(Boolean);
  const portalUrl = buildPortalUrl(row);
  if (!address || !portalUrl) {
    results.push({
      sampleId,
      address,
      portalUrl,
      expectedStatus,
      predictedStatus: "skipped",
      expectedParcelIds: expectedParcelIds.join("|"),
      predictedParcelId: "",
      pass: false,
      statusPass: false,
      idPass: false,
      dataGapStatuses: "",
      error: "Missing address or portalUrl/authoritativeSources"
    });
    continue;
  }

  attempted += 1;
  try {
    const result = await resolveParcelFromOpenDataPortal({
      address,
      portalUrl,
      jurisdiction: {
        city: row["jurisdiction.city"] || undefined,
        county: row["jurisdiction.county"] || undefined,
        state: row["jurisdiction.state"] || undefined
      },
      calibration: {
        enabled: true,
        includeDiagnostics: true,
        relaxPublicAssessorReviewGates: true
      }
    });
    const predictedParcelId = result?.parcel?.parcelId || result?.parcel?.accountId || "";
    const predictedStatus = pickPredictedStatus(result);
    const statusPass = expectedStatus === predictedStatus;
    const idPass = expectedStatus !== "resolved"
      ? true
      : expectedParcelIds.length === 0
        ? Boolean(predictedParcelId)
        : expectedParcelIds.includes(normalizeParcelId(predictedParcelId));
    const pass = computePass(expectedStatus, predictedStatus, expectedParcelIds, predictedParcelId);
    if (pass) passed += 1;
    const dataGapStatuses = Array.isArray(result?.dataGaps)
      ? Array.from(new Set(result.dataGaps.map((gap) => String(gap?.status || "").trim()).filter(Boolean))).join("|")
      : "";
    const diagnostics = result?.diagnostics && typeof result.diagnostics === "object" ? result.diagnostics : null;
    const blockedDatasetCount = Array.isArray(diagnostics?.blockedDatasets) ? diagnostics.blockedDatasets.length : 0;
    const relaxedDatasetCount = Array.isArray(diagnostics?.relaxedDatasets) ? diagnostics.relaxedDatasets.length : 0;
    const blockReasonSummary = summarizeBlockReasons(diagnostics);
    const topDataGapReasons = Array.isArray(result?.dataGaps)
      ? result.dataGaps
        .map((gap) => String(gap?.reason || "").trim())
        .filter(Boolean)
        .slice(0, 2)
        .join(" | ")
      : "";
    results.push({
      sampleId,
      address,
      portalUrl,
      expectedStatus,
      predictedStatus,
      expectedParcelIds: expectedParcelIds.join("|"),
      predictedParcelId,
      pass,
      statusPass,
      idPass,
      dataGapStatuses,
      blockedDatasetCount,
      relaxedDatasetCount,
      blockReasonSummary,
      topDataGapReasons,
      error: ""
    });
  } catch (error) {
    results.push({
      sampleId,
      address,
      portalUrl,
      expectedStatus,
      predictedStatus: "error",
      expectedParcelIds: expectedParcelIds.join("|"),
      predictedParcelId: "",
      pass: false,
      statusPass: false,
      idPass: false,
      dataGapStatuses: "",
      blockedDatasetCount: 0,
      relaxedDatasetCount: 0,
      blockReasonSummary: "",
      topDataGapReasons: "",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

const accuracy = attempted > 0 ? Number((passed / attempted).toFixed(4)) : 0;
const summary = {
  generatedAt: new Date().toISOString(),
  samplesTotal: rows.length,
  attempted,
  passed,
  accuracy,
  byExpectedStatus: {
    resolved: results.filter((row) => row.expectedStatus === "resolved").length,
    ambiguous: results.filter((row) => row.expectedStatus === "ambiguous").length,
    not_found: results.filter((row) => row.expectedStatus === "not_found").length
  },
  byPredictedStatus: {
    resolved: results.filter((row) => row.predictedStatus === "resolved").length,
    ambiguous: results.filter((row) => row.predictedStatus === "ambiguous").length,
    not_found: results.filter((row) => row.predictedStatus === "not_found").length,
    skipped: results.filter((row) => row.predictedStatus === "skipped").length,
    error: results.filter((row) => row.predictedStatus === "error").length
  }
};

const resultColumns = [
  "sampleId",
  "address",
  "portalUrl",
  "expectedStatus",
  "predictedStatus",
  "expectedParcelIds",
  "predictedParcelId",
  "pass",
  "statusPass",
  "idPass",
  "dataGapStatuses",
  "blockedDatasetCount",
  "relaxedDatasetCount",
  "blockReasonSummary",
  "topDataGapReasons",
  "error"
];

const csvRows = [
  resultColumns.join(","),
  ...results.map((row) => resultColumns.map((column) => csvEscape(row[column])).join(","))
];

const runResultsCsvPath = path.join(runOutputDir, `calibration-results-${runStamp}.csv`);
const runSummaryJsonPath = path.join(runOutputDir, `calibration-summary-${runStamp}.json`);
const latestResultsCsvPath = path.join(repoRoot, "data/ground-truth/calibration-results.csv");

fs.writeFileSync(runResultsCsvPath, `${csvRows.join("\n")}\n`, "utf8");
fs.writeFileSync(runSummaryJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
fs.writeFileSync(latestResultsCsvPath, `${csvRows.join("\n")}\n`, "utf8");

console.log("open-data-calibration: complete");
console.log(`samples: ${rows.length} | attempted: ${attempted} | passed: ${passed} | accuracy: ${accuracy}`);
console.log(`results: ${path.relative(repoRoot, runResultsCsvPath)}`);
console.log(`summary: ${path.relative(repoRoot, runSummaryJsonPath)}`);
