const REDACTED_VALUE = "[REDACTED]";
const REDACTED_TOKEN = "[REDACTED_TOKEN]";
const REDACTED_ADDRESS = "[REDACTED_ADDRESS]";
const REDACTED_CIRCULAR = "[REDACTED_CIRCULAR]";

const SENSITIVE_KEYS = new Set([
  "api_key",
  "apikey",
  "access_token",
  "token",
  "client_secret",
  "client_id",
  "key",
  "authorization",
  "x-app-token",
  "app_token",
  "app-token",
  "secret"
]);

const ADDRESS_KEYS = new Set([
  "address",
  "addr",
  "street",
  "location",
  "parcel",
  "lat",
  "lng",
  "latitude",
  "longitude"
]);

const QUERY_KEYS = new Set([
  "api_key",
  "apikey",
  "access_token",
  "token",
  "client_secret",
  "client_id",
  "key",
  "address",
  "addr",
  "street",
  "location",
  "query",
  "q"
]);

const ADDRESS_PATTERN = /\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s){0,5}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way|Parkway|Pkwy|Place|Pl|Terrace|Ter|Trail|Trl|Highway|Hwy|Loop|Lp|Plaza|Plz|Square|Sq)\b\.?/gi;
const QUERY_PARAM_PATTERN = /([?&](?:api_key|apikey|access_token|token|client_secret|client_id|key|address|addr|street|location|query|q)=)([^&\s]+)/gi;
const BEARER_PATTERN = /\b(Bearer|Basic)\s+[A-Za-z0-9\-._~+/]+=*\b/gi;
const OPENAI_KEY_PATTERN = /\bsk-[A-Za-z0-9]{10,}\b/g;
const GOOGLE_KEY_PATTERN = /\bAIza[0-9A-Za-z\-_]{10,}\b/g;
const ARCGIS_KEY_PATTERN = /\bAAPK[A-Za-z0-9]{10,}\b/g;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

const isSensitiveKey = (key: string) => SENSITIVE_KEYS.has(key.toLowerCase());
const isAddressKey = (key: string) => ADDRESS_KEYS.has(key.toLowerCase());
const isQueryKey = (key: string) => QUERY_KEYS.has(key.toLowerCase());

const redactUrl = (raw: string) => {
  try {
    const url = new URL(raw);
    let updated = false;
    url.searchParams.forEach((value, key) => {
      if (isQueryKey(key)) {
        url.searchParams.set(key, isAddressKey(key) ? REDACTED_ADDRESS : REDACTED_VALUE);
        updated = true;
      }
    });
    return updated ? url.toString() : url.toString();
  } catch (_) {
    return raw.replace(QUERY_PARAM_PATTERN, `$1${REDACTED_VALUE}`);
  }
};

export const redactSensitiveText = (input: string) => {
  if (!input) return input;
  let output = input;
  if (output.includes("://")) {
    output = redactUrl(output);
  } else {
    output = output.replace(QUERY_PARAM_PATTERN, `$1${REDACTED_VALUE}`);
  }
  output = output.replace(BEARER_PATTERN, `$1 ${REDACTED_TOKEN}`);
  output = output.replace(OPENAI_KEY_PATTERN, REDACTED_TOKEN);
  output = output.replace(GOOGLE_KEY_PATTERN, REDACTED_TOKEN);
  output = output.replace(ARCGIS_KEY_PATTERN, REDACTED_TOKEN);
  output = output.replace(JWT_PATTERN, REDACTED_TOKEN);
  output = output.replace(ADDRESS_PATTERN, REDACTED_ADDRESS);
  return output;
};

export const redactSensitiveValue = (value: unknown, seen = new WeakSet<object>()): unknown => {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactSensitiveText(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof URL) return redactSensitiveText(value.toString());
  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitiveValue(entry, seen));
  }
  if (typeof value === "object") {
    if (seen.has(value as object)) return REDACTED_CIRCULAR;
    seen.add(value as object);
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        result[key] = REDACTED_VALUE;
        continue;
      }
      if (isAddressKey(key)) {
        result[key] = REDACTED_ADDRESS;
        continue;
      }
      if (/url|endpoint/i.test(key) && typeof entry === "string") {
        result[key] = redactSensitiveText(entry);
        continue;
      }
      result[key] = redactSensitiveValue(entry, seen);
    }
    return result;
  }
  return value;
};

export const redactLogArgs = (args: unknown[]) => args.map((arg) => redactSensitiveValue(arg));

let logGuardInstalled = false;

export const installLogRedactionGuard = () => {
  if (logGuardInstalled) return;
  if (typeof console === "undefined") return;
  logGuardInstalled = true;
  (["log", "info", "warn", "error", "debug"] as const).forEach((method) => {
    const original = console[method];
    if (typeof original !== "function") return;
    console[method] = (...args: unknown[]) => original.apply(console, redactLogArgs(args));
  });
};

export const __redactionInternals = {
  REDACTED_VALUE,
  REDACTED_TOKEN,
  REDACTED_ADDRESS
};
