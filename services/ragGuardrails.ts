export type RagGuardrails = {
  allowEmbeddings: boolean;
  allowExternalVectorDb: boolean;
  allowRemoteIndex: boolean;
  mode: "local-only";
};

export const RAG_GUARDRAILS: RagGuardrails = {
  allowEmbeddings: false,
  allowExternalVectorDb: false,
  allowRemoteIndex: false,
  mode: "local-only"
};

export const assertRagGuardrails = (input: {
  allowEmbeddings?: boolean;
  usesExternalVectorDb?: boolean;
  usesRemoteIndex?: boolean;
}): void => {
  if (input.allowEmbeddings) {
    throw new Error("RAG guardrail violation: embeddings are disabled; use local BM25/TF-IDF only.");
  }
  if (input.usesExternalVectorDb) {
    throw new Error("RAG guardrail violation: external or paid vector databases are not allowed.");
  }
  if (input.usesRemoteIndex) {
    throw new Error("RAG guardrail violation: remote indices are disallowed; keep retrieval local.");
  }
};
