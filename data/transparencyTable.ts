import type { ResearchTaxonomy } from './researchTaxonomy';
import { VERTICAL_HINT_RULES, VERTICAL_SEED_QUERIES } from './verticalLogic';

export type TransparencyHintRule = {
  id: string;
  signals: string;
};

export type TransparencyRow = {
  id: string;
  label: string;
  description?: string;
  blueprintFields: string[];
  subtopics: string[];
  subtopicIds: string[];
  methods: string[];
  seedQuery: string;
  hintRules: TransparencyHintRule[];
};

export type TransparencySettingsStamp = {
  localUpdatedAt: string | null;
  cloudUpdatedAt: string | null;
  version: number | null;
};

export type TransparencyCounts = {
  verticals: number;
  subtopics: number;
  methods: number;
  tactics: number;
  fields: number;
};

export type TransparencyMapInvalidationSource =
  | 'panel-open'
  | 'settings-save'
  | 'settings-storage'
  | 'taxonomy-update'
  | 'taxonomy-storage'
  | 'blueprint-update';

export type TransparencyMapInvalidationDetail = {
  source: TransparencyMapInvalidationSource;
  at: number;
  reason?: string;
  updatedAt?: number;
  changes?: Array<'taxonomy' | 'blueprint' | 'vertical' | 'subtopic' | 'method' | 'tactic' | 'settings'>;
};

export type TransparencyIntegrity = {
  ok: boolean;
  missingVerticals: string[];
  missingSubtopics: Array<{ verticalId: string; subtopicId: string; label: string }>;
};

export type TransparencyMapData = {
  rows: TransparencyRow[];
  counts: TransparencyCounts;
  integrity: TransparencyIntegrity;
  settingsStamp: TransparencySettingsStamp | null;
  taxonomyUpdatedAt: number;
};

export const TRANSPARENCY_TABLE_PERF = {
  expectedMaxRows: 24,
  virtualizationThreshold: 48,
  containIntrinsicRowSize: 140
};

export const TRANSPARENCY_MAP_UPDATE_POLICY = {
  eventSources: [
    'panel-open',
    'settings-save',
    'settings-storage',
    'taxonomy-update',
    'taxonomy-storage',
    'blueprint-update'
  ] as TransparencyMapInvalidationSource[],
  debounceMs: 80,
  throttleMs: 240,
  maxComputeMs: 16
};

const groupHintRules = () => {
  const grouped = new Map<string, TransparencyHintRule[]>();
  for (const rule of VERTICAL_HINT_RULES) {
    if (!grouped.has(rule.verticalId)) {
      grouped.set(rule.verticalId, []);
    }
    grouped.get(rule.verticalId)?.push({ id: rule.id, signals: rule.signals });
  }
  return grouped;
};

const formatSubtopic = (label: string, id: string, description?: string) => {
  if (!description) return `${label} (${id})`;
  return `${label} (${id}) — ${description}`;
};

const formatMethod = (subtopicLabel: string, methodLabel: string, tacticTemplates: string[]) => {
  const tactics = tacticTemplates.filter(Boolean);
  if (tactics.length === 0) {
    return `${subtopicLabel} — ${methodLabel}: No tactics defined.`;
  }
  return `${subtopicLabel} — ${methodLabel}: ${tactics.join(' · ')}`;
};

export const buildTransparencyRows = (taxonomy: ResearchTaxonomy): TransparencyRow[] => {
  const hintRulesByVertical = groupHintRules();

  return taxonomy.verticals.map((vertical) => {
    const subtopicIds = (vertical.subtopics || []).map((subtopic) => subtopic.id);
    const subtopics = (vertical.subtopics || []).map((subtopic) =>
      formatSubtopic(subtopic.label, subtopic.id, subtopic.description)
    );
    const methods = (vertical.subtopics || []).flatMap((subtopic) =>
      (subtopic.methods || []).map((method) =>
        formatMethod(
          subtopic.label,
          method.label || method.id || 'Method',
          (method.tactics || []).map((tactic) => tactic.template)
        )
      )
    );
    const seedQuery = VERTICAL_SEED_QUERIES[vertical.id] || '{topic} overview';
    const hintRules = hintRulesByVertical.get(vertical.id) || [];

    return {
      id: vertical.id,
      label: vertical.label,
      description: vertical.description,
      blueprintFields: vertical.blueprintFields || [],
      subtopics,
      subtopicIds,
      methods,
      seedQuery,
      hintRules
    };
  });
};

export const buildTransparencyCounts = (taxonomy: ResearchTaxonomy): TransparencyCounts => {
  let subtopics = 0;
  let methods = 0;
  let tactics = 0;
  let fields = 0;
  for (const vertical of taxonomy.verticals) {
    fields += vertical.blueprintFields.length;
    for (const sub of vertical.subtopics) {
      subtopics += 1;
      for (const method of sub.methods) {
        methods += 1;
        tactics += method.tactics.length;
      }
    }
  }
  return {
    verticals: taxonomy.verticals.length,
    subtopics,
    methods,
    tactics,
    fields
  };
};

export const assessTransparencyIntegrity = (taxonomy: ResearchTaxonomy, rows: TransparencyRow[]): TransparencyIntegrity => {
  const rowIds = new Set(rows.map((row) => row.id));
  const rowIndex = new Map(rows.map((row) => [row.id, row]));
  const missingVerticals: string[] = [];
  const missingSubtopics: Array<{ verticalId: string; subtopicId: string; label: string }> = [];

  for (const vertical of taxonomy.verticals) {
    if (!rowIds.has(vertical.id)) {
      missingVerticals.push(vertical.id);
      continue;
    }
    const row = rowIndex.get(vertical.id);
    const rowSubtopics = new Set(row?.subtopicIds || []);
    for (const subtopic of vertical.subtopics || []) {
      if (!rowSubtopics.has(subtopic.id)) {
        missingSubtopics.push({ verticalId: vertical.id, subtopicId: subtopic.id, label: subtopic.label });
      }
    }
  }

  return {
    ok: missingVerticals.length === 0 && missingSubtopics.length === 0,
    missingVerticals,
    missingSubtopics
  };
};

export const buildTransparencyMapData = (
  taxonomy: ResearchTaxonomy,
  settingsStamp: TransparencySettingsStamp | null
): TransparencyMapData => {
  const rows = buildTransparencyRows(taxonomy);
  const counts = buildTransparencyCounts(taxonomy);
  const integrity = assessTransparencyIntegrity(taxonomy, rows);

  return {
    rows,
    counts,
    integrity,
    settingsStamp,
    taxonomyUpdatedAt: taxonomy.updatedAt || 0
  };
};
