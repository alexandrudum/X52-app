import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Spinner, Tag, Intent } from "@blueprintjs/core";
import type { PDFDiffItem } from "./pdfDiffTypes";

interface RealPDFPageViewProps {
  file: File | null;
  pageNum: number;
  scale: number;
  diffItems: PDFDiffItem[];
  selectedDiffId: string | null;
  onSelectDiff: (diffId: string) => void;
  side: "pre" | "post";
}

export const RealPDFPageView: React.FC<RealPDFPageViewProps> = ({
  file,
  pageNum,
  scale = 1.2,
  diffItems,
  selectedDiffId,
  onSelectDiff,
  side,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const isPre = side === "pre";
  const pageDiffs = diffItems.filter((d) => d.pageNumber === pageNum);

  // Load PDF Document when file changes
  useEffect(() => {
    let isCancelled = false;

    async function loadDocument() {
      if (!file) {
        setPdfDoc(null);
        return;
      }

      setIsLoading(true);
      setRenderError(null);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;

        if (!isCancelled) {
          setPdfDoc(doc);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        console.error("Error loading PDF for canvas:", err);
        if (!isCancelled) {
          setIsLoading(false);
          const msg = err instanceof Error ? err.message : "Failed to load PDF file.";
          setRenderError(msg);
        }
      }
    }

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [file]);

  // Render Page onto Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;
    let currentRenderTask: pdfjsLib.RenderTask | null = null;

    async function renderPage() {
      if (!pdfDoc) return;

      try {
        const clampedPage = Math.min(Math.max(1, pageNum), pdfDoc.numPages);
        const page = await pdfDoc.getPage(clampedPage);

        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        // Support high DPI displays
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const renderContext = {
          canvasContext: context,
          transform: transform,
          viewport: viewport,
        };

        currentRenderTask = page.render(renderContext);
        await currentRenderTask.promise;
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "RenderingCancelledException") {
          console.error("Error rendering PDF canvas page:", err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (currentRenderTask) {
        currentRenderTask.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale]);

  if (renderError) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
        Failed to render PDF: {renderError}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        margin: "0 auto",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
      }}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 10,
            borderRadius: "4px",
            color: "#ffffff",
          }}
        >
          <Spinner size={32} intent={Intent.PRIMARY} />
          <span style={{ marginTop: "8px", fontSize: "12px", fontWeight: 600 }}>
            Rendering Official PDF Page...
          </span>
        </div>
      )}

      {/* Actual PDF Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          borderRadius: "4px",
        }}
      />

      {/* Floating Warning Tags Overlaid on the PDF Page */}
      {pageDiffs.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxWidth: "320px",
            zIndex: 5,
          }}
        >
          {pageDiffs.map((diff) => {
            const isSelected = selectedDiffId === diff.id;
            return (
              <div
                key={diff.id}
                onClick={() => onSelectDiff(diff.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: isSelected
                    ? isPre
                      ? "#ef4444"
                      : "#22c55e"
                    : isPre
                    ? "rgba(239, 68, 68, 0.95)"
                    : "rgba(34, 197, 94, 0.95)",
                  color: "#ffffff",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  border: isSelected ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.3)",
                  transform: isSelected ? "scale(1.03)" : "scale(1)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Tag
                    intent={isPre ? Intent.DANGER : Intent.SUCCESS}
                    round
                    style={{ fontWeight: 800, fontSize: "10px", backgroundColor: "#ffffff", color: isPre ? "#ef4444" : "#16a34a" }}
                  >
                    {isPre ? "WARNING" : "REVISED"} [{diff.id.toUpperCase()}]
                  </Tag>
                  <span style={{ fontSize: "10px", opacity: 0.9 }}>{diff.category}</span>
                </div>
                <div style={{ marginTop: "2px" }}>{diff.title}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
