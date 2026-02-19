import { TAXONOMY_UPDATED_EVENT } from '../constants';

export type ResearchVerticalId = string;

export type TaxonomyProvenanceSource = 'seed' | 'agent_proposal' | 'overseer_vet' | 'manual';

export interface TaxonomyProvenance {
  source: TaxonomyProvenanceSource;
  timestamp: number;
  topic?: string;
  agentId?: string;
  agentName?: string;
  runId?: string;
  note?: string;
}

export interface ResearchTacticTemplate {
  id: string;
  template: string;
  notes?: string;
  provenance?: TaxonomyProvenance[];
}

export interface ResearchMethod {
  id: string;
  label: string;
  description?: string;
  tactics: ResearchTacticTemplate[];
}

export interface ResearchSubtopic {
  id: string;
  label: string;
  description?: string;
  methods: ResearchMethod[];
  provenance?: TaxonomyProvenance[];
}

export interface ResearchVertical {
  id: ResearchVerticalId;
  label: string;
  description?: string;
  blueprintFields: string[];
  subtopics: ResearchSubtopic[];
  provenance?: TaxonomyProvenance[];
}

export interface ResearchTaxonomy {
  version: number;
  updatedAt: number;
  verticals: ResearchVertical[];
}

export interface ExpandedTactic {
  id: string;
  template: string;
  query: string;
  slots: Record<string, string>;
  unresolvedSlots: string[];
  verticalId: string;
  subtopicId: string;
  methodId: string;
  provenance?: TaxonomyProvenance[];
}

export interface TacticExpansionOptions {
  allowUnresolved?: boolean;
}

export interface TaxonomyProposalBundle {
  tactics?: Array<{
    verticalId: string;
    subtopicId: string;
    methodId?: string;
    template: string;
    notes?: string;
  }>;
  subtopics?: Array<{
    verticalId: string;
    id?: string;
    label: string;
    description?: string;
    methods?: Array<{
      id?: string;
      label?: string;
      description?: string;
      tactics?: Array<{ template: string; notes?: string }>;
    }>;
    tactics?: Array<{ template: string; notes?: string }>;
  }>;
  verticals?: Array<{
    id?: string;
    label: string;
    description?: string;
    blueprintFields?: string[];
    subtopics?: Array<{
      id?: string;
      label: string;
      description?: string;
      methods?: Array<{
        id?: string;
        label?: string;
        description?: string;
        tactics?: Array<{ template: string; notes?: string }>;
      }>;
      tactics?: Array<{ template: string; notes?: string }>;
    }>;
  }>;
}

export interface TaxonomyVettingResult {
  accepted: number;
  rejected: number;
  acceptedItems: string[];
  rejectedItems: Array<{ item: string; reason: string }>;
}

export const TAXONOMY_VERSION = 1;
export const TAXONOMY_STORAGE_KEY = 'overseer_taxonomy_growth_v1';
export const DEFAULT_METHOD_ID = 'search';

const SEED_PROVENANCE: TaxonomyProvenance = {
  source: 'seed',
  timestamp: 0,
  note: 'initial taxonomy seed'
};

const tactic = (id: string, template: string, notes?: string): ResearchTacticTemplate => ({
  id,
  template,
  notes,
  provenance: [SEED_PROVENANCE]
});

const method = (id: string, label: string, tactics: ResearchTacticTemplate[], description?: string): ResearchMethod => ({
  id,
  label,
  description,
  tactics
});

const subtopic = (id: string, label: string, tactics: ResearchTacticTemplate[], description?: string, methods?: ResearchMethod[]): ResearchSubtopic => ({
  id,
  label,
  description,
  methods: methods && methods.length > 0 ? methods : [method(DEFAULT_METHOD_ID, 'Search Queries', tactics)]
});

const vertical = (id: string, label: string, blueprintFields: string[], subtopics: ResearchSubtopic[], description?: string): ResearchVertical => ({
  id,
  label,
  description,
  blueprintFields,
  subtopics
});

export const BASE_RESEARCH_TAXONOMY: ResearchTaxonomy = {
  version: TAXONOMY_VERSION,
  updatedAt: 0,
  verticals: [
    vertical(
      'individual',
      'Individual (Person)',
      [
        'fullName',
        'aliases',
        'dateOfBirth',
        'age',
        'locations',
        'education',
        'employment',
        'affiliations',
        'publicRecords',
        'voterRegistration',
        'professionalLicenses',
        'courtRecords',
        'publicSafetyRecords',
        'assets',
        'propertyOwnershipRecords',
        'appraisalDistrictSearch',
        'openDataByLocation',
        'socialProfiles',
        'newsMentions',
        'legalIssues'
      ],
      [
        subtopic('professional', 'Professional', [
          tactic('individual-professional-linkedin', 'site:linkedin.com {name}'),
          tactic('individual-professional-zoominfo', 'site:zoominfo.com {name}'),
          tactic('individual-professional-resume', 'filetype:pdf "resume" {name}'),
          tactic('individual-professional-cv', 'filetype:pdf "cv" {name}')
        ]),
        subtopic(
          'assets',
          'Assets & Property',
          [
            tactic('individual-assets-property-authority-site', '"{countyPrimary}" {propertyAuthorityPrimary} "property search"'),
            tactic('individual-assets-property-authority-name', '"{name}" {propertyAuthorityPrimary} "{countyMetro}" "property search"'),
            tactic('individual-assets-city-metro-cad', '"{name}" "property search" "appraisal district" "{cityMetro}"'),
            tactic('individual-assets-property-authority-secondary', '"{name}" {propertyAuthoritySecondary} "{countyRegion}" "property search"'),
            tactic('individual-assets-property-authority-address', '"{address}" {propertyAuthorityPrimary} "property search"'),
            tactic('individual-assets-parcel-viewer', '"{countyMetro}" "parcel viewer" "{name}"'),
            tactic('individual-assets-recorder-deeds', '"{name}" "{countyRegion}" "recorder of deeds"'),
            tactic('individual-assets-site-org-cad', 'site:.org "{countyRegion}" "appraisal district" "{name}"'),
            tactic('individual-assets-site-gov-assessor', 'site:.gov "{countyRegion}" "assessor" "{name}"'),
            tactic('individual-assets-property-sales-2023', '"{countyPrimary}" "appraisal district" "sales" "2023" "{name}"'),
            tactic('individual-assets-property-records-county', '"{name}" "property records" "county"'),
            tactic('individual-assets-appraisal-district-search', '"{name}" "property search" "appraisal district"'),
            tactic('individual-assets-property-ownership', '"{name}" "property ownership"')
          ],
          'Use public record sources only (appraisal/assessor, recorder, parcel/GIS). Avoid sensitive data; focus on ownership and assessment history.'
        ),
        subtopic(
          'records_licensing',
          'Records & Licensing',
          [
            tactic('individual-records-license-lookup', '"{name}" "license lookup" {state}'),
            tactic('individual-records-professional-license', '"{name}" "professional license" {state}'),
            tactic('individual-records-court-search', '"{name}" "case search" "{countyPrimary}"'),
            tactic('individual-records-court-docket', '"{name}" "court docket" "{state}"'),
            tactic('individual-records-public-records', '"{name}" "public records" "{city}"')
          ],
          'Public records only. Avoid sensitive or private data; summarize at a high level without doxxing.'
        ),
        subtopic(
          'civic_records',
          'Civic Records & Open Data',
          [
            tactic('individual-civic-voter-registration', '"{name}" "voter registration" "{city}"'),
            tactic('individual-civic-voter-lookup', '"{name}" "voter lookup"'),
            tactic('individual-civic-open-data-portal', '"{city}" "open data" portal'),
            tactic('individual-civic-open-data-311', '"{city}" 311 data')
          ],
          'Use official civic sources and aggregated datasets. Avoid sensitive or personally identifying data.'
        ),
        subtopic('news', 'News', [
          tactic('individual-news-newspapers', 'site:newspapers.com {name}'),
          tactic('individual-news-gazette', '"{hometown} Gazette" {name}')
        ]),
        subtopic('social', 'Social', [
          tactic('individual-social-handle', '"@{handle}"'),
          tactic('individual-social-facebook', 'inurl:facebook.com/{name}')
        ])
      ],
      'Public-records research about individuals. Use official sources, avoid sensitive data, and prioritize broad context over doxxing.'
    ),
    vertical(
      'corporation',
      'Corporation (Business / Non-Profit)',
      [
        'legalName',
        'incorporation',
        'headquarters',
        'industry',
        'ownership',
        'financials',
        'funding',
        'leadership',
        'subsidiaries',
        'products',
        'customers',
        'registrations',
        'licensesPermits',
        'regulatory',
        'litigation',
        'culture',
        'strategy'
      ],
      [
        subtopic('registrations_licenses', 'Registrations & Licenses', [
          tactic('corp-registrations-entity-search', '"{company}" "business entity search" {state}'),
          tactic('corp-registrations-sos', '"{company}" "secretary of state" {state}'),
          tactic('corp-registrations-registry', '"{company}" "business registry" {state}'),
          tactic('corp-licenses-professional', '"{company}" "professional license" {state}'),
          tactic('corp-licenses-contractor', '"{company}" "contractor license" {state}'),
          tactic('corp-registrations-ucc', '"{company}" "UCC search" {state}')
        ]),
        subtopic('financials_funding', 'Financials & Funding', [
          tactic('corp-financials-sec', 'site:sec.gov "{company}" 10-K'),
          tactic('corp-financials-crunchbase', 'site:crunchbase.com "{company}"'),
          tactic('corp-financials-revenue', '"{company}" revenue 2024'),
          tactic('corp-financials-annual-report', '"{company}" annual report filetype:pdf')
        ]),
        subtopic('internal_culture', 'Internal Culture', [
          tactic('corp-culture-glassdoor', 'site:glassdoor.com "{company}" reviews'),
          tactic('corp-culture-teamblind', 'site:teamblind.com "{company}"'),
          tactic('corp-culture-reddit', 'site:reddit.com/r/jobs "{company}" interview')
        ]),
        subtopic('legal_compliance', 'Legal/Compliance', [
          tactic('corp-legal-lawsuit', '"{company}" lawsuit'),
          tactic('corp-legal-versus', '"{company}" v.'),
          tactic('corp-legal-settlement', '"{company}" settlement'),
          tactic('corp-legal-doj', 'site:justice.gov "{company}"')
        ]),
        subtopic('tech_stack', 'Tech Stack', [
          tactic('corp-tech-github', 'site:github.com "{company}"'),
          tactic('corp-tech-builtwith', 'site:builtwith.com "{company}"'),
          tactic('corp-tech-stackshare', 'site:stackshare.io "{company}"'),
          tactic('corp-tech-blog', '"{company}" engineering blog')
        ]),
        subtopic('leadership_org', 'Leadership/Org', [
          tactic('corp-leadership-rocketreach', 'site:rocketreach.co "{company}"'),
          tactic('corp-leadership-theorg', 'site:theorg.com "{company}"'),
          tactic('corp-leadership-executive', '"{company}" executive team')
        ]),
        subtopic('documents_strategy', 'Documents/Strategy', [
          tactic('corp-docs-domain-pdf', 'site:{companyDomain} filetype:pdf'),
          tactic('corp-docs-domain-ppt', 'site:{companyDomain} filetype:ppt'),
          tactic('corp-docs-investor', '"{company}" investor presentation filetype:pdf')
        ])
      ]
    ),
    vertical(
      'product',
      'Product (Physical Good / Software)',
      [
        'productName',
        'manufacturer',
        'category',
        'releaseDate',
        'specifications',
        'variants',
        'pricing',
        'marketplaceListings',
        'marketplaceListingSources',
        'resaleSignals',
        'supportStatus',
        'knownIssues',
        'security',
        'comparisons',
        'sentiment'
      ],
      [
        subtopic('technical_specs', 'Technical Specs', [
          tactic('product-specs-datasheet', '"{product}" datasheet filetype:pdf'),
          tactic('product-specs-manual', '"{product}" manual filetype:pdf'),
          tactic('product-specs-schematic', '"{product}" schematic OR blueprint')
        ]),
        subtopic('real_sentiment', 'Real Sentiment', [
          tactic('product-sentiment-broken', 'site:reddit.com "{product}" broken'),
          tactic('product-sentiment-vs', 'site:reddit.com "{product}" vs'),
          tactic('product-sentiment-problem', '"{product}" suck OR fail OR problem -site:{brandDomain}')
        ]),
        subtopic('pricing_value', 'Pricing/Value', [
          tactic('product-pricing-history', '"{product}" price history'),
          tactic('product-pricing-msrp', '"{product}" MSRP'),
          tactic('product-pricing-alternative', '"{product}" alternative'),
          tactic('product-pricing-alternative-oss', '"{product}" alternative open source')
        ]),
        subtopic('marketplaces_resale', 'Marketplaces & Resale', [
          tactic('product-marketplace-amazon', 'site:amazon.com "{product}"'),
          tactic('product-marketplace-ebay', 'site:ebay.com "{product}"'),
          tactic('product-marketplace-walmart', 'site:walmart.com "{product}"'),
          tactic('product-marketplace-facebook', 'site:facebook.com/marketplace "{product}"'),
          tactic('product-marketplace-shopgoodwill', 'site:shopgoodwill.com "{product}"')
        ]),
        subtopic('support_issues', 'Support/Issues', [
          tactic('product-support-error', '"{product}" error code'),
          tactic('product-support-firmware', '"{product}" firmware release notes'),
          tactic('product-support-known-issues', '"{product}" known issues')
        ]),
        subtopic('security_privacy', 'Security/Privacy', [
          tactic('product-security-cve', '"{product}" CVE'),
          tactic('product-security-breach', '"{product}" data breach'),
          tactic('product-security-privacy', '"{product}" privacy policy analysis')
        ])
      ]
    ),
    vertical(
      'location',
      'Location (City / Region / Property)',
      [
        'locationName',
        'jurisdiction',
        'population',
        'governance',
        'budget',
        'openDataPortals',
        'zoning',
        'development',
        'propertyRecords',
        'crimeStats',
        'publicSafetyData',
        'permitsInspections',
        'codeViolations',
        'gisLayers',
        'economy',
        'actuarialAnalysis',
        'majorEmployers',
        'educationRecords',
        'transportationData',
        'environmentalHealth',
        'community'
      ],
      [
        subtopic('governance', 'Governance', [
          tactic('location-governance-council', 'site:.gov "{city}" city council minutes'),
          tactic('location-governance-budget', '"{city}" budget filetype:pdf'),
          tactic('location-governance-org', '"{city}" organizational chart'),
          tactic('location-governance-zoning', '"{city}" zoning map filetype:pdf'),
          tactic('location-governance-master-plan', '"{city}" master plan')
        ]),
        subtopic('open_data_portals', 'Open Data & GIS', [
          tactic('location-open-data-portal-city', '"{city}" "open data" portal'),
          tactic('location-open-data-portal-county', '"{countyPrimary}" "open data" portal'),
          tactic('location-open-data-311', '"{city}" 311 data'),
          tactic('location-open-data-911', '"{city}" 911 calls dataset'),
          tactic('location-open-data-ems', '"{city}" EMS calls dataset'),
          tactic('location-open-data-fire', '"{city}" fire incidents dataset'),
          tactic('location-open-data-code-violations', '"{city}" code violations dataset'),
          tactic('location-open-data-permits', '"{city}" building permits dataset'),
          tactic('location-open-data-inspections', '"{city}" inspection results dataset'),
          tactic('location-open-data-gis', '"{city}" GIS open data'),
          tactic('location-open-data-parcel-gis', '"{city}" parcel GIS data')
        ], 'Use official municipal/county open data portals and GIS sources. Avoid personally identifying data; prefer aggregated datasets.'),
        subtopic('development_land', 'Development/Land', [
          tactic('location-development-master-plan', '"{city}" master plan filetype:pdf'),
          tactic('location-development-zoning', '"{city}" zoning map'),
          tactic('location-development-comprehensive', '"{city}" comprehensive plan')
        ]),
        subtopic(
          'parcel_real_estate',
          'Parcel/Real Estate',
          [
            tactic('location-parcel-authority-site', '"{countyPrimary}" {propertyAuthorityPrimary} "property search"'),
            tactic('location-parcel-authority-secondary', '"{countyRegion}" {propertyAuthoritySecondary} "property search"'),
            tactic('location-parcel-city-metro', '"{cityMetro}" "property search" "assessor"'),
            tactic('location-parcel-site-org-cad', 'site:.org "{countyRegion}" "appraisal district" "property search"'),
            tactic('location-parcel-site-gov-assessor', 'site:.gov "{countyRegion}" "assessor" "property search"'),
            tactic('location-parcel-gis', '"{countyMetro}" GIS map'),
            tactic('location-parcel-card', '"{address}" property card'),
            tactic('location-parcel-assessment', '"{address}" assessment history'),
            tactic('location-parcel-map', '"{address}" parcel map')
          ],
          'Prioritize official parcel, appraisal, and recorder systems. Use address-based searches when available.'
        ),
        subtopic('crime_safety', 'Crime/Safety', [
          tactic('location-crime-citydata', 'site:city-data.com "{city}"'),
          tactic('location-crime-blotter', '"{city}" police blotter'),
          tactic('location-crime-arrest-log', '"{city}" arrest log'),
          tactic('location-crime-jail-roster', '"{countyPrimary}" jail roster'),
          tactic('location-crime-incident-dashboard', '"{city}" incident dashboard'),
          tactic('location-crime-stats', '"{city}" crime statistics {year}')
        ]),
        subtopic('education_institutions', 'Education & Institutions', [
          tactic('location-education-board-minutes', '"{city}" school board minutes'),
          tactic('location-education-district-budget', '"{city}" school district budget'),
          tactic('location-education-clery', '"{city}" Clery report'),
          tactic('location-education-campus-crime', '"{city}" campus crime log')
        ]),
        subtopic('transportation_infrastructure', 'Transportation & Infrastructure', [
          tactic('location-transportation-transit-ridership', '"{city}" transit ridership data'),
          tactic('location-transportation-traffic-incidents', '"{city}" traffic incidents dashboard'),
          tactic('location-transportation-road-work', '"{city}" road work map'),
          tactic('location-transportation-airport', '"{city}" airport statistics'),
          tactic('location-transportation-port', '"{city}" port authority statistics'),
          tactic('location-transportation-rail', '"{city}" rail ridership data')
        ]),
        subtopic('health_environment', 'Health & Environment', [
          tactic('location-health-public-dashboard', '"{city}" public health dashboard'),
          tactic('location-health-restaurant-inspections', '"{city}" restaurant inspections'),
          tactic('location-health-air-quality', '"{city}" air quality data'),
          tactic('location-health-water-quality', '"{city}" water quality report'),
          tactic('location-health-environmental-agency', '"{state}" environmental agency "{city}"')
        ], 'Prefer public health and environmental agencies; summarize at the community level.'),
        subtopic('economy', 'Economy', [
          tactic('location-economy-employers', '"{city}" major employers'),
          tactic('location-economy-chamber', '"{city}" chamber of commerce directory'),
          tactic('location-economy-unemployment', '"{city}" unemployment rate history')
        ]),
        subtopic('actuarial_analysis', 'Actuarial/Risk Analysis', [
          tactic('location-actuarial-age-risk', '"{city}" actuarial analysis "age" "risk factor"'),
          tactic('location-actuarial-insurance', '"{city}" insurance risk factors "actuarial"'),
          tactic('location-actuarial-mortality', '"{city}" mortality table "actuarial"')
        ], 'Use aggregated actuarial or insurance studies; avoid personal data.'),
        subtopic('community', 'Community', [
          tactic('location-community-reddit', 'site:reddit.com/r/{city}'),
          tactic('location-community-facebook', 'site:facebook.com "residents of {city}"'),
          tactic('location-community-news', '"{city}" local news archive')
        ])
      ],
      'Use official sources, aggregated datasets, and public records. Avoid personal data or doxxing.'
    ),
    vertical(
      'event',
      'Event (News / History)',
      [
        'eventName',
        'date',
        'location',
        'participants',
        'timeline',
        'primarySources',
        'incidentLogs',
        'afterActionReports',
        'coverage',
        'historicalStudies',
        'anthropologicalDiscourse',
        'impact',
        'actuarialAnalysis',
        'controversy'
      ],
      [
        subtopic('primary_sources', 'Primary Sources', [
          tactic('event-primary-transcript', '"{event}" full transcript'),
          tactic('event-primary-report', '"{event}" official report filetype:pdf'),
          tactic('event-primary-archive', 'site:archive.org "{event}"')
        ]),
        subtopic('historical_anthropological', 'Historical & Anthropological Studies', [
          tactic('event-historical-study', '"{event}" historical study'),
          tactic('event-historical-analysis', '"{event}" historical analysis'),
          tactic('event-anthropological-analysis', '"{event}" anthropological analysis'),
          tactic('event-ethnography', '"{event}" ethnographic study')
        ]),
        subtopic('incident_records', 'Incident Records', [
          tactic('event-incident-report', '"{event}" incident report'),
          tactic('event-incident-after-action', '"{event}" after action report'),
          tactic('event-incident-dashboard', '"{event}" incident dashboard'),
          tactic('event-incident-911', '"{event}" 911 calls'),
          tactic('event-incident-dispatch', '"{event}" dispatch log')
        ]),
        subtopic('timeline', 'Timeline', [
          tactic('event-timeline-overview', 'timeline of "{event}"'),
          tactic('event-timeline-minute', '"{event}" minute by minute'),
          tactic('event-timeline-sequence', '"{event}" sequence of events')
        ]),
        subtopic('controversy', 'Controversy', [
          tactic('event-controversy-criticism', '"{event}" criticism'),
          tactic('event-controversy-debunked', '"{event}" debunked'),
          tactic('event-controversy-editorial', '"{event}" editorial OR opinion'),
          tactic('event-controversy-conspiracy', '"{event}" conspiracy debunked')
        ]),
        subtopic('social_reaction', 'Social Reaction', [
          tactic('event-social-twitter', 'site:twitter.com "{event}"'),
          tactic('event-social-reddit', 'site:reddit.com/r/news "{event}"')
        ]),
        subtopic('participants', 'Participants', [
          tactic('event-participants-organizers', 'who organized "{event}"'),
          tactic('event-participants-attendees', '"{event}" attendees list'),
          tactic('event-participants-figures', '"{event}" key figures')
        ]),
        subtopic('impact', 'Impact', [
          tactic('event-impact-aftermath', '"{event}" aftermath'),
          tactic('event-impact-policy', '"{event}" policy changes'),
          tactic('event-impact-damages', '"{event}" death toll OR damages')
        ]),
        subtopic('actuarial_analysis', 'Actuarial/Risk Analysis', [
          tactic('event-actuarial-risk', '"{event}" actuarial analysis "age" "risk factor"'),
          tactic('event-actuarial-losses', '"{event}" insurance loss estimates "actuarial"'),
          tactic('event-actuarial-mortality', '"{event}" mortality table "actuarial"')
        ])
      ]
    ),
    vertical(
      'technical_concept',
      'Technical Concept (Code / Engineering)',
      [
        'concept',
        'definition',
        'implementation',
        'references',
        'benchmarks',
        'vulnerabilities',
        'bestPractices',
        'comparisons',
        'osintTooling',
        'searchOperators',
        'domainIntel'
      ],
      [
        subtopic('implementation', 'Implementation', [
          tactic('tech-impl-github', 'site:github.com "{concept}"'),
          tactic('tech-impl-stackoverflow', 'site:stackoverflow.com "{concept}" error'),
          tactic('tech-impl-tutorial', '"{concept}" tutorial "how to"'),
          tactic('tech-impl-language', '"{concept}" implementation python OR java')
        ]),
        subtopic('academic_basis', 'Academic Basis', [
          tactic('tech-academic-arxiv', 'site:arxiv.org "{concept}"'),
          tactic('tech-academic-scholar', 'site:scholar.google.com "{concept}"'),
          tactic('tech-academic-survey', '"{concept}" survey paper filetype:pdf'),
          tactic('tech-academic-seminal', '"{concept}" seminal paper')
        ]),
        subtopic('instructional', 'Instructional', [
          tactic('tech-instructional-beginner', '"{concept}" tutorial for beginners'),
          tactic('tech-instructional-best', '"{concept}" best practices'),
          tactic('tech-instructional-cheatsheet', '"{concept}" cheat sheet filetype:pdf')
        ]),
        subtopic('vulnerabilities', 'Vulnerabilities', [
          tactic('tech-vuln-cve', '"{concept}" CVE'),
          tactic('tech-vuln-exploit', '"{concept}" exploit'),
          tactic('tech-vuln-bypass', '"{concept}" bypass'),
          tactic('tech-vuln-risks', '"{concept}" security risks')
        ]),
        subtopic('comparison', 'Comparison', [
          tactic('tech-compare-vs', '"{concept}" vs {alternative}'),
          tactic('tech-compare-benchmark', '"{concept}" performance benchmarks')
        ]),
        subtopic('osint_tooling', 'OSINT Tooling', [
          tactic('tech-osint-tools', '"{concept}" OSINT tool'),
          tactic('tech-osint-search-operators', '"{concept}" "search operators"'),
          tactic('tech-osint-reverse-image', '"{concept}" "reverse image search"'),
          tactic('tech-osint-domain-intel', '"{concept}" "domain intelligence"'),
          tactic('tech-osint-host-intel', '"{concept}" "host intelligence"')
        ])
      ]
    ),
    vertical(
      'nontechnical_concept',
      'Non-Technical Concept (Idea / Theory / Movement)',
      [
        'concept',
        'definition',
        'origin',
        'keyFigures',
        'historicalContext',
        'criticisms',
        'applications'
      ],
      [
        subtopic('definition_etymology', 'Definition & Etymology', [
          tactic('nontech-definition-define', 'define:"{concept}"'),
          tactic('nontech-definition-origin', '"origin of the term {concept}"'),
          tactic('nontech-definition-etymology', '"{concept}" etymology')
        ]),
        subtopic('key_theorists', 'Key Theorists', [
          tactic('nontech-theorists-coined', '"who coined {concept}"'),
          tactic('nontech-theorists-authors', '"famous {concept} authors"'),
          tactic('nontech-theorists-scholar', 'site:scholar.google.com "{concept}" seminal paper'),
          tactic('nontech-theorists-iep', 'site:iep.utm.edu "{concept}"')
        ]),
        subtopic('critical_analysis', 'Critical Analysis', [
          tactic('nontech-criticism', '"{concept}" criticism OR critique'),
          tactic('nontech-arguments', '"arguments against {concept}"'),
          tactic('nontech-versus', '"{concept}" vs {opposingConcept}'),
          tactic('nontech-limitations', '"{concept}" limitations')
        ]),
        subtopic('historical_context', 'Historical Context', [
          tactic('nontech-history-timeline', '"{concept}" history timeline'),
          tactic('nontech-history-century', '"{concept}" in the 19th century'),
          tactic('nontech-history-edu', 'site:edu "{concept}" sociology'),
          tactic('nontech-history-paradigm', '"{concept}" paradigm shift')
        ]),
        subtopic('modern_application', 'Modern Application', [
          tactic('nontech-modern-society', '"{concept}" in modern society'),
          tactic('nontech-modern-case-study', '"{concept}" case study 2024'),
          tactic('nontech-modern-nytimes', 'site:nytimes.com "{concept}"')
        ])
      ]
    ),
    vertical(
      'creative_work',
      'Creative Work (Book / Film / Art / Music)',
      [
        'title',
        'creator',
        'releaseDate',
        'genre',
        'themes',
        'reception',
        'production',
        'credits',
        'ending'
      ],
      [
        subtopic('reception', 'Reception', [
          tactic('creative-reception-rottentomatoes', 'site:rottentomatoes.com "{title}"'),
          tactic('creative-reception-goodreads', 'site:goodreads.com "{title}" review'),
          tactic('creative-reception-metacritic', '"{title}" metacritic score')
        ]),
        subtopic('thematic_analysis', 'Thematic Analysis', [
          tactic('creative-themes-symbolism', '"{title}" symbolism'),
          tactic('creative-themes-explained', '"{title}" themes explained'),
          tactic('creative-themes-jstor', 'site:jstor.org "{title}" analysis')
        ]),
        subtopic('production_history', 'Production History', [
          tactic('creative-production-making-of', '"{title}" making of'),
          tactic('creative-production-development-hell', '"{title}" development hell'),
          tactic('creative-production-budget', '"{title}" budget vs box office')
        ]),
        subtopic('credits_personnel', 'Credits/Personnel', [
          tactic('creative-credits-imdb', 'site:imdb.com "{title}" full cast'),
          tactic('creative-credits-interview', '"{title}" author interview'),
          tactic('creative-credits-cinematographer', '"{title}" cinematographer style')
        ]),
        subtopic('ending_plot', 'Ending/Plot', [
          tactic('creative-ending-explained', '"{title}" ending explained'),
          tactic('creative-ending-summary', '"{title}" plot summary')
        ])
      ]
    ),
    vertical(
      'reception',
      'Reception (Reviews / Ratings / Awards)',
      [
        'criticScores',
        'audienceScores',
        'reviewSources',
        'reviewQuotes',
        'sentiment',
        'awards',
        'comparisons',
        'controversy'
      ],
      [
        subtopic('review_sources', 'Review Sources', [
          tactic('reception-review-rottentomatoes', 'site:rottentomatoes.com "{title}" reviews'),
          tactic('reception-review-goodreads', 'site:goodreads.com "{title}" reviews'),
          tactic('reception-review-metacritic', 'site:metacritic.com "{title}" reviews'),
          tactic('reception-review-omdb', 'site:omdbapi.com "{title}" ratings'),
          tactic('reception-review-amazon', 'site:amazon.com "{title}" reviews')
        ]),
        subtopic('thematic_analysis', 'Thematic Analysis', [
          tactic('reception-themes-symbolism', '"{title}" symbolism'),
          tactic('reception-themes-explained', '"{title}" themes explained'),
          tactic('reception-themes-jstor', 'site:jstor.org "{title}" analysis')
        ]),
        subtopic('production_history', 'Production History', [
          tactic('reception-production-making-of', '"{title}" making of'),
          tactic('reception-production-development', '"{title}" development history'),
          tactic('reception-production-budget', '"{title}" budget vs box office')
        ]),
        subtopic('credits_personnel', 'Credits/Personnel', [
          tactic('reception-credits-imdb', 'site:imdb.com "{title}" full cast'),
          tactic('reception-credits-interview', '"{title}" creator interview'),
          tactic('reception-credits-crew', '"{title}" crew list')
        ]),
        subtopic('cast', 'Cast', [
          tactic('reception-cast-list', '"{title}" cast list'),
          tactic('reception-cast-interview', '"{title}" cast interview'),
          tactic('reception-cast-imdb', 'site:imdb.com "{title}" cast')
        ]),
        subtopic('ending_plot', 'Ending/Plot', [
          tactic('reception-ending-explained', '"{title}" ending explained'),
          tactic('reception-ending-summary', '"{title}" plot summary')
        ])
      ]
    ),
    vertical(
      'medical_subject',
      'Medical Subject (Condition / Drug / Anatomy)',
      [
        'subject',
        'definition',
        'symptoms',
        'diagnosis',
        'treatment',
        'homeopathicTheories',
        'guidelines',
        'statistics',
        'publicHealthData',
        'environmentalData',
        'inspectionData',
        'studies',
        'patientExperience',
        'risks',
        'actuarialAnalysis'
      ],
      [
        subtopic('clinical_definition', 'Clinical Definition', [
          tactic('medical-definition-cdc', 'site:cdc.gov "{condition}"'),
          tactic('medical-definition-mayo', 'site:mayoclinic.org "{condition}"'),
          tactic('medical-definition-who', 'site:who.int "{condition}"')
        ]),
        subtopic('research_studies', 'Research Studies', [
          tactic('medical-studies-pubmed', 'site:pubmed.ncbi.nlm.nih.gov "{condition}"'),
          tactic('medical-studies-trial', '"{drug}" clinical trial results'),
          tactic('medical-studies-meta', '"{condition}" meta-analysis {year}')
        ]),
        subtopic('patient_experience', 'Patient Experience', [
          tactic('medical-patient-patientslikeme', 'site:patientslikeme.com "{condition}"'),
          tactic('medical-patient-reddit', 'site:reddit.com/r/{condition}'),
          tactic('medical-patient-reviews', '"{drug}" user reviews side effects')
        ]),
        subtopic('treatment_guidelines', 'Treatment Guidelines', [
          tactic('medical-treatment-guidelines', '"{condition}" treatment guidelines 2024'),
          tactic('medical-treatment-standard', '"{condition}" standard of care'),
          tactic('medical-treatment-fda', '"{drug}" FDA label filetype:pdf')
        ]),
        subtopic('homeopathic_theories', 'Homeopathic Theories', [
          tactic('medical-homeopathic-theory', '"{condition}" homeopathic theory'),
          tactic('medical-homeopathic-treatment', '"{condition}" homeopathic treatment'),
          tactic('medical-homeopathic-evidence', '"{condition}" homeopathy evidence')
        ], 'Include as contextual background only; do not present as medical advice.'),
        subtopic('statistics', 'Statistics', [
          tactic('medical-stats-prevalence', '"{condition}" prevalence statistics'),
          tactic('medical-stats-mortality', '"{condition}" mortality rate')
        ]),
        subtopic('actuarial_analysis', 'Actuarial/Risk Analysis', [
          tactic('medical-actuarial-age-risk', '"{condition}" actuarial risk "age"'),
          tactic('medical-actuarial-morbidity', '"{condition}" morbidity table "actuarial"'),
          tactic('medical-actuarial-location', '"{condition}" "{city}" actuarial analysis "risk factors"')
        ]),
        subtopic('public_health_environment', 'Public Health & Environment', [
          tactic('medical-public-health-dashboard', '"{condition}" public health dashboard {state}'),
          tactic('medical-public-health-surveillance', '"{condition}" surveillance data {state}'),
          tactic('medical-public-health-inspections', '"{city}" health inspections'),
          tactic('medical-public-health-restaurant', '"{city}" restaurant inspection scores'),
          tactic('medical-public-health-environment', '"{state}" environmental health data')
        ])
      ]
    ),
    vertical(
      'legal_matter',
      'Legal Matter (Statute / Case Law / Regulation)',
      [
        'jurisdiction',
        'statuteText',
        'caseLaw',
        'interpretations',
        'procedure',
        'forms',
        'precedent',
        'courtRecords',
        'bankruptcy',
        'liensJudgments',
        'openDataByLocation',
        'recordsRequests',
        'enforcementActions',
        'actuarialAnalysis'
      ],
      [
        subtopic('statutory_text', 'Statutory Text', [
          tactic('legal-text-cornell', 'site:cornell.edu "{law}"'),
          tactic('legal-text-citation', '"{statuteCitation}" text'),
          tactic('legal-text-govinfo', 'site:govinfo.gov "{billName}"')
        ]),
        subtopic('case_precedent', 'Case Precedent', [
          tactic('legal-case-opinion', '"{caseName}" v. "{opposing}" opinion'),
          tactic('legal-case-holding', '"{caseName}" holding summary'),
          tactic('legal-case-justia', 'site:justia.com "{caseName}"')
        ]),
        subtopic('interpretation', 'Interpretation', [
          tactic('legal-interpretation-analysis', '"{law}" legal analysis'),
          tactic('legal-interpretation-challenge', '"{law}" constitutional challenge'),
          tactic('legal-interpretation-lawreview', 'site:lawreview.org "{law}"')
        ]),
        subtopic('jurisdiction', 'Jurisdiction', [
          tactic('legal-jurisdiction-application', '"{law}" {stateOrCountry} application'),
          tactic('legal-jurisdiction-federal', '"{law}" federal vs state')
        ]),
        subtopic('forms_procedure', 'Forms/Procedure', [
          tactic('legal-forms-action', '"{legalAction}" form filetype:pdf'),
          tactic('legal-forms-howto', '"how to file" {legalAction} {state}')
        ]),
        subtopic('court_records', 'Court Records', [
          tactic('legal-court-docket', '"{caseName}" docket'),
          tactic('legal-court-calendar', '"{caseName}" court calendar'),
          tactic('legal-court-case-search', '"{caseName}" case search'),
          tactic('legal-court-bankruptcy', '"{caseName}" bankruptcy'),
          tactic('legal-court-lien', '"{caseName}" lien'),
          tactic('legal-court-judgment', '"{caseName}" judgment')
        ]),
        subtopic('records_requests', 'Records Requests (FOIA/Open Records)', [
          tactic('legal-foia-request', '"{law}" FOIA request'),
          tactic('legal-public-records-request', '"{law}" "public records request"'),
          tactic('legal-public-records-portal', '"{state}" "public records request" portal'),
          tactic('legal-sunshine-law', '"{state}" sunshine law request'),
          tactic('legal-open-records', '"{state}" "open records" request')
        ]),
        subtopic('open_data_location', 'Local Open Data', [
          tactic('legal-open-data-portal-city', '"{city}" "open data" portal'),
          tactic('legal-open-data-portal-ordinances', '"{city}" open data ordinances'),
          tactic('legal-open-data-portal-courts', '"{city}" "open data" court records')
        ], 'Use official local government portals and aggregated datasets.'),
        subtopic('actuarial_analysis', 'Actuarial/Risk Analysis', [
          tactic('legal-actuarial-risk', '"{law}" actuarial analysis "risk factor"'),
          tactic('legal-actuarial-liability', '"{law}" insurance liability "actuarial"'),
          tactic('legal-actuarial-impact', '"{law}" actuarial impact "age"')
        ])
      ]
    ),
    vertical(
      'general_discovery',
      'General Discovery (Fallback)',
      [
        'topic',
        'likelyVerticals',
        'keyEntities',
        'timeRange',
        'sourceTypes',
        'openDataSources',
        'osintTechniques',
        'recordsRequestOptions',
        'actuarialAnalysis'
      ],
      [
        subtopic('general_discovery', 'General Discovery', [
          tactic('general-discovery-overview', '{topic} overview'),
          tactic('general-discovery-how-to-research', 'how to research {topic}'),
          tactic('general-discovery-primary', '{topic} primary sources'),
          tactic('general-discovery-controversy', '{topic} controversy'),
          tactic('general-discovery-latest', '{topic} latest news')
        ]),
        subtopic('actuarial_analysis', 'Actuarial/Risk Analysis', [
          tactic('general-actuarial-risk', '"{topic}" actuarial analysis "age" "risk factor"'),
          tactic('general-actuarial-table', '"{topic}" actuarial table'),
          tactic('general-actuarial-insurance', '"{topic}" insurance actuarial study')
        ]),
        subtopic('osint_methods', 'OSINT & Open Data Methods', [
          tactic('general-osint-site-gov', '{topic} site:gov filetype:pdf'),
          tactic('general-osint-open-data', '"{topic}" "open data" portal'),
          tactic('general-osint-public-records-search', '"{topic}" "public records" search'),
          tactic('general-osint-public-records', '"{topic}" "public records request"'),
          tactic('general-osint-foia', '"{topic}" FOIA'),
          tactic('general-osint-incident-dashboard', '"{topic}" "incident dashboard"'),
          tactic('general-osint-gis', '"{topic}" "GIS data"'),
          tactic('general-osint-reverse-image', '"{topic}" "reverse image search"'),
          tactic('general-osint-whois', '"{topic}" WHOIS'),
          tactic('general-osint-domain-history', '"{topic}" "domain history"')
        ], 'Use public sources only; avoid personal data and doxxing. Prefer official portals and aggregated datasets.')
      ],
      'Fallback discovery using public sources only. Avoid sensitive data; prefer official portals and aggregated datasets.'
    ),
    vertical(
      'system_test',
      'System Test (CI / QA)',
      [
        'testRunId',
        'agentCoverage',
        'uiViewportChecks',
        'status'
      ],
      [
        subtopic('system_smoke', 'System Smoke Test', [
          tactic('system-test-phrase', '"{topic}" system test phrase'),
          tactic('system-test-agents', '"{topic}" spawn each agent type once'),
          tactic('system-test-ui', '"{topic}" responsive UI checks')
        ], 'Reserved for automated CI smoke tests only.')
      ],
      'Reserved vertical for automated system smoke tests and regression checks.'
    )
  ]
};

export interface TaxonomyStore {
  version: number;
  updatedAt: number;
  addedVerticals: ResearchVertical[];
  addedSubtopics: Record<string, ResearchSubtopic[]>;
  addedTactics: Record<string, Record<string, ResearchTacticTemplate[]>>;
}

const emptyStore = (): TaxonomyStore => ({
  version: TAXONOMY_VERSION,
  updatedAt: 0,
  addedVerticals: [],
  addedSubtopics: {},
  addedTactics: {}
});

export const loadTaxonomyStore = (): TaxonomyStore => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return emptyStore();
    const stored = window.localStorage.getItem(TAXONOMY_STORAGE_KEY);
    if (!stored) return emptyStore();
    const parsed = JSON.parse(stored);
    const store: TaxonomyStore = {
      version: typeof parsed?.version === 'number' ? parsed.version : TAXONOMY_VERSION,
      updatedAt: typeof parsed?.updatedAt === 'number' ? parsed.updatedAt : 0,
      addedVerticals: Array.isArray(parsed?.addedVerticals) ? parsed.addedVerticals : [],
      addedSubtopics: parsed?.addedSubtopics && typeof parsed.addedSubtopics === 'object' ? parsed.addedSubtopics : {},
      addedTactics: parsed?.addedTactics && typeof parsed.addedTactics === 'object' ? parsed.addedTactics : {}
    };
    return store;
  } catch (_) {
    return emptyStore();
  }
};

export const saveTaxonomyStore = (store: TaxonomyStore) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(TAXONOMY_STORAGE_KEY, JSON.stringify(store));
    try {
      window.dispatchEvent(new CustomEvent(TAXONOMY_UPDATED_EVENT, { detail: { updatedAt: store.updatedAt, version: store.version } }));
    } catch (_) {
      // ignore
    }
  } catch (_) {
    // ignore
  }
};

const cloneTaxonomy = (taxonomy: ResearchTaxonomy): ResearchTaxonomy => {
  return JSON.parse(JSON.stringify(taxonomy)) as ResearchTaxonomy;
};

const ensureMethodForSubtopic = (subtopic: ResearchSubtopic, methodId: string): ResearchMethod => {
  let methodRef = subtopic.methods.find(m => m.id === methodId);
  if (!methodRef) {
    methodRef = method(methodId, 'Search Queries', []);
    subtopic.methods.push(methodRef);
  }
  return methodRef;
};

const mergeStoreIntoTaxonomy = (base: ResearchTaxonomy, store: TaxonomyStore): ResearchTaxonomy => {
  const merged = cloneTaxonomy(base);
  const verticalIndex = new Map(merged.verticals.map(v => [v.id, v]));

  for (const addedVertical of store.addedVerticals || []) {
    if (!addedVertical || !addedVertical.id) continue;
    if (!verticalIndex.has(addedVertical.id)) {
      merged.verticals.push(addedVertical);
      verticalIndex.set(addedVertical.id, addedVertical);
    }
  }

  const addedSubtopics = store.addedSubtopics || {};
  for (const [verticalId, subtopics] of Object.entries(addedSubtopics)) {
    const vertical = verticalIndex.get(verticalId);
    if (!vertical || !Array.isArray(subtopics)) continue;
    const subtopicIds = new Set(vertical.subtopics.map(s => s.id));
    for (const sub of subtopics) {
      if (!sub || !sub.id || subtopicIds.has(sub.id)) continue;
      vertical.subtopics.push(sub);
      subtopicIds.add(sub.id);
    }
  }

  const addedTactics = store.addedTactics || {};
  for (const [verticalId, subtopicMap] of Object.entries(addedTactics)) {
    const vertical = verticalIndex.get(verticalId);
    if (!vertical || !subtopicMap) continue;
    const subtopics = new Map(vertical.subtopics.map(s => [s.id, s]));
    for (const [subtopicId, tactics] of Object.entries(subtopicMap)) {
      const subtopicRef = subtopics.get(subtopicId);
      if (!subtopicRef || !Array.isArray(tactics)) continue;
      const templateSet = new Set(
        subtopicRef.methods.flatMap(m => m.tactics.map(t => t.template.trim().toLowerCase()))
      );
      const methodRef = ensureMethodForSubtopic(subtopicRef, DEFAULT_METHOD_ID);
      for (const tacticItem of tactics) {
        if (!tacticItem?.template) continue;
        const key = tacticItem.template.trim().toLowerCase();
        if (templateSet.has(key)) continue;
        methodRef.tactics.push(tacticItem);
        templateSet.add(key);
      }
    }
  }

  merged.updatedAt = Math.max(base.updatedAt || 0, store.updatedAt || 0);
  return merged;
};

export const getResearchTaxonomy = (): ResearchTaxonomy => {
  const store = loadTaxonomyStore();
  return mergeStoreIntoTaxonomy(BASE_RESEARCH_TAXONOMY, store);
};

export const summarizeTaxonomy = (taxonomy: ResearchTaxonomy) => {
  return taxonomy.verticals.map(v => ({
    id: v.id,
    label: v.label,
    description: v.description,
    subtopics: v.subtopics.map(s => ({ id: s.id, label: s.label, description: s.description }))
  }));
};

export const listTacticsForVertical = (taxonomy: ResearchTaxonomy, verticalId: string): ResearchTacticTemplate[] => {
  const vertical = taxonomy.verticals.find(v => v.id === verticalId);
  if (!vertical) return [];
  return vertical.subtopics.flatMap(s => s.methods.flatMap(m => m.tactics));
};

const SLOT_REGEX = /\{([a-zA-Z0-9_]+)\}/g;

const extractSlots = (template: string): string[] => {
  const slots = new Set<string>();
  let match: RegExpExecArray | null = null;
  while ((match = SLOT_REGEX.exec(template))) {
    if (match[1]) slots.add(match[1]);
  }
  return Array.from(slots);
};

const normalizeSlotValue = (value: unknown): string[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.map(v => String(v)).map(v => v.trim()).filter(Boolean);
  }
  const str = String(value).trim();
  return str ? [str] : [];
};

const defaultSlotValue = (slot: string): string[] => {
  if (slot === 'year') return [String(new Date().getFullYear())];
  return [];
};

const buildCombinations = (slotValues: Array<{ slot: string; values: string[] }>): Array<Record<string, string>> => {
  let combos: Array<Record<string, string>> = [{}];
  for (const entry of slotValues) {
    const next: Array<Record<string, string>> = [];
    for (const combo of combos) {
      for (const value of entry.values) {
        next.push({ ...combo, [entry.slot]: value });
      }
    }
    combos = next;
  }
  return combos;
};

export const expandTacticTemplates = (
  templates: ResearchTacticTemplate[],
  slots: Record<string, unknown>,
  options: TacticExpansionOptions = {}
): ExpandedTactic[] => {
  const allowUnresolved = options.allowUnresolved === true;
  const expanded: ExpandedTactic[] = [];

  for (const templateItem of templates) {
    const template = templateItem.template;
    const slotNames = extractSlots(template);

    if (slotNames.length === 0) {
      expanded.push({
        id: templateItem.id,
        template,
        query: template,
        slots: {},
        unresolvedSlots: [],
        verticalId: 'unknown',
        subtopicId: 'unknown',
        methodId: DEFAULT_METHOD_ID,
        provenance: templateItem.provenance
      });
      continue;
    }

    const slotValues: Array<{ slot: string; values: string[] }> = [];
    let hasMissing = false;
    for (const slot of slotNames) {
      let values = normalizeSlotValue(slots[slot]);
      if (values.length === 0) values = defaultSlotValue(slot);
      if (values.length === 0) {
        hasMissing = true;
        if (allowUnresolved) {
          values = [`{${slot}}`];
        }
      }
      slotValues.push({ slot, values });
    }

    if (hasMissing && !allowUnresolved) continue;

    const combos = buildCombinations(slotValues);
    for (const combo of combos) {
      let query = template;
      for (const [slot, value] of Object.entries(combo)) {
        const slotPattern = new RegExp(`\\{${slot}\\}`, 'g');
        query = query.replace(slotPattern, value);
      }
      const unresolved = extractSlots(query);
      expanded.push({
        id: templateItem.id,
        template,
        query,
        slots: combo,
        unresolvedSlots: unresolved,
        verticalId: 'unknown',
        subtopicId: 'unknown',
        methodId: DEFAULT_METHOD_ID,
        provenance: templateItem.provenance
      });
    }
  }

  return expanded;
};

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
};

const isTemplateValid = (template: string) => {
  if (!template) return false;
  if (template.length < 4 || template.length > 200) return false;
  if (template.includes('\n')) return false;
  const unsafe = template.toLowerCase();
  if (unsafe.includes('javascript:') || unsafe.includes('data:')) return false;
  const cleaned = template.replace(SLOT_REGEX, '').replace(/[^a-zA-Z0-9]+/g, '');
  return cleaned.length >= 3;
};

const ensureProvenance = (existing: TaxonomyProvenance[] | undefined, added: TaxonomyProvenance): TaxonomyProvenance[] => {
  const list = Array.isArray(existing) ? [...existing] : [];
  list.push(added);
  return list;
};

export const vetAndPersistTaxonomyProposals = (
  proposals: TaxonomyProposalBundle,
  provenance: Omit<TaxonomyProvenance, 'timestamp' | 'source'> & { source?: TaxonomyProvenanceSource }
): TaxonomyVettingResult => {
  const store = loadTaxonomyStore();
  const taxonomy = mergeStoreIntoTaxonomy(BASE_RESEARCH_TAXONOMY, store);
  const now = Date.now();
  const provenanceTag: TaxonomyProvenance = {
    source: provenance.source || 'agent_proposal',
    timestamp: now,
    topic: provenance.topic,
    agentId: provenance.agentId,
    agentName: provenance.agentName,
    runId: provenance.runId,
    note: provenance.note
  };

  let accepted = 0;
  let rejected = 0;
  const acceptedItems: string[] = [];
  const rejectedItems: Array<{ item: string; reason: string }> = [];

  const verticalIndex = new Map(taxonomy.verticals.map(v => [v.id, v]));

  const ensureVerticalInStore = (vertical: ResearchVertical) => {
    if (!store.addedVerticals.find(v => v.id === vertical.id)) {
      store.addedVerticals.push(vertical);
    }
  };

  const ensureSubtopicInStore = (verticalId: string, subtopic: ResearchSubtopic) => {
    if (!store.addedSubtopics[verticalId]) store.addedSubtopics[verticalId] = [];
    if (!store.addedSubtopics[verticalId].find(s => s.id === subtopic.id)) {
      store.addedSubtopics[verticalId].push(subtopic);
    }
  };

  const ensureTacticInStore = (verticalId: string, subtopicId: string, tacticItem: ResearchTacticTemplate) => {
    if (!store.addedTactics[verticalId]) store.addedTactics[verticalId] = {};
    if (!store.addedTactics[verticalId][subtopicId]) store.addedTactics[verticalId][subtopicId] = [];
    store.addedTactics[verticalId][subtopicId].push(tacticItem);
  };

  const existingTemplateSet = () => {
    const set = new Set<string>();
    for (const vertical of taxonomy.verticals) {
      for (const sub of vertical.subtopics) {
        for (const meth of sub.methods) {
          for (const tacticItem of meth.tactics) {
            if (tacticItem?.template) set.add(tacticItem.template.trim().toLowerCase());
          }
        }
      }
    }
    return set;
  };

  const templateSet = existingTemplateSet();

  const buildProposedTactic = (verticalId: string, subtopicId: string, template: string, notes?: string): ResearchTacticTemplate => ({
    id: `${verticalId}-${subtopicId}-${slugify(template)}`,
    template,
    notes,
    provenance: ensureProvenance(undefined, provenanceTag)
  });

  const addTactic = (verticalId: string, subtopicId: string, methodId: string, template: string, notes?: string) => {
    if (!isTemplateValid(template)) {
      rejected += 1;
      rejectedItems.push({ item: template, reason: 'Invalid template.' });
      return;
    }
    const key = template.trim().toLowerCase();
    if (templateSet.has(key)) {
      rejected += 1;
      rejectedItems.push({ item: template, reason: 'Duplicate template.' });
      return;
    }

    const vertical = verticalIndex.get(verticalId);
    if (!vertical) {
      rejected += 1;
      rejectedItems.push({ item: template, reason: `Unknown vertical ${verticalId}.` });
      return;
    }

    const subtopic = vertical.subtopics.find(s => s.id === subtopicId);
    if (!subtopic) {
      rejected += 1;
      rejectedItems.push({ item: template, reason: `Unknown subtopic ${subtopicId}.` });
      return;
    }

    const tacticId = `${verticalId}-${subtopicId}-${slugify(template)}`;
    const tacticItem: ResearchTacticTemplate = {
      id: tacticId,
      template,
      notes,
      provenance: ensureProvenance(undefined, provenanceTag)
    };

    const methodRef = ensureMethodForSubtopic(subtopic, methodId || DEFAULT_METHOD_ID);
    methodRef.tactics.push(tacticItem);
    ensureTacticInStore(verticalId, subtopicId, tacticItem);
    templateSet.add(key);
    accepted += 1;
    acceptedItems.push(template);
  };

  if (Array.isArray(proposals?.verticals)) {
    for (const proposed of proposals.verticals) {
      if (!proposed || !proposed.label) continue;
      const id = slugify(proposed.id || proposed.label);
      if (!id) {
        rejected += 1;
        rejectedItems.push({ item: proposed.label, reason: 'Invalid vertical id.' });
        continue;
      }
      if (verticalIndex.has(id)) {
        rejected += 1;
        rejectedItems.push({ item: proposed.label, reason: `Vertical ${id} already exists.` });
        continue;
      }
      const blueprintFields = Array.isArray(proposed.blueprintFields) && proposed.blueprintFields.length > 0
        ? proposed.blueprintFields
        : ['summary', 'keyEntities', 'sources'];

      const verticalItem: ResearchVertical = {
        id,
        label: proposed.label,
        description: proposed.description,
        blueprintFields,
        subtopics: [],
        provenance: ensureProvenance(undefined, provenanceTag)
      };

      if (Array.isArray(proposed.subtopics)) {
        for (const sub of proposed.subtopics) {
          if (!sub?.label) continue;
          const subId = slugify(sub.id || sub.label);
          if (!subId) continue;
          const tactics = (sub.tactics || [])
            .filter(t => t?.template)
            .map((t) => buildProposedTactic(id, subId, t.template, t.notes));
          const methods = Array.isArray(sub.methods) && sub.methods.length > 0
            ? sub.methods.map((m) => method(slugify(m.id || m.label || 'search'), m.label || 'Search Queries',
              (m.tactics || []).filter(t => t?.template).map(t => buildProposedTactic(id, subId, t.template, t.notes)),
              m.description
            ))
            : undefined;
          const subItem: ResearchSubtopic = {
            id: subId,
            label: sub.label,
            description: sub.description,
            methods: methods && methods.length > 0 ? methods : [method(DEFAULT_METHOD_ID, 'Search Queries', tactics)],
            provenance: ensureProvenance(undefined, provenanceTag)
          };
          verticalItem.subtopics.push(subItem);
        }
      }

      taxonomy.verticals.push(verticalItem);
      verticalIndex.set(id, verticalItem);
      ensureVerticalInStore(verticalItem);
      accepted += 1;
      acceptedItems.push(`vertical:${verticalItem.label}`);
    }
  }

  if (Array.isArray(proposals?.subtopics)) {
    for (const proposed of proposals.subtopics) {
      if (!proposed?.label || !proposed.verticalId) continue;
      const vertical = verticalIndex.get(proposed.verticalId);
      if (!vertical) {
        rejected += 1;
        rejectedItems.push({ item: proposed.label, reason: `Unknown vertical ${proposed.verticalId}.` });
        continue;
      }
      const subId = slugify(proposed.id || proposed.label);
      if (!subId) {
        rejected += 1;
        rejectedItems.push({ item: proposed.label, reason: 'Invalid subtopic id.' });
        continue;
      }
      if (vertical.subtopics.find(s => s.id === subId)) {
        rejected += 1;
        rejectedItems.push({ item: proposed.label, reason: `Subtopic ${subId} already exists.` });
        continue;
      }

      const tactics = (proposed.tactics || [])
        .filter(t => t?.template)
        .map(t => buildProposedTactic(proposed.verticalId, subId, t.template, t.notes));
      const methods = Array.isArray(proposed.methods) && proposed.methods.length > 0
        ? proposed.methods.map((m) => method(slugify(m.id || m.label || 'search'), m.label || 'Search Queries',
          (m.tactics || []).filter(t => t?.template).map(t => buildProposedTactic(proposed.verticalId, subId, t.template, t.notes)),
          m.description
        ))
        : undefined;

      const subItem: ResearchSubtopic = {
        id: subId,
        label: proposed.label,
        description: proposed.description,
        methods: methods && methods.length > 0 ? methods : [method(DEFAULT_METHOD_ID, 'Search Queries', tactics)],
        provenance: ensureProvenance(undefined, provenanceTag)
      };

      vertical.subtopics.push(subItem);
      ensureSubtopicInStore(proposed.verticalId, subItem);
      accepted += 1;
      acceptedItems.push(`subtopic:${proposed.label}`);
    }
  }

  if (Array.isArray(proposals?.tactics)) {
    for (const proposed of proposals.tactics) {
      if (!proposed?.template || !proposed.verticalId || !proposed.subtopicId) continue;
      addTactic(proposed.verticalId, proposed.subtopicId, proposed.methodId || DEFAULT_METHOD_ID, proposed.template, proposed.notes);
    }
  }

  if (accepted > 0) {
    store.updatedAt = now;
    saveTaxonomyStore(store);
  }

  return { accepted, rejected, acceptedItems, rejectedItems };
};
