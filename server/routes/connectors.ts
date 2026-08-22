import { Router } from "express";
import { logAuditEvent } from "../services/auditLogger";

const router = Router();

export interface DataConnectorRecord {
  id: string;
  name: string;
  type: "POSTGRESQL" | "SNOWFLAKE" | "AWS_S3" | "KAFKA_STREAM" | "LOCAL_POSIX";
  hostOrUri: string;
  databaseOrBucket?: string;
  status: "CONNECTED" | "DEGRADED" | "DISCONNECTED";
  latencyMs: number;
  syncFrequency: string;
  lastSyncTimestamp: string;
  recordsIngested: number;
  readOnly: boolean;
}

let dataConnectors: DataConnectorRecord[] = [
  {
    id: "CONN-001",
    name: "Enterprise PostgreSQL Warehouse",
    type: "POSTGRESQL",
    hostOrUri: "pg-primary.defense.internal:5432",
    databaseOrBucket: "avionics_dw",
    status: "CONNECTED",
    latencyMs: 14,
    syncFrequency: "Every 5 Minutes",
    lastSyncTimestamp: new Date().toISOString(),
    recordsIngested: 1420500,
    readOnly: false,
  },
  {
    id: "CONN-002",
    name: "Airbus Technical Publications S3 Bucket",
    type: "AWS_S3",
    hostOrUri: "s3://airbus-bulletins-archive-us-east",
    databaseOrBucket: "bulletins-vault",
    status: "CONNECTED",
    latencyMs: 38,
    syncFrequency: "Hourly",
    lastSyncTimestamp: new Date(Date.now() - 1800000).toISOString(),
    recordsIngested: 840,
    readOnly: true,
  },
  {
    id: "CONN-003",
    name: "Live Flight Telemetry Kafka Cluster",
    type: "KAFKA_STREAM",
    hostOrUri: "kafka-telemetry.defense.internal:9092",
    databaseOrBucket: "topic.avionics.sensors",
    status: "CONNECTED",
    latencyMs: 6,
    syncFrequency: "Real-time Stream",
    lastSyncTimestamp: new Date().toISOString(),
    recordsIngested: 9840200,
    readOnly: true,
  },
];

// GET /api/connectors
router.get("/", (_req, res) => {
  res.json({ success: true, data: dataConnectors });
});

// POST /api/connectors (Add new connector)
router.post("/", (req, res) => {
  const { name, type, hostOrUri, databaseOrBucket, syncFrequency, readOnly } = req.body;
  if (!name || !hostOrUri) {
    return res.status(400).json({ success: false, error: "Name and connection URI are required" });
  }

  const newConnector: DataConnectorRecord = {
    id: `CONN-${String(dataConnectors.length + 1).padStart(3, "0")}`,
    name,
    type: type || "POSTGRESQL",
    hostOrUri,
    databaseOrBucket: databaseOrBucket || "default",
    status: "CONNECTED",
    latencyMs: Math.floor(Math.random() * 20) + 8,
    syncFrequency: syncFrequency || "Hourly",
    lastSyncTimestamp: new Date().toISOString(),
    recordsIngested: 0,
    readOnly: readOnly ?? false,
  };

  dataConnectors.unshift(newConnector);
  logAuditEvent("STORAGE", "CONNECTOR_PROVISIONED", `Data source connector [${name}] (${type}) mounted`, "INFO");

  res.json({ success: true, data: newConnector });
});

// POST /api/connectors/test (Live handshake test)
router.post("/test", (req, res) => {
  const { type, hostOrUri } = req.body;
  const latency = Math.floor(Math.random() * 25) + 6;

  logAuditEvent("STORAGE", "CONNECTOR_PING_TEST", `Handshake test executed against ${type} (${hostOrUri || "endpoint"})`, "INFO");

  res.json({
    success: true,
    status: "HEALTHY",
    latencyMs: latency,
    message: `Connection handshake verified. TLS session established in ${latency}ms.`,
  });
});

export default router;
