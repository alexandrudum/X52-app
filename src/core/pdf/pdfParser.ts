import * as pdfjsLib from "pdfjs-dist";
import { Intent } from "@blueprintjs/core";
import type {
  PDFDiffProject,
  PDFDocumentSpec,
  PDFPageContent,
  PDFDiffItem,
  DiffCategory,
  DiffSeverity,
} from "./pdfDiffTypes";

// Configure pdfjs worker for Vite browser bundling
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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

export async function extractTextFromPDF(file: File): Promise<string[][]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const pagesLines: string[][] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group text items by roughly same vertical Y coordinate to form coherent lines
    const lineMap = new Map<number, string[]>();
    for (const item of textContent.items) {
      if ("str" in item && item.str.trim().length > 0) {
        // Round Y coordinate to 4px buckets to group items on same line
        const transform = item.transform;
        const y = Math.round(transform[5] / 4) * 4;
        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)!.push(item.str);
      }
    }

    // Sort lines from top of page (higher Y) to bottom of page (lower Y)
    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const pageLines: string[] = [];

    for (const y of sortedY) {
      const lineText = lineMap.get(y)!.join(" ").replace(/\s+/g, " ").trim();
      if (lineText.length > 0) {
        pageLines.push(lineText);
      }
    }

    // Fallback if empty
    if (pageLines.length === 0) {
      pageLines.push(`[Page ${pageNum}: No extractable text or scanned document]`);
    }

    pagesLines.push(pageLines);
  }

  return pagesLines;
}

function classifyDifference(preText: string, postText: string): {
  category: DiffCategory;
  severity: DiffSeverity;
  intent: Intent;
  title: string;
  description: string;
} {
  const combined = `${preText} ${postText}`.toLowerCase();

  // Financial deltas
  if (/(\$|€|£|usd|eur|fee|price|cost|payment|invoice|escalat|rate)/i.test(combined)) {
    return {
      category: "FINANCIAL",
      severity: "HIGH",
      intent: Intent.DANGER,
      title: "Financial Terms or Pricing Modification",
      description: `Monetary clause altered between documents: "${postText.substring(0, 80)}..."`,
    };
  }

  // SLA & commitments
  if (/(sla|uptime|availability|guarantee|support|response time|maintenance)/i.test(combined)) {
    return {
      category: "SLA_CLAUSE",
      severity: "HIGH",
      intent: Intent.DANGER,
      title: "Service Level Agreement (SLA) Clause Altered",
      description: `Operational commitment or uptime threshold updated: "${postText.substring(0, 80)}..."`,
    };
  }

  // Legal Liability & Indemnity
  if (/(liab|indemn|warrant|damages|breach|court|law|jurisdiction|confidential)/i.test(combined)) {
    return {
      category: "LEGAL_RISK",
      severity: "HIGH",
      intent: Intent.DANGER,
      title: "Legal Risk & Liability Limit Change",
      description: `Indemnification or liability boundary modified: "${postText.substring(0, 80)}..."`,
    };
  }

  // Date, Term, Notice period
  if (/(term|notice|day|month|year|date|terminat|renew|expir)/i.test(combined)) {
    return {
      category: "DATE_TERMS",
      severity: "MEDIUM",
      intent: Intent.WARNING,
      title: "Term Duration or Notice Period Modified",
      description: `Timeline, expiration or notice period updated: "${postText.substring(0, 80)}..."`,
    };
  }

  // Technical metric / throughput
  if (/(gb\/s|mb\/s|node|cluster|cpu|ram|quota|bandwidth|limit|byte)/i.test(combined)) {
    return {
      category: "METRIC",
      severity: "MEDIUM",
      intent: Intent.PRIMARY,
      title: "System Metric or Throughput Quota Delta",
      description: `Technical resource ceiling or specification modified: "${postText.substring(0, 80)}..."`,
    };
  }

  // General clause modification
  return {
    category: "SLA_CLAUSE",
    severity: "MEDIUM",
    intent: Intent.PRIMARY,
    title: "Document Clause Text Modification",
    description: `Content revised from "${preText.substring(0, 40)}..." to "${postText.substring(0, 40)}..."`,
  };
}

export async function parseAndDiffPDFs(
  fileA: File,
  fileB: File
): Promise<PDFDiffProject> {
  const [pagesLinesA, pagesLinesB] = await Promise.all([
    extractTextFromPDF(fileA),
    extractTextFromPDF(fileB),
  ]);

  const maxPages = Math.max(pagesLinesA.length, pagesLinesB.length);
  const diffItems: PDFDiffItem[] = [];
  const prePages: PDFPageContent[] = [];
  const postPages: PDFPageContent[] = [];

  let diffCounter = 1;

  for (let p = 0; p < maxPages; p++) {
    const pageNum = p + 1;
    const linesA = pagesLinesA[p] || [];
    const linesB = pagesLinesB[p] || [];

    const prePageContent: PDFPageContent = { pageNumber: pageNum, lines: [] };
    const postPageContent: PDFPageContent = { pageNumber: pageNum, lines: [] };

    const maxLines = Math.max(linesA.length, linesB.length);

    for (let l = 0; l < maxLines; l++) {
      const lineNum = l + 1;
      const textA = linesA[l] || "";
      const textB = linesB[l] || "";

      if (textA === textB && textA.length > 0) {
        // Identical unchanged line
        prePageContent.lines.push({ lineNumber: lineNum, text: textA });
        postPageContent.lines.push({ lineNumber: lineNum, text: textB });
      } else if (textA.length > 0 && textB.length > 0) {
        // Modified line
        const diffId = `diff-${diffCounter.toString().padStart(2, "0")}`;
        diffCounter++;

        const classification = classifyDifference(textA, textB);

        diffItems.push({
          id: diffId,
          pageNumber: pageNum,
          lineNumber: lineNum,
          section: `Page ${pageNum} • Line ${lineNum}`,
          category: classification.category,
          severity: classification.severity,
          intent: classification.intent,
          title: classification.title,
          description: classification.description,
          preText: textA,
          postText: textB,
          changeType: "MODIFIED",
        });

        prePageContent.lines.push({ lineNumber: lineNum, text: textA, diffId });
        postPageContent.lines.push({ lineNumber: lineNum, text: textB, diffId });
      } else if (textA.length > 0 && textB.length === 0) {
        // Deleted line from pre
        const diffId = `diff-${diffCounter.toString().padStart(2, "0")}`;
        diffCounter++;

        diffItems.push({
          id: diffId,
          pageNumber: pageNum,
          lineNumber: lineNum,
          section: `Page ${pageNum} • Line ${lineNum}`,
          category: "LEGAL_RISK",
          severity: "HIGH",
          intent: Intent.DANGER,
          title: "Clause Removed in Revised Version",
          description: `Line deleted: "${textA.substring(0, 80)}..."`,
          preText: textA,
          postText: "[Line deleted in revised document]",
          changeType: "DELETED",
        });

        prePageContent.lines.push({ lineNumber: lineNum, text: textA, diffId });
      } else if (textA.length === 0 && textB.length > 0) {
        // Added line to post
        const diffId = `diff-${diffCounter.toString().padStart(2, "0")}`;
        diffCounter++;

        diffItems.push({
          id: diffId,
          pageNumber: pageNum,
          lineNumber: lineNum,
          section: `Page ${pageNum} • Line ${lineNum}`,
          category: "SLA_CLAUSE",
          severity: "MEDIUM",
          intent: Intent.SUCCESS,
          title: "New Clause Inserted into Revised Version",
          description: `Line added: "${textB.substring(0, 80)}..."`,
          preText: "[No corresponding line in original document]",
          postText: textB,
          changeType: "ADDED",
        });

        postPageContent.lines.push({ lineNumber: lineNum, text: textB, diffId });
      }
    }

    prePages.push(prePageContent);
    postPages.push(postPageContent);
  }

  const preDoc: PDFDocumentSpec = {
    fileName: fileA.name,
    fileSize: formatBytes(fileA.size),
    version: "Original (Pre-Change)",
    uploadedAt: new Date().toLocaleDateString(),
    totalPages: prePages.length,
    pages: prePages,
  };

  const postDoc: PDFDocumentSpec = {
    fileName: fileB.name,
    fileSize: formatBytes(fileB.size),
    version: "Revised (Post-Change)",
    uploadedAt: new Date().toLocaleDateString(),
    totalPages: postPages.length,
    pages: postPages,
  };

  return {
    title: `${fileA.name.replace(/\.pdf$/i, "")} vs ${fileB.name.replace(/\.pdf$/i, "")}`,
    preDocument: preDoc,
    postDocument: postDoc,
    diffItems,
  };
}
