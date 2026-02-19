import type { DatasetComplianceEntry, IsoDateString, IsoDateTimeString, OpenDataPortalType, OpenDatasetIndex, OpenDatasetMetadata } from "../types";

const OPEN_DATA_INDEX_SCHEMA_VERSION = 1;
const OPEN_DATA_INDEX_STORAGE_KEY = "overseer_open_data_index";
const DEFAULT_LIMIT = 25;

const hasLocalStorage = () => typeof window !== "undefined" && !!window.localStorage;

const toIsoDateString = (value: unknown): IsoDateString | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.valueOf())) return parsed.toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  }
  if (typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) return parsed.toISOString().slice(0, 10);
  }
  return undefined;
};

const toIsoDateTimeString = (value?: Date): IsoDateTimeString => (value || new Date()).toISOString();

const normalizePortalUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed}`.replace(/\/$/, "");
};

const getDomain = (value: string) => {
  try {
    return new URL(value).hostname;
  } catch (_) {
    return value;
  }
};

const asString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  return undefined;
};

const asStringFrom = (...values: unknown[]) => {
  for (const value of values) {
    const str = asString(value);
    if (str) return str;
    if (value && typeof value === "object") {
      const name = asString((value as { name?: unknown }).name);
      if (name) return name;
      const title = asString((value as { title?: unknown }).title);
      if (title) return title;
      const label = asString((value as { label?: unknown }).label);
      if (label) return label;
      const id = asString((value as { id?: unknown }).id);
      if (id) return id;
    }
  }
  return undefined;
};

const asUrlString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
};

const parseLicenseDetails = (value: unknown) => {
  if (!value) return { license: undefined, licenseUrl: undefined };
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return { license: undefined, licenseUrl: undefined };
    return { license: trimmed, licenseUrl: asUrlString(trimmed) };
  }
  if (typeof value === "object") {
    const license = asStringFrom(
      (value as { name?: unknown }).name,
      (value as { title?: unknown }).title,
      (value as { label?: unknown }).label,
      (value as { id?: unknown }).id
    );
    const licenseUrl = asStringFrom(
      (value as { url?: unknown }).url,
      (value as { href?: unknown }).href,
      (value as { link?: unknown }).link,
      (value as { uri?: unknown }).uri,
      (value as { "@id"?: unknown })["@id"]
    );
    return {
      license: license || (licenseUrl ? licenseUrl : undefined),
      licenseUrl: licenseUrl || (license && asUrlString(license) ? license : undefined)
    };
  }
  return { license: undefined, licenseUrl: undefined };
};

const parseTermsDetails = (value: unknown) => {
  if (!value) return { termsOfService: undefined, termsUrl: undefined };
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return { termsOfService: undefined, termsUrl: undefined };
    if (asUrlString(trimmed)) return { termsOfService: undefined, termsUrl: trimmed };
    return { termsOfService: trimmed, termsUrl: undefined };
  }
  if (typeof value === "object") {
    const termsText = asStringFrom(
      (value as { name?: unknown }).name,
      (value as { title?: unknown }).title,
      (value as { label?: unknown }).label,
      (value as { description?: unknown }).description
    );
    const termsUrl = asStringFrom(
      (value as { url?: unknown }).url,
      (value as { href?: unknown }).href,
      (value as { link?: unknown }).link,
      (value as { uri?: unknown }).uri,
      (value as { "@id"?: unknown })["@id"]
    );
    return {
      termsOfService: termsText,
      termsUrl: termsUrl || (termsText && asUrlString(termsText) ? termsText : undefined)
    };
  }
  return { termsOfService: undefined, termsUrl: undefined };
};

const collectAccessConstraints = (...values: unknown[]) => {
  const out: string[] = [];
  const pushValue = (value: unknown) => {
    if (!value) return;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) out.push(trimmed);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(pushValue);
      return;
    }
    if (typeof value === "object") {
      const str = asStringFrom(
        (value as { label?: unknown }).label,
        (value as { name?: unknown }).name,
        (value as { title?: unknown }).title,
        (value as { id?: unknown }).id,
        (value as { "@id"?: unknown })["@id"]
      );
      if (str) out.push(str);
    }
  };
  values.forEach(pushValue);
  return Array.from(new Set(out));
};

const mergeAccessConstraints = (base: string[] = [], next: string[] = []) =>
  Array.from(new Set([...base, ...next]));

const parsePublisher = (value: unknown) => {
  if (!value) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "object") {
    const name = asStringFrom((value as { name?: unknown }).name, (value as { title?: unknown }).title, (value as { label?: unknown }).label);
    if (name) return name;
    const id = asString((value as { "@id"?: unknown })["@id"]);
    if (id) return id;
  }
  return undefined;
};

const loadOpenDatasetIndex = (): OpenDatasetIndex => {
  const fallback: OpenDatasetIndex = {
    schemaVersion: OPEN_DATA_INDEX_SCHEMA_VERSION,
    updatedAt: toIsoDateTimeString(),
    datasets: []
  };
  if (!hasLocalStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(OPEN_DATA_INDEX_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const datasets = Array.isArray(parsed?.datasets) ? parsed.datasets : [];
    return {
      schemaVersion: OPEN_DATA_INDEX_SCHEMA_VERSION,
      updatedAt: asString(parsed?.updatedAt) || fallback.updatedAt,
      datasets
    } as OpenDatasetIndex;
  } catch (_) {
    return fallback;
  }
};

const saveOpenDatasetIndex = (index: OpenDatasetIndex) => {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(OPEN_DATA_INDEX_STORAGE_KEY, JSON.stringify(index));
  } catch (_) {
    // ignore persistence failures
  }
};

const buildDatasetKey = (dataset: OpenDatasetMetadata) => {
  const idPart = dataset.datasetId || dataset.title;
  return [dataset.portalType, dataset.portalUrl, idPart].filter(Boolean).join("|").toLowerCase();
};

const upsertOpenDatasets = (datasets: OpenDatasetMetadata[]) => {
  if (datasets.length === 0) return loadOpenDatasetIndex();
  const index = loadOpenDatasetIndex();
  const next = [...index.datasets];
  const existingIndex = new Map<string, number>();
  next.forEach((dataset, idx) => {
    existingIndex.set(buildDatasetKey(dataset), idx);
  });

  for (const dataset of datasets) {
    const key = buildDatasetKey(dataset);
    if (!key) continue;
    const existing = existingIndex.get(key);
    if (existing === undefined) {
      existingIndex.set(key, next.length);
      next.push(dataset);
    } else {
      next[existing] = { ...next[existing], ...dataset };
    }
  }

  const updated: OpenDatasetIndex = {
    schemaVersion: OPEN_DATA_INDEX_SCHEMA_VERSION,
    updatedAt: toIsoDateTimeString(),
    datasets: next
  };
  saveOpenDatasetIndex(updated);
  return updated;
};

const safeFetchJson = async (url: string) => {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    return { ok: false, status: res.status, data: null } as const;
  }
  try {
    const data = await res.json();
    return { ok: true, status: res.status, data } as const;
  } catch (_) {
    return { ok: false, status: res.status, data: null } as const;
  }
};

const detectPortalType = (portalUrl: string): OpenDataPortalType => {
  const normalized = portalUrl.toLowerCase();
  if (normalized.includes("arcgis")) return "arcgis";
  if (normalized.includes("socrata")) return "socrata";
  if (normalized.includes("data.json") || normalized.includes("catalog.json")) return "dcat";
  return "unknown";
};

const normalizeDataset = (input: {
  portalType: OpenDataPortalType;
  portalUrl: string;
  datasetId?: string;
  title?: string;
  description?: string;
  source?: string;
  lastUpdated?: IsoDateString;
  license?: string;
  licenseUrl?: string;
  termsOfService?: string;
  termsUrl?: string;
  accessConstraints?: string[];
  dataUrl?: string;
  homepageUrl?: string;
  tags?: string[];
}): OpenDatasetMetadata | null => {
  const title = asString(input.title);
  if (!title) return null;
  return {
    id: `dataset-${Math.random().toString(36).slice(2, 10)}`,
    portalType: input.portalType,
    portalUrl: input.portalUrl,
    datasetId: asString(input.datasetId),
    title,
    description: asString(input.description),
    source: asString(input.source),
    lastUpdated: input.lastUpdated,
    license: asString(input.license),
    licenseUrl: asString(input.licenseUrl),
    termsOfService: asString(input.termsOfService),
    termsUrl: asString(input.termsUrl),
    accessConstraints: input.accessConstraints && input.accessConstraints.length > 0 ? input.accessConstraints : undefined,
    dataUrl: asString(input.dataUrl),
    homepageUrl: asString(input.homepageUrl),
    tags: input.tags && input.tags.length > 0 ? input.tags : undefined,
    retrievedAt: toIsoDateTimeString()
  };
};

const discoverSocrataDatasets = async (portalUrl: string, query: string, limit: number): Promise<OpenDatasetMetadata[]> => {
  const base = normalizePortalUrl(portalUrl);
  const searchUrl = `${base}/api/search/views?q=${encodeURIComponent(query)}&limit=${limit}`;
  const response = await safeFetchJson(searchUrl);
  if (!response.ok || !response.data) return [];
  const results = Array.isArray(response.data?.results) ? response.data.results : [];
  const datasets: OpenDatasetMetadata[] = [];

  for (const entry of results) {
    const resource = entry?.resource || entry;
    const metadata = entry?.metadata || {};
    const title = asStringFrom(resource?.name, resource?.title, entry?.name, entry?.title);
    const datasetId = asStringFrom(resource?.id, entry?.id);
    const lastUpdated = toIsoDateString(resource?.updatedAt || resource?.updated_at || entry?.updatedAt || entry?.updated_at);
    const source = asStringFrom(resource?.attribution, metadata?.publisher?.name, metadata?.attribution, entry?.attribution);
    const licenseInfo = parseLicenseDetails(resource?.license || metadata?.license || entry?.license);
    const termsInfo = parseTermsDetails(metadata?.termsOfService || entry?.termsOfService || entry?.terms);
    const accessConstraints = collectAccessConstraints(metadata?.accessLevel, metadata?.accessLevelComment, metadata?.accessRights, metadata?.rights);
    const dataUrl = asStringFrom(resource?.link, resource?.dataUrl, entry?.permalink);
    const homepageUrl = asStringFrom(entry?.permalink, entry?.link);
    const tags = Array.isArray(entry?.tags) ? entry.tags.filter((tag: unknown) => typeof tag === "string") : undefined;

    const dataset = normalizeDataset({
      portalType: "socrata",
      portalUrl: base,
      datasetId,
      title,
      description: asStringFrom(resource?.description, entry?.description),
      source: source || getDomain(base),
      lastUpdated,
      license: licenseInfo.license,
      licenseUrl: licenseInfo.licenseUrl,
      termsOfService: termsInfo.termsOfService,
      termsUrl: termsInfo.termsUrl,
      accessConstraints,
      dataUrl,
      homepageUrl,
      tags
    });
    if (dataset) datasets.push(dataset);
  }
  return datasets;
};

const discoverArcGisDatasets = async (portalUrl: string, query: string, limit: number): Promise<OpenDatasetMetadata[]> => {
  const base = normalizePortalUrl(portalUrl);
  const searchUrl = `${base}/sharing/rest/search?f=json&q=${encodeURIComponent(query)}+AND+type%3A%22Feature%20Service%22&num=${limit}`;
  const response = await safeFetchJson(searchUrl);
  if (!response.ok || !response.data) return [];
  const results = Array.isArray(response.data?.results) ? response.data.results : [];
  const datasets: OpenDatasetMetadata[] = [];

  for (const entry of results) {
    const itemId = asString(entry?.id);
    const title = asStringFrom(entry?.title, entry?.name);
    const lastUpdated = toIsoDateString(entry?.modified || entry?.created);
    const source = asStringFrom(entry?.owner, entry?.orgId, entry?.accessInformation);
    const entryLicenseInfo = parseLicenseDetails(entry?.licenseInfo || entry?.license);
    const entryTermsInfo = parseTermsDetails(entry?.termsOfUse || entry?.termsOfService || entry?.terms);
    let accessConstraints = collectAccessConstraints(
      entry?.access,
      entry?.accessInformation,
      entry?.accessLevel,
      entry?.accessLevelComment,
      entry?.accessRights,
      entry?.rights,
      entry?.constraints
    );
    let dataUrl = asString(entry?.url);
    let licenseInfo = { ...entryLicenseInfo };
    let termsInfo = { ...entryTermsInfo };

    if (itemId) {
      const itemUrl = `${base}/sharing/rest/content/items/${itemId}?f=json`;
      const itemResponse = await safeFetchJson(itemUrl);
      if (itemResponse.ok && itemResponse.data) {
        const itemLicenseInfo = parseLicenseDetails(itemResponse.data?.licenseInfo || itemResponse.data?.license);
        licenseInfo = {
          license: licenseInfo.license || itemLicenseInfo.license,
          licenseUrl: licenseInfo.licenseUrl || itemLicenseInfo.licenseUrl
        };
        const itemTermsInfo = parseTermsDetails(itemResponse.data?.termsOfUse || itemResponse.data?.termsOfService || itemResponse.data?.terms);
        termsInfo = {
          termsOfService: termsInfo.termsOfService || itemTermsInfo.termsOfService,
          termsUrl: termsInfo.termsUrl || itemTermsInfo.termsUrl
        };
        accessConstraints = mergeAccessConstraints(
          accessConstraints,
          collectAccessConstraints(
            itemResponse.data?.access,
            itemResponse.data?.accessInformation,
            itemResponse.data?.accessLevel,
            itemResponse.data?.accessLevelComment,
            itemResponse.data?.accessRights,
            itemResponse.data?.rights,
            itemResponse.data?.constraints
          )
        );
        if (!dataUrl) {
          dataUrl = asString(itemResponse.data?.url);
        }
      }
    }

    const dataset = normalizeDataset({
      portalType: "arcgis",
      portalUrl: base,
      datasetId: itemId,
      title,
      description: asStringFrom(entry?.snippet, entry?.description),
      source: source || getDomain(base),
      lastUpdated,
      license: licenseInfo.license,
      licenseUrl: licenseInfo.licenseUrl,
      termsOfService: termsInfo.termsOfService,
      termsUrl: termsInfo.termsUrl,
      accessConstraints,
      dataUrl,
      homepageUrl: itemId ? `${base}/home/item.html?id=${itemId}` : undefined,
      tags: Array.isArray(entry?.tags) ? entry.tags.filter((tag: unknown) => typeof tag === "string") : undefined
    });
    if (dataset) datasets.push(dataset);
  }
  return datasets;
};

const getDcatCatalogUrlCandidates = (portalUrl: string) => {
  const base = normalizePortalUrl(portalUrl);
  if (base.endsWith(".json")) return [base];
  return [`${base}/data.json`, `${base}/catalog.json`];
};

const discoverDcatDatasets = async (portalUrl: string, query: string, limit: number): Promise<OpenDatasetMetadata[]> => {
  const candidates = getDcatCatalogUrlCandidates(portalUrl);
  let catalogData: any = null;
  let catalogUrl = candidates[0];

  for (const candidate of candidates) {
    const response = await safeFetchJson(candidate);
    if (response.ok && response.data) {
      catalogData = response.data;
      catalogUrl = candidate;
      break;
    }
  }

  if (!catalogData) return [];
  const datasets = Array.isArray(catalogData?.dataset) ? catalogData.dataset : (Array.isArray(catalogData?.datasets) ? catalogData.datasets : []);
  if (!Array.isArray(datasets)) return [];

  const normalizedPortal = normalizePortalUrl(portalUrl);
  const lowerQuery = query.toLowerCase();
  const output: OpenDatasetMetadata[] = [];

  for (const entry of datasets) {
    if (!entry || typeof entry !== "object") continue;
    const title = asStringFrom(entry?.title, entry?.name);
    const description = asStringFrom(entry?.description, entry?.notes);
    const keywords = Array.isArray(entry?.keyword) ? entry.keyword : [];
    const tags = Array.isArray(keywords) ? keywords.filter((tag: unknown) => typeof tag === "string") : undefined;
    const haystack = `${title || ""} ${description || ""} ${(tags || []).join(" ")}`.toLowerCase();
    if (lowerQuery && !haystack.includes(lowerQuery)) continue;

    const distribution = Array.isArray(entry?.distribution) ? entry.distribution : [];
    const distributionEntry = distribution.find((item: any) => item?.downloadURL || item?.accessURL) || distribution[0];
    const dataUrl = asStringFrom(distributionEntry?.downloadURL, distributionEntry?.accessURL);
    const licenseInfo = parseLicenseDetails(entry?.license);
    const termsInfo = parseTermsDetails(entry?.termsOfUse || entry?.terms || entry?.rights);
    const accessConstraints = collectAccessConstraints(
      entry?.accessLevel,
      entry?.accessLevelComment,
      entry?.accessRights,
      entry?.rights,
      entry?.constraints
    );

    const dataset = normalizeDataset({
      portalType: "dcat",
      portalUrl: normalizedPortal,
      datasetId: asStringFrom(entry?.identifier, entry?.id),
      title,
      description,
      source: parsePublisher(entry?.publisher) || getDomain(normalizedPortal),
      lastUpdated: toIsoDateString(entry?.modified || entry?.updated || entry?.issued),
      license: licenseInfo.license,
      licenseUrl: licenseInfo.licenseUrl,
      termsOfService: termsInfo.termsOfService,
      termsUrl: termsInfo.termsUrl,
      accessConstraints,
      dataUrl,
      homepageUrl: asStringFrom(entry?.landingPage, entry?.homepage, catalogUrl),
      tags
    });

    if (dataset) output.push(dataset);
    if (output.length >= limit) break;
  }

  return output;
};

export type OpenDataDiscoveryInput = {
  portalUrl: string;
  query: string;
  portalType?: OpenDataPortalType;
  limit?: number;
};

export type OpenDataDiscoveryResult = {
  portalType: OpenDataPortalType;
  datasets: OpenDatasetMetadata[];
  index: OpenDatasetIndex;
};

export const discoverOpenDataDatasets = async (input: OpenDataDiscoveryInput): Promise<OpenDataDiscoveryResult> => {
  const portalUrl = normalizePortalUrl(input.portalUrl);
  const portalType = input.portalType && input.portalType !== "unknown" ? input.portalType : detectPortalType(portalUrl);
  const limit = typeof input.limit === "number" && input.limit > 0 ? Math.floor(input.limit) : DEFAULT_LIMIT;
  let datasets: OpenDatasetMetadata[] = [];

  if (portalType === "socrata") {
    datasets = await discoverSocrataDatasets(portalUrl, input.query, limit);
  } else if (portalType === "arcgis") {
    datasets = await discoverArcGisDatasets(portalUrl, input.query, limit);
  } else if (portalType === "dcat") {
    datasets = await discoverDcatDatasets(portalUrl, input.query, limit);
  }

  const index = upsertOpenDatasets(datasets);
  return { portalType, datasets, index };
};

export const getOpenDatasetIndex = () => loadOpenDatasetIndex();

export const persistOpenDatasetMetadata = (datasets: OpenDatasetMetadata[]) => upsertOpenDatasets(datasets);

const normalizeMatchUrl = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "");
    return `${url.protocol.toLowerCase()}//${host}${path}`;
  } catch (_) {
    return value.trim().toLowerCase().replace(/\/+$/, "");
  }
};

const normalizeMatchDomain = (value: string) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch (_) {
    const trimmed = value.trim().toLowerCase();
    return trimmed.startsWith("www.") ? trimmed.slice(4) : trimmed;
  }
};

const sourceMatchesCandidate = (sourceUrl: string, candidateUrl?: string) => {
  if (!candidateUrl) return false;
  const normalizedSource = normalizeMatchUrl(sourceUrl);
  const normalizedCandidate = normalizeMatchUrl(candidateUrl);
  if (!normalizedSource || !normalizedCandidate) return false;
  return normalizedSource === normalizedCandidate || normalizedSource.startsWith(`${normalizedCandidate}/`);
};

const sourceMatchesDatasetId = (sourceUrl: string, datasetId?: string, portalUrl?: string) => {
  if (!datasetId) return false;
  const needle = datasetId.toLowerCase();
  if (!needle) return false;
  const sourceLower = sourceUrl.toLowerCase();
  if (!sourceLower.includes(needle)) return false;
  if (!portalUrl) return true;
  const sourceDomain = normalizeMatchDomain(sourceUrl);
  const portalDomain = normalizeMatchDomain(portalUrl);
  return sourceDomain === portalDomain;
};

export const buildDatasetComplianceSummary = (
  reportSources: string[],
  index: OpenDatasetIndex = loadOpenDatasetIndex()
): DatasetComplianceEntry[] => {
  if (!Array.isArray(reportSources) || reportSources.length === 0) return [];
  if (!index || !Array.isArray(index.datasets) || index.datasets.length === 0) return [];
  const sources = reportSources.filter((source) => typeof source === "string" && source.trim().length > 0);
  if (sources.length === 0) return [];

  const matched = new Map<string, DatasetComplianceEntry>();
  for (const dataset of index.datasets) {
    if (!dataset || !dataset.title) continue;
    let isMatch = false;
    for (const source of sources) {
      if (sourceMatchesCandidate(source, dataset.dataUrl) || sourceMatchesCandidate(source, dataset.homepageUrl)) {
        isMatch = true;
        break;
      }
      if (sourceMatchesDatasetId(source, dataset.datasetId, dataset.portalUrl)) {
        isMatch = true;
        break;
      }
    }
    if (!isMatch) continue;
    matched.set(dataset.id, {
      datasetId: dataset.datasetId,
      title: dataset.title,
      portalType: dataset.portalType,
      portalUrl: dataset.portalUrl,
      dataUrl: dataset.dataUrl,
      homepageUrl: dataset.homepageUrl,
      source: dataset.source,
      license: dataset.license,
      licenseUrl: dataset.licenseUrl,
      termsOfService: dataset.termsOfService,
      termsUrl: dataset.termsUrl,
      accessConstraints: dataset.accessConstraints,
      retrievedAt: dataset.retrievedAt,
      lastUpdated: dataset.lastUpdated
    });
  }

  return Array.from(matched.values());
};
