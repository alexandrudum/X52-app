import { Intent } from "@blueprintjs/core";

export type DiffCategory = "FINANCIAL" | "LEGAL_RISK" | "SLA_CLAUSE" | "DATE_TERMS" | "METRIC";
export type DiffSeverity = "HIGH" | "MEDIUM" | "LOW";

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
  changeType: "MODIFIED" | "ADDED" | "DELETED";
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
