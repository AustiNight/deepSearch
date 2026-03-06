export type AllowlistMetadata = {
  updatedAt: string;
  updatedBy: string | null;
  version: number;
  count: number;
  entriesHash: string;
};

export const hashValue = async (value: string) => {
  const normalized = value.trim().toLowerCase();
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const hashEntries = async (entries: string[]) => {
  const normalized = entries
    .filter((entry) => typeof entry === "string")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join("\n");
  return hashValue(normalized);
};

export const stripSettingsForKv = <T extends Record<string, unknown>>(settings: T) => {
  const raw = settings as Record<string, unknown>;
  const keyOverrides = raw.keyOverrides && typeof raw.keyOverrides === "object"
    ? {
      google: typeof (raw.keyOverrides as any).google === "string" ? (raw.keyOverrides as any).google : undefined,
      openai: typeof (raw.keyOverrides as any).openai === "string" ? (raw.keyOverrides as any).openai : undefined
    }
    : undefined;

  const openDataConfigRaw = raw.openDataConfig && typeof raw.openDataConfig === "object"
    ? raw.openDataConfig as any
    : null;
  const openDataConfig = openDataConfigRaw
    ? (() => {
      const zeroCostMode = openDataConfigRaw.zeroCostMode === true;
      return {
        zeroCostMode,
        allowPaidAccess: zeroCostMode ? false : openDataConfigRaw.allowPaidAccess === true,
      featureFlags: {
        autoIngestion: openDataConfigRaw.featureFlags?.autoIngestion === true,
        evidenceRecovery: openDataConfigRaw.featureFlags?.evidenceRecovery !== false,
        gatingEnforcement: openDataConfigRaw.featureFlags?.gatingEnforcement !== false,
        usOnlyAddressPolicy: openDataConfigRaw.featureFlags?.usOnlyAddressPolicy === true,
        datasetTelemetryRanking: openDataConfigRaw.featureFlags?.datasetTelemetryRanking !== false,
        socrataPreferV3: openDataConfigRaw.featureFlags?.socrataPreferV3 === true
      },
      auth: {
        socrataAppToken: typeof openDataConfigRaw.auth?.socrataAppToken === "string" ? openDataConfigRaw.auth.socrataAppToken : undefined,
        arcgisApiKey: typeof openDataConfigRaw.auth?.arcgisApiKey === "string" ? openDataConfigRaw.auth.arcgisApiKey : undefined,
        geocodingEmail: typeof openDataConfigRaw.auth?.geocodingEmail === "string" ? openDataConfigRaw.auth.geocodingEmail : undefined,
        geocodingKey: typeof openDataConfigRaw.auth?.geocodingKey === "string" ? openDataConfigRaw.auth.geocodingKey : undefined
      }
    };
    })()
    : undefined;

  return {
    schemaVersion: settings.schemaVersion as number,
    provider: settings.provider as "google" | "openai",
    runConfig: settings.runConfig,
    modelOverrides: settings.modelOverrides,
    keyOverrides: keyOverrides || {},
    openDataConfig: openDataConfig || {
      zeroCostMode: true,
      allowPaidAccess: false,
      featureFlags: {
        autoIngestion: true,
        evidenceRecovery: true,
        gatingEnforcement: true,
        usOnlyAddressPolicy: false,
        datasetTelemetryRanking: true,
        socrataPreferV3: false
      },
      auth: {}
    }
  };
};

export const buildAllowlistMetadata = async (input: {
  entries: string[];
  updatedAt: string;
  version: number;
}): Promise<AllowlistMetadata> => {
  return {
    updatedAt: input.updatedAt,
    updatedBy: null,
    version: input.version,
    count: input.entries.length,
    entriesHash: await hashEntries(input.entries),
  };
};
