import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  HTMLTable,
  ProgressBar,
  Callout,
  Dialog,
  Classes,
  Icon,
} from "@blueprintjs/core";
import type { RetentionPolicyData, ApolloReleaseTrackData } from "../types";

export const ResourceLifecycleTab: React.FC<{
  retentionPolicies: RetentionPolicyData[];
  apolloTracks: ApolloReleaseTrackData[];
  onRefresh: () => void;
}> = ({ retentionPolicies, apolloTracks, onRefresh }) => {
  const [purgingId, setPurgingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Apollo deployment rollout modal
  const [deployingTrack, setDeployingTrack] = useState<ApolloReleaseTrackData | null>(null);
  const [deploymentStep, setDeploymentStep] = useState<number>(0);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  const handlePurgeNow = async (id: string) => {
    setPurgingId(id);
    try {
      const res = await fetch(`http://localhost:4000/api/governance/retention/${id}/purge-now`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message);
        onRefresh();
      }
    } catch (err) {
      console.error("Purge error:", err);
    } finally {
      setPurgingId(null);
    }
  };

  const startApolloDeployment = (track: ApolloReleaseTrackData) => {
    setDeployingTrack(track);
    setDeploymentStep(1);
    setIsDeploying(true);

    const steps = [
      () => setDeploymentStep(2),
      () => setDeploymentStep(3),
      () => setDeploymentStep(4),
      () => {
        setDeploymentStep(5);
        setIsDeploying(false);
        setActionMessage(`Apollo Platform Release ${track.availableVersion} deployed successfully with zero downtime!`);
        onRefresh();
      },
    ];

    steps.forEach((step, idx) => {
      setTimeout(step, (idx + 1) * 1200);
    });
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

      {/* 1. Compute Tracker & Resource Allocation */}
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
              <Icon icon="chart" color="var(--x52-accent)" />
              Compute Tracker &amp; Pipeline Resource Allocation
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Processing footprints, memory bounds, and daily spark compute hours across integration spaces.
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "16px" }}>
          <div style={{ padding: "14px", border: "1px solid var(--x52-border-subtle)", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Monthly Compute Budget</div>
            <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", fontFamily: "var(--x52-font-mono)" }}>
              418.5 <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>/ 1,000 vCPU-hrs</span>
            </div>
            <ProgressBar intent={Intent.PRIMARY} value={0.418} style={{ marginTop: "8px" }} />
          </div>

          <div style={{ padding: "14px", border: "1px solid var(--x52-border-subtle)", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Spark Memory Allocated</div>
            <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", fontFamily: "var(--x52-font-mono)" }}>
              32.0 <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>/ 64.0 GB RAM</span>
            </div>
            <ProgressBar intent={Intent.SUCCESS} value={0.5} style={{ marginTop: "8px" }} />
          </div>

          <div style={{ padding: "14px", border: "1px solid var(--x52-border-subtle)", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Active Pipeline Instances</div>
            <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", fontFamily: "var(--x52-font-mono)" }}>
              14 Nodes <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>Healthy</span>
            </div>
            <Tag minimal intent={Intent.SUCCESS} style={{ marginTop: "8px" }}>0 DEGRADED</Tag>
          </div>
        </div>
      </Card>

      {/* 2. Retention Policy Enforcement */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon icon="history" color="var(--x52-accent)" />
              Automated Retention Policy Enforcement
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Automated data retention and purging cycles to comply with legal frameworks (GDPR, FAA, EASA, DoD IL6).
            </span>
          </div>
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Policy Name</th>
              <th>Compliance Framework</th>
              <th>Retention Standard</th>
              <th>Managed Records</th>
              <th>Auto-Purge</th>
              <th>Last Purged</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {retentionPolicies.map((pol) => (
              <tr key={pol.id}>
                <td>
                  <strong>{pol.name}</strong>
                  <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}><code>{pol.affectedDatasets.join(", ")}</code></div>
                </td>
                <td><Tag minimal intent={Intent.PRIMARY}>{pol.framework}</Tag></td>
                <td><strong>{pol.retentionDuration}</strong></td>
                <td>{pol.recordsManaged.toLocaleString()} entries</td>
                <td>
                  <Tag minimal intent={pol.autoPurgeEnabled ? Intent.SUCCESS : Intent.NONE}>
                    {pol.autoPurgeEnabled ? "AUTOMATED" : "MANUAL_HOLD"}
                  </Tag>
                </td>
                <td><span style={{ fontSize: "11px" }}>{pol.lastPurgeTimestamp}</span></td>
                <td>
                  <Button
                    size="small"
                    variant="outlined"
                    icon="clean"
                    text="Purge Expired"
                    loading={purgingId === pol.id}
                    onClick={() => handlePurgeNow(pol.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      {/* 3. Upgrade Assistant (Palantir Apollo Integration) */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon icon="cloud-upload" color="var(--x52-accent)" />
              Upgrade Assistant (Palantir Apollo Continuous Deployment)
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Evaluates platform updates, tracks upcoming feature rollouts, and executes automated zero-downtime rolling upgrades.
            </span>
          </div>
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Deployment Track</th>
              <th>Current Active</th>
              <th>Available Target</th>
              <th>Release Date</th>
              <th>Compatibility Score</th>
              <th>Rollout Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {apolloTracks.map((trk) => (
              <tr key={trk.track}>
                <td><strong>{trk.track} Track</strong></td>
                <td><code>{trk.currentVersion}</code></td>
                <td><code>{trk.availableVersion}</code></td>
                <td>{trk.releaseDate}</td>
                <td>
                  <Tag intent={trk.compatibilityScorePercent === 100 ? Intent.SUCCESS : Intent.WARNING} round>
                    {trk.compatibilityScorePercent}% Compatible
                  </Tag>
                </td>
                <td>
                  <Tag minimal intent={trk.status === "READY_TO_DEPLOY" ? Intent.SUCCESS : Intent.WARNING}>
                    ● {trk.status}
                  </Tag>
                </td>
                <td>
                  <Button
                    size="small"
                    intent={trk.status === "READY_TO_DEPLOY" ? Intent.SUCCESS : Intent.NONE}
                    variant={trk.status === "READY_TO_DEPLOY" ? "solid" : "outlined"}
                    icon="cloud-upload"
                    text={trk.status === "READY_TO_DEPLOY" ? "Deploy via Apollo" : "Review Plan"}
                    onClick={() => startApolloDeployment(trk)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      {/* Interactive Apollo Continuous Rollout Modal */}
      <Dialog
        isOpen={!!deployingTrack}
        onClose={() => !isDeploying && setDeployingTrack(null)}
        title={`Palantir Apollo Deployment Engine: ${deployingTrack?.availableVersion}`}
        icon="cloud-upload"
        style={{ width: "600px", backgroundColor: "var(--x52-card-bg)", color: "inherit" }}
      >
        <div className={Classes.DIALOG_BODY} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>Target Platform Version:</div>
            <h3 style={{ margin: "4px 0", fontSize: "18px" }}>{deployingTrack?.availableVersion} ({deployingTrack?.track} Track)</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Tag round intent={deploymentStep >= 1 ? Intent.SUCCESS : Intent.NONE}>1</Tag>
              <span style={{ fontWeight: deploymentStep === 1 ? 800 : 400 }}>System Health &amp; Schema Compatibility Pre-Flight</span>
              {deploymentStep > 1 && <Icon icon="tick" color="#22c55e" />}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Tag round intent={deploymentStep >= 2 ? Intent.SUCCESS : Intent.NONE}>2</Tag>
              <span style={{ fontWeight: deploymentStep === 2 ? 800 : 400 }}>Worker Thread Pool Draining (Zero Dropped Requests)</span>
              {deploymentStep > 2 && <Icon icon="tick" color="#22c55e" />}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Tag round intent={deploymentStep >= 3 ? Intent.SUCCESS : Intent.NONE}>3</Tag>
              <span style={{ fontWeight: deploymentStep === 3 ? 800 : 400 }}>Atomic Binary In-Place Swap &amp; CMap Font Sync</span>
              {deploymentStep > 3 && <Icon icon="tick" color="#22c55e" />}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Tag round intent={deploymentStep >= 4 ? Intent.SUCCESS : Intent.NONE}>4</Tag>
              <span style={{ fontWeight: deploymentStep === 4 ? 800 : 400 }}>Live Telemetry &amp; RAG Vector Index Validation</span>
              {deploymentStep > 4 && <Icon icon="tick" color="#22c55e" />}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Tag round intent={deploymentStep >= 5 ? Intent.SUCCESS : Intent.NONE}>5</Tag>
              <span style={{ fontWeight: deploymentStep === 5 ? 800 : 400 }}>Rollout Finalized: Active on All 52 Cluster Nodes</span>
              {deploymentStep >= 5 && <Icon icon="tick-circle" color="#22c55e" />}
            </div>
          </div>

          <ProgressBar
            intent={deploymentStep === 5 ? Intent.SUCCESS : Intent.PRIMARY}
            value={deploymentStep / 5}
            stripes={isDeploying}
            animate={isDeploying}
          />
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              disabled={isDeploying}
              intent={deploymentStep === 5 ? Intent.SUCCESS : Intent.NONE}
              text={deploymentStep === 5 ? "Finish & Close" : "Close"}
              onClick={() => setDeployingTrack(null)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
