import React, { useState } from "react";
import {
  Button,
  Callout,
  Classes,
  Dialog,
  Elevation,
  FormGroup,
  HTMLSelect,
  HTMLTable,
  InputGroup,
  Intent,
  NonIdealState,
  Section,
  SectionCard,
  Tag,
} from "@blueprintjs/core";
import { StatusIndicator, type StatusTone } from "./StatusIndicator";

interface Connector {
  id: string;
  name: string;
  type: "foundry" | "postgres" | "snowflake" | "kafka" | "s3";
  endpoint: string;
  status: "CONNECTED" | "DEGRADED" | "DISCONNECTED";
  latencyMs: number;
  lastTested: string;
}

interface StatusBanner {
  intent: Intent;
  message: string;
}

interface ConnectorManagerProps {
  isDarkMode: boolean;
}

const STATUS_PRESENTATION: Record<Connector["status"], { tone: StatusTone; label: string }> = {
  CONNECTED: { tone: "success", label: "Connected" },
  DEGRADED: { tone: "warning", label: "Degraded" },
  DISCONNECTED: { tone: "danger", label: "Disconnected" },
};

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : "The connector API could not be reached.";

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
  const [showAddErrors, setShowAddErrors] = useState(false);
  const [banner, setBanner] = useState<StatusBanner | null>(null);

  const handleTestConnection = async (connector: Connector) => {
    setTestingId(connector.id);
    setBanner(null);
    try {
      const res = await fetch(`/api/connectors/test/${encodeURIComponent(connector.id)}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`Connector API responded ${res.status} ${res.statusText}`.trim());
      }
      const data = await res.json();
      if (data?.connector) {
        setConnectors((prev) => prev.map((c) => (c.id === connector.id ? data.connector : c)));
      }
      setBanner({
        intent: Intent.SUCCESS,
        message: `${connector.name} responded in ${data?.connector?.latencyMs ?? "—"} ms.`,
      });
    } catch (error) {
      // Mark the connector as unreachable rather than inventing a latency figure.
      setConnectors((prev) =>
        prev.map((c) => (c.id === connector.id ? { ...c, status: "DISCONNECTED" } : c)),
      );
      setBanner({
        intent: Intent.DANGER,
        message: `Connection test for ${connector.name} failed — ${describeError(error)}`,
      });
    } finally {
      setTestingId(null);
    }
  };

  const closeAddDialog = () => {
    setIsAddOpen(false);
    setShowAddErrors(false);
  };

  const handleAddConnector = () => {
    const name = newName.trim();
    const endpoint = newEndpoint.trim();
    if (!name || !endpoint) {
      setShowAddErrors(true);
      return;
    }
    const created: Connector = {
      id: `conn-${Date.now()}`,
      name,
      type: newType,
      endpoint,
      status: "CONNECTED",
      latencyMs: 12,
      lastTested: "Just now",
    };
    setConnectors((prev) => [created, ...prev]);
    closeAddDialog();
    setNewName("");
    setNewEndpoint("");
    setBanner({ intent: Intent.SUCCESS, message: `Registered new connector: ${created.name}.` });
  };

  const nameInvalid = showAddErrors && !newName.trim();
  const endpointInvalid = showAddErrors && !newEndpoint.trim();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)" }}>
      {banner && (
        <Callout
          intent={banner.intent}
          icon={banner.intent === Intent.DANGER ? "error" : "tick-circle"}
          compact
        >
          {banner.message}
        </Callout>
      )}

      <Section
        compact
        elevation={Elevation.ZERO}
        title="Data source & lakehouse connectors"
        subtitle="Endpoints for Foundry transforms, Kafka streams, and relational warehouses."
        rightElement={
          <Button
            intent={Intent.PRIMARY}
            icon="plus"
            text="Add connector"
            onClick={() => setIsAddOpen(true)}
          />
        }
      >
        <SectionCard padded={false}>
          {connectors.length === 0 ? (
            <NonIdealState
              icon="data-connection"
              title="No connectors configured"
              description="Register a Foundry, Kafka, PostgreSQL, Snowflake, or S3 endpoint to begin ingesting."
              action={
                <Button
                  variant="outlined"
                  icon="plus"
                  text="Add connector"
                  onClick={() => setIsAddOpen(true)}
                />
              }
              layout="horizontal"
            />
          ) : (
            <HTMLTable compact style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th scope="col">Connector</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    Latency
                  </th>
                  <th scope="col">Last tested</th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {connectors.map((connector) => {
                  const presentation = STATUS_PRESENTATION[connector.status];
                  return (
                    <tr key={connector.id} className="x52-table-row">
                      <td>
                        <div style={{ fontWeight: "var(--x52-fw-medium)" }}>{connector.name}</div>
                        <div
                          className="x52-numeric x52-muted"
                          style={{ fontSize: "var(--x52-fs-small)" }}
                        >
                          {connector.endpoint}
                        </div>
                      </td>
                      <td>
                        <Tag minimal>{connector.type.toUpperCase()}</Tag>
                      </td>
                      <td>
                        <StatusIndicator tone={presentation.tone} label={presentation.label} />
                      </td>
                      <td className="x52-numeric" style={{ textAlign: "right" }}>
                        {connector.latencyMs} ms
                      </td>
                      <td className="x52-muted">{connector.lastTested}</td>
                      <td style={{ textAlign: "right" }}>
                        <Button
                          variant="minimal"
                          size="small"
                          icon="refresh"
                          text="Test"
                          aria-label={`Test connection to ${connector.name}`}
                          loading={testingId === connector.id}
                          onClick={() => void handleTestConnection(connector)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </HTMLTable>
          )}
        </SectionCard>
      </Section>

      {/* Add connector dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={closeAddDialog}
        title="Configure new data source connector"
        className={isDarkMode ? Classes.DARK : undefined}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup
            label="Connector name"
            labelFor="conn-name"
            labelInfo="(required)"
            intent={nameInvalid ? Intent.DANGER : Intent.NONE}
            helperText={nameInvalid ? "A connector name is required." : undefined}
          >
            <InputGroup
              id="conn-name"
              placeholder="e.g. Production Foundry Gateway"
              intent={nameInvalid ? Intent.DANGER : Intent.NONE}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Connector type" labelFor="conn-type">
            <HTMLSelect
              id="conn-type"
              value={newType}
              onChange={(e) => setNewType(e.target.value as Connector["type"])}
              fill
            >
              <option value="foundry">Palantir Foundry (REST / Ontology)</option>
              <option value="kafka">Apache Kafka (high-throughput stream)</option>
              <option value="postgres">PostgreSQL database</option>
              <option value="snowflake">Snowflake cloud data warehouse</option>
              <option value="s3">AWS S3 / lakehouse storage</option>
            </HTMLSelect>
          </FormGroup>

          <FormGroup
            label="Endpoint URI / host"
            labelFor="conn-endpoint"
            labelInfo="(required)"
            intent={endpointInvalid ? Intent.DANGER : Intent.NONE}
            helperText={endpointInvalid ? "An endpoint URI or host is required." : undefined}
          >
            <InputGroup
              id="conn-endpoint"
              placeholder="e.g. https://foundry.corp.net/api"
              intent={endpointInvalid ? Intent.DANGER : Intent.NONE}
              value={newEndpoint}
              onChange={(e) => setNewEndpoint(e.target.value)}
            />
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button variant="minimal" text="Cancel" onClick={closeAddDialog} />
            <Button intent={Intent.PRIMARY} text="Register connector" onClick={handleAddConnector} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
