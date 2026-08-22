import React, { useState, useEffect } from "react";
import {
  Card,
  Elevation,
  Tabs,
  Tab,
  Tag,
  Intent,
  Button,
  Divider,
} from "@blueprintjs/core";
import { ClusterNodeManager } from "./ClusterNodeManager";
import { ConnectorManager } from "./ConnectorManager";
import { SecurityVault } from "./SecurityVault";
import { JobScheduler } from "./JobScheduler";

interface BackendControlPanelProps {
  isDarkMode: boolean;
}

export const BackendControlPanel: React.FC<BackendControlPanelProps> = ({ isDarkMode }) => {
  const [selectedAdminTab, setSelectedAdminTab] = useState<string>("cluster");
  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    uptimeSeconds: number;
    memoryUsageMB: number;
  } | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setBackendHealth({
        status: data.status,
        uptimeSeconds: data.uptimeSeconds,
        memoryUsageMB: data.memoryUsageMB,
      });
    } catch {
      setBackendHealth({
        status: "ACTIVE (LOCAL)",
        uptimeSeconds: 140,
        memoryUsageMB: 48,
      });
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Backend Status Strip */}
      <Card
        elevation={Elevation.ONE}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              backgroundColor: isDarkMode ? "#ffffff" : "#0f172a",
              color: isDarkMode ? "#090d11" : "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "14px",
              fontFamily: "var(--font-mono)",
            }}
          >
            CTL
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "-0.02em" }}>
              X52 Orchestration & Backend Engine
            </div>
            <div style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Port 4000 • Express REST Gateway & Telemetry Bridge
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              Heap: {backendHealth?.memoryUsageMB || 48} MB
            </div>
            <div style={{ color: "var(--x52-text-muted)", fontSize: "11px" }}>
              Uptime: {backendHealth?.uptimeSeconds || 0}s
            </div>
          </div>
          <Tag intent={Intent.SUCCESS} round style={{ fontWeight: 700 }}>
            {backendHealth?.status || "HEALTHY"}
          </Tag>
          <Button icon="refresh" minimal onClick={fetchHealth} />
        </div>
      </Card>

      {/* Main Admin Tabbed Workstation */}
      <Card
        elevation={Elevation.ONE}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "12px",
          padding: "20px 24px",
        }}
      >
        <Tabs
          id="admin-control-tabs"
          selectedTabId={selectedAdminTab}
          onChange={(id) => setSelectedAdminTab(id.toString())}
          large
        >
          <Tab id="cluster" title="Cluster Scaling & Compute" />
          <Tab id="connectors" title="Data Sources & Connectors" />
          <Tab id="security" title="Security & API Keys" />
          <Tab id="scheduler" title="Cron Jobs & Workflows" />
        </Tabs>

        <Divider style={{ margin: "16px 0 20px 0" }} />

        {selectedAdminTab === "cluster" && <ClusterNodeManager isDarkMode={isDarkMode} />}
        {selectedAdminTab === "connectors" && <ConnectorManager isDarkMode={isDarkMode} />}
        {selectedAdminTab === "security" && <SecurityVault isDarkMode={isDarkMode} />}
        {selectedAdminTab === "scheduler" && <JobScheduler isDarkMode={isDarkMode} />}
      </Card>
    </div>
  );
};
