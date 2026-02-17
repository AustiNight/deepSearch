import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const TAXONOMY_PATH = path.join(ROOT, 'data', 'researchTaxonomy.ts');
const LOGIC_PATH = path.join(ROOT, 'data', 'verticalLogic.ts');
const LAYOUT_PATH = path.join(ROOT, 'data', 'transparencyLayout.ts');

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

const estimateLines = (text, budget) => {
  const length = String(text || '').length;
  return Math.max(1, Math.ceil(length / budget));
};

const buildMethodText = (method) => {
  const templates = (method?.tactics || []).map((t) => t.template).filter(Boolean);
  return `${method?.label || method?.id || 'Method'}: ${templates.join(' · ')}`;
};

const lineCountForVertical = (vertical, seedQueries, budget) => {
  let lines = 1;
  lines += estimateLines(`Blueprint: ${(vertical.blueprintFields || []).join(' · ')}`, budget);
  const seed = seedQueries[vertical.id] || '{topic} overview';
  lines += estimateLines(`Seed: ${seed}`, budget);

  for (const subtopic of vertical.subtopics || []) {
    lines += 1;
    for (const method of subtopic.methods || []) {
      lines += estimateLines(buildMethodText(method), budget);
    }
  }

  return lines;
};

const run = async () => {
  const taxonomyModule = await loadTsModule(TAXONOMY_PATH);
  const logicModule = await loadTsModule(LOGIC_PATH);
  const layoutModule = await loadTsModule(LAYOUT_PATH);

  const taxonomy = taxonomyModule.BASE_RESEARCH_TAXONOMY;
  const seedQueries = logicModule.VERTICAL_SEED_QUERIES || {};
  const layout = layoutModule.TRANSPARENCY_LAYOUT;

  if (!taxonomy?.verticals) {
    throw new Error('Failed to load BASE_RESEARCH_TAXONOMY.');
  }

  const budget = layout.guard.charBudget;
  const totalLines = taxonomy.verticals.reduce((sum, vertical) => {
    return sum + lineCountForVertical(vertical, seedQueries, budget);
  }, 0);

  const baseFontSize = layout.font.baseSize;
  const baseLineHeight = layout.font.baseLineHeight;
  const lineHeightPx = baseFontSize * baseLineHeight;
  const usableHeight = layout.guard.viewportHeight - layout.guard.headerHeight;
  const maxColumnsByWidth = Math.max(2, Math.floor(layout.guard.viewportWidth / layout.guard.columnWidth));
  const columnCount = Math.min(layout.maxColumns, maxColumnsByWidth);
  const projectedHeight = (totalLines * lineHeightPx) / columnCount;
  const requiredScale = usableHeight / projectedHeight;

  if (requiredScale < layout.scale.hardMin) {
    console.error([
      'Transparency layout capacity exceeded.',
      `Projected scale ${requiredScale.toFixed(2)} is below hard minimum ${layout.scale.hardMin}.`,
      'Reduce taxonomy volume or expand layout scaling policy.'
    ].join(' '));
    process.exit(1);
  }

  if (requiredScale < layout.scale.targetMin) {
    console.warn([
      'Transparency layout nearing capacity.',
      `Projected scale ${requiredScale.toFixed(2)} is below target minimum ${layout.scale.targetMin}.`,
      'Panel will fall back to condensed density.'
    ].join(' '));
  }

  console.log(`Transparency layout check OK. Projected scale: ${requiredScale.toFixed(2)} (columns: ${columnCount}).`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
