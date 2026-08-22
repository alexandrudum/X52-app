import React from "react";
import { Card, Elevation, Tag, Intent, Button } from "@blueprintjs/core";
import type { DocumentChunk } from "./ragTypes";

interface DocumentChunkViewerProps {
  chunk: DocumentChunk;
  isHighlighted?: boolean;
  onSelect?: (chunk: DocumentChunk) => void;
  isDarkMode?: boolean;
}

export const DocumentChunkViewer: React.FC<DocumentChunkViewerProps> = ({
  chunk,
  isHighlighted = false,
  onSelect,
  isDarkMode = true,
}) => {
  const matchPct = Math.round(chunk.similarityScore * 100);
  const scoreIntent =
    matchPct >= 85
      ? Intent.SUCCESS
      : matchPct >= 70
      ? Intent.PRIMARY
      : Intent.WARNING;

  return (
    <Card
      elevation={Elevation.ONE}
      interactive={!!onSelect}
      onClick={() => onSelect && onSelect(chunk)}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: isHighlighted
          ? "2px solid #388bfd"
          : "1px solid var(--x52-border)",
        borderRadius: "8px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: isHighlighted
          ? "0 0 16px rgba(56, 139, 253, 0.35)"
          : undefined,
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "2px" }}>
            {chunk.documentTitle}
          </div>
          <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
            {chunk.section} • <code>{chunk.vectorId}</code>
          </div>
        </div>

        <Tag intent={scoreIntent} round minimal style={{ fontWeight: 800, fontSize: "11px" }}>
          {matchPct}% SIMILARITY
        </Tag>
      </div>

      <div
        style={{
          fontSize: "12px",
          lineHeight: "1.5",
          padding: "10px 12px",
          borderRadius: "6px",
          backgroundColor: isDarkMode ? "#161b22" : "#f1f5f9",
          border: "1px solid var(--x52-border)",
          fontFamily: "var(--font-sans)",
        }}
      >
        "{chunk.snippet}"
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--x52-text-muted)" }}>
        <span>Tokens: <strong>{chunk.tokenCount}</strong></span>
        <span>Source: <code>{chunk.sourceUri}</code></span>
        {onSelect && (
          <Button minimal icon="document-open" text="View Source" small />
        )}
      </div>
    </Card>
  );
};
