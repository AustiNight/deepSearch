import type { IsoDateString } from '../types';

export const PRIMARY_RECORD_TYPES = [
  'assessor_parcel',
  'tax_collector',
  'deed_recorder',
  'zoning_gis',
  'permits',
  'code_enforcement'
] as const;

export type PrimaryRecordType = typeof PRIMARY_RECORD_TYPES[number];

export const AVAILABILITY_STATUSES = [
  'available',
  'unavailable',
  'restricted',
  'partial',
  'unknown'
] as const;

export type AvailabilityStatus = typeof AVAILABILITY_STATUSES[number];

export const UNAVAILABLE_REASONS = [
  'no_public_access',
  'not_digitized',
  'requires_in_person',
  'paid_only',
  'not_collected',
  'not_applicable',
  'temporary_outage'
] as const;

export type UnavailableReason = typeof UNAVAILABLE_REASONS[number];

export type AvailabilityEvidence = {
  portalUrl?: string;
  statementUrl?: string;
  notes?: string;
  checkedBy?: string;
};

export type RecordAvailability = {
  status: AvailabilityStatus;
  reason?: string;
  unavailableReason?: UnavailableReason;
  lastChecked?: IsoDateString;
  expectedRefreshDays?: number;
  evidence?: AvailabilityEvidence;
  coverageNotes?: string;
};

export type JurisdictionKey = {
  country: string;
  state?: string;
  county?: string;
  city?: string;
};

export type JurisdictionAvailability = {
  id: string;
  jurisdiction: JurisdictionKey;
  records: Record<PrimaryRecordType, RecordAvailability>;
  notes?: string;
};

const unknownRecordAvailability = (): RecordAvailability => ({
  status: 'unknown'
});

export const DEFAULT_JURISDICTION_RECORDS: Record<PrimaryRecordType, RecordAvailability> = {
  assessor_parcel: unknownRecordAvailability(),
  tax_collector: unknownRecordAvailability(),
  deed_recorder: unknownRecordAvailability(),
  zoning_gis: unknownRecordAvailability(),
  permits: unknownRecordAvailability(),
  code_enforcement: unknownRecordAvailability()
};

export const JURISDICTION_AVAILABILITY_MATRIX: JurisdictionAvailability[] = [
  {
    id: 'US-DEFAULT',
    jurisdiction: {
      country: 'US'
    },
    records: DEFAULT_JURISDICTION_RECORDS,
    notes: 'Default entry. Override per state/county/city as availability is verified.'
  }
];
