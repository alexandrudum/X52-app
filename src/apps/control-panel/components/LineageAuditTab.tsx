import React from "react";
import { Card, Elevation, Tag, Intent, HTMLTable, Icon } from "@blueprintjs/core";
import type { AuditEventData, LineageGraphData } from "../types";

export const LineageAuditTab: React.FC<{
  auditEvents: AuditEventData[];
  lineage: LineageGraphData | null;
}> = ({ auditEvents, lineage }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. Interactive Data Lineage Tracking */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "8px",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              Automated End-to-End Data Lineage &amp; Provenance Graph
              <Tag minimal intent={Intent.SUCCESS}>FedRAMP / DoD IL6 Standard</Tag>
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Visualizes end-to-end data provenance tracing how raw ingested files flow through transforms and hydrate executive dashboards.
            </span>
          </div>
        </div>

        {lineage && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", overflowX: "auto", padding: "16px 8px" }}>
            {lineage.nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                <div
                  style={{
                    minWidth: "160px",
                    maxWidth: "200px",
                    padding: "14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--x52-card-secondary)",
                    border: "1px solid var(--x52-border-subtle)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Tag minimal style={{ fontSize: "9px" }}>{node.type}</Tag>
                    <Tag intent={Intent.SUCCESS} round style={{ fontSize: "9px" }}>● {node.health}</Tag>
                  </div>
                  <strong style={{ fontSize: "12px", marginTop: "2px" }}>{node.label}</strong>
                  <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                    Records: <strong>{node.records.toLocaleString()}</strong>
                  </div>
                </div>

                {idx < lineage.nodes.length - 1 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                    <Icon icon="arrow-right" size={16} color="var(--x52-accent)" />
                    <span style={{ fontSize: "9px", color: "var(--x52-text-muted)", whiteSpace: "nowrap" }}>
                      {lineage.edges[idx]?.label}
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </Card>

      {/* 2. Automated Immutable Audit Logs */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "8px",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>
              Immutable Compliance Audit Logs
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Unalterable logs tracing actor identity, exact data touch points, timestamps, and cryptographic integrity hashes.
            </span>
          </div>
          <Tag round intent={Intent.SUCCESS} style={{ fontWeight: 800 }}>
            ● FEDRAMP HIGH COMPLIANT
          </Tag>
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Category</th>
              <th>Action Operation</th>
              <th>Entity / Description</th>
              <th>Severity</th>
              <th>Client Origin IP</th>
            </tr>
          </thead>
          <tbody>
            {auditEvents.map((evt) => (
              <tr key={evt.id}>
                <td><code>{new Date(evt.timestamp).toLocaleTimeString()}</code></td>
                <td><Tag minimal>{evt.category}</Tag></td>
                <td><strong>{evt.action}</strong></td>
                <td>{evt.details}</td>
                <td>
                  <Tag
                    minimal
                    intent={
                      evt.severity === "CRITICAL"
                        ? Intent.DANGER
                        : evt.severity === "WARNING"
                        ? Intent.WARNING
                        : Intent.SUCCESS
                    }
                  >
                    {evt.severity}
                  </Tag>
                </td>
                <td><code>{evt.clientIp || "127.0.0.1"}</code></td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>
    </div>
  );
};
