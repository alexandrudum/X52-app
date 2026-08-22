import React, { useState, useEffect } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  HTMLTable,
  Callout,
  InputGroup,
  Dialog,
  Classes,
  Icon,
} from "@blueprintjs/core";

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

export const ConnectorStudioTab: React.FC = () => {
  const [connectors, setConnectors] = useState<DataConnectorRecord[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Add Connector form
  const [name, setName] = useState("");
  const [type, setType] = useState<DataConnectorRecord["type"]>("POSTGRESQL");
  const [hostOrUri, setHostOrUri] = useState("");
  const [databaseOrBucket, setDatabaseOrBucket] = useState("");

  const fetchConnectors = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/connectors");
      const json = await res.json();
      if (json.success) setConnectors(json.data);
    } catch (err) {
      console.error("Fetch connectors error:", err);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, []);

  const handleAddConnector = async () => {
    if (!name.trim() || !hostOrUri.trim()) return;
    try {
      const res = await fetch("http://localhost:4000/api/connectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, hostOrUri, databaseOrBucket }),
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setName("");
        setHostOrUri("");
        setDatabaseOrBucket("");
        setActionMessage(`Data connector [${json.data.name}] mounted and online.`);
        fetchConnectors();
      }
    } catch (err) {
      console.error("Add connector error:", err);
    }
  };

  const handleTestConnection = async (id: string, connType: string, uri: string) => {
    setTestingId(id);
    try {
      const res = await fetch("http://localhost:4000/api/connectors/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: connType, hostOrUri: uri }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message);
      }
    } catch (err) {
      console.error("Test connection error:", err);
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {actionMessage && (
        <Callout
          intent={Intent.SUCCESS}
          icon="tick-circle"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>{actionMessage}</span>
          <Button variant="minimal" icon="cross" size="small" onClick={() => setActionMessage(null)} />
        </Callout>
      )}

      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
          Federated data source integrations for live batch syncing, change-data-capture (CDC), and streaming ingestion pipelines.
        </div>
        <Button
          intent={Intent.PRIMARY}
          icon="database"
          text="Mount New Data Connector"
          onClick={() => setIsAddOpen(true)}
        />
      </div>

      {/* Connectors Table */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon icon="exchange" color="var(--x52-accent)" />
              Active Data Source Connectors &amp; Warehouses
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              High-throughput drivers for SQL warehouses, S3 object stores, and Kafka event streams.
            </span>
          </div>
          <Tag round intent={Intent.SUCCESS}>{connectors.length} Active Connectors</Tag>
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Connector Name</th>
              <th>Protocol / Engine</th>
              <th>Host / Connection String</th>
              <th>Sync Frequency</th>
              <th>Ping Latency</th>
              <th>Records Ingested</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {connectors.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: "10px", color: "var(--x52-text-muted)" }}><code>{c.id}</code></div>
                </td>
                <td><Tag minimal intent={Intent.PRIMARY}>{c.type}</Tag></td>
                <td><code>{c.hostOrUri}</code></td>
                <td>{c.syncFrequency}</td>
                <td><code>{c.latencyMs}ms</code></td>
                <td><strong>{c.recordsIngested.toLocaleString()}</strong></td>
                <td>
                  <Tag
                    intent={c.status === "CONNECTED" ? Intent.SUCCESS : Intent.WARNING}
                    round
                    style={{ fontWeight: 800 }}
                  >
                    ● {c.status}
                  </Tag>
                </td>
                <td>
                  <Button
                    size="small"
                    variant="outlined"
                    icon="pulse"
                    text="Test Handshake"
                    loading={testingId === c.id}
                    onClick={() => handleTestConnection(c.id, c.type, c.hostOrUri)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      {/* Add Connector Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Mount Enterprise Data Source Connector"
        icon="database"
        style={{ width: "560px", backgroundColor: "var(--x52-card-bg)", color: "inherit" }}
      >
        <div className={Classes.DIALOG_BODY} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Connector Name</label>
            <InputGroup placeholder="e.g. Telemetry S3 Object Storage" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Engine Type</label>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
              {(["POSTGRESQL", "SNOWFLAKE", "AWS_S3", "KAFKA_STREAM", "LOCAL_POSIX"] as DataConnectorRecord["type"][]).map((t) => (
                <Button
                  key={t}
                  size="small"
                  active={type === t}
                  intent={type === t ? Intent.PRIMARY : Intent.NONE}
                  text={t.replace("_", " ")}
                  onClick={() => setType(t)}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Host Endpoint / Connection URI</label>
            <InputGroup
              placeholder={type === "AWS_S3" ? "s3://my-bucket-name" : "hostname.defense.internal:5432"}
              value={hostOrUri}
              onChange={(e) => setHostOrUri(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Database / Schema Name</label>
            <InputGroup placeholder="e.g. avionics_telemetry" value={databaseOrBucket} onChange={(e) => setDatabaseOrBucket(e.target.value)} />
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button text="Cancel" onClick={() => setIsAddOpen(false)} />
            <Button intent={Intent.PRIMARY} icon="database" text="Mount Connector" onClick={handleAddConnector} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
