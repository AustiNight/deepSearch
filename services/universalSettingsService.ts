import type { UniversalSettingsPayload, UniversalSettingsResponse } from '../types';
import { apiFetch } from "./apiClient";
import { assertNoSecretExfiltration } from "./storagePolicy";

const parseJson = async (res: Response) => {
  try {
    return await res.json();
  } catch (_) {
    return null;
  }
};

export type UniversalSettingsFetchResult =
  | { ok: true; data: UniversalSettingsResponse }
  | { ok: false; status: number; error: string; data?: any };

export type UniversalSettingsUpdateResult =
  | { ok: true; data: UniversalSettingsResponse }
  | { ok: false; status: number; error: string; data?: any };

export const fetchUniversalSettings = async (): Promise<UniversalSettingsFetchResult> => {
  const res = await apiFetch("/api/settings", { method: 'GET', credentials: 'include' });
  const data = await parseJson(res);
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: data?.error || `Settings fetch failed (${res.status}).`,
      data,
    };
  }
  return { ok: true, data: data as UniversalSettingsResponse };
};

export const updateUniversalSettings = async (
  payload: UniversalSettingsPayload,
  expectedUpdatedAt?: string | null,
  expectedVersion?: number | null
): Promise<UniversalSettingsUpdateResult> => {
  assertNoSecretExfiltration(payload, "settings sync");
  const body: Record<string, unknown> = { settings: payload };
  if (expectedUpdatedAt) body.expectedUpdatedAt = expectedUpdatedAt;
  if (typeof expectedVersion === 'number') body.expectedVersion = expectedVersion;

  const res = await apiFetch("/api/settings", {
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
      error: data?.error || `Settings update failed (${res.status}).`,
      data,
    };
  }
  return { ok: true, data: data as UniversalSettingsResponse };
};
