export type RagArtifactReference = {
  id: string;
  description: string;
  path: string;
};

export const SOCRATA_RAG_ARTIFACTS: RagArtifactReference[] = [
  {
    id: "socrata_discovery_rag",
    description: "Socrata Discovery API parsed JSON",
    path: "docs/Discovery_API.rag.json"
  },
  {
    id: "socrata_discovery_chunks",
    description: "Socrata Discovery API chunks",
    path: "docs/Discovery_API.rag.chunks.jsonl"
  },
  {
    id: "socrata_discovery_endpoints",
    description: "Socrata Discovery API endpoints",
    path: "docs/Discovery_API.rag.endpoints.jsonl"
  },
  {
    id: "socrata_soda_rag",
    description: "Socrata SODA API parsed JSON",
    path: "docs/Discovery_API_2.rag.json"
  },
  {
    id: "socrata_soda_chunks",
    description: "Socrata SODA API chunks",
    path: "docs/Discovery_API_2.rag.chunks.jsonl"
  },
  {
    id: "socrata_bundle",
    description: "Combined Socrata RAG bundle",
    path: "docs/Socrata.rag.bundle.jsonl"
  },
  {
    id: "socrata_index",
    description: "Socrata RAG index manifest",
    path: "docs/Socrata.rag.index.json"
  }
];
