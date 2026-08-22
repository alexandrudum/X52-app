import { Router } from "express";
import { getRealSystemMetrics } from "../services/systemMonitor";

const router = Router();

// GET /api/system/metrics - Returns 100% genuine OS, CPU, RAM, and Process stats
router.get("/metrics", (_req, res) => {
  try {
    const metrics = getRealSystemMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to collect system metrics";
    res.status(500).json({ success: false, error: msg });
  }
});

export default router;
