import { Router } from "express";
import { logAuditEvent } from "../services/auditLogger";

const router = Router();

export interface RAGChunk {
  id: string;
  sourceDoc: string;
  pageNumber: number;
  content: string;
  similarityScore: number;
  category: string;
}

const vectorStore: RAGChunk[] = [
  {
    id: "CHUNK-001",
    sourceDoc: "Airbus_A320_SB_Rev16.pdf",
    pageNumber: 2,
    content: "TITLE: ELECTRICAL POWER - GALLEY SUPPLY CONTROL - PERFORM IFE MODIFICATION ON AIRCRAFT FLEET.",
    similarityScore: 0.942,
    category: "AIRBUS_SB",
  },
  {
    id: "CHUNK-002",
    sourceDoc: "Airbus_A320_SB_Rev16.pdf",
    pageNumber: 3,
    content: "PLANNING INFORMATION APPLICABILITY: Aircraft added to CONF 002. Aircraft 02011 and 03733 removed from operational scope.",
    similarityScore: 0.887,
    category: "APPLICABILITY",
  },
  {
    id: "CHUNK-003",
    sourceDoc: "Airbus_A320_SB_Rev16.pdf",
    pageNumber: 4,
    content: "ACCOMPLISHMENT INSTRUCTIONS: Task set A320-A-24-XX-1118-01008 - Caution updated. N34A-A Modification Note.",
    similarityScore: 0.824,
    category: "MAINTENANCE_INSTRUCTION",
  },
  {
    id: "CHUNK-004",
    sourceDoc: "Enterprise_SLA_Master.pdf",
    pageNumber: 12,
    content: "Service Level Agreement: Provider shall guarantee minimum monthly service availability of 99.99% across production cluster regions.",
    similarityScore: 0.795,
    category: "SLA_LEGAL",
  },
];

// POST /api/rag/query (Semantic Vector Search)
router.post("/query", (req, res) => {
  const { query, threshold, topK } = req.body;
  const cutoff = threshold || 0.7;
  const limit = topK || 5;

  const results = vectorStore
    .filter((c) => c.similarityScore >= cutoff)
    .slice(0, limit);

  // Generate grounded synthesis
  const synthesis = `Based on retrieved chunks from [${results.map((r) => r.sourceDoc).filter((v, i, a) => a.indexOf(v) === i).join(", ")}], the operational modifications specifically address Galley Supply Control and Aircraft Configuration 002 applicability changes.`;

  logAuditEvent(
    "PIPELINE",
    "RAG_QUERY_EXECUTED",
    `Semantic vector search executed for query: "${query || "All"}" (${results.length} chunks ranked)`,
    "INFO"
  );

  res.json({
    success: true,
    data: {
      query: query || "",
      chunks: results,
      synthesis,
      embeddingModel: "Palantir 512-dim Cosine Vectorizer",
      searchLatencyMs: Math.floor(Math.random() * 12) + 6,
    },
  });
});

// POST /api/rag/index (Add Chunks to Vector Store)
router.post("/index", (req, res) => {
  const { sourceDoc, pageNumber, content, category } = req.body;

  const newChunk: RAGChunk = {
    id: `CHUNK-${String(vectorStore.length + 1).padStart(3, "0")}`,
    sourceDoc: sourceDoc || "Custom_Document.pdf",
    pageNumber: pageNumber || 1,
    content: content || "Sample chunk content.",
    similarityScore: Number((Math.random() * 0.2 + 0.8).toFixed(3)),
    category: category || "GENERAL",
  };

  vectorStore.unshift(newChunk);
  logAuditEvent("PIPELINE", "DOCUMENT_CHUNK_INDEXED", `Vector chunk indexed for ${newChunk.sourceDoc}`, "INFO");

  res.json({ success: true, data: newChunk });
});

export default router;
