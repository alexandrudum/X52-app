import { logAuditEvent } from "./auditLogger";

export interface ScheduledJob {
  id: string;
  name: string;
  category: "MAINTENANCE" | "INDEXING" | "HEALTH" | "BACKUP";
  schedule: string;
  status: "ACTIVE" | "PAUSED" | "RUNNING";
  lastRunTimestamp: string | null;
  lastRunDurationMs: number | null;
  lastRunStatus: "SUCCESS" | "FAILED" | "SKIPPED" | null;
  executionCount: number;
}

const scheduledJobs: ScheduledJob[] = [
  {
    id: "JOB-HEALTH-PULSE",
    name: "System Health Heartbeat",
    category: "HEALTH",
    schedule: "Every 30 seconds",
    status: "ACTIVE",
    lastRunTimestamp: new Date().toISOString(),
    lastRunDurationMs: 12,
    lastRunStatus: "SUCCESS",
    executionCount: 1420,
  },
  {
    id: "JOB-PDF-CACHE-CLEANUP",
    name: "PDF Temp Cache Compaction",
    category: "MAINTENANCE",
    schedule: "Hourly at minute 0",
    status: "ACTIVE",
    lastRunTimestamp: new Date(Date.now() - 1800000).toISOString(),
    lastRunDurationMs: 45,
    lastRunStatus: "SUCCESS",
    executionCount: 48,
  },
  {
    id: "JOB-RAG-VECTOR-OPTIMIZE",
    name: "RAG Vector Index Optimization",
    category: "INDEXING",
    schedule: "Daily at 02:00 UTC",
    status: "ACTIVE",
    lastRunTimestamp: new Date(Date.now() - 43200000).toISOString(),
    lastRunDurationMs: 310,
    lastRunStatus: "SUCCESS",
    executionCount: 14,
  },
  {
    id: "JOB-AUDIT-ARCHIVE",
    name: "Audit Log Snapshot & Rotation",
    category: "BACKUP",
    schedule: "Daily at 00:00 UTC",
    status: "ACTIVE",
    lastRunTimestamp: new Date(Date.now() - 50400000).toISOString(),
    lastRunDurationMs: 88,
    lastRunStatus: "SUCCESS",
    executionCount: 14,
  },
];

export function getScheduledJobs(): ScheduledJob[] {
  return scheduledJobs;
}

export function triggerJobManually(jobId: string): { success: boolean; job: ScheduledJob | null; message: string } {
  const job = scheduledJobs.find((j) => j.id === jobId);
  if (!job) {
    return { success: false, job: null, message: `Job ${jobId} not found.` };
  }

  const startTime = Date.now();
  job.status = "RUNNING";

  // Simulate job work execution
  const duration = Math.floor(Math.random() * 80) + 20;
  job.lastRunTimestamp = new Date().toISOString();
  job.lastRunDurationMs = duration;
  job.lastRunStatus = "SUCCESS";
  job.executionCount += 1;
  job.status = "ACTIVE";

  logAuditEvent(
    "SCHEDULER",
    "MANUAL_JOB_TRIGGER",
    `Job [${job.name}] triggered manually and completed in ${duration}ms`,
    "INFO"
  );

  return { success: true, job, message: `Job ${job.name} completed successfully in ${duration}ms.` };
}

export function toggleJobStatus(jobId: string): { success: boolean; job: ScheduledJob | null } {
  const job = scheduledJobs.find((j) => j.id === jobId);
  if (!job) return { success: false, job: null };

  job.status = job.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
  logAuditEvent(
    "SCHEDULER",
    "JOB_STATUS_TOGGLED",
    `Job [${job.name}] status changed to ${job.status}`,
    "INFO"
  );

  return { success: true, job };
}
