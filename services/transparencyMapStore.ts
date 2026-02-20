import { TRANSPARENCY_MAP_INVALIDATE_EVENT } from '../constants';
import { buildTransparencyMapData, type TransparencyMapData, type TransparencyMapInvalidationDetail, type TransparencySettingsStamp } from '../data/transparencyTable';
import { getResearchTaxonomy } from '../data/researchTaxonomy';
import { readTransparencySettingsStamp } from './settingsSnapshot';

let cachedSnapshot: TransparencyMapData | null = null;
let cachedFingerprint: string | null = null;
let storeInitialized = false;

const buildSettingsFingerprint = (stamp: TransparencySettingsStamp | null) => {
  if (!stamp) return 'none';
  return `${stamp.localUpdatedAt ?? ''}|${stamp.cloudUpdatedAt ?? ''}|${stamp.version ?? ''}`;
};

const buildFingerprint = (taxonomyUpdatedAt: number, verticalCount: number, stamp: TransparencySettingsStamp | null) => {
  return `${taxonomyUpdatedAt}|${verticalCount}|${buildSettingsFingerprint(stamp)}`;
};

export const refreshTransparencyMapSnapshot = (_detail?: TransparencyMapInvalidationDetail): TransparencyMapData => {
  const taxonomy = getResearchTaxonomy();
  const settingsStamp = readTransparencySettingsStamp();
  const fingerprint = buildFingerprint(taxonomy.updatedAt || 0, taxonomy.verticals.length, settingsStamp);
  if (cachedSnapshot && cachedFingerprint === fingerprint) {
    return cachedSnapshot;
  }
  cachedSnapshot = buildTransparencyMapData(taxonomy, settingsStamp);
  cachedFingerprint = fingerprint;
  return cachedSnapshot;
};

export const buildTransparencyMapSnapshot = (): TransparencyMapData => {
  return refreshTransparencyMapSnapshot();
};

export const initTransparencyMapStore = () => {
  if (storeInitialized || typeof window === 'undefined') return;
  storeInitialized = true;
  refreshTransparencyMapSnapshot();
  const handleInvalidate = (event: Event) => {
    const detail = (event as CustomEvent<TransparencyMapInvalidationDetail>).detail;
    refreshTransparencyMapSnapshot(detail);
  };
  window.addEventListener(TRANSPARENCY_MAP_INVALIDATE_EVENT, handleInvalidate as EventListener);
};
