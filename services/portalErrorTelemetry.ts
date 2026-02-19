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
const REDACTED_QUERY_VALUE = '[REDACTED]';
const SENSITIVE_QUERY_KEYS = new Set([
  'api_key',
  'apikey',
  'access_token',
  'token',
  'client_secret',
  'client_id',
  'key'
]);

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

const isSensitiveQueryKey = (key: string) => {
  const normalized = key.toLowerCase();
  return SENSITIVE_QUERY_KEYS.has(normalized);
};

const sanitizeUrl = (raw?: string) => {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    let updated = false;
    url.searchParams.forEach((value, key) => {
      if (isSensitiveQueryKey(key)) {
        url.searchParams.set(key, REDACTED_QUERY_VALUE);
        updated = true;
      }
    });
    return updated ? url.toString() : url.toString();
  } catch (_) {
    return raw.replace(
      /([?&](?:api_key|apikey|access_token|token|client_secret|client_id|key)=)([^&\s]+)/gi,
      `$1${REDACTED_QUERY_VALUE}`
    );
  }
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
