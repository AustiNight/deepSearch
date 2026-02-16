const extractFirstJsonChunk = (text: string): string | null => {
  const start = text.search(/[{\[]/);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{' || ch === '[') depth++;
    if (ch === '}' || ch === ']') depth--;
    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  return null;
};

export const parseJsonFromText = (text: string): any => {
  if (!text) return {};
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    // Remove common code fences
    const unfenced = trimmed
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      return JSON.parse(unfenced);
    } catch (_) {
      const chunk = extractFirstJsonChunk(unfenced);
      if (chunk) {
        return JSON.parse(chunk);
      }
      throw new Error('Failed to parse JSON response');
    }
  }
};

export const tryParseJsonFromText = (text: string): { data: any | null; error: Error | null } => {
  try {
    return { data: parseJsonFromText(text), error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};
