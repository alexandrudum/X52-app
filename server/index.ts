import express from "express";
import cors from "cors";
import systemRouter from "./routes/system";
import servicesRouter from "./routes/services";
import storageRouter from "./routes/storage";
import schedulerRouter from "./routes/scheduler";
import securityRouter from "./routes/security";
import governanceRouter from "./routes/governance";
import { getRealSystemMetrics } from "./services/systemMonitor";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4000"] }));
app.use(express.json());

// Mount API routes
app.use("/api/system", systemRouter);
app.use("/api/services", servicesRouter);
app.use("/api/storage", storageRouter);
app.use("/api/scheduler", schedulerRouter);
app.use("/api/security", securityRouter);
app.use("/api/governance", governanceRouter);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const metrics = getRealSystemMetrics();
  res.json({
    status: "HEALTHY",
    service: "X52 Backend Control Service",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: metrics.process.uptimeSeconds,
    memoryUsageMB: metrics.process.memoryUsageMB,
    cpuUsagePercent: metrics.cpuUsagePercent,
    nodeVersion: metrics.process.nodeVersion,
  });
});

app.listen(PORT, () => {
  console.log(`[X52-BACKEND] Control Panel service listening on http://localhost:${PORT}`);
});
