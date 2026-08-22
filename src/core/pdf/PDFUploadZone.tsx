import React, { useCallback, useId, useRef, useState } from "react";
import {
  Button,
  Callout,
  Card,
  Elevation,
  Icon,
  Intent,
  Tag,
} from "@blueprintjs/core";
import type { PDFDiffProject } from "./pdfDiffTypes";
import { sampleContractDiff } from "./samplePdfDocuments";
import { parseAndDiffPDFs } from "./pdfParser";
import "./pdfDiff.css";

interface PDFUploadZoneProps {
  onStartComparison: (project: PDFDiffProject) => void;
  isDarkMode?: boolean;
}

const PDF_ACCEPT = "application/pdf,.pdf";

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

export const PDFUploadZone: React.FC<PDFUploadZoneProps> = ({
  onStartComparison,
  isDarkMode: _isDarkMode = true,
}) => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLaunchSample = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onStartComparison(sampleContractDiff);
    }, 700);
  }, [onStartComparison]);

  const handleLaunchUploaded = useCallback(async () => {
    if (!fileA || !fileB) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // Parse real text lines & calculate visual diff between the two uploaded PDFs
      const project = await parseAndDiffPDFs(fileA, fileB);
      setIsAnalyzing(false);
      onStartComparison(project);
    } catch (err: unknown) {
      console.error("Error parsing uploaded PDF files:", err);
      setIsAnalyzing(false);
      const msg = err instanceof Error ? err.message : "Failed to extract and compare text from uploaded PDF files.";
      setErrorMessage(`Error parsing PDF files: ${msg}`);
    }
  }, [fileA, fileB, onStartComparison]);

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "var(--x52-space-4)",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-1)" }}>
        <span className="x52-label">Document diff &amp; compliance auditor</span>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--x52-fs-h4)",
            fontWeight: "var(--x52-fw-bold)",
            color: "var(--x52-heading)",
          }}
        >
          Compare two PDF revisions
        </h1>
        <p
          className="x52-muted"
          style={{ margin: 0, fontSize: "var(--x52-fs-base)", maxWidth: "68ch" }}
        >
          Select an original and a revised PDF to inspect side-by-side modifications,
          pricing escalators, and SLA deltas.
        </p>
      </header>

      {errorMessage && (
        <Callout intent={Intent.DANGER} icon="error" title="PDF Processing Error">
          {errorMessage}
        </Callout>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--x52-space-4)",
        }}
      >
        <DropSlot
          label="Original"
          caption="Pre-change revision"
          file={fileA}
          onFile={setFileA}
          disabled={isAnalyzing}
        />
        <DropSlot
          label="Revised"
          caption="Post-change revision"
          file={fileB}
          onFile={setFileB}
          disabled={isAnalyzing}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "var(--x52-space-2)",
        }}
      >
        <Button
          variant="minimal"
          icon="reset"
          text="Clear"
          disabled={isAnalyzing || (!fileA && !fileB)}
          onClick={() => {
            setFileA(null);
            setFileB(null);
          }}
        />
        <Button
          intent={Intent.PRIMARY}
          icon="comparison"
          text={isAnalyzing ? "Extracting text layer…" : "Start diff audit"}
          disabled={!fileA || !fileB}
          loading={isAnalyzing}
          onClick={handleLaunchUploaded}
        />
      </div>

      {/* Demo path. Neutral, not a coloured banner — it is a convenience, not
          a status. */}
      <Callout icon="lab-test" title="No files to hand?">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--x52-space-3)",
          }}
        >
          <span style={{ fontSize: "var(--x52-fs-base)", maxWidth: "68ch" }}>
            Open the reference enterprise contract pair — two revisions of the same MSA with{" "}
            <span className="x52-numeric">{sampleContractDiff.diffItems.length}</span> detected
            legal and pricing deltas.
          </span>
          <Button
            icon="play"
            text="Load sample pair"
            loading={isAnalyzing}
            onClick={handleLaunchSample}
          />
        </div>
      </Callout>
    </div>
  );
};

interface DropSlotProps {
  label: string;
  caption: string;
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * A drop target that is also a real, labelled `<input type="file">`: the input
 * stays in the DOM and the accessibility tree, the button drives it, and the
 * drag-over state is a border/background step rather than a lift or a glow.
 */
const DropSlot: React.FC<DropSlotProps> = ({ label, caption, file, onFile, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;
      if (!isPdf(candidate)) {
        setError(`${candidate.name} is not a PDF.`);
        return;
      }
      setError(null);
      onFile(candidate);
    },
    [onFile],
  );

  const className = [
    "x52-pdf-drop",
    isDragOver ? "x52-pdf-drop--over" : "",
    file ? "x52-pdf-drop--ready" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      elevation={Elevation.ZERO}
      className={className}
      style={{
        borderRadius: "var(--x52-radius)",
        boxShadow: "none",
        padding: "var(--x52-space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--x52-space-3)",
      }}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        if (disabled) return;
        accept(event.dataTransfer.files[0]);
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--x52-space-3)" }}>
        <Icon
          icon={file ? "document" : "cloud-upload"}
          size={20}
          color="var(--x52-text-muted)"
          aria-hidden
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <label
            htmlFor={inputId}
            style={{
              display: "block",
              fontSize: "var(--x52-fs-base)",
              fontWeight: "var(--x52-fw-bold)",
              color: "var(--x52-heading)",
            }}
          >
            {label}
          </label>
          <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
            {caption} · drop a PDF here or browse
          </span>
        </div>
        {file && (
          <Tag minimal intent={Intent.SUCCESS} icon="tick">
            Ready
          </Tag>
        )}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        className="x52-pdf-file-input"
        type="file"
        accept={PDF_ACCEPT}
        disabled={disabled}
        aria-label={`${label} PDF — ${caption}`}
        onChange={(event) => {
          accept(event.target.files?.[0]);
          // Allow re-picking the same file after a clear.
          event.target.value = "";
        }}
      />

      {file ? (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)", minWidth: 0 }}>
          <span
            title={file.name}
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: "var(--x52-font-mono)",
              fontSize: "var(--x52-fs-small)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </span>
          <span className="x52-numeric x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
            {formatBytes(file.size)}
          </span>
          <Button
            variant="minimal"
            size="small"
            icon="cross"
            aria-label={`Remove the ${label.toLowerCase()} document`}
            disabled={disabled}
            onClick={() => {
              setError(null);
              onFile(null);
            }}
          />
        </div>
      ) : (
        <Button
          icon="folder-open"
          text="Browse…"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        />
      )}

      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--x52-space-2)",
            color: "var(--x52-intent-danger)",
            fontSize: "var(--x52-fs-small)",
          }}
        >
          <Icon icon="error" size={12} aria-hidden />
          {error}
        </div>
      )}
    </Card>
  );
};
