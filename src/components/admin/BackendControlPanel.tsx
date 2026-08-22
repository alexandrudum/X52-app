import React, { useEffect, useState } from "react";
import {
  Button,
  Callout,
  Card,
  Divider,
  Elevation,
  EntityTitle,
  H5,
  Tab,
  Tabs,
  Tooltip,
} from "@blueprintjs/core";
import { ClusterNodeManager } from "./ClusterNodeManager";
import { ConnectorManager } from "./ConnectorManager";
import { SecurityVault } from "./SecurityVault";
import { JobScheduler } from "./JobScheduler";
import { StatusIndicator, type StatusTone } from "./StatusIndicator";

const HEALTH_POLL_MS = 10_000;

interface BackendHealth {
  status: string;
  uptimeSeconds: number;
  memoryUsageMB: number;
}

interface BackendControlPanelProps {
  isDarkMode: boolean;
}

const formatUptime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  return `${hours}h ${Math.floor((seconds % 3600) / 60)}m`;
};

/** Right-aligned metric pair: uppercase label over a monospace figure. */
const HeaderMetric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-1)" }}>
    <span className="x52-label">{label}</span>
    <span className="x52-numeric" style={{ fontSize: "var(--x52-fs-base)" }}>
      {value}
    </span>
  </div>
);

export const BackendControlPanel: React.FC<BackendControlPanelProps> = ({ isDarkMode }) => {
  const [selectedAdminTab, setSelectedAdminTab] = useState<string>("cluster");
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true);
  // Bumped by the refresh control so the poll restarts from the user's action
  // rather than from a setState fired inside the effect body.
  const [refreshNonce, setRefreshNonce] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const loadHealth = async () => {
      try {
        const res = await fetch("/api/health", { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Health endpoint responded ${res.status} ${res.statusText}`.trim());
        }
        const data: Partial<BackendHealth> = await res.json();
        if (cancelled) return;
        setHealth({
          status: typeof data.status === "string" ? data.status : "UNKNOWN",
          uptimeSeconds: Number(data.uptimeSeconds) || 0,
          memoryUsageMB: Number(data.memoryUsageMB) || 0,
        });
        setHealthError(null);
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        // Never fabricate telemetry for an operator: show the outage instead.
        setHealth(null);
        setHealthError(
          error instanceof Error ? error.message : "The control-plane API could not be reached.",
        );
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    };

    void loadHealth();
    const interval = setInterval(() => void loadHealth(), HEALTH_POLL_MS);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(interval);
    };
  }, [refreshNonce]);

  const isOnline = health !== null;
  const statusTone: StatusTone = isOnline ? "success" : "danger";
  const statusLabel = isOnline ? health.status : "Unreachable";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)" }}>
      {/* Backend status strip — a flat base surface, not an overlay. */}
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
        <EntityTitle
          icon="control"
          heading={H5}
          title="X52 Orchestration & Backend Engine"
          subtitle="Port 4000 · Express REST gateway & telemetry bridge"
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--x52-space-5)",
            flexWrap: "wrap",
          }}
        >
          <HeaderMetric label="Heap" value={isOnline ? `${health.memoryUsageMB} MB` : "—"} />
          <HeaderMetric
            label="Uptime"
            value={isOnline ? formatUptime(health.uptimeSeconds) : "—"}
          />
          <StatusIndicator tone={statusTone} label={statusLabel} live={isOnline} />
          <Tooltip content="Refresh backend health" placement="bottom-end">
            <Button
              icon="refresh"
              variant="minimal"
              aria-label="Refresh backend health"
              loading={isRefreshing}
              onClick={() => {
                setIsRefreshing(true);
                setRefreshNonce((nonce) => nonce + 1);
              }}
            />
          </Tooltip>
        </div>
      </Card>

      {healthError && (
        <Callout intent="danger" icon="offline" title="Control-plane API unreachable" compact>
          {healthError} Live telemetry is paused. The workstation below stays usable, but any
          command it issues will fail until the service is back.
        </Callout>
      )}

      {/* Main admin tabbed workstation */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "var(--x52-radius)",
          boxShadow: "none",
          padding: "var(--x52-space-4) var(--x52-space-5)",
        }}
      >
        <Tabs
          id="admin-control-tabs"
          selectedTabId={selectedAdminTab}
          onChange={(id) => setSelectedAdminTab(id.toString())}
        >
          <Tab id="cluster" title="Cluster & compute" />
          <Tab id="connectors" title="Data sources" />
          <Tab id="security" title="Security & API keys" />
          <Tab id="scheduler" title="Cron jobs" />
        </Tabs>

        <Divider style={{ margin: "var(--x52-space-3) 0 var(--x52-space-4) 0" }} />

        {selectedAdminTab === "cluster" && <ClusterNodeManager isDarkMode={isDarkMode} />}
        {selectedAdminTab === "connectors" && <ConnectorManager isDarkMode={isDarkMode} />}
        {selectedAdminTab === "security" && <SecurityVault isDarkMode={isDarkMode} />}
        {selectedAdminTab === "scheduler" && <JobScheduler isDarkMode={isDarkMode} />}
      </Card>
    </div>
  );
};
