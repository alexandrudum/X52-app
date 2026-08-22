import type { WidgetInstance } from "./model";

interface GenerateAppCodeOptions {
  appName: string;
  appDescription: string;
  widgets: WidgetInstance[];
}

/** Imports each composite element needs in the exported standalone component. */
const COMPOSITE_IMPORTS: Record<string, string> = {
  "rag-search": `import { RAGSearchWidget } from "./core/rag/RAGSearchWidget";`,
  "compare-matrix": `import { CompareMatrixWidget } from "./core/compare/CompareMatrixWidget";`,
  "data-catalog": `import { DataCatalogList } from "./core/listing/DataCatalogList";`,
};

const COMPOSITE_JSX: Record<string, string> = {
  "rag-search": `      {/* Grounded semantic retrieval with citations */}\n      <RAGSearchWidget />`,
  "compare-matrix": `      {/* Side-by-side attribute diff matrix */}\n      <CompareMatrixWidget />`,
  "data-catalog": `      {/* Faceted catalog listing with sorting */}\n      <DataCatalogList />`,
};

/**
 * Turns an arbitrary app name into a valid TSX component identifier. The old
 * version emitted `export function ()` for a punctuation-only name and
 * `export function 2Things()` for one starting with a digit — neither compiles.
 */
export function toComponentName(appName: string): string {
  const stripped = appName.replace(/[^a-zA-Z0-9]/g, "");
  if (stripped.length === 0) return "GeneratedApp";
  return /^[0-9]/.test(stripped) ? `App${stripped}` : stripped;
}

/**
 * Emits a self-contained React component for the composed app. Styling uses the
 * X52 design tokens so exported code stays on the same grid and palette as the
 * suite it came from.
 */
export function generateAppCode({
  appName,
  appDescription,
  widgets,
}: GenerateAppCodeOptions): string {
  const usesCard = widgets.some((w) => !(w.type in COMPOSITE_JSX));
  const compositeImports = Object.keys(COMPOSITE_IMPORTS)
    .filter((type) => widgets.some((w) => w.type === type))
    .map((type) => COMPOSITE_IMPORTS[type]);

  const imports = [
    `import React from "react";`,
    ...(usesCard ? [`import { Card, H6 } from "@blueprintjs/core";`] : []),
    ...compositeImports,
  ].join("\n");

  const body = widgets
    .map((widget) => {
      const composite = COMPOSITE_JSX[widget.type];
      if (composite) return composite;
      return `      <Card elevation={0}>
        <H6 style={{ margin: 0 }}>${widget.title}</H6>${
          widget.value
            ? `\n        <div className="x52-numeric" style={{ fontSize: "var(--x52-fs-h3)" }}>${widget.value}</div>`
            : ""
        }${
          widget.subtitle
            ? `\n        <p className="x52-muted" style={{ margin: 0 }}>${widget.subtitle}</p>`
            : ""
        }
      </Card>`;
    })
    .join("\n\n");

  return `${imports}

export function ${toComponentName(appName)}() {
  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--x52-space-4)",
        padding: "var(--x52-space-6)",
      }}
    >
      <header>
        <h1 style={{ margin: 0, fontSize: "var(--x52-fs-h4)" }}>${appName}</h1>
        <p className="x52-muted" style={{ margin: 0, fontSize: "var(--x52-fs-small)" }}>
          ${appDescription}
        </p>
      </header>

${body}
    </div>
  );
}
`;
}
