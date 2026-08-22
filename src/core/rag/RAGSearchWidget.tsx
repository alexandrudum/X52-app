import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  ControlGroup,
  FormGroup,
  InputGroup,
  NonIdealState,
  Section,
  SectionCard,
  Slider,
  Spinner,
  SpinnerSize,
  Tag,
} from "@blueprintjs/core";
import type { RAGQueryResult, DocumentChunk } from "./ragTypes";
import { DocumentChunkViewer } from "./DocumentChunkViewer";

interface RAGSearchWidgetProps {
  isDarkMode?: boolean;
  defaultThreshold?: number;
  onQueryComplete?: (result: RAGQueryResult) => void;
}

const DEFAULT_QUERY = "How does cluster X-52 balance Kafka streaming partitions?";

/**
 * Fixture knowledge base. Hoisted to module scope so it is allocated once and
 * can be referenced from memoised callbacks without becoming a stale dep.
 */
const MOCK_CHUNKS: DocumentChunk[] = [
  {
    id: "chk-01",
    documentTitle: "X52 Partitioning & Ingestion Architecture",
    sourceUri: "s3://x52-kb/docs/architecture.md",
    section: "Section 3.2 — Distributed Partition Rebalancing",
    snippet:
      "Cluster X-52 continuously rebalances active Kafka topic partitions across all 52 physical nodes by monitoring round-trip telemetry latency and CPU memory pressure thresholds.",
    tokenCount: 420,
    similarityScore: 0.94,
    vectorId: "vec_0x9f1a",
    metadata: { author: "Core Infra Team", lastUpdated: "2026-08-18" },
  },
  {
    id: "chk-02",
    documentTitle: "Palantir Foundry Connector Technical Spec",
    sourceUri: "s3://x52-kb/docs/foundry_sync.pdf",
    section: "Section 1.4 — Ontology Stream Gateway",
    snippet:
      "Telemetry records are buffered in high-density RAM before batched attestation and synchronization into the Palantir Foundry semantic link layer via REST v2 endpoints.",
    tokenCount: 380,
    similarityScore: 0.88,
    vectorId: "vec_0x3c8b",
    metadata: { author: "Foundry Bridge", lastUpdated: "2026-08-20" },
  },
  {
    id: "chk-03",
    documentTitle: "Security Vault & Cryptographic Attestation",
    sourceUri: "s3://x52-kb/docs/security.md",
    section: "Section 4.1 — Live Attestation Protocol",
    snippet:
      "Every streaming ingestion batch contains an asymmetric cryptographic hash verifying payload integrity before node writes occur.",
    tokenCount: 290,
    similarityScore: 0.76,
    vectorId: "vec_0x7e2d",
    metadata: { author: "Security Team", lastUpdated: "2026-08-12" },
  },
];

const SEED_RESULT: RAGQueryResult = {
  query: DEFAULT_QUERY,
  synthesizedAnswer:
    "Cluster X-52 achieves real-time Kafka partition balancing through an autonomous distributed algorithm across all 52 physical nodes [1]. Telemetry ingestion latency and CPU memory load are continuously assessed [1], routing high-throughput events through high-density memory buffers before synching with Palantir Foundry [2]. All transactions maintain cryptographic attestation [3].",
  confidenceScore: 0.96,
  latencyMs: 142,
  citations: [
    { citationIndex: 1, chunkId: "chk-01", documentTitle: "Partitioning Architecture", relevancePercent: 94 },
    { citationIndex: 2, chunkId: "chk-02", documentTitle: "Foundry Spec", relevancePercent: 88 },
    { citationIndex: 3, chunkId: "chk-03", documentTitle: "Security Vault", relevancePercent: 76 },
  ],
  retrievedChunks: MOCK_CHUNKS,
};

const QUERY_INPUT_ID = "x52-rag-query";

/**
 * Vector search over the X52 knowledge base: a labelled query bar, a similarity
 * cutoff, the grounded synthesis with citation tags, and the retrieved chunks.
 *
 * Theme is handled by the token layer, so `isDarkMode` is accepted (widget
 * registry contract) but not read.
 */
export const RAGSearchWidget: React.FC<RAGSearchWidgetProps> = ({
  isDarkMode: _isDarkMode = true,
  defaultThreshold = 0.75,
  onQueryComplete,
}) => {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(defaultThreshold);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedChunkId, setHighlightedChunkId] = useState<string | null>(null);
  const [result, setResult] = useState<RAGQueryResult | null>(SEED_RESULT);

  // The simulated round trip must not settle into an unmounted tree.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current != null) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleExecuteRAG = useCallback(() => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResult(null);
    if (timerRef.current != null) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const filtered = MOCK_CHUNKS.filter((c) => c.similarityScore >= similarityThreshold);
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
      setHighlightedChunkId(null);
      onQueryComplete?.(queryRes);
    }, 900);
  }, [query, similarityThreshold, onQueryComplete]);

  const thresholdPct = Math.round(similarityThreshold * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)" }}>
      <Section
        compact
        title="RAG semantic retrieval"
        subtitle="Vector cosine similarity search with grounded citations over the X52 knowledge base."
        rightElement={<Tag minimal icon="array">1536-D embeddings</Tag>}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "var(--x52-radius)",
          boxShadow: "none",
        }}
      >
        <SectionCard padded={false} style={{ padding: "var(--x52-space-3)" }}>
          <FormGroup
            label="Semantic query"
            labelFor={QUERY_INPUT_ID}
            labelInfo="(natural language)"
            style={{ marginBottom: "var(--x52-space-3)" }}
          >
            <ControlGroup fill>
              <InputGroup
                id={QUERY_INPUT_ID}
                leftIcon="search"
                placeholder="e.g. how are Kafka partitions rebalanced?"
                value={query}
                onValueChange={setQuery}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleExecuteRAG();
                }}
                disabled={isLoading}
                fill
              />
              <Button
                intent="primary"
                icon="flash"
                text={isLoading ? "Retrieving" : "Synthesize"}
                loading={isLoading}
                disabled={!query.trim()}
                onClick={handleExecuteRAG}
              />
            </ControlGroup>
          </FormGroup>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--x52-space-4)",
            }}
          >
            <span className="x52-label" style={{ flex: "none", minWidth: "180px" }}>
              Min similarity cutoff{" "}
              <span className="x52-numeric" style={{ color: "var(--x52-text)" }}>
                {thresholdPct}%
              </span>
            </span>
            <div style={{ flex: 1, paddingRight: "var(--x52-space-3)" }}>
              <Slider
                min={0.5}
                max={0.95}
                stepSize={0.05}
                labelStepSize={0.15}
                labelRenderer={(val) => `${Math.round(val * 100)}%`}
                value={similarityThreshold}
                onChange={setSimilarityThreshold}
                handleHtmlProps={{ "aria-label": "Minimum similarity cutoff" }}
              />
            </div>
          </div>
        </SectionCard>
      </Section>

      {isLoading && (
        <div
          className="x52-panel"
          role="status"
          aria-live="polite"
          style={{ padding: "var(--x52-space-6)" }}
        >
          <NonIdealState
            icon={<Spinner size={SpinnerSize.STANDARD} />}
            title="Retrieving evidence"
            description="Searching vector space, re-ranking document chunks, and synthesizing a grounded answer."
          />
        </div>
      )}

      {result && !isLoading && (
        <>
          <Section
            compact
            title="Grounded synthesis"
            rightElement={
              <span
                className="x52-muted"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--x52-space-2)",
                  fontSize: "var(--x52-fs-small)",
                }}
              >
                <span>
                  Latency <span className="x52-numeric">{result.latencyMs}</span> ms
                </span>
                <span aria-hidden="true">/</span>
                <span>
                  Confidence{" "}
                  <span className="x52-numeric">
                    {Math.round(result.confidenceScore * 100)}%
                  </span>
                </span>
              </span>
            }
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "var(--x52-radius)",
              boxShadow: "none",
            }}
          >
            <SectionCard padded={false} style={{ padding: "var(--x52-space-3)" }}>
              <p
                style={{
                  fontSize: "var(--x52-fs-base)",
                  lineHeight: 1.5,
                  margin: "0 0 var(--x52-space-3) 0",
                  color: "var(--x52-text)",
                }}
              >
                {result.synthesizedAnswer}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--x52-space-2)",
                  flexWrap: "wrap",
                }}
              >
                <span className="x52-label">Citations</span>
                {result.citations.map((cite) => {
                  const isActive = highlightedChunkId === cite.chunkId;
                  return (
                    <Tag
                      key={cite.chunkId}
                      minimal
                      interactive
                      active={isActive}
                      intent={isActive ? "primary" : "none"}
                      icon="document"
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      onClick={() =>
                        setHighlightedChunkId(isActive ? null : cite.chunkId)
                      }
                      onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setHighlightedChunkId(isActive ? null : cite.chunkId);
                        }
                      }}
                    >
                      <span className="x52-numeric">[{cite.citationIndex}]</span>{" "}
                      {cite.documentTitle}{" "}
                      <span className="x52-numeric x52-muted">{cite.relevancePercent}%</span>
                    </Tag>
                  );
                })}
              </div>
            </SectionCard>
          </Section>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-2)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <span className="x52-label">Retrieved evidence chunks</span>
              <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
                <span className="x52-numeric">{result.retrievedChunks.length}</span> above{" "}
                <span className="x52-numeric">{thresholdPct}%</span>
              </span>
            </div>

            {result.retrievedChunks.length === 0 ? (
              <div className="x52-panel" style={{ padding: "var(--x52-space-6)" }}>
                <NonIdealState
                  icon="search"
                  title="No chunks above the cutoff"
                  description="Lower the minimum similarity cutoff to widen the candidate set."
                  action={
                    <Button
                      variant="outlined"
                      size="small"
                      icon="reset"
                      text="Reset cutoff"
                      onClick={() => setSimilarityThreshold(defaultThreshold)}
                    />
                  }
                />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-2)" }}>
                {result.retrievedChunks.map((chunk) => (
                  <DocumentChunkViewer
                    key={chunk.id}
                    chunk={chunk}
                    isHighlighted={highlightedChunkId === chunk.id}
                    onSelect={(c) =>
                      setHighlightedChunkId((prev) => (prev === c.id ? null : c.id))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
