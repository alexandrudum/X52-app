import React, { useState } from "react";
import { Card, Elevation, Button, Tag, Intent, HTMLTable, Callout } from "@blueprintjs/core";
import type { StorageInfoData } from "../types";

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

export const StorageConnectorsCategory: React.FC<{
  storage: StorageInfoData | null;
  onRefresh: () => void;
}> = ({ storage, onRefresh }) => {
  const [cleaning, setCleaning] = useState(false);
  const [cleanMessage, setCleanMessage] = useState<string | null>(null);

  const handleCleanCache = async () => {
    setCleaning(true);
    try {
      const res = await fetch("http://localhost:4000/api/storage/clean-cache", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setCleanMessage(json.message);
        onRefresh();
      }
    } catch (err) {
      console.error("Storage clean error:", err);
    } finally {
      setCleaning(false);
    }
  };

  if (!storage) {
    return <div style={{ padding: "20px", color: "var(--x52-text-muted)" }}>Loading storage connector telemetry...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {cleanMessage && (
        <Callout
          intent={Intent.SUCCESS}
          icon="tick-circle"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>{cleanMessage}</span>
          <Button variant="minimal" icon="cross" size="small" onClick={() => setCleanMessage(null)} />
        </Callout>
      )}

      {/* Storage KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", textTransform: "uppercase" }}>
            Total Workspace Size
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--x52-font-mono)", marginTop: "6px" }}>
            {formatBytes(storage.totalSizeBytes)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--x52-text-muted)", marginTop: "4px" }}>
            Total Tracked Files: <strong>{storage.totalFiles.toLocaleString()}</strong>
          </div>
        </Card>

        <Card
          elevation={Elevation.ONE}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", textTransform: "uppercase" }}>
              Cache Maintenance
            </div>
            <div style={{ fontSize: "13px", color: "var(--x52-text-muted)", marginTop: "4px" }}>
              Purge temporary PDF buffers, memory caches, and stale worker artifacts.
            </div>
          </div>
          <div style={{ marginTop: "10px" }}>
            <Button
              icon="trash"
              variant="outlined"
              size="small"
              text="Compact &amp; Purge Cache"
              loading={cleaning}
              onClick={handleCleanCache}
            />
          </div>
        </Card>
      </div>

      {/* Storage Connectors Table */}
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
          Mounted Data Vaults &amp; Filesystem Connectors
        </h4>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Connector Name</th>
              <th>Type</th>
              <th>Mount Path</th>
              <th>Status</th>
              <th>File Count</th>
              <th>Allocated Space</th>
              <th>Access Mode</th>
            </tr>
          </thead>
          <tbody>
            {storage.connectors.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td><code>{c.type}</code></td>
                <td><code style={{ fontSize: "11px" }}>{c.path}</code></td>
                <td><Tag intent={Intent.SUCCESS} minimal>● {c.status}</Tag></td>
                <td>{c.totalFiles.toLocaleString()} files</td>
                <td><strong>{formatBytes(c.totalSizeBytes)}</strong></td>
                <td>
                  <Tag minimal intent={c.readOnly ? Intent.NONE : Intent.PRIMARY}>
                    {c.readOnly ? "READ_ONLY" : "READ_WRITE"}
                  </Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>
    </div>
  );
};
