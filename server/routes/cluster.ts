import { Router, Request, Response } from "express";

const router = Router();

// In-memory cluster state
let clusterState = {
  totalNodes: 52,
  activeNodes: 52,
  allocatedMemoryGB: 512,
  usedMemoryGB: 214,
  cpuThrottlePercent: 85,
  nodes: Array.from({ length: 52 }, (_, i) => ({
    id: `N-${(i + 1).toString().padStart(2, "0")}`,
    name: `Compute Worker ${(i + 1).toString().padStart(2, "0")}`,
    ip: `10.52.0.${10 + i}`,
    status: "ONLINE",
    cpuUsage: Math.floor(20 + Math.random() * 50),
    memoryUsage: Math.floor(30 + Math.random() * 40),
    uptime: "18d 14h",
  })),
};

// GET /api/cluster/status
router.get("/status", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: clusterState,
    timestamp: new Date().toISOString(),
  });
});

// POST /api/cluster/scale
router.post("/scale", (req: Request, res: Response) => {
  const { activeNodes, cpuThrottlePercent } = req.body;
  if (typeof activeNodes === "number" && activeNodes >= 1 && activeNodes <= 52) {
    clusterState.activeNodes = activeNodes;
  }
  if (typeof cpuThrottlePercent === "number" && cpuThrottlePercent >= 10 && cpuThrottlePercent <= 100) {
    clusterState.cpuThrottlePercent = cpuThrottlePercent;
  }

  res.json({
    success: true,
    message: `Cluster reconfigured: ${clusterState.activeNodes} nodes active at ${clusterState.cpuThrottlePercent}% throttle.`,
    data: clusterState,
  });
});

// POST /api/cluster/node/:id/restart
router.post("/node/:id/restart", (req: Request, res: Response) => {
  const { id } = req.params;
  const node = clusterState.nodes.find((n) => n.id === id);

  if (!node) {
    return res.status(404).json({ success: false, error: "Node not found" });
  }

  node.status = "REBOOTING";
  setTimeout(() => {
    node.status = "ONLINE";
    node.cpuUsage = Math.floor(15 + Math.random() * 20);
  }, 3000);

  res.json({
    success: true,
    message: `Restart signal sent to ${id}.`,
    node,
  });
});

// POST /api/cluster/purge-cache
router.post("/purge-cache", (_req: Request, res: Response) => {
  clusterState.usedMemoryGB = 128;
  res.json({
    success: true,
    message: "Cluster cache successfully purged across 52 partitions.",
    usedMemoryGB: clusterState.usedMemoryGB,
  });
});

export default router;
