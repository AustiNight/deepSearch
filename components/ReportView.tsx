import React from 'react';
import { FinalReport } from '../types';
import ReactMarkdown from 'react-markdown';
import { Download, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';
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
  code_enforcement: 'Code Enforcement'
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

const truncateText = (value: string, max: number) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
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
  <div className="not-prose my-6 overflow-x-auto rounded-lg border border-gray-700 bg-black/30 print:bg-white print:border-gray-300">
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
      <ReactMarkdown key={`markdown-${index}`} className="text-gray-300 leading-relaxed">
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
  const datasetCompliance = report.provenance?.datasetCompliance || [];
  const hasDatasetCompliance = datasetCompliance.length > 0;

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overseer-report-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="bg-cyber-gray border border-gray-700 rounded-lg p-8 max-w-4xl mx-auto shadow-2xl">
      <div className="flex justify-between items-start border-b border-gray-700 pb-6 mb-6">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">{report.title}</h1>
           <div className={`flex items-center gap-2 text-sm ${isCoverageComplete ? 'text-cyber-green' : 'text-yellow-400'}`}>
             {isCoverageComplete ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
             <span>
               Overseer Verified • {isCoverageComplete ? 'Exhaustive Search Complete' : 'Primary Records Incomplete'}
             </span>
           </div>
        </div>
        <button 
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Export JSON
        </button>
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

      <div className="prose prose-invert max-w-none">
        <div className="bg-gray-900/50 p-6 rounded-lg mb-8 border-l-4 border-cyber-blue">
          <h3 className="text-cyber-blue mt-0">Executive Summary</h3>
          <p className="text-gray-300 leading-relaxed">{report.summary}</p>
        </div>

        <ReportVisualizations visualizations={report.visualizations || []} />

        {report.sections.map((section, idx) => (
          <div key={idx} className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-2 mb-4">
              <h2 className="text-xl font-bold text-white">
                {idx + 1}. {section.title}
              </h2>
              {typeof section.confidence === 'number' && (
                <span className={`text-xs px-2 py-1 rounded-full border ${confidenceBadgeClasses(section.confidence)}`}>
                  Confidence: {(section.confidence * 100).toFixed(0)}% ({formatConfidenceLabel(section.confidence)})
                </span>
              )}
            </div>
            <div className="mb-4 space-y-4">{renderMarkdownBlocks(section.content)}</div>
            {section.sources.length > 0 ? (
              <div className="bg-black/20 p-3 rounded text-xs">
                <span className="font-bold text-gray-500 block mb-2">SOURCES:</span>
                <div className="flex flex-wrap gap-2">
                  {section.sources.map((src, i) => (
                    <a 
                      key={i} 
                      href={src.startsWith('http') ? src : '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyber-blue hover:underline bg-blue-900/20 px-2 py-1 rounded"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {new URL(src.startsWith('http') ? src : 'https://example.com').hostname.replace('www.', '')}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-yellow-500 font-mono">
                No verified sources for this section.
              </div>
            )}
          </div>
        ))}

        {sloGate && (
          <div className="mt-8 rounded-lg border border-gray-800 bg-black/30 p-4 text-xs text-gray-300">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Release SLO Gate</p>
            <div className="mt-2 space-y-2 text-gray-400">
              <div>
                Status:{' '}
                <span className={sloGate.gateStatus === 'blocked' ? 'text-amber-300' : 'text-emerald-200'}>
                  {sloGate.gateStatus === 'blocked' ? 'Blocked' : 'Clear'}
                </span>
              </div>
              <div>
                Parcel resolution:{' '}
                <span className="text-gray-200">
                  {formatPercent(sloGate.parcelResolution.actual)} / target {formatPercent(sloGate.parcelResolution.target)} ({formatSloStatus(sloGate.parcelResolution.status)})
                </span>
              </div>
              <div>
                Evidence recovery:{' '}
                <span className="text-gray-200">
                  {formatPercent(sloGate.evidenceRecovery.actual)} / target {formatPercent(sloGate.evidenceRecovery.target)} ({formatSloStatus(sloGate.evidenceRecovery.status)})
                </span>
              </div>
              <div>
                Median latency:{' '}
                <span className="text-gray-200">
                  {formatMs(sloGate.medianLatencyMs.actual)} / target {formatMs(sloGate.medianLatencyMs.target)} ({formatSloStatus(sloGate.medianLatencyMs.status)})
                </span>
              </div>
              <div>
                Window: <span className="text-gray-200">{sloGate.totalRuns} runs (max {sloGate.windowSize})</span>
              </div>
            </div>
            {sloGate.gateReasons && sloGate.gateReasons.length > 0 && (
              <div className="mt-3 space-y-1 text-[11px] text-amber-300">
                {sloGate.gateReasons.slice(0, 3).map((reason, idx) => (
                  <div key={`slo-reason-${idx}`}>{reason}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {compliance && (
          <div className="mt-8 rounded-lg border border-gray-800 bg-black/30 p-4 text-xs text-gray-300">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Compliance Gate</p>
            <div className="mt-2 space-y-2 text-gray-400">
              <div>
                Mode: <span className="text-gray-200">{compliance.mode}</span>
              </div>
              {typeof compliance.zeroCostMode === "boolean" && (
                <div>
                  Zero-cost mode:{" "}
                  <span className="text-gray-200">{compliance.zeroCostMode ? "enabled" : "disabled"}</span>
                </div>
              )}
              {compliance.gateStatus === "signoff_required" && (
                <div className="text-amber-300">
                  Sign-off required before rollout. Set approver + date in compliance policy.
                </div>
              )}
              {compliance.reviewRequired && (
                <div className="text-amber-300">
                  Compliance review required{compliance.reviewItems?.length ? ` (${compliance.reviewItems.length})` : ""}.
                </div>
              )}
              {compliance.blockedSources.length > 0 && (
                <div className="text-amber-300">
                  Blocked sources: {compliance.blockedSources.length}
                </div>
              )}
            </div>
            {compliance.blockedSources.length > 0 && (
              <div className="mt-3 space-y-1 text-gray-400">
                {compliance.blockedSources.slice(0, 6).map((entry, idx) => (
                  <div key={`${entry.uri}-${idx}`} className="text-[11px] text-gray-400">
                    {entry.domain} — {entry.reason}
                  </div>
                ))}
              </div>
            )}
            {compliance.reviewItems && compliance.reviewItems.length > 0 && (
              <div className="mt-3 space-y-1 text-[11px] text-gray-400">
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
          <div className="mt-10 rounded-lg border border-gray-800 bg-black/20 p-4 text-xs text-gray-300">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Dataset Compliance</p>
            <div className="mt-3 space-y-3">
              {datasetCompliance.map((entry, index) => {
                const portalLabel = formatPortalLabel(entry.portalUrl);
                const datasetLink = entry.homepageUrl || entry.dataUrl;
                const accessConstraints = entry.accessConstraints?.filter(Boolean) || [];
                const termsText = entry.termsOfService ? truncateText(entry.termsOfService, 160) : null;
                return (
                  <div key={`${entry.datasetId || entry.title}-${index}`} className="rounded border border-gray-800 bg-gray-900/40 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-white">
                      {datasetLink ? (
                        <a
                          href={datasetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyber-blue hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {entry.title}
                        </a>
                      ) : (
                        <span>{entry.title}</span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-gray-400">
                      {entry.complianceAction && entry.complianceAction !== "allow" && (
                        <div className="text-amber-300">
                          Compliance: {entry.complianceAction.toUpperCase()}
                        </div>
                      )}
                      {entry.attribution && (
                        <div>
                          Attribution: <span className="text-gray-300">{entry.attribution}</span>
                          {entry.attributionRequired && entry.attributionStatus !== "ok" && (
                            <span className="ml-2 text-amber-300">Missing required fields</span>
                          )}
                        </div>
                      )}
                      {portalLabel && (
                        <div>Portal: <span className="text-gray-300">{portalLabel}</span></div>
                      )}
                      {entry.license && (
                        <div>
                          License: <span className="text-gray-300">{entry.license}</span>
                          {entry.licenseUrl && (
                            <a
                              href={entry.licenseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center gap-1 text-cyber-blue hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link
                            </a>
                          )}
                        </div>
                      )}
                      {(termsText || entry.termsUrl) && (
                        <div>
                          Terms: {termsText && <span className="text-gray-300">{termsText}</span>}
                          {entry.termsUrl && (
                            <a
                              href={entry.termsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center gap-1 text-cyber-blue hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link
                            </a>
                          )}
                        </div>
                      )}
                      {accessConstraints.length > 0 && (
                        <div>
                          Access: <span className="text-gray-300">{accessConstraints.join(', ')}</span>
                        </div>
                      )}
                      {(entry.lastUpdated || entry.retrievedAt) && (
                        <div className="text-gray-500">
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

        <div className="mt-12 pt-6 border-t border-gray-800 text-xs text-gray-500 font-mono">
          <p>METHOD AUDIT: {report.provenance.methodAudit}</p>
          <p>TOTAL SOURCES INDEXED: {report.provenance.totalSources}</p>
        </div>
      </div>
    </div>
  );
};
