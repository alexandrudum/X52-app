/**
 * Shape of the data flowing through the RAG explorer surfaces.
 *
 * Kept free of presentation concerns: intent/colour decisions live in the
 * components so the same record can be rendered densely (chunk card) or as a
 * single row (citation tag) without duplicating thresholds here.
 */

/** One retrieved passage from the vector store. */
export interface DocumentChunk {
  id: string;
  documentTitle: string;
  sourceUri: string;
  section: string;
  snippet: string;
  tokenCount: number;
  /** Cosine similarity against the query embedding, 0.00 – 1.00. */
  similarityScore: number;
  vectorId: string;
  metadata: Record<string, string | number>;
}

/** A numbered reference the synthesized answer points back to. */
export interface RAGCitation {
  citationIndex: number;
  chunkId: string;
  documentTitle: string;
  /** Relevance of the cited chunk, 0 – 100. */
  relevancePercent: number;
}

/** A completed retrieval + synthesis round trip. */
export interface RAGQueryResult {
  query: string;
  synthesizedAnswer: string;
  /** Model confidence in the synthesis, 0.00 – 1.00. */
  confidenceScore: number;
  latencyMs: number;
  citations: RAGCitation[];
  retrievedChunks: DocumentChunk[];
}
