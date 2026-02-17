export type ReceptionFixtureCase = {
  topic: string;
  expectedHints: string[];
  expectedSeedQuery: string;
  notes?: string;
};

export const receptionFixtureCases: ReceptionFixtureCase[] = [
  {
    topic: 'The Great Gatsby reviews',
    expectedHints: ['reception'],
    expectedSeedQuery: '"The Great Gatsby reviews" reviews',
    notes: 'Reception terms should trigger without explicit creative-work keywords.'
  },
  {
    topic: 'The Great Gatsby',
    expectedHints: ['creative_work', 'reception'],
    expectedSeedQuery: '"The Great Gatsby" reviews',
    notes: 'Creative work topics can include reception alongside creative_work.'
  },
  {
    topic: 'Citizen Kane ratings',
    expectedHints: ['creative_work', 'reception'],
    expectedSeedQuery: '"Citizen Kane ratings" reviews',
    notes: 'Ratings language should trigger reception while allowing coexistence.'
  }
];
