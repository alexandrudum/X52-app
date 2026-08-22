import React, { useState } from "react";
import { Card, Elevation, Button, Tag, Intent, HTMLTable, Callout } from "@blueprintjs/core";
import type { ScheduledJobData } from "../types";

export const TaskSchedulerCategory: React.FC<{
  jobs: ScheduledJobData[];
  onRefresh: () => void;
}> = ({ jobs, onRefresh }) => {
  const [triggeringJobId, setTriggeringJobId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleTriggerJob = async (jobId: string) => {
    setTriggeringJobId(jobId);
    try {
      const res = await fetch(`http://localhost:4000/api/scheduler/trigger/${jobId}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message);
        onRefresh();
      }
    } catch (err) {
      console.error("Scheduler trigger error:", err);
    } finally {
      setTriggeringJobId(null);
    }
  };

  const handleToggleJob = async (jobId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/scheduler/toggle/${jobId}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        onRefresh();
      }
    } catch (err) {
      console.error("Scheduler toggle error:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {actionMessage && (
        <Callout
          intent={Intent.SUCCESS}
          icon="tick-circle"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>{actionMessage}</span>
          <Button variant="minimal" icon="cross" size="small" onClick={() => setActionMessage(null)} />
        </Callout>
      )}

      {/* Task Scheduler Jobs Table */}
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
              Background Task Scheduler &amp; Cron Engine
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Automated maintenance routines, index compactions, and diagnostic health pulses.
            </span>
          </div>
          <Button icon="refresh" variant="outlined" size="small" text="Refresh Jobs" onClick={onRefresh} />
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Job Name</th>
              <th>Category</th>
              <th>Cron Cadence</th>
              <th>Status</th>
              <th>Last Executed</th>
              <th>Duration</th>
              <th>Executions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <strong>{job.name}</strong>
                  <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}><code>{job.id}</code></div>
                </td>
                <td><Tag minimal>{job.category}</Tag></td>
                <td><code>{job.schedule}</code></td>
                <td>
                  <Tag
                    intent={job.status === "ACTIVE" ? Intent.SUCCESS : job.status === "RUNNING" ? Intent.PRIMARY : Intent.WARNING}
                    round
                    style={{ fontWeight: 800 }}
                  >
                    ● {job.status}
                  </Tag>
                </td>
                <td>
                  {job.lastRunTimestamp ? (
                    <span style={{ fontSize: "11px" }}>{new Date(job.lastRunTimestamp).toLocaleTimeString()}</span>
                  ) : (
                    <span style={{ color: "var(--x52-text-muted)" }}>Never</span>
                  )}
                </td>
                <td><code>{job.lastRunDurationMs ? `${job.lastRunDurationMs}ms` : "-"}</code></td>
                <td><strong>{job.executionCount.toLocaleString()}</strong></td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      icon="play"
                      intent={Intent.PRIMARY}
                      text="Run Now"
                      loading={triggeringJobId === job.id}
                      onClick={() => handleTriggerJob(job.id)}
                    />
                    <Button
                      size="small"
                      variant="minimal"
                      icon={job.status === "ACTIVE" ? "pause" : "play"}
                      text={job.status === "ACTIVE" ? "Pause" : "Resume"}
                      onClick={() => handleToggleJob(job.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>
    </div>
  );
};
