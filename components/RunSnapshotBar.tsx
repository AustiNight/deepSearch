import React from "react";
import type { OperatorSnapshot } from "../types";

type Props = {
  snapshot: OperatorSnapshot;
};

const percent = (value: number) => `${Math.round((value || 0) * 100)}%`;

export const RunSnapshotBar: React.FC<Props> = ({ snapshot }) => {
  return (
    <div className="border border-gray-800 rounded bg-black/40 p-2 text-[10px] font-mono text-gray-300">
      <div className="grid grid-cols-2 gap-2">
        <div>Phase: {snapshot.phase || "idle"}</div>
        <div>ETA: {Math.max(0, Math.round(snapshot.elapsedMs / 1000))}s</div>
        <div>Calls: {snapshot.callsUsed}/{snapshot.callsBudget}</div>
        <div>New domains: {snapshot.newDomains}</div>
        <div>New sources: {snapshot.newSources}</div>
        <div>Blocked: {snapshot.blockedSources}</div>
        <div>Authoritative: {percent(snapshot.authoritativeRatio)}</div>
        <div>Preferred hits: {percent(snapshot.preferredHitRate)}</div>
        <div>Citation survival: {percent(snapshot.citationSurvivalRate)}</div>
      </div>
      {snapshot.stopReason && (
        <div className="mt-2 text-amber-300">Stop: {snapshot.stopReason}</div>
      )}
    </div>
  );
};

