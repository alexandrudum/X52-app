import { Intent } from "@blueprintjs/core";

export type DiffCategory = "FINANCIAL" | "LEGAL_RISK" | "SLA_CLAUSE" | "DATE_TERMS" | "METRIC";
export type DiffSeverity = "HIGH" | "MEDIUM" | "LOW";
export type DiffChangeType = "MODIFIED" | "ADDED" | "DELETED";

export type DiffSide = "pre" | "post";

export function severityIntent(severity: DiffSeverity): Intent {
  switch (severity) {
    case "HIGH":
      return Intent.DANGER;
    case "MEDIUM":
      return Intent.WARNING;
    case "LOW":
      return Intent.PRIMARY;
  }
}

export interface PDFDiffItem {
  id: string;
  pageNumber: number;
  paragraphIndex: number;
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

export interface PDFParagraphBlock {
  id: string;
  paragraphIndex: number;
  text: string;
  diffId?: string;
  diffType?: "MODIFIED" | "ADDED" | "DELETED" | "UNCHANGED";
  severity?: DiffSeverity;
  diffTitle?: string;
  category?: DiffCategory;
  preSnippet?: string;
  postSnippet?: string;
}

export interface PDFPageContent {
  pageNumber: number;
  paragraphs: PDFParagraphBlock[];
  lines?: {
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
