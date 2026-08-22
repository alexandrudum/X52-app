import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  InputGroup,
  Callout,
  Dialog,
  Classes,
  Divider,
  HTMLSelect,
} from "@blueprintjs/core";
import { Sparkline } from "../../components/Sparkline";
import { registry, type X52AppManifest } from "../../core/registry";
import { RAGSearchWidget } from "../../core/rag/RAGSearchWidget";
import { CompareMatrixWidget } from "../../core/compare/CompareMatrixWidget";
import { DataCatalogList } from "../../core/listing/DataCatalogList";

interface WidgetInstance {
  id: string;
  type:
    | "metric-card"
    | "pipeline-table"
    | "cluster-grid"
    | "callout"
    | "action-bar"
    | "entity-card"
    | "rag-search"
    | "compare-matrix"
    | "data-catalog";
  title: string;
  subtitle?: string;
  value?: string;
  delta?: string;
  intent?: Intent;
  dataSource?: string;
}

export const AppWorkbench: React.FC<{ isDarkMode: boolean; isStandalone?: boolean }> = ({
  isDarkMode,
}) => {
  const [appName, setAppName] = useState("Semantic_RAG_and_Catalog_Hub");
  const [appDescription] = useState("Custom RAG, compare, sorting, and catalog application built with X52 Core Workbench.");
  const [appCategory, setAppCategory] = useState<X52AppManifest["category"]>("analytics");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>("w-rag");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Canvas Widgets List
  const [widgets, setWidgets] = useState<WidgetInstance[]>([
    {
      id: "w-rag",
      type: "rag-search",
      title: "RAG Semantic Retrieval & Knowledge Synthesis",
      subtitle: "Grounded AI search over vector embeddings with citations",
    },
    {
      id: "w-compare",
      type: "compare-matrix",
      title: "Side-by-Side Specification Comparator",
      subtitle: "Automatic delta highlighting across 2-4 entities",
    },
    {
      id: "w-catalog",
      type: "data-catalog",
      title: "Enterprise Data & Artifact Catalog",
      subtitle: "Multi-attribute sorting, category chips, and batch actions",
    },
  ]);

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId) || null;

  const handleAddWidget = (type: WidgetInstance["type"]) => {
    const newId = `w-${Date.now()}`;
    let newWidget: WidgetInstance;

    switch (type) {
      case "rag-search":
        newWidget = {
          id: newId,
          type: "rag-search",
          title: "Semantic Vector Search & Citations",
          subtitle: "RAG query engine over vector store",
        };
        break;
      case "compare-matrix":
        newWidget = {
          id: newId,
          type: "compare-matrix",
          title: "Entity & Version Diff Matrix",
          subtitle: "Side-by-side attribute comparison",
        };
        break;
      case "data-catalog":
        newWidget = {
          id: newId,
          type: "data-catalog",
          title: "Interactive Data Catalog Listing",
          subtitle: "Faceted sorting & multi-selection",
        };
        break;
      case "metric-card":
        newWidget = {
          id: newId,
          type: "metric-card",
          title: "NEW TELEMETRY METRIC",
          value: "1,420 RPS",
          delta: "+4.1%",
          intent: Intent.SUCCESS,
          dataSource: "Default Stream",
        };
        break;
      case "pipeline-table":
        newWidget = {
          id: newId,
          type: "pipeline-table",
          title: "Stream Pipeline Monitor",
          dataSource: "Pipeline Registry",
        };
        break;
      case "cluster-grid":
        newWidget = {
          id: newId,
          type: "cluster-grid",
          title: "Compute Worker Node Matrix",
          subtitle: "52 Active Nodes",
        };
        break;
      case "action-bar":
        newWidget = {
          id: newId,
          type: "action-bar",
          title: "Operational Actions Bar",
          subtitle: "Command and control triggers",
        };
        break;
      case "callout":
        newWidget = {
          id: newId,
          type: "callout",
          title: "System Notice",
          subtitle: "Records are verified before persistence.",
          intent: Intent.PRIMARY,
        };
        break;
      case "entity-card":
        newWidget = {
          id: newId,
          type: "entity-card",
          title: "Ontology Object 360",
          subtitle: "Palantir Foundry Object Instance",
          intent: Intent.SUCCESS,
        };
        break;
    }

    setWidgets([...widgets, newWidget]);
    setSelectedWidgetId(newId);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
    if (selectedWidgetId === id) setSelectedWidgetId(null);
  };

  const handleUpdateSelected = (patch: Partial<WidgetInstance>) => {
    if (!selectedWidgetId) return;
    setWidgets((prev) =>
      prev.map((w) => (w.id === selectedWidgetId ? { ...w, ...patch } : w))
    );
  };

  const handlePublishApp = () => {
    const appId = appName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const short = appName.substring(0, 3).toUpperCase();

    // Register dynamically into the X52 Suite
    registry.register({
      id: appId,
      name: appName,
      shortName: short,
      description: appDescription,
      version: "1.0.0",
      icon: "application",
      category: appCategory,
      intent: Intent.PRIMARY,
      standaloneRoute: `/?app=${appId}`,
      component: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "10px" }}>
          <div>
            <h2 style={{ margin: 0 }}>{appName}</h2>
            <p style={{ opacity: 0.8, fontSize: "13px" }}>{appDescription}</p>
          </div>
          {widgets.map((w) => {
            if (w.type === "rag-search") return <RAGSearchWidget key={w.id} isDarkMode={isDarkMode} />;
            if (w.type === "compare-matrix") return <CompareMatrixWidget key={w.id} isDarkMode={isDarkMode} />;
            if (w.type === "data-catalog") return <DataCatalogList key={w.id} isDarkMode={isDarkMode} />;
            return (
              <Card key={w.id} elevation={Elevation.ONE}>
                <h4>{w.title}</h4>
                {w.value && <h2 style={{ fontFamily: "var(--font-mono)" }}>{w.value}</h2>}
                {w.subtitle && <p>{w.subtitle}</p>}
              </Card>
            );
          })}
        </div>
      ),
    });

    setNotification(`App "${appName}" successfully published to the X52 App Suite! You can now open it directly from the 9-dots App Hub.`);
  };

  // Generate copyable React TSX code
  const generatedCode = `import React from 'react';
import { Card, Elevation, Tag, Button, Intent } from '@blueprintjs/core';
import { RAGSearchWidget } from './core/rag/RAGSearchWidget';
import { CompareMatrixWidget } from './core/compare/CompareMatrixWidget';
import { DataCatalogList } from './core/listing/DataCatalogList';
import { Sparkline } from './components/Sparkline';

export function ${appName.replace(/[^a-zA-Z0-9]/g, '')}() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
      <div>
        <h2 style={{ margin: 0, fontWeight: 800 }}>${appName}</h2>
        <p style={{ opacity: 0.8, fontSize: '13px' }}>${appDescription}</p>
      </div>

${widgets
  .map((w) => {
    if (w.type === 'rag-search') return `      {/* RAG Semantic Search */}
      <RAGSearchWidget />`;
    if (w.type === 'compare-matrix') return `      {/* Side-by-Side Compare Matrix */}
      <CompareMatrixWidget />`;
    if (w.type === 'data-catalog') return `      {/* Data Catalog with Sorting & Filtering */}
      <DataCatalogList />`;
    return `      <Card elevation={Elevation.ONE}>
        <h4>${w.title}</h4>
        ${w.value ? `<h2 style={{ fontFamily: 'monospace' }}>${w.value}</h2>` : ''}
      </Card>`;
  })
  .join('\n\n')}
    </div>
  );
}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {notification && (
        <Callout intent={Intent.SUCCESS} icon="tick-circle">
          {notification}
        </Callout>
      )}

      {/* Workbench Action Header */}
      <Card
        elevation={Elevation.ONE}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: isDarkMode ? "#a855f7" : "#0f172a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
            }}
          >
            WB
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <InputGroup
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                style={{ fontWeight: 800, fontSize: "16px", width: "280px" }}
                small
              />
              <Tag minimal intent={Intent.PRIMARY} round>X52 APP WORKBENCH</Tag>
            </div>
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
              Visual Application Builder • RAG, Compare, Sorting, & Listing primitives
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            minimal
            icon={viewMode === "edit" ? "eye-open" : "edit"}
            text={viewMode === "edit" ? "Preview App" : "Edit Canvas"}
            onClick={() => setViewMode(viewMode === "edit" ? "preview" : "edit")}
          />
          <Button icon="code" text="Export TSX Code" onClick={() => setIsExportOpen(true)} />
          <Button
            intent="primary"
            icon="cloud-upload"
            text="Publish to Suite"
            onClick={handlePublishApp}
          />
        </div>
      </Card>

      {/* 3-Column Studio Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: viewMode === "edit" ? "250px 1fr 280px" : "1fr", gap: "16px" }}>
        
        {/* Left Column: Core Elements Palette */}
        {viewMode === "edit" && (
          <Card
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "10px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: "13px" }}>Core Elements Library</h4>
            
            <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--x52-text-muted)", marginTop: "4px" }}>
              RAG & ANALYTICS PRIMITIVES
            </div>
            <Button
              alignText="left"
              icon="search-template"
              intent={Intent.PRIMARY}
              text="RAG Search + Citations"
              onClick={() => handleAddWidget("rag-search")}
              fill
            />
            <Button
              alignText="left"
              icon="comparison"
              intent={Intent.SUCCESS}
              text="Side-by-Side Compare"
              onClick={() => handleAddWidget("compare-matrix")}
              fill
            />
            <Button
              alignText="left"
              icon="th-filtered"
              intent={Intent.WARNING}
              text="Data Catalog & Sort Bar"
              onClick={() => handleAddWidget("data-catalog")}
              fill
            />

            <Divider style={{ margin: "6px 0" }} />

            <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--x52-text-muted)" }}>
              TELEMETRY & CONTROLS
            </div>
            <Button
              alignText="left"
              icon="timeline-area-chart"
              text="Metric Card + Sparkline"
              onClick={() => handleAddWidget("metric-card")}
              fill
            />
            <Button
              alignText="left"
              icon="th"
              text="Pipeline Data Table"
              onClick={() => handleAddWidget("pipeline-table")}
              fill
            />
            <Button
              alignText="left"
              icon="grid"
              text="52 Node Matrix"
              onClick={() => handleAddWidget("cluster-grid")}
              fill
            />
            <Button
              alignText="left"
              icon="wrench"
              text="Action Control Bar"
              onClick={() => handleAddWidget("action-bar")}
              fill
            />
            <Button
              alignText="left"
              icon="info-sign"
              text="Callout Banner"
              onClick={() => handleAddWidget("callout")}
              fill
            />
          </Card>
        )}

        {/* Center Column: Live Visual Canvas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {widgets.map((widget) => (
            <div
              key={widget.id}
              onClick={() => viewMode === "edit" && setSelectedWidgetId(widget.id)}
              style={{
                position: "relative",
                border: selectedWidgetId === widget.id && viewMode === "edit"
                  ? "2px solid #388bfd"
                  : "1px solid transparent",
                borderRadius: "12px",
                padding: "4px",
                transition: "all 0.15s ease",
              }}
            >
              {viewMode === "edit" && (
                <div style={{ position: "absolute", top: "14px", right: "14px", zIndex: 10, display: "flex", gap: "6px" }}>
                  <Tag minimal round style={{ fontSize: "10px", fontWeight: 700 }}>{widget.type}</Tag>
                  <Button
                    minimal
                    intent="danger"
                    icon="cross"
                    small
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveWidget(widget.id);
                    }}
                  />
                </div>
              )}

              {/* RAG Search Widget Element */}
              {widget.type === "rag-search" && (
                <RAGSearchWidget isDarkMode={isDarkMode} />
              )}

              {/* Compare Matrix Widget Element */}
              {widget.type === "compare-matrix" && (
                <CompareMatrixWidget isDarkMode={isDarkMode} />
              )}

              {/* Data Catalog with Sorting & Listing */}
              {widget.type === "data-catalog" && (
                <DataCatalogList isDarkMode={isDarkMode} />
              )}

              {/* Metric Card */}
              {widget.type === "metric-card" && (
                <Card elevation={Elevation.ONE} style={{ padding: "20px", borderRadius: "10px", backgroundColor: "var(--x52-card-bg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", marginBottom: "4px" }}>
                        {widget.title}
                      </div>
                      <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
                        {widget.value}
                      </div>
                      <Tag minimal round intent={widget.intent || Intent.SUCCESS} style={{ fontWeight: 700 }}>
                        {widget.delta}
                      </Tag>
                    </div>
                    <Sparkline data={[30, 42, 38, 55, 62, 70, 68, 85, 94]} color="#22c55e" width={120} height={40} />
                  </div>
                </Card>
              )}

              {/* Action Bar */}
              {widget.type === "action-bar" && (
                <Card elevation={Elevation.ONE} style={{ padding: "16px 20px", borderRadius: "10px", backgroundColor: "var(--x52-card-bg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700 }}>{widget.title}</h4>
                      <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>{widget.subtitle}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Button intent="primary" icon="refresh" text="Sync Stream" />
                      <Button icon="download" text="Export CSV" />
                    </div>
                  </div>
                </Card>
              )}

              {/* Pipeline Table */}
              {widget.type === "pipeline-table" && (
                <Card elevation={Elevation.ONE} style={{ padding: "20px", borderRadius: "10px", backgroundColor: "var(--x52-card-bg)" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontWeight: 700 }}>{widget.title}</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {["PL-X52-091 • Telemetry Ingestion", "PL-X52-084 • Foundry Sync"].map((row, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", backgroundColor: isDarkMode ? "#161b22" : "#f8fafc", borderRadius: "6px", fontSize: "13px", fontWeight: 600 }}>
                        <span>{row}</span>
                        <Tag minimal intent={Intent.SUCCESS} round>ONLINE</Tag>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Cluster Grid */}
              {widget.type === "cluster-grid" && (
                <Card elevation={Elevation.ONE} style={{ padding: "20px", borderRadius: "10px", backgroundColor: "var(--x52-card-bg)" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontWeight: 700 }}>{widget.title}</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "6px" }}>
                    {Array.from({ length: 16 }, (_, i) => (
                      <div key={i} style={{ padding: "6px", textAlign: "center", borderRadius: "4px", backgroundColor: isDarkMode ? "#161b22" : "#f8fafc", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                        N-{(i + 1).toString().padStart(2, "0")}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Callout */}
              {widget.type === "callout" && (
                <Callout intent={widget.intent || Intent.PRIMARY} title={widget.title}>
                  {widget.subtitle}
                </Callout>
              )}
            </div>
          ))}
        </div>

        {/* Right Column: Property Inspector */}
        {viewMode === "edit" && (
          <Card
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "10px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: "13px" }}>Component Properties</h4>
            
            {selectedWidget ? (
              <>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)" }}>ELEMENT TITLE</label>
                  <InputGroup
                    value={selectedWidget.title}
                    onChange={(e) => handleUpdateSelected({ title: e.target.value })}
                    small
                  />
                </div>

                {selectedWidget.value !== undefined && (
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)" }}>VALUE / METRIC</label>
                    <InputGroup
                      value={selectedWidget.value}
                      onChange={(e) => handleUpdateSelected({ value: e.target.value })}
                      small
                    />
                  </div>
                )}

                {selectedWidget.delta !== undefined && (
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)" }}>BADGE / DELTA</label>
                    <InputGroup
                      value={selectedWidget.delta}
                      onChange={(e) => handleUpdateSelected({ delta: e.target.value })}
                      small
                    />
                  </div>
                )}

                {selectedWidget.subtitle !== undefined && (
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)" }}>SUBTITLE / DESCRIPTION</label>
                    <InputGroup
                      value={selectedWidget.subtitle}
                      onChange={(e) => handleUpdateSelected({ subtitle: e.target.value })}
                      small
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)" }}>INTENT THEME</label>
                  <HTMLSelect
                    value={selectedWidget.intent || Intent.PRIMARY}
                    onChange={(e) => handleUpdateSelected({ intent: e.target.value as Intent })}
                    fill
                  >
                    <option value={Intent.PRIMARY}>Primary (Blue)</option>
                    <option value={Intent.SUCCESS}>Success (Green)</option>
                    <option value={Intent.WARNING}>Warning (Amber)</option>
                    <option value={Intent.DANGER}>Danger (Red)</option>
                    <option value={Intent.NONE}>Neutral</option>
                  </HTMLSelect>
                </div>

                <Divider />

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)" }}>APP CATEGORY</label>
                  <HTMLSelect
                    value={appCategory}
                    onChange={(e) => setAppCategory(e.target.value as X52AppManifest["category"])}
                    fill
                  >
                    <option value="analytics">Analytics</option>
                    <option value="operations">Operations</option>
                    <option value="engineering">Engineering</option>
                    <option value="governance">Governance</option>
                  </HTMLSelect>
                </div>
              </>
            ) : (
              <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
                Select a component in the canvas to inspect and edit its properties.
              </span>
            )}
          </Card>
        )}
      </div>

      {/* Export TSX Code Modal */}
      <Dialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export React Standalone Component (TSX)"
        className={isDarkMode ? Classes.DARK : ""}
        style={{ width: "740px" }}
      >
        <div className={Classes.DIALOG_BODY}>
          <p style={{ fontSize: "12px", color: "var(--x52-text-muted)", margin: "0 0 10px 0" }}>
            Copy this complete TypeScript React code into any standalone project or folder:
          </p>
          <pre
            style={{
              padding: "14px",
              backgroundColor: isDarkMode ? "#0d1117" : "#0f172a",
              color: "#f0f6fc",
              borderRadius: "8px",
              fontSize: "12px",
              maxHeight: "340px",
              overflowY: "auto",
              fontFamily: "var(--font-mono)",
            }}
          >
            {generatedCode}
          </pre>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => setIsExportOpen(false)}>Close</Button>
            <Button
              intent="primary"
              icon="clipboard"
              text="Copy TSX to Clipboard"
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
                setNotification("React TSX code copied to clipboard!");
                setIsExportOpen(false);
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
