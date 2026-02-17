import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';
import { getResearchTaxonomy } from '../data/researchTaxonomy';
import { VERTICAL_SEED_QUERIES } from '../data/verticalLogic';
import { TRANSPARENCY_LAYOUT } from '../data/transparencyLayout';

type LayoutDensity = 'normal' | 'condensed' | 'ultra';

type LayoutState = {
  scale: number;
  columns: number;
  fontSize: number;
  lineHeight: number;
  density: LayoutDensity;
};

type TransparencyPanelProps = {
  open: boolean;
  onClose: () => void;
};

const formatList = (items: string[]) => items.join(' · ');

export const TransparencyPanel: React.FC<TransparencyPanelProps> = ({ open, onClose }) => {
  const taxonomy = useMemo(() => getResearchTaxonomy(), []);
  const [presentationMode, setPresentationMode] = useState(false);
  const [layout, setLayout] = useState<LayoutState>(() => ({
    scale: 1,
    columns: TRANSPARENCY_LAYOUT.baseColumns,
    fontSize: TRANSPARENCY_LAYOUT.font.baseSize,
    lineHeight: TRANSPARENCY_LAYOUT.font.baseLineHeight,
    density: 'normal'
  }));
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
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
    return { verticals: taxonomy.verticals.length, subtopics, methods, tactics, fields };
  }, [taxonomy]);

  useLayoutEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const computeLayout = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      if (containerWidth === 0 || containerHeight === 0) return;

      const baseFontSize = presentationMode ? TRANSPARENCY_LAYOUT.font.presentationSize : TRANSPARENCY_LAYOUT.font.baseSize;
      const baseLineHeight = presentationMode ? TRANSPARENCY_LAYOUT.font.presentationLineHeight : TRANSPARENCY_LAYOUT.font.baseLineHeight;
      const baseColumns = presentationMode ? TRANSPARENCY_LAYOUT.baseColumns : Math.min(TRANSPARENCY_LAYOUT.maxColumns, TRANSPARENCY_LAYOUT.baseColumns + 1);

      const densitySteps: Array<{ key: LayoutDensity; fontScale: number; columnBoost: number; minScale: number; lineHeightScale: number }> = [
        { key: 'normal', fontScale: 1, columnBoost: 0, minScale: TRANSPARENCY_LAYOUT.scale.targetMin, lineHeightScale: 1 },
        { key: 'condensed', fontScale: 0.92, columnBoost: 1, minScale: TRANSPARENCY_LAYOUT.scale.targetMin * 0.92, lineHeightScale: 0.98 },
        { key: 'ultra', fontScale: 0.85, columnBoost: 2, minScale: TRANSPARENCY_LAYOUT.scale.hardMin, lineHeightScale: 0.95 }
      ];

      const measure = (columns: number, fontSize: number, lineHeight: number) => {
        content.style.columnCount = String(columns);
        content.style.columnGap = `${TRANSPARENCY_LAYOUT.columnGap}px`;
        content.style.fontSize = `${fontSize}px`;
        content.style.lineHeight = String(lineHeight);
        content.style.width = `${containerWidth}px`;
        // Force reflow for accurate scroll measurements.
        void content.getBoundingClientRect();
        return { width: content.scrollWidth, height: content.scrollHeight };
      };

      let chosen: LayoutState | null = null;

      for (const step of densitySteps) {
        const minColumns = Math.max(2, baseColumns + step.columnBoost);
        const maxColumns = Math.min(TRANSPARENCY_LAYOUT.maxColumns + step.columnBoost, 6);
        let best = { scale: 0, columns: minColumns };
        const fontSize = baseFontSize * step.fontScale;
        const lineHeight = baseLineHeight * step.lineHeightScale;

        for (let columns = minColumns; columns <= maxColumns; columns += 1) {
          const { width, height } = measure(columns, fontSize, lineHeight);
          const scale = Math.min(containerWidth / width, containerHeight / height, 1);
          if (scale > best.scale) {
            best = { scale, columns };
          }
        }

        chosen = {
          scale: Math.min(best.scale, 1),
          columns: best.columns,
          fontSize,
          lineHeight,
          density: step.key
        };

        if (best.scale >= step.minScale || step.key === 'ultra') break;
      }

      if (chosen) {
        setLayout((prev) => {
          if (
            Math.abs(prev.scale - chosen.scale) < 0.001 &&
            prev.columns === chosen.columns &&
            Math.abs(prev.fontSize - chosen.fontSize) < 0.01 &&
            Math.abs(prev.lineHeight - chosen.lineHeight) < 0.01 &&
            prev.density === chosen.density
          ) {
            return prev;
          }
          return chosen;
        });
      }
    };

    const rafId = requestAnimationFrame(computeLayout);
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(computeLayout);
    });
    observer.observe(container);
    observer.observe(content);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [open, presentationMode, taxonomy]);

  if (!open) return null;

  const scaledNote = layout.scale < 0.99 || layout.density !== 'normal';

  return (
    <div className="fixed inset-0 bg-black/80 z-[105] flex items-center justify-center p-4 print:bg-white print:p-0 print:items-start">
      <div className="bg-cyber-gray border border-gray-700 rounded-lg w-[min(96vw,1600px)] h-[min(90vh,900px)] shadow-2xl relative overflow-hidden flex flex-col print:shadow-none print:border-gray-300 print:bg-white print:text-black">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyber-blue print:hidden"></div>
        <div className="px-4 pt-4 pb-3 border-b border-gray-800 flex items-center justify-between gap-3 print:border-gray-300">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 font-mono text-cyber-blue print:text-black">
              <Terminal className="w-4 h-4" /> TRANSPARENCY MAP
            </h2>
            <p className="text-[10px] text-gray-500 font-mono print:text-gray-700">
              {counts.verticals} verticals · {counts.fields} blueprint fields · {counts.subtopics} subtopics · {counts.methods} methods · {counts.tactics} tactics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPresentationMode((prev) => !prev)}
              className="px-3 py-1.5 rounded border text-[10px] font-mono uppercase tracking-widest transition-colors border-gray-700 text-gray-400 hover:text-white hover:border-cyber-blue print:hidden"
            >
              {presentationMode ? 'COMPACT MODE' : 'PRESENTATION MODE'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white text-lg leading-none print:hidden"
              aria-label="Close transparency panel"
            >
              ✕
            </button>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden relative">
          <div className="absolute inset-0 p-3">
            <div
              className="origin-top-left"
              style={{
                transform: `scale(${layout.scale})`,
                transformOrigin: 'top left'
              }}
            >
              <div
                ref={contentRef}
                className="font-mono text-gray-300 print:text-gray-900"
                style={{
                  columnCount: layout.columns,
                  columnGap: `${TRANSPARENCY_LAYOUT.columnGap}px`,
                  fontSize: `${layout.fontSize}px`,
                  lineHeight: layout.lineHeight.toString()
                }}
              >
                {taxonomy.verticals.map((vertical) => (
                  <section key={vertical.id} className="break-inside-avoid mb-3">
                    <div className="text-[11px] uppercase tracking-widest text-cyber-green print:text-black">
                      {vertical.label}
                      <span className="text-gray-600 print:text-gray-700"> ({vertical.id})</span>
                    </div>
                    {vertical.description && (
                      <div className="text-[9px] text-gray-500 print:text-gray-700">{vertical.description}</div>
                    )}
                    <div className="text-[9px] text-gray-500 print:text-gray-700">
                      Blueprint: {formatList(vertical.blueprintFields)}
                    </div>
                    <div className="text-[9px] text-gray-500 print:text-gray-700">
                      Seed: {VERTICAL_SEED_QUERIES[vertical.id] || '{topic} overview'}
                    </div>
                    {vertical.subtopics.map((subtopic) => (
                      <div key={subtopic.id} className="mt-1">
                        <div className="text-[9px] uppercase tracking-wider text-cyber-blue print:text-gray-900">
                          {subtopic.label}
                          <span className="text-gray-600 print:text-gray-700"> ({subtopic.id})</span>
                        </div>
                        {subtopic.description && (
                          <div className="text-[9px] text-gray-500 print:text-gray-700">{subtopic.description}</div>
                        )}
                        {subtopic.methods.map((method) => (
                          <div key={method.id} className="text-[9px] text-gray-400 print:text-gray-800">
                            <span className="text-gray-500 print:text-gray-700">{method.label}:</span>{' '}
                            {formatList(method.tactics.map((tactic) => tactic.template))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>

        {scaledNote && (
          <div className="px-4 py-2 border-t border-gray-800 text-[10px] text-gray-500 font-mono print:hidden">
            Auto-condensed to fit 16:9: {layout.columns} columns · {Math.round(layout.scale * 100)}% scale · {layout.density.toUpperCase()} density.
          </div>
        )}
      </div>
    </div>
  );
};
