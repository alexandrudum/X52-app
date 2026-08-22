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
} from "./types";
import { SystemRuntimeCategory } from "./components/SystemRuntimeCategory";
import { ServicesHealthCategory } from "./components/ServicesHealthCategory";
import { StorageConnectorsCategory } from "./components/StorageConnectorsCategory";
import { TaskSchedulerCategory } from "./components/TaskSchedulerCategory";
import { SecurityAuditCategory } from "./components/SecurityAuditCategory";

type ControlPanelCategory = "system" | "services" | "storage" | "scheduler" | "security";

export const ControlPanelApp: React.FC<{ isDarkMode?: boolean }> = () => {
  const [activeCategory, setActiveCategory] = useState<ControlPanelCategory>("system");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  // Live telemetry state
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsData | null>(null);
  const [services, setServices] = useState<ServiceComponentData[]>([]);
  const [storage, setStorage] = useState<StorageInfoData | null>(null);
  const [jobs, setJobs] = useState<ScheduledJobData[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventData[]>([]);
  const [security, setSecurity] = useState<SecurityTelemetryData | null>(null);

  const fetchTelemetry = useCallback(async () => {
    try {
      // Fetch system metrics
      const sysRes = await fetch("http://localhost:4000/api/system/metrics");
      if (sysRes.ok) {
        const sysJson = await sysRes.json();
        if (sysJson.success) setSystemMetrics(sysJson.data);
      }

      // Fetch services status
      const svcRes = await fetch("http://localhost:4000/api/services/status");
      if (svcRes.ok) {
        const svcJson = await svcRes.json();
        if (svcJson.success) setServices(svcJson.data);
      }

      // Fetch storage info
      const storRes = await fetch("http://localhost:4000/api/storage/info");
      if (storRes.ok) {
        const storJson = await storRes.json();
        if (storJson.success) setStorage(storJson.data);
      }

      // Fetch scheduled jobs
      const jobsRes = await fetch("http://localhost:4000/api/scheduler/jobs");
      if (jobsRes.ok) {
        const jobsJson = await jobsRes.json();
        if (jobsJson.success) setJobs(jobsJson.data);
      }

      // Fetch audit logs
      const auditRes = await fetch("http://localhost:4000/api/security/audit");
      if (auditRes.ok) {
        const auditJson = await auditRes.json();
        if (auditJson.success) setAuditEvents(auditJson.data);
      }

      // Fetch security telemetry
      const secRes = await fetch("http://localhost:4000/api/security/telemetry");
      if (secRes.ok) {
        const secJson = await secRes.json();
        if (secJson.success) setSecurity(secJson.data);
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
                Server Control Panel &amp; Telemetry
              </h2>
              <Tag
                intent={isLiveStreaming ? Intent.SUCCESS : Intent.WARNING}
                round
                style={{ fontWeight: 800, fontSize: "10px" }}
              >
                {isLiveStreaming ? "● LIVE STREAM (2s)" : "PAUSED"}
              </Tag>
            </div>
            <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
              Real-time hardware, process runtime, worker services, and security audit telemetry.
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
            icon="dashboard"
            text="1. System & Node Runtime"
            active={activeCategory === "system"}
            intent={activeCategory === "system" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("system")}
          />
          <Button
            icon="pulse"
            text="2. Service Components"
            active={activeCategory === "services"}
            intent={activeCategory === "services" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("services")}
          />
          <Button
            icon="database"
            text="3. Storage & Connectors"
            active={activeCategory === "storage"}
            intent={activeCategory === "storage" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("storage")}
          />
          <Button
            icon="time"
            text="4. Task Scheduler"
            active={activeCategory === "scheduler"}
            intent={activeCategory === "scheduler" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("scheduler")}
          />
          <Button
            icon="shield"
            text="5. Security & Audit Trail"
            active={activeCategory === "security"}
            intent={activeCategory === "security" ? Intent.PRIMARY : Intent.NONE}
            onClick={() => setActiveCategory("security")}
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
          {activeCategory === "system" && <SystemRuntimeCategory metrics={systemMetrics} />}
          {activeCategory === "services" && <ServicesHealthCategory services={services} onRefresh={fetchTelemetry} />}
          {activeCategory === "storage" && <StorageConnectorsCategory storage={storage} onRefresh={fetchTelemetry} />}
          {activeCategory === "scheduler" && <TaskSchedulerCategory jobs={jobs} onRefresh={fetchTelemetry} />}
          {activeCategory === "security" && <SecurityAuditCategory auditEvents={auditEvents} security={security} />}
        </div>
      )}
    </div>
  );
};
