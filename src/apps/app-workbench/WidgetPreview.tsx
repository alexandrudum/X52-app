import React from "react";
import {
  Button,
  Callout,
  EntityTitle,
  H6,
  HTMLTable,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { Sparkline } from "../../components/Sparkline";
import { RAGSearchWidget } from "../../core/rag/RAGSearchWidget";
import { CompareMatrixWidget } from "../../core/compare/CompareMatrixWidget";
import { DataCatalogList } from "../../core/listing/DataCatalogList";
import type { WidgetInstance } from "./model";

/** Stable sample series — module scope so it is not re-allocated per render. */
const SPARK_SERIES = [30, 42, 38, 55, 62, 70, 68, 85, 94];

const PIPELINE_ROWS = [
  { id: "PL-X52-091", name: "Telemetry Ingestion" },
  { id: "PL-X52-084", name: "Foundry Sync" },
];

const NODE_COUNT = 16;

interface WidgetPreviewProps {
  widget: WidgetInstance;
  isDarkMode: boolean;
}

/**
 * Renders the live content of a single composed element. Built-in elements
 * render flat (no Card of their own) because the canvas frame — and, once
 * published, the app shell — already supplies the bounded surface.
 */
export const WidgetPreview: React.FC<WidgetPreviewProps> = ({ widget, isDarkMode }) => {
  switch (widget.type) {
    case "rag-search":
      return <RAGSearchWidget isDarkMode={isDarkMode} />;

    case "compare-matrix":
      return <CompareMatrixWidget isDarkMode={isDarkMode} />;

    case "data-catalog":
      return <DataCatalogList isDarkMode={isDarkMode} />;

    case "metric-card":
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "var(--x52-space-4)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div className="x52-label">{widget.title}</div>
            <div
              className="x52-numeric"
              style={{
                fontSize: "var(--x52-fs-h3)",
                fontWeight: "var(--x52-fw-bold)",
                color: "var(--x52-heading)",
                margin: "var(--x52-space-1) 0 var(--x52-space-2)",
              }}
            >
              {widget.value}
            </div>
            {widget.delta && (
              <Tag minimal intent={widget.intent ?? Intent.SUCCESS} icon="trending-up">
                <span className="x52-numeric">{widget.delta}</span>
              </Tag>
            )}
          </div>
          {/* Chart ink is the only place a viz token is allowed; `currentColor`
              keeps the Sparkline's gradient id free of CSS-var syntax. */}
          <span
            aria-hidden="true"
            style={{ color: "var(--x52-viz-cerulean)", flex: "none", lineHeight: 0 }}
          >
            <Sparkline data={SPARK_SERIES} color="currentColor" fill={false} width={120} height={36} />
          </span>
        </div>
      );

    case "action-bar":
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--x52-space-3)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <H6 style={{ margin: 0 }}>{widget.title}</H6>
            {widget.subtitle && (
              <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
                {widget.subtitle}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "var(--x52-space-2)" }}>
            <Button icon="refresh" text="Sync stream" />
            <Button variant="minimal" icon="download" text="Export CSV" />
          </div>
        </div>
      );

    case "pipeline-table":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-2)" }}>
          <H6 style={{ margin: 0 }}>{widget.title}</H6>
          <HTMLTable compact striped style={{ width: "100%" }}>
            <thead>
              <tr>
                <th scope="col">Pipeline</th>
                <th scope="col" style={{ textAlign: "right" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {PIPELINE_ROWS.map((row) => (
                <tr key={row.id}>
                  <th scope="row" style={{ fontWeight: "var(--x52-fw-normal)" }}>
                    <span className="x52-numeric">{row.id}</span>
                    <span className="x52-muted"> · {row.name}</span>
                  </th>
                  <td style={{ textAlign: "right" }}>
                    <Tag minimal intent={Intent.SUCCESS} icon="tick-circle">
                      Online
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        </div>
      );

    case "cluster-grid":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-2)" }}>
          <H6 style={{ margin: 0 }}>{widget.title}</H6>
          <ul
            aria-label={`${NODE_COUNT} compute nodes`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))",
              gap: "var(--x52-space-1)",
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {Array.from({ length: NODE_COUNT }, (_, i) => {
              const label = `N-${(i + 1).toString().padStart(2, "0")}`;
              return (
                <li
                  key={label}
                  className="x52-numeric"
                  style={{
                    padding: "var(--x52-space-1)",
                    textAlign: "center",
                    borderRadius: "var(--x52-radius)",
                    border: "1px solid var(--x52-border-subtle)",
                    backgroundColor: "var(--x52-node-bg)",
                    color: "var(--x52-text)",
                    fontSize: "var(--x52-fs-small)",
                  }}
                >
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
      );

    case "callout":
      return (
        <Callout compact intent={widget.intent ?? Intent.PRIMARY} title={widget.title}>
          {widget.subtitle}
        </Callout>
      );

    case "entity-card":
    default:
      return (
        <EntityTitle
          icon="cube"
          title={widget.title}
          subtitle={widget.subtitle}
          tags={widget.intent ? <Tag minimal intent={widget.intent}>{widget.intent}</Tag> : undefined}
        />
      );
  }
};
