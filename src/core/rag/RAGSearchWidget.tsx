import React, { useState } from "react";
import {
  Card,
  Elevation,
  InputGroup,
  Button,
  Tag,
  Intent,
  Slider,
  Spinner,
} from "@blueprintjs/core";
import type { RAGQueryResult, DocumentChunk } from "./ragTypes";
import { DocumentChunkViewer } from "./DocumentChunkViewer";

interface RAGSearchWidgetProps {
  isDarkMode?: boolean;
  defaultThreshold?: number;
  onQueryComplete?: (result: RAGQueryResult) => void;
}

export const RAGSearchWidget: React.FC<RAGSearchWidgetProps> = ({
  isDarkMode = true,
  defaultThreshold = 0.75,
  onQueryComplete,
}) => {
  const [query, setQuery] = useState("How does cluster X-52 balance Kafka streaming partitions?");
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(defaultThreshold);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedChunkId, setHighlightedChunkId] = useState<string | null>(null);

  // Mock Knowledge Base Chunks
  const mockChunks: DocumentChunk[] = [
    {
      id: "chk-01",
      documentTitle: "X52 Partitioning & Ingestion Architecture",
      sourceUri: "s3://x52-kb/docs/architecture.md",
      section: "Section 3.2: Distributed Partition Rebalancing",
      snippet: "Cluster X-52 continuously rebalances active Kafka topic partitions across all 52 physical nodes by monitoring round-trip telemetry latency and CPU memory pressure thresholds.",
      tokenCount: 420,
      similarityScore: 0.94,
      vectorId: "vec_0x9f1a",
      metadata: { author: "Core Infra Team", lastUpdated: "2026-08-18" },
    },
    {
      id: "chk-02",
      documentTitle: "Palantir Foundry Connector Technical Spec",
      sourceUri: "s3://x52-kb/docs/foundry_sync.pdf",
      section: "Section 1.4: Ontology Stream Gateway",
      snippet: "Telemetry records are buffered in high-density RAM before batched attestation and synchronization into the Palantir Foundry semantic link layer via REST v2 endpoints.",
      tokenCount: 380,
      similarityScore: 0.88,
      vectorId: "vec_0x3c8b",
      metadata: { author: "Foundry Bridge", lastUpdated: "2026-08-20" },
    },
    {
      id: "chk-03",
      documentTitle: "Security Vault & Cryptographic Attestation",
      sourceUri: "s3://x52-kb/docs/security.md",
      section: "Section 4.1: Live Attestation Protocol",
      snippet: "Every streaming ingestion batch contains an asymmetric cryptographic hash verifying payload integrity before node writes occur.",
      tokenCount: 290,
      similarityScore: 0.76,
      vectorId: "vec_0x7e2d",
      metadata: { author: "Security Team", lastUpdated: "2026-08-12" },
    },
  ];

  const [result, setResult] = useState<RAGQueryResult | null>({
    query: "How does cluster X-52 balance Kafka streaming partitions?",
    synthesizedAnswer: "Cluster X-52 achieves real-time Kafka partition balancing through an autonomous distributed algorithm across all 52 physical nodes [1]. Telemetry ingestion latency and CPU memory load are continuously assessed [1], routing high-throughput events through high-density memory buffers before synching with Palantir Foundry [2]. All transactions maintain cryptographic attestation [3].",
    confidenceScore: 0.96,
    latencyMs: 142,
    citations: [
      { citationIndex: 1, chunkId: "chk-01", documentTitle: "Partitioning Architecture", relevancePercent: 94 },
      { citationIndex: 2, chunkId: "chk-02", documentTitle: "Foundry Spec", relevancePercent: 88 },
      { citationIndex: 3, chunkId: "chk-03", documentTitle: "Security Vault", relevancePercent: 76 },
    ],
    retrievedChunks: mockChunks,
  });

  const handleExecuteRAG = () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      const filtered = mockChunks.filter((c) => c.similarityScore >= similarityThreshold);
      const queryRes: RAGQueryResult = {
        query,
        synthesizedAnswer: `Synthesized response for "${query}": Based on the retrieved vector embeddings, Cluster X-52 utilizes adaptive real-time partition reallocation [1] and buffers telemetry batches prior to Foundry sync [2].`,
        confidenceScore: 0.94,
        latencyMs: Math.floor(120 + Math.random() * 40),
        citations: filtered.map((c, i) => ({
          citationIndex: i + 1,
          chunkId: c.id,
          documentTitle: c.documentTitle,
          relevancePercent: Math.round(c.similarityScore * 100),
        })),
        retrievedChunks: filtered,
      };
      setResult(queryRes);
      setIsLoading(false);
      if (onQueryComplete) onQueryComplete(queryRes);
    }, 900);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Semantic Search Query Bar */}
      <Card
        elevation={Elevation.ONE}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>RAG Semantic Retrieval & Knowledge Synthesis</h3>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Vector cosine similarity search with grounded citations over the X52 knowledge base.
            </span>
          </div>
          <Tag minimal round intent={Intent.PRIMARY} style={{ fontWeight: 700 }}>
            VECTOR EMBEDDINGS (1536-D)
          </Tag>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
          <InputGroup
            leftIcon="search"
            placeholder="Ask anything or search semantic vector space..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExecuteRAG()}
            large
            fill
          />
          <Button
            intent="primary"
            icon="flash"
            text={isLoading ? "Retrieving..." : "Synthesize Answer"}
            loading={isLoading}
            onClick={handleExecuteRAG}
            large
            style={{ padding: "0 24px" }}
          />
        </div>

        {/* Similarity Threshold Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "0 8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", minWidth: "160px" }}>
            MIN SIMILARITY CUTOFF: {Math.round(similarityThreshold * 100)}%
          </span>
          <div style={{ flex: 1 }}>
            <Slider
              min={0.5}
              max={0.95}
              stepSize={0.05}
              labelStepSize={0.15}
              labelRenderer={(val) => `${Math.round(val * 100)}%`}
              value={similarityThreshold}
              onChange={setSimilarityThreshold}
            />
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card elevation={Elevation.ONE} style={{ padding: "32px", textAlign: "center", backgroundColor: "var(--x52-card-bg)" }}>
          <Spinner size={36} intent={Intent.PRIMARY} />
          <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--x52-text-muted)" }}>
            Searching vector space, re-ranking document chunks, and synthesizing grounded answer...
          </p>
        </Card>
      )}

      {/* Synthesized Response with Citations */}
      {result && !isLoading && (
        <>
          <Card
            elevation={Elevation.TWO}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "10px",
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Tag minimal round intent={Intent.SUCCESS} style={{ fontWeight: 800 }}>
                  GROUNDED AI SYNTHESIS
                </Tag>
                <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                  {result.latencyMs}ms • Confidence: {Math.round(result.confidenceScore * 100)}%
                </span>
              </div>
            </div>

            <p style={{ fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px 0", fontWeight: 500 }}>
              {result.synthesizedAnswer}
            </p>

            {/* Citations Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)" }}>CITATIONS:</span>
              {result.citations.map((cite) => (
                <Tag
                  key={cite.citationIndex}
                  interactive
                  round
                  intent={highlightedChunkId === cite.chunkId ? Intent.PRIMARY : Intent.NONE}
                  onClick={() =>
                    setHighlightedChunkId(
                      highlightedChunkId === cite.chunkId ? null : cite.chunkId
                    )
                  }
                  style={{ cursor: "pointer", fontWeight: 600, fontSize: "11px" }}
                >
                  [{cite.citationIndex}] {cite.documentTitle} ({cite.relevancePercent}%)
                </Tag>
              ))}
            </div>
          </Card>

          {/* Retrieved Knowledge Chunks List */}
          <div>
            <h4 style={{ margin: "8px 0 12px 0", fontWeight: 700, fontSize: "14px" }}>
              Retrieved Evidence Chunks ({result.retrievedChunks.length})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {result.retrievedChunks.map((chunk) => (
                <DocumentChunkViewer
                  key={chunk.id}
                  chunk={chunk}
                  isHighlighted={highlightedChunkId === chunk.id}
                  isDarkMode={isDarkMode}
                  onSelect={(c) => setHighlightedChunkId(c.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
