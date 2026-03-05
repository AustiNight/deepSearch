import type { DataGap, Jurisdiction, NormalizedSource } from "../types";
import { resolveParcelFromOpenDataPortal } from "./openDataParcelResolution";

export type ExternalCallGuard = {
  allowed: boolean;
  reason: "latency_budget" | "external_call_budget" | null;
  detail?: string;
};

export type OpenDataPhase3CAttempt = {
  portalUrl: string;
  skipped?: boolean;
  skipReason?: "latency_budget" | "external_call_budget";
  sourceCount: number;
  datasetCount: number;
  parcelId?: string;
  method?: string;
  dataGaps: DataGap[];
};

export type OpenDataPhase3CFinding = {
  portalUrl: string;
  parcelId: string;
  method: string;
  datasetCount: number;
  sources: NormalizedSource[];
};

export type OpenDataPhase3CResult = {
  attempts: OpenDataPhase3CAttempt[];
  dataGaps: DataGap[];
  finding?: OpenDataPhase3CFinding;
  findings?: OpenDataPhase3CFinding[];
};

export const runOpenDataParcelResolutionPhase = async (
  input: {
    topic: string;
    jurisdiction?: Jurisdiction;
    portalCandidates: string[];
    phaseLabel: string;
  },
  deps: {
    canUseExternalCall: (phase: string, portalUrl: string) => ExternalCallGuard;
    normalizeSource: (source: any) => NormalizedSource | null;
    resolvePortal?: typeof resolveParcelFromOpenDataPortal;
  }
): Promise<OpenDataPhase3CResult> => {
  const resolvePortal = deps.resolvePortal || resolveParcelFromOpenDataPortal;
  const attempts: OpenDataPhase3CAttempt[] = [];
  const allDataGaps: DataGap[] = [];
  const findings: OpenDataPhase3CFinding[] = [];

  for (const portalUrl of input.portalCandidates) {
    const guard = deps.canUseExternalCall(input.phaseLabel, portalUrl);
    if (!guard.allowed) {
      attempts.push({
        portalUrl,
        skipped: true,
        skipReason: guard.reason || "external_call_budget",
        sourceCount: 0,
        datasetCount: 0,
        dataGaps: []
      });
      continue;
    }

    const parcelResult = await resolvePortal({
      address: input.topic,
      portalUrl,
      jurisdiction: input.jurisdiction
    });

    const parcelDataGaps = Array.isArray((parcelResult as any)?.dataGaps) ? (parcelResult as any).dataGaps : [];
    if (parcelDataGaps.length > 0) {
      allDataGaps.push(...parcelDataGaps);
    }

    const citationSources = Array.isArray((parcelResult as any)?.sources) ? (parcelResult as any).sources : [];
    const normalizedSources = citationSources
      .map((source: any) => deps.normalizeSource(source))
      .filter((source: NormalizedSource | null): source is NormalizedSource => Boolean(source));
    const datasetCount = Array.isArray((parcelResult as any)?.datasetsUsed) ? (parcelResult as any).datasetsUsed.length : 0;
    const parcelId = (parcelResult as any)?.parcel?.parcelId || (parcelResult as any)?.parcel?.accountId || "unknown";
    const method = (parcelResult as any)?.resolutionMethod || "open_data";

    attempts.push({
      portalUrl,
      sourceCount: normalizedSources.length,
      datasetCount,
      parcelId,
      method,
      dataGaps: parcelDataGaps
    });

    if (normalizedSources.length > 0) {
      findings.push({
        portalUrl,
        parcelId,
        method,
        datasetCount,
        sources: normalizedSources
      });
    }
  }

  const rankedFindings = [...findings].sort((a, b) =>
    (b.sources.length - a.sources.length)
    || (b.datasetCount - a.datasetCount)
  );
  const bestFinding = rankedFindings[0];

  return {
    attempts,
    dataGaps: allDataGaps,
    finding: bestFinding,
    findings: findings.length > 0 ? findings : undefined
  };
};
