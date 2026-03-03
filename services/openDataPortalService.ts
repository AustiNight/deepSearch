import type { Jurisdiction, OpenDataPortalType, OpenDatasetMetadata } from "../types";
import { getOpenDatasetIndex, discoverOpenDataDatasets, persistOpenDatasetMetadata } from "./openDataDiscovery";
import { createOpenDataProvider, detectPortalType, probePortalType } from "./openDataProviders";
import { getOpenDataConfig } from "./openDataConfig";

export type PortalDiscoveryPlan = {
  portalUrl: string;
  queries: string[];
  portalType?: OpenDataPortalType;
};

const normalizePortalUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed}`.replace(/\/$/, "");
};

const nowMs = () => Date.now();

const parseIso = (value?: string) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeDomain = (value: string) => {
  try {
    const host = new URL(normalizePortalUrl(value)).hostname.toLowerCase();
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch (_) {
    return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
};

const normalizeToken = (value?: string) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const computeRecencyScore = (updatedAt?: string) => {
  if (!updatedAt) return 0;
  const parsed = parseIso(updatedAt);
  if (!parsed) return 0;
  const ageDays = Math.max(0, (Date.now() - parsed) / (1000 * 60 * 60 * 24));
  if (ageDays <= 30) return 8;
  if (ageDays <= 180) return 5;
  if (ageDays <= 730) return 2;
  return 0;
};

const getParcelHintDatasets = () =>
  getOpenDatasetHints(["parcel", "assessor", "appraiser", "apn", "pin", "cadastre"]);

export const rankOpenDataPortalCandidates = (
  candidates: string[],
  options: {
    jurisdiction?: Jurisdiction;
    limit?: number;
    baseWeights?: Record<string, number>;
  } = {}
) => {
  const normalizedCandidates = Array.from(new Set(
    candidates
      .map((candidate) => normalizePortalUrl(String(candidate || "")))
      .filter(Boolean)
  ));
  if (normalizedCandidates.length <= 1) {
    return normalizedCandidates.slice(0, options.limit ?? normalizedCandidates.length);
  }

  const index = getOpenDatasetIndex();
  const datasets = Array.isArray(index.datasets) ? index.datasets : [];
  const parcelHints = getParcelHintDatasets();
  const parcelHintByPortal = new Map<string, number>();
  parcelHints.forEach((dataset) => {
    const portal = normalizePortalUrl(dataset.portalUrl);
    if (!portal) return;
    parcelHintByPortal.set(portal, (parcelHintByPortal.get(portal) || 0) + 1);
  });

  const cityToken = normalizeToken(options.jurisdiction?.city);
  const countyToken = normalizeToken(options.jurisdiction?.county);

  const scored = normalizedCandidates.map((portalUrl, indexOrder) => {
    const domain = normalizeDomain(portalUrl);
    const portalDatasets = datasets.filter((dataset) => normalizePortalUrl(dataset.portalUrl) === portalUrl);
    const latestDataset = portalDatasets
      .map((dataset) => dataset.lastUpdated || dataset.retrievedAt)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => (parseIso(b) || 0) - (parseIso(a) || 0))[0];
    const baseWeight = options.baseWeights?.[portalUrl] || 0;
    const hintCount = parcelHintByPortal.get(portalUrl) || 0;
    const knownTypeBoost = detectPortalType(portalUrl) === "unknown" ? 0 : 8;
    const govBoost = domain.endsWith(".gov") ? 4 : 0;
    const cityBoost = cityToken && domain.includes(cityToken) ? 4 : 0;
    const countyBoost = countyToken && domain.includes(countyToken) ? 3 : 0;
    const datasetBoost = Math.min(12, portalDatasets.length * 2);
    const recencyBoost = computeRecencyScore(latestDataset);
    const score = baseWeight + hintCount * 6 + knownTypeBoost + govBoost + cityBoost + countyBoost + datasetBoost + recencyBoost;
    return { portalUrl, score, indexOrder };
  });

  const sorted = scored
    .sort((a, b) => (b.score - a.score) || (a.indexOrder - b.indexOrder))
    .map((entry) => entry.portalUrl);

  return sorted.slice(0, options.limit ?? sorted.length);
};

export const shouldRecrawlPortal = (portalUrl: string) => {
  const normalizedPortal = normalizePortalUrl(portalUrl);
  const index = getOpenDatasetIndex();
  const crawl = index.portalCrawls?.[normalizedPortal];
  if (!crawl?.nextCrawlAt) return true;
  const next = parseIso(crawl.nextCrawlAt);
  return !next || nowMs() >= next;
};

export const autoIngestOpenDataPortals = async (plans: PortalDiscoveryPlan[]) => {
  const config = getOpenDataConfig();
  if (!config.featureFlags.autoIngestion) return getOpenDatasetIndex();
  for (const plan of plans) {
    if (!plan.portalUrl) continue;
    const normalizedPortal = normalizePortalUrl(plan.portalUrl);
    if (!normalizedPortal) continue;
    if (!shouldRecrawlPortal(normalizedPortal)) continue;
    const provider = getOpenDataProviderForPortal(normalizedPortal, plan.portalType);
    for (const query of plan.queries) {
      const result = await discoverOpenDataDatasets({
        portalUrl: normalizedPortal,
        query,
        portalType: plan.portalType
      });
      const enriched: OpenDatasetMetadata[] = [];
      for (const dataset of result.datasets) {
        const datasetId = dataset.datasetId || dataset.id;
        const fields = await provider.listFields(datasetId);
        const distributions = await provider.getDistributions(datasetId);
        enriched.push({
          ...dataset,
          fields: fields.map((field) => field.name),
          distributions: distributions
            .map((dist) => dist.downloadUrl || dist.accessUrl)
            .filter((url): url is string => Boolean(url))
        });
      }
      if (enriched.length > 0) {
        persistOpenDatasetMetadata(enriched);
      }
    }
  }
  return getOpenDatasetIndex();
};

export const scheduleOpenDataAutoIngestion = (plans: PortalDiscoveryPlan[], intervalMs: number) => {
  const config = getOpenDataConfig();
  if (!config.featureFlags.autoIngestion || typeof window === "undefined") {
    return () => undefined;
  }
  const safeInterval = Math.max(60_000, Math.floor(intervalMs));
  const timer = window.setInterval(() => {
    void autoIngestOpenDataPortals(plans);
  }, safeInterval);
  return () => window.clearInterval(timer);
};

export const getOpenDatasetHints = (tags: string[] = []) => {
  const config = getOpenDataConfig();
  if (!config.featureFlags.evidenceRecovery) return [];
  const index = getOpenDatasetIndex();
  if (!index.datasets) return [];
  const normalizedTags = tags.map((tag) => tag.toLowerCase()).filter(Boolean);
  return index.datasets.filter((dataset) => {
    if (dataset.doNotUse) return false;
    if (normalizedTags.length === 0) return true;
    const corpus = [
      dataset.title || "",
      dataset.description || "",
      ...(dataset.tags || []),
      ...(dataset.fields || [])
    ]
      .join(" ")
      .toLowerCase();
    return normalizedTags.some((tag) => corpus.includes(tag));
  });
};

export const getOpenDataProviderForPortal = (portalUrl: string, portalType?: OpenDataPortalType) => {
  const resolvedType = portalType && portalType !== "unknown" ? portalType : detectPortalType(portalUrl);
  return createOpenDataProvider({ portalUrl, portalType: resolvedType, config: getOpenDataConfig() });
};

export const resolvePortalType = async (portalUrl: string, portalType?: OpenDataPortalType) => {
  if (portalType && portalType !== "unknown") return portalType;
  const detected = detectPortalType(portalUrl);
  if (detected !== "unknown") return detected;
  return probePortalType(portalUrl);
};

export const getOpenDataProviderForPortalAsync = async (portalUrl: string, portalType?: OpenDataPortalType) => {
  const resolvedType = await resolvePortalType(portalUrl, portalType);
  return createOpenDataProvider({ portalUrl, portalType: resolvedType, config: getOpenDataConfig() });
};

export const discoverPortalDatasets = async (portalUrl: string, query: string, portalType?: OpenDataPortalType) => {
  const provider = getOpenDataProviderForPortal(portalUrl, portalType);
  const datasets = await provider.discoverDatasets(query);
  return datasets;
};

export const fetchPortalDatasetMetadata = async (portalUrl: string, datasetId: string, portalType?: OpenDataPortalType) => {
  const provider = getOpenDataProviderForPortal(portalUrl, portalType);
  return provider.fetchMetadata(datasetId);
};

export const listPortalDatasetFields = async (portalUrl: string, datasetId: string, portalType?: OpenDataPortalType) => {
  const provider = getOpenDataProviderForPortal(portalUrl, portalType);
  return provider.listFields(datasetId);
};

export const listPortalDatasetDistributions = async (portalUrl: string, datasetId: string, portalType?: OpenDataPortalType) => {
  const provider = getOpenDataProviderForPortal(portalUrl, portalType);
  return provider.getDistributions(datasetId);
};

export const queryPortalDatasetByText = async (
  portalUrl: string,
  datasetId: string,
  searchText: string,
  portalType?: OpenDataPortalType
) => {
  const provider = getOpenDataProviderForPortal(portalUrl, portalType);
  return provider.queryByText({ datasetId, searchText });
};

export const queryPortalDatasetByGeometry = async (
  portalUrl: string,
  datasetId: string,
  point: { lat: number; lon: number },
  portalType?: OpenDataPortalType
) => {
  const provider = getOpenDataProviderForPortal(portalUrl, portalType);
  return provider.queryByGeometry({ datasetId, point });
};
