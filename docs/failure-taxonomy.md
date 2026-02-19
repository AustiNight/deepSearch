# Failure Taxonomy

This taxonomy defines standardized failure codes for address-like pipelines. Each failure maps to a `DataGap` entry with consistent `status`, `severity`, and user-visible messaging.

## Usage

- Set `DataGap.reasonCode` to one of the codes below.
- Use `DataGap.description` as the user-visible message.
- Use `DataGap.reason` for internal detail (include provider/attempt notes).

## Failure Codes

| code | Trigger | DataGap.status | DataGap.severity | DataGap.fieldPath | DataGap.recordType | User-visible message |
| --- | --- | --- | --- | --- | --- | --- |
| `geocode_failed` | Geocoder returns no valid point for the normalized address | `missing` | `critical` | `/subject/geo` | `geocode` | Unable to confirm the address location from available geocoders. |
| `parcel_not_found` | Assessor lookup + GIS parcel join return no candidates | `missing` | `critical` | `/subject/parcelId` | `assessor_parcel` | No parcel record matched the address in assessor or GIS sources. |
| `data_unavailable` | Jurisdiction availability matrix marks the record type as unavailable | `unavailable` | `major` | `/subject/parcelId` | `assessor_parcel` | Parcel/assessor records are not publicly available for this jurisdiction. |

## Notes

- `data_unavailable` should include `expectedSources` and any availability evidence (reason/lastChecked) in `DataGap.reason`.
- If geocoding fails, downstream parcel resolution should not claim a parcel not found unless authoritative lookups were attempted.
