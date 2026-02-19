import type { PortalErrorCode } from '../types';

export type PortalErrorTaxonomyEntry = {
  code: PortalErrorCode;
  severity: 'info' | 'warning' | 'error';
  summary: string;
  retryable: boolean;
};

export const PORTAL_ERROR_TAXONOMY: Record<PortalErrorCode, PortalErrorTaxonomyEntry> = {
  network_error: {
    code: 'network_error',
    severity: 'error',
    summary: 'Network failure reaching portal endpoint.',
    retryable: true
  },
  invalid_json: {
    code: 'invalid_json',
    severity: 'warning',
    summary: 'Portal response was not valid JSON.',
    retryable: false
  },
  http_401: {
    code: 'http_401',
    severity: 'warning',
    summary: 'Portal returned HTTP 401 (unauthorized).',
    retryable: false
  },
  http_403: {
    code: 'http_403',
    severity: 'warning',
    summary: 'Portal returned HTTP 403 (forbidden).',
    retryable: false
  },
  http_404: {
    code: 'http_404',
    severity: 'warning',
    summary: 'Portal endpoint not found (404).',
    retryable: false
  },
  http_429: {
    code: 'http_429',
    severity: 'warning',
    summary: 'Portal rate limited the request (429).',
    retryable: true
  },
  http_500: {
    code: 'http_500',
    severity: 'error',
    summary: 'Portal returned HTTP 500 (server error).',
    retryable: true
  },
  http_503: {
    code: 'http_503',
    severity: 'error',
    summary: 'Portal returned HTTP 503 (service unavailable).',
    retryable: true
  },
  http_5xx: {
    code: 'http_5xx',
    severity: 'error',
    summary: 'Portal returned HTTP 5xx server error.',
    retryable: true
  },
  http_other: {
    code: 'http_other',
    severity: 'warning',
    summary: 'Portal returned unexpected HTTP status.',
    retryable: false
  }
};

export const resolvePortalErrorCode = (status?: number, kind?: 'network' | 'invalid_json'): PortalErrorCode => {
  if (kind === 'network') return 'network_error';
  if (kind === 'invalid_json') return 'invalid_json';
  if (typeof status !== 'number') return 'http_other';
  if (status === 401) return 'http_401';
  if (status === 403) return 'http_403';
  if (status === 404) return 'http_404';
  if (status === 429) return 'http_429';
  if (status === 500) return 'http_500';
  if (status === 503) return 'http_503';
  if (status >= 500 && status < 600) return 'http_5xx';
  return 'http_other';
};
