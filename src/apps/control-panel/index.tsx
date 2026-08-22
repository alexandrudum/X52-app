import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Elevation,
  Icon,
  Tag,
  Intent,
  Spinner,
  Callout,
} from "@blueprintjs/core";
import type {
  SystemMetricsData,
  ServiceComponentData,
  StorageInfoData,
  ScheduledJobData,
  AuditEventData,
  SecurityTelemetryData,
  PBACPurposeData,
  ApprovalRequestData,
  RetentionPolicyData,
  ApolloReleaseTrackData,
  FunctionsConfigData,
  PlatformBroadcastData,
  LineageGraphData,
} from "./types";
import { SystemRuntimeCategory } from "./components/SystemRuntimeCategory";
import { ServicesHealthCategory } from "./components/ServicesHealthCategory";
import { StorageConnectorsCategory } from "./components/StorageConnectorsCategory";
import { TaskSchedulerCategory } from "./components/TaskSchedulerCategory";
import { SecurityIdentityTab } from "./components/SecurityIdentityTab";
import { ResourceLifecycleTab } from "./components/ResourceLifecycleTab";
import { EnvironmentConfigTab } from "./components/EnvironmentConfigTab";
import { LineageAuditTab } from "./components/LineageAuditTab";
import { UsersEnrollmentTab } from "./components/UsersEnrollmentTab";
import { ApiKeysVaultTab } from "./components/ApiKeysVaultTab";
import { ConnectorStudioTab } from "./components/ConnectorStudioTab";
import { FunctionsSandboxTab } from "./components/FunctionsSandboxTab";
import { LiveLogTerminalTab } from "./components/LiveLogTerminalTab";

type ControlPanelCategory =
  | "users"
  | "tokens"
  | "connectors"
  | "functions"
  | "terminal"
  | "security-governance"
  | "resource-lifecycle"
  | "environment-config"
  | "lineage-audit"
  | "system"
  | "services"
  | "storage"
  | "scheduler";

export const ControlPanelApp: React.FC<{ isDarkMode?: boolean }> = () => {
  const [activeCategory, setActiveCategory] = useState<ControlPanelCategory>("users");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  // Live telemetry & governance states
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsData | null>(null);
  const [services, setServices] = useState<ServiceComponentData[]>([]);
  const [storage, setStorage] = useState<StorageInfoData | null>(null);
  const [jobs, setJobs] = useState<ScheduledJobData[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventData[]>([]);
  const [security, setSecurity] = useState<SecurityTelemetryData | null>(null);
  const [pbacPurposes, setPbacPurposes] = useState<PBACPurposeData[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequestData[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicyData[]>([]);
  const [apolloTracks, setApolloTracks] = useState<ApolloReleaseTrackData[]>([]);
  const [functionsConfig, setFunctionsConfig] = useState<FunctionsConfigData | null>(null);
  const [broadcasts, setBroadcasts] = useState<PlatformBroadcastData[]>([]);
  const [lineage, setLineage] = useState<LineageGraphData | null>(null);

  const fetchTelemetry = useCallback(async () => {
    try {
      const [
        sysRes,
        svcRes,
        storRes,
        jobsRes,
        auditRes,
        secRes,
        pbacRes,
        appRes,
        retRes,
        apoRes,
        fnRes,
        commRes,
        linRes,
      ] = await Promise.all([
        fetch("http://localhost:4000/api/system/metrics"),
        fetch("http://localhost:4000/api/services/status"),
        fetch("http://localhost:4000/api/storage/info"),
        fetch("http://localhost:4000/api/scheduler/jobs"),
        fetch("http://localhost:4000/api/security/audit"),
        fetch("http://localhost:4000/api/security/telemetry"),
        fetch("http://localhost:4000/api/governance/pbac"),
        fetch("http://localhost:4000/api/governance/approvals"),
        fetch("http://localhost:4000/api/governance/retention"),
        fetch("http://localhost:4000/api/governance/apollo-upgrades"),
        fetch("http://localhost:4000/api/governance/functions-config"),
        fetch("http://localhost:4000/api/governance/communications"),
        fetch("http://localhost:4000/api/governance/lineage"),
      ]);

      if (sysRes.ok) setSystemMetrics((await sysRes.json()).data);
      if (svcRes.ok) setServices((await svcRes.json()).data);
      if (storRes.ok) setStorage((await storRes.json()).data);
      if (jobsRes.ok) setJobs((await jobsRes.json()).data);
      if (auditRes.ok) setAuditEvents((await auditRes.json()).data);
      if (secRes.ok) setSecurity((await secRes.json()).data);
      if (pbacRes.ok) setPbacPurposes((await pbacRes.json()).data);
      if (appRes.ok) setApprovalRequests((await appRes.json()).data);
      if (retRes.ok) setRetentionPolicies((await retRes.json()).data);
      if (apoRes.ok) setApolloTracks((await apoRes.json()).data);
      if (fnRes.ok) setFunctionsConfig((await fnRes.json()).data);
      if (commRes.ok) setBroadcasts((await commRes.json()).data);
      if (linRes.ok) setLineage((await linRes.json()).data);

      setServerError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to backend server.";
      setServerError(`Backend Connection Error: ${msg}. Make sure backend server is running on port 4000.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll telemetry every 2 seconds
  useEffect(() => {
    fetchTelemetry();
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      fetchTelemetry();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchTelemetry, isLiveStreaming]);

  const pendingApprovalsCount = approvalRequests.filter((a) => a.status === "PENDING").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {serverError && (
        <Callout intent={Intent.DANGER} icon="error" title="Backend Server Disconnected">
          {serverError}
        </Callout>
      )}

      {/* Control Panel Master Header */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Icon icon="control" size={24} color="var(--x52-accent)" />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800 }}>
                Palantir Enterprise Control Panel Suite
              </h2>
              <Tag
                intent={isLiveStreaming ? Intent.SUCCESS : Intent.WARNING}
                round
                style={{ fontWeight: 800, fontSize: "10px" }}
              >
                {isLiveStreaming ? "● LIVE TELEMETRY STREAM" : "PAUSED"}
              </Tag>
              <Tag minimal intent={Intent.PRIMARY}>
                Zero Trust Architecture
              </Tag>
            </div>
            <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
              Self-service administrative hub for enterprise identity, API keys, data connectors, sandbox execution, and terminal streams.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button
            size="small"
            variant="outlined"
            icon={isLiveStreaming ? "pause" : "play"}
            text={isLiveStreaming ? "Pause Live Stream" : "Resume Live Stream"}
            active={isLiveStreaming}
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
          />
          <Button
            size="small"
            variant="outlined"
            icon="refresh"
            text="Fetch Now"
            onClick={fetchTelemetry}
          />
        </div>
      </Card>

      {/* Categorized Navigation Switcher */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "8px 12px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <ButtonGroup variant="minimal" size="small" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <Button
            icon="people"
            text="👥 Users & Directory"
            active={activeCategory === "users"}
            intent={activeCategory === "users" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("users")}
          />
          <Button
            icon="key"
            text="🔑 API Key Vault"
            active={activeCategory === "tokens"}
            intent={activeCategory === "tokens" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("tokens")}
          />
          <Button
            icon="database"
            text="🔌 Data Connectors"
            active={activeCategory === "connectors"}
            intent={activeCategory === "connectors" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("connectors")}
          />
          <Button
            icon="code"
            text="⚡ Functions Sandbox"
            active={activeCategory === "functions"}
            intent={activeCategory === "functions" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("functions")}
          />
          <Button
            icon="console"
            text="📜 Live Terminal"
            active={activeCategory === "terminal"}
            intent={activeCategory === "terminal" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("terminal")}
          />
          <Button
            icon="shield"
            text="🛡️ Security & PBAC"
            active={activeCategory === "security-governance"}
            intent={activeCategory === "security-governance" ? Intent.PRIMARY : Intent.NONE}
            rightIcon={pendingApprovalsCount > 0 ? <Tag round intent={Intent.WARNING} style={{ fontSize: "9px" }}>{pendingApprovalsCount}</Tag> : undefined}
            onClick={() => setActiveCategory("security-governance")}
          />
          <Button
            icon="chart"
            text="📊 Resource Lifecycle"
            active={activeCategory === "resource-lifecycle"}
            intent={activeCategory === "resource-lifecycle" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("resource-lifecycle")}
          />
          <Button
            icon="cog"
            text="💡 Environment & Maps"
            active={activeCategory === "environment-config"}
            intent={activeCategory === "environment-config" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("environment-config")}
          />
          <Button
            icon="git-merge"
            text="🔍 Lineage & Audit"
            active={activeCategory === "lineage-audit"}
            intent={activeCategory === "lineage-audit" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("lineage-audit")}
          />
          <Button
            icon="dashboard"
            text="🖥️ Host Runtime"
            active={activeCategory === "system"}
            intent={activeCategory === "system" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("system")}
          />
          <Button
            icon="time"
            text="⚙️ Task Scheduler"
            active={activeCategory === "scheduler"}
            intent={activeCategory === "scheduler" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("scheduler")}
          />
        </ButtonGroup>
      </Card>

      {/* Active Tool View */}
      {isLoading && !systemMetrics ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Spinner size={36} intent={Intent.PRIMARY} />
        </div>
      ) : (
        <div>
          {activeCategory === "users" && <UsersEnrollmentTab />}
          {activeCategory === "tokens" && <ApiKeysVaultTab />}
          {activeCategory === "connectors" && <ConnectorStudioTab />}
          {activeCategory === "functions" && <FunctionsSandboxTab />}
          {activeCategory === "terminal" && <LiveLogTerminalTab />}

          {activeCategory === "security-governance" && (
            <SecurityIdentityTab
              pbacPurposes={pbacPurposes}
              approvalRequests={approvalRequests}
              security={security}
              onRefresh={fetchTelemetry}
            />
          )}

          {activeCategory === "resource-lifecycle" && (
            <ResourceLifecycleTab
              retentionPolicies={retentionPolicies}
              apolloTracks={apolloTracks}
              onRefresh={fetchTelemetry}
            />
          )}

          {activeCategory === "environment-config" && (
            <EnvironmentConfigTab
              functionsConfig={functionsConfig}
              broadcasts={broadcasts}
              onRefresh={fetchTelemetry}
            />
          )}

          {activeCategory === "lineage-audit" && (
            <LineageAuditTab auditEvents={auditEvents} lineage={lineage} />
          )}

          {activeCategory === "system" && <SystemRuntimeCategory metrics={systemMetrics} />}
          {activeCategory === "services" && <ServicesHealthCategory services={services} onRefresh={fetchTelemetry} />}
          {activeCategory === "storage" && <StorageConnectorsCategory storage={storage} onRefresh={fetchTelemetry} />}
          {activeCategory === "scheduler" && <TaskSchedulerCategory jobs={jobs} onRefresh={fetchTelemetry} />}
        </div>
      )}
    </div>
  );
};
