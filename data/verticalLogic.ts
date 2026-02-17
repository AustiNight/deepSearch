export type VerticalHintContext = {
  topic: string;
  lower: string;
  isPersonLike: boolean;
  isAddressLike: boolean;
  hasCreativeWork: boolean;
  hasReceptionSignals: boolean;
};

export type VerticalHintRule = {
  id: string;
  verticalId: string;
  signals: string;
  match: (context: VerticalHintContext) => boolean;
  isFallback?: boolean;
};

export const isAddressLike = (topic: string) => {
  const hasNumber = /\d{2,}/.test(topic);
  const hasStreet = /\b(ave|avenue|st|street|rd|road|blvd|boulevard|ln|lane|dr|drive|ct|court|cir|circle|way|pkwy|parkway|pl|place|hwy|highway)\b/i.test(topic);
  const hasZip = /\b\d{5}(?:-\d{4})?\b/.test(topic);
  return (hasNumber && hasStreet) || hasZip;
};

export const isPersonLike = (topic: string) => {
  const parts = topic.trim().split(/\s+/);
  if (parts.length < 2) return false;
  if (/\d/.test(topic)) return false;
  return true;
};

const uniqueList = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const buildHintContext = (topic: string): VerticalHintContext => {
  const lower = topic.toLowerCase();
  const hasCreativeWork = /\b(film|movie|book|novel|album|song|painting)\b/i.test(lower);
  const hasReceptionSignals =
    /\b(review|reviews|rating|ratings|critic|critics|audience|sentiment|award|awards|nomination|box office)\b/i.test(lower) ||
    /\b(rotten\s+tomatoes|metacritic|goodreads|imdb|omdb)\b/i.test(lower);
  return {
    topic,
    lower,
    isPersonLike: isPersonLike(topic),
    isAddressLike: isAddressLike(topic),
    hasCreativeWork,
    hasReceptionSignals
  };
};

export const VERTICAL_HINT_RULES: VerticalHintRule[] = [
  {
    id: 'person_like',
    verticalId: 'individual',
    signals: 'Looks like a person name (2+ words, no digits).',
    match: (context) => context.isPersonLike
  },
  {
    id: 'address_like',
    verticalId: 'location',
    signals: 'Street address or ZIP code present.',
    match: (context) => context.isAddressLike
  },
  {
    id: 'corp_suffix',
    verticalId: 'corporation',
    signals: 'Company suffix (inc, llc, ltd, corp, co.).',
    match: (context) => /\b(inc|llc|ltd|corp|corporation|company|co\.)\b/i.test(context.topic)
  },
  {
    id: 'product_terms',
    verticalId: 'product',
    signals: 'Product or service terms (product, device, software, app, platform, tool, service).',
    match: (context) => /\b(product|device|software|app|platform|tool|service)\b/i.test(context.lower)
  },
  {
    id: 'location_terms',
    verticalId: 'location',
    signals: 'Location terms (city, county, state, province, region, district).',
    match: (context) => /\b(city|county|state|province|region|district)\b/i.test(context.lower)
  },
  {
    id: 'event_terms',
    verticalId: 'event',
    signals: 'Event terms (event, incident, summit, conference, protest).',
    match: (context) => /\b(event|incident|summit|conference|protest)\b/i.test(context.lower)
  },
  {
    id: 'legal_terms',
    verticalId: 'legal_matter',
    signals: 'Legal terms (law, statute, regulation, act, code, v.).',
    match: (context) => /\b(law|statute|regulation|act|code|v\.)\b/i.test(context.lower)
  },
  {
    id: 'medical_terms',
    verticalId: 'medical_subject',
    signals: 'Medical terms (disease, condition, syndrome, drug, medication, anatomy).',
    match: (context) => /\b(disease|condition|syndrome|drug|medication|anatomy)\b/i.test(context.lower)
  },
  {
    id: 'creative_work_terms',
    verticalId: 'creative_work',
    signals: 'Creative work terms (film, movie, book, novel, album, song, painting).',
    match: (context) => context.hasCreativeWork
  },
  {
    id: 'reception_signals',
    verticalId: 'reception',
    signals: 'Reception signals (reviews, ratings, critics, audience, sentiment, awards, box office, Rotten Tomatoes, Metacritic, Goodreads, IMDb, OMDb).',
    match: (context) => context.hasReceptionSignals
  },
  {
    id: 'reception_from_creative_work',
    verticalId: 'reception',
    signals: 'Creative work topics implicitly include reception coverage.',
    match: (context) => context.hasCreativeWork
  },
  {
    id: 'technical_terms',
    verticalId: 'technical_concept',
    signals: 'Technical terms (algorithm, protocol, framework, library, api, system).',
    match: (context) => /\b(algorithm|protocol|framework|library|api|system)\b/i.test(context.lower)
  },
  {
    id: 'nontechnical_terms',
    verticalId: 'nontechnical_concept',
    signals: 'Non-technical concepts (theory, movement, ideology, philosophy).',
    match: (context) => /\b(theory|movement|ideology|philosophy)\b/i.test(context.lower)
  },
  {
    id: 'general_fallback',
    verticalId: 'general_discovery',
    signals: 'Fallback when no other hints match.',
    match: () => true,
    isFallback: true
  }
];

export const inferVerticalHints = (topic: string) => {
  const context = buildHintContext(topic);
  const matches = VERTICAL_HINT_RULES
    .filter((rule) => !rule.isFallback && rule.match(context))
    .map((rule) => rule.verticalId);
  if (matches.length === 0) return ['general_discovery'];
  return uniqueList(matches);
};

export const VERTICAL_SEED_QUERIES: Record<string, string> = {
  individual: '"{topic}" biography',
  corporation: '"{topic}" company profile',
  product: '"{topic}" specifications',
  location: '"{topic}" demographics',
  event: '"{topic}" timeline',
  technical_concept: '"{topic}" implementation',
  nontechnical_concept: '"{topic}" definition',
  creative_work: '"{topic}" review',
  reception: '"{topic}" reviews',
  medical_subject: '"{topic}" overview',
  legal_matter: '"{topic}" summary',
  general_discovery: '{topic} overview'
};
