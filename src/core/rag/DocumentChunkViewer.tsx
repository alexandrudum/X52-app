import React, { useCallback } from "react";
import { Button, Card, Code, Elevation, Intent, ProgressBar, Tag } from "@blueprintjs/core";
import type { DocumentChunk } from "./ragTypes";

interface DocumentChunkViewerProps {
  chunk: DocumentChunk;
  isHighlighted?: boolean;
  onSelect?: (chunk: DocumentChunk) => void;
  isDarkMode?: boolean;
}

/**
 * Similarity is the only place this surface spends colour: a strong match is
 * `success`, a usable one is neutral, a marginal one is `warning`. The score is
 * always shown as a number too, so the meaning survives without colour.
 */
function similarityIntent(percent: number): Intent {
  if (percent >= 85) return Intent.SUCCESS;
  if (percent >= 70) return Intent.NONE;
  return Intent.WARNING;
}

/**
 * A single retrieved passage. Dense card: title + muted source metadata, the
 * similarity as a numeric tag over a ProgressBar, and the passage itself in
 * monospace so offsets and identifiers line up.
 *
 * Theme comes entirely from the token layer, so `isDarkMode` is accepted for
 * API compatibility with the widget registry but no longer read.
 */
export const DocumentChunkViewer: React.FC<DocumentChunkViewerProps> = ({
  chunk,
  isHighlighted = false,
  onSelect,
  isDarkMode: _isDarkMode = true,
}) => {
  const matchPct = Math.round(chunk.similarityScore * 100);
  const scoreIntent = similarityIntent(matchPct);
  const isInteractive = onSelect != null;

  const handleActivate = useCallback(() => {
    onSelect?.(chunk);
  }, [onSelect, chunk]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleActivate();
      }
    },
    [handleActivate],
  );

  return (
    <Card
      compact
      elevation={Elevation.ZERO}
      interactive={isInteractive}
      selected={isHighlighted}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? isHighlighted : undefined}
      onClick={isInteractive ? handleActivate : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: `1px solid ${
          isHighlighted ? "var(--x52-intent-primary)" : "var(--x52-border-subtle)"
        }`,
        borderRadius: "var(--x52-radius)",
        boxShadow: "none",
        padding: "var(--x52-space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--x52-space-2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "var(--x52-space-3)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "var(--x52-fs-base)",
              fontWeight: "var(--x52-fw-bold)",
              color: "var(--x52-heading)",
            }}
          >
            {chunk.documentTitle}
          </div>
          <div
            className="x52-muted"
            style={{
              fontSize: "var(--x52-fs-small)",
              marginTop: "var(--x52-space-1)",
              display: "flex",
              alignItems: "center",
              gap: "var(--x52-space-2)",
              flexWrap: "wrap",
            }}
          >
            <span>{chunk.section}</span>
            <Code className="x52-numeric" style={{ fontSize: "var(--x52-fs-small)" }}>
              {chunk.vectorId}
            </Code>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--x52-space-2)",
            flex: "none",
          }}
        >
          <Tag minimal intent={scoreIntent} className="x52-numeric">
            {matchPct}% match
          </Tag>
          {isInteractive && (
            <Button
              variant="minimal"
              size="small"
              icon="document-open"
              aria-label={`Open source document for ${chunk.documentTitle}`}
              onClick={(event) => event.stopPropagation()}
            />
          )}
        </div>
      </div>

      {/* Similarity as a bar — Blueprint's ProgressBar, not a hand-rolled div. */}
      <ProgressBar
        value={chunk.similarityScore}
        intent={scoreIntent}
        animate={false}
        stripes={false}
        role="meter"
        aria-label={`Cosine similarity for ${chunk.documentTitle}`}
        aria-valuenow={matchPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${matchPct} percent`}
        style={{ height: "var(--x52-space-1)" }}
      />

      <blockquote
        style={{
          margin: 0,
          fontFamily: "var(--x52-font-mono)",
          fontSize: "var(--x52-fs-small)",
          lineHeight: 1.5,
          padding: "var(--x52-space-2) var(--x52-space-3)",
          borderRadius: "var(--x52-radius)",
          backgroundColor: "var(--x52-card-secondary)",
          border: "1px solid var(--x52-border-subtle)",
          color: "var(--x52-text)",
          whiteSpace: "pre-wrap",
        }}
      >
        {chunk.snippet}
      </blockquote>

      <div
        className="x52-muted"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--x52-space-3)",
          fontSize: "var(--x52-fs-small)",
        }}
      >
        <span>
          Tokens <span className="x52-numeric">{chunk.tokenCount.toLocaleString()}</span>
        </span>
        <span
          style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={chunk.sourceUri}
        >
          <Code style={{ fontSize: "var(--x52-fs-small)" }}>{chunk.sourceUri}</Code>
        </span>
      </div>
    </Card>
  );
};
