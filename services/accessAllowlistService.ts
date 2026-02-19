import { resolveProxyBaseUrl } from "./proxyBaseUrl";

const PROXY_BASE_URL = resolveProxyBaseUrl();

const buildAllowlistUrl = () => `${PROXY_BASE_URL}/api/access/allowlist`;

export type AllowlistResponse = {
  entries: string[];
  updatedAt: string | null;
  updatedBy?: string | null;
  version?: number;
  count?: number;
  policyUpdated?: boolean;
};

export type AllowlistUpdateResult =
  | { ok: true; data: AllowlistResponse }
  | { ok: false; status: number; error: string; data?: any };

const parseJson = async (res: Response) => {
  try {
    return await res.json();
  } catch (_) {
    return null;
  }
};

export const fetchAllowlist = async (): Promise<AllowlistResponse> => {
  const res = await fetch(buildAllowlistUrl(), { method: 'GET', credentials: 'include' });
  const data = await parseJson(res);
  if (!res.ok) {
    const message = data?.error || `Allowlist fetch failed (${res.status}).`;
    throw new Error(message);
  }
  return data as AllowlistResponse;
};

export const updateAllowlist = async (entries: string[], expectedUpdatedAt?: string | null): Promise<AllowlistUpdateResult> => {
  const body: Record<string, unknown> = { entries };
  if (expectedUpdatedAt) body.expectedUpdatedAt = expectedUpdatedAt;
  const res = await fetch(buildAllowlistUrl(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: data?.error || `Allowlist update failed (${res.status}).`,
      data,
    };
  }
  return { ok: true, data: data as AllowlistResponse };
};
