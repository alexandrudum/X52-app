import React, { useMemo, useState } from "react";
import {
  Card,
  Elevation,
  Button,
  ButtonGroup,
  Tag,
  Intent,
  Slider,
  Tooltip,
} from "@blueprintjs/core";
import type { PDFDocumentSpec, PDFDiffItem } from "./pdfDiffTypes";

interface PDFCanvasViewerProps {
  doc: PDFDocumentSpec;
  diffItems: PDFDiffItem[];
  selectedDiffId: string | null;
  onSelectDiff: (diffId: string) => void;
  isDarkMode?: boolean;
  side?: "pre" | "post";
}

export const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({
  doc,
  diffItems,
  selectedDiffId,
  onSelectDiff,
  isDarkMode = true,
  side = "pre",
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const isPre = side === "pre";
  const totalPages = Math.max(doc.totalPages, doc.pages.length, 1);
  const page = doc.pages.find((p) => p.pageNumber === currentPage) || doc.pages[0];
  const paragraphs = page?.paragraphs || [];

  const pageDiffs = diffItems.filter((d) => d.pageNumber === currentPage);

  const selectedDiffIndex = useMemo(
    () => (selectedDiffId ? diffItems.findIndex((d) => d.id === selectedDiffId) : -1),
    [diffItems, selectedDiffId]
  );

  const stepDiff = (delta: 1 | -1) => {
    if (diffItems.length === 0) return;
    const len = diffItems.length;
    const nextIdx =
      selectedDiffIndex === -1 ? (delta === 1 ? 0 : len - 1) : (selectedDiffIndex + delta + len) % len;
    const target = diffItems[nextIdx];
    onSelectDiff(target.id);
    if (target.pageNumber !== currentPage) {
      setCurrentPage(target.pageNumber);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      {/* Top Controls Toolbar */}
      <Card
        elevation={Elevation.ONE}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Tag intent={isPre ? Intent.DANGER : Intent.SUCCESS} round style={{ fontWeight: 800 }}>
            {isPre ? "ORIGINAL PDF (WORKING)" : "REVISED PDF (WORKING)"}
          </Tag>
          <span style={{ fontSize: "13px", fontWeight: 700 }}>
            {doc.fileName}
          </span>
          <Tag minimal>{doc.version}</Tag>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Page Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>PAGE:</span>
            <ButtonGroup>
              <Button
                icon="chevron-left"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              />
              <Button minimal text={`${currentPage} / ${totalPages}`} />
              <Button
                icon="chevron-right"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              />
            </ButtonGroup>
          </div>

          {/* Diff Stepper */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Tooltip content="Previous difference" placement="bottom">
              <Button
                icon="arrow-up"
                small
                disabled={diffItems.length === 0}
                onClick={() => stepDiff(-1)}
              />
            </Tooltip>
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)", minWidth: "60px", textAlign: "center" }}>
              Diff {selectedDiffIndex >= 0 ? selectedDiffIndex + 1 : 1} / {diffItems.length}
            </span>
            <Tooltip content="Next difference" placement="bottom">
              <Button
                icon="arrow-down"
                small
                disabled={diffItems.length === 0}
                onClick={() => stepDiff(1)}
              />
            </Tooltip>
          </div>

          {/* Zoom Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "150px" }}>
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>ZOOM:</span>
            <div style={{ flex: 1 }}>
              <Slider
                min={80}
                max={150}
                stepSize={10}
                labelRenderer={(val) => `${val}%`}
                value={zoomLevel}
                onChange={setZoomLevel}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main High-Fidelity Document Page Canvas */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: isDarkMode ? "#090d13" : "#e2e8f0",
          padding: "24px 16px",
          borderRadius: "10px",
          overflowY: "auto",
          height: "calc(100vh - 220px)",
          minHeight: "560px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "920px",
            backgroundColor: isDarkMode ? "#161b22" : "#ffffff",
            padding: "40px 52px",
            borderRadius: "8px",
            boxShadow: "0 10px 35px rgba(0,0,0,0.45)",
            color: isDarkMode ? "#f0f6fc" : "#0f172a",
            fontFamily: "Georgia, 'Times New Roman', serif",
            lineHeight: 1.75,
            fontSize: `calc(14px * ${zoomLevel} / 100)`,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            transition: "all 0.15s ease",
            alignSelf: "flex-start",
          }}
        >
          {/* Document Header Title */}
          <div
            style={{
              textAlign: "center",
              borderBottom: "2px solid var(--x52-border)",
              paddingBottom: "18px",
              marginBottom: "10px",
            }}
          >
            <Tag
              intent={isPre ? Intent.DANGER : Intent.SUCCESS}
              minimal
              round
              style={{ fontWeight: 800, fontSize: "11px", marginBottom: "8px" }}
            >
              {isPre ? "ORIGINAL PDF DOCUMENT VIEW" : "REVISED PDF DOCUMENT VIEW"}
            </Tag>
            <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: 800, fontFamily: "var(--x52-font-sans)" }}>
              {doc.fileName.replace(/\.pdf$/i, "").replace(/_/g, " ")}
            </h2>
            <div style={{ fontSize: "12px", color: "var(--x52-text-muted)", fontFamily: "var(--x52-font-mono)" }}>
              Page {currentPage} of {totalPages} • {doc.fileSize} • {pageDiffs.length} Differences on this page
            </div>
          </div>

          {/* Render All Paragraphs on this Page with Prominent Tag Badges */}
          {paragraphs.map((para, idx) => {
            const diff = para.diffId ? diffItems.find((d) => d.id === para.diffId) : undefined;
            const isSelected = diff && selectedDiffId === diff.id;
            const hasDiff = !!diff;

            return (
              <div
                key={para.id || idx}
                onClick={() => diff && onSelectDiff(diff.id)}
                style={{
                  position: "relative",
                  padding: hasDiff ? "16px 20px" : "6px 10px",
                  borderRadius: "8px",
                  backgroundColor: isSelected
                    ? isPre
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(34, 197, 94, 0.2)"
                    : hasDiff
                    ? isPre
                      ? "rgba(239, 68, 68, 0.08)"
                      : "rgba(34, 197, 94, 0.08)"
                    : "transparent",
                  borderLeft: hasDiff
                    ? isPre
                      ? "5px solid #ef4444"
                      : "5px solid #22c55e"
                    : "5px solid transparent",
                  border: isSelected
                    ? isPre
                      ? "2px solid #ef4444"
                      : "2px solid #22c55e"
                    : undefined,
                  boxShadow: isSelected
                    ? isPre
                      ? "0 0 16px rgba(239, 68, 68, 0.35)"
                      : "0 0 16px rgba(34, 197, 94, 0.35)"
                    : undefined,
                  cursor: hasDiff ? "pointer" : "default",
                  transition: "all 0.15s ease",
                }}
              >
                {/* Visual Difference Tag Badge */}
                {hasDiff && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginBottom: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Tag
                        intent={isPre ? Intent.DANGER : Intent.SUCCESS}
                        round
                        icon={isPre ? "warning-sign" : "tick-circle"}
                        style={{ fontWeight: 800, fontSize: "11px", letterSpacing: "0.04em" }}
                      >
                        {isPre ? "ORIGINAL CLAUSE" : "REVISED CLAUSE"} [{diff.id.toUpperCase()}]
                      </Tag>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: isPre ? "#f87171" : "#4ade80",
                          fontFamily: "var(--x52-font-sans)",
                        }}
                      >
                        {diff.title}
                      </span>
                    </div>

                    <Tag minimal style={{ fontSize: "10px", fontWeight: 700 }}>
                      {diff.category}
                    </Tag>
                  </div>
                )}

                {/* Paragraph Content */}
                <div
                  style={{
                    color: hasDiff
                      ? isPre
                        ? isSelected
                          ? "#fca5a5"
                          : "#ef4444"
                        : isSelected
                        ? "#86efac"
                        : "#22c55e"
                      : "inherit",
                    fontWeight: hasDiff ? 600 : "normal",
                  }}
                >
                  {para.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
