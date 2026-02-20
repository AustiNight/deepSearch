import { TRANSPARENCY_MAP_INVALIDATE_EVENT } from '../constants';
import {
  TRANSPARENCY_MAP_INVALIDATION_CONTRACT,
  TRANSPARENCY_MAP_UPDATE_POLICY,
  type TransparencyMapInvalidationDetail
} from '../data/transparencyTable';

export const dispatchTransparencyMapInvalidate = (
  detail: Omit<TransparencyMapInvalidationDetail, 'at'> & { at?: number }
) => {
  if (typeof window === 'undefined') return;
  const at = typeof detail.at === 'number' ? detail.at : Date.now();
  const contract = TRANSPARENCY_MAP_INVALIDATION_CONTRACT[detail.source];
  if (!TRANSPARENCY_MAP_UPDATE_POLICY.eventSources.includes(detail.source)) {
    console.warn('[TransparencyMap] Unknown invalidation source:', detail.source);
  }
  if (contract?.requiresUpdatedAt && typeof detail.updatedAt !== 'number') {
    console.warn('[TransparencyMap] Missing updatedAt for invalidation source:', detail.source);
  }
  const normalizedDetail: TransparencyMapInvalidationDetail = {
    ...detail,
    at,
    reason: detail.reason ?? contract?.defaultReason,
    changes: detail.changes ?? contract?.defaultChanges
  };
  try {
    window.dispatchEvent(new CustomEvent(TRANSPARENCY_MAP_INVALIDATE_EVENT, { detail: normalizedDetail }));
  } catch (_) {
    // ignore
  }
};
