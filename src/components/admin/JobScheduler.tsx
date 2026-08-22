import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Callout,
  Elevation,
  HTMLTable,
  Intent,
  NonIdealState,
  Section,
  SectionCard,
} from "@blueprintjs/core";
import { StatusIndicator, type StatusTone } from "./StatusIndicator";

interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  target: string;
  lastRun: string;
  status: "ACTIVE" | "PAUSED" | "RUNNING";
  lastDurationMs: number;
}

interface StatusBanner {
  intent: Intent;
  message: string;
}

interface JobSchedulerProps {
  isDarkMode: boolean;
}

const STATUS_PRESENTATION: Record<
  ScheduledJob["status"],
  { tone: StatusTone; label: string; live: boolean }
> = {
  ACTIVE: { tone: "success", label: "Active", live: false },
  RUNNING: { tone: "warning", label: "Running", live: true },
  PAUSED: { tone: "neutral", label: "Paused", live: false },
};

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : "The scheduler API could not be reached.";

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
  const [banner, setBanner] = useState<StatusBanner | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The "Running…" affordance is held briefly after the request settles; make
  // sure that timer cannot fire against an unmounted component.
  useEffect(
    () => () => {
      if (settleTimer.current !== null) clearTimeout(settleTimer.current);
    },
    [],
  );

  const handleRunJob = async (job: ScheduledJob) => {
    setRunningId(job.id);
    setBanner(null);
    try {
      const res = await fetch(`/api/scheduler/jobs/${encodeURIComponent(job.id)}/run`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`Scheduler API responded ${res.status} ${res.statusText}`.trim());
      }
      const data = await res.json();
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, lastRun: "Just now", status: "ACTIVE" } : j)),
      );
      setBanner({
        intent: Intent.SUCCESS,
        message:
          typeof data?.message === "string" ? data.message : `${job.name} execution triggered.`,
      });
    } catch (error) {
      // Leave the job row untouched — an unreachable scheduler did not run it.
      setBanner({
        intent: Intent.DANGER,
        message: `${job.name} could not be triggered — ${describeError(error)}`,
      });
    } finally {
      if (settleTimer.current !== null) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        settleTimer.current = null;
        setRunningId(null);
      }, 1000);
    }
  };

  const handleToggleJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, status: j.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : j,
      ),
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)" }}>
      {banner && (
        <Callout
          intent={banner.intent}
          icon={banner.intent === Intent.DANGER ? "error" : "tick-circle"}
          compact
        >
          {banner.message}
        </Callout>
      )}

      <Section
        compact
        elevation={Elevation.ZERO}
        title="Automated cron jobs & workflows"
        subtitle="Background sync jobs, snapshot triggers, and partition compaction schedules."
      >
        <SectionCard padded={false}>
          {jobs.length === 0 ? (
            <NonIdealState
              icon="time"
              title="No scheduled jobs"
              description="Nothing is registered on the control-plane scheduler."
              layout="horizontal"
            />
          ) : (
            <HTMLTable compact style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th scope="col">Job</th>
                  <th scope="col">Schedule</th>
                  <th scope="col">Target</th>
                  <th scope="col">Last run</th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    Duration
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const presentation = STATUS_PRESENTATION[job.status];
                  return (
                    <tr key={job.id} className="x52-table-row">
                      <td style={{ fontWeight: "var(--x52-fw-medium)" }}>{job.name}</td>
                      <td className="x52-numeric">{job.schedule}</td>
                      <td className="x52-numeric x52-muted">{job.target}</td>
                      <td className="x52-muted">{job.lastRun}</td>
                      <td className="x52-numeric" style={{ textAlign: "right" }}>
                        {job.lastDurationMs.toLocaleString()} ms
                      </td>
                      <td>
                        <StatusIndicator
                          tone={presentation.tone}
                          label={presentation.label}
                          live={presentation.live}
                        />
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <Button
                          variant="minimal"
                          size="small"
                          icon="play"
                          text="Run now"
                          aria-label={`Run ${job.name} now`}
                          loading={runningId === job.id}
                          onClick={() => void handleRunJob(job)}
                        />
                        <Button
                          variant="minimal"
                          size="small"
                          icon={job.status === "ACTIVE" ? "pause" : "play"}
                          text={job.status === "ACTIVE" ? "Pause" : "Resume"}
                          aria-label={
                            job.status === "ACTIVE"
                              ? `Pause schedule for ${job.name}`
                              : `Resume schedule for ${job.name}`
                          }
                          onClick={() => handleToggleJob(job.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </HTMLTable>
          )}
        </SectionCard>
      </Section>
    </div>
  );
};
