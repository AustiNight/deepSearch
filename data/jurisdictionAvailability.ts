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
  portalUrls?: string[];
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

const DEFAULT_PORTAL_HINT_TEMPLATES = [
  'https://data.{city}.gov',
  'https://opendata.{city}.gov',
  'https://gis.{city}.gov',
  'https://{city}.opendata.arcgis.com',
  'https://data.{countyBase}county.gov',
  'https://opendata.{countyBase}county.gov',
  'https://gis.{countyBase}county.gov',
  'https://{countyBase}county.opendata.arcgis.com',
  'https://data.{state}.gov',
  'https://opendata.{state}.gov'
];

const cloneHints = (hints: string[]) => hints.map((value) => value.trim()).filter(Boolean);

const buildUnknownWithHints = (hints: string[]): RecordAvailability => ({
  status: 'unknown',
  evidence: {
    portalUrl: hints[0],
    portalUrls: cloneHints(hints),
    notes: 'Discovery seed hints. Resolve exact datasets during runtime.'
  }
});

const buildDefaultRecordsWithHints = (hints: string[]): Record<PrimaryRecordType, RecordAvailability> => ({
  assessor_parcel: buildUnknownWithHints(hints),
  tax_collector: buildUnknownWithHints(hints),
  deed_recorder: buildUnknownWithHints(hints),
  zoning_gis: buildUnknownWithHints(hints),
  permits: buildUnknownWithHints(hints),
  code_enforcement: buildUnknownWithHints(hints)
});

const buildSeededRecords = (portalHints: string[]): Record<PrimaryRecordType, RecordAvailability> => ({
  assessor_parcel: buildUnknownWithHints(portalHints),
  tax_collector: buildUnknownWithHints(portalHints),
  deed_recorder: buildUnknownWithHints(portalHints),
  zoning_gis: buildUnknownWithHints(portalHints),
  permits: buildUnknownWithHints(portalHints),
  code_enforcement: buildUnknownWithHints(portalHints)
});

export const DEFAULT_JURISDICTION_RECORDS: Record<PrimaryRecordType, RecordAvailability> =
  buildDefaultRecordsWithHints(DEFAULT_PORTAL_HINT_TEMPLATES);

export const JURISDICTION_AVAILABILITY_MATRIX: JurisdictionAvailability[] = [
  {
    id: 'US-DEFAULT',
    jurisdiction: {
      country: 'US'
    },
    records: DEFAULT_JURISDICTION_RECORDS,
    notes: 'Default entry with template-based portal hints. Override per state/county/city as availability is verified.'
  },
  {
    id: 'US-IL-CHICAGO-COOK',
    jurisdiction: {
      country: 'US',
      state: 'IL',
      county: 'Cook',
      city: 'Chicago'
    },
    records: buildSeededRecords([
      'https://datacatalog.cookcountyil.gov',
      'https://data.cityofchicago.org'
    ])
  },
  {
    id: 'US-TX-DALLAS-CITY',
    jurisdiction: {
      country: 'US',
      state: 'TX',
      county: 'Dallas',
      city: 'Dallas'
    },
    records: buildSeededRecords([
      'https://www.dallasopendata.com',
      'https://www.dallascityhall.com'
    ])
  },
  {
    id: 'US-TN-KNOXVILLE-KNOX',
    jurisdiction: {
      country: 'US',
      state: 'TN',
      county: 'Knox',
      city: 'Knoxville'
    },
    records: buildSeededRecords([
      'https://opendata.knoxvilletn.gov',
      'https://knoxcountytn.opengov.com',
      'https://data.tennessee.gov'
    ])
  },
  {
    id: 'US-MO-STLOUIS-CITY',
    jurisdiction: {
      country: 'US',
      state: 'MO',
      county: 'St. Louis',
      city: 'St. Louis'
    },
    records: buildSeededRecords([
      'https://www.stlouis-mo.gov/data',
      'https://data.mo.gov'
    ])
  },
  {
    id: 'US-TX-AUSTIN-TRAVIS',
    jurisdiction: {
      country: 'US',
      state: 'TX',
      county: 'Travis',
      city: 'Austin'
    },
    records: buildSeededRecords([
      'https://data.austintexas.gov',
      'https://data.texas.gov'
    ])
  },
  {
    id: 'US-NY-NEWYORK-CITY',
    jurisdiction: {
      country: 'US',
      state: 'NY',
      county: 'New York',
      city: 'New York'
    },
    records: buildSeededRecords([
      'https://data.cityofnewyork.us',
      'https://data.ny.gov'
    ])
  },
  {
    id: 'US-CA-LOSANGELES-CITY',
    jurisdiction: {
      country: 'US',
      state: 'CA',
      county: 'Los Angeles',
      city: 'Los Angeles'
    },
    records: buildSeededRecords([
      'https://data.lacity.org',
      'https://data.lacounty.gov',
      'https://data.ca.gov'
    ])
  },
  {
    id: 'US-CA-SANFRANCISCO-CITY',
    jurisdiction: {
      country: 'US',
      state: 'CA',
      county: 'San Francisco',
      city: 'San Francisco'
    },
    records: buildSeededRecords([
      'https://data.sfgov.org',
      'https://data.ca.gov'
    ])
  },
  {
    id: 'US-WA-SEATTLE-KING',
    jurisdiction: {
      country: 'US',
      state: 'WA',
      county: 'King',
      city: 'Seattle'
    },
    records: buildSeededRecords([
      'https://data.seattle.gov',
      'https://data.wa.gov'
    ])
  },
  {
    id: 'US-FL-MIAMI-DADE',
    jurisdiction: {
      country: 'US',
      state: 'FL',
      county: 'Miami-Dade',
      city: 'Miami'
    },
    records: buildSeededRecords([
      'https://opendata.miamidade.gov',
      'https://data.florida.gov'
    ])
  },
  {
    id: 'US-TX-STATE',
    jurisdiction: {
      country: 'US',
      state: 'TX'
    },
    records: buildSeededRecords(['https://data.texas.gov'])
  },
  {
    id: 'US-CA-STATE',
    jurisdiction: {
      country: 'US',
      state: 'CA'
    },
    records: buildSeededRecords(['https://data.ca.gov'])
  },
  {
    id: 'US-FL-STATE',
    jurisdiction: {
      country: 'US',
      state: 'FL'
    },
    records: buildSeededRecords(['https://data.florida.gov'])
  },
  {
    id: 'US-NY-STATE',
    jurisdiction: {
      country: 'US',
      state: 'NY'
    },
    records: buildSeededRecords(['https://data.ny.gov'])
  },
  {
    id: 'US-IL-STATE',
    jurisdiction: {
      country: 'US',
      state: 'IL'
    },
    records: buildSeededRecords(['https://data.illinois.gov'])
  },
  {
    id: 'US-TN-STATE',
    jurisdiction: {
      country: 'US',
      state: 'TN'
    },
    records: buildSeededRecords(['https://data.tennessee.gov'])
  },
  {
    id: 'US-MO-STATE',
    jurisdiction: {
      country: 'US',
      state: 'MO'
    },
    records: buildSeededRecords(['https://data.mo.gov'])
  }
];
