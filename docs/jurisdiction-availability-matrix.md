# Jurisdiction Availability Matrix

## Purpose
Define which primary public-record systems are available per jurisdiction so coverage checks can differentiate "missing" from explicitly "unavailable". This matrix is the source of truth for record availability and is referenced when generating `DataGap` entries.

Canonical config lives in `data/jurisdictionAvailability.ts`.

## Primary Record Types
These align with `recordType` values used in `PropertyDossier` and `DataGap` entries:
- `assessor_parcel` (CAD/assessor/parcel system of record)
- `tax_collector`
- `deed_recorder`
- `zoning_gis`
- `permits`
- `code_enforcement`

## Availability Status Semantics
- `available`: Public, record-level access exists (portal/API). `portalUrl` or `statementUrl` must be recorded.
- `restricted`: Records exist but access requires login, payment, or authorized access. Include restriction details.
- `partial`: Public access exists but coverage is incomplete (limited years, subset of municipality, or partial fields). Include `coverageNotes`.
- `unknown`: Not yet verified. Treated as missing until checked.
- `unavailable`: Explicitly verified as unavailable to the public in this jurisdiction.

### "Unavailable" Requirements
Only set `status=unavailable` when there is explicit confirmation that no public access exists for the record type in that jurisdiction. This must include:
- `unavailableReason` (one of `no_public_access`, `not_digitized`, `requires_in_person`, `paid_only`, `not_collected`, `not_applicable`, `temporary_outage`)
- `lastChecked` date
- Evidence (`statementUrl`, `portalUrl`, or a documented note)

When `status=unavailable`, emit a `DataGap` with `status=unavailable` and `recordType` for the missing record, and include the evidence pointer in `expectedSources`.

## Matrix Schema (Summary)
Each jurisdiction entry includes:
- `id`: Stable string key (e.g., `US-CA-LosAngelesCounty`).
- `jurisdiction`: `{ country, state, county, city }`.
- `records`: Map of `PrimaryRecordType` to `RecordAvailability`.
- `notes`: Free-text notes.

## Example (Illustrative Only)
```ts
{
  id: 'US-CA-ExampleCounty',
  jurisdiction: { country: 'US', state: 'CA', county: 'Example' },
  records: {
    assessor_parcel: { status: 'available', evidence: { portalUrl: 'https://example.gov/assessor' } },
    tax_collector: { status: 'restricted', reason: 'Login required' },
    deed_recorder: { status: 'available', evidence: { portalUrl: 'https://example.gov/recorder' } },
    zoning_gis: { status: 'partial', coverageNotes: 'City parcels only' },
    permits: { status: 'unknown' },
    code_enforcement: { status: 'unavailable', unavailableReason: 'not_digitized', lastChecked: '2026-02-19' }
  }
}
```

## Usage Notes
- Keep `unknown` as the default until verified.
- Prefer county-level entries for assessor, tax, and recorder systems, and city-level entries for zoning/permits/code where applicable.
- When both county and city entries exist, choose the most specific matching jurisdiction.
- Update `lastChecked` whenever the record availability is re-verified.
