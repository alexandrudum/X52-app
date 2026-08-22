import express from "express";
import cors from "cors";
import systemRouter from "./routes/system";
import servicesRouter from "./routes/services";
import storageRouter from "./routes/storage";
import schedulerRouter from "./routes/scheduler";
import securityRouter from "./routes/security";
import governanceRouter from "./routes/governance";
import usersRouter from "./routes/users";
import tokensRouter from "./routes/tokens";
import connectorsRouter from "./routes/connectors";
import functionsRouter from "./routes/functions";
import logsRouter from "./routes/logs";
import pdfRouter from "./routes/pdf";
import ragRouter from "./routes/rag";
import ontologyRouter from "./routes/ontology";
import pipelinesRouter from "./routes/pipelines";
import compareRouter from "./routes/compare";
import { getRealSystemMetrics } from "./services/systemMonitor";
import { initStore } from "./db/store";

// Initialize persistent storage
initStore();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4000"] }));
app.use(express.json({ limit: "50mb" }));

// Mount Enterprise API routes
app.use("/api/system", systemRouter);
app.use("/api/services", servicesRouter);
app.use("/api/storage", storageRouter);
app.use("/api/scheduler", schedulerRouter);
app.use("/api/security", securityRouter);
app.use("/api/governance", governanceRouter);
app.use("/api/users", usersRouter);
app.use("/api/tokens", tokensRouter);
app.use("/api/connectors", connectorsRouter);
app.use("/api/functions", functionsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/rag", ragRouter);
app.use("/api/ontology", ontologyRouter);
app.use("/api/pipelines", pipelinesRouter);
app.use("/api/compare", compareRouter);

// Master Health Check
app.get("/api/health", (_req, res) => {
  const metrics = getRealSystemMetrics();
  res.json({
    status: "HEALTHY",
    service: "X52 Full Enterprise Backend Platform",
    version: "3.0.0-PROD",
    timestamp: new Date().toISOString(),
    uptimeSeconds: metrics.process.uptimeSeconds,
    memoryUsageMB: metrics.process.memoryUsageMB,
    cpuUsagePercent: metrics.cpuUsagePercent,
    nodeVersion: metrics.process.nodeVersion,
    activeRouters: [
      "system",
      "services",
      "storage",
      "scheduler",
      "security",
      "governance",
      "users",
      "tokens",
      "connectors",
      "functions",
      "logs",
      "pdf",
      "rag",
      "ontology",
      "pipelines",
      "compare",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`[X52-BACKEND] Enterprise Platform service listening on http://localhost:${PORT}`);
});
