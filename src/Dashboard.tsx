import { useState } from "react";
import {
  Button,
  Card,
  Elevation,
  Navbar,
  Alignment,
  Classes,
  Tag,
  InputGroup,
  ProgressBar,
  Tabs,
  Tab,
  Intent,
  Drawer,
  DrawerSize,
  Position,
  Callout,
  Divider,
} from "@blueprintjs/core";
import { X52BrandMark } from "./components/X52BrandMark";
import { X52Logo } from "./components/X52Logo";
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

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
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
    <div
      className={isDarkMode ? Classes.DARK : ""}
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--x52-bg)",
        color: "var(--x52-text)",
        padding: "20px 32px 40px 32px",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Top Enterprise Header */}
        <Navbar
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            boxShadow: isDarkMode ? "0 8px 24px rgba(0,0,0,0.6)" : "0 2px 10px rgba(0,0,0,0.05)",
            padding: "0 16px",
          }}
        >
          <Navbar.Group align={Alignment.LEFT} style={{ gap: "12px" }}>
            <X52Logo size={32} inverted={!isDarkMode} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: "14px" }}>
                X52 COMMAND
              </span>
              <span style={{ fontSize: "10px", color: "var(--x52-text-muted)", letterSpacing: "0.04em" }}>
                CLUSTER US-EAST / PROD
              </span>
            </div>
            <Navbar.Divider />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 6px" }}>
              <span className="live-dot" />
              <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em" }}>
                52 / 52 NODES ACTIVE
              </span>
            </div>
            <Navbar.Divider />
            <Button
              minimal
              icon="dashboard"
              text="Operations Console"
              active={viewMode === "operations"}
              onClick={() => setViewMode("operations")}
            />
            <Button
              minimal
              icon="control"
              text="Backend Control Panel"
              active={viewMode === "backend"}
              onClick={() => setViewMode("backend")}
            />
          </Navbar.Group>

          <Navbar.Group align={Alignment.RIGHT} style={{ gap: "10px" }}>
            <Tag minimal round intent="primary" style={{ fontWeight: 600, fontSize: "11px" }}>
              PALANTIR FOUNDRY READY
            </Tag>
            <Navbar.Divider />
            <Button
              minimal
              icon={isDarkMode ? "flash" : "moon"}
              text={isDarkMode ? "Light Theme" : "Dark Theme"}
              onClick={() => setIsDarkMode((prev) => !prev)}
            />
            <Button minimal icon="user" />
          </Navbar.Group>
        </Navbar>

        {viewMode === "backend" ? (
          <BackendControlPanel isDarkMode={isDarkMode} />
        ) : (
          <>
            {/* Hero Banner with Integrated X52 Brandmark */}
        <Card
          elevation={Elevation.TWO}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "12px",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "28px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1, minWidth: "320px" }}>
            <X52BrandMark size={52} isDarkMode={isDarkMode} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em" }}>
                  X52 Operational Intelligence Console
                </h1>
                <Tag intent="success" minimal round style={{ fontWeight: 700, fontSize: "11px" }}>
                  ONLINE
                </Tag>
              </div>
              <p style={{ margin: 0, color: "var(--x52-text-muted)", fontSize: "13px", lineHeight: "1.4" }}>
                High-density telemetry orchestrator and real-time analytical pipeline gateway.
              </p>
              <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--x52-text-muted)" }}>
                Last synchronized: <strong style={{ color: "var(--x52-text)" }}>{lastSyncTime}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Button
              icon="refresh"
              text={isIngesting ? "Ingesting..." : "Trigger Ingestion"}
              loading={isIngesting}
              onClick={handleTriggerIngestion}
              className="x52-monochrome-btn"
              style={{ padding: "8px 16px" }}
            />
            <Button icon="cloud-download" text="Export Metrics" />
            <Button minimal icon="cog" />
          </div>
        </Card>

        {/* 4-Card Telemetry & Metrics Grid with Sparklines */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Card 1: Throughput */}
          <Card
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border)",
              borderRadius: "10px",
              padding: "18px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--x52-text-muted)", marginBottom: "6px" }}>
                AGGREGATE THROUGHPUT
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.04em", marginBottom: "6px" }}>
                148.2 <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--x52-text-muted)" }}>GB/s</span>
              </div>
              <Tag minimal round intent={Intent.SUCCESS} style={{ fontSize: "11px", fontWeight: 700 }}>
                ↑ +12.4% PEAK
              </Tag>
            </div>
            <Sparkline data={[24, 38, 30, 45, 42, 60, 55, 78, 85, 92]} color="#22c55e" width={110} height={42} />
          </Card>

          {/* Card 2: Compute Matrix */}
          <Card
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border)",
              borderRadius: "10px",
              padding: "18px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--x52-text-muted)", marginBottom: "6px" }}>
                ACTIVE COMPUTE NODES
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.04em", marginBottom: "6px" }}>
                52 <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--x52-text-muted)" }}>/ 52</span>
              </div>
              <Tag minimal round intent={Intent.PRIMARY} style={{ fontSize: "11px", fontWeight: 700 }}>
                100% HEALTHY
              </Tag>
            </div>
            <Sparkline data={[52, 52, 51, 52, 52, 52, 52, 52, 52, 52]} color="#388bfd" width={110} height={42} />
          </Card>

          {/* Card 3: Latency */}
          <Card
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border)",
              borderRadius: "10px",
              padding: "18px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--x52-text-muted)", marginBottom: "6px" }}>
                P99 INGESTION LATENCY
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.04em", marginBottom: "6px" }}>
                3.8 <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--x52-text-muted)" }}>ms</span>
              </div>
              <Tag minimal round intent={Intent.SUCCESS} style={{ fontSize: "11px", fontWeight: 700 }}>
                ↓ -0.8 ms FASTER
              </Tag>
            </div>
            <Sparkline data={[8.2, 7.5, 6.1, 5.4, 4.9, 4.2, 4.0, 3.8, 3.9, 3.8]} color="#a855f7" width={110} height={42} />
          </Card>

          {/* Card 4: Memory Utilization */}
          <Card
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border)",
              borderRadius: "10px",
              padding: "18px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--x52-text-muted)", marginBottom: "6px" }}>
                CLUSTER MEMORY LOAD
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.04em", marginBottom: "6px" }}>
                41.8 <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--x52-text-muted)" }}>%</span>
              </div>
              <Tag minimal round intent={Intent.NONE} style={{ fontSize: "11px", fontWeight: 700 }}>
                OPTIMAL (512 GB)
              </Tag>
            </div>
            <Sparkline data={[35, 38, 42, 40, 44, 41, 43, 40, 42, 41.8]} color="#64748b" width={110} height={42} />
          </Card>
        </div>

        {/* Central Workstation Tabs & Panels */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "12px",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <Tabs
              id="dashboard-tabs"
              selectedTabId={activeTab}
              onChange={(id) => setActiveTab(id.toString())}
              large
            >
              <Tab id="pipelines" title="Data Pipelines & Streams" />
              <Tab id="nodes" title="52 Node Compute Matrix" />
              <Tab id="logs" title="Live Event Stream" />
            </Tabs>

            {activeTab === "pipelines" && (
              <div style={{ width: "280px" }}>
                <InputGroup
                  leftIcon="search"
                  placeholder="Filter by name or PL-ID..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  small
                  round
                />
              </div>
            )}
          </div>

          <Divider style={{ margin: "0 0 16px 0" }} />

          {/* TAB 1: Pipelines View */}
          {activeTab === "pipelines" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredPipelines.length === 0 ? (
                <Callout intent={Intent.WARNING}>No pipelines match your search criteria.</Callout>
              ) : (
                filteredPipelines.map((pipeline) => (
                  <div
                    key={pipeline.id}
                    className="x52-table-row"
                    onClick={() => setSelectedPipeline(pipeline)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderRadius: "8px",
                      backgroundColor: isDarkMode ? "#161b22" : "#f8fafc",
                      border: "1px solid var(--x52-border)",
                      gap: "18px",
                      cursor: "pointer",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: "120px" }}>
                      <code style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.02em" }}>
                        {pipeline.id}
                      </code>
                    </div>

                    <div style={{ flex: 2, minWidth: "220px" }}>
                      <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "2px" }}>
                        {pipeline.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                        {pipeline.records} • {pipeline.nodes} Nodes Allocated • Updated {pipeline.time}
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: "140px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--x52-text-muted)", marginBottom: "4px" }}>
                        <span>LOAD</span>
                        <strong style={{ color: "var(--x52-text)" }}>{Math.round(pipeline.load * 100)}%</strong>
                      </div>
                      <ProgressBar intent={pipeline.intent} value={pipeline.load} animate={false} stripes={false} />
                    </div>

                    <div style={{ minWidth: "90px", textAlign: "right" }}>
                      <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {pipeline.throughput}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--x52-text-muted)" }}>
                        {pipeline.latency}
                      </div>
                    </div>

                    <div>
                      <Tag intent={pipeline.intent} minimal round style={{ fontWeight: 700, fontSize: "11px" }}>
                        {pipeline.status}
                      </Tag>
                    </div>

                    <div>
                      <Button minimal icon="chevron-right" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: 52 Node Cluster Matrix */}
          {activeTab === "nodes" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "var(--x52-text-muted)" }}>
                  Cluster grid representation of all 52 active worker nodes in cluster <strong>X-52</strong>.
                </span>
                <Tag minimal intent={Intent.SUCCESS} round>ALL 52 NODES SYNCHRONIZED</Tag>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))",
                  gap: "8px",
                  padding: "16px",
                  backgroundColor: isDarkMode ? "#0d1117" : "#f1f5f9",
                  borderRadius: "8px",
                  border: "1px solid var(--x52-border)",
                }}
              >
                {Array.from({ length: 52 }, (_, i) => {
                  const nodeNum = (i + 1).toString().padStart(2, "0");
                  const isHighLoad = i === 7 || i === 23;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "10px 6px",
                        textAlign: "center",
                        borderRadius: "6px",
                        backgroundColor: isDarkMode ? "#161b22" : "#ffffff",
                        border: isHighLoad ? "1px solid #388bfd" : "1px solid var(--x52-border)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ fontSize: "9px", color: "var(--x52-text-muted)", marginBottom: "2px" }}>NODE</div>
                      <div style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                        N-{nodeNum}
                      </div>
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: isHighLoad ? "#388bfd" : "#22c55e",
                          margin: "6px auto 0 auto",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Live Event Stream Logs */}
          {activeTab === "logs" && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                backgroundColor: isDarkMode ? "#0d1117" : "#0f172a",
                color: "#f8fafc",
                borderRadius: "8px",
                padding: "16px",
                fontSize: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "360px",
                overflowY: "auto",
              }}
            >
              {logs.map((log, index) => (
                <div key={index} style={{ display: "flex", gap: "12px", alignItems: "flex-start", lineHeight: "1.5" }}>
                  <span style={{ color: "#64748b", flexShrink: 0 }}>[{log.time}]</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        log.level === "SUCCESS"
                          ? "#4ade80"
                          : log.level === "WARN"
                          ? "#facc15"
                          : "#60a5fa",
                      flexShrink: 0,
                    }}
                  >
                    {log.level}
                  </span>
                  <span style={{ color: "#94a3b8", flexShrink: 0 }}>[{log.src}]</span>
                  <span style={{ color: "#e2e8f0" }}>{log.msg}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pipeline Detail Drawer */}
        <Drawer
          isOpen={selectedPipeline !== null}
          onClose={() => setSelectedPipeline(null)}
          title={selectedPipeline ? `${selectedPipeline.name} (${selectedPipeline.id})` : "Pipeline Details"}
          position={Position.RIGHT}
          size={DrawerSize.SMALL}
          className={isDarkMode ? Classes.DARK : ""}
        >
          {selectedPipeline && (
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <Callout intent={selectedPipeline.intent} title={`Status: ${selectedPipeline.status}`}>
                This pipeline is actively processing streaming records with {selectedPipeline.throughput} bandwidth.
              </Callout>

              <div>
                <h4 style={{ margin: "0 0 8px 0" }}>Pipeline Specifications</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--x52-text-muted)" }}>Pipeline Identifier:</span>
                    <code>{selectedPipeline.id}</code>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--x52-text-muted)" }}>Target Foundry Cluster:</span>
                    <span>X-52-EAST-01</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--x52-text-muted)" }}>Throughput Rate:</span>
                    <strong>{selectedPipeline.throughput}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--x52-text-muted)" }}>P99 Latency:</span>
                    <span>{selectedPipeline.latency}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--x52-text-muted)" }}>Allocated Nodes:</span>
                    <span>{selectedPipeline.nodes} Dedicated</span>
                  </div>
                </div>
              </div>

              <Divider />

              <div style={{ display: "flex", gap: "10px" }}>
                <Button intent="primary" icon="play" text="Run Ingestion" />
                <Button icon="pause" text="Pause" />
                <Button minimal intent="danger" icon="trash" />
              </div>
            </div>
          )}
        </Drawer>
          </>
        )}

      </div>
    </div>
  );
}
