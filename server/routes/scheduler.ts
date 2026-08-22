import { Router, Request, Response } from "express";

const router = Router();

interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  target: string;
  lastRun: string;
  status: "ACTIVE" | "PAUSED" | "RUNNING";
  lastDurationMs: number;
}

let jobs: ScheduledJob[] = [
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
];

// GET /api/scheduler/jobs
router.get("/jobs", (_req: Request, res: Response) => {
  res.json({ success: true, data: jobs });
});

// POST /api/scheduler/jobs/:id/run
router.post("/jobs/:id/run", (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return res.status(404).json({ success: false, error: "Job not found" });
  }

  job.status = "RUNNING";
  setTimeout(() => {
    job.status = "ACTIVE";
    job.lastRun = "Just now";
  }, 2000);

  res.json({ success: true, message: `Job ${job.name} execution triggered.`, job });
});

// POST /api/scheduler/jobs/:id/toggle
router.post("/jobs/:id/toggle", (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return res.status(404).json({ success: false, error: "Job not found" });
  }

  job.status = job.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
  res.json({ success: true, message: `Job status set to ${job.status}`, job });
});

export default router;
