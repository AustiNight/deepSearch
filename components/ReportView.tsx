import React from 'react';
import { FinalReport } from '../types';
import ReactMarkdown from 'react-markdown';
import { Download, FileText, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';
import { ReportVisualizations } from './ReportVisualizations';

interface Props {
  report: FinalReport;
}

type MarkdownBlock =
  | { type: 'markdown'; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

const PRIMARY_RECORD_LABELS: Record<string, string> = {
  assessor_parcel: 'Assessor / Parcel',
  tax_collector: 'Tax Collector',
  deed_recorder: 'Deed Recorder',
  zoning_gis: 'Zoning / GIS',
  permits: 'Permits',
  code_enforcement: 'Code Enforcement',
  assessor_or_tax: 'Assessor / Tax Roll',
  permits_or_cases: 'Permits / Case Logs',
  zoning_land_use: 'Zoning / Land Use',
  parcel_geometry: 'Parcel Geometry',
  police_311_signals: 'Police / 311 Signals',
  governance_section: 'Governance Section',
  economy_section: 'Economy Section'
};

const formatRecordTypeLabel = (recordType: string) =>
  PRIMARY_RECORD_LABELS[recordType] || recordType.replace(/_/g, ' ');

const formatConfidenceLabel = (confidence?: number) => {
  if (typeof confidence !== 'number') return null;
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  return 'Low';
};

const confidenceBadgeClasses = (confidence?: number) => {
  if (typeof confidence !== 'number') return 'text-gray-400 bg-gray-800/40 border-gray-700';
  if (confidence >= 0.8) return 'text-emerald-200 bg-emerald-500/15 border-emerald-500/40';
  if (confidence >= 0.6) return 'text-yellow-200 bg-yellow-500/15 border-yellow-500/40';
  return 'text-red-200 bg-red-500/15 border-red-500/40';
};

const formatPortalLabel = (portalUrl?: string) => {
  if (!portalUrl) return null;
  try {
    return new URL(portalUrl).hostname.replace(/^www\./, '');
  } catch (_) {
    return portalUrl;
  }
};

const formatSloStatus = (status?: string) => {
  if (status === 'met') return 'Met';
  if (status === 'missed') return 'Missed';
  return 'N/A';
};

const formatPercent = (value?: number) => {
  if (typeof value !== 'number') return 'N/A';
  return `${Math.round(value * 100)}%`;
};

const formatMs = (value?: number) => {
  if (typeof value !== 'number') return 'N/A';
  return `${Math.round(value)}ms`;
};

const toFileSlug = (value: string) => {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? slug.slice(0, 48) : 'report';
};

const formatFileDate = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}${month}${day}`;
};

const formatDisplayDate = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(value);

const truncateText = (value: string, max: number) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
};

const coerceText = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  try {
    return JSON.stringify(value, null, 2);
  } catch (_) {
    return String(value);
  }
};

const normalizeSectionLabel = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const isGovernanceSection = (title: string) => {
  const normalized = normalizeSectionLabel(title);
  return normalized.includes('governance') || normalized.includes('government') || normalized.includes('policy');
};

const isEconomySection = (title: string) => {
  const normalized = normalizeSectionLabel(title);
  return normalized.includes('economy') || normalized.includes('economic') || normalized.includes('employment');
};

const extractDataGapMessage = (content: string) => {
  const trimmed = content.trim();
  if (!trimmed) return null;
  if (!/^data gap:/i.test(trimmed)) return null;
  return trimmed.replace(/^data gap:\s*/i, '').trim() || null;
};

const isTableDivider = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return /^\|?(\s*:?-{3,}:?\s*\|)+\s*$/.test(trimmed);
};

const isTableRow = (line: string) => {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 1;
};

const splitTableRow = (line: string) => {
  const trimmed = line.trim();
  const raw = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  const cells: string[] = [];
  let current = '';
  let escaping = false;
  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }
    if (char === '\\') {
      escaping = true;
      continue;
    }
    if (char === '|') {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.length > 0 || raw.endsWith('|')) {
    cells.push(current.trim());
  }
  return cells.map((cell) => cell.replace(/\\\|/g, '|').replace(/\\\\/g, '\\'));
};

const parseMarkdownBlocks = (content: string): MarkdownBlock[] => {
  const lines = content.split('\n');
  const blocks: MarkdownBlock[] = [];
  let buffer: string[] = [];
  let i = 0;

  const flushBuffer = () => {
    const text = buffer.join('\n').trim();
    if (text) {
      blocks.push({ type: 'markdown', content: text });
    }
    buffer = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    if (isTableRow(line) && isTableDivider(nextLine)) {
      flushBuffer();
      const headers = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }
    buffer.push(line);
    i += 1;
  }

  flushBuffer();
  return blocks;
};

const MarkdownDataTable: React.FC<{ headers: string[]; rows: string[][] }> = ({
  headers,
  rows
}) => (
  <div className="not-prose my-6 overflow-x-auto rounded-lg border border-gray-700 bg-black/30 print:bg-white print:border-gray-300 print-avoid-break print:overflow-visible">
    <table className="min-w-full border-collapse text-left text-sm text-gray-200 print:text-black">
      <thead className="bg-gray-900/60 text-cyber-blue print:bg-gray-100 print:text-black">
        <tr>
          {headers.map((header, index) => (
            <th
              key={`${header}-${index}`}
              scope="col"
              className="px-3 py-2 font-semibold border-b border-gray-700 print:border-gray-300"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800 print:divide-gray-300">
        {rows.map((row, rowIndex) => {
          const normalizedRow = headers.map((_, index) => row[index] ?? '');
          return (
            <tr key={`row-${rowIndex}`} className="hover:bg-gray-800/40 print:hover:bg-white">
              {normalizedRow.map((cell, cellIndex) => (
                <td
                  key={`cell-${rowIndex}-${cellIndex}`}
                  className="px-3 py-2 align-top border-b border-gray-800 print:border-gray-300"
                >
                  {cell}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const renderMarkdownBlocks = (content: string) => {
  const blocks = parseMarkdownBlocks(content);
  return blocks.map((block, index) => {
    if (block.type === 'table') {
      return (
        <MarkdownDataTable
          key={`table-${index}`}
          headers={block.headers}
          rows={block.rows}
        />
      );
    }
    return (
      <ReactMarkdown
        key={`markdown-${index}`}
        className="text-gray-300 leading-relaxed print:text-black"
      >
        {block.content}
      </ReactMarkdown>
    );
  });
};

export const ReportView: React.FC<Props> = ({ report }) => {
  const primaryRecordCoverage = report.provenance?.primaryRecordCoverage;
  const compliance = report.provenance?.compliance;
  const sloGate = report.provenance?.sloGate;
  const isCoverageComplete = primaryRecordCoverage ? primaryRecordCoverage.complete : true;
  const missingEntries = primaryRecordCoverage?.entries?.filter(
    (entry) => entry.status !== 'covered' && entry.status !== 'unavailable'
  ) || [];
  const unavailableEntries = primaryRecordCoverage?.entries?.filter(
    (entry) => entry.status === 'unavailable'
  ) || [];
  const hasUnavailable = unavailableEntries.length > 0;
  const datasetCompliance = report.provenance?.datasetCompliance || [];
  const hasDatasetCompliance = datasetCompliance.length > 0;
  const dataGaps = report.propertyDossier?.dataGaps || [];
  const hasDataGaps = dataGaps.length > 0;
  const dataGapRecordTypes = new Set(
    dataGaps.map((gap) => gap.recordType).filter((recordType): recordType is string => Boolean(recordType))
  );
  const bibliographySources = Array.from(
    new Set(
      report.sections.flatMap((section) => section.sources || []).filter(Boolean)
    )
  );
  const hasBibliography = bibliographySources.length > 0;
  const printDate = new Date();
  const summaryText = coerceText(report.summary, 'No summary available.');
  const methodAuditText = coerceText(report.provenance?.methodAudit, 'Method audit unavailable.');

  const isSectionDataGap = (section: FinalReport['sections'][number]) => {
    const contentText = coerceText(section.content, '');
    if (extractDataGapMessage(contentText)) return true;
    if (isGovernanceSection(section.title)) return dataGapRecordTypes.has('governance_section');
    if (isEconomySection(section.title)) return dataGapRecordTypes.has('economy_section');
    return false;
  };

  const sectionsWithNoSources = report.sections.filter((section) => {
    const sources = Array.isArray(section.sources) ? section.sources.filter(Boolean) : [];
    return sources.length === 0 && !isSectionDataGap(section);
  });
  const hasCitationIssues = sectionsWithNoSources.length > 0;
  const hasSectionDataGaps = report.sections.some((section) => isSectionDataGap(section));
  const hasEvidenceGaps = hasSectionDataGaps || hasCitationIssues || hasDataGaps;
  const isOverseerVerified = isCoverageComplete && !hasEvidenceGaps;
  const verificationDetail = (() => {
    if (!isCoverageComplete) {
      return 'Primary Records Incomplete';
    }
    if (hasSectionDataGaps || hasDataGaps) {
      return 'Data Gaps Present';
    }
    if (hasCitationIssues) {
      return 'Missing Verified Sources';
    }
    return hasUnavailable ? 'Coverage Complete (Unavailable Records)' : 'Exhaustive Search Complete';
  })();

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overseer-report-${Date.now()}.json`;
    a.click();
  };

  const exportPdf = () => {
    if (typeof window === 'undefined') return;
    const now = new Date();
    const filename = `deepsearch-report-${toFileSlug(report.title)}-${formatFileDate(now)}.pdf`;
    const originalTitle = document.title;
    const body = document.body;
    let restored = false;

    const restore = () => {
      if (restored) return;
      restored = true;
      document.title = originalTitle;
      if (body.dataset.printing) delete body.dataset.printing;
    };

    document.title = filename;
    body.dataset.printing = 'true';
    window.addEventListener('afterprint', restore, { once: true });
    window.setTimeout(restore, 3000);
    window.print();
  };

  return (
    <div className="report-print bg-cyber-gray border border-gray-700 rounded-lg p-8 max-w-4xl mx-auto shadow-2xl print:bg-white print:text-black print:border-gray-300 print:shadow-none print:max-w-none print:mx-0 print:rounded-none">
      <div className="hidden print:block mb-4 border-b border-gray-300 pb-2 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">DeepSearch Report</span>
          <span>Generated {formatDisplayDate(printDate)}</span>
        </div>
      </div>
      <div className="flex justify-between items-start border-b border-gray-700 pb-6 mb-6 print:border-gray-300">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">{report.title}</h1>
           <div className={`flex items-center gap-2 text-sm ${isOverseerVerified ? 'text-cyber-green' : 'text-yellow-400'}`}>
             {isOverseerVerified ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
             <span>
               {isOverseerVerified ? 'Overseer Verified' : 'Evidence Gaps'} • {verificationDetail}
             </span>
           </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={exportPdf}
            className="flex items-center gap-2 px-4 py-2 bg-cyber-blue/20 hover:bg-cyber-blue/30 rounded-md text-sm transition-colors text-cyber-blue"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={downloadJson}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>
      </div>

      {!isCoverageComplete && missingEntries.length > 0 && (
        <div className="mb-6 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-100">
          <p className="font-semibold">Primary record coverage is incomplete.</p>
          <p className="mt-1 text-yellow-200/80">
            Missing or restricted records: {missingEntries.map((entry) => {
              const label = formatRecordTypeLabel(entry.recordType);
              const status = entry.availabilityStatus || entry.status;
              return `${label} (${status})`;
            }).join(', ')}
          </p>
        </div>
      )}
      {hasUnavailable && (
        <div className="mb-6 rounded-lg border border-sky-500/40 bg-sky-500/10 p-4 text-sm text-sky-100">
          <p className="font-semibold">Some primary records are unavailable in this jurisdiction.</p>
          <p className="mt-1 text-sky-200/80">
            Unavailable records: {unavailableEntries.map((entry) => {
              const label = formatRecordTypeLabel(entry.recordType);
              const status = entry.availabilityStatus || entry.status;
              return `${label} (${status})`;
            }).join(', ')}
          </p>
        </div>
      )}
      {hasDataGaps && (
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Data gaps were detected in the report narrative.</p>
          <p className="mt-1 text-amber-200/80">
            Any section marked as a Data Gap is withheld until parcel/address evidence is available.
          </p>
        </div>
      )}
      {hasCitationIssues && (
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Some sections have no verified sources.</p>
          <p className="mt-1 text-amber-200/80">
            Those sections are not labeled Overseer Verified until citations are provided.
          </p>
        </div>
      )}

      <div className="prose prose-invert max-w-none print:text-black">
        <div className="bg-gray-900/50 p-6 rounded-lg mb-8 border-l-4 border-cyber-blue print:bg-gray-100 print:border-gray-300">
          <h3 className="text-cyber-blue mt-0 print:text-black">Executive Summary</h3>
          <p className="text-gray-300 leading-relaxed print:text-black">{summaryText}</p>
        </div>

        <ReportVisualizations visualizations={report.visualizations || []} />

        {report.sections.map((section, idx) => {
          const sectionSources = Array.isArray(section.sources) ? section.sources.filter(Boolean) : [];
          const hasSources = sectionSources.length > 0;
          const isDataGapSection = isSectionDataGap(section);
          const dataGapMessage = extractDataGapMessage(coerceText(section.content, ''));
          const contentText = coerceText(section.content, '');
          const contentToRender = dataGapMessage ? '' : contentText;
          return (
          <div key={idx} className="mb-8 print-avoid-break">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-2 mb-4 print:border-gray-300">
              <h2 className="text-xl font-bold text-white print:text-black">
                {idx + 1}. {section.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {isDataGapSection && (
                  <span className="text-[11px] uppercase tracking-wide text-amber-200 border border-amber-500/40 bg-amber-500/10 px-2 py-1 rounded-full print:text-gray-700 print:border-gray-300 print:bg-white">
                    Data Gap
                  </span>
                )}
                {!isDataGapSection && !hasSources && (
                  <span className="text-[11px] uppercase tracking-wide text-amber-200 border border-amber-500/40 bg-amber-500/10 px-2 py-1 rounded-full print:text-gray-700 print:border-gray-300 print:bg-white">
                    No Verified Sources
                  </span>
                )}
                {typeof section.confidence === 'number' && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full border print:border-gray-300 print:bg-white print:text-gray-700 ${confidenceBadgeClasses(
                      section.confidence
                    )}`}
                  >
                    Confidence: {(section.confidence * 100).toFixed(0)}% ({formatConfidenceLabel(section.confidence)})
                  </span>
                )}
              </div>
            </div>
            {isDataGapSection && (
              <div className="mb-4 rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100 print:bg-white print:border-gray-300 print:text-gray-700">
                <p className="font-semibold">Data Gap</p>
                <p className="mt-1 text-amber-200/80">
                  {dataGapMessage ||
                    'Address/parcel evidence is required before macro-scale context can be used. See Data Gaps & Next Steps for source pointers.'}
                </p>
              </div>
            )}
            {contentToRender && (
              <div className="mb-4 space-y-4">{renderMarkdownBlocks(contentToRender)}</div>
            )}
            {hasSources ? (
              <div className="bg-black/20 p-3 rounded text-xs print:bg-gray-100 print:border print:border-gray-300 print:text-black">
                <span className="font-bold text-gray-500 block mb-2 print:text-gray-700">SOURCES:</span>
                <div className="flex flex-wrap gap-2">
                  {sectionSources.map((src, i) => (
                    <a 
                      key={i} 
                      href={src.startsWith('http') ? src : '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyber-blue hover:underline bg-blue-900/20 px-2 py-1 rounded print:text-black print:bg-transparent print:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {new URL(src.startsWith('http') ? src : 'https://example.com').hostname.replace('www.', '')}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-yellow-500 font-mono print:text-gray-600">
                No verified sources for this section.
              </div>
            )}
          </div>
        )})}

        {hasDataGaps && (
          <div className="mt-10 rounded-lg border border-gray-800 bg-black/30 p-4 text-xs text-gray-300 print:bg-white print:border-gray-300 print:text-black print-avoid-break">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 print:text-gray-700">Data Gaps & Next Steps</p>
            <div className="mt-3 space-y-3">
              {dataGaps.map((gap, index) => {
                const label = gap.recordType
                  ? formatRecordTypeLabel(gap.recordType)
                  : (gap.fieldPath || `Gap ${index + 1}`);
                const expectedSources = gap.expectedSources || [];
                return (
                  <div key={`${gap.id}-${index}`} className="rounded border border-gray-800 bg-gray-900/40 p-3 print:bg-white print:border-gray-300">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-white print:text-black">
                      <span>{label}</span>
                      {gap.status && (
                        <span className="text-[10px] uppercase tracking-wide text-amber-200 print:text-gray-700">
                          {gap.status}
                        </span>
                      )}
                      {gap.severity && (
                        <span className="text-[10px] uppercase tracking-wide text-gray-500 print:text-gray-600">
                          {gap.severity}
                        </span>
                      )}
                    </div>
                    {gap.description && (
                      <div className="mt-1 text-gray-300 print:text-gray-800">{gap.description}</div>
                    )}
                    {gap.reason && (
                      <div className="mt-1 text-gray-400 print:text-gray-700">Reason: {gap.reason}</div>
                    )}
                    {gap.impact && (
                      <div className="mt-1 text-gray-500 print:text-gray-600">Impact: {gap.impact}</div>
                    )}
                    {expectedSources.length > 0 && (
                      <div className="mt-2 space-y-1 text-[11px] text-gray-400 print:text-gray-700">
                        <div className="text-[10px] uppercase tracking-wide text-gray-500 print:text-gray-600">Expected Sources</div>
                        {expectedSources.map((source, sourceIndex) => {
                          const portalLabel = formatPortalLabel(source.portalUrl);
                          return (
                            <div key={`${source.label}-${sourceIndex}`}>
                              <span className="text-gray-300 print:text-gray-800">{source.label}</span>
                              {portalLabel && (
                                <span className="ml-2 text-gray-500 print:text-gray-600">Portal: {portalLabel}</span>
                              )}
                              {source.portalUrl && (
                                <a
                                  href={source.portalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 inline-flex items-center gap-1 text-cyber-blue hover:underline print:text-black print:underline"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Link
                                </a>
                              )}
                              {source.endpoint && (
                                <span className="ml-2 text-gray-500 print:text-gray-600">Endpoint: {source.endpoint}</span>
                              )}
                              {source.query && (
                                <span className="ml-2 text-gray-500 print:text-gray-600">Query: {source.query}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sloGate && (
          <div className="mt-8 rounded-lg border border-gray-800 bg-black/30 p-4 text-xs text-gray-300 print:bg-white print:border-gray-300 print:text-black print-avoid-break">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 print:text-gray-700">Release SLO Gate</p>
            <div className="mt-2 space-y-2 text-gray-400 print:text-gray-700">
              <div>
                Status:{' '}
                <span className={sloGate.gateStatus === 'blocked' ? 'text-amber-300 print:text-gray-700' : 'text-emerald-200 print:text-gray-700'}>
                  {sloGate.gateStatus === 'blocked' ? 'Blocked' : 'Clear'}
                </span>
              </div>
              <div>
                Parcel resolution:{' '}
                <span className="text-gray-200 print:text-gray-800">
                  {formatPercent(sloGate.parcelResolution.actual)} / target {formatPercent(sloGate.parcelResolution.target)} ({formatSloStatus(sloGate.parcelResolution.status)})
                </span>
              </div>
              <div>
                Evidence recovery:{' '}
                <span className="text-gray-200 print:text-gray-800">
                  {formatPercent(sloGate.evidenceRecovery.actual)} / target {formatPercent(sloGate.evidenceRecovery.target)} ({formatSloStatus(sloGate.evidenceRecovery.status)})
                </span>
              </div>
              <div>
                Median latency:{' '}
                <span className="text-gray-200 print:text-gray-800">
                  {formatMs(sloGate.medianLatencyMs.actual)} / target {formatMs(sloGate.medianLatencyMs.target)} ({formatSloStatus(sloGate.medianLatencyMs.status)})
                </span>
              </div>
              <div>
                Window: <span className="text-gray-200 print:text-gray-800">{sloGate.totalRuns} runs (max {sloGate.windowSize})</span>
              </div>
            </div>
            {sloGate.gateReasons && sloGate.gateReasons.length > 0 && (
              <div className="mt-3 space-y-1 text-[11px] text-amber-300 print:text-gray-700">
                {sloGate.gateReasons.slice(0, 3).map((reason, idx) => (
                  <div key={`slo-reason-${idx}`}>{reason}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {compliance && (
          <div className="mt-8 rounded-lg border border-gray-800 bg-black/30 p-4 text-xs text-gray-300 print:bg-white print:border-gray-300 print:text-black print-avoid-break">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 print:text-gray-700">Compliance Gate</p>
            <div className="mt-2 space-y-2 text-gray-400 print:text-gray-700">
              <div>
                Mode: <span className="text-gray-200 print:text-gray-800">{compliance.mode}</span>
              </div>
              {typeof compliance.zeroCostMode === "boolean" && (
                <div>
                  Zero-cost mode:{" "}
                  <span className="text-gray-200 print:text-gray-800">{compliance.zeroCostMode ? "enabled" : "disabled"}</span>
                </div>
              )}
              {compliance.gateStatus === "signoff_required" && (
                <div className="text-amber-300 print:text-gray-700">
                  Sign-off required before rollout. Set approver + date in compliance policy.
                </div>
              )}
              {compliance.reviewRequired && (
                <div className="text-amber-300 print:text-gray-700">
                  Compliance review required{compliance.reviewItems?.length ? ` (${compliance.reviewItems.length})` : ""}.
                </div>
              )}
              {compliance.blockedSources.length > 0 && (
                <div className="text-amber-300 print:text-gray-700">
                  Blocked sources: {compliance.blockedSources.length}
                </div>
              )}
            </div>
            {compliance.blockedSources.length > 0 && (
              <div className="mt-3 space-y-1 text-gray-400 print:text-gray-700">
                {compliance.blockedSources.slice(0, 6).map((entry, idx) => (
                  <div key={`${entry.uri}-${idx}`} className="text-[11px] text-gray-400 print:text-gray-600">
                    {entry.domain} — {entry.reason}
                  </div>
                ))}
              </div>
            )}
            {compliance.reviewItems && compliance.reviewItems.length > 0 && (
              <div className="mt-3 space-y-1 text-[11px] text-gray-400 print:text-gray-700">
                {compliance.reviewItems.slice(0, 6).map((entry, idx) => (
                  <div key={`${entry.datasetTitle || "review"}-${idx}`}>
                    {(entry.datasetTitle || entry.datasetId || "Dataset")} — {entry.reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {hasDatasetCompliance && (
          <div className="mt-10 rounded-lg border border-gray-800 bg-black/20 p-4 text-xs text-gray-300 print:bg-white print:border-gray-300 print:text-black print-avoid-break">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 print:text-gray-700">Dataset Compliance</p>
            <div className="mt-3 space-y-3">
              {datasetCompliance.map((entry, index) => {
                const portalLabel = formatPortalLabel(entry.portalUrl);
                const datasetLink = entry.homepageUrl || entry.dataUrl;
                const accessConstraints = entry.accessConstraints?.filter(Boolean) || [];
                const termsText = entry.termsOfService ? truncateText(entry.termsOfService, 160) : null;
                return (
                  <div key={`${entry.datasetId || entry.title}-${index}`} className="rounded border border-gray-800 bg-gray-900/40 p-3 print:bg-white print:border-gray-300">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-white print:text-black">
                      {datasetLink ? (
                        <a
                          href={datasetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyber-blue hover:underline print:text-black print:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {entry.title}
                        </a>
                      ) : (
                        <span>{entry.title}</span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-gray-400 print:text-gray-700">
                      {entry.complianceAction && entry.complianceAction !== "allow" && (
                        <div className="text-amber-300 print:text-gray-700">
                          Compliance: {entry.complianceAction.toUpperCase()}
                        </div>
                      )}
                      {entry.attribution && (
                        <div>
                          Attribution: <span className="text-gray-300 print:text-gray-800">{entry.attribution}</span>
                          {entry.attributionRequired && entry.attributionStatus !== "ok" && (
                            <span className="ml-2 text-amber-300 print:text-gray-700">Missing required fields</span>
                          )}
                        </div>
                      )}
                      {portalLabel && (
                        <div>Portal: <span className="text-gray-300 print:text-gray-800">{portalLabel}</span></div>
                      )}
                      {entry.license && (
                        <div>
                          License: <span className="text-gray-300 print:text-gray-800">{entry.license}</span>
                          {entry.licenseUrl && (
                            <a
                              href={entry.licenseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center gap-1 text-cyber-blue hover:underline print:text-black print:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link
                            </a>
                          )}
                        </div>
                      )}
                      {(termsText || entry.termsUrl) && (
                        <div>
                          Terms: {termsText && <span className="text-gray-300 print:text-gray-800">{termsText}</span>}
                          {entry.termsUrl && (
                            <a
                              href={entry.termsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center gap-1 text-cyber-blue hover:underline print:text-black print:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link
                            </a>
                          )}
                        </div>
                      )}
                      {accessConstraints.length > 0 && (
                        <div>
                          Access: <span className="text-gray-300 print:text-gray-800">{accessConstraints.join(', ')}</span>
                        </div>
                      )}
                      {(entry.lastUpdated || entry.retrievedAt) && (
                        <div className="text-gray-500 print:text-gray-600">
                          {entry.lastUpdated && <span>Updated: {entry.lastUpdated}</span>}
                          {entry.lastUpdated && entry.retrievedAt && <span> • </span>}
                          {entry.retrievedAt && <span>Retrieved: {entry.retrievedAt}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hasBibliography && (
          <div className="mt-10 rounded-lg border border-gray-800 bg-black/20 p-4 text-xs text-gray-300 print:bg-white print:border-gray-300 print:text-black print-avoid-break">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 print:text-gray-700">Bibliography</p>
            <div className="mt-3 space-y-2">
              {bibliographySources.map((source, index) => (
                <div key={`${source}-${index}`} className="flex items-start gap-2">
                  <span className="text-gray-500 print:text-gray-600">{index + 1}.</span>
                  {source.startsWith('http') ? (
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-cyber-blue hover:underline print:text-black print:underline"
                    >
                      {source}
                    </a>
                  ) : (
                    <span className="break-all text-gray-300 print:text-gray-800">{source}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <details className="mt-12 rounded-lg border border-gray-800 bg-black/20 p-4 text-xs text-gray-300 print:bg-white print:border-gray-300 print:text-black print-avoid-break">
          <summary className="cursor-pointer select-none text-[11px] uppercase tracking-wide text-gray-500 print:text-gray-700">
            Methodology & Audit
          </summary>
          <div className="mt-3 space-y-2 text-gray-400 print:text-gray-700">
            <div>
              Method audit: <span className="text-gray-200 print:text-gray-800">{methodAuditText}</span>
            </div>
            <div>
              Total sources indexed: <span className="text-gray-200 print:text-gray-800">{report.provenance.totalSources}</span>
            </div>
          </div>
        </details>
        <div className="hidden print:block mt-6 pt-4 border-t border-gray-300 text-[10px] text-gray-600">
          <div className="flex items-center justify-between">
            <span>DeepSearch Overseer • PDF Export</span>
            <span>{formatDisplayDate(printDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
