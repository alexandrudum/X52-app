import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  Callout,
  InputGroup,
} from "@blueprintjs/core";

interface PipelineNode {
  id: string;
  name: string;
  type: "source" | "transform" | "sink" | "filter";
  status: "READY" | "RUNNING" | "COMPLETED";
  recordsProcessed: string;
}

export const PipelineStudioApp: React.FC<{ isDarkMode: boolean; isStandalone?: boolean }> = ({
  isDarkMode,
}) => {
  const [nodes, setNodes] = useState<PipelineNode[]>([
    { id: "node-01", name: "Kafka Ingestion Topic (x52.events)", type: "source", status: "READY", recordsProcessed: "1.2M" },
    { id: "node-02", name: "Schema Validation & Sanitizer", type: "filter", status: "READY", recordsProcessed: "1.2M" },
    { id: "node-03", name: "Foundry Ontology Transformer", type: "transform", status: "READY", recordsProcessed: "1.18M" },
    { id: "node-04", name: "PostgreSQL & S3 Dual Sink", type: "sink", status: "READY", recordsProcessed: "1.18M" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [pipelineName, setPipelineName] = useState("Telemetry_Aggregation_v2");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {statusMsg && (
        <Callout intent={Intent.SUCCESS} icon="tick-circle">
          {statusMsg}
        </Callout>
      )}

      {/* Studio Header Bar */}
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
              backgroundColor: isDarkMode ? "#388bfd" : "#0f172a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            PS
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <InputGroup
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                style={{ fontWeight: 700, fontSize: "15px", width: "240px" }}
                small
              />
              <Tag minimal intent={Intent.SUCCESS} round>DRAFT / VALIDATED</Tag>
            </div>
            <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
              Visual DAG Workflow Studio • 4 Pipeline Stages
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            intent="primary"
            icon="play"
            text={isRunning ? "Running DAG..." : "Execute Pipeline"}
            loading={isRunning}
            onClick={handleExecuteDAG}
          />
          <Button icon="add" text="Add Node" />
          <Button icon="download" text="Export YAML" />
        </div>
      </Card>

      {/* Visual DAG Flow Diagram */}
      <Card
        elevation={Elevation.ONE}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "24px",
        }}
      >
        <h4 style={{ margin: "0 0 16px 0", fontWeight: 700 }}>Dataflow Pipeline Graph (DAG)</h4>
        
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", justifyContent: "space-between" }}>
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <div
                style={{
                  flex: 1,
                  minWidth: "200px",
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: isDarkMode ? "#161b22" : "#f8fafc",
                  border: isRunning && node.status === "RUNNING"
                    ? "1px solid #388bfd"
                    : node.status === "COMPLETED"
                    ? "1px solid #22c55e"
                    : "1px solid var(--x52-border)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <Tag
                    minimal
                    intent={
                      node.type === "source"
                        ? Intent.PRIMARY
                        : node.type === "transform"
                        ? Intent.SUCCESS
                        : node.type === "filter"
                        ? Intent.WARNING
                        : Intent.NONE
                    }
                    round
                    style={{ fontSize: "10px", fontWeight: 700 }}
                  >
                    {node.type.toUpperCase()}
                  </Tag>
                  <Tag
                    intent={node.status === "COMPLETED" ? Intent.SUCCESS : node.status === "RUNNING" ? Intent.PRIMARY : Intent.NONE}
                    round
                    minimal
                  >
                    {node.status}
                  </Tag>
                </div>
                <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px" }}>
                  {node.name}
                </div>
                <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                  Processed: <strong>{node.recordsProcessed}</strong> records
                </div>
              </div>

              {index < nodes.length - 1 && (
                <div style={{ color: "var(--x52-text-muted)", fontWeight: 900, fontSize: "18px" }}>
                  ➔
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
};
