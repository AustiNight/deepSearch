import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';
import { TAXONOMY_UPDATED_EVENT, SETTINGS_LOCAL_UPDATED_AT_KEY, SETTINGS_UPDATED_AT_KEY, SETTINGS_UPDATED_EVENT, SETTINGS_VERSION_KEY } from '../constants';
import { getResearchTaxonomy, TAXONOMY_STORAGE_KEY } from '../data/researchTaxonomy';
import { TRANSPARENCY_LAYOUT } from '../data/transparencyLayout';
import { buildTransparencyMapData, TRANSPARENCY_TABLE_PERF, type TransparencySettingsStamp } from '../data/transparencyTable';
import { readTransparencySettingsStamp } from '../services/settingsSnapshot';

type TransparencyPanelProps = {
  open: boolean;
  onClose: () => void;
};

const KEYBOARD_HELP_ID = 'transparency-map-keyboard-help';

const renderList = (items: React.ReactNode[], emptyLabel = '—') => {
  if (!items || items.length === 0) {
    return <span className="text-gray-500 print:text-gray-700">{emptyLabel}</span>;
  }
  if (items.length === 1) {
    return <span>{items[0]}</span>;
  }
  return (
    <ul className="list-disc pl-4 space-y-1">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};

export const TransparencyPanel: React.FC<TransparencyPanelProps> = ({ open, onClose }) => {
  const [taxonomy, setTaxonomy] = useState(() => getResearchTaxonomy());
  const [settingsStamp, setSettingsStamp] = useState<TransparencySettingsStamp | null>(() => readTransparencySettingsStamp());
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
  const [activeRowIndex, setActiveRowIndex] = useState(0);

  const mapData = useMemo(() => buildTransparencyMapData(taxonomy, settingsStamp), [taxonomy, settingsStamp]);
  const rows = mapData.rows;
  const counts = mapData.counts;

  useEffect(() => {
    if (!open) return;
    setTaxonomy(getResearchTaxonomy());
    setSettingsStamp(readTransparencySettingsStamp());
  }, [open]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const refreshTaxonomy = () => setTaxonomy(getResearchTaxonomy());
    const refreshSettings = () => setSettingsStamp(readTransparencySettingsStamp());
    const handleTaxonomyEvent = () => refreshTaxonomy();
    const handleSettingsEvent = () => refreshSettings();
    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key === TAXONOMY_STORAGE_KEY) {
        refreshTaxonomy();
        return;
      }
      if (
        event.key === SETTINGS_LOCAL_UPDATED_AT_KEY ||
        event.key === SETTINGS_UPDATED_AT_KEY ||
        event.key === SETTINGS_VERSION_KEY
      ) {
        refreshSettings();
      }
    };

    window.addEventListener(TAXONOMY_UPDATED_EVENT, handleTaxonomyEvent as EventListener);
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsEvent as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(TAXONOMY_UPDATED_EVENT, handleTaxonomyEvent as EventListener);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsEvent as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (activeRowIndex >= rows.length) {
      setActiveRowIndex(0);
    }
  }, [activeRowIndex, rows.length]);

  const scale = TRANSPARENCY_LAYOUT.scale?.default ?? 0.8;
  const integrityLabel = !mapData.integrity.ok
    ? `Integrity warning: ${mapData.integrity.missingVerticals.length} vertical(s), ${mapData.integrity.missingSubtopics.length} subtopic(s) missing.`
    : null;
  const integrityDetail = !mapData.integrity.ok
    ? [
      mapData.integrity.missingVerticals.length > 0
        ? `Missing verticals: ${mapData.integrity.missingVerticals.join(', ')}`
        : null,
      mapData.integrity.missingSubtopics.length > 0
        ? `Missing subtopics: ${mapData.integrity.missingSubtopics.map((item) => `${item.verticalId}/${item.subtopicId}`).join(', ')}`
        : null
    ].filter(Boolean).join(' · ')
    : '';

  if (!open) return null;

  const isHighVolume = rows.length > TRANSPARENCY_TABLE_PERF.expectedMaxRows;
  const enableContentVisibility = rows.length >= TRANSPARENCY_TABLE_PERF.virtualizationThreshold;
  const rowStyle: React.CSSProperties | undefined = enableContentVisibility
    ? ({ contentVisibility: 'auto', containIntrinsicSize: `${TRANSPARENCY_TABLE_PERF.containIntrinsicRowSize}px` } as React.CSSProperties)
    : undefined;

  const focusRow = (index: number) => {
    const row = rowRefs.current[index];
    if (row) {
      row.focus();
    }
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, index: number) => {
    const maxIndex = rows.length - 1;
    let nextIndex = index;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = Math.min(maxIndex, index + 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(0, index - 1);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = maxIndex;
        break;
      case 'PageDown':
        nextIndex = Math.min(maxIndex, index + 6);
        break;
      case 'PageUp':
        nextIndex = Math.max(0, index - 6);
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveRowIndex(nextIndex);
    focusRow(nextIndex);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[105] flex items-center justify-center p-4 print:bg-white print:p-0 print:items-start">
      <div className="bg-cyber-gray border border-gray-700 rounded-lg w-[min(98vw,1700px)] h-[min(92vh,950px)] shadow-2xl relative overflow-hidden flex flex-col print:shadow-none print:border-gray-300 print:bg-white print:text-black">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyber-blue print:hidden"></div>
        <div className="px-4 pt-4 pb-3 border-b border-gray-800 flex items-center justify-between gap-3 print:border-gray-300">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 font-mono text-cyber-blue print:text-black">
              <Terminal className="w-4 h-4" /> TRANSPARENCY MAP
            </h2>
            <p className="text-[10px] text-gray-500 font-mono print:text-gray-700">
              {counts.verticals} verticals · {counts.fields} blueprint fields · {counts.subtopics} subtopics · {counts.methods} methods · {counts.tactics} tactics
            </p>
            {integrityLabel && (
              <p className="text-[10px] text-cyber-amber font-mono mt-1" title={integrityDetail}>
                {integrityLabel}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isHighVolume && (
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyber-amber border border-cyber-amber/40 px-2 py-1 rounded">
                High Volume Mode
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white text-lg leading-none print:hidden"
              aria-label="Close transparency panel"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <p id={KEYBOARD_HELP_ID} className="sr-only">
            Use Up and Down arrow keys to move between rows, Home and End to jump to the first or last row, and Page Up or Page Down to
            move in larger steps.
          </p>
          <div className="h-full w-full overflow-auto">
            <table
              className="min-w-[1200px] w-full border-collapse text-[13px] md:text-[14px] font-mono text-gray-200 print:text-gray-900"
              aria-label="Transparency Map"
              aria-describedby={KEYBOARD_HELP_ID}
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
            >
              <colgroup>
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="text-[12px] md:text-[13px] uppercase tracking-widest">
                  {['Vertical', 'Blueprint Fields', 'Subtopics', 'Methods/Tactics', 'Seed Query', 'Hint Rules'].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-3 py-2 text-left text-gray-400 print:bg-white print:text-gray-700 print:border-gray-300"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    ref={(element) => {
                      rowRefs.current[index] = element;
                    }}
                    tabIndex={index === activeRowIndex ? 0 : -1}
                    onFocus={() => setActiveRowIndex(index)}
                    onKeyDown={(event) => handleRowKeyDown(event, index)}
                    className="border-b border-gray-800 even:bg-gray-900/40 focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 print:border-gray-300 print:even:bg-gray-100"
                    style={rowStyle}
                  >
                    <th scope="row" className="align-top px-3 py-3 text-left font-semibold text-cyber-green print:text-black">
                      <div className="text-[13px] uppercase tracking-widest">{row.label}</div>
                      <div className="text-[11px] text-gray-500 print:text-gray-700">{row.id}</div>
                      {row.description && (
                        <div className="mt-1 text-[11px] text-gray-400 print:text-gray-700">{row.description}</div>
                      )}
                    </th>
                    <td className="align-top px-3 py-3">
                      {renderList(row.blueprintFields, 'No blueprint fields defined.')}
                    </td>
                    <td className="align-top px-3 py-3">
                      {renderList(row.subtopics, 'No subtopics defined.')}
                    </td>
                    <td className="align-top px-3 py-3">
                      {renderList(row.methods, 'No methods or tactics defined.')}
                    </td>
                    <td className="align-top px-3 py-3 text-cyber-blue print:text-black">
                      <span className="font-semibold">{row.seedQuery}</span>
                    </td>
                    <td className="align-top px-3 py-3">
                      {renderList(
                        row.hintRules.map((rule) => (
                          <span key={rule.id}>
                            {rule.signals}{' '}
                            <span className="text-gray-500 print:text-gray-700">({rule.id})</span>
                          </span>
                        )),
                        'No hint rules defined.'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-4 py-2 border-t border-gray-800 text-[10px] text-gray-500 font-mono flex flex-wrap gap-3 print:border-gray-300 print:text-gray-700">
          <span>Keyboard: ↑/↓ rows · Home/End jump · PgUp/PgDn step</span>
          <span>
            Rows: {rows.length} (expected ≤ {TRANSPARENCY_TABLE_PERF.expectedMaxRows}, optimization ≥ {TRANSPARENCY_TABLE_PERF.virtualizationThreshold})
          </span>
        </div>
      </div>
    </div>
  );
};
