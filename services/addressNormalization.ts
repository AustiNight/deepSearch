const MAX_ADDRESS_VARIANTS = 4;

const uniqueList = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const normalizeToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const isStreetNumber = (token: string) => /^\d/.test(token);

type DirectionInfo = { abbr: string; full: string; tokens: string[] };

const DIRECTIONS: DirectionInfo[] = [
  { abbr: 'N', full: 'North', tokens: ['north', 'n'] },
  { abbr: 'S', full: 'South', tokens: ['south', 's'] },
  { abbr: 'E', full: 'East', tokens: ['east', 'e'] },
  { abbr: 'W', full: 'West', tokens: ['west', 'w'] },
  { abbr: 'NE', full: 'Northeast', tokens: ['northeast', 'ne'] },
  { abbr: 'NW', full: 'Northwest', tokens: ['northwest', 'nw'] },
  { abbr: 'SE', full: 'Southeast', tokens: ['southeast', 'se'] },
  { abbr: 'SW', full: 'Southwest', tokens: ['southwest', 'sw'] }
];

const DIRECTION_MAP = new Map<string, DirectionInfo>(
  DIRECTIONS.flatMap((dir) => dir.tokens.map(token => [token, dir]))
);

const STREET_SUFFIXES: Array<{ abbr: string; full: string; tokens: string[] }> = [
  { abbr: 'Aly', full: 'Alley', tokens: ['alley', 'aly'] },
  { abbr: 'Ave', full: 'Avenue', tokens: ['avenue', 'ave', 'av'] },
  { abbr: 'Blvd', full: 'Boulevard', tokens: ['boulevard', 'blvd', 'boulv'] },
  { abbr: 'Cir', full: 'Circle', tokens: ['circle', 'cir'] },
  { abbr: 'Ct', full: 'Court', tokens: ['court', 'ct'] },
  { abbr: 'Dr', full: 'Drive', tokens: ['drive', 'dr'] },
  { abbr: 'Expy', full: 'Expressway', tokens: ['expressway', 'expy', 'expwy'] },
  { abbr: 'Fwy', full: 'Freeway', tokens: ['freeway', 'fwy'] },
  { abbr: 'Hwy', full: 'Highway', tokens: ['highway', 'hwy'] },
  { abbr: 'Ln', full: 'Lane', tokens: ['lane', 'ln'] },
  { abbr: 'Loop', full: 'Loop', tokens: ['loop'] },
  { abbr: 'Pkwy', full: 'Parkway', tokens: ['parkway', 'pkwy', 'pky'] },
  { abbr: 'Pl', full: 'Place', tokens: ['place', 'pl'] },
  { abbr: 'Plz', full: 'Plaza', tokens: ['plaza', 'plz'] },
  { abbr: 'Rd', full: 'Road', tokens: ['road', 'rd'] },
  { abbr: 'Sq', full: 'Square', tokens: ['square', 'sq'] },
  { abbr: 'St', full: 'Street', tokens: ['street', 'st'] },
  { abbr: 'Ter', full: 'Terrace', tokens: ['terrace', 'ter'] },
  { abbr: 'Trl', full: 'Trail', tokens: ['trail', 'trl'] },
  { abbr: 'Way', full: 'Way', tokens: ['way'] }
];

const STREET_SUFFIX_MAP = new Map<string, { abbr: string; full: string }>(
  STREET_SUFFIXES.flatMap((suffix) => suffix.tokens.map(token => [token, { abbr: suffix.abbr, full: suffix.full }]))
);

type UnitInfo = { designator: string; id: string };

const UNIT_REGEX = /^(.*?)(?:,?\s*(#|apt|apartment|unit|suite|ste|bldg|building|fl|floor|lot|trlr|trailer)\.?\s*([a-zA-Z0-9-]+))$/i;
const UNIT_ONLY_REGEX = /^(#|apt|apartment|unit|suite|ste|bldg|building|fl|floor|lot|trlr|trailer)\.?\s*([a-zA-Z0-9-]+)$/i;

const parseUnitFromStreetLine = (streetLine: string): { streetLine: string; unit?: UnitInfo } => {
  const match = streetLine.match(UNIT_REGEX);
  if (!match) return { streetLine };
  const base = match[1].trim();
  const designator = match[2].toLowerCase();
  const id = match[3].trim();
  if (!id) return { streetLine };
  return { streetLine: base, unit: { designator, id } };
};

const parseUnitFromRemainder = (part: string): UnitInfo | undefined => {
  const match = part.match(UNIT_ONLY_REGEX);
  if (!match) return undefined;
  const designator = match[1].toLowerCase();
  const id = match[2].trim();
  if (!id) return undefined;
  return { designator, id };
};

const buildStreetVariants = (streetLine: string): string[] => {
  const tokens = streetLine.split(' ').filter(Boolean);
  if (tokens.length === 0) return [];

  const normalizedTokens = tokens.map(token => normalizeToken(token));
  let prefixDirectionIndex = -1;
  if (tokens.length >= 2 && isStreetNumber(tokens[0])) {
    const dirInfo = DIRECTION_MAP.get(normalizedTokens[1]);
    if (dirInfo) prefixDirectionIndex = 1;
  }

  let suffixDirectionIndex = -1;
  const lastTokenNormalized = normalizedTokens[normalizedTokens.length - 1];
  if (DIRECTION_MAP.has(lastTokenNormalized)) {
    suffixDirectionIndex = normalizedTokens.length - 1;
  }

  let suffixIndex = suffixDirectionIndex >= 0 ? suffixDirectionIndex - 1 : normalizedTokens.length - 1;
  if (suffixIndex >= 0 && !STREET_SUFFIX_MAP.has(normalizedTokens[suffixIndex])) {
    suffixIndex = -1;
  }

  const buildTokens = (mode: 'abbr' | 'full') => {
    const updated = [...tokens];
    if (prefixDirectionIndex >= 0) {
      const info = DIRECTION_MAP.get(normalizedTokens[prefixDirectionIndex]);
      if (info) updated[prefixDirectionIndex] = info[mode];
    }
    if (suffixDirectionIndex >= 0) {
      const info = DIRECTION_MAP.get(normalizedTokens[suffixDirectionIndex]);
      if (info) updated[suffixDirectionIndex] = info[mode];
    }
    if (suffixIndex >= 0) {
      const info = STREET_SUFFIX_MAP.get(normalizedTokens[suffixIndex]);
      if (info) updated[suffixIndex] = info[mode];
    }
    return updated.join(' ');
  };

  const original = tokens.join(' ');
  const abbr = buildTokens('abbr');
  const full = buildTokens('full');

  return uniqueList([abbr, full, original]);
};

const buildUnitVariants = (unit?: UnitInfo): string[] => {
  if (!unit) return [];
  const designator = unit.designator.toLowerCase();
  const id = unit.id;

  let abbr = 'Unit';
  let full = 'Unit';
  let hashVariant: string | undefined;

  if (['apt', 'apartment'].includes(designator)) {
    abbr = 'Apt';
    full = 'Apartment';
    hashVariant = `#${id}`;
  } else if (['suite', 'ste'].includes(designator)) {
    abbr = 'Ste';
    full = 'Suite';
  } else if (['unit', '#'].includes(designator)) {
    abbr = 'Unit';
    full = 'Unit';
    hashVariant = `#${id}`;
  } else if (['bldg', 'building'].includes(designator)) {
    abbr = 'Bldg';
    full = 'Building';
  } else if (['fl', 'floor'].includes(designator)) {
    abbr = 'Fl';
    full = 'Floor';
  } else if (['lot'].includes(designator)) {
    abbr = 'Lot';
    full = 'Lot';
  } else if (['trlr', 'trailer'].includes(designator)) {
    abbr = 'Trlr';
    full = 'Trailer';
  }

  const variants = uniqueList([
    `${abbr} ${id}`,
    full ? `${full} ${id}` : '',
    hashVariant || ''
  ]);

  return variants;
};

const joinAddress = (streetLine: string, unit: string, remainder: string) => {
  const base = unit ? `${streetLine} ${unit}` : streetLine;
  return remainder ? `${base}, ${remainder}` : base;
};

export const normalizeAddressVariants = (raw: string): string[] => {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const parts = cleaned.split(',').map(part => part.trim()).filter(Boolean);
  let streetLine = parts[0] || cleaned;
  let remainderParts = parts.slice(1);
  let unitInfo: UnitInfo | undefined;

  const streetParsed = parseUnitFromStreetLine(streetLine);
  streetLine = streetParsed.streetLine;
  unitInfo = streetParsed.unit;

  if (!unitInfo && remainderParts.length > 0) {
    const potentialUnit = parseUnitFromRemainder(remainderParts[0]);
    if (potentialUnit) {
      unitInfo = potentialUnit;
      remainderParts = remainderParts.slice(1);
    }
  }

  const remainder = remainderParts.join(', ');
  const streetVariants = buildStreetVariants(streetLine);
  const unitVariants = buildUnitVariants(unitInfo);

  const addresses: string[] = [];
  if (streetVariants.length === 0) {
    addresses.push(cleaned);
  } else if (unitVariants.length === 0) {
    streetVariants.forEach(street => addresses.push(joinAddress(street, '', remainder)));
  } else {
    streetVariants.forEach((street) => {
      unitVariants.forEach((unit) => addresses.push(joinAddress(street, unit, remainder)));
    });
  }

  return uniqueList([...addresses, cleaned]).slice(0, MAX_ADDRESS_VARIANTS);
};
