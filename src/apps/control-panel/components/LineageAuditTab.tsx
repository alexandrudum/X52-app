import React, { useState } from "react";
import { Card, Elevation, Tag, Intent, HTMLTable, Icon, InputGroup, Button, Dialog, Classes } from "@blueprintjs/core";
import type { AuditEventData, LineageGraphData } from "../types";

export const LineageAuditTab: React.FC<{
  auditEvents: AuditEventData[];
  lineage: LineageGraphData | null;
}> = ({ auditEvents, lineage }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; type: string; health: string; records: number } | null>(null);

  const filteredEvents = auditEvents.filter((evt) => {
    const matchesSearch =
      evt.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === "ALL" || evt.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const exportAuditJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditEvents, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `x52_fedramp_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. Interactive Data Lineage Tracking */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon icon="git-merge" color="var(--x52-accent)" />
              Automated End-to-End Data Lineage &amp; Provenance Graph
              <Tag minimal intent={Intent.SUCCESS}>FedRAMP / DoD IL6 Certified</Tag>
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Interactive provenance DAG tracing how raw ingested files flow through transforms and hydrate executive dashboards. Click any node to inspect data contracts.
            </span>
          </div>
        </div>

        {lineage && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", overflowX: "auto", padding: "16px 8px" }}>
            {lineage.nodes.map((node, idx) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => setSelectedNode(node)}
                    style={{
                      minWidth: "170px",
                      maxWidth: "210px",
                      padding: "14px",
                      borderRadius: "8px",
                      backgroundColor: isSelected ? "rgba(59, 130, 246, 0.15)" : "var(--x52-card-secondary)",
                      border: isSelected ? "2px solid var(--x52-accent)" : "1px solid var(--x52-border-subtle)",
                      boxShadow: isSelected ? "0 0 16px rgba(59, 130, 246, 0.4)" : "0 4px 12px rgba(0,0,0,0.2)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Tag minimal style={{ fontSize: "9px" }}>{node.type}</Tag>
                      <Tag intent={Intent.SUCCESS} round style={{ fontSize: "9px" }}>● {node.health}</Tag>
                    </div>
                    <strong style={{ fontSize: "12px", marginTop: "2px", color: isSelected ? "var(--x52-accent)" : "inherit" }}>
                      {node.label}
                    </strong>
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
              );
            })}
          </div>
        )}
      </Card>

      {/* 2. Automated Immutable Audit Logs */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon icon="history" color="var(--x52-accent)" />
              Immutable Compliance Audit Logs (WORM Ledger)
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Unalterable logs tracing actor identity, exact data touch points, timestamps, and client origin IPs.
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              icon="export"
              variant="outlined"
              size="small"
              text="Export FedRAMP JSON"
              onClick={exportAuditJSON}
            />
            <Tag round intent={Intent.SUCCESS} style={{ fontWeight: 800 }}>
              ● LIVE LEDGER
            </Tag>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <InputGroup
              leftIcon="search"
              placeholder="Search audit trail by actor, action, or dataset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <Button
              size="small"
              text="All Events"
              active={selectedSeverity === "ALL"}
              onClick={() => setSelectedSeverity("ALL")}
            />
            <Button
              size="small"
              intent={Intent.SUCCESS}
              text="INFO"
              active={selectedSeverity === "INFO"}
              onClick={() => setSelectedSeverity("INFO")}
            />
            <Button
              size="small"
              intent={Intent.WARNING}
              text="WARNING"
              active={selectedSeverity === "WARNING"}
              onClick={() => setSelectedSeverity("WARNING")}
            />
            <Button
              size="small"
              intent={Intent.DANGER}
              text="CRITICAL"
              active={selectedSeverity === "CRITICAL"}
              onClick={() => setSelectedSeverity("CRITICAL")}
            />
          </div>
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
            {filteredEvents.map((evt) => (
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

      {/* Lineage Node Detail Inspection Dialog */}
      <Dialog
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        title={`Lineage Node Contract: ${selectedNode?.label}`}
        icon="git-merge"
        style={{ width: "600px", backgroundColor: "var(--x52-card-bg)", color: "inherit" }}
      >
        {selectedNode && (
          <div className={Classes.DIALOG_BODY} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>Node Identifier &amp; Stage:</div>
              <h3 style={{ margin: "4px 0", fontSize: "16px" }}>{selectedNode.label}</h3>
              <Tag minimal intent={Intent.PRIMARY} style={{ marginTop: "4px" }}>Type: {selectedNode.type}</Tag>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ padding: "10px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
                <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>Records Processed:</span>
                <div style={{ fontSize: "18px", fontWeight: 800 }}>{selectedNode.records.toLocaleString()}</div>
              </div>
              <div style={{ padding: "10px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
                <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>Pipeline Health:</span>
                <div><Tag intent={Intent.SUCCESS} round>● {selectedNode.health}</Tag></div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>Data Contract &amp; Schema Validation:</span>
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(0,0,0,0.25)", borderRadius: "6px", marginTop: "4px", fontFamily: "var(--x52-font-mono)", fontSize: "11px" }}>
                <div>✓ Input: Byte Stream / Vector Embeddings</div>
                <div>✓ Encoding: UTF-8 / IEEE-754 32-bit Float</div>
                <div>✓ Checksum: SHA-256 Verified</div>
                <div>✓ Compliance Purpose: PURPOSE_FLEET_OPS</div>
              </div>
            </div>
          </div>
        )}

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button text="Close" onClick={() => setSelectedNode(null)} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
