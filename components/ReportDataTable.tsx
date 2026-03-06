import React, { useMemo } from 'react';

export type ColumnAlignment = 'left' | 'center' | 'right';

interface Props {
  headers: string[];
  rows: string[][];
  alignments?: ColumnAlignment[];
}

const URL_ONLY_PATTERN = /^https?:\/\/[^\s]+$/i;
const NUMERIC_VALUE_PATTERN = /^\(?\s*[$€£]?\s*-?\d[\d,]*(\.\d+)?\s*%?\s*\)?$/;

const isNumericValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return NUMERIC_VALUE_PATTERN.test(trimmed);
};

const normalizeCell = (value: string) => {
  const trimmed = value.trim();
  return trimmed || '—';
};

const renderCellContent = (value: string) => {
  const normalized = normalizeCell(value);
  if (URL_ONLY_PATTERN.test(normalized)) {
    return (
      <a
        href={normalized}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyber-blue hover:underline break-all print:text-black print:underline"
      >
        {normalized}
      </a>
    );
  }
  return <span className="whitespace-pre-wrap break-words">{normalized}</span>;
};

const alignmentClass = (alignment: ColumnAlignment) => {
  if (alignment === 'right') return 'text-right';
  if (alignment === 'center') return 'text-center';
  return 'text-left';
};

export const ReportDataTable: React.FC<Props> = ({ headers, rows, alignments }) => {
  const normalizedRows = useMemo(
    () => rows.map((row) => headers.map((_, index) => row[index] ?? '')),
    [rows, headers]
  );

  const inferredNumericColumns = useMemo(
    () =>
      headers.map((_, columnIndex) => {
        const values = normalizedRows
          .map((row) => row[columnIndex])
          .map((value) => value.trim())
          .filter(Boolean);
        if (values.length === 0) return false;
        const numericCount = values.filter((value) => isNumericValue(value)).length;
        return numericCount / values.length >= 0.8;
      }),
    [headers, normalizedRows]
  );

  const resolvedAlignments = useMemo(
    () =>
      headers.map((_, index) => {
        const explicit = alignments?.[index];
        if (explicit) return explicit;
        return inferredNumericColumns[index] ? 'right' : 'left';
      }),
    [headers, alignments, inferredNumericColumns]
  );

  return (
    <div className="not-prose my-6 rounded-xl border border-cyber-blue/30 bg-gradient-to-b from-cyber-blue/10 via-black/20 to-black/30 shadow-[0_10px_35px_rgba(0,240,255,0.08)] print:bg-white print:border-gray-300 print:shadow-none print-avoid-break">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyber-blue/20 text-[11px] font-mono uppercase tracking-wide text-cyber-blue/90 print:text-gray-700 print:border-gray-300">
        <span>Data Table</span>
        <span>{normalizedRows.length} rows • {headers.length} cols</span>
      </div>

      <div className="sm:hidden p-2 space-y-2 print:hidden">
        {normalizedRows.map((row, rowIndex) => (
          <div key={`mobile-row-${rowIndex}`} className="rounded-lg border border-gray-700/70 bg-black/30 p-3">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">
              Row {rowIndex + 1}
            </div>
            <div className="space-y-2">
              {headers.map((header, columnIndex) => (
                <div key={`mobile-cell-${rowIndex}-${columnIndex}`} className="flex items-start justify-between gap-3">
                  <div className="text-[11px] text-gray-400 shrink-0">{header}</div>
                  <div
                    className={`text-[12px] text-gray-200 min-w-0 ${alignmentClass(
                      resolvedAlignments[columnIndex] || 'left'
                    )}`}
                  >
                    {renderCellContent(row[columnIndex])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block overflow-x-auto max-h-[460px] print:block print:max-h-none print:overflow-visible">
        <table className="min-w-full border-collapse text-sm text-gray-200 print:text-black">
          <thead className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm text-cyber-blue print:static print:bg-gray-100 print:text-black">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  scope="col"
                  className={`px-3 py-2 font-semibold border-b border-gray-700 print:border-gray-300 ${alignmentClass(
                    resolvedAlignments[index] || 'left'
                  )}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 print:divide-gray-300">
            {normalizedRows.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className={rowIndex % 2 === 0 ? 'bg-black/20 print:bg-white' : 'bg-gray-900/25 print:bg-gray-50'}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className={`px-3 py-2 align-top border-b border-gray-800 print:border-gray-300 ${alignmentClass(
                      resolvedAlignments[cellIndex] || 'left'
                    )}`}
                  >
                    {renderCellContent(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportDataTable;
