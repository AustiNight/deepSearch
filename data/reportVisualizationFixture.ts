import type { FinalReport } from '../types';

export const reportVisualizationFixture: FinalReport = {
  title: 'Fixture: Visualization Coverage',
  summary: 'Fixture report to validate chart and image rendering across themes and print views.',
  sections: [
    {
      title: 'Narrative Summary',
      content:
        'This fixture pairs narrative content with a set of visualizations: a bar chart, line chart, area chart, and a media card.',
      sources: []
    }
  ],
  visualizations: [
    {
      type: 'bar',
      title: 'Market Share by Segment',
      caption: 'Shares shown as percentages for the last reported year.',
      sources: ['https://example.com/market-share'],
      data: {
        labels: ['Enterprise', 'Mid-Market', 'SMB', 'Consumer'],
        series: [
          { name: 'Brand A', data: [42, 35, 27, 18] },
          { name: 'Brand B', data: [30, 28, 22, 14] }
        ],
        unit: '%'
      }
    },
    {
      type: 'line',
      title: 'Revenue Growth Trend',
      caption: 'Quarterly revenue in billions (USD).',
      sources: ['https://example.com/revenue'],
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q1 +1', 'Q2 +1'],
        series: [
          { name: 'Actual', data: [2.1, 2.4, 2.7, 2.9, 3.1, 3.3] },
          { name: 'Consensus', data: [2.0, 2.3, 2.6, 2.8, 3.0, 3.2] }
        ],
        unit: '$'
      }
    },
    {
      type: 'area',
      title: 'Customer Adoption Curve',
      caption: 'Indexed adoption (baseline = 100).',
      sources: ['https://example.com/adoption'],
      data: {
        labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
        series: [{ name: 'Adoption Index', data: [100, 132, 168, 205, 238, 265] }],
        unit: '{value}'
      }
    },
    {
      type: 'image',
      title: 'Reference Architecture Diagram',
      caption: 'System layout illustrating the data flow for the platform stack.',
      sources: ['https://example.com/architecture'],
      data: {
        url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
        alt: 'Sample architecture placeholder image'
      }
    }
  ],
  provenance: {
    totalSources: 0,
    methodAudit: 'Fixture only.'
  },
  schemaVersion: 1
};
