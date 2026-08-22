import { Intent } from "@blueprintjs/core";

export type DiffCategory = "FINANCIAL" | "LEGAL_RISK" | "SLA_CLAUSE" | "DATE_TERMS" | "METRIC";
export type DiffSeverity = "HIGH" | "MEDIUM" | "LOW";
export type DiffChangeType = "MODIFIED" | "ADDED" | "DELETED";

/** Which of the two panes a rendered line belongs to. */
export type DiffSide = "pre" | "post";

export interface PDFDiffItem {
  id: string;
  pageNumber: number;
  lineNumber: number;
  section: string;
  category: DiffCategory;
  severity: DiffSeverity;
  intent: Intent;
  title: string;
  description: string;
  preText: string;
  postText: string;
  changeType: DiffChangeType;
}

export interface PDFPageContent {
  pageNumber: number;
  lines: {
    lineNumber: number;
    text: string;
    diffId?: string;
  }[];
}

export interface PDFDocumentSpec {
  fileName: string;
  fileSize: string;
  version: string;
  uploadedAt: string;
  totalPages: number;
  pages: PDFPageContent[];
}

export interface PDFDiffProject {
  title: string;
  preDocument: PDFDocumentSpec;
  postDocument: PDFDocumentSpec;
  diffItems: PDFDiffItem[];
}

/**
 * Severity is the only thing that earns colour in this app's chrome: HIGH is a
 * blocking finding, MEDIUM needs review, LOW is informational. Kept in one
 * place so the sidebar, the tags, and the sample data cannot drift apart.
 */
export function severityIntent(severity: DiffSeverity): Intent {
  switch (severity) {
    case "HIGH":
      return Intent.DANGER;
    case "MEDIUM":
      return Intent.WARNING;
    default:
      return Intent.NONE;
  }
}

/**
 * The visual grammar of a diff line. Colour alone never carries the meaning —
 * `marker` is the +/-/~ gutter glyph that survives greyscale printing and
 * colour-blindness, and `label` is the accessible name for the line button.
 */
export interface DiffLineTone {
  /** Tone class suffix consumed by `pdfDiff.css`. */
  tone: "added" | "removed";
  marker: "+" | "-" | "~";
  label: string;
}

/**
 * Maps a change to how it renders on a given side. A MODIFIED clause shows as
 * removed text on the original pane and added text on the revised pane (the
 * familiar two-column diff reading), with `~` marking it as a replacement
 * rather than a one-sided insertion or deletion.
 */
export function diffLineTone(changeType: DiffChangeType, side: DiffSide): DiffLineTone {
  if (changeType === "MODIFIED") {
    return side === "pre"
      ? { tone: "removed", marker: "~", label: "replaced" }
      : { tone: "added", marker: "~", label: "replacement" };
  }
  if (changeType === "ADDED") {
    return { tone: "added", marker: "+", label: "added" };
  }
  return { tone: "removed", marker: "-", label: "deleted" };
}
