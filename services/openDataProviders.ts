import type {
  IsoDateString,
  IsoDateTimeString,
  OpenDataPortalType,
  OpenDatasetMetadata,
  OpenDataRuntimeConfig
} from "../types";
import {
  OPEN_DATA_DISCOVERY_MAX_DATASETS,
  OPEN_DATA_DISCOVERY_MAX_ITEM_FETCHES,
  OPEN_DATA_DCAT_MAX_DOWNLOAD_BYTES,
  OPEN_DATA_PROVIDER_MAX_PAGES,
  OPEN_DATA_PROVIDER_MAX_RECORDS
} from "../constants";
import { fetchJsonWithRetry, fetchTextWithRetry, enforceRateLimit } from "./openDataHttp";
import { getOpenDataConfig } from "./openDataConfig";
import { MAX_LOCAL_SPATIAL_JOIN_FEATURES, pointInGeometry } from "./spatialJoin";
import type { GeoJsonGeometry } from "./parcelResolution";

export type OpenDataField = {
  name: string;
  type?: string;
  description?: string;
  isGeometry?: boolean;
};

export type OpenDataDistribution = {
  format?: string;
  accessUrl?: string;
  downloadUrl?: string;
};

export type OpenDataRecord = {
  id?: string;
  attributes: Record<string, unknown>;
  geometry?: GeoJsonGeometry;
};

export type OpenDataProviderError = {
  code: string;
  message: string;
  status?: number;
};

export type OpenDataQueryResult = {
  records: OpenDataRecord[];
  fields?: OpenDataField[];
  total?: number;
  nextOffset?: number;
  errors?: OpenDataProviderError[];
};

export type OpenDataProviderContext = {
  portalUrl: string;
  portalType: OpenDataPortalType;
  config?: OpenDataRuntimeConfig;
};

export type OpenDataQueryInput = {
  datasetId: string;
  searchText?: string;
  point?: { lat: number; lon: number };
  geometry?: GeoJsonGeometry;
  limit?: number;
  offset?: number;
};

export interface OpenDataProvider {
  type: OpenDataPortalType;
  portalUrl: string;
  discoverDatasets: (query: string, limit?: number) => Promise<OpenDatasetMetadata[]>;
  fetchMetadata: (datasetId: string) => Promise<OpenDatasetMetadata | null>;
  listFields: (datasetId: string) => Promise<OpenDataField[]>;
  getDistributions: (datasetId: string) => Promise<OpenDataDistribution[]>;
  queryByText: (input: OpenDataQueryInput) => Promise<OpenDataQueryResult>;
  queryByGeometry: (input: OpenDataQueryInput) => Promise<OpenDataQueryResult>;
}

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

const normalizePoint = (point?: { lat: number; lon: number }) => {
  if (!point) return null;
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lon)) return null;
  if (point.lat < -90 || point.lat > 90) return null;
  if (point.lon < -180 || point.lon > 180) return null;
  return point;
};

const exceedsPageLimit = (offset: number, limit: number) => {
  if (limit <= 0) return true;
  const page = Math.floor(offset / limit);
  return page >= OPEN_DATA_PROVIDER_MAX_PAGES;
};

export const detectPortalType = (portalUrl: string): OpenDataPortalType => {
  const normalized = portalUrl.toLowerCase();
  if (normalized.includes("arcgis") || normalized.includes("opendata.arcgis")) return "arcgis";
  if (normalized.includes("socrata") || normalized.includes("data.") || normalized.includes("opendata")) return "socrata";
  if (normalized.includes("data.json") || normalized.includes("catalog.json")) return "dcat";
  return "unknown";
};

export const probePortalType = async (portalUrl: string): Promise<OpenDataPortalType> => {
  const base = normalizePortalUrl(portalUrl);
  const socrataUrl = `${base}/api/search/views?q=parcel&limit=1`;
  const socrataProbe = await fetchJsonWithRetry<any>(socrataUrl, { retries: 0 }, { portalType: "unknown", portalUrl: base });
  if (socrataProbe.ok && socrataProbe.data && Array.isArray(socrataProbe.data?.results)) {
    return "socrata";
  }

  const arcgisUrl = `${base}/sharing/rest/search?f=json&q=type%3A%22Feature%20Service%22&num=1`;
  const arcgisProbe = await fetchJsonWithRetry<any>(arcgisUrl, { retries: 0 }, { portalType: "unknown", portalUrl: base });
  if (arcgisProbe.ok && arcgisProbe.data && Array.isArray(arcgisProbe.data?.results)) {
    return "arcgis";
  }

  const dcatUrl = `${base}/data.json`;
  const dcatProbe = await fetchJsonWithRetry<any>(dcatUrl, { retries: 0 }, { portalType: "unknown", portalUrl: base });
  if (dcatProbe.ok && dcatProbe.data && (Array.isArray(dcatProbe.data?.dataset) || Array.isArray(dcatProbe.data?.datasets))) {
    return "dcat";
  }
  return "unknown";
};

const buildSocrataHeaders = (config: OpenDataRuntimeConfig) => {
  const headers: Record<string, string> = {};
  if (config.auth.socrataAppToken) {
    headers["X-App-Token"] = config.auth.socrataAppToken;
  }
  return headers;
};

const parseSocrataGeometry = (value: any): GeoJsonGeometry | undefined => {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray((value as any).coordinates) && (value as any).type) {
    const coords = (value as any).coordinates;
    if ((value as any).type === "Point" && coords.length >= 2) {
      const lon = Number(coords[0]);
      const lat = Number(coords[1]);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        return { type: "Polygon", coordinates: [[[lon, lat], [lon, lat], [lon, lat], [lon, lat], [lon, lat]]] };
      }
    }
    return value as GeoJsonGeometry;
  }
  if (typeof value.latitude === "string" || typeof value.latitude === "number") {
    const lat = Number(value.latitude);
    const lon = Number(value.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { type: "Polygon", coordinates: [[[lon, lat], [lon, lat], [lon, lat], [lon, lat], [lon, lat]]] };
    }
  }
  return undefined;
};

const wktFromPolygon = (geometry: GeoJsonGeometry) => {
  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates[0] || [];
    return `POLYGON((${ring.map((coord) => `${coord[0]} ${coord[1]}`).join(", ")}))`;
  }
  const parts = geometry.coordinates.map((poly) => {
    const ring = poly[0] || [];
    return `((${ring.map((coord) => `${coord[0]} ${coord[1]}`).join(", ")}))`;
  });
  return `MULTIPOLYGON(${parts.join(", ")})`;
};

const buildSocrataProvider = (context: OpenDataProviderContext): OpenDataProvider => {
  const portalUrl = normalizePortalUrl(context.portalUrl);
  const config = context.config || getOpenDataConfig();
  const headers = buildSocrataHeaders(config);
  const socrataRateLimitMs = config.auth.socrataAppToken ? 100 : 500;

  const discoverDatasets = async (query: string, limit = OPEN_DATA_DISCOVERY_MAX_DATASETS) => {
    const searchUrl = `${portalUrl}/api/search/views?q=${encodeURIComponent(query)}&limit=${limit}`;
    await enforceRateLimit(`socrata:${portalUrl}`, socrataRateLimitMs);
    const response = await fetchJsonWithRetry<any>(searchUrl, { headers }, { portalType: "socrata", portalUrl });
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
        portalUrl,
        datasetId,
        title,
        description: asStringFrom(resource?.description, entry?.description),
        source: source || portalUrl,
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

  const fetchMetadata = async (datasetId: string) => {
    if (!datasetId) return null;
    const metaUrl = `${portalUrl}/api/views/${datasetId}.json`;
    await enforceRateLimit(`socrata:${portalUrl}`, socrataRateLimitMs);
    const response = await fetchJsonWithRetry<any>(metaUrl, { headers }, { portalType: "socrata", portalUrl });
    if (!response.ok || !response.data) return null;
    const data = response.data;
    const licenseInfo = parseLicenseDetails(data?.license);
    const termsInfo = parseTermsDetails(data?.termsOfService || data?.terms);
    const dataset = normalizeDataset({
      portalType: "socrata",
      portalUrl,
      datasetId,
      title: asStringFrom(data?.name, data?.title),
      description: asStringFrom(data?.description),
      source: asStringFrom(data?.attribution, data?.publisher?.name),
      lastUpdated: toIsoDateString(data?.updatedAt || data?.updated_at),
      license: licenseInfo.license,
      licenseUrl: licenseInfo.licenseUrl,
      termsOfService: termsInfo.termsOfService,
      termsUrl: termsInfo.termsUrl,
      accessConstraints: collectAccessConstraints(data?.accessLevel, data?.accessLevelComment, data?.accessRights, data?.rights),
      dataUrl: asStringFrom(data?.dataUrl, data?.link),
      homepageUrl: asStringFrom(data?.permalink, data?.link),
      tags: Array.isArray(data?.tags) ? data.tags.filter((tag: unknown) => typeof tag === "string") : undefined
    });
    return dataset;
  };

  const listFields = async (datasetId: string): Promise<OpenDataField[]> => {
    const metadata = await fetchMetadata(datasetId);
    if (!metadata) return [];
    const metaUrl = `${portalUrl}/api/views/${datasetId}.json`;
    await enforceRateLimit(`socrata:${portalUrl}`, socrataRateLimitMs);
    const response = await fetchJsonWithRetry<any>(metaUrl, { headers }, { portalType: "socrata", portalUrl });
    if (!response.ok || !response.data) return [];
    const columns = Array.isArray(response.data?.columns) ? response.data.columns : [];
    return columns.map((col: any) => ({
      name: asString(col?.fieldName || col?.name) || "",
      type: asString(col?.dataTypeName || col?.dataType) || undefined,
      description: asString(col?.description) || undefined,
      isGeometry: col?.dataTypeName === "location" || col?.dataTypeName === "point"
    })).filter((field: OpenDataField) => field.name);
  };

  const getDistributions = async (datasetId: string): Promise<OpenDataDistribution[]> => {
    const metadata = await fetchMetadata(datasetId);
    if (!metadata) return [];
    return [{
      format: "json",
      accessUrl: metadata.dataUrl,
      downloadUrl: metadata.dataUrl
    }];
  };

  const queryByText = async (input: OpenDataQueryInput): Promise<OpenDataQueryResult> => {
    const limit = Math.max(1, Math.min(input.limit ?? 50, OPEN_DATA_PROVIDER_MAX_RECORDS));
    const offset = Math.max(0, input.offset ?? 0);
    if (exceedsPageLimit(offset, limit)) {
      return { records: [], errors: [{ code: "page_limit", message: "Pagination limit reached." }] };
    }
    const params = new URLSearchParams({
      "$limit": String(limit),
      "$offset": String(offset)
    });
    if (input.searchText) params.set("$q", input.searchText);
    const url = `${portalUrl}/resource/${input.datasetId}.json?${params.toString()}`;
    await enforceRateLimit(`socrata:${portalUrl}`, socrataRateLimitMs);
    const response = await fetchJsonWithRetry<any[]>(url, { headers }, { portalType: "socrata", portalUrl });
    if (!response.ok || !Array.isArray(response.data)) {
      return { records: [], errors: [{ code: "query_failed", message: response.error || "query failed", status: response.status }] };
    }
    const records = response.data.map((row: any) => ({
      id: asString(row?.id || row?.sid),
      attributes: row,
      geometry: parseSocrataGeometry(row?.location || row?.geom || row?.the_geom)
    }));
    return {
      records,
      nextOffset: records.length === limit ? offset + limit : undefined
    };
  };

  const queryByGeometry = async (input: OpenDataQueryInput): Promise<OpenDataQueryResult> => {
    const limit = Math.max(1, Math.min(input.limit ?? 50, OPEN_DATA_PROVIDER_MAX_RECORDS));
    const offset = Math.max(0, input.offset ?? 0);
    if (exceedsPageLimit(offset, limit)) {
      return { records: [], errors: [{ code: "page_limit", message: "Pagination limit reached." }] };
    }
    const fields = await listFields(input.datasetId);
    const geometryField = fields.find((field) => field.isGeometry)?.name;
    if (!geometryField) {
      return { records: [], errors: [{ code: "no_geometry", message: "No geometry field detected." }] };
    }
    const params = new URLSearchParams({
      "$limit": String(limit),
      "$offset": String(offset)
    });
    const point = normalizePoint(input.point);
    if (input.point && !point) {
      return { records: [], errors: [{ code: "invalid_crs", message: "Invalid point geometry (expect EPSG:4326)." }] };
    }
    if (point) {
      params.set("$where", `within_circle(${geometryField}, ${point.lat}, ${point.lon}, 25)`);
    } else if (input.geometry) {
      const wkt = wktFromPolygon(input.geometry);
      params.set("$where", `within_polygon(${geometryField}, '${wkt}')`);
    }
    const url = `${portalUrl}/resource/${input.datasetId}.json?${params.toString()}`;
    await enforceRateLimit(`socrata:${portalUrl}`, socrataRateLimitMs);
    const response = await fetchJsonWithRetry<any[]>(url, { headers }, { portalType: "socrata", portalUrl });
    if (!response.ok || !Array.isArray(response.data)) {
      return { records: [], errors: [{ code: "query_failed", message: response.error || "query failed", status: response.status }] };
    }
    const records = response.data.map((row: any) => ({
      id: asString(row?.id || row?.sid),
      attributes: row,
      geometry: parseSocrataGeometry(row?.location || row?.geom || row?.the_geom)
    }));
    return {
      records,
      nextOffset: records.length === limit ? offset + limit : undefined
    };
  };

  return {
    type: "socrata",
    portalUrl,
    discoverDatasets,
    fetchMetadata,
    listFields,
    getDistributions,
    queryByText,
    queryByGeometry
  };
};

type ArcGisLayerInfo = {
  id: number;
  name?: string;
  url: string;
  geometryType?: string;
};

const buildArcGisProvider = (context: OpenDataProviderContext): OpenDataProvider => {
  const portalUrl = normalizePortalUrl(context.portalUrl);
  const config = context.config || getOpenDataConfig();
  const arcgisRateLimitMs = config.auth.arcgisApiKey ? 100 : 400;

  const withToken = (url: string) => {
    if (!config.auth.arcgisApiKey) return url;
    const joiner = url.includes("?") ? "&" : "?";
    return `${url}${joiner}token=${encodeURIComponent(config.auth.arcgisApiKey)}`;
  };

  const discoverDatasets = async (query: string, limit = OPEN_DATA_DISCOVERY_MAX_DATASETS) => {
    const searchUrl = `${portalUrl}/sharing/rest/search?f=json&q=${encodeURIComponent(query)}+AND+type%3A%22Feature%20Service%22&num=${limit}`;
    await enforceRateLimit(`arcgis:${portalUrl}`, arcgisRateLimitMs);
    const response = await fetchJsonWithRetry<any>(withToken(searchUrl), {}, { portalType: "arcgis", portalUrl });
    if (!response.ok || !response.data) return [];
    const results = Array.isArray(response.data?.results) ? response.data.results : [];
    const datasets: OpenDatasetMetadata[] = [];
    let itemFetches = 0;

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

      if (itemId && itemFetches < OPEN_DATA_DISCOVERY_MAX_ITEM_FETCHES) {
        itemFetches += 1;
        const itemUrl = `${portalUrl}/sharing/rest/content/items/${itemId}?f=json`;
        const itemResponse = await fetchJsonWithRetry<any>(withToken(itemUrl), {}, { portalType: "arcgis", portalUrl });
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
          accessConstraints = Array.from(new Set([
            ...accessConstraints,
            ...collectAccessConstraints(
              itemResponse.data?.access,
              itemResponse.data?.accessInformation,
              itemResponse.data?.accessLevel,
              itemResponse.data?.accessLevelComment,
              itemResponse.data?.accessRights,
              itemResponse.data?.rights,
              itemResponse.data?.constraints
            )
          ]));
          if (!dataUrl) {
            dataUrl = asString(itemResponse.data?.url);
          }
        }
      }

      const dataset = normalizeDataset({
        portalType: "arcgis",
        portalUrl,
        datasetId: itemId,
        title,
        description: asStringFrom(entry?.snippet, entry?.description),
        source: source || portalUrl,
        lastUpdated,
        license: licenseInfo.license,
        licenseUrl: licenseInfo.licenseUrl,
        termsOfService: termsInfo.termsOfService,
        termsUrl: termsInfo.termsUrl,
        accessConstraints,
        dataUrl,
        homepageUrl: itemId ? `${portalUrl}/home/item.html?id=${itemId}` : undefined,
        tags: Array.isArray(entry?.tags) ? entry.tags.filter((tag: unknown) => typeof tag === "string") : undefined
      });
      if (dataset) datasets.push(dataset);
    }
    return datasets;
  };

  const fetchMetadata = async (datasetId: string) => {
    if (!datasetId) return null;
    const itemUrl = `${portalUrl}/sharing/rest/content/items/${datasetId}?f=json`;
    await enforceRateLimit(`arcgis:${portalUrl}`, arcgisRateLimitMs);
    const response = await fetchJsonWithRetry<any>(withToken(itemUrl), {}, { portalType: "arcgis", portalUrl });
    if (!response.ok || !response.data) return null;
    const licenseInfo = parseLicenseDetails(response.data?.licenseInfo || response.data?.license);
    const termsInfo = parseTermsDetails(response.data?.termsOfUse || response.data?.termsOfService || response.data?.terms);
    return normalizeDataset({
      portalType: "arcgis",
      portalUrl,
      datasetId,
      title: asStringFrom(response.data?.title),
      description: asStringFrom(response.data?.description, response.data?.snippet),
      source: asStringFrom(response.data?.owner, response.data?.orgId, response.data?.accessInformation),
      lastUpdated: toIsoDateString(response.data?.modified || response.data?.created),
      license: licenseInfo.license,
      licenseUrl: licenseInfo.licenseUrl,
      termsOfService: termsInfo.termsOfService,
      termsUrl: termsInfo.termsUrl,
      accessConstraints: collectAccessConstraints(response.data?.access, response.data?.accessInformation, response.data?.accessRights),
      dataUrl: asStringFrom(response.data?.url),
      homepageUrl: datasetId ? `${portalUrl}/home/item.html?id=${datasetId}` : undefined,
      tags: Array.isArray(response.data?.tags) ? response.data.tags.filter((tag: unknown) => typeof tag === "string") : undefined
    });
  };

  const fetchLayers = async (datasetId: string): Promise<ArcGisLayerInfo[]> => {
    const meta = await fetchMetadata(datasetId);
    const baseUrl = meta?.dataUrl;
    if (!baseUrl) return [];
    const layerUrl = `${baseUrl}?f=json`;
    await enforceRateLimit(`arcgis:${portalUrl}`, arcgisRateLimitMs);
    const response = await fetchJsonWithRetry<any>(withToken(layerUrl), {}, { portalType: "arcgis", portalUrl });
    if (!response.ok || !response.data) return [];
    const layers = Array.isArray(response.data?.layers) ? response.data.layers : [];
    return layers.map((layer: any) => ({
      id: Number(layer?.id),
      name: asString(layer?.name),
      url: `${baseUrl}/${layer?.id}`,
      geometryType: asString(layer?.geometryType)
    })).filter((layer: ArcGisLayerInfo) => Number.isFinite(layer.id));
  };

  const listFields = async (datasetId: string): Promise<OpenDataField[]> => {
    const layers = await fetchLayers(datasetId);
    if (layers.length === 0) return [];
    const layer = layers[0];
    const url = `${layer.url}?f=json`;
    await enforceRateLimit(`arcgis:${portalUrl}`, arcgisRateLimitMs);
    const response = await fetchJsonWithRetry<any>(withToken(url), {}, { portalType: "arcgis", portalUrl });
    if (!response.ok || !response.data) return [];
    const fields = Array.isArray(response.data?.fields) ? response.data.fields : [];
    return fields.map((field: any) => ({
      name: asString(field?.name) || "",
      type: asString(field?.type) || undefined,
      description: asString(field?.alias) || undefined,
      isGeometry: field?.type?.includes("Geometry")
    })).filter((field: OpenDataField) => field.name);
  };

  const getDistributions = async (datasetId: string): Promise<OpenDataDistribution[]> => {
    const meta = await fetchMetadata(datasetId);
    if (!meta?.dataUrl) return [];
    return [{ format: "Feature Service", accessUrl: meta.dataUrl }];
  };

  const parseArcGisGeometry = (geom: any): GeoJsonGeometry | undefined => {
    if (!geom || typeof geom !== "object") return undefined;
    if (Array.isArray(geom.rings)) {
      return { type: "Polygon", coordinates: geom.rings };
    }
    if (typeof geom.x === "number" && typeof geom.y === "number") {
      const lon = geom.x;
      const lat = geom.y;
      return { type: "Polygon", coordinates: [[[lon, lat], [lon, lat], [lon, lat], [lon, lat], [lon, lat]]] };
    }
    return undefined;
  };

  const queryLayer = async (
    layerUrl: string,
    params: Record<string, string>
  ): Promise<OpenDataQueryResult> => {
    const query = new URLSearchParams({ f: "json", ...params });
    const url = `${layerUrl}/query?${query.toString()}`;
    await enforceRateLimit(`arcgis:${portalUrl}`, arcgisRateLimitMs);
    const response = await fetchJsonWithRetry<any>(withToken(url), {}, { portalType: "arcgis", portalUrl });
    if (!response.ok || !response.data) {
      return { records: [], errors: [{ code: "query_failed", message: response.error || "query failed", status: response.status }] };
    }
    const features = Array.isArray(response.data?.features) ? response.data.features : [];
    const records = features.map((feature: any) => ({
      id: asString(feature?.attributes?.OBJECTID),
      attributes: feature?.attributes || {},
      geometry: parseArcGisGeometry(feature?.geometry)
    }));
    const total = typeof response.data?.exceededTransferLimit === "boolean" && response.data.exceededTransferLimit
      ? undefined
      : Array.isArray(features)
        ? features.length
        : undefined;
    return { records, total };
  };

  const queryByText = async (input: OpenDataQueryInput): Promise<OpenDataQueryResult> => {
    const layers = await fetchLayers(input.datasetId);
    if (layers.length === 0) return { records: [], errors: [{ code: "no_layers", message: "No layers found." }] };
    const layer = layers[0];
    const fields = await listFields(input.datasetId);
    const addressField = fields.find((field) => /address|situs|site|location/i.test(field.name));
    const limit = Math.max(1, Math.min(input.limit ?? 50, OPEN_DATA_PROVIDER_MAX_RECORDS));
    const offset = Math.max(0, input.offset ?? 0);
    if (exceedsPageLimit(offset, limit)) {
      return { records: [], errors: [{ code: "page_limit", message: "Pagination limit reached." }] };
    }
    const where = addressField && input.searchText
      ? `UPPER(${addressField.name}) LIKE '%${input.searchText.toUpperCase().replace(/'/g, "''")}%'`
      : "1=1";
    return queryLayer(layer.url, {
      where,
      outFields: "*",
      resultOffset: String(offset),
      resultRecordCount: String(limit),
      outSR: "4326"
    });
  };

  const queryByGeometry = async (input: OpenDataQueryInput): Promise<OpenDataQueryResult> => {
    const layers = await fetchLayers(input.datasetId);
    if (layers.length === 0) return { records: [], errors: [{ code: "no_layers", message: "No layers found." }] };
    const layer = layers[0];
    const limit = Math.max(1, Math.min(input.limit ?? 50, OPEN_DATA_PROVIDER_MAX_RECORDS));
    const offset = Math.max(0, input.offset ?? 0);
    if (exceedsPageLimit(offset, limit)) {
      return { records: [], errors: [{ code: "page_limit", message: "Pagination limit reached." }] };
    }
    if (!input.point && !input.geometry) {
      return { records: [], errors: [{ code: "missing_geometry", message: "No geometry supplied." }] };
    }
    const point = normalizePoint(input.point);
    if (input.point && !point) {
      return { records: [], errors: [{ code: "invalid_crs", message: "Invalid point geometry (expect EPSG:4326)." }] };
    }
    const geometry = point
      ? JSON.stringify({ x: point.lon, y: point.lat, spatialReference: { wkid: 4326 } })
      : JSON.stringify(input.geometry);
    const geometryType = input.point ? "esriGeometryPoint" : "esriGeometryPolygon";
    return queryLayer(layer.url, {
      where: "1=1",
      geometry,
      geometryType,
      spatialRel: "esriSpatialRelIntersects",
      outFields: "*",
      resultOffset: String(offset),
      resultRecordCount: String(limit),
      outSR: "4326"
    });
  };

  return {
    type: "arcgis",
    portalUrl,
    discoverDatasets,
    fetchMetadata,
    listFields,
    getDistributions,
    queryByText,
    queryByGeometry
  };
};

const getDcatCatalogUrlCandidates = (portalUrl: string) => {
  const base = normalizePortalUrl(portalUrl);
  if (base.endsWith(".json")) return [base];
  return [`${base}/data.json`, `${base}/catalog.json`];
};

const parseJsonMaybe = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
};

const parseCsv = (text: string) => {
  const rows = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (rows.length === 0) return [];
  const headers = rows[0].split(",").map((header) => header.replace(/^"|"$/g, "").trim());
  const records: Record<string, string>[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const values = row.split(",").map((value) => value.replace(/^"|"$/g, "").trim());
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] ?? "";
    });
    records.push(record);
  }
  return records;
};

const inferPointGeometry = (attributes: Record<string, unknown>): GeoJsonGeometry | undefined => {
  const latKey = Object.keys(attributes).find((key) => /lat/i.test(key));
  const lonKey = Object.keys(attributes).find((key) => /(lon|lng|long)/i.test(key));
  if (!latKey || !lonKey) return undefined;
  const lat = Number(attributes[latKey]);
  const lon = Number(attributes[lonKey]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;
  return { type: "Polygon", coordinates: [[[lon, lat], [lon, lat], [lon, lat], [lon, lat], [lon, lat]]] };
};

const buildDcatProvider = (context: OpenDataProviderContext): OpenDataProvider => {
  const portalUrl = normalizePortalUrl(context.portalUrl);

  const loadCatalog = async () => {
    const candidates = getDcatCatalogUrlCandidates(portalUrl);
    for (const candidate of candidates) {
      await enforceRateLimit(`dcat:${portalUrl}`, 200);
      const response = await fetchJsonWithRetry<any>(candidate, {}, { portalType: "dcat", portalUrl });
      if (response.ok && response.data) {
        return response.data;
      }
    }
    return null;
  };

  const discoverDatasets = async (query: string, limit = OPEN_DATA_DISCOVERY_MAX_DATASETS) => {
    const catalog = await loadCatalog();
    if (!catalog) return [];
    const datasets = Array.isArray(catalog?.dataset) ? catalog.dataset : (Array.isArray(catalog?.datasets) ? catalog.datasets : []);
    if (!Array.isArray(datasets)) return [];
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
        portalUrl,
        datasetId: asStringFrom(entry?.identifier, entry?.id),
        title,
        description,
        source: parsePublisher(entry?.publisher) || portalUrl,
        lastUpdated: toIsoDateString(entry?.modified || entry?.updated || entry?.issued),
        license: licenseInfo.license,
        licenseUrl: licenseInfo.licenseUrl,
        termsOfService: termsInfo.termsOfService,
        termsUrl: termsInfo.termsUrl,
        accessConstraints,
        dataUrl,
        homepageUrl: asStringFrom(entry?.landingPage, entry?.homepage, portalUrl),
        tags
      });
      if (dataset) output.push(dataset);
      if (output.length >= limit) break;
    }

    return output;
  };

  const fetchMetadata = async (datasetId: string) => {
    const catalog = await loadCatalog();
    if (!catalog) return null;
    const datasets = Array.isArray(catalog?.dataset) ? catalog.dataset : (Array.isArray(catalog?.datasets) ? catalog.datasets : []);
    if (!Array.isArray(datasets)) return null;
    const entry = datasets.find((item: any) => asStringFrom(item?.identifier, item?.id) === datasetId);
    if (!entry) return null;
    const licenseInfo = parseLicenseDetails(entry?.license);
    const termsInfo = parseTermsDetails(entry?.termsOfUse || entry?.terms || entry?.rights);
    return normalizeDataset({
      portalType: "dcat",
      portalUrl,
      datasetId,
      title: asStringFrom(entry?.title, entry?.name),
      description: asStringFrom(entry?.description, entry?.notes),
      source: parsePublisher(entry?.publisher) || portalUrl,
      lastUpdated: toIsoDateString(entry?.modified || entry?.updated || entry?.issued),
      license: licenseInfo.license,
      licenseUrl: licenseInfo.licenseUrl,
      termsOfService: termsInfo.termsOfService,
      termsUrl: termsInfo.termsUrl,
      accessConstraints: collectAccessConstraints(entry?.accessRights, entry?.rights, entry?.constraints),
      dataUrl: asStringFrom(entry?.distribution?.[0]?.downloadURL, entry?.distribution?.[0]?.accessURL),
      homepageUrl: asStringFrom(entry?.landingPage, entry?.homepage, portalUrl)
    });
  };

  const getDistributions = async (datasetId: string): Promise<OpenDataDistribution[]> => {
    const meta = await fetchMetadata(datasetId);
    if (!meta) return [];
    return [{ format: "json", accessUrl: meta.dataUrl, downloadUrl: meta.dataUrl }];
  };

  const loadDistribution = async (datasetId: string) => {
    const meta = await fetchMetadata(datasetId);
    if (!meta?.dataUrl) return null;
    await enforceRateLimit(`dcat:${portalUrl}`, 200);
    const response = await fetchTextWithRetry(meta.dataUrl, {}, { portalType: "dcat", portalUrl });
    if (!response.ok || !response.data) return null;
    const sizeHeader = response.headers.get("content-length");
    if (sizeHeader) {
      const bytes = Number(sizeHeader);
      if (Number.isFinite(bytes) && bytes > OPEN_DATA_DCAT_MAX_DOWNLOAD_BYTES) {
        return { error: "download_too_large" } as const;
      }
    }
    const json = parseJsonMaybe(response.data);
    if (json) return { data: json, meta } as const;
    if (response.data.includes(",")) {
      return { data: parseCsv(response.data), meta } as const;
    }
    return null;
  };

  const listFields = async (datasetId: string): Promise<OpenDataField[]> => {
    const distribution = await loadDistribution(datasetId);
    if (!distribution || "error" in distribution) return [];
    const data = distribution.data;
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
      return Object.keys(data[0]).map((key) => ({ name: key }));
    }
    if (data?.type === "FeatureCollection" && Array.isArray(data.features) && data.features.length > 0) {
      return Object.keys(data.features[0].properties || {}).map((key) => ({ name: key }));
    }
    return [];
  };

  const normalizeDcatRecords = (data: any): OpenDataRecord[] => {
    if (!data) return [];
    if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
      return data.features.map((feature: any) => ({
        id: asString(feature?.id),
        attributes: feature?.properties || {},
        geometry: feature?.geometry
      }));
    }
    if (Array.isArray(data)) {
      return data.map((row: any) => ({
        attributes: row,
        geometry: row?.geometry || inferPointGeometry(row)
      }));
    }
    return [];
  };

  const queryByText = async (input: OpenDataQueryInput): Promise<OpenDataQueryResult> => {
    const distribution = await loadDistribution(input.datasetId);
    if (!distribution) return { records: [], errors: [{ code: "no_distribution", message: "No distribution found." }] };
    if ("error" in distribution) return { records: [], errors: [{ code: distribution.error, message: "Dataset too large." }] };
    const limit = Math.max(1, Math.min(input.limit ?? OPEN_DATA_PROVIDER_MAX_RECORDS, OPEN_DATA_PROVIDER_MAX_RECORDS));
    const offset = Math.max(0, input.offset ?? 0);
    if (exceedsPageLimit(offset, limit)) {
      return { records: [], errors: [{ code: "page_limit", message: "Pagination limit reached." }] };
    }
    const records = normalizeDcatRecords(distribution.data);
    const text = (input.searchText || "").toLowerCase();
    if (!text) return { records };
    const filtered = records.filter((record) => {
      const values = Object.values(record.attributes || {}).join(" ").toLowerCase();
      return values.includes(text);
    });
    return { records: filtered.slice(offset, offset + limit) };
  };

  const queryByGeometry = async (input: OpenDataQueryInput): Promise<OpenDataQueryResult> => {
    const distribution = await loadDistribution(input.datasetId);
    if (!distribution) return { records: [], errors: [{ code: "no_distribution", message: "No distribution found." }] };
    if ("error" in distribution) return { records: [], errors: [{ code: distribution.error, message: "Dataset too large." }] };
    const limit = Math.max(1, Math.min(input.limit ?? OPEN_DATA_PROVIDER_MAX_RECORDS, OPEN_DATA_PROVIDER_MAX_RECORDS));
    const offset = Math.max(0, input.offset ?? 0);
    if (exceedsPageLimit(offset, limit)) {
      return { records: [], errors: [{ code: "page_limit", message: "Pagination limit reached." }] };
    }
    const records = normalizeDcatRecords(distribution.data);
    const point = normalizePoint(input.point);
    if (input.point && !point) {
      return { records: [], errors: [{ code: "invalid_crs", message: "Invalid point geometry (expect EPSG:4326)." }] };
    }
    if (!point) return { records: [], errors: [{ code: "missing_geometry", message: "No geometry supplied." }] };
    if (records.length > MAX_LOCAL_SPATIAL_JOIN_FEATURES) {
      return { records: [], errors: [{ code: "too_many_features", message: "Local spatial join skipped for large dataset." }] };
    }
    const filtered = records.filter((record) => pointInGeometry(point, record.geometry));
    return { records: filtered.slice(offset, offset + limit) };
  };

  return {
    type: "dcat",
    portalUrl,
    discoverDatasets,
    fetchMetadata,
    listFields,
    getDistributions,
    queryByText,
    queryByGeometry
  };
};

export const createOpenDataProvider = (context: OpenDataProviderContext): OpenDataProvider => {
  const portalType = context.portalType === "unknown" ? detectPortalType(context.portalUrl) : context.portalType;
  if (portalType === "socrata") return buildSocrataProvider({ ...context, portalType });
  if (portalType === "arcgis") return buildArcGisProvider({ ...context, portalType });
  if (portalType === "dcat") return buildDcatProvider({ ...context, portalType });
  return buildDcatProvider({ ...context, portalType: "dcat" });
};
