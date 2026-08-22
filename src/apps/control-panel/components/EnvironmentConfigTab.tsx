import React, { useState } from "react";
import { Card, Elevation, Button, Tag, Intent, Switch, Callout, InputGroup, HTMLTable } from "@blueprintjs/core";
import type { FunctionsConfigData, PlatformBroadcastData } from "../types";

export const EnvironmentConfigTab: React.FC<{
  functionsConfig: FunctionsConfigData | null;
  broadcasts: PlatformBroadcastData[];
  onRefresh: () => void;
}> = ({ functionsConfig, broadcasts, onRefresh }) => {
  const [config, setConfig] = useState<FunctionsConfigData | null>(functionsConfig);
  const [newBroadcastMessage, setNewBroadcastMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleToggle = (key: keyof FunctionsConfigData) => {
    if (!config) return;
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
  };

  const handleSaveFunctionsConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("http://localhost:4000/api/governance/functions-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage("Functions sandbox settings saved and broadcasted to worker pool.");
        onRefresh();
      }
    } catch (err) {
      console.error("Save config error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishBroadcast = async () => {
    if (!newBroadcastMessage.trim()) return;
    try {
      const res = await fetch("http://localhost:4000/api/governance/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newBroadcastMessage, severity: "INFO" }),
      });
      const json = await res.json();
      if (json.success) {
        setNewBroadcastMessage("");
        setActionMessage("Platform broadcast published to all active client workspaces.");
        onRefresh();
      }
    } catch (err) {
      console.error("Broadcast error:", err);
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

      {/* 1. Functions & Code Execution Sandbox Settings */}
      {config && (
        <Card
          elevation={Elevation.ZERO}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "8px",
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>
                Functions &amp; Language-Agnostic Execution Sandbox
              </h4>
              <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
                Governs the behavior of custom algorithm code modules across enterprise spaces.
              </span>
            </div>
            <Button
              intent={Intent.PRIMARY}
              icon="floppy-disk"
              text="Save Parameters"
              loading={saving}
              onClick={handleSaveFunctionsConfig}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            <div style={{ padding: "12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
              <Switch
                checked={config.sandboxingEnabled}
                label="Isolate V8 / Conda Sandboxing"
                onChange={() => handleToggle("sandboxingEnabled")}
              />
              <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                Restricts arbitrary code from accessing host process memory or system syscalls.
              </div>
            </div>

            <div style={{ padding: "12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
              <Switch
                checked={config.allowOutboundHttp}
                label="Allow Outbound HTTP Requests"
                onChange={() => handleToggle("allowOutboundHttp")}
              />
              <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                Permits functions to fetch external vendor APIs or telemetry streams.
              </div>
            </div>

            <div style={{ padding: "12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
              <Switch
                checked={config.allowFileSystemWrite}
                label="Allow File System Writes (/scratch)"
                onChange={() => handleToggle("allowFileSystemWrite")}
              />
              <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                Permits functions to write temporary artifact caches and output diff tables.
              </div>
            </div>

            <div style={{ padding: "12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
              <Switch
                checked={config.enableSimdVectorization}
                label="SIMD / Neon Hardware Acceleration"
                onChange={() => handleToggle("enableSimdVectorization")}
              />
              <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                Enables Apple Silicon Neon &amp; AVX-512 SIMD vector cosine distance acceleration.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 2. Map & Geospatial Customization */}
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
          Map Customization &amp; Geospatial Tracking Bounds
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
          <div style={{ padding: "12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
            <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Standard Base Map Layer</div>
            <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>Vector Dark Slate (Offline WGS84)</div>
            <Tag minimal intent={Intent.SUCCESS} style={{ marginTop: "6px" }}>MANDATORY DEFENSE LAYER</Tag>
          </div>
          <div style={{ padding: "12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
            <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Airspace Geofencing</div>
            <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>ICAO FIR / FAA Special Use</div>
            <Tag minimal style={{ marginTop: "6px" }}>ACTIVE BOUNDS (142 ZONES)</Tag>
          </div>
          <div style={{ padding: "12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
            <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Cesium 3D Globe Tiles</div>
            <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>3D Elevation Mesh v4.1</div>
            <Tag minimal intent={Intent.PRIMARY} style={{ marginTop: "6px" }}>10M RESOLUTION</Tag>
          </div>
        </div>
      </Card>

      {/* 3. Platform Communications & Broadcast Notifications */}
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
          Platform Communications &amp; Global Broadcast Banners
        </h4>

        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <div style={{ flex: 1 }}>
            <InputGroup
              placeholder="Type global administrative announcement banner message..."
              value={newBroadcastMessage}
              onChange={(e) => setNewBroadcastMessage(e.target.value)}
            />
          </div>
          <Button
            intent={Intent.PRIMARY}
            icon="share"
            text="Publish Broadcast"
            onClick={handlePublishBroadcast}
          />
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Broadcast ID</th>
              <th>Message</th>
              <th>Severity</th>
              <th>Published At</th>
              <th>Author</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {broadcasts.map((bc) => (
              <tr key={bc.id}>
                <td><code>{bc.id}</code></td>
                <td><strong>{bc.message}</strong></td>
                <td><Tag minimal intent={bc.severity === "CRITICAL" ? Intent.DANGER : Intent.PRIMARY}>{bc.severity}</Tag></td>
                <td>{new Date(bc.publishedAt).toLocaleTimeString()}</td>
                <td><code>{bc.author}</code></td>
                <td><Tag intent={Intent.SUCCESS} round>● ACTIVE</Tag></td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>
    </div>
  );
};
