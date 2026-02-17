import React from 'react';
import { FinalReport } from '../types';
import ReactMarkdown from 'react-markdown';
import { Download, ShieldCheck, ExternalLink } from 'lucide-react';

interface Props {
  report: FinalReport;
}

type MarkdownBlock =
  | { type: 'markdown'; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

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
           <div className="flex items-center gap-2 text-sm text-cyber-green">
             <ShieldCheck className="w-4 h-4" />
             <span>Overseer Verified • Exhaustive Search Complete</span>
           </div>
        </div>
        <button 
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Export JSON
        </button>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-gray-900/50 p-6 rounded-lg mb-8 border-l-4 border-cyber-blue">
          <h3 className="text-cyber-blue mt-0">Executive Summary</h3>
          <p className="text-gray-300 leading-relaxed">{report.summary}</p>
        </div>

        {report.sections.map((section, idx) => (
          <div key={idx} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">
              {idx + 1}. {section.title}
            </h2>
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

        <div className="mt-12 pt-6 border-t border-gray-800 text-xs text-gray-500 font-mono">
          <p>METHOD AUDIT: {report.provenance.methodAudit}</p>
          <p>TOTAL SOURCES INDEXED: {report.provenance.totalSources}</p>
        </div>
      </div>
    </div>
  );
};
