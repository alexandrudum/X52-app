import React from "react";
import { Card, Elevation, Tag, Intent, HTMLTable } from "@blueprintjs/core";
import type { AuditEventData, SecurityTelemetryData } from "../types";

export const SecurityAuditCategory: React.FC<{
  auditEvents: AuditEventData[];
  security: SecurityTelemetryData | null;
}> = ({ auditEvents, security }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Security Telemetry Overview */}
      {security && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          <Card
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", textTransform: "uppercase" }}>
              Authentication &amp; Session Mode
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "6px" }}>
              {security.authMode}
            </div>
            <div style={{ fontSize: "12px", color: "var(--x52-text-muted)", marginTop: "4px" }}>
              Active Admin Sessions: <strong>{security.activeSessions}</strong>
            </div>
          </Card>

          <Card
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", textTransform: "uppercase" }}>
              API Rate Limiter
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "6px", fontFamily: "var(--x52-font-mono)" }}>
              {security.rateLimiter.currentWindowRequests} / {security.rateLimiter.maxRequestsPerWindow} req
            </div>
            <div style={{ fontSize: "12px", color: "var(--x52-text-muted)", marginTop: "4px" }}>
              Window: 60s • Status: <Tag minimal intent={Intent.SUCCESS}>HEALTHY</Tag>
            </div>
          </Card>
        </div>
      )}

      {/* Real-time Audit Trail Stream */}
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
              Live Security &amp; Platform Audit Stream
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Real-time immutable chronological event log of administrative actions, document uploads, and security operations.
            </span>
          </div>
          <Tag round intent={Intent.SUCCESS} style={{ fontWeight: 800 }}>
            ● STREAMING
          </Tag>
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Category</th>
              <th>Action</th>
              <th>Event Details</th>
              <th>Severity</th>
              <th>Client IP</th>
            </tr>
          </thead>
          <tbody>
            {auditEvents.map((event) => (
              <tr key={event.id}>
                <td>
                  <code style={{ fontSize: "11px" }}>{new Date(event.timestamp).toLocaleTimeString()}</code>
                </td>
                <td><Tag minimal>{event.category}</Tag></td>
                <td><strong>{event.action}</strong></td>
                <td>{event.details}</td>
                <td>
                  <Tag
                    minimal
                    intent={
                      event.severity === "CRITICAL"
                        ? Intent.DANGER
                        : event.severity === "WARNING"
                        ? Intent.WARNING
                        : Intent.SUCCESS
                    }
                  >
                    {event.severity}
                  </Tag>
                </td>
                <td><code>{event.clientIp || "127.0.0.1"}</code></td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>
    </div>
  );
};
