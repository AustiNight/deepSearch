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
| `reasonCode` | string | `DataGapReasonCode` | no | Failure taxonomy code (see `docs/failure-taxonomy.md`). |
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

## Source Taxonomy

`CitationSource.sourceType` must be one of the labels below.

| sourceType | Definition | Canonical examples (US property context) |
| --- | --- | --- |
| `authoritative` | Legal or statutory system of record for the field, with record-level access. | County assessor/CAD parcel record; county tax collector account; recorder/deed index; official zoning GIS; permitting or code enforcement system; FEMA NFHL; EPA registries (ECHO, Superfund). |
| `quasi_official` | Government or regulated entity publishing a mirror, extract, or summary that is not the system of record. | City/county open data portal extracts; state GIS hub layers; regional planning agency datasets; public utility service territory maps; ordinance/plan PDFs. |
| `aggregator` | Third-party compilation, model, or estimate without being the system of record. | Zillow/Redfin/Realtor summaries; parcel aggregators/data brokers; OpenStreetMap-derived layers; commercial risk or valuation models. |
| `social` | User-generated or community-reported content without formal verification. | Reddit threads; Facebook/Nextdoor posts; local forums; X/Twitter threads. |
| `unknown` | Source type cannot be verified from available metadata. | Missing publisher or unclear provenance. |

Mapping rules:
- Assign `authoritative` when the publisher is the system of record for the field and provides record-level access (parcel id, account id, permit id, or registry id).
- Assign `quasi_official` when the publisher is government or regulated but the data is a mirror, extract, or summary of a system of record.
- Assign `aggregator` when the publisher is a third party that merges multiple sources or provides modeled/estimated values without record-level provenance.
- Assign `social` when the content is user-generated or community-sourced.
- For open data portals, use `authoritative` only if the dataset is the system of record; otherwise use `quasi_official`.
- If a page mixes sources, assign `sourceType` per cited record, not per page.
- If provenance cannot be established, set `sourceType` to `unknown` and add a `DataGap` noting missing publisher/provenance.

## Data Currency Policy

Data currency is evaluated per record type using `CitationSource.dataCurrency`. Set `dataCurrency.asOf` to the effective date of the record when available. If missing, fall back to `sourceUpdatedAt`, then `retrievedAt`. `dataCurrency.ageDays` is derived as the age between `dataCurrency.asOf` and `retrievedAt` (or current date if `retrievedAt` is missing).

Recency weighting uses the claim confidence `R` component: `R = clamp(1 - (minAgeDays / maxAgeDays), 0, 1)`. `maxAgeDays` is defined per record type below. When multiple record types can support a field, use the smallest applicable `maxAgeDays` to avoid overstating recency.

Out-of-date handling:
If `dataCurrency.ageDays > maxAgeDays`, add a `DataGap` with `status=stale` for the affected field(s), include the last known `dataCurrency.asOf`, and surface an "Out of date as of YYYY-MM-DD" note in the report. For scoring, set `R = 0` for those claims and cap `confidence` at `0.40` to reflect staleness.

| recordType | Applies to fields | maxAgeDays | Out-of-date handling |
| --- | --- | --- | --- |
| `assessor_parcel` | `/parcel/*`, structural characteristics (year built, building area), parcel land use | 730 | Mark stale if parcel record or assessor roll is older than 2 years. |
| `tax_appraisal` | `/taxAppraisal/assessmentYear`, `/taxAppraisal/assessedValueUsd`, `/taxAppraisal/marketValueUsd`, `/taxAppraisal/landValueUsd`, `/taxAppraisal/improvementValueUsd`, `/taxAppraisal/taxableValueUsd` | 730 | Mark stale if assessment roll older than 2 years. |
| `tax_collector` | `/taxAppraisal/taxAmountUsd`, `/taxAppraisal/taxRatePct`, `/taxAppraisal/taxStatus`, `/taxAppraisal/exemptions` | 540 | Mark stale if tax billing data older than 18 months. |
| `deed_recorder` | `/ownership/*`, `/ownershipHistory/*` | 36500 | Do not mark stale based on transfer date alone. Mark stale only when the recorder dataset update is older than 100 years or explicitly flagged as outdated. |
| `zoning_gis` | `/zoningLandUse/*` | 1095 | Mark stale if zoning GIS or ordinance update older than 3 years. |
| `permits` | `/permitsAndCode/permits/*` | 1825 | For permit records, use the last status update date as `dataCurrency.asOf`. Mark stale if the permitting dataset update is older than 5 years. |
| `code_enforcement` | `/permitsAndCode/codeViolations/*` | 1095 | For violations, use the last status update date. Mark stale if the dataset update is older than 3 years. |
| `hazards_environmental` | `/hazardsEnvironmental/*` | 1825 | Mark stale if registry/GIS updates older than 5 years. |
| `neighborhood_context` | `/neighborhoodContext/*` | 3650 | Mark stale if boundary or Census vintage is older than 10 years. |

## Field-Level Lineage Rules

### Global Precedence and Conflict Resolution
- If a field has a listed authoritative system, that system takes precedence over aggregators, mirrors, or third-party summaries.
- For conflicts within the same precedence tier, prefer the record with the most recent `dataCurrency.asOf`, then `sourceUpdatedAt`, then `retrievedAt`.
- For conflicts where parcel identity is unclear, prefer the record with an exact `parcelId` match; if still ambiguous, do not select a value and add a `DataGap` with `status=ambiguous`.
- For derived values, include `ClaimCitation.derivation` and cite every input used in the derivation.
- If conflicting authoritative values cannot be resolved, keep the highest-precedence value, and add a `DataGap` with `status=conflict`.

### Parcel Resolution Precedence and Tie-Breaks
- Precedence order: assessor/CAD parcel lookup → GIS parcel layer spatial join. Do not override an ambiguous assessor result with GIS.
- When multiple assessor candidates exist, apply deterministic tie-breaks in this order:
  - Exact situs address match to the normalized address variant.
  - Normalized address match (case/format normalized).
  - Presence of a `parcelId` (over account-only matches).
  - Higher candidate confidence score.
- When multiple GIS parcels intersect the address point, do not select any parcel.
- If tie-breaks still yield multiple candidates, leave `/subject/parcelId` unset and add a `DataGap` with `status=ambiguous` referencing the parcel sources.

### PropertyDossier (Root)
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/schemaVersion` | Internal schema constant | Set to schema version | Not applicable. |
| `/subject` | Input + resolution pipeline | Assemble from input, geocode, parcel resolution | If subject is incomplete, add `DataGap` entries for missing subfields. |
| `/parcel` | Assessor/CAD parcel record, then GIS parcel layer | Populate from parcel record and derived geometry | If parcel unresolved, omit and add `DataGap` with `status=ambiguous` or `missing`. |
| `/ownership` | Assessor ownership roll, then recorder/deed index | Populate from ownership roll and deed chain | If conflicting ownership, prefer most recent authoritative record; add `DataGap` on conflict. |
| `/taxAppraisal` | Assessor tax roll, then tax collector | Populate from latest assessment year | Conflicts resolved by latest assessment year. |
| `/zoningLandUse` | Official zoning GIS, then zoning ordinance/plan docs | Map zoning fields from GIS attributes and ordinance references | If GIS/ordinance conflict, prefer most recently updated authoritative source; add `DataGap` if unresolved. |
| `/permitsAndCode` | Official permitting/code systems, then open-data mirrors | Normalize permit/violation records | Dedupe by permit/case id; prefer latest authoritative status. |
| `/hazardsEnvironmental` | Federal/state hazard registries, then local GIS | Spatial join and registry lookups | Prefer authoritative registries; add `DataGap` on conflicts. |
| `/neighborhoodContext` | Official GIS boundaries, then Census | Spatial join based on subject geo | If multiple matches, treat as boundary ambiguity and add `DataGap`. |
| `/dataGaps` | Internal pipeline | Generated from missing/failed checks | Not applicable. |
| `/claims` | Internal pipeline | Generated for every non-null field | Not applicable. |
| `/sources` | Internal pipeline | Generated from citations and provenance | Not applicable. |

### PropertySubject
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/subject/address` | User input | Raw input string | Not applicable. |
| `/subject/normalizedAddress` | Normalization rules | Normalize `/subject/address` using USPS abbreviations and unit handling | If multiple variants, select canonical USPS-style form. |
| `/subject/jurisdiction` | Official boundary GIS, then geocoder admin fields | Spatially join geocode point to boundaries | Prefer boundary GIS over geocoder fields. |
| `/subject/geo` | Parcel centroid, then rooftop geocode, then interpolated geocode | Choose best available geocode with accuracy metadata | Prefer higher precision; if outside parcel, add `DataGap`. |
| `/subject/parcelId` | Assessor/CAD lookup, then GIS parcel join, then tax collector | Resolve parcel from address/geo | If multiple parcel matches, leave unset and add `DataGap` with `status=ambiguous`. |
| `/subject/accountId` | Assessor or tax account record | Map from parcel record | Prefer tax collector if it is the billing account of record. |

### Jurisdiction
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/subject/jurisdiction/city` | Official city boundary GIS | Spatial join to city boundaries | Prefer boundary GIS; if missing, use geocoder. |
| `/subject/jurisdiction/county` | Official county boundary GIS | Spatial join to county boundaries | Prefer boundary GIS; if missing, use geocoder. |
| `/subject/jurisdiction/state` | Official state boundary GIS | Spatial join to state boundaries | Prefer boundary GIS; if missing, use geocoder. |
| `/subject/jurisdiction/postalCode` | USPS/postal boundary data, then geocoder | Spatial join to postal boundaries | Prefer postal boundary source; if missing, use geocoder. |
| `/subject/jurisdiction/country` | Boundary GIS, then geocoder | Spatial join or parse from input | Prefer boundary GIS; if missing, use geocoder. |

### GeoPoint
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/subject/geo/lat` | Parcel centroid, then rooftop geocode | Extract latitude | Prefer higher-accuracy geocode. |
| `/subject/geo/lon` | Parcel centroid, then rooftop geocode | Extract longitude | Prefer higher-accuracy geocode. |
| `/subject/geo/accuracyMeters` | Geocoder metadata | Map from geocoder or parcel centroid precision | Prefer source-provided accuracy; otherwise estimate. |

### ParcelInfo
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/parcel/parcelId` | Assessor/CAD parcel record | Copy from authoritative parcel record | If mismatch, prefer CAD/assessor record. |
| `/parcel/accountId` | Assessor or tax account record | Copy from authoritative account record | Prefer tax collector account if billing-focused; otherwise assessor. |
| `/parcel/situsAddress` | Assessor parcel roll, then GIS parcel layer | Copy from parcel record | Prefer assessor roll; if conflict, choose normalized address match. |
| `/parcel/legalDescription` | Recorder/deed, then assessor | Copy legal description | Prefer most recent recorded deed. |
| `/parcel/mapReference` | Assessor/CAD, then GIS parcel layer | Copy map/plat reference | Prefer assessor/CAD. |
| `/parcel/subdivision` | Recorded plat, then assessor | Copy subdivision | Prefer recorded plat. |
| `/parcel/lot` | Recorded plat, then assessor | Copy lot identifier | Prefer recorded plat. |
| `/parcel/block` | Recorded plat, then assessor | Copy block identifier | Prefer recorded plat. |
| `/parcel/landUseCode` | Assessor land use code | Copy code | Prefer assessor code over inferred zoning. |
| `/parcel/landUseDescription` | Assessor description, then code table | Map code to description if missing | Prefer assessor-provided description. |
| `/parcel/lotSize/value` | Assessor lot size, then GIS parcel area | Convert area to value | Prefer assessor; if GIS used, convert to `sq_ft` or `acres`. |
| `/parcel/lotSize/unit` | Assessor lot size unit, then derived | Derive unit from source or conversion | Prefer original unit; if derived, use `sq_ft`. |
| `/parcel/buildingAreaSqFt` | Assessor improvements, then building footprint dataset | Normalize to square feet | Prefer assessor; if GIS, sum footprint areas. |
| `/parcel/yearBuilt` | Assessor, then permit records | Use earliest known construction year | Prefer assessor; if only permits, use earliest permit issue year with new construction. |
| `/parcel/unitCount` | Assessor, then permit/occupancy data | Copy unit count | Prefer assessor; if permit data used, pick latest verified occupancy. |

### OwnershipInfo
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/ownership/ownerName` | Assessor ownership roll, then recorder/deed | Copy owner name | Prefer most recent authoritative record; if multiple, keep assessor format. |
| `/ownership/ownerType` | Assessor classification, then derived from name | Classify owner based on source or heuristics | Prefer assessor classification; otherwise derived with explanation in derivation. |
| `/ownership/mailingAddress` | Assessor or tax mailing address | Normalize to PostalAddress | Prefer tax collector if explicitly marked as billing. |
| `/ownership/ownershipStartDate` | Recorder/deed, then assessor | Use deed recording date for current owner | Prefer recorder; if missing, assessor ownership start. |
| `/ownership/lastTransferDate` | Recorder/deed, then assessor | Use most recent transfer date | Prefer recorder. |
| `/ownership/lastTransferPriceUsd` | Recorder/deed, then assessor | Use price from most recent transfer | Prefer recorder. |
| `/ownership/deedInstrument` | Recorder/deed | Copy instrument type/code | Prefer recorder. |
| `/ownership/deedBookPage` | Recorder/deed | Copy book/page reference | Prefer recorder. |
| `/ownership/ownershipHistory` | Recorder/deed index, then assessor history | Build transfer list sorted by date | Dedupe by document id + date; prefer recorder for duplicates. |

### PostalAddress (Ownership Mailing Address)
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/ownership/mailingAddress/address1` | Assessor/tax mailing address | Parse address line 1 | Prefer tax collector if billing. |
| `/ownership/mailingAddress/address2` | Assessor/tax mailing address | Parse address line 2 | Prefer tax collector if billing. |
| `/ownership/mailingAddress/city` | Assessor/tax mailing address | Parse city | Prefer tax collector if billing. |
| `/ownership/mailingAddress/county` | Assessor/tax mailing address | Parse county | Prefer tax collector if billing. |
| `/ownership/mailingAddress/state` | Assessor/tax mailing address | Parse state | Prefer tax collector if billing. |
| `/ownership/mailingAddress/postalCode` | Assessor/tax mailing address | Parse postal code | Prefer tax collector if billing. |
| `/ownership/mailingAddress/country` | Assessor/tax mailing address | Parse country if present | Prefer tax collector if billing. |

### OwnershipTransfer
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/ownership/ownershipHistory[].transferDate` | Recorder/deed, then assessor | Copy transfer date | Prefer recorder. |
| `/ownership/ownershipHistory[].recordedDate` | Recorder/deed | Copy recorded date | Prefer recorder. |
| `/ownership/ownershipHistory[].priceUsd` | Recorder/deed, then assessor | Copy transfer price | Prefer recorder. |
| `/ownership/ownershipHistory[].grantor` | Recorder/deed | Copy grantor | Prefer recorder. |
| `/ownership/ownershipHistory[].grantee` | Recorder/deed | Copy grantee | Prefer recorder. |
| `/ownership/ownershipHistory[].instrument` | Recorder/deed | Copy instrument type | Prefer recorder. |
| `/ownership/ownershipHistory[].documentId` | Recorder/deed | Copy document id | Prefer recorder. |
| `/ownership/ownershipHistory[].documentUrl` | Recorder/deed | Copy public document URL | Prefer recorder; omit if restricted. |

### TaxAppraisal
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/taxAppraisal/assessmentYear` | Assessor roll, then tax collector | Select latest available year | Prefer latest year with complete values. |
| `/taxAppraisal/assessedValueUsd` | Assessor roll | Copy assessed value for selected year | Prefer value aligned to `assessmentYear`. |
| `/taxAppraisal/marketValueUsd` | Assessor roll | Copy market value for selected year | Prefer value aligned to `assessmentYear`. |
| `/taxAppraisal/landValueUsd` | Assessor roll | Copy land value for selected year | Prefer value aligned to `assessmentYear`. |
| `/taxAppraisal/improvementValueUsd` | Assessor roll | Copy improvement value for selected year | Prefer value aligned to `assessmentYear`. |
| `/taxAppraisal/taxableValueUsd` | Assessor roll, then tax collector | Copy taxable value for selected year | Prefer assessor if consistent with exemptions. |
| `/taxAppraisal/taxAmountUsd` | Tax collector, then assessor | Copy tax amount for latest bill | Prefer tax collector. |
| `/taxAppraisal/taxRatePct` | Tax collector, then assessor | Compute from levy or rate data | Prefer tax collector; if derived, include derivation. |
| `/taxAppraisal/exemptions` | Assessor roll | Normalize exemption codes to labels | Prefer assessor; if multiple sources, union unique codes for same year. |
| `/taxAppraisal/taxStatus` | Tax collector | Copy payment or delinquency status | Prefer tax collector; if missing, omit. |

### ZoningLandUse
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/zoningLandUse/zoningCode` | Official zoning GIS, then ordinance text | Copy zoning code | Prefer GIS; if multiple codes, choose parcel-intersecting primary zone. |
| `/zoningLandUse/zoningDescription` | Zoning ordinance/legend | Map zoning code to description | Prefer ordinance description; if missing, GIS label. |
| `/zoningLandUse/overlayDistricts` | Official GIS overlays | List overlays intersecting parcel | Prefer GIS overlays; dedupe by code. |
| `/zoningLandUse/futureLandUse` | Official future land use map | Map from plan layer | Prefer latest adopted plan. |
| `/zoningLandUse/landUseDesignation` | Official land use map | Map from land use layer | Prefer GIS land use layer. |
| `/zoningLandUse/lotCoveragePct` | Zoning ordinance | Extract numeric standard | Prefer ordinance; if multiple, choose most restrictive. |
| `/zoningLandUse/far` | Zoning ordinance | Extract FAR standard | Prefer ordinance; if multiple, choose most restrictive. |
| `/zoningLandUse/maxHeightFt` | Zoning ordinance | Extract height standard | Prefer ordinance; if multiple, choose most restrictive. |
| `/zoningLandUse/setbacks/frontFt` | Zoning ordinance | Extract front setback | Prefer ordinance; if multiple, choose most restrictive. |
| `/zoningLandUse/setbacks/rearFt` | Zoning ordinance | Extract rear setback | Prefer ordinance; if multiple, choose most restrictive. |
| `/zoningLandUse/setbacks/sideFt` | Zoning ordinance | Extract side setback | Prefer ordinance; if multiple, choose most restrictive. |

### PermitsAndCode
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/permitsAndCode/permits` | Official permit system, then open-data mirror | Normalize permit records | Dedupe by `permitId`; prefer authoritative status. |
| `/permitsAndCode/codeViolations` | Official code enforcement system, then open-data mirror | Normalize violation records | Dedupe by `caseId`; prefer authoritative status. |

### PermitRecord
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/permitsAndCode/permits[].permitId` | Official permit system | Copy permit id | Prefer official system. |
| `/permitsAndCode/permits[].permitType` | Official permit system | Copy permit type | Prefer official system. |
| `/permitsAndCode/permits[].status` | Official permit system | Use most recent status update | Prefer record with latest update date. |
| `/permitsAndCode/permits[].issuedDate` | Official permit system | Copy issue date | Prefer earliest issue date for same permit id. |
| `/permitsAndCode/permits[].finalDate` | Official permit system | Copy final/closed date | Prefer latest final date for same permit id. |
| `/permitsAndCode/permits[].valuationUsd` | Official permit system | Normalize valuation | Prefer official system; if multiple, choose latest update. |
| `/permitsAndCode/permits[].workDescription` | Official permit system | Copy work description | Prefer official system; if multiple, choose most detailed. |
| `/permitsAndCode/permits[].contractor` | Official permit system | Copy contractor name | Prefer official system; if multiple, choose latest update. |

### CodeViolation
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/permitsAndCode/codeViolations[].caseId` | Official code enforcement system | Copy case id | Prefer official system. |
| `/permitsAndCode/codeViolations[].status` | Official code enforcement system | Use most recent status update | Prefer record with latest update date. |
| `/permitsAndCode/codeViolations[].openedDate` | Official code enforcement system | Copy opened date | Prefer earliest opened date. |
| `/permitsAndCode/codeViolations[].resolvedDate` | Official code enforcement system | Copy resolved date | Prefer latest resolved date. |
| `/permitsAndCode/codeViolations[].description` | Official code enforcement system | Copy violation description | Prefer official system; if multiple, choose most detailed. |
| `/permitsAndCode/codeViolations[].fineUsd` | Official code enforcement system | Normalize fine amount | Prefer official system; if multiple, choose latest update. |

### HazardsEnvironmental
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/hazardsEnvironmental/floodZone` | FEMA NFHL, then local floodplain GIS | Spatial join to flood layer | Prefer FEMA; if local is newer and FEMA missing, use local with note. |
| `/hazardsEnvironmental/femaPanel` | FEMA NFHL | Copy panel id | Prefer FEMA. |
| `/hazardsEnvironmental/floodRiskPercentile` | Official risk dataset, then reputable risk model | Normalize to 0-100 scale | Prefer authoritative dataset; if model-based, include derivation. |
| `/hazardsEnvironmental/wildfireRisk` | State forestry agency, then federal datasets | Map risk category | Prefer state agency; if multiple, choose most recent. |
| `/hazardsEnvironmental/seismicZone` | USGS or state geological survey | Map seismic zone | Prefer USGS; if state provides higher resolution, prefer state. |
| `/hazardsEnvironmental/environmentalSites` | EPA/state registries, then local GIS | Spatial join and registry lookup | Dedupe by `epaId` or site name; prefer authoritative registry. |

### EnvironmentalSite
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/hazardsEnvironmental/environmentalSites[].siteName` | EPA/state registry | Copy site name | Prefer authoritative registry. |
| `/hazardsEnvironmental/environmentalSites[].program` | EPA/state registry | Copy program | Prefer authoritative registry. |
| `/hazardsEnvironmental/environmentalSites[].epaId` | EPA/state registry | Copy registry id | Prefer authoritative registry. |
| `/hazardsEnvironmental/environmentalSites[].distance/value` | Derived from subject geo + site geo | Compute distance | Prefer higher-precision coordinates. |
| `/hazardsEnvironmental/environmentalSites[].distance/unit` | Derived | Use `ft` for local, `mi` for regional | Standardize units; prefer `ft` when distance < 1 mile. |
| `/hazardsEnvironmental/environmentalSites[].status` | EPA/state registry | Copy site status | Prefer authoritative registry. |

### NeighborhoodContext
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/neighborhoodContext/censusTract` | Census TIGER/Line | Spatial join from subject geo | Prefer Census boundary; if near boundary, add `DataGap` with `status=ambiguous`. |
| `/neighborhoodContext/censusBlockGroup` | Census TIGER/Line | Spatial join from subject geo | Prefer Census boundary; if near boundary, add `DataGap` with `status=ambiguous`. |
| `/neighborhoodContext/neighborhood` | Official city neighborhood GIS | Spatial join from subject geo | Prefer official GIS; if none, omit. |
| `/neighborhoodContext/schoolDistrict` | Official school district GIS | Spatial join from subject geo | Prefer official GIS; if none, omit. |
| `/neighborhoodContext/communityPlanArea` | Official planning GIS | Spatial join from subject geo | Prefer official GIS; if none, omit. |
| `/neighborhoodContext/cityCouncilDistrict` | Official city council GIS | Spatial join from subject geo | Prefer official GIS; if none, omit. |

### DataGap (Embedded)
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/dataGaps[].id` | Internal pipeline | Generated id | Not applicable. |
| `/dataGaps[].fieldPath` | Internal pipeline | Derived from missing field path | Not applicable. |
| `/dataGaps[].recordType` | Internal pipeline | Derived from expected record type | Not applicable. |
| `/dataGaps[].description` | Internal pipeline | Generated from validation | Not applicable. |
| `/dataGaps[].reason` | Internal pipeline | Generated from failure taxonomy | Not applicable. |
| `/dataGaps[].reasonCode` | Internal pipeline | Failure taxonomy code (see `docs/failure-taxonomy.md`) | Not applicable. |
| `/dataGaps[].expectedSources` | Internal pipeline | Populated from known portals | Not applicable. |
| `/dataGaps[].severity` | Internal policy | Derived from impact rules | Not applicable. |
| `/dataGaps[].status` | Internal policy | Set from failure state | Not applicable. |
| `/dataGaps[].detectedAt` | Internal pipeline | Set at detection time | Not applicable. |
| `/dataGaps[].impact` | Internal pipeline | Generated from validation | Not applicable. |

### ClaimCitation (Embedded)
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/claims[].id` | Internal pipeline | Generated id | Not applicable. |
| `/claims[].fieldPath` | Internal pipeline | Set to field being supported | Not applicable. |
| `/claims[].claim` | Internal pipeline | Generated claim text | Not applicable. |
| `/claims[].value` | Derived from field value | Copy field value | Not applicable. |
| `/claims[].unit` | Derived from field metadata | Use field unit if numeric | Not applicable. |
| `/claims[].confidence` | Internal scoring | Set from scoring model | Not applicable. |
| `/claims[].citations` | Internal pipeline | Link to sources used | Not applicable. |
| `/claims[].derivation` | Internal pipeline | Describe derivation when computed | Not applicable. |
| `/claims[].createdAt` | Internal pipeline | Set at creation time | Not applicable. |

### CitationSource (Embedded)
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/sources[].id` | Internal pipeline | Generated id | Not applicable. |
| `/sources[].url` | Source metadata | Canonical source URL | If multiple URLs for same source, prefer canonical portal URL. |
| `/sources[].title` | Source metadata | Page or record title | Prefer official title if available. |
| `/sources[].publisher` | Source metadata | Publishing org | Prefer official publisher name. |
| `/sources[].sourceType` | Internal taxonomy | Map source to taxonomy | Not applicable. |
| `/sources[].retrievedAt` | Internal pipeline | Set at fetch time | Not applicable. |
| `/sources[].sourceUpdatedAt` | Source metadata | Copy update date if available | Prefer explicit source update date. |
| `/sources[].dataCurrency/asOf` | Source metadata | Copy record as-of date | Prefer explicit record date. |
| `/sources[].dataCurrency/ageDays` | Derived | Compute from `retrievedAt` and `dataCurrency.asOf` | Recompute if either input changes. |

### CitationSourceRef (Embedded)
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/claims[].citations[].sourceId` | Internal pipeline | Link to `/sources[].id` | Not applicable. |
| `/claims[].citations[].page` | Source metadata | Copy page reference if known | Prefer authoritative pagination. |
| `/claims[].citations[].section` | Source metadata | Copy section reference if known | Prefer authoritative section label. |
| `/claims[].citations[].quote` | Source metadata | Short excerpt if available | Prefer primary source quote. |
| `/claims[].citations[].note` | Internal pipeline | Supporting note | Not applicable. |

### SourcePointer (Embedded)
| Field | Source precedence | Derivation steps | Conflict resolution |
| --- | --- | --- | --- |
| `/dataGaps[].expectedSources[].label` | Internal pipeline | Portal/system name | Not applicable. |
| `/dataGaps[].expectedSources[].portalUrl` | Internal registry | Base portal URL | Prefer authoritative portal. |
| `/dataGaps[].expectedSources[].endpoint` | Internal registry | API/search endpoint | Prefer official endpoint. |
| `/dataGaps[].expectedSources[].query` | Internal pipeline | Suggested query text | Not applicable. |
| `/dataGaps[].expectedSources[].notes` | Internal pipeline | Access notes | Not applicable. |

## Authority And Confidence Scoring

### Authority Score (Per Source)

Scale: `authorityScore` is 0 to 100.

Base score by `CitationSource.sourceType`:

| sourceType | Base score |
| --- | --- |
| `authoritative` | 90 |
| `quasi_official` | 70 |
| `aggregator` | 50 |
| `social` | 20 |
| `unknown` | 35 |

Modifiers:

| Condition | Adjustment |
| --- | --- |
| Official government domain or verified government portal | +5 |
| Primary record system for the record type (assessor, tax collector, recorder, zoning GIS, permits, code enforcement) | +5 |
| Record-level access with parcel identifiers and update timestamps | +5 |
| Rehosted or mirrored data without a canonical record link | -10 |
| Paywalled aggregation without record provenance | -10 |
| User-generated or anonymous content | -15 |
| Publisher missing or unverified | -5 |

Formula:

`authorityScore = clamp(baseScore + sum(adjustments), 0, 100)`

### Claim Confidence (Per Field Claim)

Scale: `confidence` is 0 to 1 and stored on each `ClaimCitation`.

Definitions:

`A` (authority component) = `max(authorityScore_i) / 100` across citations for the claim.

`R` (recency component) = `clamp(1 - (minAgeDays / maxAgeDays), 0, 1)`

`minAgeDays` is the minimum `dataCurrency.ageDays` across citations.

`maxAgeDays` is defined by the data currency policy for the record type.

If all citations lack `dataCurrency`, set `R = 0.5`.

`C` (corroboration component) based on distinct publishers or domains:

| Independent sources | `C` |
| --- | --- |
| 1 | 0.35 |
| 2 | 0.70 |
| 3+ | 1.00 |

`S` (consistency component) from `DataGap` status for the field:

| Status | `S` |
| --- | --- |
| No conflict or ambiguity | 1.00 |
| `status=conflict` or `status=ambiguous` but resolved | 0.50 |
| Unresolved conflict or ambiguous identity | 0.00 |

Formula:

`confidence = clamp(0.50*A + 0.25*R + 0.15*C + 0.10*S, 0, 1)`

### Section Confidence (Per Report Section)

Scale: 0 to 1.

`sectionConfidence = average(confidence)` across all `ClaimCitation` entries whose `fieldPath` falls under the section.

If a section has zero claims, `sectionConfidence = 0`.
