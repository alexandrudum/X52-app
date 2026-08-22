export interface DocumentChunk {
  id: string;
  documentTitle: string;
  sourceUri: string;
  section: string;
  snippet: string;
  tokenCount: number;
  similarityScore: number; // 0.00 to 1.00
  vectorId: string;
  metadata: Record<string, string | number>;
}

export interface RAGCitation {
  citationIndex: number;
  chunkId: string;
  documentTitle: string;
  relevancePercent: number;
}

export interface RAGQueryResult {
  query: string;
  synthesizedAnswer: string;
  confidenceScore: number;
  latencyMs: number;
  citations: RAGCitation[];
  retrievedChunks: DocumentChunk[];
}
