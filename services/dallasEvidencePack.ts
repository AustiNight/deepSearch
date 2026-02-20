import type { DataGap, Jurisdiction, NormalizedSource, SourcePointer } from "../types";
import { fetchJsonWithRetry } from "./openDataHttp";
import { getOpenDataConfig } from "./openDataConfig";
import { normalizeAddressVariants } from "./addressNormalization";
import { addressToGeometry } from "./openDataGeocoding";
import { buildSocrataSodaEndpoint, planSocrataDiscoveryQuery } from "./socrataRagPlanner";
import { recordRagOutcome } from "./ragTelemetry";
import {
  readDallasSchemaCache,
  writeDallasSchemaCache,
  type DallasSchemaCacheRecord
} from "./storagePolicy";

type DallasDatasetKind = "police" | "service311" | "parcel";

type DallasDatasetCandidate = {
  datasetId: string;
  title: string;
  description?: string;
  resourceType?: string;
  permalink?: string;
};

type DallasFieldMap = {
  addressField?: string;
  dateField?: string;
  typeField?: string;
  statusField?: string;
  idField?: string;
  geometryField?: string;
};

type DallasQueryAttempt = {
  datasetKind: DallasDatasetKind;
  datasetId?: string;
  datasetTitle?: string;
  queryType: "discovery" | "address" | "radius";
  query: string;
  matched: number;
  error?: string;
};

export type DallasEvidencePackResult = {
  findingsText: string;
  sources: NormalizedSource[];
  dataGaps: DataGap[];
  queryAttempts: DallasQueryAttempt[];
};

const DALLAS_PORTAL_URL = "https://www.dallasopendata.com";
const PRE_2023_CUTOFF = "2023-01-01T00:00:00.000";
const DALLAS_SCHEMA_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const MAX_ADDRESS_VARIANTS = 4;
const MAX_SAMPLE_RECORDS = 3;
const DEFAULT_RADIUS_METERS = 75;

const DATASET_CONFIG: Record<DallasDatasetKind, {
  label: string;
  discoveryQueries: string[];
  fallbackIds: string[];
  recordType: string;
}> = {
  police: {
    label: "Police Incidents",
    discoveryQueries: [
      "Police Incidents",
      "RMS Incidents",
      "Incident Reports",
      "Police Incident"
    ],
    fallbackIds: ["qv6i-rri7"],
    recordType: "police_311_signals"
  },
  service311: {
    label: "311 Service Requests",
    discoveryQueries: [
      "311 Service Requests",
      "Service Requests",
      "311 Requests"
    ],
    fallbackIds: ["i2q3-6wr4"],
    recordType: "police_311_signals"
  },
  parcel: {
    label: "Parcel Shapefile",
    discoveryQueries: [
      "Parcel Shapefile",
      "Parcel",
      "Parcels"
    ],
    fallbackIds: ["hy5f-5hrv"],
    recordType: "assessor_parcel"
  }
};

const DIRECTION_TOKENS = new Set(["N", "S", "E", "W", "NE", "NW", "SE", "SW"]);
const STREET_SUFFIX_TOKENS = new Set([
  "ALY",
  "AVE",
  "AV",
  "AVENUE",
  "BLVD",
  "BOULEVARD",
  "CIR",
  "CIRCLE",
  "CT",
  "COURT",
  "DR",
  "DRIVE",
  "EXPY",
  "EXPRESSWAY",
  "FWY",
  "FREEWAY",
  "HWY",
  "HIGHWAY",
  "LN",
  "LANE",
  "LOOP",
  "PKWY",
  "PARKWAY",
  "PL",
  "PLACE",
  "PLZ",
  "PLAZA",
  "RD",
  "ROAD",
  "SQ",
  "SQUARE",
  "ST",
  "STREET",
  "TER",
  "TERRACE",
  "TRL",
  "TRAIL",
  "WAY"
]);

const PII_FIELD_PATTERNS = [
  /name/i,
  /first/i,
  /last/i,
  /phone/i,
  /email/i,
  /dob/i,
  /birth/i,
  /ssn/i,
  /license/i,
  /plate/i,
  /vin/i,
  /officer/i,
  /badge/i,
  /complainant/i,
  /victim/i,
  /suspect/i,
  /person/i
];

export const isDallasJurisdiction = (jurisdiction?: Jurisdiction) => {
  const city = (jurisdiction?.city || "").toLowerCase();
  const county = (jurisdiction?.county || "").toLowerCase();
  const state = (jurisdiction?.state || "").toLowerCase();
  return (
    city.includes("dallas")
    || county.includes("dallas")
  ) && (state.includes("tx") || state.includes("texas") || !state);
};

const createGapId = () => `gap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const buildDataGap = (
  description: string,
  reason: string,
  status: DataGap["status"],
  recordType: string,
  expectedSources?: SourcePointer[]
): DataGap => ({
  id: createGapId(),
  description,
  reason,
  status,
  recordType,
  detectedAt: new Date().toISOString().slice(0, 10),
  expectedSources
});

const normalizePortalUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed}`.replace(/\/$/, "");
};

const buildSocrataHeaders = () => {
  const config = getOpenDataConfig();
  const headers: Record<string, string> = {};
  if (config.auth.socrataAppToken) {
    headers["X-App-Token"] = config.auth.socrataAppToken;
  }
  return headers;
};

const normalizeAddressForQuery = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const stripUnit = (value: string) => value.replace(/\s+(?:#|APT|APARTMENT|UNIT|SUITE|STE|BLDG|BUILDING|FL|FLOOR|LOT)\s*\w+\b/i, "").trim();

export const buildDallasAddressVariants = (address: string): string[] => {
  const baseVariants = normalizeAddressVariants(address).map(normalizeAddressForQuery);
  const variants = new Set<string>();

  for (const raw of baseVariants) {
    if (!raw) continue;
    const noUnit = stripUnit(raw.split(",")[0]);
    const tokens = noUnit.split(" ").filter(Boolean);
    if (tokens.length === 0) continue;
    variants.add(noUnit);

    const hasPrefixDirection = tokens.length >= 2 && /^\d+$/.test(tokens[0]) && DIRECTION_TOKENS.has(tokens[1]);
    const hasSuffixDirection = tokens.length >= 2 && DIRECTION_TOKENS.has(tokens[tokens.length - 1]);
    const hasStreetSuffix = tokens.length >= 2 && STREET_SUFFIX_TOKENS.has(tokens[tokens.length - 1]);

    const withoutPrefix = hasPrefixDirection
      ? [tokens[0], ...tokens.slice(2)].join(" ")
      : null;
    const withoutSuffix = hasStreetSuffix
      ? tokens.slice(0, -1).join(" ")
      : null;
    const withoutSuffixDirection = hasSuffixDirection
      ? tokens.slice(0, -1).join(" ")
      : null;

    if (withoutPrefix) variants.add(withoutPrefix);
    if (withoutSuffix) variants.add(withoutSuffix);
    if (withoutSuffixDirection) variants.add(withoutSuffixDirection);

    if (withoutPrefix && withoutSuffix) {
      variants.add(`${withoutPrefix.split(" ").slice(0, -1).join(" ")}`.trim());
    }
  }

  return Array.from(variants)
    .filter(Boolean)
    .slice(0, MAX_ADDRESS_VARIANTS);
};

const buildSchemaHash = (fields: Array<{ name: string; type?: string }>) =>
  fields.map((field) => `${field.name}:${field.type || ""}`).join("|").toLowerCase();

const fieldScore = (field: string, patterns: Array<{ pattern: RegExp; score: number }>) => {
  for (const entry of patterns) {
    if (entry.pattern.test(field)) return entry.score;
  }
  return 0;
};

const inferFieldMap = (fields: Array<{ name: string; type?: string }>, kind: DallasDatasetKind): DallasFieldMap => {
  const normalized = fields.map((field) => ({ ...field, key: field.name.toLowerCase() }));
  const addressPatterns: Array<{ pattern: RegExp; score: number }> = kind === "parcel"
    ? [
        { pattern: /(situs|site_?address|property_?address|address)/i, score: 5 },
        { pattern: /(location|loc_)/i, score: 3 },
        { pattern: /(block)/i, score: 2 }
      ]
    : [
        { pattern: /(full_?address|street_?address|incident_?address|address)/i, score: 5 },
        { pattern: /(location|loc_)/i, score: 3 },
        { pattern: /(block)/i, score: 2 }
      ];
  const datePatterns: Array<{ pattern: RegExp; score: number }> = [
    { pattern: /(incident|reported|report|created|request|call|occur).*date/i, score: 5 },
    { pattern: /(date|time|timestamp)/i, score: 3 }
  ];
  const typePatterns: Array<{ pattern: RegExp; score: number }> = kind === "service311"
    ? [
        { pattern: /(service_?request_?type|request_?type|case_?type|problem_?type|complaint_?type|category)/i, score: 5 },
        { pattern: /(service|type|issue|description)/i, score: 3 }
      ]
    : [
        { pattern: /(offense|crime|incident_?type|ucr|classification)/i, score: 5 },
        { pattern: /(type|description)/i, score: 3 }
      ];
  const statusPatterns: Array<{ pattern: RegExp; score: number }> = [
    { pattern: /(status|case_?status|disposition)/i, score: 4 }
  ];
  const idPatterns: Array<{ pattern: RegExp; score: number }> = kind === "parcel"
    ? [
        { pattern: /(parcel_?id|parcelid|apn|pin)/i, score: 5 },
        { pattern: /(account|acct|taxroll)_?id/i, score: 4 },
        { pattern: /(^id$|_id$)/i, score: 2 }
      ]
    : [
        { pattern: /(incident|case|service_?request|request)_?id/i, score: 5 },
        { pattern: /(incident|case|service_?request|request)_?number/i, score: 4 },
        { pattern: /(^id$|_id$)/i, score: 2 }
      ];

  const pickBest = (patterns: Array<{ pattern: RegExp; score: number }>) => {
    let best: { name: string; score: number } | null = null;
    normalized.forEach((field) => {
      const score = fieldScore(field.key, patterns);
      if (score <= 0) return;
      if (!best || score > best.score) best = { name: field.name, score };
    });
    return best?.name;
  };

  const geometryField = normalized.find((field) => (field.type || "").toLowerCase().includes("location"))?.name
    || normalized.find((field) => (field.type || "").toLowerCase().includes("point"))?.name;

  return {
    addressField: pickBest(addressPatterns),
    dateField: pickBest(datePatterns),
    typeField: pickBest(typePatterns),
    statusField: pickBest(statusPatterns),
    idField: pickBest(idPatterns),
    geometryField
  };
};

const isTabularMeta = (meta: any) => {
  const viewType = String(meta?.viewType || meta?.view_type || "").toLowerCase();
  const displayType = String(meta?.displayType || meta?.display_type || "").toLowerCase();
  if (displayType.includes("map")) return false;
  if (viewType.includes("map")) return false;
  return true;
};

const requiresAuthMeta = (meta: any) => {
  if (!meta) return false;
  const access = String(meta?.accessLevel || meta?.access_level || meta?.access || "").toLowerCase();
  if (access.includes("private") || access.includes("restricted") || access.includes("non-public")) return true;
  if (meta?.private === true) return true;
  const publicationStage = String(meta?.publicationStage || meta?.publication_stage || "").toLowerCase();
  if (publicationStage && publicationStage !== "published") return true;
  const approval = String(meta?.approvalStatus || meta?.approval_status || meta?.state || "").toLowerCase();
  if (approval && approval !== "approved") return true;
  return false;
};

const buildDatasetSourcePointer = (portalUrl: string, datasetId?: string, query?: string): SourcePointer[] => {
  if (!datasetId) {
    return [{ label: "Dallas Open Data portal", portalUrl }];
  }
  return [{
    label: "Dallas Open Data dataset",
    portalUrl,
    endpoint: `${portalUrl}/resource/${datasetId}.json`,
    query
  }];
};

const buildNormalizedSource = (url: string, title: string): NormalizedSource => {
  const parsed = new URL(url);
  const domain = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  return {
    uri: url,
    title,
    domain,
    provider: "system",
    kind: "citation"
  };
};

const sanitizeAddressBlock = (value: string) => {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,5})\s+(.*)$/);
  if (!match) return trimmed;
  const block = Math.floor(Number(match[1]) / 100) * 100;
  const suffix = match[2] ? ` ${match[2].trim()}` : "";
  if (!Number.isFinite(block)) return trimmed;
  return `${block} block${suffix}`;
};

const shouldRedactField = (field: string) => PII_FIELD_PATTERNS.some((pattern) => pattern.test(field));

const redactValue = (field: string, value: unknown) => {
  if (value === null || value === undefined) return undefined;
  if (shouldRedactField(field)) return undefined;
  if (typeof value === "string") {
    if (/address|location|block/i.test(field)) return sanitizeAddressBlock(value);
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  return undefined;
};

const summarizeRecords = (datasetLabel: string, datasetId: string, records: Array<Record<string, unknown>>, queryNote: string) => {
  if (records.length === 0) {
    return `${datasetLabel} (${datasetId}): query returned 0 records. ${queryNote}`;
  }
  const lines: string[] = [];
  const sample = records.slice(0, MAX_SAMPLE_RECORDS);
  sample.forEach((record) => {
    const parts = Object.entries(record)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}: ${value}`);
    if (parts.length > 0) {
      lines.push(`- ${parts.join(" | ")}`);
    }
  });
  const head = `${datasetLabel} (${datasetId}): ${records.length} records matched. ${queryNote}`;
  return [head, ...lines].join("\n");
};

const fetchSocrataSearch = async (portalUrl: string, query: string, limit = 8) => {
  const plan = planSocrataDiscoveryQuery({ portalUrl, query, limit });
  const response = await fetchJsonWithRetry<any>(plan.endpoint, { retries: 1, minDelayMs: 200 }, { portalType: "socrata", portalUrl });
  if (plan.ragUsageId) {
    const results = Array.isArray(response.data?.results) ? response.data.results : [];
    recordRagOutcome(plan.ragUsageId, results.length > 0);
  }
  return response;
};

const fetchSocrataMetadata = async (portalUrl: string, datasetId: string) => {
  const headers = buildSocrataHeaders();
  const url = `${portalUrl}/api/views/${datasetId}.json`;
  return fetchJsonWithRetry<any>(url, { headers, retries: 1, minDelayMs: 200 }, { portalType: "socrata", portalUrl });
};

const fetchSocrataRows = async (portalUrl: string, datasetId: string, params: URLSearchParams) => {
  const headers = buildSocrataHeaders();
  const sodaPlan = buildSocrataSodaEndpoint({
    portalUrl,
    datasetId,
    hasAppToken: Boolean(getOpenDataConfig().auth.socrataAppToken),
    params
  });
  const url = sodaPlan.url;
  return fetchJsonWithRetry<any[]>(url, { headers, retries: 1, minDelayMs: 200 }, { portalType: "socrata", portalUrl });
};

const filterTabularCandidates = (results: any[]): DallasDatasetCandidate[] => {
  const candidates: DallasDatasetCandidate[] = [];
  results.forEach((entry) => {
    const resource = entry?.resource || entry;
    const datasetId = resource?.id || entry?.id;
    const title = resource?.name || entry?.name || entry?.title;
    if (!datasetId || !title) return;
    const resourceType = String(resource?.type || "").toLowerCase();
    if (resourceType && (resourceType.includes("map") || resourceType.includes("chart") || resourceType.includes("filter"))) {
      return;
    }
    candidates.push({
      datasetId,
      title,
      description: resource?.description || entry?.description,
      resourceType,
      permalink: entry?.permalink || resource?.permalink || entry?.link
    });
  });
  return candidates;
};

const scoreCandidate = (candidate: DallasDatasetCandidate, keywords: string[]) => {
  const text = `${candidate.title} ${candidate.description || ""}`.toLowerCase();
  let score = 0;
  keywords.forEach((keyword) => {
    if (text.includes(keyword)) score += 3;
  });
  if (candidate.resourceType && candidate.resourceType.includes("dataset")) score += 2;
  return score;
};

const sanitizeRecordSet = (records: any[], fieldMap: DallasFieldMap) => {
  const allowedFields = [
    fieldMap.idField,
    fieldMap.dateField,
    fieldMap.typeField,
    fieldMap.statusField,
    fieldMap.addressField
  ].filter(Boolean) as string[];
  return records.map((record) => {
    const clean: Record<string, unknown> = {};
    allowedFields.forEach((field) => {
      if (!(field in record)) return;
      const value = redactValue(field, record[field]);
      if (value !== undefined && value !== null && value !== "") {
        clean[field] = value;
      }
    });
    return clean;
  }).filter((record) => Object.keys(record).length > 0);
};

const buildWhereAddressClause = (field: string, variants: string[]) => {
  const sanitized = variants
    .map((variant) => variant.replace(/[%_]/g, "").replace(/'/g, "''"))
    .filter(Boolean)
    .map((variant) => `UPPER(${field}) LIKE '%${variant}%'`);
  if (sanitized.length === 0) return "";
  if (sanitized.length === 1) return sanitized[0];
  return `(${sanitized.join(" OR ")})`;
};

const buildWhereDateClause = (field?: string) => field ? `${field} < '${PRE_2023_CUTOFF}'` : "";

const buildWhereRadiusClause = (field: string, point: { lat: number; lon: number }, radius: number) =>
  `within_circle(${field}, ${point.lat}, ${point.lon}, ${radius})`;

const mergeWhereClauses = (clauses: string[]) => clauses.filter(Boolean).join(" AND ");

const extractFieldsFromMeta = (meta: any): Array<{ name: string; type?: string }> => {
  const columns = Array.isArray(meta?.columns) ? meta.columns : [];
  return columns
    .map((col: any) => ({
      name: String(col?.fieldName || col?.name || "").trim(),
      type: typeof col?.dataTypeName === "string" ? col.dataTypeName : undefined
    }))
    .filter((field) => field.name);
};

const resolveSchemaCacheEntry = (
  cache: DallasSchemaCacheRecord,
  datasetId: string,
  portalUrl: string
) => cache[`${portalUrl}|${datasetId}`];

const saveSchemaCacheEntry = (
  cache: DallasSchemaCacheRecord,
  datasetId: string,
  portalUrl: string,
  schemaHash: string,
  fields: Array<{ name: string; type?: string }>,
  fieldMap: DallasFieldMap
) => {
  cache[`${portalUrl}|${datasetId}`] = {
    datasetId,
    portalUrl,
    schemaHash,
    fields,
    fieldMap,
    updatedAt: Date.now(),
    expiresAt: Date.now() + DALLAS_SCHEMA_CACHE_TTL_MS
  };
};

const buildDatasetUrl = (portalUrl: string, datasetId: string, permalink?: string) => {
  if (permalink && permalink.startsWith("http")) return permalink;
  return `${portalUrl}/resource/${datasetId}.json`;
};

const fetchDatasetCandidates = async (portalUrl: string, queries: string[], attempts: DallasQueryAttempt[], datasetKind: DallasDatasetKind) => {
  const candidates: DallasDatasetCandidate[] = [];
  for (const query of queries) {
    const response = await fetchSocrataSearch(portalUrl, query);
    const ok = response.ok && response.data;
    attempts.push({
      datasetKind,
      queryType: "discovery",
      query,
      matched: ok && Array.isArray(response.data?.results) ? response.data.results.length : 0,
      error: response.ok ? undefined : response.error
    });
    if (!ok) continue;
    const results = Array.isArray(response.data?.results) ? response.data.results : [];
    candidates.push(...filterTabularCandidates(results));
    if (candidates.length >= 12) break;
  }
  return candidates;
};

const resolveDatasetCandidates = async (
  portalUrl: string,
  kind: DallasDatasetKind,
  attempts: DallasQueryAttempt[]
) => {
  const config = DATASET_CONFIG[kind];
  const rawCandidates = await fetchDatasetCandidates(portalUrl, config.discoveryQueries, attempts, kind);
  const seen = new Map<string, DallasDatasetCandidate>();
  rawCandidates.forEach((candidate) => {
    if (!seen.has(candidate.datasetId)) {
      seen.set(candidate.datasetId, candidate);
    }
  });
  const candidates = Array.from(seen.values());
  const keywords = config.label.toLowerCase().split(/\s+/).filter(Boolean);
  const ranked = candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(candidate, keywords) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.candidate);
  const fallbackId = config.fallbackIds[0];
  if (fallbackId && !ranked.some((entry) => entry.datasetId === fallbackId)) {
    ranked.push({ datasetId: fallbackId, title: config.label });
  }
  return ranked;
};

const queryDataset = async (
  portalUrl: string,
  dataset: DallasDatasetCandidate,
  kind: DallasDatasetKind,
  fieldMap: DallasFieldMap,
  addressVariants: string[],
  attempts: DallasQueryAttempt[],
  geocodePoint?: { lat: number; lon: number }
) => {
  const selectFields = [
    fieldMap.idField,
    fieldMap.dateField,
    fieldMap.typeField,
    fieldMap.statusField,
    fieldMap.addressField
  ].filter(Boolean) as string[];

  const queryNote = kind === "parcel" ? "address variant query" : "address variant query (pre-2023)";
  if (fieldMap.addressField && addressVariants.length > 0) {
    const whereClause = mergeWhereClauses([
      buildWhereAddressClause(fieldMap.addressField, addressVariants),
      kind === "parcel" ? "" : buildWhereDateClause(fieldMap.dateField)
    ]);
    const params = new URLSearchParams();
    if (selectFields.length > 0) params.set("$select", selectFields.join(","));
    if (whereClause) params.set("$where", whereClause);
    params.set("$limit", String(25));
    if (fieldMap.dateField) params.set("$order", `${fieldMap.dateField} DESC`);

    const response = await fetchSocrataRows(portalUrl, dataset.datasetId, params);
    const rows = response.ok && Array.isArray(response.data) ? response.data : [];
    attempts.push({
      datasetKind: kind,
      datasetId: dataset.datasetId,
      datasetTitle: dataset.title,
      queryType: "address",
      query: whereClause || queryNote,
      matched: rows.length,
      error: response.ok ? undefined : response.error
    });
    if (rows.length > 0) return { rows, queryNote };
  }

  if (fieldMap.geometryField && geocodePoint) {
    const whereClause = mergeWhereClauses([
      buildWhereRadiusClause(fieldMap.geometryField, geocodePoint, DEFAULT_RADIUS_METERS),
      kind === "parcel" ? "" : buildWhereDateClause(fieldMap.dateField)
    ]);
    const params = new URLSearchParams();
    if (selectFields.length > 0) params.set("$select", selectFields.join(","));
    if (whereClause) params.set("$where", whereClause);
    params.set("$limit", String(25));
    if (fieldMap.dateField) params.set("$order", `${fieldMap.dateField} DESC`);

    const response = await fetchSocrataRows(portalUrl, dataset.datasetId, params);
    const rows = response.ok && Array.isArray(response.data) ? response.data : [];
    attempts.push({
      datasetKind: kind,
      datasetId: dataset.datasetId,
      datasetTitle: dataset.title,
      queryType: "radius",
      query: whereClause || "radius query",
      matched: rows.length,
      error: response.ok ? undefined : response.error
    });
    if (rows.length > 0) {
      return { rows, queryNote: kind === "parcel" ? "radius query" : "radius query (pre-2023)" };
    }
  }

  return { rows: [], queryNote };
};

export const runDallasEvidencePack = async (input: {
  address: string;
  jurisdiction?: Jurisdiction;
}): Promise<DallasEvidencePackResult> => {
  const portalUrl = normalizePortalUrl(DALLAS_PORTAL_URL);
  const dataGaps: DataGap[] = [];
  const sources: NormalizedSource[] = [];
  const queryAttempts: DallasQueryAttempt[] = [];
  let findingsText = "";

  if (!isDallasJurisdiction(input.jurisdiction)) {
    return { findingsText, sources, dataGaps, queryAttempts };
  }

  const addressVariants = buildDallasAddressVariants(input.address);
  const { geocode } = await addressToGeometry({ address: input.address, jurisdiction: input.jurisdiction });
  const geocodePoint = geocode?.point;
  const cache = readDallasSchemaCache();

  const summaries: string[] = [];
  const datasets: DallasDatasetKind[] = ["police", "service311", "parcel"];

  for (const kind of datasets) {
    const candidates = await resolveDatasetCandidates(portalUrl, kind, queryAttempts);
    if (candidates.length === 0) {
      dataGaps.push(buildDataGap(
        `${DATASET_CONFIG[kind].label} dataset unavailable for Dallas Open Data.`,
        "Discovery returned no datasets.",
        "unavailable",
        DATASET_CONFIG[kind].recordType,
        buildDatasetSourcePointer(portalUrl)
      ));
      continue;
    }
    let selected: DallasDatasetCandidate | null = null;
    let metaResponse: { ok: boolean; data: any; error?: string } | null = null;
    for (const candidate of candidates) {
      const response = await fetchSocrataMetadata(portalUrl, candidate.datasetId);
      if (!response.ok || !response.data) {
        metaResponse = response;
        continue;
      }
      if (requiresAuthMeta(response.data)) {
        dataGaps.push(buildDataGap(
          `${candidate.title} (${candidate.datasetId}) requires authentication or elevated access on Dallas Open Data.`,
          "Dataset requires authentication or restricted access.",
          "restricted",
          DATASET_CONFIG[kind].recordType,
          buildDatasetSourcePointer(portalUrl, candidate.datasetId)
        ));
        metaResponse = response;
        continue;
      }
      if (!isTabularMeta(response.data)) {
        dataGaps.push(buildDataGap(
          `${candidate.title} (${candidate.datasetId}) is not a tabular dataset (map or visualization).`,
          "Dataset is not tabular; cannot query via SODA.",
          "unavailable",
          DATASET_CONFIG[kind].recordType,
          buildDatasetSourcePointer(portalUrl, candidate.datasetId)
        ));
        metaResponse = response;
        continue;
      }
      selected = candidate;
      metaResponse = response;
      break;
    }

    if (!selected || !metaResponse || !metaResponse.ok || !metaResponse.data) {
      const candidateIds = candidates.map((entry) => entry.datasetId).filter(Boolean).join(", ");
      dataGaps.push(buildDataGap(
        `${DATASET_CONFIG[kind].label} dataset metadata unavailable.`,
        metaResponse?.error
          ? `${metaResponse.error}${candidateIds ? ` (candidates: ${candidateIds})` : ""}`
          : `Metadata fetch failed or only map layers found.${candidateIds ? ` Candidates: ${candidateIds}` : ""}`,
        "unavailable",
        DATASET_CONFIG[kind].recordType,
        buildDatasetSourcePointer(portalUrl)
      ));
      continue;
    }

    const fields = extractFieldsFromMeta(metaResponse.data);
    const schemaHash = buildSchemaHash(fields);
    const cached = resolveSchemaCacheEntry(cache, selected.datasetId, portalUrl);
    let fieldMap: DallasFieldMap = cached?.schemaHash === schemaHash ? cached.fieldMap : {};
    if (!fieldMap || Object.keys(fieldMap).length === 0) {
      fieldMap = inferFieldMap(fields, kind);
    }

    if (cached && cached.schemaHash !== schemaHash) {
      dataGaps.push(buildDataGap(
        `${DATASET_CONFIG[kind].label} dataset schema drift detected.`,
        `Schema hash changed; dataset ${selected.datasetId} fields updated.`,
        "stale",
        DATASET_CONFIG[kind].recordType,
        buildDatasetSourcePointer(portalUrl, selected.datasetId, "schema drift detected")
      ));
    }

    saveSchemaCacheEntry(cache, selected.datasetId, portalUrl, schemaHash, fields, fieldMap);

    if (kind !== "parcel" && !fieldMap.addressField) {
      dataGaps.push(buildDataGap(
        `${DATASET_CONFIG[kind].label} dataset missing address field.`,
        `Unable to locate address field in dataset ${selected.datasetId}.`,
        "missing",
        DATASET_CONFIG[kind].recordType,
        buildDatasetSourcePointer(portalUrl, selected.datasetId)
      ));
      continue;
    }

    if (kind !== "parcel" && !fieldMap.dateField) {
      dataGaps.push(buildDataGap(
        `${DATASET_CONFIG[kind].label} dataset missing date field.`,
        `Unable to locate date field for pre-2023 filter in dataset ${selected.datasetId}.`,
        "missing",
        DATASET_CONFIG[kind].recordType,
        buildDatasetSourcePointer(portalUrl, selected.datasetId)
      ));
      continue;
    }

    const { rows, queryNote } = await queryDataset(
      portalUrl,
      selected,
      kind,
      fieldMap,
      addressVariants,
      queryAttempts,
      geocodePoint
    );

    if (rows.length === 0) {
      dataGaps.push(buildDataGap(
        `${DATASET_CONFIG[kind].label} dataset returned no records for the address query.`,
        `Query returned 0 rows for dataset ${selected.datasetId}.`,
        "missing",
        DATASET_CONFIG[kind].recordType,
        buildDatasetSourcePointer(portalUrl, selected.datasetId, queryNote)
      ));
    }

    const sanitized = sanitizeRecordSet(rows, fieldMap);
    summaries.push(summarizeRecords(DATASET_CONFIG[kind].label, selected.datasetId, sanitized, queryNote));

    const url = buildDatasetUrl(portalUrl, selected.datasetId, metaResponse.data?.permalink || selected.permalink);
    sources.push(buildNormalizedSource(url, DATASET_CONFIG[kind].label));
  }

  writeDallasSchemaCache(cache);

  if (summaries.length > 0) {
    findingsText = [
      "Dallas Open Data Evidence (PII-redacted, block-level addresses only).",
      ...summaries,
      "Notes: Query results reflect pre-2023 filters for police/311 datasets. Zero results mean the query returned no rows, not a guarantee of absence."
    ].join("\n");
  }

  return {
    findingsText,
    sources,
    dataGaps,
    queryAttempts
  };
};
