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
} from "@blueprintjs/core";
import type { PDFDiffItem, PDFDocumentSpec, PDFPageContent, DiffSide } from "./pdfDiffTypes";
import { diffLineTone } from "./pdfDiffTypes";
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

/** Page state remembers which selection it was set against, so a new selection
 *  can move the page during render instead of in a setState-inside-effect. */
interface PageState {
  page: number;
  /** The `selectedDiffId` that was current when the page was last set. */
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
  // Guards the echo: assigning scrollTop fires the *other* pane's scroll
  // handler, which would assign back and make the panes fight each other
  // whenever their content heights differ.
  const isSyncingRef = useRef(false);

  const totalPages = Math.max(preDoc.totalPages, postDoc.totalPages, 1);

  const selectedDiff = useMemo(
    () => diffItems.find((d) => d.id === selectedDiffId) ?? null,
    [diffItems, selectedDiffId],
  );

  const [pageState, setPageState] = useState<PageState>(() => {
    const initial = diffItems.find((d) => d.id === selectedDiffId);
    return { page: initial?.pageNumber ?? 1, syncedTo: selectedDiffId };
  });

  // Derived during render: a selection made since the last manual page change
  // wins, so following a warning from the sidebar lands on the right page with
  // no effect and no cascading render.
  const requestedPage =
    pageState.syncedTo === selectedDiffId ? pageState.page : (selectedDiff?.pageNumber ?? pageState.page);
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const goToPage = useCallback(
    (page: number) => {
      setPageState({ page: Math.min(Math.max(page, 1), totalPages), syncedTo: selectedDiffId });
    },
    [selectedDiffId, totalPages],
  );

  const handleScroll = useCallback(
    (source: DiffSide) => {
      if (!syncScroll) return;
      if (isSyncingRef.current) {
        isSyncingRef.current = false;
        return;
      }
      const srcEl = source === "pre" ? leftPaneRef.current : rightPaneRef.current;
      const tgtEl = source === "pre" ? rightPaneRef.current : leftPaneRef.current;
      if (!srcEl || !tgtEl || tgtEl.scrollTop === srcEl.scrollTop) return;
      isSyncingRef.current = true;
      tgtEl.scrollTop = srcEl.scrollTop;
    },
    [syncScroll],
  );

  const currentDiffIndex = diffItems.findIndex((d) => d.id === selectedDiffId);

  const stepDiff = useCallback(
    (delta: number) => {
      if (diffItems.length === 0) return;
      const base = currentDiffIndex >= 0 ? currentDiffIndex : 0;
      const next = (base + delta + diffItems.length) % diffItems.length;
      onSelectDiff(diffItems[next].id);
    },
    [currentDiffIndex, diffItems, onSelectDiff],
  );

  const prePage = preDoc.pages.find((p) => p.pageNumber === currentPage) ?? preDoc.pages[0];
  const postPage = postDoc.pages.find((p) => p.pageNumber === currentPage) ?? postDoc.pages[0];

  const changesOnPage = useMemo(
    () => diffItems.filter((d) => d.pageNumber === currentPage).length,
    [diffItems, currentPage],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--x52-space-3)",
        height: "100%",
      }}
    >
      {/* Viewer toolbar. Flat: a border and a background step, no shadow. */}
      <Card
        compact
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
            <ButtonGroup variant="outlined" size="small" aria-label="Page navigation">
              <Tooltip content="Previous page" placement="bottom-start">
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

      {/* Dual viewport. One grid, two identical panes — the split is the point. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--x52-space-3)",
          height: "calc(100vh - 220px)",
          minHeight: "560px",
        }}
      >
        <DocumentPane
          side="pre"
          label="Original"
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
          label="Revised"
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
}) => (
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
        <span className="x52-label">{label}</span>
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
        padding: "var(--x52-space-3) var(--x52-space-2)",
      }}
    >
      <div
        className="x52-pdf-doc"
        style={
          {
            "--x52-pdf-zoom": `calc(var(--x52-fs-base) * ${zoomLevel} / 100)`,
          } as React.CSSProperties
        }
      >
        {page?.lines.map((line) => {
          const diff = line.diffId ? diffItems.find((d) => d.id === line.diffId) : undefined;
          if (!diff) {
            return (
              <div key={line.lineNumber} className="x52-pdf-line">
                <span className="x52-pdf-line__gutter" aria-hidden="true">
                  <span className="x52-pdf-line__num">{line.lineNumber}</span>
                  <span className="x52-pdf-line__marker" />
                </span>
                <span className="x52-pdf-line__text">{line.text}</span>
              </div>
            );
          }

          const tone = diffLineTone(diff.changeType, side);
          const isSelected = selectedDiffId === diff.id;
          return (
            <button
              key={line.lineNumber}
              type="button"
              className={[
                "x52-pdf-line",
                `x52-pdf-line--${tone.tone}`,
                isSelected ? "x52-pdf-line--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isSelected ? "true" : undefined}
              aria-label={`Line ${line.lineNumber}, ${tone.label}: ${diff.title}`}
              onClick={() => onSelectDiff(diff.id)}
            >
              <span className="x52-pdf-line__gutter" aria-hidden="true">
                <span className="x52-pdf-line__num">{line.lineNumber}</span>
                <span className="x52-pdf-line__marker">{tone.marker}</span>
              </span>
              <span className="x52-pdf-line__text">{line.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  </Card>
);
