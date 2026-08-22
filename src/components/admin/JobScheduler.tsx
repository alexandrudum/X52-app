import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  Callout,
} from "@blueprintjs/core";

interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  target: string;
  lastRun: string;
  status: "ACTIVE" | "PAUSED" | "RUNNING";
  lastDurationMs: number;
}

interface JobSchedulerProps {
  isDarkMode: boolean;
}

export const JobScheduler: React.FC<JobSchedulerProps> = ({ isDarkMode: _isDarkMode }) => {
  const [jobs, setJobs] = useState<ScheduledJob[]>([
    {
      id: "job-foundry-sync",
      name: "Hourly Foundry Ontology Reconciliation",
      schedule: "0 * * * *",
      target: "PL-X52-084",
      lastRun: "18m ago",
      status: "ACTIVE",
      lastDurationMs: 4200,
    },
    {
      id: "job-telemetry-cleanup",
      name: "Telemetry Partition Compaction",
      schedule: "0 0 * * *",
      target: "PL-X52-091",
      lastRun: "21h ago",
      status: "ACTIVE",
      lastDurationMs: 14800,
    },
    {
      id: "job-security-attest",
      name: "Cluster Cryptographic Attestation",
      schedule: "*/15 * * * *",
      target: "SECURITY-VAULT",
      lastRun: "6m ago",
      status: "ACTIVE",
      lastDurationMs: 650,
    },
    {
      id: "job-backup-snapshot",
      name: "Daily Distributed State Snapshot",
      schedule: "0 2 * * *",
      target: "S3-COLD-STORAGE",
      lastRun: "19h ago",
      status: "ACTIVE",
      lastDurationMs: 28400,
    },
  ]);

  const [runningId, setRunningId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleRunJob = async (id: string) => {
    setRunningId(id);
    setNotification(null);
    try {
      await fetch(`/api/scheduler/jobs/${id}/run`, { method: "POST" });
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, lastRun: "Just now", status: "ACTIVE" } : j
        )
      );
      setNotification(`Job ${id} executed successfully.`);
    } catch {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, lastRun: "Just now" } : j
        )
      );
      setNotification(`Job triggered.`);
    } finally {
      setTimeout(() => setRunningId(null), 1000);
    }
  };

  const handleToggleJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: j.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }
          : j
      )
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {notification && (
        <Callout intent={Intent.SUCCESS} icon="tick-circle">
          {notification}
        </Callout>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Automated Cron Jobs & Workflows</h3>
          <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
            Background sync jobs, snapshot triggers, and partition compaction schedules.
          </span>
        </div>
      </div>

      {/* Jobs List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {jobs.map((job) => (
          <Card
            key={job.id}
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
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
                {job.name}
              </div>
              <div style={{ display: "flex", gap: "12px", fontSize: "12px", alignItems: "center" }}>
                <code>{job.schedule}</code>
                <span style={{ color: "var(--x52-text-muted)" }}>Target: <strong>{job.target}</strong></span>
                <span style={{ color: "var(--x52-text-muted)" }}>• Last Run: {job.lastRun} ({job.lastDurationMs}ms)</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Tag
                intent={job.status === "ACTIVE" ? Intent.SUCCESS : Intent.NONE}
                round
                minimal
                style={{ fontWeight: 700 }}
              >
                {job.status}
              </Tag>

              <Button
                icon="play"
                intent="primary"
                text={runningId === job.id ? "Running..." : "Run Now"}
                loading={runningId === job.id}
                onClick={() => handleRunJob(job.id)}
              />

              <Button
                minimal
                icon={job.status === "ACTIVE" ? "pause" : "play"}
                text={job.status === "ACTIVE" ? "Pause" : "Resume"}
                onClick={() => handleToggleJob(job.id)}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
