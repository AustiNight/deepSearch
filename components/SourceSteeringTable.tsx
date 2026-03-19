import React, { useMemo } from "react";
import type { OperatorTuning, SourceLearningStats } from "../types";

type ActionType = "boost" | "suppress" | "block" | "unblock" | "pin";

type Props = {
  tuning: OperatorTuning;
  sourceLearning: SourceLearningStats[];
  onAction: (domain: string, action: ActionType) => void;
};

type Row = {
  domain: string;
  bucket: "Preferred" | "Historical" | "Emerging" | "Blocked";
  score: number;
};

export const SourceSteeringTable: React.FC<Props> = ({ tuning, sourceLearning, onAction }) => {
  const rows = useMemo<Row[]>(() => {
    const blocked = new Set((tuning.sourcePolicy.blocked || []).map((d) => d.toLowerCase()));
    const preferred = new Set(Object.keys(tuning.sourcePolicy.preferred || {}).map((d) => d.toLowerCase()));
    const rowsOut: Row[] = [];
    const seen = new Set<string>();
    const addRow = (domain: string, bucket: Row["bucket"], score = 0) => {
      const key = domain.toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      rowsOut.push({ domain: key, bucket, score });
    };
    blocked.forEach((domain) => addRow(domain, "Blocked", 0));
    preferred.forEach((domain) => addRow(domain, "Preferred", tuning.sourcePolicy.preferred[domain] || 0));
    sourceLearning.forEach((entry) => {
      if (blocked.has(entry.domain)) return;
      if (preferred.has(entry.domain)) return;
      if ((entry.runsValidated || 0) > 0) {
        addRow(entry.domain, "Historical", entry.citationSurvivalRate || 0);
      } else {
        addRow(entry.domain, "Emerging", entry.citationSurvivalRate || 0);
      }
    });
    return rowsOut.slice(0, 40);
  }, [sourceLearning, tuning.sourcePolicy.blocked, tuning.sourcePolicy.preferred]);

  return (
    <div className="border border-gray-800 rounded bg-black/40 p-2">
      <div className="text-[11px] font-mono text-gray-400 mb-2">SOURCE STEERING</div>
      <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
        {rows.map((row) => (
          <div key={row.domain} className="border border-gray-800 rounded p-2 text-[10px] font-mono">
            <div className="flex justify-between gap-2">
              <span className="text-gray-200 truncate">{row.domain}</span>
              <span className="text-gray-500">{row.bucket}</span>
            </div>
            <div className="text-gray-500 mb-1">score {Math.round(row.score * 100)}%</div>
            <div className="flex flex-wrap gap-1">
              <button className="px-1 py-0.5 border border-gray-700 text-gray-300" onClick={() => onAction(row.domain, "boost")}>Boost</button>
              <button className="px-1 py-0.5 border border-gray-700 text-gray-300" onClick={() => onAction(row.domain, "suppress")}>Suppress</button>
              <button className="px-1 py-0.5 border border-gray-700 text-gray-300" onClick={() => onAction(row.domain, "pin")}>Pin</button>
              {row.bucket === "Blocked" ? (
                <button className="px-1 py-0.5 border border-amber-700 text-amber-300" onClick={() => onAction(row.domain, "unblock")}>Unblock</button>
              ) : (
                <button className="px-1 py-0.5 border border-red-800 text-red-300" onClick={() => onAction(row.domain, "block")}>Block</button>
              )}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="text-[10px] text-gray-500 font-mono">No domains yet.</div>
        )}
      </div>
    </div>
  );
};

