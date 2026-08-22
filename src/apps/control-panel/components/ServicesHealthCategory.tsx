import React, { useState } from "react";
import { Card, Elevation, Button, Tag, Intent, HTMLTable, Callout } from "@blueprintjs/core";
import type { ServiceComponentData } from "../types";

export const ServicesHealthCategory: React.FC<{
  services: ServiceComponentData[];
  onRefresh: () => void;
}> = ({ services, onRefresh }) => {
  const [testingServiceId, setTestingServiceId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ name: string; latency: number } | null>(null);

  const handleTestService = async (serviceId: string) => {
    setTestingServiceId(serviceId);
    try {
      const res = await fetch(`http://localhost:4000/api/services/test/${serviceId}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setTestResult({ name: json.service, latency: json.latencyMs });
        onRefresh();
      }
    } catch (err) {
      console.error("Diagnostic error:", err);
    } finally {
      setTestingServiceId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {testResult && (
        <Callout
          intent={Intent.SUCCESS}
          icon="tick-circle"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>
            Diagnostic self-test on <strong>{testResult.name}</strong> passed successfully (Latency: <strong>{testResult.latency}ms</strong>).
          </span>
          <Button variant="minimal" icon="cross" size="small" onClick={() => setTestResult(null)} />
        </Callout>
      )}

      {/* Services Matrix Table */}
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
              Platform Service Components &amp; Workers
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Real-time health, request volume, error rates, and latency for core platform workers.
            </span>
          </div>
          <Button icon="refresh" variant="outlined" size="small" text="Refresh Health" onClick={onRefresh} />
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Component Service</th>
              <th>Category</th>
              <th>Status</th>
              <th>Version</th>
              <th>Total Requests</th>
              <th>Avg Latency</th>
              <th>Error Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc) => (
              <tr key={svc.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{svc.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", marginTop: "2px" }}>
                    {svc.healthDescription}
                  </div>
                </td>
                <td>
                  <Tag minimal>{svc.category}</Tag>
                </td>
                <td>
                  <Tag
                    intent={svc.status === "ONLINE" ? Intent.SUCCESS : Intent.DANGER}
                    round
                    style={{ fontWeight: 800 }}
                  >
                    ● {svc.status}
                  </Tag>
                </td>
                <td><code>v{svc.version}</code></td>
                <td><strong>{svc.requestCount.toLocaleString()}</strong></td>
                <td><code>{svc.averageLatencyMs}ms</code></td>
                <td>
                  <Tag minimal intent={svc.errorRatePercent === 0 ? Intent.SUCCESS : Intent.WARNING}>
                    {svc.errorRatePercent}%
                  </Tag>
                </td>
                <td>
                  <Button
                    size="small"
                    variant="outlined"
                    icon="pulse"
                    text="Self-Test"
                    loading={testingServiceId === svc.id}
                    onClick={() => handleTestService(svc.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>
    </div>
  );
};
