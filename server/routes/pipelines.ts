import { Router } from "express";
import { logAuditEvent } from "../services/auditLogger";

const router = Router();

export interface PipelineStage {
  id: string;
  name: string;
  type: "EXTRACT" | "TRANSFORM" | "VALIDATE" | "LOAD";
  status: "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";
  durationMs: number;
}

export interface PipelineRecord {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: "ACTIVE" | "PAUSED" | "RUNNING";
  lastRun: string;
  stages: PipelineStage[];
}

let pipelines: PipelineRecord[] = [
  {
    id: "PIPE-AIRBUS-INGEST",
    name: "Airbus PDF Delta Extraction & Vector Index Pipeline",
    description: "Extracts paragraph tokens from raw service bulletins, computes cosine deltas, and populates vector index.",
    schedule: "Every 15 Minutes",
    status: "ACTIVE",
    lastRun: new Date(Date.now() - 600000).toISOString(),
    stages: [
      { id: "stg-1", name: "PDF Binary Ingestion & Adobe CMap Decoding", type: "EXTRACT", status: "COMPLETED", durationMs: 420 },
      { id: "stg-2", name: "Semantic Paragraph Chunking & Risk Scoring", type: "TRANSFORM", status: "COMPLETED", durationMs: 850 },
      { id: "stg-3", name: "FedRAMP Cryptographic Hash Verification", type: "VALIDATE", status: "COMPLETED", durationMs: 120 },
      { id: "stg-4", name: "Ontology Object Hydration (A320 Fleet)", type: "LOAD", status: "COMPLETED", durationMs: 310 },
    ],
  },
  {
    id: "PIPE-SLA-COMPLIANCE",
    name: "SLA Guarantee & Contract Liability Scanner",
    description: "Evaluates contract penalty clauses, compound escalator terms, and uptime commitments.",
    schedule: "Daily at 00:00 UTC",
    status: "ACTIVE",
    lastRun: new Date(Date.now() - 86400000).toISOString(),
    stages: [
      { id: "stg-1", name: "Scan Contract PDF Text", type: "EXTRACT", status: "COMPLETED", durationMs: 250 },
      { id: "stg-2", name: "Calculate 5-Year Financial Exposure", type: "TRANSFORM", status: "COMPLETED", durationMs: 180 },
      { id: "stg-3", name: "Publish to Compliance Dashboard", type: "LOAD", status: "COMPLETED", durationMs: 90 },
    ],
  },
];

// GET /api/pipelines
router.get("/", (_req, res) => {
  res.json({ success: true, data: pipelines });
});

// POST /api/pipelines/run/:id (Execute DAG Workflow)
router.post("/run/:id", (req, res) => {
  const { id } = req.params;
  const pipe = pipelines.find((p) => p.id === id);

  if (!pipe) return res.status(404).json({ success: false, error: "Pipeline not found" });

  pipe.status = "RUNNING";
  pipe.lastRun = new Date().toISOString();

  // Simulate stage completion
  pipe.stages.forEach((stg) => {
    stg.status = "COMPLETED";
    stg.durationMs = Math.floor(Math.random() * 300) + 100;
  });

  pipe.status = "ACTIVE";
  const totalDuration = pipe.stages.reduce((acc, s) => acc + s.durationMs, 0);

  logAuditEvent(
    "PIPELINE",
    "PIPELINE_DAG_EXECUTED",
    `Pipeline [${pipe.name}] executed successfully across ${pipe.stages.length} stages (${totalDuration}ms)`,
    "INFO"
  );

  res.json({
    success: true,
    data: {
      pipelineId: pipe.id,
      name: pipe.name,
      status: "COMPLETED",
      totalDurationMs: totalDuration,
      stages: pipe.stages,
    },
  });
});

export default router;
