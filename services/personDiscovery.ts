const PERSON_TITLE_PREFIXES = new Set([
  "mr",
  "mrs",
  "ms",
  "miss",
  "mx",
  "dr",
  "prof",
  "professor",
  "chef",
  "judge",
  "captain",
  "officer",
  "attorney",
  "pastor",
  "reverend"
]);

const normalizeSpaces = (value: string) => value.replace(/\s+/g, " ").trim();

const stripTrailingLocation = (value: string) => {
  return value.replace(/\b(?:of|in|from|near|around|outside of|outside)\b[\s\S]*$/i, "").trim();
};

const stripLeadingTitles = (value: string) => {
  const tokens = normalizeSpaces(value).split(" ").filter(Boolean);
  while (tokens.length > 0) {
    const normalized = tokens[0].toLowerCase().replace(/[.]/g, "");
    if (!PERSON_TITLE_PREFIXES.has(normalized)) break;
    tokens.shift();
  }
  return tokens.join(" ");
};

const cleanToken = (token: string) => token.replace(/^[^A-Za-z]+|[^A-Za-z'-]+$/g, "");

export type IndividualSourceClass = "official" | "news" | "social";

const SOCIAL_DOMAINS = [
  "instagram.com",
  "facebook.com",
  "linkedin.com",
  "x.com",
  "twitter.com",
  "tiktok.com",
  "youtube.com",
  "threads.net",
  "pinterest.com"
];

const NEWS_DOMAINS = [
  "news.google.com",
  "google.com",
  "apnews.com",
  "reuters.com",
  "bloomberg.com",
  "wsj.com",
  "nytimes.com",
  "washingtonpost.com",
  "usatoday.com",
  "npr.org",
  "cnn.com",
  "bbc.com",
  "foxnews.com",
  "nbcnews.com",
  "abcnews.go.com",
  "cbsnews.com",
  "dallasnews.com",
  "houstonchronicle.com",
  "star-telegram.com"
];

const OFFICIAL_DOMAIN_PATTERNS = [/\.gov$/i, /\.gov\./i, /\.mil$/i, /\.mil\./i, /\.edu$/i, /\.edu\./i];
const NEWS_HINT_PATTERN = /\b(news|times|tribune|gazette|chronicle|post|journal|herald)\b/i;

const getDomain = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch (_) {
    return "";
  }
};

const domainMatches = (domain: string, candidate: string) => {
  return domain === candidate || domain.endsWith(`.${candidate}`);
};

export const extractLikelyPersonName = (topic: string) => {
  const noUrl = normalizeSpaces(topic.replace(/https?:\/\/\S+/gi, " ").replace(/www\.\S+/gi, " "));
  const noLocationTail = stripTrailingLocation(noUrl);
  const noTitle = stripLeadingTitles(noLocationTail);
  const tokens = normalizeSpaces(noTitle)
    .split(" ")
    .map(cleanToken)
    .filter((token) => token.length >= 2);
  if (tokens.length < 2) return "";
  const candidate = tokens.slice(0, Math.min(3, tokens.length)).join(" ");
  return normalizeSpaces(candidate);
};

export const buildPersonNameVariants = (topic: string) => {
  const extracted = extractLikelyPersonName(topic);
  const cleaned = normalizeSpaces(extracted || topic);
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length < 2) return [];
  const suffixes = new Set(["jr", "sr", "ii", "iii", "iv", "v"]);
  const rawLast = parts[parts.length - 1];
  const rawSuffix = suffixes.has(rawLast.toLowerCase()) ? rawLast : "";
  const baseParts = rawSuffix ? parts.slice(0, -1) : parts.slice();
  if (baseParts.length < 2) return [];
  const first = baseParts[0];
  const last = baseParts[baseParts.length - 1];
  const middleParts = baseParts.slice(1, -1);
  const middle = middleParts.join(" ");
  const middleInitials = middleParts.map((part) => part[0]).join(" ");
  const suffix = rawSuffix ? ` ${rawSuffix}` : "";

  const variants = [
    `${first} ${last}${suffix}`.trim(),
    `${last}, ${first}${suffix}`.trim(),
    `${first} ${middle} ${last}${suffix}`.trim(),
    `${first} ${middleInitials} ${last}${suffix}`.trim(),
    `${first[0]}. ${last}${suffix}`.trim(),
    `${first} ${last}`.trim(),
    `${last} ${first}`.trim()
  ];

  return Array.from(new Set(variants.filter((value) => value.replace(/\s+/g, "").length >= 4)));
};

export const classifyIndividualSourceClass = (input: { uri?: string; domain?: string; title?: string; snippet?: string }) => {
  const domain = (input.domain || getDomain(input.uri || "")).toLowerCase();
  const text = `${input.title || ""} ${input.snippet || ""} ${input.uri || ""}`.toLowerCase();
  if (!domain) return null;
  if (SOCIAL_DOMAINS.some((candidate) => domainMatches(domain, candidate))) return "social" as const;
  if (
    NEWS_DOMAINS.some((candidate) => domainMatches(domain, candidate))
    || domain.startsWith("news.")
    || NEWS_HINT_PATTERN.test(domain)
    || /\b(news|breaking|headline)\b/.test(text)
  ) {
    return "news" as const;
  }
  if (OFFICIAL_DOMAIN_PATTERNS.some((pattern) => pattern.test(domain)) || /\bofficial\b/.test(text)) {
    return "official" as const;
  }
  return null;
};

export const computeIndividualSourceCoverage = (
  sources: Array<{ uri?: string; domain?: string; title?: string; snippet?: string }>,
  minimums: Record<IndividualSourceClass, number> = { official: 1, news: 1, social: 1 }
) => {
  const uniqueByUri = new Map<string, { uri?: string; domain?: string; title?: string; snippet?: string }>();
  sources.forEach((source) => {
    const key = (source.uri || source.domain || "").trim();
    if (!key || uniqueByUri.has(key)) return;
    uniqueByUri.set(key, source);
  });

  const domainHits: Record<IndividualSourceClass, Set<string>> = {
    official: new Set<string>(),
    news: new Set<string>(),
    social: new Set<string>()
  };

  uniqueByUri.forEach((source) => {
    const sourceClass = classifyIndividualSourceClass(source);
    if (!sourceClass) return;
    const domain = (source.domain || getDomain(source.uri || "")).toLowerCase();
    if (!domain) return;
    domainHits[sourceClass].add(domain);
  });

  const counts: Record<IndividualSourceClass, number> = {
    official: domainHits.official.size,
    news: domainHits.news.size,
    social: domainHits.social.size
  };
  const missing = (Object.keys(minimums) as IndividualSourceClass[]).filter(
    (sourceClass) => counts[sourceClass] < Math.max(0, minimums[sourceClass] || 0)
  );

  return {
    counts,
    domains: {
      official: Array.from(domainHits.official),
      news: Array.from(domainHits.news),
      social: Array.from(domainHits.social)
    },
    minimums,
    missing,
    meetsAll: missing.length === 0
  };
};

export const buildIndividualRecallQueries = (input: {
  topic: string;
  nameVariants: string[];
  city?: string;
  state?: string;
  domainHint?: string;
}) => {
  const baseName = extractLikelyPersonName(input.topic) || input.nameVariants[0] || input.topic;
  const locationHint = [input.city, input.state].filter(Boolean).join(" ").trim();
  const q = [
    `"${baseName}" official website`,
    `"${baseName}" biography`,
    `"${baseName}" interview`,
    `"${baseName}" profile`,
    `"${baseName}" news`,
    locationHint ? `"${baseName}" "${locationHint}"` : "",
    `site:instagram.com "${baseName}"`,
    `site:facebook.com "${baseName}"`,
    `site:linkedin.com "${baseName}"`,
    `site:tiktok.com "${baseName}"`,
    `site:youtube.com "${baseName}"`,
    `site:x.com "${baseName}"`,
    `site:twitter.com "${baseName}"`,
    input.domainHint ? `site:${input.domainHint} "${baseName}"` : ""
  ].filter(Boolean);

  input.nameVariants.slice(1, 4).forEach((variant) => {
    q.push(`"${variant}" official website`);
    q.push(`site:instagram.com "${variant}"`);
    q.push(`"${variant}" news`);
  });

  return Array.from(new Set(q));
};

export const buildIndividualVerificationQueries = (input: {
  topic: string;
  nameVariants: string[];
  city?: string;
  state?: string;
  domainHint?: string;
  missingClasses: IndividualSourceClass[];
}) => {
  const baseName = extractLikelyPersonName(input.topic) || input.nameVariants[0] || input.topic;
  const locationHint = [input.city, input.state].filter(Boolean).join(" ").trim();
  const locationFilter = locationHint ? `"${locationHint}"` : "";
  const names = Array.from(new Set([baseName, ...input.nameVariants].filter(Boolean))).slice(0, 3);
  const queries: string[] = [];

  if (input.missingClasses.includes("official")) {
    names.forEach((name) => {
      queries.push(`"${name}" official website`);
      queries.push(`"${name}" biography`);
      queries.push(`site:.gov "${name}" ${locationFilter}`.trim());
      queries.push(`site:.edu "${name}" ${locationFilter}`.trim());
      if (input.domainHint) queries.push(`site:${input.domainHint} "${name}"`);
    });
  }
  if (input.missingClasses.includes("news")) {
    names.forEach((name) => {
      queries.push(`"${name}" news ${locationFilter}`.trim());
      queries.push(`site:news.google.com "${name}"`);
      queries.push(`"${name}" interview ${locationFilter}`.trim());
    });
  }
  if (input.missingClasses.includes("social")) {
    names.forEach((name) => {
      queries.push(`site:linkedin.com "${name}"`);
      queries.push(`site:instagram.com "${name}"`);
      queries.push(`site:facebook.com "${name}"`);
      queries.push(`site:x.com "${name}"`);
    });
  }

  return Array.from(new Set(queries.filter(Boolean)));
};
