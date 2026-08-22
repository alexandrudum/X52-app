import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  Callout,
  Divider,
} from "@blueprintjs/core";
import type { PDFDiffProject } from "./pdfDiffTypes";
import { sampleContractDiff } from "./samplePdfDocuments";

interface PDFUploadZoneProps {
  onStartComparison: (project: PDFDiffProject) => void;
  isDarkMode?: boolean;
}

export const PDFUploadZone: React.FC<PDFUploadZoneProps> = ({
  onStartComparison,
  isDarkMode = true,
}) => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSimulatedUpload = (fileSlot: "A" | "B") => {
    // Simulated upload
    const mockFile = new File(["dummy content"], fileSlot === "A" ? "Document_Pre_Change.pdf" : "Document_Post_Change.pdf", { type: "application/pdf" });
    if (fileSlot === "A") setFileA(mockFile);
    else setFileB(mockFile);
  };

  const handleLaunchSample = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onStartComparison(sampleContractDiff);
    }, 700);
  };

  const handleLaunchUploaded = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Build project from uploaded files (using sample layout engine)
      const project: PDFDiffProject = {
        ...sampleContractDiff,
        preDocument: {
          ...sampleContractDiff.preDocument,
          fileName: fileA?.name || "Uploaded_Original.pdf",
        },
        postDocument: {
          ...sampleContractDiff.postDocument,
          fileName: fileB?.name || "Uploaded_Revised.pdf",
        },
      };
      onStartComparison(project);
    }, 900);
  };

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", padding: "10px 0" }}>
      {/* Title & Introduction */}
      <div style={{ textAlign: "center" }}>
        <Tag minimal round intent={Intent.PRIMARY} style={{ fontWeight: 800, fontSize: "11px", marginBottom: "8px" }}>
          X52 DOCUMENT DIFF & COMPLIANCE AUDITOR
        </Tag>
        <h1 style={{ margin: "0 0 10px 0", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em" }}>
          Compare Two PDF Documents Side-by-Side
        </h1>
        <p style={{ color: "var(--x52-text-muted)", fontSize: "14px", maxWidth: "620px", margin: "0 auto", lineHeight: 1.5 }}>
          Upload an original and revised PDF to detect contract clause modifications, pricing escalators, SLA commitments, and high-risk legal deltas.
        </p>
      </div>

      {/* Dual Drag & Drop Zones */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Dropzone A: Pre-Change */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: fileA ? "2px solid #22c55e" : "2px dashed var(--x52-border-subtle)",
            borderRadius: "12px",
            padding: "36px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: isDarkMode ? "#161b22" : "#f1f5f9",
              border: "1px solid var(--x52-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              color: "#388bfd",
            }}
          >
            📄
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "4px" }}>
              Original Document (Pre-Change)
            </div>
            <p style={{ fontSize: "12px", color: "var(--x52-text-muted)", margin: 0 }}>
              {fileA ? fileA.name : "Drag & drop PDF or click to browse"}
            </p>
          </div>

          {fileA ? (
            <Tag intent={Intent.SUCCESS} round minimal style={{ fontWeight: 700 }}>
              ✓ FILE READY (2.4 MB)
            </Tag>
          ) : (
            <Button icon="upload" text="Select Pre-Change PDF" onClick={() => handleSimulatedUpload("A")} />
          )}
        </Card>

        {/* Dropzone B: Post-Change */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: fileB ? "2px solid #22c55e" : "2px dashed var(--x52-border-subtle)",
            borderRadius: "12px",
            padding: "36px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: isDarkMode ? "#161b22" : "#f1f5f9",
              border: "1px solid var(--x52-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              color: "#22c55e",
            }}
          >
            📑
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "4px" }}>
              Revised Document (Post-Change)
            </div>
            <p style={{ fontSize: "12px", color: "var(--x52-text-muted)", margin: 0 }}>
              {fileB ? fileB.name : "Drag & drop PDF or click to browse"}
            </p>
          </div>

          {fileB ? (
            <Tag intent={Intent.SUCCESS} round minimal style={{ fontWeight: 700 }}>
              ✓ FILE READY (2.5 MB)
            </Tag>
          ) : (
            <Button intent="primary" icon="upload" text="Select Post-Change PDF" onClick={() => handleSimulatedUpload("B")} />
          )}
        </Card>
      </div>

      {/* Action CTA */}
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <Button
          intent="primary"
          icon="comparison"
          text={isAnalyzing ? "Analyzing PDF Vector Tokens..." : "Start Visual Diff & Audit"}
          disabled={!fileA || !fileB}
          loading={isAnalyzing}
          large
          onClick={handleLaunchUploaded}
          style={{ padding: "0 28px" }}
        />
      </div>

      <Divider style={{ margin: "8px 0" }} />

      {/* 1-Click Instant Sample Demo */}
      <Callout intent={Intent.PRIMARY} title="⚡ Quick 1-Click Demo Available">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontSize: "13px" }}>
            Don't have 2 PDF files ready? Test the live split-screen diff workspace with our pre-configured enterprise contract pair (5 detected legal/pricing deltas).
          </span>
          <Button
            intent="success"
            icon="play"
            text="Load Sample Contract Diff"
            loading={isAnalyzing}
            onClick={handleLaunchSample}
          />
        </div>
      </Callout>
    </div>
  );
};
