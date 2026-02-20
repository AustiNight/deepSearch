import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const run = (cmd) => {
  execSync(cmd, { stdio: "inherit" });
};

const parseJsonl = (text) => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch (_) {
        return [];
      }
    });
};

const writeFile = (relativePath, content) => {
  fs.writeFileSync(path.join(ROOT, relativePath), content, "utf8");
};

const readFile = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const buildBundle = () => {
  const discovery = readFile("docs/Discovery_API.rag.chunks.jsonl");
  const soda = readFile("docs/Discovery_API_2.rag.chunks.jsonl");
  const joined = [discovery.trim(), soda.trim()].filter(Boolean).join("\n") + "\n";
  writeFile("docs/Socrata.rag.bundle.jsonl", joined);
  return joined;
};

const buildIndexManifest = () => {
  const manifest = {
    title: "Socrata RAG Index",
    version: "1.0",
    artifacts: [
      {
        doc_id: "socrata_discovery",
        source_file: "docs/Discovery_API.md",
        rag_json: "docs/Discovery_API.rag.json",
        chunks_jsonl: "docs/Discovery_API.rag.chunks.jsonl",
        endpoints_jsonl: "docs/Discovery_API.rag.endpoints.jsonl"
      },
      {
        doc_id: "socrata_soda_api",
        source_file: "docs/Discovery_API_2.txt",
        rag_json: "docs/Discovery_API_2.rag.json",
        chunks_jsonl: "docs/Discovery_API_2.rag.chunks.jsonl"
      },
      {
        doc_id: "socrata_bundle",
        source_file: [
          "docs/Discovery_API.rag.chunks.jsonl",
          "docs/Discovery_API_2.rag.chunks.jsonl"
        ],
        chunks_jsonl: "docs/Socrata.rag.bundle.jsonl"
      }
    ]
  };
  writeFile("docs/Socrata.rag.index.json", JSON.stringify(manifest, null, 2));
};

const normalizeParamName = (name) => name.trim();

const isParamNameValid = (name) => {
  if (!name) return false;
  if (/^constraints/i.test(name)) return false;
  if (name.includes(":")) return false;
  if (/\s/.test(name)) return false;
  return true;
};

const extractPathParams = (pathValue) => {
  if (!pathValue || typeof pathValue !== "string") return [];
  const idx = pathValue.indexOf("?");
  if (idx === -1) return [];
  const query = pathValue.slice(idx + 1);
  return query
    .split("&")
    .map((part) => part.split("=")[0])
    .map((name) => normalizeParamName(name || ""))
    .filter((name) => isParamNameValid(name));
};

const buildSpec = (bundleText) => {
  const endpoints = parseJsonl(readFile("docs/Discovery_API.rag.endpoints.jsonl"));
  const allowedParams = new Set();
  for (const endpoint of endpoints) {
    const params = endpoint?.request?.query || [];
    for (const param of params) {
      const name = normalizeParamName(param?.name || "");
      if (!isParamNameValid(name)) continue;
      allowedParams.add(name);
    }
    const pathParams = extractPathParams(endpoint?.path || "");
    pathParams.forEach((param) => allowedParams.add(param));
  }

  const bundle = parseJsonl(bundleText);
  const pickChunkIds = (predicate, limit = 8) => {
    const hits = bundle.filter(predicate).slice(0, limit).map((chunk) => chunk.id).filter(Boolean);
    return Array.from(new Set(hits));
  };

  const discoveryChunks = pickChunkIds(
    (chunk) => chunk.doc_id === "socrata_discovery" && /catalog\/v1/i.test(chunk.text)
  );
  const sodaV2Chunks = pickChunkIds(
    (chunk) => chunk.doc_id === "socrata_soda_api" && /\/resource\//i.test(chunk.text)
  );
  const sodaV3Chunks = pickChunkIds(
    (chunk) => chunk.doc_id === "socrata_soda_api" && /api\/v3\/views/i.test(chunk.text)
  );

  const spec = {
    version: 1,
    discovery: {
      catalogBaseUrls: {
        us: "https://api.us.socrata.com/api/catalog/v1",
        eu: "https://api.eu.socrata.com/api/catalog/v1"
      },
      allowedParams: Array.from(allowedParams.values()).sort(),
      pagination: {
        defaultLimit: 100,
        maxOffsetPlusLimit: 10000
      },
      sourceChunkIds: discoveryChunks
    },
    soda: {
      v2: {
        resourcePath: "/resource/{id}.json",
        sourceChunkIds: sodaV2Chunks
      },
      v3: {
        queryPath: "/api/v3/views/{id}/query.json",
        exportPath: "/api/v3/views/{id}/export.csv",
        sourceChunkIds: sodaV3Chunks
      }
    }
  };

  writeFile("data/socrataRagSpec.json", JSON.stringify(spec, null, 2));
  writeFile("data/socrataRagSpec.ts", `const spec = ${JSON.stringify(spec, null, 2)};\nexport default spec;\n`);
};

const buildWorkerBundle = (bundleText) => {
  const payload = `export const SOCRATA_RAG_BUNDLE_JSONL = ${JSON.stringify(bundleText)};\n`;
  writeFile("workers/socrataRagBundle.ts", payload);
};

const main = () => {
  const parseScript = path.join(ROOT, "scripts", "parse_discovery_api.py");
  run(`python3 ${parseScript} --input docs/Discovery_API.md --out-json docs/Discovery_API.rag.json --out-jsonl docs/Discovery_API.rag.chunks.jsonl --out-endpoints-jsonl docs/Discovery_API.rag.endpoints.jsonl --mode discovery --doc-id socrata_discovery`);
  run(`python3 ${parseScript} --input docs/Discovery_API_2.txt --out-json docs/Discovery_API_2.rag.json --out-jsonl docs/Discovery_API_2.rag.chunks.jsonl --mode generic --doc-id socrata_soda_api`);

  const bundleText = buildBundle();
  buildIndexManifest();
  buildSpec(bundleText);
  buildWorkerBundle(bundleText);
};

main();
