import { extname } from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const TS_EXTENSIONS = new Set([".ts", ".tsx"]);

export async function resolve(specifier, context, defaultResolve) {
  const isRelative = specifier.startsWith(".") || specifier.startsWith("/");
  if (isRelative && !extname(specifier)) {
    const candidates = [`${specifier}.ts`, `${specifier}.tsx`];
    for (const candidate of candidates) {
      try {
        return await defaultResolve(candidate, context, defaultResolve);
      } catch (error) {
        // Try next candidate.
      }
    }
  }
  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  const extension = extname(new URL(url).pathname);
  if (TS_EXTENSIONS.has(extension)) {
    const filename = fileURLToPath(url);
    const sourceText = await readFile(filename, "utf8");
    const transpiled = ts.transpileModule(sourceText, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        sourceMap: false
      },
      fileName: filename
    });
    return {
      format: "module",
      source: transpiled.outputText,
      shortCircuit: true
    };
  }
  return defaultLoad(url, context, defaultLoad);
}
