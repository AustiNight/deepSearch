import type {
  SourceNormalizationDiagnostics,
  SourceNormalizationResult,
  SourceProvider
} from "../types";

export function normalizeSourcesFromText(
  text: string,
  provider: SourceProvider
): SourceNormalizationResult;

export function normalizeSourcesFromResponse(
  resp: any,
  provider: SourceProvider
): SourceNormalizationResult;

export function normalizeOpenAIResponseSources(resp: any): SourceNormalizationResult;

export function normalizeGeminiResponseSources(resp: any): SourceNormalizationResult;

export function formatSourceDiagnosticsMessage(input: {
  provider: SourceProvider;
  model?: string;
  query?: string;
  diagnostics: SourceNormalizationDiagnostics;
}): string;

export function recordEmptySources(input: {
  provider: SourceProvider;
  model?: string;
  query?: string;
}): void;
