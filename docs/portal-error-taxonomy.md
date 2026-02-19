# Portal Error Taxonomy

This taxonomy standardizes portal/network failures during open-data discovery so they can be surfaced in run metrics and logs.

## Codes

| code | meaning | retryable |
| --- | --- | --- |
| network_error | Network failure reaching portal endpoint | yes |
| invalid_json | Portal response was not valid JSON | no |
| http_401 | HTTP 401 unauthorized | no |
| http_403 | HTTP 403 forbidden | no |
| http_404 | HTTP 404 not found | no |
| http_429 | HTTP 429 rate limited | yes |
| http_500 | HTTP 500 server error | yes |
| http_503 | HTTP 503 service unavailable | yes |
| http_5xx | Other HTTP 5xx server error | yes |
| http_other | Unexpected HTTP status | no |

## Usage

- `services/openDataDiscovery.ts` records portal errors using this taxonomy.
- `services/portalErrorTelemetry.ts` aggregates counts and samples into `runMetrics.portalErrors`.
- `hooks/useOverseer.ts` logs a warning if portal errors are present during a run.
