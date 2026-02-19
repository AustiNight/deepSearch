import {
  SETTINGS_LOCAL_UPDATED_AT_KEY,
  SETTINGS_UPDATED_AT_KEY,
  SETTINGS_VERSION_KEY
} from '../constants';
import type { TransparencySettingsStamp } from '../data/transparencyTable';

export const readTransparencySettingsStamp = (): TransparencySettingsStamp => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { localUpdatedAt: null, cloudUpdatedAt: null, version: null };
  }
  const localUpdatedAt = window.localStorage.getItem(SETTINGS_LOCAL_UPDATED_AT_KEY);
  const cloudUpdatedAt = window.localStorage.getItem(SETTINGS_UPDATED_AT_KEY);
  const versionRaw = window.localStorage.getItem(SETTINGS_VERSION_KEY);
  const version = versionRaw && Number.isFinite(Number(versionRaw)) ? Number(versionRaw) : null;
  return { localUpdatedAt, cloudUpdatedAt, version };
};
