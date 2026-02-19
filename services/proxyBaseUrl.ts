const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

export const resolveProxyBaseUrl = () => {
  const raw = (process.env.PROXY_BASE_URL || '').trim();
  if (raw) return normalizeBaseUrl(raw);
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};
