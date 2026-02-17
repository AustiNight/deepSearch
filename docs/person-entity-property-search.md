# Person/Entity Property Search Expansion & Migration Heuristics

## Purpose
Expand person/entity property searches to include primary locations and surrounding cities/counties using migration-informed tiers. Prioritize official appraisal/assessor, recorder, and parcel/GIS tools, and apply privacy guardrails.

## Data Sources Used
- U.S. Census Bureau press release on 2010 movers by county/state (same county, different county in-state, different state): https://www.census.gov/newsroom/releases/archives/mobility_of_the_population/cb11-91.html
- U.S. Census Bureau CPS report on 5-year mobility (2005–2010), including mover rate and move types: https://www.census.gov/library/publications/2012/demo/p20-567.html
- U.S. Census Bureau guidance on County-to-County Migration Flows (ACS/PRCS): https://www.census.gov/topics/population/migration/guidance/county-to-county-migration-flows.html
- IRS SOI Migration Data (county/state inflows/outflows, 1991–2022): https://www.irs.gov/statistics/soi-tax-stats-migration-data
- Texas Comptroller Property Tax Assistance guidance (local appraisal district or tax assessor-collector): https://comptroller.texas.gov/taxes/property-tax/ and https://comptroller.texas.gov/taxes/property-tax/contact.php
- USGS National Map Corps guidance on parcel viewers and county-level sources: https://www.usgs.gov/core-science-systems/ngp/tnm-corps/authoritative-source-parcel-viewer
- Example county assessor public records access (Sacramento County): https://assessor.saccounty.gov/us/en/maps-property-data-and-records/assessor-records.html
- Example county Register of Deeds (Mecklenburg County) describing official real property records: https://deeds.mecknc.gov/services/real-estate-records
- NCTCOG 16-county region map (Dallas-Fort Worth regional counties): https://www.nctcog.org/docs/default-source/about/nctcog_16countyregion.pdf

## CAD vs Assessor/Collector Decision Rule
- Texas: prioritize Central Appraisal District (CAD) / appraisal district for property appraisal and ownership lookups, then tax assessor-collector for collections and tax payment context. Texas Comptroller guidance directs appraisal and tax questions to local appraisal districts or tax assessor-collectors.
- Non-Texas: prioritize county assessor or property appraiser for assessment/ownership data, then tax collector and recorder/register of deeds for deed/recorded documents.

## Migration-Informed Expansion Heuristic
Principle: most movers relocate within the same county or nearby counties; longer horizons expand to metro/regional and statewide/state-to-state flows.

Evidence snapshots:
- 2010 movers: 69.3% stayed within the same county; 16.7% moved to a different county in the same state; 11.5% moved to a different state (Census CPS release).
- 2005–2010 5-year CPS: mover rate 35.4%; among movers, 61.0% stayed within the same county (Census P20-567).

Time horizon tiers (apply in order; stop when adequate coverage is reached):
1. 1-year: Primary city + primary county. (Most moves occur within the same county; CPS shows large majorities within-county among movers.)
2. 5-year: Add metro/adjacent counties within the same metro/COG footprint. (CPS 5-year mobility shows a 35.4% mover rate and 61% of movers within the same county; remaining moves are mostly in-state.)
3. 10-year: Add remaining counties in the metro region and immediate adjacent counties; use ACS county-to-county flows to prioritize top origin/destination counties.
4. 15-year: Expand statewide and to adjacent states with strong IRS migration flows.
5. 25-year: Expand to the broader Census region (e.g., South/West) and top IRS state-to-state flows.
6. 50-year: Nationwide coverage, prioritizing historic migration hubs and the person’s known prior locations.
7. Lifetime: Nationwide + place-of-birth/long-term residence states when available.

Caps to avoid query explosion:
- Max counties per expansion tier: 18
- Max cities per expansion tier: 14
- Prioritize counties by metro core, then regional council footprint, then adjacent counties.

Implementation mapping:
- Tier 1 uses `countyPrimary`
- Tier 2 uses `countyMetro`
- Tier 3 uses `countyRegion`

## Dallas-Fort Worth (DFW) Expansion List
Based on the NCTCOG 16-county region map, the DFW expansion counties are:
- Dallas
- Tarrant
- Collin
- Denton
- Ellis
- Hunt
- Johnson
- Kaufman
- Parker
- Rockwall
- Wise
- Erath
- Navarro
- Palo Pinto
- Hood
- Somervell

## Search Tooling Notes (Public Records Only)
- County appraisal/assessor/property appraiser systems: typically host assessment and ownership info.
- Recorder/Register of Deeds: official repository for recorded real estate documents (deeds, mortgages, plats).
- Parcel/GIS viewers: county-level GIS/parcel tools often provide parcel boundaries and ownership fields; use as secondary sources and corroborate.

## Privacy/Safety Guardrails
- Use only public records and official sources; do not attempt to obtain or infer sensitive data (SSN, DOB, financial account numbers, private contact info).
- Avoid doxxing: focus on ownership/assessment history and public filings, not private personal details.
- Do not aggregate sensitive fields across sources for profiling; keep outputs at the public-records summary level.

## Implementation Touchpoints
- Location parsing + expansion logic: `hooks/useOverseer.ts` builds `cityExpanded`, `cityMetro`, `countyPrimary`, `countyMetro`, `countyRegion`, and property authority term slots.
- Person/Entity and Location tactics: `data/researchTaxonomy.ts` (Assets & Property, Parcel/Real Estate) uses tiered county slots plus CAD/assessor tool discovery queries.
