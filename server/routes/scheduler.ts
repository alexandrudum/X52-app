import { Router } from "express";
import { getScheduledJobs, triggerJobManually, toggleJobStatus } from "../services/jobQueue";

const router = Router();

// GET /api/scheduler/jobs
router.get("/jobs", (_req, res) => {
  res.json({
    success: true,
    data: getScheduledJobs(),
  });
});

// POST /api/scheduler/trigger/:jobId
router.post("/trigger/:jobId", (req, res) => {
  const { jobId } = req.params;
  const result = triggerJobManually(jobId);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// POST /api/scheduler/toggle/:jobId
router.post("/toggle/:jobId", (req, res) => {
  const { jobId } = req.params;
  const result = toggleJobStatus(jobId);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

export default router;
