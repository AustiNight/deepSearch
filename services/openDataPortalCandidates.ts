import type { Jurisdiction } from "../types";
import { findJurisdictionAvailability } from "./jurisdictionAvailability";
import { getOpenDatasetHints, rankOpenDataPortalCandidates } from "./openDataPortalService";

const uniqueList = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const normalizePortalCandidate = (value: string) => {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed}`.replace(/\/$/, "");
};

const normalizeJurisdictionToken = (value?: string) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const normalizeJurisdictionSlug = (value?: string) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const stripCountySuffix = (value?: string) =>
  (value || "")
    .replace(/\b(county|parish|borough|municipality)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildTokenVariants = (value?: string) => uniqueList([
  normalizeJurisdictionToken(value),
  normalizeJurisdictionSlug(value)
]).filter(Boolean);

const expandPortalTemplate = (value: string, jurisdiction?: Jurisdiction) => {
  const template = String(value || "").trim();
  if (!template) return [];
  if (!template.includes("{")) {
    const normalized = normalizePortalCandidate(template);
    return normalized ? [normalized] : [];
  }

  const countyBase = stripCountySuffix(jurisdiction?.county);
  const replacements: Record<string, string[]> = {
    city: buildTokenVariants(jurisdiction?.city),
    county: buildTokenVariants(jurisdiction?.county),
    countyBase: buildTokenVariants(countyBase),
    state: buildTokenVariants(jurisdiction?.state)
  };

  let variants = [template];
  for (const [token, values] of Object.entries(replacements)) {
    const marker = `{${token}}`;
    if (!variants.some((entry) => entry.includes(marker))) continue;
    if (values.length === 0) {
      variants = [];
      break;
    }
    variants = variants.flatMap((entry) => values.map((replacement) => entry.split(marker).join(replacement)));
  }

  return uniqueList(
    variants
      .map((entry) => normalizePortalCandidate(entry))
      .filter(Boolean)
  );
};

const buildHeuristicPortalCandidates = (jurisdiction?: Jurisdiction) => {
  const cityTokens = buildTokenVariants(jurisdiction?.city);
  const countyBase = stripCountySuffix(jurisdiction?.county);
  const countyTokens = uniqueList([
    ...buildTokenVariants(jurisdiction?.county),
    ...buildTokenVariants(countyBase).map((value) => `${value}county`)
  ]);
  const stateTokens = buildTokenVariants(jurisdiction?.state);

  const cityPortals = cityTokens.flatMap((token) => [
    `https://data.${token}.gov`,
    `https://opendata.${token}.gov`,
    `https://open.${token}.gov`,
    `https://gis.${token}.gov`,
    `https://${token}.opendata.arcgis.com`
  ]);
  const countyPortals = countyTokens.flatMap((token) => [
    `https://data.${token}.gov`,
    `https://opendata.${token}.gov`,
    `https://gis.${token}.gov`,
    `https://${token}.opendata.arcgis.com`
  ]);
  const statePortals = stateTokens.flatMap((token) => [
    `https://data.${token}.gov`,
    `https://opendata.${token}.gov`,
    `https://${token}.opendata.arcgis.com`
  ]);

  return uniqueList([...cityPortals, ...countyPortals, ...statePortals]).slice(0, 24);
};

export const buildOpenDataPortalCandidates = (jurisdiction?: Jurisdiction) => {
  const hints = getOpenDatasetHints(["parcel", "assessor", "appraiser", "apn", "pin", "cadastre"]).map((dataset) => dataset.portalUrl);
  const availability = findJurisdictionAvailability(jurisdiction);
  const availabilityPortals = Object.values(availability?.records || {})
    .flatMap((record: any) => {
      const evidence = record?.evidence || {};
      const templates = [
        evidence.portalUrl,
        ...(Array.isArray(evidence.portalUrls) ? evidence.portalUrls : [])
      ];
      return templates.flatMap((template) => expandPortalTemplate(String(template || ""), jurisdiction));
    });
  const heuristicPortals = buildHeuristicPortalCandidates(jurisdiction);
  const normalized = uniqueList(
    [...availabilityPortals, ...hints, ...heuristicPortals]
      .map((value) => normalizePortalCandidate(String(value || "")))
      .filter(Boolean)
  );
  const baseWeights: Record<string, number> = {};
  availabilityPortals.forEach((portal) => {
    const normalizedPortal = normalizePortalCandidate(String(portal || ""));
    if (!normalizedPortal) return;
    baseWeights[normalizedPortal] = (baseWeights[normalizedPortal] || 0) + 50;
  });
  hints.forEach((portal) => {
    const normalizedPortal = normalizePortalCandidate(String(portal || ""));
    if (!normalizedPortal) return;
    baseWeights[normalizedPortal] = (baseWeights[normalizedPortal] || 0) + 24;
  });
  heuristicPortals.forEach((portal) => {
    const normalizedPortal = normalizePortalCandidate(String(portal || ""));
    if (!normalizedPortal) return;
    baseWeights[normalizedPortal] = (baseWeights[normalizedPortal] || 0) + 8;
  });
  return rankOpenDataPortalCandidates(normalized, {
    jurisdiction,
    limit: 10,
    baseWeights
  });
};

