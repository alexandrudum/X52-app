import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Elevation,
  Button,
  ButtonGroup,
  Tag,
  Intent,
  Slider,
} from "@blueprintjs/core";
import type { PDFDocumentSpec, PDFDiffItem } from "./pdfDiffTypes";

interface DualPDFViewerProps {
  preDoc: PDFDocumentSpec;
  postDoc: PDFDocumentSpec;
  diffItems: PDFDiffItem[];
  selectedDiffId: string | null;
  onSelectDiff: (diffId: string) => void;
  isDarkMode?: boolean;
}

export const DualPDFViewer: React.FC<DualPDFViewerProps> = ({
  preDoc,
  postDoc,
  diffItems,
  selectedDiffId,
  onSelectDiff,
  isDarkMode = true,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [syncScroll, setSyncScroll] = useState<boolean>(true);

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);

  // Synchronized scrolling
  const handleScroll = (source: "left" | "right") => {
    if (!syncScroll) return;
    const srcEl = source === "left" ? leftPaneRef.current : rightPaneRef.current;
    const tgtEl = source === "left" ? rightPaneRef.current : leftPaneRef.current;
    if (srcEl && tgtEl) {
      tgtEl.scrollTop = srcEl.scrollTop;
    }
  };

  // Scroll to selected diff when selectedDiffId changes
  useEffect(() => {
    if (!selectedDiffId) return;
    const diff = diffItems.find((d) => d.id === selectedDiffId);
    if (diff && diff.pageNumber !== currentPage) {
      setCurrentPage(diff.pageNumber);
    }
  }, [selectedDiffId, diffItems, currentPage]);

  const currentDiffIndex = diffItems.findIndex((d) => d.id === selectedDiffId);

  const handleNextDiff = () => {
    if (diffItems.length === 0) return;
    const nextIdx = (currentDiffIndex + 1) % diffItems.length;
    onSelectDiff(diffItems[nextIdx].id);
  };

  const handlePrevDiff = () => {
    if (diffItems.length === 0) return;
    const prevIdx = (currentDiffIndex - 1 + diffItems.length) % diffItems.length;
    onSelectDiff(diffItems[prevIdx].id);
  };

  const prePage = preDoc.pages.find((p) => p.pageNumber === currentPage) || preDoc.pages[0];
  const postPage = postDoc.pages.find((p) => p.pageNumber === currentPage) || postDoc.pages[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
      {/* Top Toolbar */}
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
        {/* Navigation & Diff Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ButtonGroup>
            <Button
              icon="chevron-left"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            />
            <Button text={`Page ${currentPage} of ${preDoc.totalPages}`} minimal />
            <Button
              icon="chevron-right"
              disabled={currentPage >= preDoc.totalPages}
              onClick={() => setCurrentPage((p) => Math.min(preDoc.totalPages, p + 1))}
            />
          </ButtonGroup>

          <DividerVertical />

          {/* Jump to Diff Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Button icon="arrow-up" small onClick={handlePrevDiff} title="Previous Difference" />
            <span style={{ fontSize: "12px", fontWeight: 700 }}>
              Diff {currentDiffIndex >= 0 ? currentDiffIndex + 1 : 1} of {diffItems.length}
            </span>
            <Button icon="arrow-down" small onClick={handleNextDiff} title="Next Difference" />
          </div>
        </div>

        {/* Zoom & Sync Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Button
            minimal
            icon="duplicate"
            intent={syncScroll ? Intent.PRIMARY : Intent.NONE}
            text={syncScroll ? "Sync Scroll ON" : "Sync Scroll OFF"}
            onClick={() => setSyncScroll(!syncScroll)}
            small
          />

          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "160px" }}>
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>ZOOM:</span>
            <div style={{ flex: 1 }}>
              <Slider
                min={75}
                max={150}
                stepSize={25}
                labelRenderer={(val) => `${val}%`}
                value={zoomLevel}
                onChange={setZoomLevel}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Dual Document Viewport */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", height: "calc(100vh - 210px)", minHeight: "600px" }}>
        
        {/* Left Pane: Pre-Change Document */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "var(--x52-card-secondary)",
              borderBottom: "1px solid var(--x52-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Tag minimal intent={Intent.DANGER} round style={{ fontWeight: 800 }}>
                ORIGINAL (PRE-CHANGE)
              </Tag>
              <span style={{ fontSize: "12px", fontWeight: 700 }}>{preDoc.fileName}</span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>{preDoc.version}</span>
          </div>

          {/* Document Body */}
          <div
            ref={leftPaneRef}
            onScroll={() => handleScroll("left")}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 28px",
              backgroundColor: isDarkMode ? "#0d1117" : "#ffffff",
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top left",
              transition: "transform 0.1s ease",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontFamily: "Georgia, serif" }}>
              {prePage?.lines.map((line) => {
                const diff = diffItems.find((d) => d.id === line.diffId);
                const isSelected = selectedDiffId === line.diffId;
                return (
                  <div
                    key={line.lineNumber}
                    onClick={() => line.diffId && onSelectDiff(line.diffId)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      backgroundColor: isSelected
                        ? "rgba(239, 68, 68, 0.2)"
                        : diff
                        ? "rgba(239, 68, 68, 0.08)"
                        : undefined,
                      borderLeft: diff ? "3px solid #ef4444" : "3px solid transparent",
                      cursor: diff ? "pointer" : "default",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "var(--x52-text-muted)", fontFamily: "monospace", width: "24px", flexShrink: 0, marginTop: "2px" }}>
                      {line.lineNumber}
                    </span>
                    <div style={{ flex: 1, fontSize: "13px", lineHeight: "1.6" }}>
                      {diff && (
                        <div style={{ marginBottom: "4px" }}>
                          <Tag intent={Intent.DANGER} minimal round style={{ fontWeight: 800, fontSize: "9px" }}>
                            MODIFIED / DELETED
                          </Tag>
                        </div>
                      )}
                      <span style={{ textDecoration: diff ? "line-through" : undefined, opacity: diff ? 0.8 : 1 }}>
                        {line.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Right Pane: Post-Change Document */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "var(--x52-card-secondary)",
              borderBottom: "1px solid var(--x52-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Tag minimal intent={Intent.SUCCESS} round style={{ fontWeight: 800 }}>
                REVISED (POST-CHANGE)
              </Tag>
              <span style={{ fontSize: "12px", fontWeight: 700 }}>{postDoc.fileName}</span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>{postDoc.version}</span>
          </div>

          {/* Document Body */}
          <div
            ref={rightPaneRef}
            onScroll={() => handleScroll("right")}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 28px",
              backgroundColor: isDarkMode ? "#0d1117" : "#ffffff",
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top left",
              transition: "transform 0.1s ease",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontFamily: "Georgia, serif" }}>
              {postPage?.lines.map((line) => {
                const diff = diffItems.find((d) => d.id === line.diffId);
                const isSelected = selectedDiffId === line.diffId;
                return (
                  <div
                    key={line.lineNumber}
                    onClick={() => line.diffId && onSelectDiff(line.diffId)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      backgroundColor: isSelected
                        ? "rgba(34, 197, 94, 0.2)"
                        : diff
                        ? "rgba(34, 197, 94, 0.08)"
                        : undefined,
                      borderLeft: diff ? "3px solid #22c55e" : "3px solid transparent",
                      cursor: diff ? "pointer" : "default",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "var(--x52-text-muted)", fontFamily: "monospace", width: "24px", flexShrink: 0, marginTop: "2px" }}>
                      {line.lineNumber}
                    </span>
                    <div style={{ flex: 1, fontSize: "13px", lineHeight: "1.6" }}>
                      {diff && (
                        <div style={{ marginBottom: "4px" }}>
                          <Tag intent={Intent.SUCCESS} minimal round style={{ fontWeight: 800, fontSize: "9px" }}>
                            ADDED / REVISED
                          </Tag>
                        </div>
                      )}
                      <span style={{ fontWeight: diff ? 700 : undefined, color: diff ? (isDarkMode ? "#86efac" : "#15803d") : undefined }}>
                        {line.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

const DividerVertical = () => (
  <div style={{ width: "1px", height: "20px", backgroundColor: "var(--x52-border)", margin: "0 6px" }} />
);
