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
  return {
    schemaVersion: settings.schemaVersion as number,
    provider: settings.provider as "google" | "openai",
    runConfig: settings.runConfig,
    modelOverrides: settings.modelOverrides,
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
