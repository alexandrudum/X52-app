import express from "express";
import cors from "cors";
import clusterRouter from "./routes/cluster";
import connectorsRouter from "./routes/connectors";
import securityRouter from "./routes/security";
import schedulerRouter from "./routes/scheduler";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use("/api/cluster", clusterRouter);
app.use("/api/connectors", connectorsRouter);
app.use("/api/security", securityRouter);
app.use("/api/scheduler", schedulerRouter);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "HEALTHY",
    service: "X52 Backend Control Service",
    version: "0.0.1",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});

app.listen(PORT, () => {
  console.log(`[X52-BACKEND] Control Panel service listening on http://localhost:${PORT}`);
});
