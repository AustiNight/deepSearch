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
  methods: string[];
  seedQuery: string;
  hintRules: TransparencyHintRule[];
};

export const TRANSPARENCY_TABLE_PERF = {
  expectedMaxRows: 24,
  virtualizationThreshold: 48,
  containIntrinsicRowSize: 140
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
      methods,
      seedQuery,
      hintRules
    };
  });
};
