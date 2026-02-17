import type { FinalReport } from '../types';

export const reportTableFixture: FinalReport = {
  title: 'Fixture: Market Overview',
  summary: 'Fixture report used to validate markdown table rendering.',
  sections: [
    {
      title: 'Key Metrics Table',
      content:
        '| Metric | 2024 | 2025 | Notes |\n' +
        '| --- | --- | --- | --- |\n' +
        '| Market Size | $1.2B | $1.4B | CAGR 8% |\n' +
        '| Units Sold | 3.1M | 3.4M | Seasonal lift |\n' +
        '| EBITDA Margin | 18% | 19% | Improving mix |',
      sources: []
    },
    {
      title: 'Narrative Checks',
      content:
        'This section verifies mixed markdown:\n\n' +
        '- Bullet A\n' +
        '- Bullet B\n\n' +
        'A short paragraph after the list.',
      sources: []
    }
  ],
  provenance: {
    totalSources: 0,
    methodAudit: 'Fixture only.'
  }
};
