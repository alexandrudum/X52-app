import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
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
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
  const pagesParagraphs: string[][] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group text items by vertical Y coordinate
    const lineMap = new Map<number, string[]>();
    for (const item of textContent.items) {
      if ("str" in item && item.str.trim().length > 0) {
        const transform = item.transform;
        const y = Math.round(transform[5] / 4) * 4;
        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)!.push(item.str);
      }
    }

    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const rawLines: string[] = [];

    for (const y of sortedY) {
      const lineText = lineMap.get(y)!.join(" ").replace(/\s+/g, " ").trim();
      if (lineText.length > 0) {
        rawLines.push(lineText);
      }
    }

    // Group raw lines into coherent paragraphs / clauses
    const paragraphs = groupLinesIntoParagraphs(rawLines);
    if (paragraphs.length === 0) {
      paragraphs.push(`[Page ${pageNum}: No extractable text found]`);
    }

    pagesParagraphs.push(paragraphs);
  }

  return pagesParagraphs;
}

/**
 * Groups lines into paragraphs by detecting clause numbers (e.g. 1.1, Section),
 * sentence endings (periods, colons), or large spacing.
 */
function groupLinesIntoParagraphs(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let currentPara = "";

  const isNewParagraphStart = (line: string) => {
    // Starts with clause numbers like 1., 1.1, (a), Section, Article, Article I, or ALL CAPS heading
    return (
      /^(\d+(\.\d+)*|[A-Z]\.|\([a-z0-9]\)|Section\s+\d+|Article\s+[IVXLCDM\d]+|IN WITNESS|TABLE OF CONTENTS|EXHIBIT\s+[A-Z])/i.test(line) ||
      (line.length < 50 && line === line.toUpperCase() && /[A-Z]/.test(line))
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!currentPara) {
      currentPara = line;
    } else if (isNewParagraphStart(line)) {
      paragraphs.push(currentPara);
      currentPara = line;
    } else {
      // Continue same paragraph
      currentPara += " " + line;
    }
  }

  if (currentPara) {
    paragraphs.push(currentPara);
  }

  return paragraphs;
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
  if (/(\$|€|£|usd|eur|fee|price|cost|payment|invoice|escalat|rate|annual|quarterly)/i.test(combined)) {
    return {
      category: "FINANCIAL",
      severity: "HIGH",
      intent: Intent.DANGER,
      title: "Financial Terms or Pricing Modification",
      description: `Monetary terms modified in paragraph: "${postText.substring(0, 100)}..."`,
    };
  }

  // SLA & commitments
  if (/(sla|uptime|availability|guarantee|support|response time|maintenance|tier)/i.test(combined)) {
    return {
      category: "SLA_CLAUSE",
      severity: "HIGH",
      intent: Intent.DANGER,
      title: "Service Level Agreement (SLA) Clause Altered",
      description: `Uptime or operational commitments modified: "${postText.substring(0, 100)}..."`,
    };
  }

  // Legal Liability & Indemnity
  if (/(liab|indemn|warrant|damages|breach|court|law|jurisdiction|confidential|remedy)/i.test(combined)) {
    return {
      category: "LEGAL_RISK",
      severity: "HIGH",
      intent: Intent.DANGER,
      title: "Legal Risk & Liability Boundary Change",
      description: `Indemnification or liability limitation modified: "${postText.substring(0, 100)}..."`,
    };
  }

  // Date, Term, Notice period
  if (/(term|notice|day|month|year|date|terminat|renew|expir|period)/i.test(combined)) {
    return {
      category: "DATE_TERMS",
      severity: "MEDIUM",
      intent: Intent.WARNING,
      title: "Term Duration or Notice Period Modified",
      description: `Timeline or termination notice period changed: "${postText.substring(0, 100)}..."`,
    };
  }

  // Technical metric / throughput
  if (/(gb\/s|mb\/s|node|cluster|cpu|ram|quota|bandwidth|limit|byte|storage)/i.test(combined)) {
    return {
      category: "METRIC",
      severity: "MEDIUM",
      intent: Intent.PRIMARY,
      title: "System Metric or Capacity Quota Delta",
      description: `Resource ceiling or specification modified: "${postText.substring(0, 100)}..."`,
    };
  }

  // General clause modification
  return {
    category: "SLA_CLAUSE",
    severity: "MEDIUM",
    intent: Intent.PRIMARY,
    title: "Paragraph Clause Content Revised",
    description: `Paragraph text updated between original and revised versions.`,
  };
}

export async function parseAndDiffPDFs(
  fileA: File,
  fileB: File
): Promise<PDFDiffProject> {
  const [pagesA, pagesB] = await Promise.all([
    extractTextFromPDF(fileA),
    extractTextFromPDF(fileB),
  ]);

  const maxPages = Math.max(pagesA.length, pagesB.length);
  const diffItems: PDFDiffItem[] = [];
  const prePages: PDFPageContent[] = [];
  const postPages: PDFPageContent[] = [];

  let diffCounter = 1;

  for (let p = 0; p < maxPages; p++) {
    const pageNum = p + 1;
    const parasA = pagesA[p] || [];
    const parasB = pagesB[p] || [];

    const prePageContent: PDFPageContent = { pageNumber: pageNum, paragraphs: [] };
    const postPageContent: PDFPageContent = { pageNumber: pageNum, paragraphs: [] };

    const maxParas = Math.max(parasA.length, parasB.length);

    for (let idx = 0; idx < maxParas; idx++) {
      const paraA = parasA[idx] || "";
      const paraB = parasB[idx] || "";

      if (paraA === paraB && paraA.length > 0) {
        // Unchanged paragraph
        const blockId = `p-pre-${pageNum}-${idx}`;
        prePageContent.paragraphs.push({
          id: blockId,
          paragraphIndex: idx + 1,
          text: paraA,
          diffType: "UNCHANGED",
        });
        postPageContent.paragraphs.push({
          id: `p-post-${pageNum}-${idx}`,
          paragraphIndex: idx + 1,
          text: paraB,
          diffType: "UNCHANGED",
        });
      } else if (paraA.length > 0 && paraB.length > 0) {
        // Modified paragraph
        const diffId = `diff-${diffCounter.toString().padStart(2, "0")}`;
        diffCounter++;

        const classification = classifyDifference(paraA, paraB);

        diffItems.push({
          id: diffId,
          pageNumber: pageNum,
          paragraphIndex: idx + 1,
          lineNumber: idx + 1,
          section: `Page ${pageNum} • Paragraph ${idx + 1}`,
          category: classification.category,
          severity: classification.severity,
          intent: classification.intent,
          title: classification.title,
          description: classification.description,
          preText: paraA,
          postText: paraB,
          changeType: "MODIFIED",
        });

        prePageContent.paragraphs.push({
          id: `p-pre-${pageNum}-${idx}`,
          paragraphIndex: idx + 1,
          text: paraA,
          diffId,
          diffType: "MODIFIED",
          severity: classification.severity,
          diffTitle: classification.title,
          category: classification.category,
          preSnippet: paraA,
          postSnippet: paraB,
        });

        postPageContent.paragraphs.push({
          id: `p-post-${pageNum}-${idx}`,
          paragraphIndex: idx + 1,
          text: paraB,
          diffId,
          diffType: "MODIFIED",
          severity: classification.severity,
          diffTitle: classification.title,
          category: classification.category,
          preSnippet: paraA,
          postSnippet: paraB,
        });
      } else if (paraA.length > 0 && paraB.length === 0) {
        // Deleted paragraph from original
        const diffId = `diff-${diffCounter.toString().padStart(2, "0")}`;
        diffCounter++;

        diffItems.push({
          id: diffId,
          pageNumber: pageNum,
          paragraphIndex: idx + 1,
          lineNumber: idx + 1,
          section: `Page ${pageNum} • Paragraph ${idx + 1}`,
          category: "LEGAL_RISK",
          severity: "HIGH",
          intent: Intent.DANGER,
          title: "Paragraph Deleted in Revised Document",
          description: `Paragraph removed: "${paraA.substring(0, 100)}..."`,
          preText: paraA,
          postText: "[Paragraph omitted in revised document]",
          changeType: "DELETED",
        });

        prePageContent.paragraphs.push({
          id: `p-pre-${pageNum}-${idx}`,
          paragraphIndex: idx + 1,
          text: paraA,
          diffId,
          diffType: "DELETED",
          severity: "HIGH",
          diffTitle: "Paragraph Deleted in Revision",
          preSnippet: paraA,
        });
      } else if (paraA.length === 0 && paraB.length > 0) {
        // Newly added paragraph in revised
        const diffId = `diff-${diffCounter.toString().padStart(2, "0")}`;
        diffCounter++;

        diffItems.push({
          id: diffId,
          pageNumber: pageNum,
          paragraphIndex: idx + 1,
          lineNumber: idx + 1,
          section: `Page ${pageNum} • Paragraph ${idx + 1}`,
          category: "SLA_CLAUSE",
          severity: "MEDIUM",
          intent: Intent.SUCCESS,
          title: "New Paragraph Added to Revision",
          description: `New paragraph inserted: "${paraB.substring(0, 100)}..."`,
          preText: "[No corresponding paragraph in original]",
          postText: paraB,
          changeType: "ADDED",
        });

        postPageContent.paragraphs.push({
          id: `p-post-${pageNum}-${idx}`,
          paragraphIndex: idx + 1,
          text: paraB,
          diffId,
          diffType: "ADDED",
          severity: "MEDIUM",
          diffTitle: "New Paragraph Added",
          postSnippet: paraB,
        });
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
