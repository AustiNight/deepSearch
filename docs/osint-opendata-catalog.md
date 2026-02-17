# OSINT & Open Data Catalog (Phase 1: US Public Sources)

## Purpose
Provide a structured catalog of public-information sources and OSINT techniques, mapped to research verticals and encoded into the taxonomy so they are used in live search.

## Scope & Phasing
- Phase 1 (current): United States public, internet-accessible sources (city/county/state/federal). No login-only or paid data brokers.
- Phase 2 (future): International public sources, per-country equivalents and language localization.
- Phase 3 (future): Specialized or paid sources only when explicitly authorized and legally permitted.

Out of scope for all phases: dark web, leaks, hacked data, or any source that requires bypassing authentication.

## Safety & Ethics Guardrails
- Use only public records and official sources. Do not attempt to obtain or infer sensitive data (SSN, DOB, account numbers, private contact info).
- Avoid doxxing: focus on aggregated context and public-record summaries.
- Respect terms of service, robots directives, and rate limits.
- Prefer official portals and transparent provenance over data brokers.

## Catalog
Each item lists what it is, how it is accessed, typical fields, and the verticals it supports.

| Item | What It Is | Access | Typical Fields | Supports Verticals |
| --- | --- | --- | --- | --- |
| Government Open Data Portals | City/county/state/federal open data hubs | Web portal search, dataset catalogs, API links | Dataset name, description, time range, fields, formats | `location`, `general_discovery` |
| 311 Service Requests | Non-emergency municipal requests | Open data portal datasets | Date/time, category, location, status | `location`, `event` |
| 911/EMS/Fire Calls | Emergency and responder activity logs | Open data portal datasets | Date/time, type, location, disposition | `location`, `event` |
| Code Violations | Municipal code enforcement data | Open data portal, city enforcement pages | Address block, violation type, status, dates | `location` |
| Permits & Inspections | Building/health/food inspections and permits | Open data portal, city/county permit systems | Permit type, status, dates, location | `location`, `medical_subject` |
| Budgets & Finance | City/county budgets and spending | City finance portals, PDFs | Fiscal year, department, line items | `location` |
| Open GIS Layers | Parcel, zoning, boundaries, infrastructure | GIS portals, ArcGIS open data | Layer name, geometry, attributes | `location` |
| Police Blotters | Daily/weekly incident summaries | Police department sites | Incident type, date, summary | `location`, `event` |
| Arrest Logs | Arrest records and summaries | Sheriff/police portals, open data | Name, charge, date, booking | `location`, `legal_matter` |
| Jail Rosters | Current custody lists | Sheriff/county jail sites | Name, booking date, charge | `location`, `legal_matter` |
| Court Calendars | Court schedules and dockets | Court websites | Case ID, parties, hearing dates | `legal_matter`, `event` |
| Incident Dashboards | Public safety dashboards | City/county dashboards | Incident type, time, location | `location`, `event` |
| Assessor/Appraiser Records | Property assessment and ownership | County assessor/appraiser sites | Parcel ID, owner, value, assessments | `individual`, `corporation`, `location` |
| Recorder/Deeds | Recorded property documents | Recorder/registrar sites | Deed type, parties, dates | `individual`, `corporation`, `location` |
| Tax Collector | Property tax payment records | County tax sites | Parcel ID, payment status | `location`, `individual`, `corporation` |
| Business Registries | Entity formation and status | Secretary of State sites | Entity name, status, agents, filing dates | `corporation` |
| Licensing Boards | Professional and occupational licenses | State licensing portals | License type, status, expiration | `individual`, `corporation` |
| Contractor Licensing | Contractor permits/registrations | State/city contractor portals | License status, trade, location | `corporation` |
| Regulatory Filings | Regulatory actions and disclosures | Agency sites, filings databases | Filing date, action type, penalties | `corporation`, `legal_matter` |
| Court Records | Civil/criminal case details | Court search portals | Case number, parties, filings, outcomes | `legal_matter`, `individual` |
| Bankruptcy | Bankruptcy filings and outcomes | Court bankruptcy portals | Case ID, chapter, dates | `legal_matter`, `corporation` |
| Liens & Judgments | Legal encumbrances and judgments | Recorder/court portals | Case/record IDs, amounts, dates | `legal_matter`, `corporation`, `individual` |
| FOIA/Open Records Portals | Records request endpoints | Agency FOIA/open records pages | Request methods, forms, policies | `legal_matter`, `general_discovery` |
| School Board Minutes | Education governance records | School district sites | Meeting dates, agenda items, votes | `location` |
| District Budgets | Education finance data | District finance pages, PDFs | Fiscal year, line items | `location` |
| Campus Crime Logs (Clery) | Campus safety disclosures | University safety pages | Incidents, dates, locations | `location`, `event` |
| Transit Ridership | Transit usage metrics | Transit agency data portals | Ridership counts, dates | `location` |
| Traffic Incidents | Traffic crash or incident feeds | DOT dashboards, open data | Incident type, time, location | `location`, `event` |
| Road Work | Planned road work and closures | DOT/municipal dashboards | Project, dates, locations | `location` |
| FAA/Airport Stats | Aviation activity data | FAA/airport portals | Flights, delays, stats | `location`, `event` |
| Port Authority Data | Maritime activity data | Port authority sites | Vessel calls, cargo metrics | `location` |
| Rail Metrics | Rail activity/coverage data | Rail agency sites | Ridership, delays, coverage | `location` |
| Public Health Dashboards | Disease and health metrics | City/state health dashboards | Cases, rates, geography, time | `medical_subject`, `location` |
| Food/Health Inspections | Inspection scores and violations | City/county health portals | Facility, inspection date, score | `medical_subject`, `location` |
| Environmental Data | Air/water quality and hazards | EPA/state environmental portals | AQI, contaminants, advisories | `location`, `medical_subject` |
| Social/Community Signals | Neighborhood forums and local archives | Local news, community boards | Topics, community sentiment | `location`, `event` |
| Marketplaces & Resale | Product ownership signals | Amazon/eBay/Walmart/Facebook Marketplace/ShopGoodwill | Listing title, price, condition | `product` |
| Public Records Triangulation | Cross-source corroboration | Search operators, multiple portals | Cross-validated identity clues | `individual`, `general_discovery` |
| Address Association | Linking names to public records | Assessor/recorder searches | Owner/parcel associations | `individual`, `location` |
| Identity Graphing | Connecting public affiliations | Registries, affiliations, filings | Org ties, roles, filings | `individual`, `corporation` |
| Advanced Search Operators | OSINT search acceleration | Search engine operators | site/filetype/inurl patterns | `general_discovery`, `technical_concept` |
| Reverse Image Search | Image provenance checks | Reverse search tools | Matching pages, origins | `general_discovery`, `technical_concept` |
| Domain/Host Intelligence | Infrastructure discovery | WHOIS, CRT, host intel tools | Registrant data, subdomains | `technical_concept`, `general_discovery` |

## Vertical Mapping Summary (Taxonomy Integration)
- `location`: open data portals, public safety data, permits/inspections, code violations, education records, transportation, environment.
- `individual`: professional licenses, court records, public record triangulation, address association.
- `corporation`: business registries, contractor/professional licenses, regulatory filings.
- `legal_matter`: court records, bankruptcy, liens/judgments, FOIA/open records.
- `event`: incident records, dashboards, responder logs.
- `medical_subject`: public health dashboards, inspection data, environmental health.
- `product`: marketplace and resale listings.
- `general_discovery`: OSINT tooling, search operators, open data discovery.
- `technical_concept`: OSINT tooling, domain/host intelligence.

## Implementation Notes
- Taxonomy updates are encoded in `data/researchTaxonomy.ts` via new blueprint fields and subtopics:
  - `location`: `open_data_portals`, `education_institutions`, `transportation_infrastructure`, `health_environment`.
  - `individual`: `records_licensing`.
  - `corporation`: `registrations_licenses`.
  - `product`: `marketplaces_resale`.
  - `event`: `incident_records`.
  - `legal_matter`: `court_records`, `records_requests`.
  - `medical_subject`: `public_health_environment`.
  - `general_discovery`: `osint_methods`.
  - `technical_concept`: `osint_tooling`.

## New Verticals
No new verticals are required at Phase 1 because all cataloged sources map cleanly to existing verticals. Revisit if Phase 2/3 introduces categories that do not map to current verticals.
