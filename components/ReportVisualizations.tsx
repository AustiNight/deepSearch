import React from 'react';
import type { Visualization, ChartVisualization, ImageVisualization } from '../types';
import { ExternalLink } from 'lucide-react';

interface Props {
  visualizations: Visualization[];
}

const CHART_COLORS = ['#38bdf8', '#f97316', '#34d399', '#facc15'];
const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

const formatValueWithUnit = (value: number, unit?: string) => {
  const formatted = numberFormatter.format(value);
  if (!unit) return formatted;
  if (unit.includes('{value}')) return unit.replace('{value}', formatted);
  const trimmed = unit.trim();
  if (trimmed.startsWith('$') || trimmed.startsWith('€') || trimmed.startsWith('£')) {
    return `${trimmed}${formatted}`;
  }
  return `${formatted} ${trimmed}`;
};

const SourcePills: React.FC<{ sources?: string[] }> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs">
      {sources.map((src, i) => {
        const href = src.startsWith('http') ? src : '#';
        const hostname = new URL(href === '#' ? 'https://example.com' : href).hostname.replace('www.', '');
        return (
          <a
            key={`${src}-${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded bg-blue-900/20 px-2 py-1 text-cyber-blue hover:underline print:bg-white print:text-black"
          >
            <ExternalLink className="h-3 w-3" />
            {hostname}
          </a>
        );
      })}
    </div>
  );
};

const ChartLegend: React.FC<{ series: ChartVisualization['data']['series'] }> = ({ series }) => (
  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
    {series.map((entry, index) => (
      <div key={`${entry.name}-${index}`} className="flex items-center gap-2">
        <span
          className="inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: entry.color || CHART_COLORS[index % CHART_COLORS.length] }}
        />
        <span>{entry.name}</span>
      </div>
    ))}
  </div>
);

const ChartSvg: React.FC<{ visualization: ChartVisualization }> = ({ visualization }) => {
  const { data, type } = visualization;
  const labels = data.labels;
  const series = data.series.map((entry, index) => ({
    ...entry,
    color: entry.color || CHART_COLORS[index % CHART_COLORS.length]
  }));
  const values = series.flatMap((entry) => entry.data);
  if (values.length === 0) return null;

  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const range = maxValue - minValue || 1;

  const width = 640;
  const height = 320;
  const padding = { top: 24, right: 24, bottom: 52, left: 52 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const pointCount = labels.length;
  const xStep = pointCount > 1 ? plotWidth / (pointCount - 1) : plotWidth;

  const xForIndex = (index: number) =>
    padding.left + (pointCount > 1 ? xStep * index : plotWidth / 2);
  const yForValue = (value: number) =>
    padding.top + plotHeight - ((value - minValue) / range) * plotHeight;
  const baselineY = yForValue(0);

  const gridLines = Array.from({ length: 5 }).map((_, idx) => {
    const ratio = idx / 4;
    const y = padding.top + plotHeight * ratio;
    const value = maxValue - range * ratio;
    return { y, value };
  });

  const labelStep = Math.max(1, Math.ceil(pointCount / 6));

  const renderLinePath = (points: number[]) =>
    points
      .map((value, index) => {
        const x = xForIndex(index);
        const y = yForValue(value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

  const renderAreaPath = (points: number[]) => {
    const linePath = renderLinePath(points);
    const lastX = xForIndex(points.length - 1);
    const firstX = xForIndex(0);
    return `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  };

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={visualization.title}
        className="h-auto w-full"
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={16}
          className="fill-transparent"
        />
        {gridLines.map((line, idx) => (
          <g key={`grid-${idx}`}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={line.y}
              y2={line.y}
              stroke="rgba(148,163,184,0.25)"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={line.y + 4}
              textAnchor="end"
              fontSize={11}
              fill="rgba(148,163,184,0.8)"
            >
              {formatValueWithUnit(line.value, data.unit)}
            </text>
          </g>
        ))}
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={baselineY}
          y2={baselineY}
          stroke="rgba(148,163,184,0.4)"
        />
        {type === 'bar' && (
          <g>
            {labels.map((label, labelIndex) => {
              const groupWidth = plotWidth / pointCount;
              const barWidth = Math.max(6, (groupWidth * 0.7) / series.length);
              const groupStart = padding.left + groupWidth * labelIndex;
              const offset = (groupWidth - barWidth * series.length) / 2;
              return series.map((entry, seriesIndex) => {
                const value = entry.data[labelIndex] ?? 0;
                const x = groupStart + offset + barWidth * seriesIndex;
                const yValue = yForValue(value);
                const barHeight = Math.abs(baselineY - yValue);
                const y = value >= 0 ? yValue : baselineY;
                return (
                  <rect
                    key={`${label}-${entry.name}`}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx={3}
                    fill={entry.color}
                    opacity={0.85}
                  />
                );
              });
            })}
          </g>
        )}
        {type !== 'bar' && (
          <g>
            {series.map((entry) => (
              <g key={entry.name}>
                {type === 'area' && (
                  <path d={renderAreaPath(entry.data)} fill={entry.color} opacity={0.2} />
                )}
                <path
                  d={renderLinePath(entry.data)}
                  fill="none"
                  stroke={entry.color}
                  strokeWidth={2.5}
                />
                {entry.data.map((value, index) => (
                  <circle
                    key={`${entry.name}-${index}`}
                    cx={xForIndex(index)}
                    cy={yForValue(value)}
                    r={3}
                    fill={entry.color}
                    stroke="white"
                    strokeWidth={1}
                  />
                ))}
              </g>
            ))}
          </g>
        )}
        {labels.map((label, index) => {
          if (index % labelStep !== 0 && index !== labels.length - 1) return null;
          const x = xForIndex(index);
          return (
            <text
              key={`label-${label}-${index}`}
              x={x}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize={11}
              fill="rgba(148,163,184,0.85)"
            >
              {label}
            </text>
          );
        })}
      </svg>
      <ChartLegend series={series} />
    </div>
  );
};

const ChartCard: React.FC<{ visualization: ChartVisualization }> = ({ visualization }) => (
  <div className="rounded-xl border border-gray-700 bg-black/30 p-5 shadow-lg print:border-gray-300 print:bg-white">
    <div className="mb-3">
      <h4 className="text-lg font-semibold text-white print:text-black">{visualization.title}</h4>
      {visualization.caption ? (
        <p className="text-sm text-gray-400 print:text-gray-700">{visualization.caption}</p>
      ) : null}
    </div>
    <ChartSvg visualization={visualization} />
    <SourcePills sources={visualization.sources} />
  </div>
);

const ImageCard: React.FC<{ visualization: ImageVisualization }> = ({ visualization }) => (
  <div className="rounded-xl border border-gray-700 bg-black/30 p-5 shadow-lg print:border-gray-300 print:bg-white">
    <div className="mb-3">
      <h4 className="text-lg font-semibold text-white print:text-black">{visualization.title}</h4>
      {visualization.caption ? (
        <p className="text-sm text-gray-400 print:text-gray-700">{visualization.caption}</p>
      ) : null}
    </div>
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-black/40 print:border-gray-200 print:bg-white">
      <img
        src={visualization.data.url}
        alt={visualization.data.alt || visualization.title}
        width={visualization.data.width}
        height={visualization.data.height}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-auto w-full object-contain"
      />
    </div>
    <SourcePills sources={visualization.sources} />
  </div>
);

export const ReportVisualizations: React.FC<Props> = ({ visualizations }) => {
  if (!visualizations || visualizations.length === 0) return null;

  return (
    <section className="not-prose mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Visualizations</h3>
        <span className="text-xs text-gray-500">Charts & media derived from report data</span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {visualizations.map((viz, index) => {
          if (viz.type === 'image') {
            return <ImageCard key={`${viz.title}-${index}`} visualization={viz} />;
          }
          return <ChartCard key={`${viz.title}-${index}`} visualization={viz} />;
        })}
      </div>
    </section>
  );
};
