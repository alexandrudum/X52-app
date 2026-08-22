import { useState, type CSSProperties, type ReactNode } from "react";
import {
  Button,
  ButtonGroup,
  Callout,
  Card,
  Divider,
  Drawer,
  DrawerSize,
  Elevation,
  HTMLTable,
  InputGroup,
  Intent,
  NonIdealState,
  Position,
  ProgressBar,
  SegmentedControl,
  Tab,
  Tabs,
  Tag,
  Tooltip,
} from "@blueprintjs/core";
import { X52BrandMark } from "./components/X52BrandMark";
import { Sparkline } from "./components/Sparkline";
import { BackendControlPanel } from "./components/admin/BackendControlPanel";

interface Pipeline {
  id: string;
  name: string;
  status: "ONLINE" | "SYNCING" | "STABLE" | "STANDBY" | "ERROR";
  intent: Intent;
  throughput: string;
  latency: string;
  time: string;
  load: number;
  records: string;
  nodes: number;
}

interface DashboardProps {
  isDarkMode: boolean;
  isStandalone?: boolean;
}

/** Base surface: a 1px border and a background step, never a drop shadow.
    Blueprint's own elevation-0 ring is suppressed so the edge stays 1px. */
const panelStyle: CSSProperties = {
  backgroundColor: "var(--x52-card-bg)",
  border: "1px solid var(--x52-border-subtle)",
  borderRadius: "var(--x52-radius)",
  boxShadow: "none",
};

/** Visually hidden but announced — Blueprint v6 ships no utility for this. */
const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

/**
 * Status colour is never the only signal: the dot is always rendered next to
 * its literal status text. SYNCING has no dedicated modifier in the shared
 * stylesheet, so it borrows the primary intent token and the live pulse.
 */
function statusDot(status: Pipeline["status"]): { className: string; style?: CSSProperties } {
  switch (status) {
    case "ONLINE":
      return { className: "x52-status-dot x52-status-dot--success" };
    case "SYNCING":
      return {
        className: "x52-status-dot x52-status-dot--live",
        style: { backgroundColor: "var(--x52-intent-primary)", color: "var(--x52-intent-primary)" },
      };
    case "STANDBY":
      return { className: "x52-status-dot x52-status-dot--warning" };
    case "ERROR":
      return { className: "x52-status-dot x52-status-dot--danger" };
    default:
      return { className: "x52-status-dot" };
  }
}

function StatusCell({ status }: { status: Pipeline["status"] }) {
  const dot = statusDot(status);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
      <span className={dot.className} style={dot.style} />
      <span style={{ fontSize: "var(--x52-fs-small)", fontWeight: "var(--x52-fw-medium)" }}>
        {status}
      </span>
    </span>
  );
}

/**
 * One telemetry tile. Figures use `.x52-numeric` so the four tiles' digits
 * sit on a shared baseline grid; the trend line is a single chart hue rather
 * than four decorative ones.
 */
function MetricTile({
  label,
  value,
  unit,
  note,
  data,
}: {
  label: string;
  value: string;
  unit: string;
  note: ReactNode;
  data: number[];
}) {
  return (
    <Card
      elevation={Elevation.ZERO}
      style={{
        ...panelStyle,
        padding: "var(--x52-space-4)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "var(--x52-space-3)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div className="x52-label">{label}</div>
        <div
          className="x52-numeric"
          style={{
            fontSize: "var(--x52-fs-h3)",
            fontWeight: "var(--x52-fw-bold)",
            lineHeight: 1.1,
            color: "var(--x52-heading)",
            margin: "var(--x52-space-2) 0 var(--x52-space-1)",
          }}
        >
          {value}
          <span
            style={{
              fontSize: "var(--x52-fs-base)",
              fontWeight: "var(--x52-fw-normal)",
              color: "var(--x52-text-muted)",
              marginLeft: "var(--x52-space-1)",
            }}
          >
            {unit}
          </span>
        </div>
        <div className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
          {note}
        </div>
      </div>
      <Sparkline data={data} width={104} height={40} />
    </Card>
  );
}

const LOG_LEVEL_INTENT: Record<string, Intent> = {
  SUCCESS: Intent.SUCCESS,
  WARN: Intent.WARNING,
  ERROR: Intent.DANGER,
};

export default function Dashboard({ isDarkMode, isStandalone = false }: DashboardProps) {
  const [viewMode, setViewMode] = useState<"operations" | "backend">("operations");
  const [activeTab, setActiveTab] = useState<string>("pipelines");
  const [filterText, setFilterText] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  const [pipelines] = useState<Pipeline[]>([
    {
      id: "PL-X52-091",
      name: "High-Throughput Telemetry Ingestion",
      status: "ONLINE",
      intent: Intent.SUCCESS,
      throughput: "48.2 GB/s",
      latency: "2.1 ms",
      time: "2s ago",
      load: 0.82,
      records: "14.2M / sec",
      nodes: 16,
    },
    {
      id: "PL-X52-084",
      name: "Palantir Foundry Core Sync Engine",
      status: "SYNCING",
      intent: Intent.PRIMARY,
      throughput: "36.4 GB/s",
      latency: "4.8 ms",
      time: "12s ago",
      load: 0.48,
      records: "8.9M / sec",
      nodes: 12,
    },
    {
      id: "PL-X52-077",
      name: "Graph Analytics Matrix Cluster",
      status: "STABLE",
      intent: Intent.NONE,
      throughput: "24.1 GB/s",
      latency: "3.5 ms",
      time: "1m ago",
      load: 0.65,
      records: "5.1M / sec",
      nodes: 8,
    },
    {
      id: "PL-X52-063",
      name: "Real-Time Event Stream Bridge",
      status: "STANDBY",
      intent: Intent.WARNING,
      throughput: "12.0 GB/s",
      latency: "1.9 ms",
      time: "4m ago",
      load: 0.18,
      records: "2.4M / sec",
      nodes: 6,
    },
    {
      id: "PL-X52-052",
      name: "Vector Embeddings & Semantic Index",
      status: "ONLINE",
      intent: Intent.SUCCESS,
      throughput: "27.5 GB/s",
      latency: "5.2 ms",
      time: "6m ago",
      load: 0.74,
      records: "7.8M / sec",
      nodes: 10,
    },
  ]);

  const [logs, setLogs] = useState([
    { time: "21:16:02", level: "INFO", src: "X52-INGEST-01", msg: "Batch ingestion buffer flushed (48,200 records)." },
    { time: "21:16:08", level: "SUCCESS", src: "FOUNDRY-SYNC", msg: "Ontology delta synced with Palantir Foundry cluster." },
    { time: "21:16:14", level: "INFO", src: "X52-NODE-24", msg: "Rebalancing partition 14 across node replicas." },
    { time: "21:16:21", level: "WARN", src: "STREAM-BRIDGE", msg: "Latency spike detected on upstream Kafka broker (3.4ms)." },
    { time: "21:16:30", level: "SUCCESS", src: "SECURITY-AUDIT", msg: "Cryptographic telemetry attestation verified." },
  ]);

  const handleTriggerIngestion = () => {
    setIsIngesting(true);
    setTimeout(() => {
      setIsIngesting(false);
      setLastSyncTime("A few seconds ago");
      setLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          level: "SUCCESS",
          src: "MANUAL-TRIGGER",
          msg: "Manual telemetry ingestion cycle completed across 52 nodes.",
        },
        ...prev,
      ]);
    }, 1200);
  };

  const filteredPipelines = pipelines.filter(
    (p) =>
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      p.id.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)", width: "100%" }}>
      {/* Page toolbar. The suite shell owns app switching and the theme
          control; this row only carries console-level identity and actions. */}
      <Card elevation={Elevation.ZERO} style={{ ...panelStyle, padding: "var(--x52-space-4)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--x52-space-4)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-3)", minWidth: "280px" }}>
            {/* Standalone deployments have no shell branding above them. */}
            {isStandalone && <X52BrandMark size={40} isDarkMode={isDarkMode} />}
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "var(--x52-fs-h4)",
                  fontWeight: "var(--x52-fw-bold)",
                  color: "var(--x52-heading)",
                  lineHeight: 1.2,
                }}
              >
                X52 Operational Intelligence Console
              </h1>
              <p
                className="x52-muted"
                style={{ margin: "var(--x52-space-1) 0 0", fontSize: "var(--x52-fs-small)" }}
              >
                High-density telemetry orchestrator and real-time analytical pipeline gateway.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
            <Button
              intent={Intent.PRIMARY}
              icon="refresh"
              text={isIngesting ? "Ingesting" : "Trigger ingestion"}
              loading={isIngesting}
              onClick={handleTriggerIngestion}
            />
            <Button variant="outlined" icon="cloud-download" text="Export metrics" />
            <Tooltip content="Console settings" placement="bottom-end">
              <Button variant="minimal" icon="cog" aria-label="Console settings" />
            </Tooltip>
          </div>
        </div>

        <Divider style={{ margin: "var(--x52-space-3) 0" }} />

        {/* Cluster status strip: every colour here is paired with a literal. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--x52-space-4)",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--x52-space-4)",
              flexWrap: "wrap",
              fontSize: "var(--x52-fs-small)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
              <span className="x52-status-dot x52-status-dot--success x52-status-dot--live" />
              <span className="x52-numeric">52 / 52</span>
              <span className="x52-muted">nodes active</span>
            </span>
            <span className="x52-muted">
              Cluster <span className="x52-numeric">US-EAST / PROD</span>
            </span>
            <span className="x52-muted">
              Last synchronized: <span style={{ color: "var(--x52-text)" }}>{lastSyncTime}</span>
            </span>
            <Tag minimal>Foundry ready</Tag>
          </div>

          <SegmentedControl
            aria-label="Console view"
            size="small"
            options={[
              { label: "Operations", value: "operations" },
              { label: "Backend control", value: "backend" },
            ]}
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "operations" | "backend")}
          />
        </div>
      </Card>

      {viewMode === "backend" ? (
        <BackendControlPanel isDarkMode={isDarkMode} />
      ) : (
        <>
          {/* Telemetry tiles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "var(--x52-space-4)",
            }}
          >
            <MetricTile
              label="Aggregate throughput"
              value="148.2"
              unit="GB/s"
              note="+12.4% against the prior peak"
              data={[24, 38, 30, 45, 42, 60, 55, 78, 85, 92]}
            />
            <MetricTile
              label="Active compute nodes"
              value="52"
              unit="/ 52"
              note="All replicas reporting healthy"
              data={[52, 52, 51, 52, 52, 52, 52, 52, 52, 52]}
            />
            <MetricTile
              label="P99 ingestion latency"
              value="3.8"
              unit="ms"
              note="0.8 ms faster than the prior window"
              data={[8.2, 7.5, 6.1, 5.4, 4.9, 4.2, 4.0, 3.8, 3.9, 3.8]}
            />
            <MetricTile
              label="Cluster memory load"
              value="41.8"
              unit="%"
              note="Within optimal band (512 GB)"
              data={[35, 38, 42, 40, 44, 41, 43, 40, 42, 41.8]}
            />
          </div>

          {/* Workstation panel */}
          <Card elevation={Elevation.ZERO} style={{ ...panelStyle, padding: "var(--x52-space-4)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "var(--x52-space-4)",
                flexWrap: "wrap",
              }}
            >
              <Tabs
                id="dashboard-tabs"
                selectedTabId={activeTab}
                onChange={(id) => setActiveTab(id.toString())}
              >
                <Tab id="pipelines" title="Data pipelines" tagContent={pipelines.length} />
                <Tab id="nodes" title="Compute matrix" tagContent={52} />
                <Tab id="logs" title="Event stream" tagContent={logs.length} />
              </Tabs>

              {activeTab === "pipelines" && (
                <div style={{ width: "260px", maxWidth: "100%" }}>
                  <InputGroup
                    leftIcon="search"
                    size="small"
                    aria-label="Filter pipelines by name or identifier"
                    placeholder="Filter by name or PL-ID"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    rightElement={
                      filterText ? (
                        <Button
                          variant="minimal"
                          size="small"
                          icon="cross"
                          aria-label="Clear pipeline filter"
                          onClick={() => setFilterText("")}
                        />
                      ) : undefined
                    }
                  />
                </div>
              )}
            </div>

            <Divider style={{ margin: "var(--x52-space-3) 0" }} />

            {/* TAB 1 — pipelines */}
            {activeTab === "pipelines" &&
              (filteredPipelines.length === 0 ? (
                <NonIdealState
                  icon="search"
                  layout="horizontal"
                  title="No matching pipelines"
                  description={`Nothing matches the filter "${filterText}".`}
                  action={
                    <Button variant="minimal" text="Clear filter" onClick={() => setFilterText("")} />
                  }
                />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <HTMLTable compact interactive style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th scope="col">Pipeline</th>
                        <th scope="col">Stream</th>
                        <th scope="col">Load</th>
                        <th scope="col" style={{ textAlign: "right" }}>
                          Throughput
                        </th>
                        <th scope="col" style={{ textAlign: "right" }}>
                          P99
                        </th>
                        <th scope="col">Status</th>
                        <th scope="col">
                          <span style={srOnly}>Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPipelines.map((pipeline) => (
                        <tr key={pipeline.id} onClick={() => setSelectedPipeline(pipeline)}>
                          <th
                            scope="row"
                            className="x52-numeric"
                            style={{ whiteSpace: "nowrap", fontWeight: "var(--x52-fw-bold)" }}
                          >
                            {pipeline.id}
                          </th>
                          <td style={{ minWidth: "220px" }}>
                            <div style={{ fontWeight: "var(--x52-fw-medium)" }}>{pipeline.name}</div>
                            <div className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
                              {pipeline.records} · {pipeline.nodes} nodes · updated {pipeline.time}
                            </div>
                          </td>
                          <td style={{ minWidth: "140px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "var(--x52-space-2)",
                                marginBottom: "var(--x52-space-1)",
                              }}
                            >
                              <span className="x52-label">Load</span>
                              <span className="x52-numeric" style={{ fontSize: "var(--x52-fs-small)" }}>
                                {Math.round(pipeline.load * 100)}%
                              </span>
                            </div>
                            {/* Meter intent tracks saturation, not status — the
                                status column already carries the state. */}
                            <ProgressBar
                              intent={pipeline.load >= 0.8 ? Intent.WARNING : Intent.NONE}
                              value={pipeline.load}
                              animate={false}
                              stripes={false}
                            />
                          </td>
                          <td className="x52-numeric" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            {pipeline.throughput}
                          </td>
                          <td
                            className="x52-numeric x52-muted"
                            style={{ textAlign: "right", whiteSpace: "nowrap" }}
                          >
                            {pipeline.latency}
                          </td>
                          <td>
                            <StatusCell status={pipeline.status} />
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <Button
                              variant="minimal"
                              size="small"
                              icon="chevron-right"
                              aria-label={`Open details for ${pipeline.name}`}
                              onClick={() => setSelectedPipeline(pipeline)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </HTMLTable>
                </div>
              ))}

            {/* TAB 2 — 52-node compute matrix */}
            {activeTab === "nodes" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "var(--x52-space-4)",
                    marginBottom: "var(--x52-space-3)",
                    flexWrap: "wrap",
                  }}
                >
                  <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
                    Grid representation of all 52 worker nodes in cluster{" "}
                    <span className="x52-numeric">X-52</span>.
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--x52-space-2)", fontSize: "var(--x52-fs-small)" }}>
                    <span className="x52-status-dot x52-status-dot--success" />
                    All 52 nodes synchronized
                  </span>
                </div>
                <ul
                  aria-label="Compute node status"
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: "var(--x52-space-3)",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))",
                    gap: "var(--x52-space-2)",
                    backgroundColor: "var(--x52-card-secondary)",
                    border: "1px solid var(--x52-border-subtle)",
                    borderRadius: "var(--x52-radius)",
                  }}
                >
                  {Array.from({ length: 52 }, (_, i) => {
                    const nodeNum = (i + 1).toString().padStart(2, "0");
                    const isHighLoad = i === 7 || i === 23;
                    return (
                      <li
                        key={nodeNum}
                        style={{
                          padding: "var(--x52-space-2)",
                          textAlign: "center",
                          backgroundColor: "var(--x52-card-bg)",
                          border: `1px solid ${
                            isHighLoad ? "var(--x52-intent-warning)" : "var(--x52-border-subtle)"
                          }`,
                          borderRadius: "var(--x52-radius)",
                        }}
                      >
                        <div
                          className="x52-numeric"
                          style={{ fontSize: "var(--x52-fs-small)", fontWeight: "var(--x52-fw-bold)" }}
                        >
                          N-{nodeNum}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "var(--x52-space-1)",
                            marginTop: "var(--x52-space-1)",
                          }}
                        >
                          <span
                            className={`x52-status-dot ${
                              isHighLoad ? "x52-status-dot--warning" : "x52-status-dot--success"
                            }`}
                          />
                          <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
                            {isHighLoad ? "High" : "OK"}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* TAB 3 — live event stream */}
            {activeTab === "logs" && (
              <div
                style={{
                  maxHeight: "320px",
                  overflowY: "auto",
                  backgroundColor: "var(--x52-card-secondary)",
                  border: "1px solid var(--x52-border-subtle)",
                  borderRadius: "var(--x52-radius)",
                }}
              >
                <HTMLTable compact style={{ width: "100%" }}>
                  <caption style={srOnly}>Live cluster event stream</caption>
                  <thead>
                    <tr>
                      <th scope="col" style={{ position: "sticky", top: 0, backgroundColor: "var(--x52-card-secondary)" }}>
                        Time
                      </th>
                      <th scope="col" style={{ position: "sticky", top: 0, backgroundColor: "var(--x52-card-secondary)" }}>
                        Level
                      </th>
                      <th scope="col" style={{ position: "sticky", top: 0, backgroundColor: "var(--x52-card-secondary)" }}>
                        Source
                      </th>
                      <th scope="col" style={{ position: "sticky", top: 0, backgroundColor: "var(--x52-card-secondary)" }}>
                        Event
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={`${log.time}-${index}`}>
                        <td className="x52-numeric x52-muted" style={{ whiteSpace: "nowrap" }}>
                          {log.time}
                        </td>
                        <td>
                          <Tag minimal intent={LOG_LEVEL_INTENT[log.level] ?? Intent.NONE}>
                            {log.level}
                          </Tag>
                        </td>
                        <td className="x52-numeric" style={{ whiteSpace: "nowrap" }}>
                          {log.src}
                        </td>
                        <td>{log.msg}</td>
                      </tr>
                    ))}
                  </tbody>
                </HTMLTable>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Pipeline detail drawer — a genuine overlay, so it keeps its elevation. */}
      <Drawer
        isOpen={selectedPipeline !== null}
        onClose={() => setSelectedPipeline(null)}
        title={selectedPipeline ? `${selectedPipeline.name} (${selectedPipeline.id})` : "Pipeline details"}
        position={Position.RIGHT}
        size={DrawerSize.SMALL}
      >
        {selectedPipeline && (
          <div
            style={{
              padding: "var(--x52-space-4)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--x52-space-4)",
            }}
          >
            <Callout intent={selectedPipeline.intent} title={`Status: ${selectedPipeline.status}`}>
              This pipeline is actively processing streaming records with{" "}
              {selectedPipeline.throughput} of bandwidth.
            </Callout>

            <div>
              <h2 className="x52-label" style={{ margin: "0 0 var(--x52-space-2)" }}>
                Pipeline specifications
              </h2>
              <HTMLTable compact style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th scope="row" className="x52-muted" style={{ fontWeight: "var(--x52-fw-normal)" }}>
                      Pipeline identifier
                    </th>
                    <td className="x52-numeric" style={{ textAlign: "right" }}>
                      {selectedPipeline.id}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="x52-muted" style={{ fontWeight: "var(--x52-fw-normal)" }}>
                      Target Foundry cluster
                    </th>
                    <td className="x52-numeric" style={{ textAlign: "right" }}>
                      X-52-EAST-01
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="x52-muted" style={{ fontWeight: "var(--x52-fw-normal)" }}>
                      Throughput rate
                    </th>
                    <td className="x52-numeric" style={{ textAlign: "right" }}>
                      {selectedPipeline.throughput}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="x52-muted" style={{ fontWeight: "var(--x52-fw-normal)" }}>
                      P99 latency
                    </th>
                    <td className="x52-numeric" style={{ textAlign: "right" }}>
                      {selectedPipeline.latency}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="x52-muted" style={{ fontWeight: "var(--x52-fw-normal)" }}>
                      Allocated nodes
                    </th>
                    <td className="x52-numeric" style={{ textAlign: "right" }}>
                      {selectedPipeline.nodes}
                    </td>
                  </tr>
                </tbody>
              </HTMLTable>
            </div>

            <Divider style={{ margin: 0 }} />

            {/* The page's single primary action lives in the toolbar, so the
                drawer's controls stay neutral apart from the destructive one. */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--x52-space-2)",
              }}
            >
              <ButtonGroup>
                <Button icon="play" text="Run ingestion" />
                <Button icon="pause" text="Pause" />
              </ButtonGroup>
              <Tooltip content="Delete pipeline" placement="top-end">
                <Button
                  variant="minimal"
                  intent={Intent.DANGER}
                  icon="trash"
                  aria-label={`Delete pipeline ${selectedPipeline.id}`}
                />
              </Tooltip>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
