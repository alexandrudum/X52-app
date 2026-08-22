import React from "react";
import { Card, Elevation, ProgressBar, Tag, Intent, HTMLTable } from "@blueprintjs/core";
import type { SystemMetricsData } from "../types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let val = bytes / 1024;
  let idx = 0;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val.toFixed(1)} ${units[idx]}`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export const SystemRuntimeCategory: React.FC<{ metrics: SystemMetricsData | null }> = ({ metrics }) => {
  if (!metrics) {
    return <div style={{ padding: "20px", color: "var(--x52-text-muted)" }}>Loading live system runtime metrics...</div>;
  }

  const { os, cpuUsagePercent, memory, process: proc } = metrics;
  const cpuIntent = cpuUsagePercent > 80 ? Intent.DANGER : cpuUsagePercent > 50 ? Intent.WARNING : Intent.SUCCESS;
  const memIntent = memory.usedPercent > 85 ? Intent.DANGER : memory.usedPercent > 60 ? Intent.WARNING : Intent.PRIMARY;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Real-time KPI Gauges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
        {/* CPU Load Gauge */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", textTransform: "uppercase" }}>
              Host CPU Utilization
            </span>
            <Tag intent={cpuIntent} round style={{ fontWeight: 800 }}>
              {cpuUsagePercent}%
            </Tag>
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, fontFamily: "var(--x52-font-mono)" }}>
            {cpuUsagePercent}% <span style={{ fontSize: "12px", color: "var(--x52-text-muted)", fontWeight: "normal" }}>({os.cpuCount} Cores)</span>
          </div>
          <ProgressBar intent={cpuIntent} value={cpuUsagePercent / 100} stripes animate />
          <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>Load: {os.loadAvg.join(" • ")}</span>
            <span>{os.cpuModel.split("@")[0]}</span>
          </div>
        </Card>

        {/* Host Memory Gauge */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", textTransform: "uppercase" }}>
              Host RAM Memory
            </span>
            <Tag intent={memIntent} round style={{ fontWeight: 800 }}>
              {memory.usedPercent}%
            </Tag>
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, fontFamily: "var(--x52-font-mono)" }}>
            {formatBytes(memory.usedBytes)} <span style={{ fontSize: "12px", color: "var(--x52-text-muted)", fontWeight: "normal" }}>/ {formatBytes(memory.totalBytes)}</span>
          </div>
          <ProgressBar intent={memIntent} value={memory.usedPercent / 100} />
          <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>Free: {formatBytes(memory.freeBytes)}</span>
            <span>Allocated: {formatBytes(memory.usedBytes)}</span>
          </div>
        </Card>

        {/* Node.js Heap Utilization */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", textTransform: "uppercase" }}>
              Node Process V8 Heap
            </span>
            <Tag intent={Intent.SUCCESS} round style={{ fontWeight: 800 }}>
              PID {proc.pid}
            </Tag>
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, fontFamily: "var(--x52-font-mono)" }}>
            {formatBytes(memory.processHeapUsedBytes)} <span style={{ fontSize: "12px", color: "var(--x52-text-muted)", fontWeight: "normal" }}>/ {formatBytes(memory.processHeapTotalBytes)}</span>
          </div>
          <ProgressBar intent={Intent.SUCCESS} value={memory.processHeapUsedBytes / memory.processHeapTotalBytes} />
          <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>RSS: {formatBytes(memory.processRssBytes)}</span>
            <span>Buffers: {formatBytes(memory.processExternalBytes)}</span>
          </div>
        </Card>

        {/* Server Uptime & Node Version */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", textTransform: "uppercase" }}>
              Runtime &amp; OS Uptime
            </span>
            <Tag minimal intent={Intent.PRIMARY}>
              Node {proc.nodeVersion}
            </Tag>
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, fontFamily: "var(--x52-font-mono)" }}>
            {formatDuration(proc.uptimeSeconds)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
            OS Uptime: <strong>{formatDuration(os.uptimeSeconds)}</strong>
          </div>
          <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Host: {os.hostname} ({os.platform} {os.arch})
          </div>
        </Card>
      </div>

      {/* Detailed Host OS & V8 Process Memory Table */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "8px",
          padding: "16px 20px",
        }}
      >
        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 700 }}>
          Operating System &amp; Process Telemetry
        </h4>
        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Property</th>
              <th>Live Metric Value</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Host Operating System</td>
              <td><code>{os.type} {os.release} ({os.platform} / {os.arch})</code></td>
              <td>OS Kernel</td>
              <td><Tag minimal intent={Intent.SUCCESS}>ACTIVE</Tag></td>
            </tr>
            <tr>
              <td>CPU Cores &amp; Architecture</td>
              <td><code>{os.cpuCount} Logical Cores • {os.cpuModel}</code></td>
              <td>Hardware</td>
              <td><Tag minimal intent={Intent.SUCCESS}>ONLINE</Tag></td>
            </tr>
            <tr>
              <td>Process Identifier (PID)</td>
              <td><code>PID {proc.pid}</code> (Node {proc.nodeVersion})</td>
              <td>V8 Runtime</td>
              <td><Tag minimal intent={Intent.PRIMARY}>RUNNING</Tag></td>
            </tr>
            <tr>
              <td>V8 Resident Set Size (RSS)</td>
              <td><code>{formatBytes(memory.processRssBytes)}</code></td>
              <td>Memory</td>
              <td><Tag minimal intent={Intent.SUCCESS}>OPTIMAL</Tag></td>
            </tr>
            <tr>
              <td>1m, 5m, 15m System Load Averages</td>
              <td><code>{os.loadAvg.join(", ")}</code></td>
              <td>Scheduling</td>
              <td><Tag minimal intent={Intent.SUCCESS}>NORMAL</Tag></td>
            </tr>
          </tbody>
        </HTMLTable>
      </Card>
    </div>
  );
};
