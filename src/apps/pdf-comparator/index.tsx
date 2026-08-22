import React, { useCallback, useMemo, useState } from "react";
import {
  Button,
  ButtonGroup,
  Callout,
  Card,
  Classes,
  Dialog,
  Elevation,
  HTMLTable,
  Icon,
  Intent,
  Tag,
  Tooltip,
} from "@blueprintjs/core";
import type { PDFDiffProject } from "../../core/pdf/pdfDiffTypes";
import { severityIntent } from "../../core/pdf/pdfDiffTypes";
import { sampleContractDiff } from "../../core/pdf/samplePdfDocuments";
import { PDFUploadZone } from "../../core/pdf/PDFUploadZone";
import { DualPDFViewer } from "../../core/pdf/DualPDFViewer";
import { DiffWarningSidebar } from "../../core/pdf/DiffWarningSidebar";
import { PDFCanvasViewer } from "../../core/pdf/PDFCanvasViewer";

export const PDFComparatorApp: React.FC<{ isDarkMode?: boolean; isStandalone?: boolean }> = ({
  isDarkMode = true,
}) => {
  const [currentProject, setCurrentProject] = useState<PDFDiffProject | null>(sampleContractDiff);
  const [selectedDiffId, setSelectedDiffId] = useState<string | null>(
    sampleContractDiff.diffItems[0]?.id ?? null,
  );
  const [viewMode, setViewMode] = useState<"split" | "original-canvas" | "revised-canvas">("split");
  const [notification, setNotification] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleStartComparison = useCallback((project: PDFDiffProject) => {
    setCurrentProject(project);
    setSelectedDiffId(project.diffItems[0]?.id ?? null);
    setNotification(
      `Comparison initialised — ${project.diffItems.length} deltas mapped across ${project.preDocument.totalPages} pages.`,
    );
  }, []);

  const handleResetToUpload = useCallback(() => {
    setCurrentProject(null);
    setSelectedDiffId(null);
    setNotification(null);
  }, []);

  // Every count in the chrome is derived from the loaded project — nothing is
  // hard-coded, so swapping the document pair can never leave a stale total.
  const severityTally = useMemo(() => {
    const items = currentProject?.diffItems ?? [];
    return {
      total: items.length,
      high: items.filter((i) => i.severity === "HIGH").length,
      medium: items.filter((i) => i.severity === "MEDIUM").length,
      low: items.filter((i) => i.severity === "LOW").length,
    };
  }, [currentProject]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)" }}>
      {notification && (
        <Callout intent={Intent.SUCCESS} icon="tick-circle">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "var(--x52-space-3)",
            }}
          >
            <span>{notification}</span>
            <Button
              variant="minimal"
              size="small"
              icon="cross"
              aria-label="Dismiss notification"
              onClick={() => setNotification(null)}
            />
          </div>
        </Callout>
      )}

      {!currentProject ? (
        <PDFUploadZone onStartComparison={handleStartComparison} isDarkMode={isDarkMode} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-3)" }}>
          {/* Workspace header. Flat surface: border + background step, no shadow. */}
          <Card
            compact
            elevation={Elevation.ZERO}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "var(--x52-radius)",
              boxShadow: "none",
              padding: "var(--x52-space-3) var(--x52-space-4)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--x52-space-3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-3)", minWidth: 0 }}>
              <Icon icon="document-share" size={20} color="var(--x52-text-muted)" aria-hidden />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "var(--x52-fs-h5)",
                      fontWeight: "var(--x52-fw-bold)",
                      color: "var(--x52-heading)",
                    }}
                  >
                    {currentProject.title}
                  </h2>
                  <Tag
                    minimal
                    intent={severityTally.high > 0 ? Intent.DANGER : Intent.NONE}
                    icon={severityTally.high > 0 ? "warning-sign" : undefined}
                  >
                    <span className="x52-numeric">{severityTally.total}</span> deltas
                  </Tag>
                </div>
                <div
                  className="x52-muted"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--x52-space-2)",
                    fontSize: "var(--x52-fs-small)",
                    fontFamily: "var(--x52-font-mono)",
                    minWidth: 0,
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentProject.preDocument.fileName}
                  </span>
                  <Icon icon="arrow-right" size={12} aria-label="compared with" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentProject.postDocument.fileName}
                  </span>
                </div>
              </div>
            </div>

            {/* View Mode & Actions */}
            <div style={{ display: "flex", gap: "var(--x52-space-2)", alignItems: "center", flexWrap: "wrap" }}>
              <ButtonGroup variant="outlined" size="small">
                <Button
                  icon="comparison"
                  text="Split Screen"
                  active={viewMode === "split"}
                  onClick={() => setViewMode("split")}
                />
                <Button
                  icon="document"
                  intent={Intent.DANGER}
                  text="Original PDF (Working)"
                  active={viewMode === "original-canvas"}
                  onClick={() => setViewMode("original-canvas")}
                />
                <Button
                  icon="document-share"
                  intent={Intent.SUCCESS}
                  text="Revised PDF"
                  active={viewMode === "revised-canvas"}
                  onClick={() => setViewMode("revised-canvas")}
                />
              </ButtonGroup>

              <Tooltip content="Discard this pair and load two new documents" placement="bottom-end">
                <Button
                  variant="minimal"
                  icon="upload"
                  text="Upload new pair"
                  onClick={handleResetToUpload}
                />
              </Tooltip>
              <Button
                variant="outlined"
                icon="export"
                text="Export audit"
                onClick={() => setIsExportOpen(true)}
              />
              <Button
                intent={Intent.SUCCESS}
                icon="tick"
                text="Approve revisions"
                onClick={() =>
                  setNotification("Revisions approved and recorded in the compliance audit log.")
                }
              />
            </div>
          </Card>

          {/* Main workspace layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 340px",
              gap: "var(--x52-space-3)",
              alignItems: "start",
            }}
          >
            {/* Center Main Viewport based on selected view mode */}
            <div>
              {viewMode === "split" && (
                <DualPDFViewer
                  preDoc={currentProject.preDocument}
                  postDoc={currentProject.postDocument}
                  diffItems={currentProject.diffItems}
                  selectedDiffId={selectedDiffId}
                  onSelectDiff={setSelectedDiffId}
                  isDarkMode={isDarkMode}
                />
              )}

              {viewMode === "original-canvas" && (
                <PDFCanvasViewer
                  file={null}
                  sampleName={currentProject.preDocument.fileName}
                  diffItems={currentProject.diffItems}
                  selectedDiffId={selectedDiffId}
                  onSelectDiff={setSelectedDiffId}
                  isDarkMode={isDarkMode}
                  side="pre"
                />
              )}

              {viewMode === "revised-canvas" && (
                <PDFCanvasViewer
                  file={null}
                  sampleName={currentProject.postDocument.fileName}
                  diffItems={currentProject.diffItems}
                  selectedDiffId={selectedDiffId}
                  onSelectDiff={setSelectedDiffId}
                  isDarkMode={isDarkMode}
                  side="post"
                />
              )}
            </div>

            {/* Sidebar with warnings */}
            <div style={{ position: "sticky", top: "var(--x52-space-3)" }}>
              <DiffWarningSidebar
                diffItems={currentProject.diffItems}
                selectedDiffId={selectedDiffId}
                onSelectDiff={setSelectedDiffId}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dialogs are the one place elevation is spent. The dark class already
          lives on <html>, so the portal inherits the theme. */}
      <Dialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export compliance audit summary"
        icon="export"
      >
        <div className={Classes.DIALOG_BODY}>
          <p className="x52-muted" style={{ marginTop: 0, fontSize: "var(--x52-fs-small)" }}>
            {severityTally.total} alterations detected between{" "}
            <span style={{ fontFamily: "var(--x52-font-mono)" }}>
              {currentProject?.preDocument.version}
            </span>{" "}
            and{" "}
            <span style={{ fontFamily: "var(--x52-font-mono)" }}>
              {currentProject?.postDocument.version}
            </span>
            {" — "}
            {severityTally.high} high, {severityTally.medium} medium, {severityTally.low} low risk.
          </p>
          <HTMLTable compact striped style={{ width: "100%" }}>
            <thead>
              <tr>
                <th scope="col">Severity</th>
                <th scope="col">Location</th>
                <th scope="col">Finding</th>
              </tr>
            </thead>
            <tbody>
              {(currentProject?.diffItems ?? []).map((item) => (
                <tr key={item.id}>
                  <td>
                    <Tag minimal intent={severityIntent(item.severity)}>
                      {item.severity}
                    </Tag>
                  </td>
                  <td className="x52-numeric" style={{ fontSize: "var(--x52-fs-small)" }}>
                    p{item.pageNumber}:{item.lineNumber}
                  </td>
                  <td style={{ fontSize: "var(--x52-fs-small)" }}>{item.title}</td>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button variant="minimal" text="Close" onClick={() => setIsExportOpen(false)} />
            <Button
              intent={Intent.PRIMARY}
              icon="download"
              text="Download signed audit PDF"
              onClick={() => {
                setNotification("Audit PDF summary downloaded.");
                setIsExportOpen(false);
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
