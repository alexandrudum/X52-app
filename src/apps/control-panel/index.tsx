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

type ControlPanelCategory =
  | "system"
  | "security-governance"
  | "resource-lifecycle"
  | "environment-config"
  | "lineage-audit"
  | "services"
  | "storage"
  | "scheduler";

export const ControlPanelApp: React.FC<{ isDarkMode?: boolean }> = () => {
  const [activeCategory, setActiveCategory] = useState<ControlPanelCategory>("security-governance");
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
      // 1. System Metrics
      const sysRes = await fetch("http://localhost:4000/api/system/metrics");
      if (sysRes.ok) {
        const sysJson = await sysRes.json();
        if (sysJson.success) setSystemMetrics(sysJson.data);
      }

      // 2. Services
      const svcRes = await fetch("http://localhost:4000/api/services/status");
      if (svcRes.ok) {
        const svcJson = await svcRes.json();
        if (svcJson.success) setServices(svcJson.data);
      }

      // 3. Storage
      const storRes = await fetch("http://localhost:4000/api/storage/info");
      if (storRes.ok) {
        const storJson = await storRes.json();
        if (storJson.success) setStorage(storJson.data);
      }

      // 4. Scheduler
      const jobsRes = await fetch("http://localhost:4000/api/scheduler/jobs");
      if (jobsRes.ok) {
        const jobsJson = await jobsRes.json();
        if (jobsJson.success) setJobs(jobsJson.data);
      }

      // 5. Audit
      const auditRes = await fetch("http://localhost:4000/api/security/audit");
      if (auditRes.ok) {
        const auditJson = await auditRes.json();
        if (auditJson.success) setAuditEvents(auditJson.data);
      }

      // 6. Security Telemetry
      const secRes = await fetch("http://localhost:4000/api/security/telemetry");
      if (secRes.ok) {
        const secJson = await secRes.json();
        if (secJson.success) setSecurity(secJson.data);
      }

      // 7. PBAC
      const pbacRes = await fetch("http://localhost:4000/api/governance/pbac");
      if (pbacRes.ok) {
        const pbacJson = await pbacRes.json();
        if (pbacJson.success) setPbacPurposes(pbacJson.data);
      }

      // 8. Approvals
      const appRes = await fetch("http://localhost:4000/api/governance/approvals");
      if (appRes.ok) {
        const appJson = await appRes.json();
        if (appJson.success) setApprovalRequests(appJson.data);
      }

      // 9. Retention
      const retRes = await fetch("http://localhost:4000/api/governance/retention");
      if (retRes.ok) {
        const retJson = await retRes.json();
        if (retJson.success) setRetentionPolicies(retJson.data);
      }

      // 10. Apollo
      const apoRes = await fetch("http://localhost:4000/api/governance/apollo-upgrades");
      if (apoRes.ok) {
        const apoJson = await apoRes.json();
        if (apoJson.success) setApolloTracks(apoJson.data);
      }

      // 11. Functions Config
      const fnRes = await fetch("http://localhost:4000/api/governance/functions-config");
      if (fnRes.ok) {
        const fnJson = await fnRes.json();
        if (fnJson.success) setFunctionsConfig(fnJson.data);
      }

      // 12. Communications
      const commRes = await fetch("http://localhost:4000/api/governance/communications");
      if (commRes.ok) {
        const commJson = await commRes.json();
        if (commJson.success) setBroadcasts(commJson.data);
      }

      // 13. Lineage
      const linRes = await fetch("http://localhost:4000/api/governance/lineage");
      if (linRes.ok) {
        const linJson = await linRes.json();
        if (linJson.success) setLineage(linJson.data);
      }

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
          borderRadius: "8px",
          padding: "12px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Icon icon="control" size={22} color="var(--x52-accent)" />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Palantir Enterprise Control Panel
              </h2>
              <Tag
                intent={isLiveStreaming ? Intent.SUCCESS : Intent.WARNING}
                round
                style={{ fontWeight: 800, fontSize: "10px" }}
              >
                {isLiveStreaming ? "● LIVE STREAM (2s)" : "PAUSED"}
              </Tag>
              <Tag minimal intent={Intent.PRIMARY}>
                Zero Trust Architecture
              </Tag>
            </div>
            <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
              Centralized administrative hub for security governance, PBAC, resource budgets, Apollo upgrades, and FedRAMP audit lineage.
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
          borderRadius: "8px",
          padding: "8px 12px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <ButtonGroup variant="minimal" size="small" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <Button
            icon="shield"
            text="🛡️ Security & Identity Governance"
            active={activeCategory === "security-governance"}
            intent={activeCategory === "security-governance" ? Intent.PRIMARY : Intent.NONE}
            rightIcon={pendingApprovalsCount > 0 ? <Tag round intent={Intent.WARNING} style={{ fontSize: "9px" }}>{pendingApprovalsCount}</Tag> : undefined}
            onClick={() => setActiveCategory("security-governance")}
          />
          <Button
            icon="chart"
            text="📊 Resource & Lifecycle Management"
            active={activeCategory === "resource-lifecycle"}
            intent={activeCategory === "resource-lifecycle" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("resource-lifecycle")}
          />
          <Button
            icon="cog"
            text="💡 Environment & Space Configuration"
            active={activeCategory === "environment-config"}
            intent={activeCategory === "environment-config" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("environment-config")}
          />
          <Button
            icon="git-merge"
            text="🔍 Lineage & Audit Visibility"
            active={activeCategory === "lineage-audit"}
            intent={activeCategory === "lineage-audit" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("lineage-audit")}
          />
          <Button
            icon="dashboard"
            text="🖥️ Host & Node Runtime"
            active={activeCategory === "system"}
            intent={activeCategory === "system" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("system")}
          />
          <Button
            icon="pulse"
            text="⚡ Service Workers"
            active={activeCategory === "services"}
            intent={activeCategory === "services" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("services")}
          />
          <Button
            icon="database"
            text="🔌 Storage Vaults"
            active={activeCategory === "storage"}
            intent={activeCategory === "storage" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("storage")}
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

      {/* Active Category View */}
      {isLoading && !systemMetrics ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Spinner size={36} intent={Intent.PRIMARY} />
        </div>
      ) : (
        <div>
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
