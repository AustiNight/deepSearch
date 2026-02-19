import type { OpenDataPortalType, OpenDatasetMetadata } from "../types";
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
  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  return index.datasets.filter((dataset) => {
    if (dataset.doNotUse) return false;
    if (!dataset.tags || dataset.tags.length === 0) return false;
    const datasetTags = dataset.tags.map((tag) => tag.toLowerCase());
    return normalizedTags.some((tag) => datasetTags.some((dtag) => dtag.includes(tag)));
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
