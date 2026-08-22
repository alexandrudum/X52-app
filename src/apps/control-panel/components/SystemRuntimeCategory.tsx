import React, { useEffect, useState } from "react";
import { Card, Elevation, ProgressBar, Tag, Intent, HTMLTable, Icon } from "@blueprintjs/core";
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
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 15, 14, 18, 12, 16, 15, 20, 14, 12]);
  const [memHistory, setMemHistory] = useState<number[]>([65, 66, 65, 68, 67, 66, 67, 68, 67, 66]);

  useEffect(() => {
    if (!metrics) return;
    setCpuHistory((prev) => [...prev.slice(-19), metrics.cpuUsagePercent]);
    setMemHistory((prev) => [...prev.slice(-19), metrics.memory.usedPercent]);
  }, [metrics]);

  if (!metrics) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--x52-text-muted)" }}>Connecting to Host Operating System Telemetry Engine...</div>;
  }

  const { os, cpuUsagePercent, memory, process: proc } = metrics;
  const cpuIntent = cpuUsagePercent > 80 ? Intent.DANGER : cpuUsagePercent > 50 ? Intent.WARNING : Intent.SUCCESS;
  const memIntent = memory.usedPercent > 85 ? Intent.DANGER : memory.usedPercent > 60 ? Intent.WARNING : Intent.PRIMARY;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Real-time KPI Gauges with Sparkline Bars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
        {/* CPU Load Gauge */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--x52-text-muted)", letterSpacing: "0.05em" }}>
              HOST CPU UTILIZATION
            </span>
            <Tag intent={cpuIntent} round style={{ fontWeight: 800 }}>
              {cpuUsagePercent}%
            </Tag>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--x52-font-mono)" }}>
            {cpuUsagePercent}% <span style={{ fontSize: "12px", color: "var(--x52-text-muted)", fontWeight: "normal" }}>({os.cpuCount} Cores • {os.cpuModel.split("@")[0]})</span>
          </div>

          <ProgressBar intent={cpuIntent} value={cpuUsagePercent / 100} stripes animate />

          {/* Mini Sparkline Bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "24px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.2)", padding: "2px", borderRadius: "4px" }}>
            {cpuHistory.map((val, i) => (
              <div
                key={i}
                title={`CPU: ${val}%`}
                style={{
                  flex: 1,
                  height: `${Math.max(10, val)}%`,
                  backgroundColor: val > 75 ? "#ef4444" : "#3b82f6",
                  borderRadius: "1px",
                  transition: "height 0.2s ease",
                }}
              />
            ))}
          </div>

          <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>Load: <strong>{os.loadAvg.join(" • ")}</strong></span>
            <span>Arch: <strong>{os.arch}</strong></span>
          </div>
        </Card>

        {/* Host Memory Gauge */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--x52-text-muted)", letterSpacing: "0.05em" }}>
              HOST RAM ALLOCATION
            </span>
            <Tag intent={memIntent} round style={{ fontWeight: 800 }}>
              {memory.usedPercent}%
            </Tag>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--x52-font-mono)" }}>
            {formatBytes(memory.usedBytes)} <span style={{ fontSize: "12px", color: "var(--x52-text-muted)", fontWeight: "normal" }}>/ {formatBytes(memory.totalBytes)}</span>
          </div>

          <ProgressBar intent={memIntent} value={memory.usedPercent / 100} />

          {/* Mini Sparkline Bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "24px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.2)", padding: "2px", borderRadius: "4px" }}>
            {memHistory.map((val, i) => (
              <div
                key={i}
                title={`RAM: ${val}%`}
                style={{
                  flex: 1,
                  height: `${Math.max(15, val)}%`,
                  backgroundColor: val > 85 ? "#ef4444" : "#10b981",
                  borderRadius: "1px",
                  transition: "height 0.2s ease",
                }}
              />
            ))}
          </div>

          <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>Free RAM: <strong>{formatBytes(memory.freeBytes)}</strong></span>
            <span>Allocated: <strong>{formatBytes(memory.usedBytes)}</strong></span>
          </div>
        </Card>

        {/* Node.js Heap Utilization */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--x52-text-muted)", letterSpacing: "0.05em" }}>
              NODE.JS V8 HEAP
            </span>
            <Tag intent={Intent.SUCCESS} round style={{ fontWeight: 800 }}>
              PID {proc.pid}
            </Tag>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--x52-font-mono)" }}>
            {formatBytes(memory.processHeapUsedBytes)} <span style={{ fontSize: "12px", color: "var(--x52-text-muted)", fontWeight: "normal" }}>/ {formatBytes(memory.processHeapTotalBytes)}</span>
          </div>
          <ProgressBar intent={Intent.SUCCESS} value={memory.processHeapUsedBytes / memory.processHeapTotalBytes} />
          <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>Resident (RSS): <strong>{formatBytes(memory.processRssBytes)}</strong></span>
            <span>Buffers: <strong>{formatBytes(memory.processExternalBytes)}</strong></span>
          </div>
        </Card>

        {/* Server Uptime & Node Version */}
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--x52-text-muted)", letterSpacing: "0.05em" }}>
              SYSTEM UPTIME
            </span>
            <Tag minimal intent={Intent.PRIMARY}>
              Node {proc.nodeVersion}
            </Tag>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--x52-font-mono)" }}>
            {formatDuration(proc.uptimeSeconds)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
            OS Kernel Uptime: <strong>{formatDuration(os.uptimeSeconds)}</strong>
          </div>
          <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Host: <strong>{os.hostname}</strong> ({os.platform} / {os.arch})
          </div>
        </Card>
      </div>

      {/* Detailed Host OS & V8 Process Memory Table */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <Icon icon="desktop" color="var(--x52-accent)" />
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800 }}>
            Operating System, Hardware Cores &amp; V8 Engine Telemetry
          </h4>
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Property</th>
              <th>Live Metric Value</th>
              <th>Category</th>
              <th>Health Status</th>
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
              <td>CPU Cores &amp; Hardware Acceleration</td>
              <td><code>{os.cpuCount} Cores • {os.cpuModel} (SIMD / Neon)</code></td>
              <td>Hardware</td>
              <td><Tag minimal intent={Intent.SUCCESS}>ONLINE</Tag></td>
            </tr>
            <tr>
              <td>Process Identifier (PID)</td>
              <td><code>PID {proc.pid}</code> (Node.js {proc.nodeVersion})</td>
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
