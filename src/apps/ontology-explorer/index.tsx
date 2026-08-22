import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  InputGroup,
  Callout,
} from "@blueprintjs/core";

interface OntologyObject {
  id: string;
  type: string;
  label: string;
  propertiesCount: number;
  relations: string[];
}

export const OntologyExplorerApp: React.FC<{ isDarkMode?: boolean; isStandalone?: boolean }> = ({
  isDarkMode: _isDarkMode,
}) => {
  const [search, setSearch] = useState("");
  const [selectedObject, setSelectedObject] = useState<OntologyObject | null>(null);

  const ontologyObjects: OntologyObject[] = [
    { id: "obj-01", type: "ComputeNode", label: "Cluster Worker Instance", propertiesCount: 18, relations: ["DataPipeline", "ClusterGroup", "TelemetryStream"] },
    { id: "obj-02", type: "DataPipeline", label: "Stream Transform Pipeline", propertiesCount: 24, relations: ["ComputeNode", "KafkaTopic", "OntologySchema"] },
    { id: "obj-03", type: "SecurityCredential", label: "API Token & Secret", propertiesCount: 12, relations: ["UserRole", "DataPipeline"] },
    { id: "obj-04", type: "Dataset", label: "Parquet Lakehouse Table", propertiesCount: 32, relations: ["DataPipeline", "StorageBucket"] },
  ];

  const filtered = ontologyObjects.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    o.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
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
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: "16px" }}>
              X52 Ontology & Object Graph Explorer
            </h3>
            <Tag minimal intent={Intent.PRIMARY} round>FOUNDRY SYNCED</Tag>
          </div>
          <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
            Inspect semantic entity schemas, relationships, and link matrices.
          </span>
        </div>

        <div style={{ width: "260px" }}>
          <InputGroup
            leftIcon="search"
            placeholder="Search entity types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            small
            round
          />
        </div>
      </Card>

      {/* Grid of Objects */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {filtered.map((obj) => (
          <Card
            key={obj.id}
            interactive
            elevation={Elevation.ONE}
            onClick={() => setSelectedObject(obj)}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: selectedObject?.id === obj.id ? "1px solid #388bfd" : "1px solid var(--x52-border)",
              borderRadius: "10px",
              padding: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <Tag minimal intent={Intent.SUCCESS} round style={{ fontWeight: 700 }}>
                {obj.type}
              </Tag>
              <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                {obj.propertiesCount} Props
              </span>
            </div>

            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>
              {obj.label}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
              {obj.relations.map((rel, idx) => (
                <Tag key={idx} minimal style={{ fontSize: "10px" }}>
                  ➔ {rel}
                </Tag>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {selectedObject && (
        <Callout
          intent={Intent.PRIMARY}
          title={`Entity Schema: ${selectedObject.type} (${selectedObject.label})`}
        >
          <p style={{ fontSize: "12px", margin: "0 0 10px 0" }}>
            This object is linked to {selectedObject.relations.join(", ")}. Backed by Palantir Foundry semantic link layer.
          </p>
          <Button small intent="primary" text="Open Object 360 View" />
        </Callout>
      )}
    </div>
  );
};
