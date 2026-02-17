export type TaxonomyUpdateFixture = {
  topic: string;
  expectedVerticals: string[];
  expectedBlueprintFields: Record<string, string[]>;
  expectedTacticIds: string[];
  notes?: string;
};

export const taxonomyUpdateFixtures: TaxonomyUpdateFixture[] = [
  {
    topic: 'Jane Doe Dallas Texas property records',
    expectedVerticals: ['individual', 'location'],
    expectedBlueprintFields: {
      individual: ['voterRegistration', 'openDataByLocation'],
      location: ['actuarialAnalysis']
    },
    expectedTacticIds: [
      'individual-civic-voter-registration',
      'individual-civic-open-data-portal',
      'location-actuarial-age-risk'
    ],
    notes: 'Confirms civic records + open data coverage for individuals and actuarial coverage for locations.'
  },
  {
    topic: 'Opioid overdose risk factors Harris County',
    expectedVerticals: ['medical_subject', 'location'],
    expectedBlueprintFields: {
      medical_subject: ['homeopathicTheories', 'actuarialAnalysis'],
      location: ['actuarialAnalysis']
    },
    expectedTacticIds: [
      'medical-homeopathic-theory',
      'medical-actuarial-age-risk',
      'location-actuarial-insurance'
    ],
    notes: 'Validates medical homeopathic context plus actuarial risk tactics.'
  },
  {
    topic: 'Austin zoning ordinance legal analysis',
    expectedVerticals: ['legal_matter', 'location'],
    expectedBlueprintFields: {
      legal_matter: ['openDataByLocation', 'actuarialAnalysis']
    },
    expectedTacticIds: [
      'legal-open-data-portal-city',
      'legal-actuarial-risk'
    ],
    notes: 'Ensures local open data and actuarial analysis are available for legal matters.'
  },
  {
    topic: 'Hurricane Katrina historical studies',
    expectedVerticals: ['event'],
    expectedBlueprintFields: {
      event: ['historicalStudies', 'anthropologicalDiscourse', 'actuarialAnalysis']
    },
    expectedTacticIds: [
      'event-historical-study',
      'event-anthropological-analysis',
      'event-actuarial-risk'
    ],
    notes: 'Checks historical/anthropological + actuarial tactics for events.'
  },
  {
    topic: 'Workplace injury risk by age',
    expectedVerticals: ['general_discovery'],
    expectedBlueprintFields: {
      general_discovery: ['actuarialAnalysis']
    },
    expectedTacticIds: [
      'general-actuarial-risk',
      'general-actuarial-table'
    ],
    notes: 'Confirms actuarial discovery coverage at the fallback level.'
  }
];
