import type { DataGap, Jurisdiction } from "../types";

export type AddressScopeClassification = {
  scope: "us" | "non_us" | "unknown";
  reasons: string[];
  country?: string;
};

const isoDateToday = () => new Date().toISOString().slice(0, 10);

const createGapId = () => `gap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const US_COUNTRY_REGEX = /\b(united\s+states|u\.?s\.?a?\.?|america)\b/i;

const NON_US_COUNTRY_PATTERNS: Array<{ country: string; regex: RegExp }> = [
  { country: "Canada", regex: /\bcanada\b/i },
  { country: "United Kingdom", regex: /\b(united\s+kingdom|uk|u\.k\.|england|scotland|wales|northern\s+ireland)\b/i },
  { country: "Ireland", regex: /\bireland\b/i },
  { country: "Mexico", regex: /\bmexico\b/i },
  { country: "Australia", regex: /\baustralia\b/i },
  { country: "New Zealand", regex: /\bnew\s+zealand\b/i },
  { country: "Germany", regex: /\bgermany\b/i },
  { country: "France", regex: /\bfrance\b/i },
  { country: "Spain", regex: /\bspain\b/i },
  { country: "Italy", regex: /\bitaly\b/i },
  { country: "Netherlands", regex: /\bnetherlands\b/i },
  { country: "Belgium", regex: /\bbelgium\b/i },
  { country: "Sweden", regex: /\bsweden\b/i },
  { country: "Norway", regex: /\bnorway\b/i },
  { country: "Denmark", regex: /\bdenmark\b/i },
  { country: "Finland", regex: /\bfinland\b/i },
  { country: "Switzerland", regex: /\bswitzerland\b/i },
  { country: "Austria", regex: /\baustria\b/i },
  { country: "Portugal", regex: /\bportugal\b/i },
  { country: "Poland", regex: /\bpoland\b/i },
  { country: "Czech Republic", regex: /\bczech\b|\bczech\s+republic\b/i },
  { country: "India", regex: /\bindia\b/i },
  { country: "China", regex: /\bchina\b/i },
  { country: "Japan", regex: /\bjapan\b/i },
  { country: "South Korea", regex: /\bsouth\s+korea\b|\bkorea\b/i },
  { country: "Brazil", regex: /\bbrazil\b/i },
  { country: "Argentina", regex: /\bargentina\b/i }
];

const NON_US_POSTAL_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: "UK postcode", regex: /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i },
  { label: "Canada postal code", regex: /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/i },
  { label: "Netherlands postal code", regex: /\b\d{4}\s?[A-Z]{2}\b/i },
  { label: "Ireland Eircode", regex: /\b[AC-FHKNPRTV-Y]\d{2}\s?[0-9AC-FHKNPRTV-Y]{4}\b/i },
  { label: "EU country-prefix postal", regex: /\b[A-Z]{2}-\d{4,5}\b/i }
];

const US_ZIP_REGEX = /\b\d{5}(?:-\d{4})?\b/;

const normalizeCountryToken = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

const isUsCountryToken = (value?: string) => {
  if (!value) return false;
  const normalized = normalizeCountryToken(value);
  return normalized === "us" || normalized === "usa" || normalized === "unitedstates" || normalized === "unitedstatesofamerica" || normalized === "america";
};

const readSlotValue = (slots: Record<string, unknown> | undefined, key: string) => {
  if (!slots) return "";
  const value = slots[key];
  if (Array.isArray(value)) return String(value[0] || "").trim();
  if (typeof value === "string") return value.trim();
  return "";
};

export const classifyAddressScope = (input: {
  topic: string;
  slots?: Record<string, unknown>;
}): AddressScopeClassification => {
  const reasons: string[] = [];
  const topic = input.topic || "";

  const slotCountry = readSlotValue(input.slots, "country");
  if (slotCountry) {
    if (isUsCountryToken(slotCountry)) {
      reasons.push(`country_slot:${slotCountry}`);
      return { scope: "us", reasons, country: "United States" };
    }
    reasons.push(`country_slot:${slotCountry}`);
    return { scope: "non_us", reasons, country: slotCountry };
  }

  for (const entry of NON_US_COUNTRY_PATTERNS) {
    if (entry.regex.test(topic)) {
      reasons.push(`country_token:${entry.country}`);
      return { scope: "non_us", reasons, country: entry.country };
    }
  }

  for (const entry of NON_US_POSTAL_PATTERNS) {
    if (entry.regex.test(topic)) {
      reasons.push(`postal_format:${entry.label}`);
      return { scope: "non_us", reasons };
    }
  }

  if (US_COUNTRY_REGEX.test(topic)) {
    reasons.push("country_token:United States");
    return { scope: "us", reasons, country: "United States" };
  }

  const stateSlot = readSlotValue(input.slots, "state");
  if (stateSlot) {
    reasons.push(`state_slot:${stateSlot}`);
    return { scope: "us", reasons, country: "United States" };
  }

  if (US_ZIP_REGEX.test(topic)) {
    reasons.push("postal_format:US ZIP");
    return { scope: "us", reasons, country: "United States" };
  }

  return { scope: "unknown", reasons };
};

export const isNonUsJurisdiction = (jurisdiction?: Jurisdiction): boolean => {
  const country = normalizeCountryToken(jurisdiction?.country || "");
  if (!country) return false;
  return !isUsCountryToken(country);
};

export const buildUnsupportedJurisdictionGap = (input: {
  classification: AddressScopeClassification;
}): DataGap => {
  const country = input.classification.country || "non-US jurisdiction";
  return {
    id: createGapId(),
    fieldPath: "/subject/jurisdiction",
    recordType: "jurisdiction_scope",
    description: `Address appears to be outside the United States (${country}).`,
    reason: "US-only address policy is enabled, so US-specific record gates and portal queries were skipped.",
    reasonCode: "unsupported_jurisdiction",
    status: "unavailable",
    severity: "major",
    detectedAt: isoDateToday(),
    impact: "US parcel resolution, primary record coverage, and evidence recovery are not available for this address."
  };
};
