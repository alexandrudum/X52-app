import React, { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Spinner, Tag, Intent, Tooltip } from "@blueprintjs/core";
import type { PDFDiffItem } from "./pdfDiffTypes";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
  scale = 1.1,
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
  const selectedDiffOnPage = pageDiffs.find((d) => d.id === selectedDiffId);

  // Create native Blob URL as a 100% reliable fallback
  const objectUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  // Load PDF Document with PDF.js
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
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: "https://unpkg.com/pdfjs-dist@4.10.38/cmaps/",
          cMapPacked: true,
        });
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

  // If PDF.js fails, fallback to native embedded PDF viewer
  if (renderError && objectUrl) {
    return (
      <div style={{ width: "100%", height: "100%", minHeight: "560px" }}>
        <iframe
          src={`${objectUrl}#page=${pageNum}&zoom=${Math.round(scale * 100)}`}
          title={file?.name || "PDF Viewer"}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "560px",
            border: "none",
            borderRadius: "4px",
          }}
        />
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

      {/* Actual High-Fidelity PDF Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          borderRadius: "4px",
        }}
      />

      {/* Sleek Top-Right Summary Pill (Does not block text) */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Tag
          intent={pageDiffs.length > 0 ? (isPre ? Intent.DANGER : Intent.SUCCESS) : Intent.NONE}
          round
          style={{
            fontWeight: 800,
            fontSize: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {pageDiffs.length > 0
            ? `${pageDiffs.length} Change${pageDiffs.length > 1 ? "s" : ""} on Page ${pageNum}`
            : `Page ${pageNum} • No Changes`}
        </Tag>
      </div>

      {/* Sleek Focus Banner: Only displayed when a specific diff on this page is selected */}
      {selectedDiffOnPage && (
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            right: "12px",
            padding: "8px 14px",
            borderRadius: "6px",
            backgroundColor: isPre ? "rgba(239, 68, 68, 0.95)" : "rgba(34, 197, 94, 0.95)",
            color: "#ffffff",
            boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 6,
            fontSize: "11px",
            backdropFilter: "blur(4px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
            <Tag
              round
              style={{
                backgroundColor: "#ffffff",
                color: isPre ? "#ef4444" : "#16a34a",
                fontWeight: 800,
                fontSize: "10px",
              }}
            >
              #{diffItems.findIndex((d) => d.id === selectedDiffOnPage.id) + 1}
            </Tag>
            <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedDiffOnPage.title}
            </strong>
          </div>
          <Tag minimal style={{ fontSize: "9px", backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff" }}>
            {selectedDiffOnPage.category}
          </Tag>
        </div>
      )}

      {/* Compact Right-Margin Indicator Badges */}
      {pageDiffs.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "45px",
            right: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            zIndex: 5,
            maxHeight: "80%",
            overflowY: "auto",
          }}
        >
          {pageDiffs.map((diff) => {
            const isSelected = selectedDiffId === diff.id;
            const diffNum = diffItems.findIndex((d) => d.id === diff.id) + 1;
            return (
              <Tooltip key={diff.id} content={`Diff #${diffNum}: ${diff.title}`} placement="left">
                <button
                  type="button"
                  onClick={() => onSelectDiff(diff.id)}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: isSelected
                      ? isPre
                        ? "#ef4444"
                        : "#22c55e"
                      : isPre
                      ? "rgba(239, 68, 68, 0.75)"
                      : "rgba(34, 197, 94, 0.75)",
                    color: "#ffffff",
                    border: isSelected ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.4)",
                    boxShadow: isSelected ? "0 0 8px rgba(0,0,0,0.5)" : "none",
                    cursor: "pointer",
                    fontSize: "9px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    transform: isSelected ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {diffNum}
                </button>
              </Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
};
