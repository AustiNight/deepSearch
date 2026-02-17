import type { FinalReport, ReportSection } from "../types";
import { tryParseJsonFromText } from "./jsonUtils";

const DEFAULT_METHOD_AUDIT = "Deep Drill Protocol: 3-Stage Recursive Verification.";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
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

const normalizeSources = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.filter((entry) => typeof entry === "string");
};

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
  const skipKeys = new Set(["title", "summary", "provenance"]);
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

  return {
    title,
    summary,
    sections,
    provenance: {
      totalSources:
        typeof input?.provenance?.totalSources === "number" ? input.provenance.totalSources : 0,
      methodAudit:
        typeof input?.provenance?.methodAudit === "string"
          ? input.provenance.methodAudit
          : DEFAULT_METHOD_AUDIT
    }
  };
};

export const buildReportFromRawText = (rawText: string, topic: string) => {
  const parsed = tryParseJsonFromText(rawText);
  if (parsed.data) {
    return { report: coerceReportData(parsed.data, topic), parsed: true };
  }
  return { report: null, parsed: false };
};
