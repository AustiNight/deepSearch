import type { OpenDataPortalType, PortalErrorCode, PortalErrorMetrics, PortalErrorSample } from '../types';
import { resolvePortalErrorCode } from '../data/portalErrorTaxonomy';

export type PortalErrorEvent = {
  code?: PortalErrorCode;
  status?: number;
  portalType?: OpenDataPortalType;
  portalUrl?: string;
  endpoint?: string;
  kind?: 'network' | 'invalid_json';
};

const MAX_SAMPLES = 6;

const buildEmptyMetrics = (): PortalErrorMetrics => ({
  total: 0,
  byCode: {}
});

let portalErrorMetrics: PortalErrorMetrics = buildEmptyMetrics();

const cloneMetrics = (metrics: PortalErrorMetrics): PortalErrorMetrics => ({
  total: metrics.total,
  byCode: { ...metrics.byCode },
  byStatus: metrics.byStatus ? { ...metrics.byStatus } : undefined,
  samples: metrics.samples ? [...metrics.samples] : undefined
});

const isoTimestamp = () => new Date().toISOString();

export const resetPortalErrorMetrics = () => {
  portalErrorMetrics = buildEmptyMetrics();
};

export const recordPortalError = (event: PortalErrorEvent) => {
  const code = event.code || resolvePortalErrorCode(event.status, event.kind);
  portalErrorMetrics.total += 1;
  portalErrorMetrics.byCode[code] = (portalErrorMetrics.byCode[code] || 0) + 1;

  if (typeof event.status === 'number') {
    if (!portalErrorMetrics.byStatus) portalErrorMetrics.byStatus = {};
    const key = String(event.status);
    portalErrorMetrics.byStatus[key] = (portalErrorMetrics.byStatus[key] || 0) + 1;
  }

  if (!portalErrorMetrics.samples) portalErrorMetrics.samples = [];
  if (portalErrorMetrics.samples.length < MAX_SAMPLES) {
    const sample: PortalErrorSample = {
      code,
      status: event.status,
      portalType: event.portalType,
      portalUrl: event.portalUrl,
      endpoint: event.endpoint,
      occurredAt: isoTimestamp()
    };
    portalErrorMetrics.samples.push(sample);
  }
};

export const getPortalErrorMetrics = () => {
  if (!portalErrorMetrics || portalErrorMetrics.total === 0) return undefined;
  return cloneMetrics(portalErrorMetrics);
};
