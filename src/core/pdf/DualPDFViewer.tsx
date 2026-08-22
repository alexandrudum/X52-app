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
import { RealPDFPageView } from "./RealPDFPageView";
import "./pdfDiff.css";

interface DualPDFViewerProps {
  preDoc: PDFDocumentSpec;
  postDoc: PDFDocumentSpec;
  diffItems: PDFDiffItem[];
  selectedDiffId: string | null;
  onSelectDiff: (diffId: string) => void;
  fileA?: File | null;
  fileB?: File | null;
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
  fileA,
  fileB,
  isDarkMode: _isDarkMode = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [syncScroll, setSyncScroll] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<"real-pdf" | "paragraph-diff">(fileA && fileB ? "real-pdf" : "paragraph-diff");
  const [diffsOnly, setDiffsOnly] = useState<boolean>(false);

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
          {/* Page Switcher */}
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

          {/* Diff Stepper */}
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

        <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-3)" }}>
          {/* Differences Only Filter Button */}
          <Button
            size="small"
            icon="filter-keep"
            intent={diffsOnly ? Intent.PRIMARY : Intent.NONE}
            text={diffsOnly ? "Showing Changes Only" : "Show Changes Only"}
            active={diffsOnly}
            onClick={() => setDiffsOnly(!diffsOnly)}
          />

          {/* Mode Switcher: Real PDF Canvas vs Paragraph Diff */}
          {fileA && fileB && (
            <ButtonGroup variant="outlined" size="small">
              <Button
                icon="document"
                text="Real PDF Canvas"
                active={renderMode === "real-pdf"}
                onClick={() => setRenderMode("real-pdf")}
              />
              <Button
                icon="paragraph"
                text="Text Diff"
                active={renderMode === "paragraph-diff"}
                onClick={() => setRenderMode("paragraph-diff")}
              />
            </ButtonGroup>
          )}

          <Tooltip
            content={syncScroll ? "Scrolling is locked across both panes" : "Panes scroll independently"}
            placement="bottom"
          >
            <Button
              variant="minimal"
              size="small"
              icon={syncScroll ? "lock" : "unlock"}
              text={syncScroll ? "Locked" : "Free"}
              active={syncScroll}
              aria-pressed={syncScroll}
              onClick={() => setSyncScroll((prev) => !prev)}
            />
          </Tooltip>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
            <span className="x52-label">Zoom</span>
            <div style={{ width: "100px" }}>
              <Slider
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                stepSize={ZOOM_STEP}
                labelStepSize={ZOOM_STEP}
                labelRenderer={(val) => `${val}%`}
                value={zoomLevel}
                onChange={setZoomLevel}
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
          file={fileA}
          renderMode={renderMode}
          diffsOnly={diffsOnly}
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
          file={fileB}
          renderMode={renderMode}
          diffsOnly={diffsOnly}
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
  file?: File | null;
  renderMode: "real-pdf" | "paragraph-diff";
  diffsOnly: boolean;
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
  file,
  renderMode,
  diffsOnly,
}) => {
  const isPre = side === "pre";
  const rawParagraphs = page?.paragraphs || [];
  const paragraphs = diffsOnly ? rawParagraphs.filter((p) => !!p.diffId) : rawParagraphs;

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
          padding: renderMode === "real-pdf" && file ? "16px 8px" : "20px 24px",
          backgroundColor: renderMode === "real-pdf" && file ? "#1e293b" : "inherit",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Real PDF Canvas Renderer when actual file is present */}
        {renderMode === "real-pdf" && file ? (
          <RealPDFPageView
            file={file}
            pageNum={page?.pageNumber || 1}
            scale={zoomLevel / 100}
            diffItems={diffItems}
            selectedDiffId={selectedDiffId}
            onSelectDiff={onSelectDiff}
            side={side}
          />
        ) : (
          /* Sleek Paragraph Diff View with Small Tag + Continuous Indicator Line */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              fontSize: `calc(13.5px * ${zoomLevel} / 100)`,
              lineHeight: "1.65",
              fontFamily: "Georgia, serif",
              width: "100%",
            }}
          >
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => {
                const diff = para.diffId ? diffItems.find((d) => d.id === para.diffId) : undefined;
                const isSelected = diff && selectedDiffId === diff.id;
                const hasDiff = !!diff;
                const diffNum = diff ? diffItems.findIndex((d) => d.id === diff.id) + 1 : 0;

                if (!hasDiff) {
                  return (
                    <div
                      key={para.id || idx}
                      style={{
                        padding: "4px 8px",
                        opacity: 0.85,
                      }}
                    >
                      {para.text}
                    </div>
                  );
                }

                return (
                  <div
                    key={para.id || idx}
                    onClick={() => diff && onSelectDiff(diff.id)}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "stretch",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      backgroundColor: isSelected
                        ? isPre
                          ? "rgba(239, 68, 68, 0.16)"
                          : "rgba(34, 197, 94, 0.16)"
                        : isPre
                        ? "rgba(239, 68, 68, 0.05)"
                        : "rgba(34, 197, 94, 0.05)",
                      border: isSelected
                        ? isPre
                          ? "1px solid #ef4444"
                          : "1px solid #22c55e"
                        : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Small Tag Badge + Connected Indicator Line Marking the Changed Part */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flexShrink: 0,
                        width: "80px",
                      }}
                    >
                      <Tag
                        intent={isPre ? Intent.DANGER : Intent.SUCCESS}
                        round
                        style={{
                          fontSize: "9px",
                          fontWeight: 800,
                          padding: "2px 6px",
                          letterSpacing: "0.03em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        #{diffNum} {isPre ? "MODIFIED" : "REVISED"}
                      </Tag>
                      
                      {/* Vertical line indicator starting from the tag down the entire changed part */}
                      <div
                        style={{
                          width: "3px",
                          flex: 1,
                          minHeight: "20px",
                          backgroundColor: isPre ? "#ef4444" : "#22c55e",
                          marginTop: "6px",
                          borderRadius: "2px",
                          opacity: isSelected ? 1 : 0.7,
                        }}
                      />
                    </div>

                    {/* The Changed Text */}
                    <div
                      style={{
                        flex: 1,
                        color: isPre
                          ? isSelected
                            ? "#fca5a5"
                            : "inherit"
                          : isSelected
                          ? "#86efac"
                          : "inherit",
                        borderBottom: isPre
                          ? "1px dashed rgba(239, 68, 68, 0.4)"
                          : "1px dashed rgba(34, 197, 94, 0.4)",
                        paddingBottom: "4px",
                      }}
                    >
                      {para.text}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "30px", color: "var(--x52-text-muted)" }}>
                No differences detected on this page.
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
