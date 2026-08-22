import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Divider,
  Elevation,
  Slider,
  Tag,
  Tooltip,
  Intent,
} from "@blueprintjs/core";
import type { PDFDiffItem, PDFDocumentSpec, PDFPageContent, DiffSide } from "./pdfDiffTypes";
import "./pdfDiff.css";

interface DualPDFViewerProps {
  preDoc: PDFDocumentSpec;
  postDoc: PDFDocumentSpec;
  diffItems: PDFDiffItem[];
  selectedDiffId: string | null;
  onSelectDiff: (diffId: string) => void;
  isDarkMode?: boolean;
}

const ZOOM_MIN = 75;
const ZOOM_MAX = 150;
const ZOOM_STEP = 25;

interface PageState {
  page: number;
  syncedTo: string | null;
}

export const DualPDFViewer: React.FC<DualPDFViewerProps> = ({
  preDoc,
  postDoc,
  diffItems,
  selectedDiffId,
  onSelectDiff,
  isDarkMode: _isDarkMode = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [syncScroll, setSyncScroll] = useState<boolean>(true);

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  const totalPages = Math.max(preDoc.totalPages, postDoc.totalPages, 1);

  const selectedDiff = useMemo(
    () => diffItems.find((d) => d.id === selectedDiffId) ?? null,
    [diffItems, selectedDiffId],
  );

  const [pageState, setPageState] = useState<PageState>({
    page: 1,
    syncedTo: selectedDiffId,
  });

  const currentPage = useMemo(() => {
    if (selectedDiff && pageState.syncedTo !== selectedDiff.id) {
      return Math.min(Math.max(1, selectedDiff.pageNumber), totalPages);
    }
    return pageState.page;
  }, [selectedDiff, pageState, totalPages]);

  const goToPage = useCallback(
    (nextPage: number) => {
      const clamped = Math.min(Math.max(1, nextPage), totalPages);
      setPageState({ page: clamped, syncedTo: selectedDiffId });
    },
    [totalPages, selectedDiffId],
  );

  const handleScroll = useCallback(
    (source: DiffSide) => {
      if (!syncScroll || isSyncingRef.current) return;
      const srcEl = source === "pre" ? leftPaneRef.current : rightPaneRef.current;
      const tgtEl = source === "pre" ? rightPaneRef.current : leftPaneRef.current;
      if (!srcEl || !tgtEl) return;

      isSyncingRef.current = true;
      tgtEl.scrollTop = srcEl.scrollTop;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    },
    [syncScroll],
  );

  const currentDiffIndex = useMemo(
    () => (selectedDiffId ? diffItems.findIndex((d) => d.id === selectedDiffId) : -1),
    [diffItems, selectedDiffId],
  );

  const stepDiff = useCallback(
    (delta: 1 | -1) => {
      if (diffItems.length === 0) return;
      const len = diffItems.length;
      const nextIdx = currentDiffIndex === -1 ? (delta === 1 ? 0 : len - 1) : (currentDiffIndex + delta + len) % len;
      const target = diffItems[nextIdx];
      onSelectDiff(target.id);
      if (target.pageNumber !== currentPage) {
        setPageState({ page: target.pageNumber, syncedTo: target.id });
      }
    },
    [diffItems, currentDiffIndex, onSelectDiff, currentPage],
  );

  const prePage = preDoc.pages.find((p) => p.pageNumber === currentPage) ?? preDoc.pages[0];
  const postPage = postDoc.pages.find((p) => p.pageNumber === currentPage) ?? postDoc.pages[0];

  const changesOnPage = useMemo(
    () => diffItems.filter((d) => d.pageNumber === currentPage).length,
    [diffItems, currentPage],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-3)", height: "100%" }}>
      {/* Top Controls Toolbar */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "var(--x52-radius)",
          boxShadow: "none",
          padding: "var(--x52-space-2) var(--x52-space-3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--x52-space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
            <span className="x52-label">Page</span>
            <ButtonGroup variant="outlined" size="small">
              <Tooltip content="Previous page" placement="bottom">
                <Button
                  icon="chevron-left"
                  aria-label="Previous page"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                />
              </Tooltip>
              <Tooltip content="Next page" placement="bottom">
                <Button
                  icon="chevron-right"
                  aria-label="Next page"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                />
              </Tooltip>
            </ButtonGroup>
            <span
              className="x52-numeric"
              aria-live="polite"
              style={{ fontSize: "var(--x52-fs-small)", color: "var(--x52-text-muted)" }}
            >
              {currentPage} / {totalPages}
            </span>
          </div>

          <Divider />

          <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
            <span className="x52-label">Delta</span>
            <Tooltip content="Previous difference" placement="bottom">
              <Button
                icon="arrow-up"
                size="small"
                variant="outlined"
                aria-label="Previous difference"
                disabled={diffItems.length === 0}
                onClick={() => stepDiff(-1)}
              />
            </Tooltip>
            <span
              className="x52-numeric"
              style={{ fontSize: "var(--x52-fs-small)", color: "var(--x52-text-muted)" }}
            >
              {currentDiffIndex >= 0 ? currentDiffIndex + 1 : 0} / {diffItems.length}
            </span>
            <Tooltip content="Next difference" placement="bottom">
              <Button
                icon="arrow-down"
                size="small"
                variant="outlined"
                aria-label="Next difference"
                disabled={diffItems.length === 0}
                onClick={() => stepDiff(1)}
              />
            </Tooltip>
            <Tag minimal icon="comparison">
              {changesOnPage} on this page
            </Tag>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-4)" }}>
          <Tooltip
            content={syncScroll ? "Scrolling is locked across both panes" : "Panes scroll independently"}
            placement="bottom"
          >
            <Button
              variant="minimal"
              size="small"
              icon={syncScroll ? "lock" : "unlock"}
              text={syncScroll ? "Scroll locked" : "Scroll free"}
              active={syncScroll}
              aria-pressed={syncScroll}
              onClick={() => setSyncScroll((prev) => !prev)}
            />
          </Tooltip>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-3)" }}>
            <span className="x52-label" id="x52-pdf-zoom-label">
              Zoom
            </span>
            <div style={{ width: "120px" }}>
              <Slider
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                stepSize={ZOOM_STEP}
                labelStepSize={ZOOM_STEP}
                labelRenderer={(val) => `${val}%`}
                value={zoomLevel}
                onChange={setZoomLevel}
                handleHtmlProps={{ "aria-label": "Document zoom level" }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Dual viewport: Side-by-Side Split Panes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--x52-space-3)",
          height: "calc(100vh - 210px)",
          minHeight: "560px",
        }}
      >
        <DocumentPane
          side="pre"
          label="Original (Pre-Change)"
          doc={preDoc}
          page={prePage}
          diffItems={diffItems}
          selectedDiffId={selectedDiffId}
          onSelectDiff={onSelectDiff}
          zoomLevel={zoomLevel}
          paneRef={leftPaneRef}
          onScroll={handleScroll}
        />
        <DocumentPane
          side="post"
          label="Revised (Post-Change)"
          doc={postDoc}
          page={postPage}
          diffItems={diffItems}
          selectedDiffId={selectedDiffId}
          onSelectDiff={onSelectDiff}
          zoomLevel={zoomLevel}
          paneRef={rightPaneRef}
          onScroll={handleScroll}
        />
      </div>
    </div>
  );
};

interface DocumentPaneProps {
  side: DiffSide;
  label: string;
  doc: PDFDocumentSpec;
  page: PDFPageContent | undefined;
  diffItems: PDFDiffItem[];
  selectedDiffId: string | null;
  onSelectDiff: (diffId: string) => void;
  zoomLevel: number;
  paneRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (side: DiffSide) => void;
}

const DocumentPane: React.FC<DocumentPaneProps> = ({
  side,
  label,
  doc,
  page,
  diffItems,
  selectedDiffId,
  onSelectDiff,
  zoomLevel,
  paneRef,
  onScroll,
}) => {
  const isPre = side === "pre";
  const paragraphs = page?.paragraphs || [];

  return (
    <Card
      elevation={Elevation.ZERO}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: "1px solid var(--x52-border-subtle)",
        borderRadius: "var(--x52-radius)",
        boxShadow: "none",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--x52-space-3)",
          padding: "var(--x52-space-2) var(--x52-space-3)",
          backgroundColor: "var(--x52-card-secondary)",
          borderBottom: "1px solid var(--x52-border-subtle)",
          flex: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)", minWidth: 0 }}>
          <Tag minimal intent={isPre ? Intent.DANGER : Intent.SUCCESS} style={{ fontWeight: 800 }}>
            {label}
          </Tag>
          <span
            title={doc.fileName}
            style={{
              fontSize: "var(--x52-fs-small)",
              fontFamily: "var(--x52-font-mono)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {doc.fileName}
          </span>
        </div>
        <Tag minimal className="x52-numeric">
          {doc.version}
        </Tag>
      </header>

      <div
        ref={paneRef}
        onScroll={() => onScroll(side)}
        tabIndex={0}
        role="group"
        aria-label={`${label} document, ${doc.fileName}`}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            fontSize: `calc(13.5px * ${zoomLevel} / 100)`,
            lineHeight: "1.65",
            fontFamily: "Georgia, serif",
          }}
        >
          {paragraphs.length > 0 ? (
            paragraphs.map((para, idx) => {
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
                        ? "rgba(239, 68, 68, 0.22)"
                        : "rgba(34, 197, 94, 0.22)"
                      : hasDiff
                      ? isPre
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(34, 197, 94, 0.1)"
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
                        ? "0 0 18px rgba(239, 68, 68, 0.4)"
                        : "0 0 18px rgba(34, 197, 94, 0.4)"
                      : undefined,
                    cursor: hasDiff ? "pointer" : "default",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* Prominent Visual Tag Marker with Warning Details */}
                  {hasDiff && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        marginBottom: "10px",
                        paddingBottom: "8px",
                        borderBottom: isPre ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(34, 197, 94, 0.25)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <Tag
                          intent={isPre ? Intent.DANGER : Intent.SUCCESS}
                          round
                          style={{ fontWeight: 800, fontSize: "11px", letterSpacing: "0.04em", padding: "4px 8px" }}
                          icon={isPre ? "warning-sign" : "tick-circle"}
                        >
                          {isPre ? "WARNING" : "REVISION"} [{diff.id.toUpperCase()}]: {isPre ? "ORIGINAL CLAUSE" : "REVISED CLAUSE"}
                        </Tag>

                        <Tag minimal intent={isPre ? Intent.DANGER : Intent.SUCCESS} style={{ fontSize: "10px", fontWeight: 700 }}>
                          {diff.category} • {diff.severity} SEVERITY
                        </Tag>
                      </div>

                      {diff.title && (
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: isPre ? "#f87171" : "#4ade80",
                            fontFamily: "var(--x52-font-sans)",
                          }}
                        >
                          {diff.title}
                        </div>
                      )}

                      {diff.description && (
                        <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", lineHeight: 1.4 }}>
                          {diff.description}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Paragraph Text Content */}
                  <div
                    style={{
                      color: hasDiff
                        ? isPre
                          ? isSelected
                            ? "#fca5a5"
                            : "inherit"
                          : isSelected
                          ? "#86efac"
                          : "inherit"
                        : "inherit",
                      lineHeight: 1.7,
                    }}
                  >
                    {para.text}
                  </div>
                </div>
              );
            })
          ) : (
            /* Fallback to lines if document only has raw lines */
            page?.lines?.map((line) => {
              const diff = line.diffId ? diffItems.find((d) => d.id === line.diffId) : undefined;
              const isSelected = diff && selectedDiffId === diff.id;
              return (
                <div
                  key={line.lineNumber}
                  onClick={() => diff && onSelectDiff(diff.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: isSelected
                      ? isPre
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(34, 197, 94, 0.2)"
                      : diff
                      ? isPre
                        ? "rgba(239, 68, 68, 0.08)"
                        : "rgba(34, 197, 94, 0.08)"
                      : undefined,
                    borderLeft: diff
                      ? isPre
                        ? "3px solid #ef4444"
                        : "3px solid #22c55e"
                      : "3px solid transparent",
                    cursor: diff ? "pointer" : "default",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "var(--x52-text-muted)", fontFamily: "monospace", width: "24px" }}>
                    {line.lineNumber}
                  </span>
                  <div style={{ flex: 1 }}>
                    {diff && (
                      <div style={{ marginBottom: "4px" }}>
                        <Tag intent={isPre ? Intent.DANGER : Intent.SUCCESS} minimal round style={{ fontWeight: 800, fontSize: "9px" }}>
                          {isPre ? "MODIFIED" : "REVISED"} [{diff.id.toUpperCase()}]
                        </Tag>
                      </div>
                    )}
                    <span>{line.text}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};
