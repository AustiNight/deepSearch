import React from 'react';
import { FinalReport } from '../types';
import ReactMarkdown from 'react-markdown';
import { Download, ShieldCheck, ExternalLink } from 'lucide-react';

interface Props {
  report: FinalReport;
}

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
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
              {section.content}
            </div>
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
