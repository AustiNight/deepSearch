# Ground-Truth Calibration Plan (Address Reports)

## Objective
Calibrate evidence thresholds and confidence scoring for address-like topics so that report coverage, parcel resolution, and confidence tags match reality. This plan targets the thresholds in `constants.ts` and the authority/confidence model in `docs/property-dossier-schema.md`.

## Ground-Truth Dataset
Create a labeled dataset of address samples with authoritative parcel identifiers and expected outcomes. Store in `data/ground-truth/address-samples.csv` (or JSON if preferred).

Required columns:
| Column | Type | Notes |
| --- | --- | --- |
| `sampleId` | string | Stable ID for tracking. |
| `address` | string | Raw input address string. |
| `jurisdiction.city` | string | City from authoritative record. |
| `jurisdiction.county` | string | County from authoritative record. |
| `jurisdiction.state` | string | Two-letter state code. |
| `expectedParcelIds` | string | Pipe-separated list of acceptable parcel IDs after normalization. |
| `expectedStatus` | string | `resolved`, `ambiguous`, or `not_found`. |
| `authoritativeSources` | string | Pipe-separated portal URLs or endpoints used for ground truth. |
| `recordAvailability` | string | Record types expected to be available per jurisdiction matrix. |
| `notes` | string | Edge-case rationale or handling guidance. |

Normalization rules for matching `expectedParcelIds`:
1. Uppercase alphanumerics only (strip spaces, dashes, and punctuation).
2. If county uses multiple parcel ID formats, include each as an acceptable variant.

## Sampling Strategy
Target 60 to 100 samples with coverage across the following categories. Each category should have at least 6 samples.
- Urban single-family
- Suburban single-family
- Rural parcels with large acreage
- Condos or multi-unit with unit numbers
- Multi-parcel addresses (one address maps to multiple parcel IDs)
- New construction (recent permits or parcel splits)
- PO Box or non-physical addresses (expected `not_found`)
- Boundary ambiguity (near parcel or jurisdiction boundary)
- Counties with Socrata portals
- Counties with ArcGIS Feature Services

## Labeling And Expected Outcomes
For each sample, capture authoritative evidence and label expected outcomes.
- `expectedStatus=resolved` requires a single primary parcel ID after normalization.
- `expectedStatus=ambiguous` requires two or more plausible parcel IDs and should yield a `DataGap` with `status=ambiguous`.
- `expectedStatus=not_found` requires no parcel match in authoritative systems and should yield a `DataGap` with `status=missing`.

Expected report behaviors:
- If a record type is marked `unavailable` in `docs/jurisdiction-availability-matrix.md`, the report must emit a `DataGap` with `status=unavailable` and include the `expectedSources` pointer.
- If evidence thresholds are not met (`MIN_EVIDENCE_TOTAL_SOURCES`, `MIN_EVIDENCE_AUTHORITATIVE_SOURCES`, `MIN_EVIDENCE_AUTHORITY_SCORE`), the report must emit a `DataGap` with `status=missing` for the affected field and must not mark the field as covered.

## Rubric
Evaluate each sample on the following rubric. Record per-sample outcomes in `data/ground-truth/calibration-results.csv`.

Parcel Resolution Accuracy:
- Pass: output parcel ID matches any normalized `expectedParcelIds` for `resolved` samples.
- Pass: output includes `DataGap` with `status=ambiguous` for `ambiguous` samples and leaves `parcelId` unset.
- Pass: output includes `DataGap` with `status=missing` for `not_found` samples and leaves `parcelId` unset.
- Fail: any `resolved` output with a parcel ID that does not match expected values.

Evidence Threshold Compliance:
- Pass: fields are only populated when evidence thresholds are met.
- Fail: any populated field that does not meet thresholds, or missing `DataGap` when thresholds are not met.

Confidence Calibration:
- High confidence (`>=0.80`) should be correct at least 90% of the time.
- Medium confidence (`0.60` to `0.79`) should be correct at least 75% of the time.
- Low confidence (`<0.60`) should be correct less than 50% of the time and must show a `DataGap` for missing evidence or conflicts.

## Calibration Workflow
1. Run the address pipeline on the calibration set and store outputs in `data/ground-truth/run-outputs/<date>/`.
2. Compare outputs to ground-truth labels and produce a results table with pass/fail per rubric item.
3. Compute summary metrics:
   - Parcel resolution accuracy rate.
   - Ambiguity handling correctness rate.
   - Evidence threshold false-positive rate.
   - Confidence calibration accuracy by bin.
4. Tune thresholds or weights and re-run until targets are met.

## Tuning Rules
Adjust in this order, one change per iteration:
1. Evidence thresholds in `constants.ts`.
2. Authority score modifiers in `docs/property-dossier-schema.md`.
3. Confidence weightings in `docs/property-dossier-schema.md`.
4. Data currency caps in `docs/property-dossier-schema.md`.

After each adjustment, record changes in `data/ground-truth/calibration-log.md` with:
- Date
- Parameter changed
- Before and after values
- Metric deltas

## Acceptance Targets
- Parcel resolution accuracy >= 90% on the calibration set.
- Ambiguity handling correctness >= 95%.
- Evidence threshold false-positive rate <= 5%.
- Confidence calibration meets bin targets defined above.

## Notes
This plan is designed to be executed without paid providers. Use authoritative public portals as ground truth and include their URLs in `authoritativeSources` for each sample.
