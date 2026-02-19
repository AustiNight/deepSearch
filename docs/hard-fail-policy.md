# Hard-Fail Policy (Address-Like Topics)

## Scope
This policy applies to address-like topics and overrides the soft-fail behavior defined in `docs/overseer-workflow.md` when critical failures occur.

## Hard-Fail Triggers
A hard-fail is triggered if any of the following conditions are true after evidence recovery and parcel resolution:

1. Parcel ambiguity unresolved
   - Parcel resolution produces multiple plausible parcel candidates and tie-break rules cannot select a single parcel.
   - Required DataGap: `status=ambiguous`, `severity=critical`, `fieldPath=/subject/parcelId`, `reasonCode=parcel_ambiguous`.
2. No authoritative sources
   - `authoritativeSources < MIN_EVIDENCE_AUTHORITATIVE_SOURCES` OR `maxAuthorityScore < MIN_EVIDENCE_AUTHORITY_SCORE` after recovery attempts.
   - Only triggers when the jurisdiction availability matrix marks at least one primary record type as `available`.
   - Required DataGap: `status=missing`, `severity=critical`, `fieldPath=/sources`, `reasonCode=authoritative_sources_missing`.
3. Confidence below minimum
   - Any critical section has `sectionConfidence < 0.40` OR overall critical-section average is `< 0.45`.
   - Critical sections: Parcel & Legal, Ownership/Transfers, Tax & Appraisal.
   - Required DataGap: `status=missing`, `severity=critical`, `fieldPath=/claims`, `reasonCode=confidence_below_minimum`.

## Hard-Fail Decision Rules
- Evaluate hard-fail conditions after evidence recovery and before synthesis. If any trigger is true, set `hardFail=true` and skip normal synthesis.
- If all authoritative record types are `unavailable` or `restricted`, do not hard-fail for missing authoritative sources. Emit `DataGap` entries with `status=unavailable` or `status=restricted` instead.
- Hard-fail overrides soft-fail gating. The report must not claim completeness or show a normal synthesis when hard-fail is active.

## User-Visible Error Report
When a hard-fail occurs, render an error report instead of the standard report. It must include:

- Title: short and direct (example: "Report Unavailable: Critical Data Missing")
- Summary: one or two sentences explaining the primary blocker
- Failures: list of each hard-fail trigger with the user-facing `DataGap.description`
- Evidence pointers: `DataGap.expectedSources` entries with portal URLs/endpoints
- Next steps: actionable remediation (provide parcel ID, verify official portal access, re-run with updated address)

### Error Report Shape (example)
```json
{
  "status": "hard_fail",
  "summary": "We could not complete a reliable property report because the parcel could not be uniquely identified.",
  "failures": [
    {
      "reasonCode": "parcel_ambiguous",
      "message": "Multiple parcel records match the address and a single parcel could not be confirmed.",
      "dataGapIds": ["dg-001"],
      "expectedSources": [
        { "label": "County Assessor", "portalUrl": "https://example.gov/assessor" }
      ]
    }
  ],
  "nextSteps": [
    "Provide a parcel ID or APN if known.",
    "Verify the address format (unit, lot, or suite).",
    "Re-run after confirming the official assessor portal is accessible."
  ]
}
```

## Logging
- Log the hard-fail trigger(s) and associated DataGap IDs.
- Set run status to failed and suppress any "complete" indicators.
