import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const DOC_PATH = path.join(ROOT, 'docs', 'vertical-logic.md');
const TAXONOMY_PATH = path.join(ROOT, 'data', 'researchTaxonomy.ts');
const LOGIC_PATH = path.join(ROOT, 'data', 'verticalLogic.ts');

const START_MARKER = '<!-- VERTICAL_LOGIC_TABLE:START -->';
const END_MARKER = '<!-- VERTICAL_LOGIC_TABLE:END -->';

const escapeCell = (value) => {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br/>');
};

const loadTsModule = async (filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext
    }
  });
  const dataUrl = `data:text/javascript;base64,${Buffer.from(outputText, 'utf8').toString('base64')}`;
  return import(dataUrl);
};

const buildTable = (taxonomy, seedQueries, hintRules) => {
  const hintByVertical = new Map();
  hintRules.forEach((rule) => {
    if (!rule?.verticalId || !rule?.signals) return;
    const list = hintByVertical.get(rule.verticalId) || [];
    list.push(rule.signals);
    hintByVertical.set(rule.verticalId, list);
  });

  const rows = taxonomy.verticals.map((vertical) => {
    const hintSignals = hintByVertical.get(vertical.id);
    const hintText = hintSignals && hintSignals.length > 0 ? hintSignals.join('<br/>') : '—';
    const subtopics = vertical.subtopics.map((subtopic) => {
      const method = Array.isArray(subtopic.methods) ? subtopic.methods[0] : undefined;
      const tactic = method && Array.isArray(method.tactics) ? method.tactics[0] : undefined;
      const example = tactic ? `e.g., ${tactic.template}` : 'No tactics';
      return `${subtopic.label}: ${example}`;
    }).join('<br/>');
    const seedTemplate = seedQueries[vertical.id] || '{topic} overview';
    return `| ${escapeCell(`${vertical.label} (${vertical.id})`)} | ${escapeCell(hintText)} | ${escapeCell(subtopics)} | ${escapeCell(seedTemplate)} |`;
  });

  return [
    '| Vertical | Hint Signals | Subtopics + Example Tactic Themes | Seed Query Template |',
    '| --- | --- | --- | --- |',
    ...rows
  ].join('\n');
};

const buildDocument = (table) => {
  const header = [
    '# Vertical Logic Table',
    '',
    'This table is generated from the live taxonomy, seed map, and hint logic.',
    '',
    '- Taxonomy: `data/researchTaxonomy.ts`',
    '- Seed queries + hint rules: `data/verticalLogic.ts`',
    '',
    'Run `node scripts/vertical-logic-table.mjs` to regenerate.',
    ''
  ].join('\n');

  return `${header}${START_MARKER}\n${table}\n${END_MARKER}\n`;
};

const upsertTable = (existing, table) => {
  if (!existing) return buildDocument(table);
  if (!existing.includes(START_MARKER) || !existing.includes(END_MARKER)) {
    return buildDocument(table);
  }
  const before = existing.split(START_MARKER)[0];
  const after = existing.split(END_MARKER)[1];
  return `${before}${START_MARKER}\n${table}\n${END_MARKER}${after.startsWith('\n') ? '' : '\n'}${after}`;
};

const run = async () => {
  const checkOnly = process.argv.includes('--check');
  const taxonomyModule = await loadTsModule(TAXONOMY_PATH);
  const logicModule = await loadTsModule(LOGIC_PATH);

  const taxonomy = taxonomyModule.BASE_RESEARCH_TAXONOMY;
  if (!taxonomy?.verticals) {
    throw new Error('Failed to load BASE_RESEARCH_TAXONOMY for table generation.');
  }

  const seedQueries = logicModule.VERTICAL_SEED_QUERIES || {};
  const hintRules = logicModule.VERTICAL_HINT_RULES || [];

  const table = buildTable(taxonomy, seedQueries, hintRules);
  const existing = fs.existsSync(DOC_PATH) ? fs.readFileSync(DOC_PATH, 'utf8') : '';
  const next = upsertTable(existing, table);

  if (checkOnly) {
    if (existing.trim() !== next.trim()) {
      console.error('Vertical logic table is out of date. Run `node scripts/vertical-logic-table.mjs` to update.');
      process.exit(1);
    }
    return;
  }

  fs.writeFileSync(DOC_PATH, next);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
