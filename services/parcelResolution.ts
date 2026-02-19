import type { GeoPoint, Jurisdiction, ParcelInfo, PropertySubject } from "../types";
import { normalizeAddressVariants } from "./addressNormalization";

export type GeoJsonPosition = [number, number];

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: GeoJsonPosition[][];
};

export type GeoJsonMultiPolygon = {
  type: "MultiPolygon";
  coordinates: GeoJsonPosition[][][];
};

export type GeoJsonGeometry = GeoJsonPolygon | GeoJsonMultiPolygon;

export type ParcelResolutionMethod = "assessor" | "gis";

export type GeocodeInput = {
  address: string;
  addressVariants: string[];
  jurisdiction?: Jurisdiction;
};

export type GeocodeResult = {
  point: GeoPoint;
  normalizedAddress?: string;
  accuracyMeters?: number;
  provider?: string;
  confidence?: number;
};

export type ParcelLookupInput = {
  address: string;
  normalizedAddress: string;
  addressVariants: string[];
  jurisdiction?: Jurisdiction;
  geo?: GeoPoint;
};

export type ParcelCandidate = {
  parcelId?: string;
  accountId?: string;
  situsAddress?: string;
  source: ParcelResolutionMethod;
  geometry?: GeoJsonGeometry;
  matchType?: "exact" | "normalized" | "spatial" | "unknown";
  confidence?: number;
  attributes?: Record<string, unknown>;
};

export type ParcelGeometryFeature = {
  geometry: GeoJsonGeometry;
  parcelId?: string;
  accountId?: string;
  situsAddress?: string;
  attributes?: Record<string, unknown>;
};

export type AssessorLookupProvider = (input: ParcelLookupInput) => Promise<ParcelCandidate[]>;

export type GisParcelProvider = (input: { point: GeoPoint; jurisdiction?: Jurisdiction }) => Promise<ParcelGeometryFeature[]>;

export type ParcelResolutionInput = {
  address: string;
  normalizedAddress?: string;
  jurisdiction?: Jurisdiction;
};

export type ParcelResolutionProviders = {
  geocode?: (input: GeocodeInput) => Promise<GeocodeResult | null>;
  assessorLookup?: AssessorLookupProvider;
  gisParcelLayer?: GisParcelProvider;
};

export type ParcelResolutionResult = {
  subject: PropertySubject;
  parcel?: ParcelInfo;
  geocode?: GeocodeResult;
  assessorCandidates: ParcelCandidate[];
  gisCandidates: ParcelCandidate[];
  resolutionMethod?: ParcelResolutionMethod;
};

const uniqueList = <T>(items: T[]) => Array.from(new Set(items));

const normalizeParcelId = (value?: string) => (value || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

const dedupeParcelCandidates = (candidates: ParcelCandidate[]) => {
  const seen = new Set<string>();
  const deduped: ParcelCandidate[] = [];
  for (const candidate of candidates) {
    const key = normalizeParcelId(candidate.parcelId) || normalizeParcelId(candidate.accountId) || "";
    if (!key || !seen.has(key)) {
      if (key) seen.add(key);
      deduped.push(candidate);
    }
  }
  return deduped;
};

const pointInRing = (point: GeoPoint, ring: GeoJsonPosition[]) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = ((yi > point.lat) !== (yj > point.lat))
      && (point.lon < (xj - xi) * (point.lat - yi) / (yj - yi + Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const pointInPolygon = (point: GeoPoint, polygon: GeoJsonPolygon) => {
  if (polygon.coordinates.length === 0) return false;
  const outer = polygon.coordinates[0];
  if (!pointInRing(point, outer)) return false;
  for (let i = 1; i < polygon.coordinates.length; i += 1) {
    if (pointInRing(point, polygon.coordinates[i])) return false;
  }
  return true;
};

const pointInGeometry = (point: GeoPoint, geometry?: GeoJsonGeometry) => {
  if (!geometry) return false;
  if (geometry.type === "Polygon") return pointInPolygon(point, geometry);
  return geometry.coordinates.some((poly) => pointInPolygon(point, { type: "Polygon", coordinates: poly }));
};

const buildParcelFromCandidate = (candidate?: ParcelCandidate): ParcelInfo | undefined => {
  if (!candidate) return undefined;
  if (!candidate.parcelId && !candidate.accountId && !candidate.situsAddress) return undefined;
  return {
    parcelId: candidate.parcelId,
    accountId: candidate.accountId,
    situsAddress: candidate.situsAddress
  };
};

const selectSingleCandidate = (candidates: ParcelCandidate[]) => {
  if (candidates.length !== 1) return undefined;
  return candidates[0];
};

export const resolveParcelWorkflow = async (
  input: ParcelResolutionInput,
  providers: ParcelResolutionProviders
): Promise<ParcelResolutionResult> => {
  const normalizedAddress = input.normalizedAddress
    || normalizeAddressVariants(input.address)[0]
    || input.address;
  const addressVariants = uniqueList(
    [normalizedAddress, ...normalizeAddressVariants(input.address)]
  ).filter(Boolean);

  const subject: PropertySubject = {
    address: input.address,
    normalizedAddress,
    jurisdiction: input.jurisdiction
  };

  let geocode: GeocodeResult | undefined;
  if (providers.geocode) {
    const resolved = await providers.geocode({
      address: normalizedAddress,
      addressVariants,
      jurisdiction: input.jurisdiction
    });
    if (resolved && resolved.point) {
      geocode = {
        ...resolved,
        point: {
          lat: resolved.point.lat,
          lon: resolved.point.lon,
          accuracyMeters: resolved.accuracyMeters ?? resolved.point.accuracyMeters
        }
      };
      subject.geo = geocode.point;
    }
  }

  let assessorCandidates: ParcelCandidate[] = [];
  if (providers.assessorLookup) {
    assessorCandidates = dedupeParcelCandidates(await providers.assessorLookup({
      address: input.address,
      normalizedAddress,
      addressVariants,
      jurisdiction: input.jurisdiction,
      geo: subject.geo
    }));
  }

  let resolvedCandidate = selectSingleCandidate(assessorCandidates);
  let resolutionMethod: ParcelResolutionMethod | undefined;
  if (resolvedCandidate) {
    resolutionMethod = "assessor";
  }

  let gisCandidates: ParcelCandidate[] = [];
  if (!resolvedCandidate && subject.geo && providers.gisParcelLayer) {
    const features = await providers.gisParcelLayer({
      point: subject.geo,
      jurisdiction: input.jurisdiction
    });
    gisCandidates = dedupeParcelCandidates(features
      .filter(feature => pointInGeometry(subject.geo as GeoPoint, feature.geometry))
      .map(feature => ({
        parcelId: feature.parcelId,
        accountId: feature.accountId,
        situsAddress: feature.situsAddress,
        source: "gis",
        matchType: "spatial",
        geometry: feature.geometry,
        attributes: feature.attributes
      })));
    resolvedCandidate = selectSingleCandidate(gisCandidates);
    if (resolvedCandidate) resolutionMethod = "gis";
  }

  if (resolvedCandidate?.parcelId) subject.parcelId = resolvedCandidate.parcelId;
  if (resolvedCandidate?.accountId) subject.accountId = resolvedCandidate.accountId;

  return {
    subject,
    parcel: buildParcelFromCandidate(resolvedCandidate),
    geocode,
    assessorCandidates,
    gisCandidates,
    resolutionMethod
  };
};

