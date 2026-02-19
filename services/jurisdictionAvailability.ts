import { JURISDICTION_AVAILABILITY_MATRIX, type PrimaryRecordType, type RecordAvailability } from '../data/jurisdictionAvailability';
import type { Jurisdiction } from '../types';

const normalizeJurisdictionToken = (value?: string) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const countJurisdictionSpecificity = (jurisdiction?: Partial<Jurisdiction>) =>
  Object.values(jurisdiction || {}).filter(Boolean).length;

const matchesJurisdiction = (expected?: Partial<Jurisdiction>, actual?: Jurisdiction) => {
  if (!expected) return true;
  if (!actual) return false;
  if (expected.country && normalizeJurisdictionToken(expected.country) !== normalizeJurisdictionToken(actual.country)) return false;
  if (expected.state && normalizeJurisdictionToken(expected.state) !== normalizeJurisdictionToken(actual.state)) return false;
  if (expected.county && normalizeJurisdictionToken(expected.county) !== normalizeJurisdictionToken(actual.county)) return false;
  if (expected.city && normalizeJurisdictionToken(expected.city) !== normalizeJurisdictionToken(actual.city)) return false;
  return true;
};

export const findJurisdictionAvailability = (jurisdiction?: Jurisdiction) => {
  const candidates = JURISDICTION_AVAILABILITY_MATRIX.filter(entry =>
    matchesJurisdiction(entry.jurisdiction, jurisdiction)
  );
  if (candidates.length === 0) {
    return JURISDICTION_AVAILABILITY_MATRIX.find(entry => entry.id === 'US-DEFAULT');
  }
  return candidates.sort(
    (a, b) => countJurisdictionSpecificity(b.jurisdiction) - countJurisdictionSpecificity(a.jurisdiction)
  )[0];
};

export const getRecordAvailability = (recordType: PrimaryRecordType, jurisdiction?: Jurisdiction) =>
  findJurisdictionAvailability(jurisdiction)?.records?.[recordType];

export const formatAvailabilityDetails = (availability?: RecordAvailability) => {
  if (!availability) return undefined;
  const parts: string[] = [];
  if (availability.unavailableReason) parts.push(`Unavailable reason: ${availability.unavailableReason}.`);
  if (availability.reason) parts.push(`Notes: ${availability.reason}.`);
  if (availability.lastChecked) parts.push(`Last checked: ${availability.lastChecked}.`);
  return parts.length ? parts.join(' ') : undefined;
};
