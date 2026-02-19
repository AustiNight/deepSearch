import type { DataGap, GeoPoint, Jurisdiction, ParcelInfo, PropertySubject, SourcePointer } from "../types";
import { normalizeAddressVariants } from "./addressNormalization";
import { DATA_SOURCE_CONTRACTS } from "../data/dataSourceContracts";

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
  dataGaps: DataGap[];
};

const uniqueList = <T>(items: T[]) => Array.from(new Set(items));

const normalizeParcelId = (value?: string) => (value || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

const normalizeAddressKey = (value?: string) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const normalizeJurisdictionToken = (value?: string) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const fillTemplate = (template: string, jurisdiction?: Jurisdiction) => {
  let result = template;
  if (jurisdiction?.county) {
    result = result.replace(/\{county\}/g, normalizeJurisdictionToken(jurisdiction.county));
  }
  if (jurisdiction?.state) {
    result = result.replace(/\{state\}/g, normalizeJurisdictionToken(jurisdiction.state));
  }
  if (jurisdiction?.city) {
    result = result.replace(/\{city\}/g, normalizeJurisdictionToken(jurisdiction.city));
  }
  return result;
};

const expectedSourcesForRecord = (recordType: string, jurisdiction?: Jurisdiction): SourcePointer[] => {
  const contract = DATA_SOURCE_CONTRACTS.find(entry => entry.recordType === recordType);
  if (!contract) return [];
  return contract.endpoints.map(endpoint => ({
    label: endpoint.label,
    portalUrl: endpoint.portalUrlTemplate ? fillTemplate(endpoint.portalUrlTemplate, jurisdiction) : undefined,
    endpoint: endpoint.endpointTemplate ? fillTemplate(endpoint.endpointTemplate, jurisdiction) : undefined
  }));
};

const isoDateToday = () => new Date().toISOString().slice(0, 10);

const createGapId = () => `gap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

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

const inferMatchType = (candidate: ParcelCandidate, addressVariants: string[]) => {
  if (candidate.matchType) return candidate.matchType;
  if (!candidate.situsAddress) return "unknown";
  const normalizedVariants = addressVariants.map(variant => variant.trim().toLowerCase());
  const normalizedKeys = addressVariants.map(variant => normalizeAddressKey(variant));
  const candidateValue = candidate.situsAddress.trim().toLowerCase();
  if (normalizedVariants.includes(candidateValue)) return "exact";
  if (normalizedKeys.includes(normalizeAddressKey(candidate.situsAddress))) return "normalized";
  return "unknown";
};

const scoreCandidate = (candidate: ParcelCandidate, addressVariants: string[]) => {
  const matchType = inferMatchType(candidate, addressVariants);
  const matchScore = matchType === "exact"
    ? 60
    : matchType === "normalized"
      ? 40
      : matchType === "spatial"
        ? 20
        : 0;
  const idScore = candidate.parcelId ? 25 : candidate.accountId ? 15 : 0;
  const confidenceScore = typeof candidate.confidence === "number"
    ? Math.round(candidate.confidence * 10)
    : 0;
  return matchScore + idScore + confidenceScore;
};

const selectCandidateWithTieBreak = (
  candidates: ParcelCandidate[],
  addressVariants: string[]
) => {
  if (candidates.length === 0) return { selected: undefined, topMatches: [] };
  if (candidates.length === 1) return { selected: candidates[0], topMatches: candidates };
  const scored = candidates.map(candidate => ({
    candidate,
    score: scoreCandidate(candidate, addressVariants)
  })).sort((a, b) => b.score - a.score);
  const topScore = scored[0].score;
  const topMatches = scored.filter(entry => entry.score === topScore).map(entry => entry.candidate);
  if (topMatches.length === 1) {
    return { selected: topMatches[0], topMatches };
  }
  return { selected: undefined, topMatches };
};

const candidateKey = (candidate: ParcelCandidate) => {
  const parcelId = normalizeParcelId(candidate.parcelId);
  const accountId = normalizeParcelId(candidate.accountId);
  if (parcelId) return `parcel:${parcelId}`;
  if (accountId) return `account:${accountId}`;
  if (candidate.situsAddress) return `situs:${candidate.situsAddress}`;
  return "unknown";
};

const buildAmbiguousGap = (
  description: string,
  reason: string,
  candidates: ParcelCandidate[],
  jurisdiction?: Jurisdiction
): DataGap => ({
  id: createGapId(),
  fieldPath: "/subject/parcelId",
  recordType: "assessor_parcel",
  description,
  reason: `${reason} Candidates: ${candidates.map(candidateKey).join(", ") || "none"}.`,
  expectedSources: expectedSourcesForRecord("assessor_parcel", jurisdiction),
  severity: "critical",
  status: "ambiguous",
  detectedAt: isoDateToday(),
  impact: "Parcel-linked records may be incomplete or incorrect until the parcel is uniquely resolved."
});

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
  const dataGaps: DataGap[] = [];

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

  const assessorSelection = selectCandidateWithTieBreak(assessorCandidates, addressVariants);
  let resolvedCandidate = assessorSelection.selected;
  let resolutionMethod: ParcelResolutionMethod | undefined;
  if (resolvedCandidate) {
    resolutionMethod = "assessor";
  }

  let gisCandidates: ParcelCandidate[] = [];
  if (!resolvedCandidate && assessorCandidates.length === 0 && subject.geo && providers.gisParcelLayer) {
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
    const gisSelection = selectCandidateWithTieBreak(gisCandidates, addressVariants);
    resolvedCandidate = gisSelection.selected;
    if (resolvedCandidate) {
      resolutionMethod = "gis";
    } else if (gisCandidates.length > 1) {
      dataGaps.push(buildAmbiguousGap(
        "Multiple GIS parcel polygons intersect the address point.",
        "GIS parcel join returned multiple intersecting parcels.",
        gisCandidates,
        input.jurisdiction
      ));
    }
  }

  if (!resolvedCandidate && assessorCandidates.length > 1) {
    dataGaps.push(buildAmbiguousGap(
      "Multiple assessor parcel matches returned for the address.",
      "Assessor lookup returned multiple candidate parcels and tie-break rules could not select one.",
      assessorCandidates,
      input.jurisdiction
    ));
  }

  if (resolvedCandidate?.parcelId) subject.parcelId = resolvedCandidate.parcelId;
  if (resolvedCandidate?.accountId) subject.accountId = resolvedCandidate.accountId;

  return {
    subject,
    parcel: buildParcelFromCandidate(resolvedCandidate),
    geocode,
    assessorCandidates,
    gisCandidates,
    resolutionMethod,
    dataGaps
  };
};
