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

interface WidgetInstance {
  id: string;
  type: "metric-card" | "pipeline-table" | "cluster-grid" | "callout" | "action-bar" | "entity-card";
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
  const [appName, setAppName] = useState("Custom_Telemetry_Dashboard");
  const [appDescription] = useState("Custom analytics application built with X52 Core Workbench.");
  const [appCategory, setAppCategory] = useState<X52AppManifest["category"]>("analytics");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>("w-1");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Canvas Widgets List
  const [widgets, setWidgets] = useState<WidgetInstance[]>([
    {
      id: "w-1",
      type: "metric-card",
      title: "PEAK INGESTION BANDWIDTH",
      value: "94.6 GB/s",
      delta: "+8.2% PEAK",
      intent: Intent.SUCCESS,
      dataSource: "Kafka: x52.events.stream",
    },
    {
      id: "w-2",
      type: "metric-card",
      title: "CLUSTER HEALTH STATUS",
      value: "52 / 52",
      delta: "100% OPERATIONAL",
      intent: Intent.PRIMARY,
      dataSource: "X52 Cluster Telemetry",
    },
    {
      id: "w-3",
      type: "action-bar",
      title: "Command Actions",
      subtitle: "Execute cluster sync or export report",
    },
    {
      id: "w-4",
      type: "pipeline-table",
      title: "Active Data Stream Pipelines",
      dataSource: "Foundry Sync Service",
    },
  ]);

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId) || null;

  const handleAddWidget = (type: WidgetInstance["type"]) => {
    const newId = `w-${Date.now()}`;
    let newWidget: WidgetInstance;

    switch (type) {
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
        };
        break;
      case "callout":
        newWidget = {
          id: newId,
          type: "callout",
          title: "Important System Notice",
          subtitle: "All records are cryptographically attested before persistence.",
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

    // Register into the X52 Suite
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
        <div style={{ padding: "20px" }}>
          <h2>{appName}</h2>
          <p>{appDescription}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {widgets.map((w) => (
              <Card key={w.id} elevation={Elevation.ONE}>
                <h4>{w.title}</h4>
                {w.value && <h2 style={{ fontFamily: "var(--font-mono)" }}>{w.value}</h2>}
                {w.subtitle && <p>{w.subtitle}</p>}
              </Card>
            ))}
          </div>
        </div>
      ),
    });

    setNotification(`App "${appName}" successfully published to the X52 App Suite! You can now open it from the 9-dots App Hub.`);
  };

  // Generate copyable React TSX code
  const generatedCode = `import React from 'react';
import { Card, Elevation, Tag, Button, Intent } from '@blueprintjs/core';
import { Sparkline } from './components/Sparkline';

export function ${appName.replace(/[^a-zA-Z0-9]/g, '')}() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
      <div>
        <h2 style={{ margin: 0 }}>${appName}</h2>
        <p style={{ opacity: 0.8, fontSize: '13px' }}>${appDescription}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
${widgets
  .map(
    (w) => `        {/* ${w.title} */}
        <Card elevation={Elevation.ONE} style={{ padding: '20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.7 }}>${w.title}</div>
          ${w.value ? `<div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'monospace', margin: '6px 0' }}>${w.value}</div>` : ''}
          ${w.delta ? `<Tag minimal round intent="${w.intent || 'primary'}">${w.delta}</Tag>` : ''}
          ${w.subtitle ? `<p style={{ fontSize: '13px', marginTop: '8px' }}>${w.subtitle}</p>` : ''}
        </Card>`
  )
  .join('\n\n')}
      </div>
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
                style={{ fontWeight: 800, fontSize: "16px", width: "260px" }}
                small
              />
              <Tag minimal intent={Intent.PRIMARY} round>X52 APP WORKBENCH</Tag>
            </div>
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
              Visual Application Builder & Low-Code Component Composer
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
      <div style={{ display: "grid", gridTemplateColumns: viewMode === "edit" ? "240px 1fr 280px" : "1fr", gap: "16px" }}>
        
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
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
              Click to add core widgets to your application canvas:
            </span>

            <Divider style={{ margin: "4px 0" }} />

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
              text="52 Node Cluster Matrix"
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
            <Button
              alignText="left"
              icon="graph"
              text="Ontology Object Card"
              onClick={() => handleAddWidget("entity-card")}
              fill
            />
          </Card>
        )}

        {/* Center Column: Live Visual Canvas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {widgets.map((widget) => (
            <Card
              key={widget.id}
              elevation={Elevation.ONE}
              onClick={() => viewMode === "edit" && setSelectedWidgetId(widget.id)}
              style={{
                backgroundColor: "var(--x52-card-bg)",
                border: selectedWidgetId === widget.id && viewMode === "edit"
                  ? "2px solid #388bfd"
                  : "1px solid var(--x52-border)",
                borderRadius: "10px",
                padding: "20px",
                position: "relative",
                cursor: viewMode === "edit" ? "pointer" : "default",
              }}
            >
              {viewMode === "edit" && (
                <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px" }}>
                  <Tag minimal round style={{ fontSize: "10px" }}>{widget.type}</Tag>
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

              {/* Render Component Content according to type */}
              {widget.type === "metric-card" && (
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
              )}

              {widget.type === "action-bar" && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700 }}>{widget.title}</h4>
                    <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>{widget.subtitle}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button intent="primary" icon="refresh" text="Sync Stream" />
                    <Button icon="download" text="Export CSV" />
                    <Button icon="cog" text="Config" />
                  </div>
                </div>
              )}

              {widget.type === "pipeline-table" && (
                <div>
                  <h4 style={{ margin: "0 0 12px 0", fontWeight: 700 }}>{widget.title}</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {["PL-X52-091 • Telemetry Ingestion", "PL-X52-084 • Foundry Sync", "PL-X52-077 • Graph Analytics"].map((row, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", backgroundColor: isDarkMode ? "#161b22" : "#f8fafc", borderRadius: "6px", fontSize: "13px", fontWeight: 600 }}>
                        <span>{row}</span>
                        <Tag minimal intent={Intent.SUCCESS} round>ONLINE</Tag>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {widget.type === "cluster-grid" && (
                <div>
                  <h4 style={{ margin: "0 0 12px 0", fontWeight: 700 }}>{widget.title}</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "6px" }}>
                    {Array.from({ length: 16 }, (_, i) => (
                      <div key={i} style={{ padding: "6px", textAlign: "center", borderRadius: "4px", backgroundColor: isDarkMode ? "#161b22" : "#f8fafc", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                        N-{(i + 1).toString().padStart(2, "0")}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {widget.type === "callout" && (
                <Callout intent={widget.intent || Intent.PRIMARY} title={widget.title}>
                  {widget.subtitle}
                </Callout>
              )}

              {widget.type === "entity-card" && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontWeight: 700 }}>{widget.title}</h4>
                    <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>{widget.subtitle}</span>
                  </div>
                  <Tag intent={Intent.SUCCESS} round minimal>ONTOLOGY LINKED</Tag>
                </div>
              )}
            </Card>
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
        style={{ width: "720px" }}
      >
        <div className={Classes.DIALOG_BODY}>
          <p style={{ fontSize: "12px", color: "var(--x52-text-muted)", margin: "0 0 10px 0" }}>
            Copy this ready-to-run TypeScript React code into any standalone project or folder:
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
