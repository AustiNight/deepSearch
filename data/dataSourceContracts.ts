import type { PrimaryRecordType } from './jurisdictionAvailability';

export type DataSourceQueryInputType =
  | 'string'
  | 'number'
  | 'date'
  | 'enum'
  | 'geojson'
  | 'bbox'
  | 'lat'
  | 'lon';

export type DataSourceQueryInput = {
  name: string;
  type: DataSourceQueryInputType;
  required: boolean;
  example?: string;
  notes?: string;
};

export type DataSourceExpectedField = {
  name: string;
  description: string;
  fieldPath?: string;
};

export type DataSourceRateLimit = {
  maxRequestsPerMinute?: number;
  maxRequestsPerDay?: number;
  requiresKey?: boolean;
  notes?: string;
};

export type DataSourceEndpointContract = {
  id: string;
  label: string;
  portalType:
    | 'assessor_portal'
    | 'tax_portal'
    | 'recorder_portal'
    | 'zoning_gis'
    | 'permit_portal'
    | 'code_enforcement'
    | 'arcgis'
    | 'socrata'
    | 'dcat'
    | 'public_records_search';
  portalUrlTemplate?: string;
  endpointTemplate?: string;
  queryInputs: DataSourceQueryInput[];
  expectedFields: DataSourceExpectedField[];
  rateLimits: DataSourceRateLimit;
  parsingRules: string[];
  notes?: string;
};

export type DataSourceContract = {
  recordType: PrimaryRecordType;
  description: string;
  preferredPortalTypes: DataSourceEndpointContract['portalType'][];
  endpoints: DataSourceEndpointContract[];
};

export const DATA_SOURCE_CONTRACTS_SCHEMA_VERSION = 1;

const DEFAULT_RATE_LIMIT: DataSourceRateLimit = {
  maxRequestsPerMinute: 60,
  requiresKey: false,
  notes: 'Varies by jurisdiction. Throttle and honor 429/503 responses.'
};

export const DATA_SOURCE_CONTRACTS: DataSourceContract[] = [
  {
    recordType: 'assessor_parcel',
    description: 'Assessor/CAD parcel system of record with parcel, situs, and property characteristics.',
    preferredPortalTypes: ['assessor_portal', 'arcgis', 'socrata'],
    endpoints: [
      {
        id: 'assessor-portal-search',
        label: 'County assessor parcel search portal',
        portalType: 'assessor_portal',
        portalUrlTemplate: 'https://{county}.{state}.gov/assessor',
        queryInputs: [
          { name: 'address', type: 'string', required: false, example: '123 Main St' },
          { name: 'parcelId', type: 'string', required: false, example: '123-45-678' },
          { name: 'accountId', type: 'string', required: false, example: 'A-102938' },
          { name: 'ownerName', type: 'string', required: false, example: 'Smith' }
        ],
        expectedFields: [
          { name: 'parcelId', description: 'Primary parcel identifier', fieldPath: '/parcel/parcelId' },
          { name: 'accountId', description: 'Assessor account identifier', fieldPath: '/parcel/accountId' },
          { name: 'situsAddress', description: 'Situs address', fieldPath: '/parcel/situsAddress' },
          { name: 'legalDescription', description: 'Legal description', fieldPath: '/parcel/legalDescription' },
          { name: 'landUseCode', description: 'Land use code', fieldPath: '/parcel/landUseCode' },
          { name: 'landUseDescription', description: 'Land use description', fieldPath: '/parcel/landUseDescription' },
          { name: 'lotSize', description: 'Lot size value/unit', fieldPath: '/parcel/lotSize' },
          { name: 'buildingAreaSqFt', description: 'Building area', fieldPath: '/parcel/buildingAreaSqFt' },
          { name: 'yearBuilt', description: 'Year built', fieldPath: '/parcel/yearBuilt' },
          { name: 'unitCount', description: 'Number of units', fieldPath: '/parcel/unitCount' }
        ],
        rateLimits: { ...DEFAULT_RATE_LIMIT },
        parsingRules: [
          'Normalize parcel identifiers by removing spaces and standardizing delimiters.',
          'Convert lot size units to sq_ft or acres and store unit explicitly.',
          'Prefer assessor parcel data over secondary aggregators when conflicts occur.',
          'If multiple parcel matches remain after normalization, leave parcel fields unset and emit DataGap status=ambiguous.'
        ],
        notes: 'Manual portal searches may require captcha or session cookies; fall back to GIS parcel layer if needed.'
      },
      {
        id: 'parcel-gis-layer',
        label: 'GIS parcel layer (ArcGIS/Socrata)',
        portalType: 'arcgis',
        endpointTemplate: 'https://{portal}/arcgis/rest/services/{service}/FeatureServer/{layer}/query',
        queryInputs: [
          { name: 'geometry', type: 'geojson', required: true, example: '{"type":"Point","coordinates":[-118.2437,34.0522]}' },
          { name: 'bbox', type: 'bbox', required: false, example: '-118.25,34.04,-118.24,34.06' }
        ],
        expectedFields: [
          { name: 'parcelId', description: 'Parcel identifier', fieldPath: '/parcel/parcelId' },
          { name: 'situsAddress', description: 'Situs address', fieldPath: '/parcel/situsAddress' },
          { name: 'landUseCode', description: 'Land use code', fieldPath: '/parcel/landUseCode' },
          { name: 'lotSize', description: 'Lot size value/unit', fieldPath: '/parcel/lotSize' }
        ],
        rateLimits: { ...DEFAULT_RATE_LIMIT, notes: 'Respect server-side limits; use resultOffset/resultRecordCount pagination.' },
        parsingRules: [
          'Use point-in-polygon for parcel selection. If multiple parcels intersect, pick none and emit DataGap status=ambiguous.',
          'If parcel geometry exists, compute centroid and attach to /subject/geo with accuracy metadata.'
        ]
      }
    ]
  },
  {
    recordType: 'tax_collector',
    description: 'Tax collector or treasurer portal for tax roll and payment status.',
    preferredPortalTypes: ['tax_portal', 'socrata'],
    endpoints: [
      {
        id: 'tax-collector-portal',
        label: 'Tax collector payment portal',
        portalType: 'tax_portal',
        portalUrlTemplate: 'https://{county}.{state}.gov/tax',
        queryInputs: [
          { name: 'parcelId', type: 'string', required: false, example: '123-45-678' },
          { name: 'accountId', type: 'string', required: false, example: 'A-102938' },
          { name: 'address', type: 'string', required: false, example: '123 Main St' },
          { name: 'assessmentYear', type: 'number', required: false, example: '2025' }
        ],
        expectedFields: [
          { name: 'assessmentYear', description: 'Assessment year', fieldPath: '/taxAppraisal/assessmentYear' },
          { name: 'assessedValueUsd', description: 'Assessed value', fieldPath: '/taxAppraisal/assessedValueUsd' },
          { name: 'marketValueUsd', description: 'Market value', fieldPath: '/taxAppraisal/marketValueUsd' },
          { name: 'taxableValueUsd', description: 'Taxable value', fieldPath: '/taxAppraisal/taxableValueUsd' },
          { name: 'taxAmountUsd', description: 'Tax amount due/paid', fieldPath: '/taxAppraisal/taxAmountUsd' },
          { name: 'taxRatePct', description: 'Tax rate', fieldPath: '/taxAppraisal/taxRatePct' },
          { name: 'taxStatus', description: 'Payment status', fieldPath: '/taxAppraisal/taxStatus' }
        ],
        rateLimits: { ...DEFAULT_RATE_LIMIT },
        parsingRules: [
          'Strip currency symbols and commas before numeric parsing.',
          'Prefer the most recent assessment year when multiple years are returned.',
          'If tax amounts are delinquent, record taxStatus and add a DataGap only if amounts are missing.'
        ]
      }
    ]
  },
  {
    recordType: 'deed_recorder',
    description: 'Recorder/registrar index for deeds, transfers, and document references.',
    preferredPortalTypes: ['recorder_portal', 'public_records_search'],
    endpoints: [
      {
        id: 'recorder-index-search',
        label: 'Recorder index search',
        portalType: 'recorder_portal',
        portalUrlTemplate: 'https://{county}.{state}.gov/recorder',
        queryInputs: [
          { name: 'grantor', type: 'string', required: false, example: 'Smith' },
          { name: 'grantee', type: 'string', required: false, example: 'Smith' },
          { name: 'parcelId', type: 'string', required: false, example: '123-45-678' },
          { name: 'recordedDateRange', type: 'date', required: false, example: '2020-01-01 to 2025-12-31' }
        ],
        expectedFields: [
          { name: 'lastTransferDate', description: 'Most recent transfer date', fieldPath: '/ownership/lastTransferDate' },
          { name: 'lastTransferPriceUsd', description: 'Most recent transfer price', fieldPath: '/ownership/lastTransferPriceUsd' },
          { name: 'deedInstrument', description: 'Instrument type', fieldPath: '/ownership/deedInstrument' },
          { name: 'deedBookPage', description: 'Book/page reference', fieldPath: '/ownership/deedBookPage' },
          { name: 'documentId', description: 'Document identifier', fieldPath: '/ownership/ownershipHistory' },
          { name: 'documentUrl', description: 'Document URL', fieldPath: '/ownership/ownershipHistory' }
        ],
        rateLimits: { ...DEFAULT_RATE_LIMIT, notes: 'Recorder portals may throttle aggressively; use date filters and pagination.' },
        parsingRules: [
          'Select the most recent recorded document as current transfer metadata.',
          'Preserve all matching instruments in ownershipHistory with recordedDate ordering.',
          'If document access is restricted, store documentId and add DataGap status=restricted.'
        ]
      }
    ]
  },
  {
    recordType: 'zoning_gis',
    description: 'Zoning GIS layers and zoning ordinance references for land use controls.',
    preferredPortalTypes: ['zoning_gis', 'arcgis'],
    endpoints: [
      {
        id: 'zoning-gis-layer',
        label: 'Zoning GIS layer',
        portalType: 'arcgis',
        endpointTemplate: 'https://{portal}/arcgis/rest/services/{service}/FeatureServer/{layer}/query',
        queryInputs: [
          { name: 'geometry', type: 'geojson', required: true, example: '{"type":"Point","coordinates":[-118.2437,34.0522]}' },
          { name: 'bbox', type: 'bbox', required: false, example: '-118.25,34.04,-118.24,34.06' }
        ],
        expectedFields: [
          { name: 'zoningCode', description: 'Zoning code', fieldPath: '/zoningLandUse/zoningCode' },
          { name: 'zoningDescription', description: 'Zoning description', fieldPath: '/zoningLandUse/zoningDescription' },
          { name: 'overlayDistricts', description: 'Overlay districts', fieldPath: '/zoningLandUse/overlayDistricts' },
          { name: 'futureLandUse', description: 'Future land use plan', fieldPath: '/zoningLandUse/futureLandUse' },
          { name: 'landUseDesignation', description: 'Land use designation', fieldPath: '/zoningLandUse/landUseDesignation' },
          { name: 'maxHeightFt', description: 'Maximum height', fieldPath: '/zoningLandUse/maxHeightFt' },
          { name: 'far', description: 'Floor area ratio', fieldPath: '/zoningLandUse/far' },
          { name: 'setbacks', description: 'Setback distances', fieldPath: '/zoningLandUse/setbacks' }
        ],
        rateLimits: { ...DEFAULT_RATE_LIMIT },
        parsingRules: [
          'Handle multiple intersecting zoning polygons as overlays; keep base zoning plus overlay list.',
          'Normalize numeric values and units (feet, percent, ratio) before storing.',
          'If zoning code and description conflict across sources, favor the most recently updated official layer and emit DataGap status=conflict if unresolved.'
        ]
      }
    ]
  },
  {
    recordType: 'permits',
    description: 'Permit issuance systems and open data feeds for construction permits.',
    preferredPortalTypes: ['permit_portal', 'socrata'],
    endpoints: [
      {
        id: 'permit-system-search',
        label: 'Permit tracking system (Accela/E-TRAKIT/etc.)',
        portalType: 'permit_portal',
        portalUrlTemplate: 'https://{city}.{state}.gov/permits',
        queryInputs: [
          { name: 'address', type: 'string', required: false, example: '123 Main St' },
          { name: 'parcelId', type: 'string', required: false, example: '123-45-678' },
          { name: 'dateRange', type: 'date', required: false, example: '2020-01-01 to 2025-12-31' },
          { name: 'permitType', type: 'string', required: false, example: 'Building' }
        ],
        expectedFields: [
          { name: 'permitId', description: 'Permit identifier', fieldPath: '/permitsAndCode/permits' },
          { name: 'permitType', description: 'Permit type', fieldPath: '/permitsAndCode/permits' },
          { name: 'status', description: 'Permit status', fieldPath: '/permitsAndCode/permits' },
          { name: 'issuedDate', description: 'Issue date', fieldPath: '/permitsAndCode/permits' },
          { name: 'finalDate', description: 'Final/closed date', fieldPath: '/permitsAndCode/permits' },
          { name: 'valuationUsd', description: 'Valuation amount', fieldPath: '/permitsAndCode/permits' },
          { name: 'workDescription', description: 'Work description', fieldPath: '/permitsAndCode/permits' },
          { name: 'contractor', description: 'Contractor name', fieldPath: '/permitsAndCode/permits' }
        ],
        rateLimits: { ...DEFAULT_RATE_LIMIT },
        parsingRules: [
          'Deduplicate permits by permitId; if missing, use address + issuedDate + type hash.',
          'Parse currency and dates to ISO format.',
          'If contractor details are incomplete, keep name only and add DataGap status=partial if critical.'
        ]
      }
    ]
  },
  {
    recordType: 'code_enforcement',
    description: 'Code enforcement and 311-style complaint systems for violations and cases.',
    preferredPortalTypes: ['code_enforcement', 'socrata'],
    endpoints: [
      {
        id: 'code-enforcement-cases',
        label: 'Code enforcement case search',
        portalType: 'code_enforcement',
        portalUrlTemplate: 'https://{city}.{state}.gov/code-enforcement',
        queryInputs: [
          { name: 'address', type: 'string', required: false, example: '123 Main St' },
          { name: 'parcelId', type: 'string', required: false, example: '123-45-678' },
          { name: 'caseId', type: 'string', required: false, example: 'CE-2025-1001' },
          { name: 'dateRange', type: 'date', required: false, example: '2020-01-01 to 2025-12-31' }
        ],
        expectedFields: [
          { name: 'caseId', description: 'Case identifier', fieldPath: '/permitsAndCode/codeViolations' },
          { name: 'status', description: 'Case status', fieldPath: '/permitsAndCode/codeViolations' },
          { name: 'openedDate', description: 'Opened date', fieldPath: '/permitsAndCode/codeViolations' },
          { name: 'resolvedDate', description: 'Resolved date', fieldPath: '/permitsAndCode/codeViolations' },
          { name: 'description', description: 'Violation description', fieldPath: '/permitsAndCode/codeViolations' },
          { name: 'fineUsd', description: 'Fine amount', fieldPath: '/permitsAndCode/codeViolations' }
        ],
        rateLimits: { ...DEFAULT_RATE_LIMIT },
        parsingRules: [
          'Normalize status values (open, closed, in_progress) and preserve raw in notes if needed.',
          'Parse dates to ISO format and choose the most recent status update.',
          'If case identifiers are missing, keep records but mark DataGap status=partial for traceability.'
        ]
      }
    ]
  }
];

export const validateDataSourceContracts = (contracts: DataSourceContract[] = DATA_SOURCE_CONTRACTS) => {
  const errors: string[] = [];
  contracts.forEach((contract, idx) => {
    if (!contract.recordType) errors.push(`contract[${idx}] missing recordType`);
    if (!contract.description) errors.push(`contract[${idx}] missing description`);
    if (!Array.isArray(contract.endpoints) || contract.endpoints.length === 0) {
      errors.push(`contract[${idx}] missing endpoints`);
    } else {
      contract.endpoints.forEach((endpoint, eidx) => {
        if (!endpoint.id) errors.push(`contract[${idx}].endpoints[${eidx}] missing id`);
        if (!endpoint.label) errors.push(`contract[${idx}].endpoints[${eidx}] missing label`);
        if (!endpoint.portalType) errors.push(`contract[${idx}].endpoints[${eidx}] missing portalType`);
        if (!Array.isArray(endpoint.queryInputs)) errors.push(`contract[${idx}].endpoints[${eidx}] missing queryInputs`);
        if (!Array.isArray(endpoint.expectedFields)) errors.push(`contract[${idx}].endpoints[${eidx}] missing expectedFields`);
      });
    }
  });
  return { valid: errors.length === 0, errors };
};
