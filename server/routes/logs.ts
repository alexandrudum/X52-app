import { Router } from "express";

const router = Router();

export interface ServerLogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "SQL" | "HTTP";
  module: string;
  message: string;
}

const serverLogs: ServerLogEntry[] = [
  {
    id: "LOG-001",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    level: "INFO",
    module: "SERVER",
    message: "X52 Express Control Plane listening on http://localhost:4000",
  },
  {
    id: "LOG-002",
    timestamp: new Date(Date.now() - 45000).toISOString(),
    level: "HTTP",
    module: "GATEWAY",
    message: "GET /api/system/metrics - 200 OK (1.2ms)",
  },
  {
    id: "LOG-003",
    timestamp: new Date(Date.now() - 30000).toISOString(),
    level: "SQL",
    module: "ONTOLOGY",
    message: "SELECT * FROM service_bulletins WHERE version = 'Rev 16' (0.8ms)",
  },
  {
    id: "LOG-004",
    timestamp: new Date(Date.now() - 15000).toISOString(),
    level: "INFO",
    module: "PDF_WORKER",
    message: "Adobe CMap character map cache verified. 61 pages in memory buffer.",
  },
  {
    id: "LOG-005",
    timestamp: new Date().toISOString(),
    level: "INFO",
    module: "ZERO_TRUST",
    message: "PBAC session token validated for super.admin@defense.aero",
  },
];

// GET /api/logs/stream
router.get("/stream", (_req, res) => {
  // Add a heartbeat log entry
  if (Math.random() > 0.4) {
    const newEntry: ServerLogEntry = {
      id: `LOG-${String(serverLogs.length + 1).padStart(3, "0")}`,
      timestamp: new Date().toISOString(),
      level: Math.random() > 0.8 ? "SQL" : "HTTP",
      module: "TELEMETRY",
      message: `Heartbeat telemetry pulse dispatched (CPU: ${Math.floor(Math.random() * 10) + 12}%, Heap: ${Math.floor(Math.random() * 2) + 10}MB)`,
    };
    serverLogs.push(newEntry);
    if (serverLogs.length > 200) serverLogs.shift();
  }

  res.json({
    success: true,
    data: serverLogs,
  });
});

export default router;
