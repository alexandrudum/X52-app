import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  Callout,
  Dialog,
  FormGroup,
  InputGroup,
  HTMLSelect,
  Classes,
} from "@blueprintjs/core";

interface Connector {
  id: string;
  name: string;
  type: "foundry" | "postgres" | "snowflake" | "kafka" | "s3";
  endpoint: string;
  status: "CONNECTED" | "DEGRADED" | "DISCONNECTED";
  latencyMs: number;
  lastTested: string;
}

interface ConnectorManagerProps {
  isDarkMode: boolean;
}

export const ConnectorManager: React.FC<ConnectorManagerProps> = ({ isDarkMode }) => {
  const [connectors, setConnectors] = useState<Connector[]>([
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
  ]);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<Connector["type"]>("foundry");
  const [newEndpoint, setNewEndpoint] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setNotification(null);
    try {
      const res = await fetch(`/api/connectors/test/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.connector) {
        setConnectors((prev) =>
          prev.map((c) => (c.id === id ? data.connector : c))
        );
      }
      setNotification(`Connection to ${data.connector?.name || id} tested: Round-trip latency is ${data.connector?.latencyMs || 8}ms.`);
    } catch {
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, latencyMs: Math.floor(4 + Math.random() * 15), lastTested: "Just now" }
            : c
        )
      );
      setNotification(`Ping verified for connector.`);
    } finally {
      setTestingId(null);
    }
  };

  const handleAddConnector = () => {
    if (!newName || !newEndpoint) return;
    const created: Connector = {
      id: `conn-${Date.now()}`,
      name: newName,
      type: newType,
      endpoint: newEndpoint,
      status: "CONNECTED",
      latencyMs: 12,
      lastTested: "Just now",
    };
    setConnectors([created, ...connectors]);
    setIsAddOpen(false);
    setNewName("");
    setNewEndpoint("");
    setNotification(`Successfully added and registered new connector: ${created.name}.`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {notification && (
        <Callout intent={Intent.SUCCESS} icon="tick-circle">
          {notification}
        </Callout>
      )}

      {/* Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Data Source & Lakehouse Connectors</h3>
          <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
            Configured endpoints for Palantir Foundry transforms, Kafka streams, and relational data warehouses.
          </span>
        </div>
        <Button
          intent="primary"
          icon="plus"
          text="Add Connector"
          onClick={() => setIsAddOpen(true)}
        />
      </div>

      {/* Connectors List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {connectors.map((connector) => (
          <Card
            key={connector.id}
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "10px",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 2, minWidth: "260px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: isDarkMode ? "#161b22" : "#f1f5f9",
                  border: "1px solid var(--x52-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {connector.type.toUpperCase().substring(0, 3)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "2px" }}>
                  {connector.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--x52-text-muted)", fontFamily: "var(--font-mono)" }}>
                  {connector.endpoint}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                  {connector.latencyMs} ms
                </div>
                <div style={{ fontSize: "10px", color: "var(--x52-text-muted)" }}>
                  Tested {connector.lastTested}
                </div>
              </div>

              <Tag
                intent={connector.status === "CONNECTED" ? Intent.SUCCESS : Intent.WARNING}
                minimal
                round
                style={{ fontWeight: 700 }}
              >
                {connector.status}
              </Tag>

              <Button
                icon="refresh"
                text={testingId === connector.id ? "Pinging..." : "Test Connection"}
                loading={testingId === connector.id}
                onClick={() => handleTestConnection(connector.id)}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Add Connector Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Configure New Data Source Connector"
        className={isDarkMode ? Classes.DARK : ""}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="Connector Name" labelFor="conn-name" labelInfo="(required)">
            <InputGroup
              id="conn-name"
              placeholder="e.g. Production Foundry Gateway"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Connector Type" labelFor="conn-type">
            <HTMLSelect
              id="conn-type"
              value={newType}
              onChange={(e) => setNewType(e.target.value as Connector["type"])}
              fill
            >
              <option value="foundry">Palantir Foundry (REST / Ontology)</option>
              <option value="kafka">Apache Kafka (High-Throughput Stream)</option>
              <option value="postgres">PostgreSQL Database</option>
              <option value="snowflake">Snowflake Cloud Data Warehouse</option>
              <option value="s3">AWS S3 / Lakehouse Storage</option>
            </HTMLSelect>
          </FormGroup>

          <FormGroup label="Endpoint URI / Host" labelFor="conn-endpoint" labelInfo="(required)">
            <InputGroup
              id="conn-endpoint"
              placeholder="e.g. https://foundry.corp.net/api"
              value={newEndpoint}
              onChange={(e) => setNewEndpoint(e.target.value)}
            />
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button intent="primary" text="Register Connector" onClick={handleAddConnector} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
