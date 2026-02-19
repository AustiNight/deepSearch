import type { TransparencySettingsStamp } from '../data/transparencyTable';
import { readSettingsMetadata } from './storagePolicy';

export const readTransparencySettingsStamp = (): TransparencySettingsStamp => {
  const meta = readSettingsMetadata();
  return {
    localUpdatedAt: meta.localUpdatedAt ?? null,
    cloudUpdatedAt: meta.updatedAt ?? null,
    version: typeof meta.version === 'number' ? meta.version : null
  };
};
