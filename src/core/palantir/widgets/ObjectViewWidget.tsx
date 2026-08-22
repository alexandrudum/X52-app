import React from "react";
import {
  Card,
  Elevation,
  Tag,
  Intent,
  Button,
  Tabs,
  Tab,
  Callout,
  Divider,
} from "@blueprintjs/core";
import type { OntologyInstance } from "../widgetTypes";

interface ObjectViewWidgetProps {
  object: OntologyInstance | null;
  onExecuteAction?: (actionName: string, object: OntologyInstance) => void;
  isDarkMode?: boolean;
}

export const ObjectViewWidget: React.FC<ObjectViewWidgetProps> = ({
  object,
  onExecuteAction,
}) => {
  const [activeTab, setActiveTab] = React.useState<string>("properties");

  if (!object) {
    return (
      <Card
        elevation={Elevation.ONE}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <Callout intent={Intent.NONE} icon="info-sign">
          Select an object instance from the table to view its full 360° Ontology properties and linked graphs.
        </Callout>
      </Card>
    );
  }

  return (
    <Card
      elevation={Elevation.ONE}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: "1px solid var(--x52-border-subtle)",
        borderRadius: "10px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Object Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Tag minimal round intent={Intent.PRIMARY} style={{ fontWeight: 800 }}>
              {object.type}
            </Tag>
            <code>{object.id}</code>
          </div>
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800 }}>{object.title}</h3>
        </div>

        {/* Action Triggers */}
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            intent="primary"
            small
            icon="refresh"
            text="Sync Object"
            onClick={() => onExecuteAction && onExecuteAction("Sync Object", object)}
          />
          <Button
            small
            icon="edit"
            text="Edit"
            onClick={() => onExecuteAction && onExecuteAction("Edit Properties", object)}
          />
        </div>
      </div>

      <Divider style={{ margin: "2px 0" }} />

      {/* Tabs */}
      <Tabs selectedTabId={activeTab} onChange={(id) => setActiveTab(id.toString())}>
        <Tab id="properties" title="Properties & Schema" />
        <Tab id="links" title={`Linked Objects (${object.linkedObjects.length})`} />
      </Tabs>

      {activeTab === "properties" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
            fontSize: "12px",
          }}
        >
          {Object.entries(object.properties).map(([key, val]) => (
            <div
              key={key}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "var(--x52-card-secondary)",
                border: "1px solid var(--x52-border)",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--x52-text-muted)", marginBottom: "2px" }}>
                {key.toUpperCase()}
              </div>
              <div style={{ fontWeight: 600, fontFamily: typeof val === "number" ? "var(--font-mono)" : "inherit" }}>
                {String(val)}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "links" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {object.linkedObjects.map((link, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: "6px",
                backgroundColor: "var(--x52-card-secondary)",
                border: "1px solid var(--x52-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Tag minimal round intent={Intent.SUCCESS} style={{ fontWeight: 700, fontSize: "10px" }}>
                  LINK ➔
                </Tag>
                <strong>{link.type}</strong>
              </div>
              <div style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
                {link.count} related entities ({link.ids.join(", ")})
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
