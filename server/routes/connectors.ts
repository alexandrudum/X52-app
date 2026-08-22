import { Router, Request, Response } from "express";

const router = Router();

interface Connector {
  id: string;
  name: string;
  type: "foundry" | "postgres" | "snowflake" | "kafka" | "s3";
  endpoint: string;
  status: "CONNECTED" | "DEGRADED" | "DISCONNECTED";
  latencyMs: number;
  lastTested: string;
}

let connectors: Connector[] = [
  {
    id: "conn-foundry-01",
    name: "Palantir Foundry Production Stack",
    type: "foundry",
    endpoint: "https://x52.palantirfoundry.com/api/v2",
    status: "CONNECTED",
    latencyMs: 14,
    lastTested: "1m ago",
  },
  {
    id: "conn-kafka-prod",
    name: "Real-Time Telemetry Kafka Broker",
    type: "kafka",
    endpoint: "kafka-cluster.x52.internal:9092",
    status: "CONNECTED",
    latencyMs: 2,
    lastTested: "30s ago",
  },
  {
    id: "conn-postgres-dw",
    name: "Enterprise Metadata PostgreSQL",
    type: "postgres",
    endpoint: "db-pg-main.x52.internal:5432/x52_meta",
    status: "CONNECTED",
    latencyMs: 5,
    lastTested: "3m ago",
  },
  {
    id: "conn-snowflake-lake",
    name: "Snowflake Analytics Warehouse",
    type: "snowflake",
    endpoint: "x52-org.snowflakecomputing.com",
    status: "CONNECTED",
    latencyMs: 42,
    lastTested: "12m ago",
  },
];

// GET /api/connectors
router.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, data: connectors });
});

// POST /api/connectors/test/:id
router.post("/test/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const connector = connectors.find((c) => c.id === id);

  if (!connector) {
    return res.status(404).json({ success: false, error: "Connector not found" });
  }

  // Simulate round-trip latency
  const simulatedLatency = Math.floor(2 + Math.random() * 20);
  connector.latencyMs = simulatedLatency;
  connector.lastTested = "Just now";
  connector.status = "CONNECTED";

  res.json({
    success: true,
    message: `Connection to ${connector.name} verified successfully.`,
    connector,
  });
});

// POST /api/connectors
router.post("/", (req: Request, res: Response) => {
  const { name, type, endpoint } = req.body;
  if (!name || !type || !endpoint) {
    return res.status(400).json({ success: false, error: "Missing required fields: name, type, endpoint" });
  }

  const newConn: Connector = {
    id: `conn-${Date.now()}`,
    name,
    type,
    endpoint,
    status: "CONNECTED",
    latencyMs: Math.floor(10 + Math.random() * 15),
    lastTested: "Just now",
  };

  connectors.push(newConn);
  res.status(201).json({ success: true, data: newConn });
});

export default router;
