import React, { useState } from "react";
import {
  Button,
  Callout,
  Card,
  Elevation,
  HTMLTable,
  Icon,
  InputGroup,
  Intent,
  NonIdealState,
  Section,
  SectionCard,
  Tag,
} from "@blueprintjs/core";

interface OntologyObject {
  id: string;
  type: string;
  label: string;
  propertiesCount: number;
  relations: string[];
}

export const OntologyExplorerApp: React.FC<{ isDarkMode?: boolean; isStandalone?: boolean }> = () => {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)" }}>
      {/* Header. Flat surface — a hairline and a background step, no shadow. */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "var(--x52-radius)",
          boxShadow: "none",
          padding: "var(--x52-space-3) var(--x52-space-4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--x52-space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-3)" }}>
          <Icon icon="graph" size={20} className="x52-muted" />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "var(--x52-fs-h5)",
                  fontWeight: "var(--x52-fw-bold)",
                  color: "var(--x52-heading)",
                }}
              >
                Ontology &amp; object graph
              </h1>
              <Tag minimal icon="cloud-tick">
                Foundry synced
              </Tag>
            </div>
            <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
              Inspect semantic entity schemas, relationships, and link matrices.
            </span>
          </div>
        </div>

        <InputGroup
          leftIcon="search"
          aria-label="Search entity types"
          placeholder="Search entity types…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          style={{ width: "240px" }}
        />
      </Card>

      <Section
        title="Object types"
        subtitle="Semantic link layer"
        elevation={Elevation.ZERO}
        rightElement={
          <Tag minimal className="x52-numeric">
            {filtered.length} / {ontologyObjects.length}
          </Tag>
        }
      >
        <SectionCard padded={false}>
          {filtered.length === 0 ? (
            <div style={{ padding: "var(--x52-space-8) var(--x52-space-4)" }}>
              <NonIdealState
                icon="search"
                title="No matching object types"
                description="No entity type or label matches the current filter."
                action={
                  <Button
                    variant="minimal"
                    icon="cross"
                    text="Clear search"
                    onClick={() => setSearch("")}
                  />
                }
              />
            </div>
          ) : (
            <HTMLTable compact interactive style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th scope="col">Object ID</th>
                  <th scope="col">Type</th>
                  <th scope="col">Label</th>
                  <th scope="col" style={{ textAlign: "right" }}>Properties</th>
                  <th scope="col">Relationships</th>
                  <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((obj) => {
                  const isSelected = selectedObject?.id === obj.id;
                  return (
                    <tr
                      key={obj.id}
                      className="x52-table-row"
                      // Mouse convenience only; the row's Inspect button below is
                      // the keyboard-reachable equivalent, so no tab stop is lost.
                      onClick={() => setSelectedObject(obj)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isSelected ? "var(--x52-row-hover)" : undefined,
                      }}
                    >
                      <td
                        className="x52-numeric x52-muted"
                        style={{
                          boxShadow: isSelected
                            ? "inset 2px 0 0 0 var(--x52-intent-primary)"
                            : undefined,
                        }}
                      >
                        {obj.id}
                      </td>
                      <td
                        className="x52-numeric"
                        style={{ fontWeight: "var(--x52-fw-medium)", color: "var(--x52-heading)" }}
                      >
                        {obj.type}
                      </td>
                      <td>{obj.label}</td>
                      <td className="x52-numeric" style={{ textAlign: "right" }}>
                        {obj.propertiesCount}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: "var(--x52-space-1)",
                          }}
                        >
                          {obj.relations.map((rel) => (
                            <Tag key={rel} minimal icon="arrow-right">
                              {rel}
                            </Tag>
                          ))}
                          <span
                            className="x52-muted"
                            style={{ fontSize: "var(--x52-fs-small)" }}
                          >
                            {obj.relations.length} links
                          </span>
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Button
                          variant="minimal"
                          size="small"
                          endIcon="chevron-right"
                          text="Inspect"
                          active={isSelected}
                          aria-label={`Inspect ${obj.type}`}
                          onClick={() => setSelectedObject(obj)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </HTMLTable>
          )}
        </SectionCard>
      </Section>

      {selectedObject && (
        <Callout
          intent={Intent.PRIMARY}
          icon="graph"
          title={`Entity schema · ${selectedObject.type}`}
        >
          <p style={{ fontSize: "var(--x52-fs-small)", margin: "0 0 var(--x52-space-3) 0" }}>
            <span className="x52-numeric">{selectedObject.id}</span> — {selectedObject.label}.
            Linked to {selectedObject.relations.join(", ")}. Backed by the Palantir Foundry
            semantic link layer.
          </p>
          <Button size="small" intent={Intent.PRIMARY} text="Open Object 360 view" />
        </Callout>
      )}
    </div>
  );
};
