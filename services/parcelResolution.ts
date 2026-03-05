import type { DataGap, DataGapReasonCode, GeoPoint, Jurisdiction, ParcelInfo, ParcelResolutionMetrics, PropertySubject, SourcePointer } from "../types";
import { normalizeAddressVariants } from "./addressNormalization";
import { DATA_SOURCE_CONTRACTS } from "../data/dataSourceContracts";
import { FAILURE_TAXONOMY } from "../data/failureTaxonomy";
import { formatAvailabilityDetails, getRecordAvailability } from "./jurisdictionAvailability";
import { pointInGeometry } from "./spatialJoin";

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
  metrics?: ParcelResolutionMetrics;
};

const uniqueList = <T>(items: T[]) => Array.from(new Set(items));

const normalizeParcelId = (value?: string) => (value || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

const normalizeAddressKey = (value?: string) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const normalizeUnitToken = (value?: string) => (value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

const UNIT_DESIGNATOR_PATTERN = /(?:^|\s|,)(?:#|APT|APARTMENT|UNIT|SUITE|STE|BLDG|BUILDING|FL|FLOOR|LOT|RM|ROOM|PH)\s*[-#]*([A-Z0-9-]+)/gi;
const STREET_SUFFIX_TOKENS = new Set([
  "ALY", "AVE", "AV", "AVENUE", "BLVD", "BOULEVARD", "CIR", "CIRCLE", "CT", "COURT",
  "DR", "DRIVE", "EXPY", "EXPRESSWAY", "FWY", "FREEWAY", "HWY", "HIGHWAY", "LN", "LANE",
  "LOOP", "PKWY", "PARKWAY", "PL", "PLACE", "PLZ", "PLAZA", "RD", "ROAD", "SQ", "SQUARE",
  "ST", "STREET", "TER", "TERRACE", "TRL", "TRAIL", "WAY"
]);

const toStreetLine = (value: string) => {
  const head = String(value || "").split(",")[0] || "";
  return head.replace(/\s+/g, " ").trim().toUpperCase();
};

const extractTrailingUnitToken = (value: string) => {
  const line = toStreetLine(value);
  if (!line) return null;
  const tokens = line.split(" ").filter(Boolean);
  if (tokens.length < 3 || !/^\d+[A-Z]?$/.test(tokens[0])) return null;
  const last = tokens[tokens.length - 1];
  const prev = tokens[tokens.length - 2];
  const looksLikeUnit = /^(?:[A-Z]-\d+[A-Z]?|\d+[A-Z]?(?:-\d+[A-Z]?)?)$/.test(last);
  const prevLooksLikeSuffix = STREET_SUFFIX_TOKENS.has(prev.replace(/\./g, ""));
  if (looksLikeUnit && prevLooksLikeSuffix) {
    return normalizeUnitToken(last);
  }
  return null;
};

const extractUnitTokensFromAddressText = (value?: string) => {
  const out = new Set<string>();
  const text = String(value || "").trim().toUpperCase();
  if (!text) return out;
  let match: RegExpExecArray | null;
  UNIT_DESIGNATOR_PATTERN.lastIndex = 0;
  while ((match = UNIT_DESIGNATOR_PATTERN.exec(text)) !== null) {
    const token = normalizeUnitToken(match[1] || "");
    if (token) out.add(token);
  }
  const trailing = extractTrailingUnitToken(text);
  if (trailing) out.add(trailing);
  return out;
};

const mergeUnitTokenSets = (...sets: Array<Set<string>>) => {
  const merged = new Set<string>();
  sets.forEach((set) => set.forEach((token) => merged.add(token)));
  return merged;
};

const extractInputUnitTokens = (address: string, addressVariants: string[]) => {
  const sets = [extractUnitTokensFromAddressText(address)];
  addressVariants.forEach((variant) => sets.push(extractUnitTokensFromAddressText(variant)));
  return mergeUnitTokenSets(...sets);
};

const ADDRESS_LIKE_ATTRIBUTE_KEY_PATTERN = /address|addr|situs|site|location|unit|apt|suite|ste|bldg|building|room|floor|line/i;

const extractCandidateUnitTokens = (candidate: ParcelCandidate) => {
  const sets: Array<Set<string>> = [extractUnitTokensFromAddressText(candidate.situsAddress)];
  const attributes = candidate.attributes || {};
  Object.entries(attributes).forEach(([key, value]) => {
    if (!ADDRESS_LIKE_ATTRIBUTE_KEY_PATTERN.test(key)) return;
    if (typeof value !== "string") return;
    if (value.length > 140) return;
    sets.push(extractUnitTokensFromAddressText(value));
  });
  return mergeUnitTokenSets(...sets);
};

const scoreUnitMatch = (inputUnitTokens: Set<string>, candidateUnitTokens: Set<string>) => {
  if (inputUnitTokens.size === 0) return 0;
  if (candidateUnitTokens.size === 0) return -6;
  for (const inputUnit of inputUnitTokens) {
    if (candidateUnitTokens.has(inputUnit)) return 55;
  }
  return -28;
};

const YEAR_FIELD_PATTERN = /(year|taxyear|tax_year|assessment_year|asmt_year|roll_year|current_year|valuation_year)$/i;

const extractCandidateRecencyYear = (candidate: ParcelCandidate) => {
  const attributes = candidate.attributes || {};
  let newest = 0;
  Object.entries(attributes).forEach(([key, value]) => {
    if (!YEAR_FIELD_PATTERN.test(key)) return;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const year = Math.floor(parsed);
    if (year < 1900 || year > 2100) return;
    if (year > newest) newest = year;
  });
  return newest || undefined;
};

const scoreRecencyYear = (year?: number) => {
  if (!year) return 0;
  if (year >= 2023) return 12;
  if (year >= 2018) return 8;
  if (year >= 2010) return 4;
  return 0;
};

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


const buildFailureGap = (
  code: DataGapReasonCode,
  context: {
    fieldPath?: string;
    recordType?: string;
    expectedSources?: SourcePointer[];
    reasonDetails?: string;
    description?: string;
    status?: DataGap["status"];
    severity?: DataGap["severity"];
    impact?: string;
  }
): DataGap => {
  const definition = FAILURE_TAXONOMY[code];
  const reason = context.reasonDetails
    ? `${definition.reason} ${context.reasonDetails}`.trim()
    : definition.reason;
  return {
    id: createGapId(),
    fieldPath: context.fieldPath ?? definition.fieldPath,
    recordType: context.recordType ?? definition.recordType,
    description: context.description ?? definition.userMessage,
    reason,
    reasonCode: code,
    expectedSources: context.expectedSources,
    severity: context.severity ?? definition.severity,
    status: context.status ?? definition.status,
    detectedAt: isoDateToday(),
    impact: context.impact ?? definition.impact
  };
};

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

const scoreCandidate = (
  candidate: ParcelCandidate,
  context: {
    addressVariants: string[];
    inputUnitTokens: Set<string>;
  }
) => {
  const { addressVariants, inputUnitTokens } = context;
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
  const unitScore = scoreUnitMatch(inputUnitTokens, extractCandidateUnitTokens(candidate));
  const recencyScore = scoreRecencyYear(extractCandidateRecencyYear(candidate));
  return matchScore + idScore + confidenceScore + unitScore + recencyScore;
};

const selectCandidateWithTieBreak = (
  candidates: ParcelCandidate[],
  addressVariants: string[],
  address: string
) => {
  if (candidates.length === 0) return { selected: undefined, topMatches: [] };
  if (candidates.length === 1) return { selected: candidates[0], topMatches: candidates };
  const inputUnitTokens = extractInputUnitTokens(address, addressVariants);
  const scored = candidates.map(candidate => ({
    candidate,
    score: scoreCandidate(candidate, { addressVariants, inputUnitTokens })
  })).sort((a, b) => b.score - a.score);
  const topScore = scored[0].score;
  const topMatches = scored.filter(entry => entry.score === topScore).map(entry => entry.candidate);
  if (topMatches.length === 1) {
    return { selected: topMatches[0], topMatches };
  }
  const rankedBySignal = topMatches
    .map((candidate) => {
      const unitScore = scoreUnitMatch(inputUnitTokens, extractCandidateUnitTokens(candidate));
      const recencyYear = extractCandidateRecencyYear(candidate) || 0;
      return { candidate, unitScore, recencyYear };
    })
    .sort((a, b) =>
      (b.unitScore - a.unitScore)
      || (b.recencyYear - a.recencyYear)
    );
  if (rankedBySignal.length > 1) {
    const first = rankedBySignal[0];
    const second = rankedBySignal[1];
    const signalSeparates = first.unitScore !== second.unitScore || first.recencyYear !== second.recencyYear;
    if (signalSeparates) {
      return { selected: first.candidate, topMatches };
    }
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
  const startedAt = Date.now();
  const hasProviders = Boolean(providers.geocode || providers.assessorLookup || providers.gisParcelLayer);
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
  const assessorAvailability = getRecordAvailability("assessor_parcel", input.jurisdiction);

  let geocode: GeocodeResult | undefined;
  let geocodeResolved = false;
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
      geocodeResolved = true;
    }
  }
  if (providers.geocode && !geocodeResolved) {
    dataGaps.push(buildFailureGap("geocode_failed", {
      reasonDetails: `Address: ${normalizedAddress}.`
    }));
  }

  let assessorCandidates: ParcelCandidate[] = [];
  let assessorAttempted = false;
  if (providers.assessorLookup) {
    assessorAttempted = true;
    assessorCandidates = dedupeParcelCandidates(await providers.assessorLookup({
      address: input.address,
      normalizedAddress,
      addressVariants,
      jurisdiction: input.jurisdiction,
      geo: subject.geo
    }));
  }

  const assessorSelection = selectCandidateWithTieBreak(assessorCandidates, addressVariants, input.address);
  let resolvedCandidate = assessorSelection.selected;
  let resolutionMethod: ParcelResolutionMethod | undefined;
  if (resolvedCandidate) {
    resolutionMethod = "assessor";
  }

  let gisCandidates: ParcelCandidate[] = [];
  let gisAttempted = false;
  if (!resolvedCandidate && subject.geo && providers.gisParcelLayer) {
    gisAttempted = true;
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
    const gisSelection = selectCandidateWithTieBreak(gisCandidates, addressVariants, input.address);
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

  const hasParcelAmbiguity = dataGaps.some(gap => gap.status === "ambiguous" && gap.fieldPath === "/subject/parcelId");
  const assessorUnavailable = assessorAvailability?.status === "unavailable";
  if (!resolvedCandidate && !hasParcelAmbiguity && (assessorAttempted || gisAttempted || assessorUnavailable)) {
    const expectedSources = expectedSourcesForRecord("assessor_parcel", input.jurisdiction);
    if (assessorUnavailable) {
      dataGaps.push(buildFailureGap("data_unavailable", {
        recordType: "assessor_parcel",
        expectedSources,
        reasonDetails: formatAvailabilityDetails(assessorAvailability)
      }));
    } else {
      dataGaps.push(buildFailureGap("parcel_not_found", {
        recordType: "assessor_parcel",
        expectedSources,
        reasonDetails: `Assessor candidates: ${assessorCandidates.length}. GIS candidates: ${gisCandidates.length}.`
      }));
    }
  }

  if (resolvedCandidate?.parcelId) subject.parcelId = resolvedCandidate.parcelId;
  if (resolvedCandidate?.accountId) subject.accountId = resolvedCandidate.accountId;

  const failureReason = (() => {
    if (!hasProviders) return "not_attempted";
    if (resolvedCandidate) return undefined;
    if (hasParcelAmbiguity) return "parcel_ambiguous";
    const gapReason = dataGaps.find(gap => gap.reasonCode === "parcel_not_found" || gap.reasonCode === "data_unavailable")?.reasonCode;
    return gapReason;
  })();

  const metrics: ParcelResolutionMetrics = {
    attempted: hasProviders,
    success: Boolean(resolvedCandidate),
    method: resolutionMethod,
    latencyMs: Date.now() - startedAt,
    assessorCandidates: assessorCandidates.length,
    gisCandidates: gisCandidates.length,
    ambiguity: hasParcelAmbiguity,
    failureReason,
    derivedFrom: "workflow"
  };

  return {
    subject,
    parcel: buildParcelFromCandidate(resolvedCandidate),
    geocode,
    assessorCandidates,
    gisCandidates,
    resolutionMethod,
    dataGaps,
    metrics
  };
};
