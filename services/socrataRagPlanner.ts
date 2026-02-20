import ragSpec from "../data/socrataRagSpec.ts";
import { recordRagUsageById } from "./ragTelemetry";

// Zero-cost default: use anonymous v2 SODA endpoints; v3 requires explicit opt-in + app token.

export type SocrataDiscoveryPlan = {
  endpoint: string;
  params: Record<string, string>;
  unknownParams: string[];
  warnings: string[];
  ragUsageId?: string;
};

export type SocrataSodaPlan = {
  version: "2.1" | "3.0";
  method: "GET" | "POST";
  path: string;
  requiresAppToken: boolean;
  ragUsageId?: string;
};

export type SocrataSodaEndpoint = SocrataSodaPlan & {
  portalUrl: string;
  url: string;
};

type RagSpec = typeof ragSpec;

type ParamPattern = {
  name: string;
  kind: "literal" | "dynamic" | "customMetadata";
  regex?: RegExp;
};

const normalizeDomain = (portalUrl: string) => {
  try {
    const parsed = new URL(portalUrl);
    return parsed.hostname;
  } catch (_) {
    return portalUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
};

const normalizePortalUrl = (portalUrl: string) => {
  const trimmed = portalUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed}`.replace(/\/$/, "");
};

const resolveCatalogBase = (portalUrl: string, spec: RagSpec) => {
  const domain = normalizeDomain(portalUrl);
  const useEu = domain.endsWith(".eu") || domain.includes(".eu.");
  const base = useEu ? spec.discovery.catalogBaseUrls.eu : spec.discovery.catalogBaseUrls.us;
  return { base, domain };
};

const buildParamPatterns = (spec: RagSpec): ParamPattern[] => {
  return spec.discovery.allowedParams.map((name: string) => {
    if (name === "{custom_metadata_key}") {
      return {
        name,
        kind: "customMetadata",
        regex: /^.+$/i
      };
    }
    if (name.includes("{") || name.includes("[")) {
      const pattern = name
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\\\{[^}]+\\\}/g, ".+")
        .replace(/\\\[[^\]]+\\\]/g, "\\\\[.+\\\\]");
      return { name, kind: "dynamic", regex: new RegExp(`^${pattern}$`, "i") };
    }
    return { name, kind: "literal" };
  });
};

const DISCOVERY_PARAM_PATTERNS = buildParamPatterns(ragSpec);

const matchParam = (param: string, allowCustomMetadata: boolean) => {
  const lower = param.toLowerCase();
  for (const pattern of DISCOVERY_PARAM_PATTERNS) {
    if (pattern.kind === "customMetadata") continue;
    if (pattern.regex) {
      if (pattern.regex.test(param)) return { allowed: true, kind: pattern.kind };
      continue;
    }
    if (pattern.name.toLowerCase() === lower) return { allowed: true, kind: pattern.kind };
  }
  if (allowCustomMetadata) {
    const customPattern = DISCOVERY_PARAM_PATTERNS.find((pattern) => pattern.kind === "customMetadata");
    if (customPattern?.regex?.test(param)) {
      return { allowed: true, kind: "customMetadata" as const };
    }
  }
  return { allowed: false, kind: undefined };
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const planSocrataDiscoveryQuery = (input: {
  portalUrl: string;
  query: string;
  limit?: number;
  offset?: number;
  scrollId?: string;
  filters?: Record<string, string>;
  allowCustomMetadata?: boolean;
}): SocrataDiscoveryPlan => {
  const spec = ragSpec as RagSpec;
  const allowCustomMetadata = input.allowCustomMetadata === true;
  const { base, domain } = resolveCatalogBase(input.portalUrl, spec);
  const params: Record<string, string> = {};
  const unknownParams: string[] = [];
  const warnings: string[] = [];

  const query = input.query.trim();
  if (query) params.q = query;
  params.search_context = domain;

  const filters = input.filters || {};
  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    const match = matchParam(key, allowCustomMetadata);
    if (!match.allowed) {
      unknownParams.push(key);
      return;
    }
    if (match.kind === "customMetadata") {
      warnings.push(`Custom metadata param used: ${key}`);
    }
    params[key] = value;
  });

  const limit = clamp(Math.floor(input.limit ?? spec.discovery.pagination.defaultLimit), 1, 1000);
  const offset = Math.max(0, Math.floor(input.offset ?? 0));
  params.limit = String(limit);
  const scrollId = input.scrollId?.trim();
  if (scrollId) {
    params.scroll_id = scrollId;
    if (offset > 0) {
      warnings.push("scroll_id provided; offset ignored.");
    }
  } else if (offset > 0) {
    params.offset = String(offset);
  }

  if (offset + limit > spec.discovery.pagination.maxOffsetPlusLimit) {
    warnings.push("Discovery pagination exceeded max offset + limit; consider scroll_id.");
  }
  if (unknownParams.length > 0) {
    warnings.push(`Unknown discovery params ignored: ${unknownParams.join(", ")}`);
  }

  const searchParams = new URLSearchParams(params);
  const endpoint = `${base}?${searchParams.toString()}`;

  let ragUsageId: string | undefined;
  if (Array.isArray(spec.discovery.sourceChunkIds) && spec.discovery.sourceChunkIds.length > 0) {
    const usage = recordRagUsageById({
      query: "socrata_discovery_parameters",
      chunkIds: spec.discovery.sourceChunkIds,
      context: "socrata_discovery_plan"
    });
    ragUsageId = usage.id;
  }

  return { endpoint, params, unknownParams, warnings, ragUsageId };
};

export const planSocrataSodaEndpoint = (input: {
  datasetId: string;
  preferV3?: boolean;
  hasAppToken?: boolean;
  mode?: "query" | "export";
}): SocrataSodaPlan => {
  const spec = ragSpec as RagSpec;
  const datasetId = input.datasetId;
  const preferV3 = input.preferV3 === true;
  const hasToken = input.hasAppToken === true;
  const mode = input.mode === "export" ? "export" : "query";

  const canUseV3 = preferV3 && hasToken && spec.soda.v3 && spec.soda.v3.queryPath;
  const v3Path = mode === "export" ? spec.soda.v3.exportPath : spec.soda.v3.queryPath;
  const v2Path = spec.soda.v2.resourcePath;

  let ragUsageId: string | undefined;
  if (canUseV3 && Array.isArray(spec.soda.v3.sourceChunkIds)) {
    const usage = recordRagUsageById({
      query: "socrata_soda_v3_endpoints",
      chunkIds: spec.soda.v3.sourceChunkIds,
      context: "socrata_soda_plan"
    });
    ragUsageId = usage.id;
  } else if (Array.isArray(spec.soda.v2.sourceChunkIds)) {
    const usage = recordRagUsageById({
      query: "socrata_soda_v2_endpoints",
      chunkIds: spec.soda.v2.sourceChunkIds,
      context: "socrata_soda_plan"
    });
    ragUsageId = usage.id;
  }

  if (canUseV3) {
    const path = v3Path.replace("{id}", datasetId);
    return {
      version: "3.0",
      method: "POST",
      path,
      requiresAppToken: true,
      ragUsageId
    };
  }
  return {
    version: "2.1",
    method: "GET",
    path: v2Path.replace("{id}", datasetId),
    requiresAppToken: false,
    ragUsageId
  };
};

// Zero-cost default: anonymous v2 endpoints. v3 requires explicit opt-in + app token.
// Endpoint paths are sourced from the RAG spec derived from the Socrata docs.
export const buildSocrataSodaEndpoint = (input: {
  portalUrl: string;
  datasetId: string;
  preferV3?: boolean;
  hasAppToken?: boolean;
  mode?: "query" | "export";
  params?: URLSearchParams | string;
}): SocrataSodaEndpoint => {
  const plan = planSocrataSodaEndpoint({
    datasetId: input.datasetId,
    preferV3: input.preferV3,
    hasAppToken: input.hasAppToken,
    mode: input.mode
  });
  const portalUrl = normalizePortalUrl(input.portalUrl);
  const params = typeof input.params === "string" ? input.params : input.params?.toString();
  const url = params ? `${portalUrl}${plan.path}?${params}` : `${portalUrl}${plan.path}`;
  return { ...plan, portalUrl, url };
};
