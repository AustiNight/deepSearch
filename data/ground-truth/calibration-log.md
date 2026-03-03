# Calibration Log

Track threshold/weight adjustments and metric deltas from each calibration run.

## 2026-03-03
- Change: Seeded ground-truth dataset with 26 labeled assessor/open-data samples (`data.wcad.org` and `datacatalog.cookcountyil.gov`), including 24 resolved and 2 not_found cases.
- Run command: `npm run calibration:open-data`
- Output summary: `data/ground-truth/run-outputs/2026-03-03/calibration-summary-2026-03-03T00-58-58-215Z.json`
- Accuracy: `0.0769` (2/26 pass)
- Notes: All resolved cases predicted `not_found`; indicates relevance/selection and/or compliance gating still blocks parcel resolution on these portals.

## 2026-03-03 (Calibration Diagnostics Mode)
- Change: Enabled calibration diagnostics and public-assessor review-gate relaxation in `resolveParcelFromOpenDataPortal`, and extended calibration CSV outputs with block-reason fields.
- Run command: `npm run calibration:open-data`
- Output summary: `data/ground-truth/run-outputs/2026-03-03/calibration-summary-2026-03-03T01-29-46-424Z.json`
- Accuracy: `0.0769` (2/26 pass)
- Notes: `blockedDatasetCount=0` and `relaxedDatasetCount=0` across all samples; dominant failure reason is geocode failure followed by `parcel_not_found`, indicating current bottleneck is geocoding/query matching rather than compliance gating for this sample set.
