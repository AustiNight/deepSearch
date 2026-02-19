import type { DataGapReasonCode, DataGapSeverity, DataGapStatus } from '../types';

export type FailureTaxonomyEntry = {
  code: DataGapReasonCode;
  status: DataGapStatus;
  severity: DataGapSeverity;
  fieldPath?: string;
  recordType?: string;
  userMessage: string;
  reason: string;
  impact: string;
};

export const FAILURE_TAXONOMY: Record<DataGapReasonCode, FailureTaxonomyEntry> = {
  geocode_failed: {
    code: 'geocode_failed',
    status: 'missing',
    severity: 'critical',
    fieldPath: '/subject/geo',
    recordType: 'geocode',
    userMessage: 'Unable to confirm the address location from available geocoders.',
    reason: 'Geocode lookup returned no valid point for the normalized address.',
    impact: 'Parcel resolution and spatial joins cannot proceed without a reliable location.'
  },
  parcel_not_found: {
    code: 'parcel_not_found',
    status: 'missing',
    severity: 'critical',
    fieldPath: '/subject/parcelId',
    recordType: 'assessor_parcel',
    userMessage: 'No parcel record matched the address in assessor or GIS sources.',
    reason: 'Assessor lookup and GIS parcel join returned no candidate parcels.',
    impact: 'Parcel-linked records (tax, ownership, zoning, permits) may be incomplete.'
  },
  data_unavailable: {
    code: 'data_unavailable',
    status: 'unavailable',
    severity: 'major',
    fieldPath: '/subject/parcelId',
    recordType: 'assessor_parcel',
    userMessage: 'Parcel/assessor records are not publicly available for this jurisdiction.',
    reason: 'Jurisdiction availability matrix indicates the record type is unavailable.',
    impact: 'Primary parcel-linked records cannot be verified in this jurisdiction.'
  }
};
