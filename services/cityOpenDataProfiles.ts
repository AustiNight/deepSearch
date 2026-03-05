import type { DataGap, Jurisdiction, NormalizedSource } from "../types";
import { isDallasJurisdiction, runDallasEvidencePack } from "./dallasEvidencePack";

export type CityOpenDataProfileResult = {
  findingsText: string;
  sources: NormalizedSource[];
  dataGaps: DataGap[];
  queryAttempts?: Array<{
    datasetId?: string;
    queryType?: string;
    matched?: number;
  }>;
};

export type CityOpenDataProfile = {
  id: string;
  label: string;
  phaseLabel: string;
  matches: (jurisdiction?: Jurisdiction) => boolean;
  run: (input: { address: string; jurisdiction?: Jurisdiction }) => Promise<CityOpenDataProfileResult>;
};

const normalizeToken = (value?: string) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const isStLouisJurisdiction = (jurisdiction?: Jurisdiction) => {
  const city = normalizeToken(jurisdiction?.city);
  const county = normalizeToken(jurisdiction?.county);
  const state = normalizeToken(jurisdiction?.state);
  const cityMatch = city === "stlouis" || city === "saintlouis";
  const countyMatch = county === "stlouis" || county === "stlouiscity" || county === "saintlouis";
  const stateMatch = !state || state === "mo" || state === "missouri";
  return (cityMatch || countyMatch) && stateMatch;
};

const dallasProfile: CityOpenDataProfile = {
  id: "dallas",
  label: "Dallas",
  phaseLabel: "PHASE 3D: CITY PROFILE (DALLAS)",
  matches: isDallasJurisdiction,
  run: async ({ address, jurisdiction }) => {
    const result = await runDallasEvidencePack({ address, jurisdiction });
    return {
      findingsText: result.findingsText,
      sources: result.sources,
      dataGaps: result.dataGaps,
      queryAttempts: result.queryAttempts.map((attempt) => ({
        datasetId: attempt.datasetId,
        queryType: attempt.queryType,
        matched: attempt.matched
      }))
    };
  }
};

const stLouisScaffoldProfile: CityOpenDataProfile = {
  id: "st_louis",
  label: "St. Louis",
  phaseLabel: "PHASE 3D: CITY PROFILE (STL)",
  matches: isStLouisJurisdiction,
  run: async () => ({
    findingsText: "",
    sources: [],
    dataGaps: [],
    queryAttempts: []
  })
};

const CITY_OPEN_DATA_PROFILES: CityOpenDataProfile[] = [
  dallasProfile,
  stLouisScaffoldProfile
];

export const listCityOpenDataProfiles = () => CITY_OPEN_DATA_PROFILES.slice();

export const resolveCityOpenDataProfile = (jurisdiction?: Jurisdiction) =>
  CITY_OPEN_DATA_PROFILES.find((profile) => profile.matches(jurisdiction));

