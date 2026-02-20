import type { OpenDataPortalType, PortalErrorCode, PortalErrorMetrics, PortalErrorSample } from '../types';
import { resolvePortalErrorCode } from '../data/portalErrorTaxonomy';
import { redactSensitiveText } from './redaction';

export type PortalErrorEvent = {
  code?: PortalErrorCode;
  status?: number;
  portalType?: OpenDataPortalType;
  portalUrl?: string;
  endpoint?: string;
  kind?: 'network' | 'invalid_json';
};

const MAX_SAMPLES = 6;
const REDACTED_QUERY_VALUE = '[REDACTED]';

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

const sanitizeUrl = (raw?: string) => {
  if (!raw) return raw;
  const sanitized = redactSensitiveText(raw);
  return sanitized.replace(/\[REDACTED_TOKEN\]/g, REDACTED_QUERY_VALUE);
};

export const resetPortalErrorMetrics = () => {
  portalErrorMetrics = buildEmptyMetrics();
};

export const recordPortalError = (event: PortalErrorEvent) => {
  const code = event.code || resolvePortalErrorCode(event.status, event.kind);
  const sanitizedPortalUrl = sanitizeUrl(event.portalUrl);
  const sanitizedEndpoint = sanitizeUrl(event.endpoint);
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
      portalUrl: sanitizedPortalUrl,
      endpoint: sanitizedEndpoint,
      occurredAt: isoTimestamp()
    };
    portalErrorMetrics.samples.push(sample);
  }
};

export const getPortalErrorMetrics = () => {
  if (!portalErrorMetrics || portalErrorMetrics.total === 0) return undefined;
  return cloneMetrics(portalErrorMetrics);
};
