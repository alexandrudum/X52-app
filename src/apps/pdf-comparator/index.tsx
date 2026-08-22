import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  Callout,
  Dialog,
  Classes,
} from "@blueprintjs/core";
import type { PDFDiffProject } from "../../core/pdf/pdfDiffTypes";
import { sampleContractDiff } from "../../core/pdf/samplePdfDocuments";
import { PDFUploadZone } from "../../core/pdf/PDFUploadZone";
import { DualPDFViewer } from "../../core/pdf/DualPDFViewer";
import { DiffWarningSidebar } from "../../core/pdf/DiffWarningSidebar";

export const PDFComparatorApp: React.FC<{ isDarkMode?: boolean; isStandalone?: boolean }> = ({
  isDarkMode = true,
}) => {
  const [currentProject, setCurrentProject] = useState<PDFDiffProject | null>(sampleContractDiff);
  const [selectedDiffId, setSelectedDiffId] = useState<string | null>("diff-01");
  const [notification, setNotification] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleStartComparison = (project: PDFDiffProject) => {
    setCurrentProject(project);
    setSelectedDiffId(project.diffItems[0]?.id || null);
    setNotification("PDF comparison initialized. All 5 legal and pricing deltas mapped across pages.");
  };

  const handleResetToUpload = () => {
    setCurrentProject(null);
    setSelectedDiffId(null);
    setNotification(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {notification && (
        <Callout intent={Intent.SUCCESS} icon="tick-circle">
          {notification}
        </Callout>
      )}

      {/* When no project is loaded, show Stage 1 Upload Screen */}
      {!currentProject ? (
        <PDFUploadZone
          onStartComparison={handleStartComparison}
          isDarkMode={isDarkMode}
        />
      ) : (
        /* When project is loaded, show Stage 2 Dual Viewers + Sidebar Workspace */
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Top Control Action Bar */}
          <Card
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "10px",
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: isDarkMode ? "#ef4444" : "#0f172a",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "12px",
                }}
              >
                PDF
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                    {currentProject.title}
                  </h3>
                  <Tag intent={Intent.DANGER} round minimal style={{ fontWeight: 800 }}>
                    5 DELTAS DETECTED
                  </Tag>
                </div>
                <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                  Comparing: <code>{currentProject.preDocument.fileName}</code> ➔ <code>{currentProject.postDocument.fileName}</code>
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Button icon="upload" text="Upload New Pair" onClick={handleResetToUpload} />
              <Button icon="export" text="Export Audit Report" onClick={() => setIsExportOpen(true)} />
              <Button
                intent="success"
                icon="tick"
                text="Approve Revisions"
                onClick={() => setNotification("Revisions approved and recorded in compliance audit log.")}
              />
            </div>
          </Card>

          {/* 2-Column Split: Dual Viewers (Left) & Warning Sidebar (Right) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", alignItems: "start" }}>
            
            {/* Left: Dual PDF Viewport */}
            <div>
              <DualPDFViewer
                preDoc={currentProject.preDocument}
                postDoc={currentProject.postDocument}
                diffItems={currentProject.diffItems}
                selectedDiffId={selectedDiffId}
                onSelectDiff={setSelectedDiffId}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Right: Difference Warning Inspector Sidebar */}
            <div style={{ position: "sticky", top: "20px" }}>
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

      {/* Export Audit Report Dialog */}
      <Dialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Compliance Audit Summary"
        className={isDarkMode ? Classes.DARK : ""}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>Summary of detected contract alterations across 2 document versions:</p>
          <div style={{ padding: "12px", backgroundColor: "var(--x52-card-secondary)", borderRadius: "6px", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
            <div>• Total Deltas: 5 (3 High Risk, 2 Medium Risk)</div>
            <div>• Financial Change: +$25,000 / yr licensing fee increase</div>
            <div>• SLA Modification: Uptime commitment reduced from 99.99% to 99.5%</div>
            <div>• Liability Ceiling: Reduced from 3x to 1x annual fees</div>
            <div>• Termination Notice: Extended from 30 days to 90 days</div>
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => setIsExportOpen(false)}>Close</Button>
            <Button
              intent="primary"
              icon="download"
              text="Download Signed Audit PDF"
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
