import { TRANSPARENCY_MAP_INVALIDATE_EVENT } from '../constants';
import { TRANSPARENCY_MAP_UPDATE_POLICY, type TransparencyMapInvalidationDetail } from '../data/transparencyTable';

export const dispatchTransparencyMapInvalidate = (
  detail: Omit<TransparencyMapInvalidationDetail, 'at'> & { at?: number }
) => {
  if (typeof window === 'undefined') return;
  const at = typeof detail.at === 'number' ? detail.at : Date.now();
  if (!TRANSPARENCY_MAP_UPDATE_POLICY.eventSources.includes(detail.source)) {
    console.warn('[TransparencyMap] Unknown invalidation source:', detail.source);
  }
  try {
    window.dispatchEvent(new CustomEvent(TRANSPARENCY_MAP_INVALIDATE_EVENT, { detail: { ...detail, at } }));
  } catch (_) {
    // ignore
  }
};
