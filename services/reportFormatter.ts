import type {
  DatasetComplianceEntry,
  FinalReport,
  PrimaryRecordCoverage,
  ReportSection,
  Visualization,
  ChartVisualization,
  ImageVisualization,
  ChartData,
  ChartSeries
} from "../types";
import { tryParseJsonFromText } from "./jsonUtils";

const DEFAULT_METHOD_AUDIT = "Deep Drill Protocol: 3-Stage Recursive Verification.";
const DEFAULT_SCHEMA_VERSION = 1;

const MAX_VISUALIZATIONS = 6;
const MAX_SERIES = 4;
const MAX_POINTS = 24;
const MAX_TABLE_ROWS = MAX_POINTS;
const MAX_LABEL_LENGTH = 40;
const MAX_TITLE_LENGTH = 80;
const MAX_CAPTION_LENGTH = 280;
const MAX_SOURCE_COUNT = 10;
const MAX_URL_LENGTH = 800;
const IMAGE_HOST_ALLOWLIST: string[] = [];

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

const isPortalType = (value: unknown) =>
  value === "socrata" || value === "arcgis" || value === "dcat" || value === "unknown";

const normalizePrimaryRecordCoverage = (value: unknown): PrimaryRecordCoverage | undefined => {
  if (!isPlainObject(value)) return undefined;
  if (!Array.isArray(value.entries)) return undefined;
  return value as PrimaryRecordCoverage;
};

const normalizeDatasetCompliance = (value: unknown): DatasetComplianceEntry[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const out: DatasetComplianceEntry[] = [];
  for (const entry of value) {
    if (!isPlainObject(entry)) continue;
    const title = typeof entry.title === "string" ? entry.title.trim() : "";
    if (!title) continue;
    const accessConstraints = normalizeStringList(entry.accessConstraints, 12);
    out.push({
      title,
      datasetId: typeof entry.datasetId === "string" ? entry.datasetId : undefined,
      portalType: isPortalType(entry.portalType) ? entry.portalType : undefined,
      portalUrl: typeof entry.portalUrl === "string" ? entry.portalUrl : undefined,
      dataUrl: typeof entry.dataUrl === "string" ? entry.dataUrl : undefined,
      homepageUrl: typeof entry.homepageUrl === "string" ? entry.homepageUrl : undefined,
      source: typeof entry.source === "string" ? entry.source : undefined,
      license: typeof entry.license === "string" ? entry.license : undefined,
      licenseUrl: typeof entry.licenseUrl === "string" ? entry.licenseUrl : undefined,
      termsOfService: typeof entry.termsOfService === "string" ? entry.termsOfService : undefined,
      termsUrl: typeof entry.termsUrl === "string" ? entry.termsUrl : undefined,
      accessConstraints: accessConstraints.length > 0 ? accessConstraints : undefined,
      retrievedAt: typeof entry.retrievedAt === "string" ? entry.retrievedAt : undefined,
      lastUpdated: typeof entry.lastUpdated === "string" ? entry.lastUpdated : undefined
    });
  }
  return out.length > 0 ? out : undefined;
};

const toTitleCase = (input: string) => {
  const spaced = input
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) return "Section";
  return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
};

const clampText = (value: string, max: number) => {
  if (value.length <= max) return value;
  return value.slice(0, max).trim();
};

const normalizeStringList = (value: unknown, limit: number) => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const trimmed = entry.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
    if (out.length >= limit) break;
  }
  return out;
};

const isPrimitive = (value: unknown) => {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined
  );
};

const stringifyPrimitive = (value: unknown) => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const items = value.map((item) => stringifyPrimitive(item)).filter(Boolean);
    return items.length > 0 ? items.join(", ") : "N/A";
  }
  if (isPlainObject(value)) return "{...}";
  return String(value);
};

const escapeTableCell = (value: string) => {
  return value.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, "; ");
};

const formatObjectInline = (value: Record<string, unknown>) => {
  const entries = Object.entries(value).slice(0, 10);
  return entries
    .map(([key, val]) => `${toTitleCase(key)}: ${stringifyPrimitive(val)}`)
    .join("; ");
};

const formatArrayAsTable = (value: unknown[]) => {
  if (value.length === 0) return "";
  const rows = value.filter(isPlainObject) as Record<string, unknown>[];
  if (rows.length === 0) return "";
  const headerSet = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => headerSet.add(key));
  });
  const headers = Array.from(headerSet).slice(0, 8);
  if (headers.length === 0) return "";
  if (!rows.every((row) => headers.every((key) => isPrimitive(row[key])))) return "";

  const headerRow = `| ${headers.map((h) => escapeTableCell(toTitleCase(h))).join(" | ")} |`;
  const dividerRow = `| ${headers.map(() => "---").join(" | ")} |`;
  const bodyRows = rows.map((row) => {
    const cells = headers.map((key) => escapeTableCell(stringifyPrimitive(row[key])));
    return `| ${cells.join(" | ")} |`;
  });
  return [headerRow, dividerRow, ...bodyRows].join("\n");
};

export const looksLikeJsonText = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return true;
  if (trimmed.startsWith("```")) {
    const afterFence = trimmed.replace(/^```/, "").trimStart().toLowerCase();
    return afterFence.startsWith("json") || afterFence.startsWith("{") || afterFence.startsWith("[");
  }
  return false;
};

const formatValueToMarkdown = (value: unknown, depth = 0): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (looksLikeJsonText(trimmed)) {
      const parsed = tryParseJsonFromText(trimmed);
      if (parsed.data && typeof parsed.data !== "string") {
        return formatValueToMarkdown(parsed.data, depth + 1);
      }
    }
    return trimmed;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "";
    const table = formatArrayAsTable(value);
    if (table) return table;
    const lines = value.map((item) => {
      if (isPrimitive(item)) return `- ${stringifyPrimitive(item)}`;
      if (isPlainObject(item)) return `- ${formatObjectInline(item)}`;
      return `- ${String(item)}`;
    });
    return lines.join("\n");
  }
  if (isPlainObject(value)) {
    if (depth >= 2) return formatObjectInline(value);
    const lines: string[] = [];
    for (const [key, val] of Object.entries(value)) {
      const formatted = formatValueToMarkdown(val, depth + 1);
      if (!formatted) continue;
      if (formatted.includes("\n")) {
        const indented = formatted
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n");
        lines.push(`- ${toTitleCase(key)}:\n${indented}`);
      } else {
        lines.push(`- ${toTitleCase(key)}: ${formatted}`);
      }
    }
    return lines.join("\n");
  }
  return String(value);
};

const normalizeSources = (value: unknown) => normalizeStringList(value, MAX_SOURCE_COUNT);

const normalizeSection = (input: unknown, fallbackTitle: string): ReportSection => {
  if (typeof input === "string") {
    return { title: fallbackTitle, content: input.trim(), sources: [] };
  }
  if (isPlainObject(input)) {
    const title = typeof input.title === "string" ? input.title : fallbackTitle;
    const contentValue =
      typeof input.content === "string"
        ? input.content
        : typeof input.body === "string"
          ? input.body
          : typeof input.text === "string"
            ? input.text
            : input.content ?? input.body ?? input.text ?? input;
    const content = formatValueToMarkdown(contentValue) || "No content provided.";
    const sources = normalizeSources((input as Record<string, unknown>).sources);
    return { title, content, sources };
  }
  return { title: fallbackTitle, content: "No content provided.", sources: [] };
};

const buildSectionsFromObject = (data: Record<string, unknown>) => {
  const skipKeys = new Set(["title", "summary", "provenance", "visualizations", "schemaVersion"]);
  const priority = [
    "executiveBrief",
    "executive_summary",
    "executiveSummary",
    "verdict",
    "keyMetrics",
    "key_metrics",
    "keyMetricsTable",
    "key_metrics_table",
    "sectorAnalysis",
    "analysis",
    "consensus",
    "conflicts",
    "bibliography",
    "sources",
    "citations"
  ];
  const entries = Object.entries(data).filter(([key]) => !skipKeys.has(key));
  entries.sort((a, b) => {
    const aIndex = priority.indexOf(a[0]);
    const bIndex = priority.indexOf(b[0]);
    if (aIndex === -1 && bIndex === -1) return a[0].localeCompare(b[0]);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return entries.map(([key, value]) => ({
    title: toTitleCase(key),
    content: formatValueToMarkdown(value) || "No content provided.",
    sources: []
  }));
};

const sanitizeChartData = (input: any): ChartData | null => {
  if (!isPlainObject(input)) return null;
  const rawLabels = Array.isArray(input.labels) ? input.labels : [];
  const labels = rawLabels
    .map((label) => (typeof label === "string" ? label.trim() : String(label ?? "").trim()))
    .filter(Boolean)
    .map((label) => clampText(label, MAX_LABEL_LENGTH))
    .slice(0, MAX_TABLE_ROWS);
  if (labels.length === 0) return null;

  const rawSeries = Array.isArray(input.series) ? input.series : [];
  const series: ChartSeries[] = [];
  for (const entry of rawSeries) {
    if (!isPlainObject(entry)) continue;
    const name =
      typeof entry.name === "string" && entry.name.trim().length > 0
        ? clampText(entry.name.trim(), MAX_LABEL_LENGTH)
        : "Series";
    const dataValues = Array.isArray(entry.data) ? entry.data : [];
    const numericValues = dataValues
      .map((val) => (Number.isFinite(Number(val)) ? Number(val) : null))
      .filter((val): val is number => val !== null);
    if (numericValues.length === 0) continue;
    series.push({ name, data: numericValues.slice(0, MAX_TABLE_ROWS) });
    if (series.length >= MAX_SERIES) break;
  }

  if (series.length === 0) return null;
  const pointCount = Math.min(labels.length, ...series.map((s) => s.data.length));
  if (!Number.isFinite(pointCount) || pointCount <= 0) return null;

  const alignedLabels = labels.slice(0, pointCount);
  const alignedSeries = series
    .map((s) => ({ ...s, data: s.data.slice(0, pointCount) }))
    .filter((s) => s.data.length === pointCount);
  if (alignedSeries.length === 0) return null;

  const unit =
    typeof input.unit === "string" && input.unit.trim().length > 0
      ? clampText(input.unit.trim(), 16)
      : undefined;

  return {
    labels: alignedLabels,
    series: alignedSeries,
    unit
  };
};

const isSafeImageUrl = (value: string) => {
  if (value.length > MAX_URL_LENGTH) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (IMAGE_HOST_ALLOWLIST.length > 0 && !IMAGE_HOST_ALLOWLIST.includes(url.hostname)) {
      return false;
    }
    return true;
  } catch (_) {
    return false;
  }
};

const sanitizeVisualization = (input: any): Visualization | null => {
  if (!isPlainObject(input)) return null;
  const type = typeof input.type === "string" ? input.type.trim().toLowerCase() : "";
  const title =
    typeof input.title === "string" && input.title.trim().length > 0
      ? clampText(input.title.trim(), MAX_TITLE_LENGTH)
      : "Visualization";
  const caption =
    typeof input.caption === "string" && input.caption.trim().length > 0
      ? clampText(input.caption.trim(), MAX_CAPTION_LENGTH)
      : undefined;
  const sources = normalizeSources(input.sources);

  if (type === "image") {
    const data = isPlainObject(input.data) ? input.data : null;
    const url = typeof data?.url === "string" ? data.url.trim() : "";
    if (!url || !isSafeImageUrl(url)) return null;
    const alt =
      typeof data?.alt === "string" && data.alt.trim().length > 0
        ? clampText(data.alt.trim(), MAX_LABEL_LENGTH)
        : title;
    const width = Number.isFinite(Number(data?.width)) ? Number(data?.width) : undefined;
    const height = Number.isFinite(Number(data?.height)) ? Number(data?.height) : undefined;
    const imageViz: ImageVisualization = {
      type: "image",
      title,
      caption,
      sources,
      data: {
        url,
        alt,
        width,
        height
      }
    };
    return imageViz;
  }

  if (type === "bar" || type === "line" || type === "area") {
    const chartData = sanitizeChartData(input.data);
    if (!chartData) return null;
    const chartViz: ChartVisualization = {
      type: type as ChartVisualization["type"],
      title,
      caption,
      sources,
      data: chartData
    };
    return chartViz;
  }

  return null;
};

const normalizeVisualizations = (value: unknown): Visualization[] => {
  if (!Array.isArray(value)) return [];
  const out: Visualization[] = [];
  for (const entry of value) {
    const normalized = sanitizeVisualization(entry);
    if (!normalized) continue;
    out.push(normalized);
    if (out.length >= MAX_VISUALIZATIONS) break;
  }
  return out;
};

export const coerceReportData = (input: any, topic: string): FinalReport => {
  const title = typeof input?.title === "string" ? input.title : `Deep Dive: ${topic}`;
  const summary =
    typeof input?.summary === "string"
      ? input.summary
      : typeof input?.executiveBrief === "string"
        ? input.executiveBrief
        : typeof input?.executiveSummary === "string"
          ? input.executiveSummary
          : "Summary unavailable. See sections below.";

  let sections: ReportSection[] = [];
  if (Array.isArray(input?.sections)) {
    sections = input.sections.map((section: unknown, index: number) =>
      normalizeSection(section, `Section ${index + 1}`)
    );
  } else if (isPlainObject(input)) {
    sections = buildSectionsFromObject(input);
  }

  if (sections.length === 0) {
    sections = [
      {
        title: "Report Content",
        content: formatValueToMarkdown(input) || "No report content available.",
        sources: []
      }
    ];
  }

  const primaryRecordCoverage = normalizePrimaryRecordCoverage(input?.provenance?.primaryRecordCoverage);
  const datasetCompliance = normalizeDatasetCompliance(input?.provenance?.datasetCompliance);

  return {
    title,
    summary,
    sections,
    visualizations: normalizeVisualizations(input?.visualizations),
    provenance: {
      totalSources:
        typeof input?.provenance?.totalSources === "number" ? input.provenance.totalSources : 0,
      methodAudit:
        typeof input?.provenance?.methodAudit === "string"
          ? input.provenance.methodAudit
          : DEFAULT_METHOD_AUDIT,
      primaryRecordCoverage,
      datasetCompliance
    },
    schemaVersion:
      typeof input?.schemaVersion === "number" && Number.isFinite(input.schemaVersion)
        ? input.schemaVersion
        : DEFAULT_SCHEMA_VERSION
  };
};

export const buildReportFromRawText = (rawText: string, topic: string) => {
  const parsed = tryParseJsonFromText(rawText);
  if (parsed.data) {
    return { report: coerceReportData(parsed.data, topic), parsed: true };
  }
  return { report: null, parsed: false };
};
