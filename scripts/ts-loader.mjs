import { extname } from "node:path";

export async function resolve(specifier, context, defaultResolve) {
  const isRelative = specifier.startsWith(".") || specifier.startsWith("/");
  if (isRelative && !extname(specifier)) {
    try {
      return await defaultResolve(`${specifier}.ts`, context, defaultResolve);
    } catch (error) {
      // Fall through to default resolution below.
    }
  }
  return defaultResolve(specifier, context, defaultResolve);
}
