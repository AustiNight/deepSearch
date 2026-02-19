import { buildTransparencyMapData, type TransparencyMapData } from '../data/transparencyTable';
import { getResearchTaxonomy } from '../data/researchTaxonomy';
import { readTransparencySettingsStamp } from './settingsSnapshot';

export const buildTransparencyMapSnapshot = (): TransparencyMapData => {
  const taxonomy = getResearchTaxonomy();
  const settingsStamp = readTransparencySettingsStamp();
  return buildTransparencyMapData(taxonomy, settingsStamp);
};
