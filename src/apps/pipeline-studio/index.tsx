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
  Section,
  SectionCard,
  Tag,
} from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";

interface PipelineNode {
  id: string;
  name: string;
  type: "source" | "transform" | "sink" | "filter";
  status: "READY" | "RUNNING" | "COMPLETED";
  recordsProcessed: string;
}

/**
 * Status is the only thing on the canvas that spends colour, and it never spends
 * it alone: every state pairs an intent with an icon and a word.
 */
const STATUS_PRESENTATION: Record<
  PipelineNode["status"],
  { intent: Intent; icon: IconName; label: string }
> = {
  READY: { intent: Intent.NONE, icon: "circle", label: "Ready" },
  RUNNING: { intent: Intent.PRIMARY, icon: "refresh", label: "Running" },
  COMPLETED: { intent: Intent.SUCCESS, icon: "tick", label: "Completed" },
};

/** A DAG edge: a hairline rule terminated by a muted chevron. Decorative. */
const DagEdge: React.FC = () => (
  <span
    aria-hidden="true"
    style={{
      display: "flex",
      alignItems: "center",
      flex: "none",
      color: "var(--x52-text-muted)",
    }}
  >
    <span
      style={{
        width: "var(--x52-space-4)",
        height: "1px",
        backgroundColor: "var(--x52-border)",
      }}
    />
    <Icon icon="chevron-right" size={12} />
  </span>
);

export const PipelineStudioApp: React.FC<{ isDarkMode: boolean; isStandalone?: boolean }> = () => {
  const [nodes, setNodes] = useState<PipelineNode[]>([
    { id: "node-01", name: "Kafka Ingestion Topic (x52.events)", type: "source", status: "READY", recordsProcessed: "1.2M" },
    { id: "node-02", name: "Schema Validation & Sanitizer", type: "filter", status: "READY", recordsProcessed: "1.2M" },
    { id: "node-03", name: "Foundry Ontology Transformer", type: "transform", status: "READY", recordsProcessed: "1.18M" },
    { id: "node-04", name: "PostgreSQL & S3 Dual Sink", type: "sink", status: "READY", recordsProcessed: "1.18M" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [pipelineName, setPipelineName] = useState("Telemetry_Aggregation_v2");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const handleExecuteDAG = () => {
    setIsRunning(true);
    setStatusMsg(null);
    setNodes((prev) => prev.map((n) => ({ ...n, status: "RUNNING" })));

    setTimeout(() => {
      setNodes((prev) => prev.map((n) => ({ ...n, status: "COMPLETED" })));
      setIsRunning(false);
      setStatusMsg("Pipeline execution finished successfully across 4 pipeline stages.");
    }, 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)" }}>
      {statusMsg && (
        <Callout intent={Intent.SUCCESS} icon="tick-circle">
          {statusMsg}
        </Callout>
      )}

      {/* Studio header. Flat surface: a 1px hairline, no floating shadow. */}
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
          <Icon icon="layers" size={20} className="x52-muted" />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
              <InputGroup
                aria-label="Pipeline name"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                style={{ width: "240px" }}
                size="small"
              />
              <Tag minimal icon="endorsed">
                Draft · validated
              </Tag>
            </div>
            <span
              className="x52-muted"
              style={{ fontSize: "var(--x52-fs-small)" }}
            >
              Visual DAG workflow studio · {nodes.length} pipeline stages
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--x52-space-2)" }}>
          <Button
            intent={Intent.PRIMARY}
            icon="play"
            text={isRunning ? "Running DAG…" : "Execute pipeline"}
            loading={isRunning}
            onClick={handleExecuteDAG}
          />
          <Button icon="add" text="Add node" />
          <Button icon="download" text="Export YAML" />
        </div>
      </Card>

      <Section
        title="Dataflow pipeline graph"
        subtitle="Directed acyclic graph · left to right"
        elevation={Elevation.ZERO}
        rightElement={
          <Tag minimal className="x52-numeric">
            {nodes.length} nodes
          </Tag>
        }
      >
        <SectionCard>
          {/* The canvas reads as a recessed plane: one background step down from
              the card, hairline bounded — no decorative dot grid. */}
          <div
            style={{
              backgroundColor: "var(--x52-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "var(--x52-radius)",
              padding: "var(--x52-space-4)",
              display: "flex",
              alignItems: "stretch",
              flexWrap: "wrap",
              gap: "var(--x52-space-2)",
            }}
          >
            {nodes.map((node, index) => {
              const status = STATUS_PRESENTATION[node.status];
              const isSelected = node.id === selectedNodeId;
              return (
                <React.Fragment key={node.id}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      textAlign: "left",
                      font: "inherit",
                      color: "var(--x52-text)",
                      cursor: "pointer",
                      padding: "var(--x52-space-3)",
                      borderRadius: "var(--x52-radius)",
                      backgroundColor: "var(--x52-node-bg)",
                      border: isSelected
                        ? "1px solid var(--x52-intent-primary)"
                        : "1px solid var(--x52-border)",
                      boxShadow: isSelected
                        ? "0 0 0 1px var(--x52-intent-primary)"
                        : "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--x52-space-2)",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "var(--x52-space-2)",
                      }}
                    >
                      {/* The node taxonomy is neutral: type is a label, not a status. */}
                      <Tag minimal className="x52-numeric">
                        {node.type}
                      </Tag>
                      <Tag minimal intent={status.intent} icon={status.icon}>
                        {status.label}
                      </Tag>
                    </span>

                    <span
                      style={{
                        fontWeight: "var(--x52-fw-medium)",
                        fontSize: "var(--x52-fs-base)",
                        color: "var(--x52-heading)",
                      }}
                    >
                      {node.name}
                    </span>

                    <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
                      <span className="x52-numeric">{node.recordsProcessed}</span> records
                      processed
                    </span>
                  </button>

                  {index < nodes.length - 1 && <DagEdge />}
                </React.Fragment>
              );
            })}
          </div>
        </SectionCard>

        {selectedNode && (
          <SectionCard padded={false}>
            <HTMLTable compact striped style={{ width: "100%" }}>
              <caption className="x52-label" style={{ padding: "var(--x52-space-2) var(--x52-space-3)", textAlign: "left" }}>
                Selected node
              </caption>
              <thead>
                <tr>
                  <th scope="col">Node ID</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ textAlign: "right" }}>Records</th>
                </tr>
              </thead>
              <tbody>
                <tr className="x52-table-row">
                  <td className="x52-numeric">{selectedNode.id}</td>
                  <td className="x52-numeric">{selectedNode.type}</td>
                  <td>
                    <Tag
                      minimal
                      intent={STATUS_PRESENTATION[selectedNode.status].intent}
                      icon={STATUS_PRESENTATION[selectedNode.status].icon}
                    >
                      {STATUS_PRESENTATION[selectedNode.status].label}
                    </Tag>
                  </td>
                  <td className="x52-numeric" style={{ textAlign: "right" }}>
                    {selectedNode.recordsProcessed}
                  </td>
                </tr>
              </tbody>
            </HTMLTable>
          </SectionCard>
        )}
      </Section>
    </div>
  );
};
