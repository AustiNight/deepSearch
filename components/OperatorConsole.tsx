import React, { useMemo, useState } from "react";
import type { OperatorExplainabilityEvent, OperatorPhaseCard, OperatorSnapshot, OperatorTuning, SourceLearningStats } from "../types";
import { RunSnapshotBar } from "./RunSnapshotBar";
import { SourceSteeringTable } from "./SourceSteeringTable";

type Props = {
  snapshot: OperatorSnapshot;
  phaseCards: OperatorPhaseCard[];
  tuning: OperatorTuning;
  explainability: OperatorExplainabilityEvent[];
  sourceLearning: SourceLearningStats[];
  onTuningChange: (next: Partial<OperatorTuning>, options?: { disruptive?: boolean }) => void;
};

const pct = (value: number) => `${Math.round(value * 100)}`;

const OPERATOR_FEED_MODE_KEY = "operator.explainability.mode";

const toPlainText = (input: string) => {
  const text = (input || "").trim();
  if (!text) return "No details available.";

  const checkpointMatch = text.match(/^checkpoint reached:\s*(.+)$/i);
  if (checkpointMatch) {
    return `Reached a safe tuning checkpoint (${checkpointMatch[1]}).`;
  }

  const queuedMatch = text.match(/^applied queued tuning at\s+(.+)\s+checkpoint$/i);
  if (queuedMatch) {
    return `Applied queued setting changes at the ${queuedMatch[1]} checkpoint.`;
  }

  const noveltyMatch = text.match(/^round\s+(\d+): novelty\s+([0-9.]+)\s+below floor\s+([0-9.]+); force exploration$/i);
  if (noveltyMatch) {
    return `Round ${noveltyMatch[1]} had low new information (${noveltyMatch[2]} < ${noveltyMatch[3]}), so exploration was increased.`;
  }

  const actionMatch = text.match(/^(.+?):\s*(.+?)\s*->\s*(.+?)(?:\s*\((.+)\))?$/);
  if (actionMatch) {
    const [, phase, decision, action, outcome] = actionMatch;
    const simplify = (value: string) =>
      value
        .replace(/\bspawn\b/gi, "start")
        .replace(/\bhalt\b/gi, "stop")
        .replace(/\bskip\b/gi, "defer")
        .replace(/\bcollect\b/gi, "gather")
        .replace(/\bevaluate\b/gi, "check")
        .replace(/\bqueries?\b/gi, "searches")
        .replace(/\bagents?\b/gi, "workers")
        .replace(/\bnovelty\b/gi, "new information")
        .replace(/\bpreferred\b/gi, "trusted")
        .replace(/\bdomains?\b/gi, "sites")
        .replace(/\bmetrics\b/gi, "measurements")
        .replace(/\s+/g, " ")
        .trim();
    const base = `${phase}: decided to ${simplify(decision)} and ${simplify(action)}.`;
    if (outcome) {
      return `${base} Result: ${simplify(outcome)}.`;
    }
    return base;
  }

  return text;
};

export const OperatorConsole: React.FC<Props> = ({
  snapshot,
  phaseCards,
  tuning,
  explainability,
  sourceLearning,
  onTuningChange
}) => {
  const [showPlainEnglish, setShowPlainEnglish] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(OPERATOR_FEED_MODE_KEY) !== "technical";
  });

  const explainabilityRows = useMemo(
    () => explainability.slice(-80).map((evt) => ({
      id: evt.id,
      text: showPlainEnglish ? toPlainText(evt.text) : evt.text
    })),
    [explainability, showPlainEnglish]
  );

  const onDomainAction = (domain: string, action: "boost" | "suppress" | "block" | "unblock" | "pin") => {
    const preferred = { ...(tuning.sourcePolicy.preferred || {}) };
    const suppressed = { ...(tuning.sourcePolicy.suppressed || {}) };
    const blocked = new Set((tuning.sourcePolicy.blocked || []).map((d) => d.toLowerCase()));
    if (action === "boost") preferred[domain] = Math.min(1, (preferred[domain] || 0.5) + 0.1);
    if (action === "suppress") suppressed[domain] = Math.min(1, (suppressed[domain] || 0.3) + 0.1);
    if (action === "pin") preferred[domain] = 1;
    if (action === "block") blocked.add(domain);
    if (action === "unblock") blocked.delete(domain);
    onTuningChange({
      sourcePolicy: { preferred, suppressed, blocked: Array.from(blocked) }
    }, { disruptive: action === "block" });
  };

  return (
    <div className="h-full min-h-0 flex flex-col gap-2 overflow-y-auto pr-1">
      <RunSnapshotBar snapshot={snapshot} />

      <div className="border border-gray-800 rounded bg-black/40 p-2 flex flex-col h-[15rem] lg:h-[21rem] min-h-[15rem] lg:min-h-[21rem] overflow-hidden">
        <div className="text-[11px] font-mono text-gray-400 mb-2">PHASE CARDS</div>
        <div className="space-y-1 flex-1 min-h-0 overflow-y-auto pr-1">
          {phaseCards.map((card) => (
            <div key={card.phase} className="text-[10px] font-mono border border-gray-800 rounded px-2 py-1">
              <div className="flex justify-between"><span>Phase {card.phase}</span><span>{card.status}</span></div>
              <div className="text-gray-500">novelty {pct(card.novelty)}% · preferred {pct(card.preferredHitRate)}%</div>
              {card.reason && <div className="text-gray-500 truncate">{card.reason}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-800 rounded bg-black/40 p-2">
        <div className="text-[11px] font-mono text-gray-400 mb-2">LEVERAGE CONTROLS</div>
        <div className="space-y-2 text-[10px] font-mono text-gray-300">
          <label className="block">Exploration Ratio {pct(tuning.explorationRatio)}%
            <input className="w-full" type="range" min={0} max={100} value={Math.round(tuning.explorationRatio * 100)} onChange={(e) => onTuningChange({ explorationRatio: Number(e.target.value) / 100 })} />
          </label>
          <label className="block">Preferred Domain Weight {pct(tuning.preferredDomainWeight)}%
            <input className="w-full" type="range" min={0} max={100} value={Math.round(tuning.preferredDomainWeight * 100)} onChange={(e) => onTuningChange({ preferredDomainWeight: Number(e.target.value) / 100 })} />
          </label>
          <label className="block">Novelty Floor {pct(tuning.noveltyFloor)}%
            <input className="w-full" type="range" min={0} max={100} value={Math.round(tuning.noveltyFloor * 100)} onChange={(e) => onTuningChange({ noveltyFloor: Number(e.target.value) / 100 })} />
          </label>
          <label className="block">Authority Floor {Math.round(tuning.authorityFloor)}
            <input className="w-full" type="range" min={0} max={100} value={Math.round(tuning.authorityFloor)} onChange={(e) => onTuningChange({ authorityFloor: Number(e.target.value) })} />
          </label>
          <label className="block">Validation Strictness
            <select className="w-full bg-black border border-gray-700 mt-1" value={tuning.validationStrictness} onChange={(e) => onTuningChange({ validationStrictness: e.target.value as OperatorTuning["validationStrictness"] })}>
              <option value="strict">strict</option>
              <option value="balanced">balanced</option>
              <option value="permissive">permissive</option>
            </select>
          </label>
          <label className="block">Budget 0.5
            <input
              className="w-full bg-black border border-gray-700 mt-1 px-1 py-0.5"
              type="number"
              min={1}
              value={tuning.phaseBudgets.phase05}
              onChange={(e) => onTuningChange({ phaseBudgets: { ...tuning.phaseBudgets, phase05: Math.max(1, Math.floor(Number(e.target.value) || 1)) } }, { disruptive: true })}
            />
          </label>
          <label className="block">Budget 2B
            <input
              className="w-full bg-black border border-gray-700 mt-1 px-1 py-0.5"
              type="number"
              min={1}
              value={tuning.phaseBudgets.phase2b}
              onChange={(e) => onTuningChange({ phaseBudgets: { ...tuning.phaseBudgets, phase2b: Math.max(1, Math.floor(Number(e.target.value) || 1)) } }, { disruptive: true })}
            />
          </label>
          <label className="block">Budget 3B
            <input
              className="w-full bg-black border border-gray-700 mt-1 px-1 py-0.5"
              type="number"
              min={1}
              value={tuning.phaseBudgets.phase3b}
              onChange={(e) => onTuningChange({ phaseBudgets: { ...tuning.phaseBudgets, phase3b: Math.max(1, Math.floor(Number(e.target.value) || 1)) } }, { disruptive: true })}
            />
          </label>
        </div>
      </div>

      <SourceSteeringTable tuning={tuning} sourceLearning={sourceLearning} onAction={onDomainAction} />

      <div className="border border-gray-800 rounded bg-black/40 p-2 min-h-[12rem] lg:min-h-[16rem] h-[12rem] lg:h-[16rem] overflow-hidden flex flex-col">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-[11px] font-mono text-gray-400">EXPLAINABILITY</div>
          <button
            type="button"
            onClick={() => {
              const next = !showPlainEnglish;
              setShowPlainEnglish(next);
              if (typeof window !== "undefined") {
                window.localStorage.setItem(OPERATOR_FEED_MODE_KEY, next ? "plain" : "technical");
              }
            }}
            className="px-2 py-1 rounded border border-gray-700 text-[10px] font-mono uppercase tracking-wider text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
          >
            {showPlainEnglish ? "Plain English" : "Technical"}
          </button>
        </div>
        <div className="space-y-1 text-[10px] font-mono text-gray-400 flex-1 min-h-0 overflow-y-auto pr-1">
          {explainabilityRows.map((evt) => (
            <div key={evt.id}>{evt.text}</div>
          ))}
          {explainability.length === 0 && <div>No events yet.</div>}
        </div>
      </div>
    </div>
  );
};
