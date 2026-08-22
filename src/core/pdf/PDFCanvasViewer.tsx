import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  Card,
  Elevation,
  Button,
  ButtonGroup,
  Tag,
  Intent,
  Slider,
  Spinner,
} from "@blueprintjs/core";
import type { PDFDiffItem } from "./pdfDiffTypes";

interface PDFCanvasViewerProps {
  file: File | null;
  sampleName?: string;
  diffItems: PDFDiffItem[];
  selectedDiffId: string | null;
  onSelectDiff: (diffId: string) => void;
  isDarkMode?: boolean;
  side?: "pre" | "post";
}

export const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({
  file,
  sampleName = "Original Document",
  diffItems,
  selectedDiffId,
  onSelectDiff,
  isDarkMode = true,
  side = "pre",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Load PDF document from File
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!file) return;
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading PDF canvas:", err);
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [file]);

  // Render Page on Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    async function renderPage() {
      if (!pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "RenderingCancelledException") {
          console.error("Error rendering PDF page:", err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale]);

  const isPre = side === "pre";
  const pageDiffs = diffItems.filter((d) => d.pageNumber === currentPage);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Tag intent={isPre ? Intent.DANGER : Intent.SUCCESS} round style={{ fontWeight: 800 }}>
            {isPre ? "ORIGINAL PDF CANVAS" : "REVISED PDF CANVAS"}
          </Tag>
          <span style={{ fontSize: "13px", fontWeight: 700 }}>
            {file ? file.name : sampleName}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Page Navigation */}
          <ButtonGroup>
            <Button
              icon="chevron-left"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            />
            <Button minimal text={`Page ${currentPage} of ${totalPages}`} />
            <Button
              icon="chevron-right"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            />
          </ButtonGroup>

          {/* Zoom Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "160px" }}>
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>ZOOM:</span>
            <div style={{ flex: 1 }}>
              <Slider
                min={0.8}
                max={2.0}
                stepSize={0.2}
                labelRenderer={(val) => `${Math.round(val * 100)}%`}
                value={scale}
                onChange={setScale}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Canvas Viewport with Overlaid Visual Tags */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: isDarkMode ? "#0d1117" : "#64748b",
          padding: "24px",
          borderRadius: "10px",
          overflow: "auto",
          maxHeight: "calc(100vh - 220px)",
          position: "relative",
        }}
      >
        {isLoading && (
          <div style={{ padding: "60px", textAlign: "center", color: "#ffffff" }}>
            <Spinner size={36} intent={Intent.PRIMARY} />
            <p style={{ marginTop: "12px" }}>Rendering high-fidelity PDF canvas...</p>
          </div>
        )}

        {/* If no raw file uploaded yet, show interactive canvas preview with tags */}
        {!file && !isLoading && (
          <div
            style={{
              width: "100%",
              maxWidth: "840px",
              backgroundColor: isDarkMode ? "#161b22" : "#ffffff",
              padding: "36px 44px",
              borderRadius: "8px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
              color: isDarkMode ? "#f0f6fc" : "#0f172a",
              fontFamily: "Georgia, serif",
              lineHeight: 1.7,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div style={{ textAlign: "center", borderBottom: "1px solid var(--x52-border)", paddingBottom: "16px" }}>
              <Tag minimal intent={isPre ? Intent.DANGER : Intent.SUCCESS} style={{ fontWeight: 800, marginBottom: "6px" }}>
                {isPre ? "ORIGINAL CONTRACT REVISION" : "REVISED CONTRACT REVISION"}
              </Tag>
              <h2 style={{ margin: 0, fontSize: "20px" }}>X52 MASTER SERVICE AGREEMENT (MSA)</h2>
              <span style={{ fontSize: "11px", opacity: 0.7 }}>Original Document • Page {currentPage} of 2</span>
            </div>

            {pageDiffs.map((diff) => {
              const isSelected = selectedDiffId === diff.id;
              return (
                <div
                  key={diff.id}
                  onClick={() => onSelectDiff(diff.id)}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "8px",
                    backgroundColor: isSelected
                      ? isPre
                        ? "rgba(239, 68, 68, 0.22)"
                        : "rgba(34, 197, 94, 0.22)"
                      : isPre
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(34, 197, 94, 0.1)",
                    border: isSelected
                      ? isPre
                        ? "2px solid #ef4444"
                        : "2px solid #22c55e"
                      : isPre
                      ? "1px solid rgba(239, 68, 68, 0.4)"
                      : "1px solid rgba(34, 197, 94, 0.4)",
                    boxShadow: isSelected
                      ? isPre
                        ? "0 0 16px rgba(239, 68, 68, 0.4)"
                        : "0 0 16px rgba(34, 197, 94, 0.4)"
                      : undefined,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {/* Floating Tag Marker on Original PDF */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <Tag
                      intent={isPre ? Intent.DANGER : Intent.SUCCESS}
                      round
                      icon={isPre ? "warning-sign" : "tick-circle"}
                      style={{ fontWeight: 800, fontSize: "11px" }}
                    >
                      {isPre ? "ORIGINAL CLAUSE TAG" : "REVISED CLAUSE TAG"} [{diff.id.toUpperCase()}]
                    </Tag>
                    <Tag minimal style={{ fontSize: "10px" }}>{diff.category}</Tag>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px", color: isPre ? "#f87171" : "#4ade80" }}>
                    {diff.title}
                  </div>

                  <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6 }}>
                    "{isPre ? diff.preText : diff.postText}"
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Real PDF Canvas Renderer */}
        {file && !isLoading && (
          <div style={{ position: "relative" }}>
            <canvas
              ref={canvasRef}
              style={{
                borderRadius: "6px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
              }}
            />

            {/* Overlaid Tags and Annotation Banners */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxWidth: "280px",
              }}
            >
              {pageDiffs.map((diff) => (
                <Tag
                  key={diff.id}
                  interactive
                  intent={isPre ? Intent.DANGER : Intent.SUCCESS}
                  icon={isPre ? "warning-sign" : "tick-circle"}
                  round
                  onClick={() => onSelectDiff(diff.id)}
                  style={{
                    padding: "6px 10px",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                  }}
                >
                  [{diff.id.toUpperCase()}] {diff.title}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
