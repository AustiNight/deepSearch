# Data Source Contracts

## Purpose
Define per-record-type source contracts for address-like property research. These contracts capture expected endpoints/portals, query inputs, fields to map into `PropertyDossier`, rate-limit guidance, and parsing rules. They serve as a centralized reference for evidence collection and `DataGap` generation.

Canonical config lives in `data/dataSourceContracts.ts`.

## Record Types Covered
Aligned with primary record types in the jurisdiction availability matrix:
- `assessor_parcel`
- `tax_collector`
- `deed_recorder`
- `zoning_gis`
- `permits`
- `code_enforcement`

## Contract Schema (Summary)
Each `DataSourceContract` includes:
- `recordType`: Primary record type identifier.
- `description`: What the record type represents.
- `preferredPortalTypes`: Ordered list of preferred portal types.
- `endpoints`: One or more `DataSourceEndpointContract` entries.

Each endpoint includes:
- `portalUrlTemplate` or `endpointTemplate`.
- `queryInputs`: Expected query parameters.
- `expectedFields`: Fields and target `PropertyDossier` JSON Pointer paths.
- `rateLimits`: Default throttling guidance.
- `parsingRules`: Normalization and conflict-resolution notes.

## Usage Notes
- Contracts are jurisdiction-agnostic templates and should be resolved to actual portals using the jurisdiction availability matrix.
- If an endpoint requires authentication or payment, mark the source as restricted and emit a `DataGap` with `status=restricted`.
- When conflicts remain after applying parsing rules, leave fields unset and emit a `DataGap` with `status=conflict` or `status=ambiguous`.
