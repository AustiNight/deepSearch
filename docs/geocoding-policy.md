# Geocoding Policy (Keyless Defaults)

The default geocoding path uses the public Nominatim API (OpenStreetMap) in **keyless** mode. This is intentionally rate-limited and cached to comply with usage requirements.

## Requirements
- Identify your application and provide a contact email when possible.
- Respect strict rate limits (1 request per second).
- Cache results aggressively to avoid unnecessary repeat calls.

## Implementation Notes
- `services/openDataGeocoding.ts` enforces a 1s rate limit and caches responses for 7 days.
- Optional configuration field `openData.auth.geocodingEmail` supplies the Nominatim contact email.
- When the email is not provided, the app still runs in keyless mode but should be used sparingly.

## Usage Guidance
Use geocoding only to resolve address geometry for parcel/GIS lookups. Avoid high-volume batch geocoding without a dedicated provider contract.
