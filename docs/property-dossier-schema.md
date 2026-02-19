# Property Dossier Schema

Schema version: 1

## Conventions
- Date strings use ISO 8601 format (`YYYY-MM-DD`).
- Date-time strings use ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`).
- Currency values are USD unless otherwise specified.
- `fieldPath` values use JSON Pointer syntax (example: `/taxAppraisal/assessedValueUsd`).

## Source Linkage Rules
- Every non-null `PropertyDossier` field MUST be supported by at least one `ClaimCitation` whose `fieldPath` matches that field.
- `ClaimCitation.citations[].sourceId` MUST exist in `PropertyDossier.sources[].id`.
- Derived values MUST include `ClaimCitation.derivation` and cite all source inputs used in the derivation.
- `DataGap.expectedSources` MUST include a `portalUrl` or `endpoint` when an official source exists.

## PropertyDossier

Root fields

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `schemaVersion` | number | integer | yes | Schema version identifier. |
| `subject` | object | `PropertySubject` | yes | Primary subject for the dossier. |
| `parcel` | object | `ParcelInfo` | no | Parcel and legal details. |
| `ownership` | object | `OwnershipInfo` | no | Ownership and transfer history. |
| `taxAppraisal` | object | `TaxAppraisal` | no | Tax and appraisal details. |
| `zoningLandUse` | object | `ZoningLandUse` | no | Zoning and land use details. |
| `permitsAndCode` | object | `PermitsAndCode` | no | Permits and code enforcement records. |
| `hazardsEnvironmental` | object | `HazardsEnvironmental` | no | Hazard and environmental context. |
| `neighborhoodContext` | object | `NeighborhoodContext` | no | Neighborhood and planning context. |
| `dataGaps` | array | `DataGap[]` | yes | May be empty, but required. |
| `claims` | array | `ClaimCitation[]` | yes | Claim-level citations for all fields. |
| `sources` | array | `CitationSource[]` | yes | Canonical source registry for citations. |

### PropertySubject

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `address` | string | free text | yes | Raw input address string. |
| `normalizedAddress` | string | free text | no | Normalized address string. |
| `jurisdiction` | object | `Jurisdiction` | no | City, county, state, postal code. |
| `geo` | object | `GeoPoint` | no | Geocoded location. |
| `parcelId` | string | free text | no | Resolved parcel identifier. |
| `accountId` | string | free text | no | Assessor or tax account identifier. |

### ParcelInfo

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `parcelId` | string | free text | no | Parcel identifier in primary record system. |
| `accountId` | string | free text | no | Account identifier in assessor or tax system. |
| `situsAddress` | string | free text | no | Situs address from parcel record. |
| `legalDescription` | string | free text | no | Legal description text. |
| `mapReference` | string | free text | no | Map or plat reference. |
| `subdivision` | string | free text | no | Subdivision name if present. |
| `lot` | string | free text | no | Lot identifier. |
| `block` | string | free text | no | Block identifier. |
| `landUseCode` | string | free text | no | Land use code. |
| `landUseDescription` | string | free text | no | Land use description. |
| `lotSize.value` | number | `sq_ft` or `acres` | no | Lot size value. |
| `lotSize.unit` | string | `sq_ft` or `acres` | no | Lot size unit. |
| `buildingAreaSqFt` | number | square feet | no | Building area if available. |
| `yearBuilt` | number | integer year | no | Year built. |
| `unitCount` | number | count | no | Number of units. |

### OwnershipInfo

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `ownerName` | string | free text | no | Current owner name. |
| `ownerType` | string | `individual` `entity` `government` `trust` `unknown` | no | Owner classification. |
| `mailingAddress` | object | `PostalAddress` | no | Owner mailing address. |
| `ownershipStartDate` | string | `YYYY-MM-DD` | no | Start date for current ownership. |
| `lastTransferDate` | string | `YYYY-MM-DD` | no | Last recorded transfer date. |
| `lastTransferPriceUsd` | number | USD | no | Last transfer price. |
| `deedInstrument` | string | free text | no | Deed or instrument identifier. |
| `deedBookPage` | string | free text | no | Book and page reference. |
| `ownershipHistory` | array | `OwnershipTransfer[]` | no | Transfer history list. |

### OwnershipTransfer

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `transferDate` | string | `YYYY-MM-DD` | no | Transfer date. |
| `recordedDate` | string | `YYYY-MM-DD` | no | Recording date. |
| `priceUsd` | number | USD | no | Transfer price. |
| `grantor` | string | free text | no | Grantor name. |
| `grantee` | string | free text | no | Grantee name. |
| `instrument` | string | free text | no | Instrument type or code. |
| `documentId` | string | free text | no | Document identifier. |
| `documentUrl` | string | URL | no | Document URL if public. |

### TaxAppraisal

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `assessmentYear` | number | integer year | no | Assessment year. |
| `assessedValueUsd` | number | USD | no | Assessed value. |
| `marketValueUsd` | number | USD | no | Market value. |
| `landValueUsd` | number | USD | no | Land value. |
| `improvementValueUsd` | number | USD | no | Improvement value. |
| `taxableValueUsd` | number | USD | no | Taxable value. |
| `taxAmountUsd` | number | USD | no | Tax amount due or paid. |
| `taxRatePct` | number | percent | no | Total tax rate. |
| `exemptions` | array | string[] | no | Exemption labels or codes. |
| `taxStatus` | string | free text | no | Payment status or delinquency status. |

### ZoningLandUse

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `zoningCode` | string | free text | no | Zoning code. |
| `zoningDescription` | string | free text | no | Zoning description. |
| `overlayDistricts` | array | string[] | no | Overlay districts. |
| `futureLandUse` | string | free text | no | Future land use plan. |
| `landUseDesignation` | string | free text | no | Current land use designation. |
| `lotCoveragePct` | number | percent | no | Max lot coverage. |
| `far` | number | ratio | no | Floor area ratio. |
| `maxHeightFt` | number | feet | no | Max height. |
| `setbacks.frontFt` | number | feet | no | Front setback. |
| `setbacks.rearFt` | number | feet | no | Rear setback. |
| `setbacks.sideFt` | number | feet | no | Side setback. |

### PermitsAndCode

Permits

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `permitId` | string | free text | no | Permit identifier. |
| `permitType` | string | free text | no | Permit type. |
| `status` | string | free text | no | Permit status. |
| `issuedDate` | string | `YYYY-MM-DD` | no | Issue date. |
| `finalDate` | string | `YYYY-MM-DD` | no | Final or closed date. |
| `valuationUsd` | number | USD | no | Permit valuation. |
| `workDescription` | string | free text | no | Work description. |
| `contractor` | string | free text | no | Contractor name. |

Code Violations

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `caseId` | string | free text | no | Case identifier. |
| `status` | string | free text | no | Case status. |
| `openedDate` | string | `YYYY-MM-DD` | no | Opened date. |
| `resolvedDate` | string | `YYYY-MM-DD` | no | Resolved date. |
| `description` | string | free text | no | Violation description. |
| `fineUsd` | number | USD | no | Fine or penalty amount. |

### HazardsEnvironmental

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `floodZone` | string | free text | no | FEMA flood zone or equivalent. |
| `femaPanel` | string | free text | no | FEMA panel identifier. |
| `floodRiskPercentile` | number | percentile | no | 0 to 100 scale. |
| `wildfireRisk` | string | free text | no | Wildfire risk rating or category. |
| `seismicZone` | string | free text | no | Seismic or earthquake zone. |
| `environmentalSites` | array | `EnvironmentalSite[]` | no | Nearby environmental sites. |

EnvironmentalSite

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `siteName` | string | free text | no | Site name. |
| `program` | string | free text | no | Program or registry (EPA, state). |
| `epaId` | string | free text | no | EPA or registry ID. |
| `distance.value` | number | distance | no | Distance to site. |
| `distance.unit` | string | `ft` `m` `mi` `km` | no | Distance unit. |
| `status` | string | free text | no | Cleanup or listing status. |

### NeighborhoodContext

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `censusTract` | string | free text | no | Census tract identifier. |
| `censusBlockGroup` | string | free text | no | Census block group. |
| `neighborhood` | string | free text | no | Neighborhood name. |
| `schoolDistrict` | string | free text | no | School district. |
| `communityPlanArea` | string | free text | no | Community plan area. |
| `cityCouncilDistrict` | string | free text | no | Local district identifier. |

## DataGap

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `id` | string | free text | yes | Unique identifier. |
| `fieldPath` | string | JSON Pointer | no | Missing field location. |
| `recordType` | string | free text | no | Record type (assessor, tax, deed, zoning). |
| `description` | string | free text | yes | Human readable description of the gap. |
| `reason` | string | free text | yes | Why the gap exists. |
| `expectedSources` | array | `SourcePointer[]` | no | Where the data should be found. |
| `severity` | string | `critical` `major` `minor` `info` | no | Gap severity. |
| `status` | string | `missing` `unavailable` `restricted` `stale` `ambiguous` `conflict` | no | Gap status. |
| `detectedAt` | string | `YYYY-MM-DD` | no | Detection date. |
| `impact` | string | free text | no | Impact on confidence or decisions. |

## ClaimCitation

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `id` | string | free text | yes | Unique identifier. |
| `fieldPath` | string | JSON Pointer | yes | Field being supported. |
| `claim` | string | free text | yes | Short claim statement. |
| `value` | string, number, boolean, null | free text | no | Value asserted by claim. |
| `unit` | string | free text | no | Unit for numeric claims. |
| `confidence` | number | 0 to 1 | no | Claim confidence. |
| `citations` | array | `CitationSourceRef[]` | yes | One or more citations. |
| `derivation` | string | free text | no | Derivation note for computed values. |
| `createdAt` | string | `YYYY-MM-DD` | no | Claim creation date. |

## CitationSource

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `id` | string | free text | yes | Unique identifier. |
| `url` | string | URL | yes | Canonical source URL. |
| `title` | string | free text | no | Page or record title. |
| `publisher` | string | free text | no | Publishing org. |
| `sourceType` | string | taxonomy label | no | Source taxonomy category. |
| `retrievedAt` | string | `YYYY-MM-DDTHH:mm:ssZ` | no | Retrieval timestamp. |
| `sourceUpdatedAt` | string | `YYYY-MM-DD` | no | Source update date when known. |
| `dataCurrency.asOf` | string | `YYYY-MM-DD` | no | Data-as-of date for the underlying record. |
| `dataCurrency.ageDays` | number | days | no | Age in days between `dataCurrency.asOf` and `retrievedAt` (or current date if `retrievedAt` missing). |

## CitationSourceRef

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `sourceId` | string | free text | yes | Reference to `CitationSource.id`. |
| `page` | string | free text | no | Page or sheet reference. |
| `section` | string | free text | no | Section or table reference. |
| `quote` | string | free text | no | Short quote or excerpt. |
| `note` | string | free text | no | Supporting note. |

## SourcePointer

| Field | Type | Units/Format | Required | Notes |
| --- | --- | --- | --- | --- |
| `label` | string | free text | yes | Portal or record system name. |
| `portalUrl` | string | URL | no | Base portal URL. |
| `endpoint` | string | URL or path | no | API or search endpoint. |
| `query` | string | free text | no | Suggested query text. |
| `notes` | string | free text | no | Access notes or instructions. |
