import React, { useMemo, useState } from "react";
import {
  Button,
  Callout,
  Classes,
  Dialog,
  Elevation,
  FormGroup,
  HTMLTable,
  Intent,
  NonIdealState,
  ProgressBar,
  Section,
  SectionCard,
  Slider,
  Tag,
} from "@blueprintjs/core";
import { StatusIndicator } from "./StatusIndicator";

const TOTAL_NODES = 52;
const HIGH_CPU_THRESHOLD = 70;

interface ClusterNode {
  id: string;
  name: string;
  ip: string;
  cpu: number;
}

interface StatusBanner {
  intent: Intent;
  message: string;
}

interface ClusterNodeManagerProps {
  isDarkMode: boolean;
}

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : "The cluster API could not be reached.";

export const ClusterNodeManager: React.FC<ClusterNodeManagerProps> = ({ isDarkMode }) => {
  const [activeNodes, setActiveNodes] = useState<number>(TOTAL_NODES);
  const [cpuThrottle, setCpuThrottle] = useState<number>(85);
  // Last configuration the control plane acknowledged, so we can tell a
  // scale-up from a destructive scale-down before the request is sent.
  const [appliedNodes, setAppliedNodes] = useState<number>(TOTAL_NODES);
  const [isScaling, setIsScaling] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [isRebooting, setIsRebooting] = useState<boolean>(false);
  const [banner, setBanner] = useState<StatusBanner | null>(null);
  const [selectedNode, setSelectedNode] = useState<ClusterNode | null>(null);

  const nodes = useMemo<ClusterNode[]>(
    () =>
      Array.from({ length: activeNodes }, (_, i) => {
        const ordinal = (i + 1).toString().padStart(2, "0");
        return {
          id: `N-${ordinal}`,
          name: `Compute Worker ${ordinal}`,
          ip: `10.52.0.${10 + i}`,
          cpu: 25 + ((i * 7) % 55),
        };
      }),
    [activeNodes],
  );

  const isScaleDown = activeNodes < appliedNodes;

  const handleApplyScaling = async () => {
    setIsScaling(true);
    setBanner(null);
    try {
      const res = await fetch("/api/cluster/scale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeNodes, cpuThrottlePercent: cpuThrottle }),
      });
      if (!res.ok) {
        throw new Error(`Cluster API responded ${res.status} ${res.statusText}`.trim());
      }
      const data = await res.json();
      setAppliedNodes(activeNodes);
      setBanner({
        intent: Intent.SUCCESS,
        message:
          typeof data?.message === "string"
            ? data.message
            : `Cluster reconfigured: ${activeNodes} nodes active at ${cpuThrottle}% throttle.`,
      });
    } catch (error) {
      setBanner({
        intent: Intent.DANGER,
        message: `Scaling request failed — ${describeError(error)} No nodes were reconfigured.`,
      });
    } finally {
      setIsScaling(false);
    }
  };

  const handlePurgeCache = async () => {
    setIsPurging(true);
    setBanner(null);
    try {
      const res = await fetch("/api/cluster/purge-cache", { method: "POST" });
      if (!res.ok) {
        throw new Error(`Cluster API responded ${res.status} ${res.statusText}`.trim());
      }
      const data = await res.json();
      setBanner({
        intent: Intent.SUCCESS,
        message:
          typeof data?.message === "string"
            ? data.message
            : `Cluster cache purged across ${TOTAL_NODES} partitions.`,
      });
    } catch (error) {
      setBanner({
        intent: Intent.DANGER,
        message: `Cache purge failed — ${describeError(error)} The cache was left untouched.`,
      });
    } finally {
      setIsPurging(false);
    }
  };

  const handleRebootNode = async (node: ClusterNode) => {
    setIsRebooting(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/cluster/node/${encodeURIComponent(node.id)}/restart`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`Cluster API responded ${res.status} ${res.statusText}`.trim());
      }
      const data = await res.json();
      setBanner({
        intent: Intent.SUCCESS,
        message:
          typeof data?.message === "string"
            ? data.message
            : `Restart signal sent to ${node.id}.`,
      });
      setSelectedNode(null);
    } catch (error) {
      setBanner({
        intent: Intent.DANGER,
        message: `Restart of ${node.id} failed — ${describeError(error)} The node was not rebooted.`,
      });
    } finally {
      setIsRebooting(false);
    }
  };

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

      {/* Compute allocation — one form, one committing action. */}
      <Section
        compact
        elevation={Elevation.ZERO}
        title="Compute allocation"
        subtitle="Worker fleet size and per-core execution ceiling for Foundry graph pipelines."
      >
        <SectionCard>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              columnGap: "var(--x52-space-6)",
              rowGap: "var(--x52-space-2)",
            }}
          >
            <FormGroup
              label="Active compute nodes"
              helperText="Nodes drain in order; scaling down interrupts in-flight transforms."
            >
              <div style={{ padding: "0 var(--x52-space-3) var(--x52-space-2)" }}>
                {/* Blueprint's Slider is not a native input, so the accessible
                    name goes on the handle itself. */}
                <Slider
                  min={4}
                  max={TOTAL_NODES}
                  stepSize={2}
                  labelStepSize={12}
                  value={activeNodes}
                  onChange={setActiveNodes}
                  handleHtmlProps={{ "aria-label": "Active compute nodes" }}
                />
              </div>
            </FormGroup>

            <FormGroup
              label="CPU throttle ceiling"
              helperText="Caps execution per core to prevent thread starvation at telemetry peaks."
            >
              <div style={{ padding: "0 var(--x52-space-3) var(--x52-space-2)" }}>
                <Slider
                  min={20}
                  max={100}
                  stepSize={5}
                  labelStepSize={20}
                  value={cpuThrottle}
                  onChange={setCpuThrottle}
                  handleHtmlProps={{ "aria-label": "CPU throttle ceiling percent" }}
                />
              </div>
            </FormGroup>
          </div>

          {isScaleDown && (
            <Callout intent={Intent.WARNING} compact style={{ marginTop: "var(--x52-space-2)" }}>
              Applying this configuration drains {appliedNodes - activeNodes} worker
              {appliedNodes - activeNodes === 1 ? "" : "s"} from the fleet.
            </Callout>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "var(--x52-space-3)",
              flexWrap: "wrap",
              marginTop: "var(--x52-space-4)",
            }}
          >
            <Button
              variant="outlined"
              intent={Intent.DANGER}
              icon="trash"
              text="Purge cluster cache"
              loading={isPurging}
              onClick={handlePurgeCache}
            />
            <Button
              intent={isScaleDown ? Intent.DANGER : Intent.PRIMARY}
              icon={isScaleDown ? "arrow-down" : "saved"}
              text={
                isScaleDown
                  ? `Scale down to ${activeNodes} nodes`
                  : "Apply cluster configuration"
              }
              loading={isScaling}
              onClick={handleApplyScaling}
            />
          </div>
        </SectionCard>
      </Section>

      {/* Fleet diagnostics */}
      <Section
        compact
        elevation={Elevation.ZERO}
        title="Node fleet diagnostics"
        subtitle="Per-worker load. Open a node for telemetry or to issue an isolated restart."
        rightElement={
          <Tag minimal icon="layers">
            <span className="x52-numeric">{activeNodes}</span>
            {` of ${TOTAL_NODES} nodes online`}
          </Tag>
        }
      >
        <SectionCard padded={false}>
          {nodes.length === 0 ? (
            <NonIdealState
              icon="offline"
              title="No active nodes"
              description="Raise the compute allocation above to bring workers back online."
              layout="horizontal"
            />
          ) : (
            <div style={{ maxHeight: "420px", overflowY: "auto" }}>
              <HTMLTable compact style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th scope="col">Node</th>
                    <th scope="col">Worker</th>
                    <th scope="col">Address</th>
                    <th scope="col">Status</th>
                    <th scope="col" style={{ textAlign: "right" }}>
                      CPU
                    </th>
                    <th scope="col" style={{ width: "160px" }}>
                      Load
                    </th>
                    <th scope="col" style={{ textAlign: "right" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((node) => (
                    <tr key={node.id} className="x52-table-row">
                      <td className="x52-numeric">{node.id}</td>
                      <td>{node.name}</td>
                      <td className="x52-numeric x52-muted">{node.ip}</td>
                      <td>
                        <StatusIndicator
                          tone={node.cpu > HIGH_CPU_THRESHOLD ? "warning" : "success"}
                          label={node.cpu > HIGH_CPU_THRESHOLD ? "Online · high load" : "Online"}
                        />
                      </td>
                      <td className="x52-numeric" style={{ textAlign: "right" }}>
                        {node.cpu}%
                      </td>
                      <td>
                        <ProgressBar
                          value={node.cpu / 100}
                          intent={
                            node.cpu > HIGH_CPU_THRESHOLD ? Intent.WARNING : Intent.SUCCESS
                          }
                          animate={false}
                          stripes={false}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Button
                          variant="minimal"
                          size="small"
                          icon="chevron-right"
                          text="Telemetry"
                          aria-label={`Open telemetry for node ${node.id}`}
                          onClick={() => setSelectedNode(node)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </HTMLTable>
            </div>
          )}
        </SectionCard>
      </Section>

      {/* Node telemetry / restart dialog */}
      <Dialog
        isOpen={selectedNode !== null}
        onClose={() => setSelectedNode(null)}
        title={selectedNode ? `${selectedNode.id} · ${selectedNode.name}` : "Node telemetry"}
        className={isDarkMode ? Classes.DARK : undefined}
      >
        {selectedNode && (
          <div className={Classes.DIALOG_BODY}>
            <HTMLTable compact style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <th scope="row" style={{ textAlign: "left" }}>
                    Address
                  </th>
                  <td className="x52-numeric">{selectedNode.ip}</td>
                </tr>
                <tr>
                  <th scope="row" style={{ textAlign: "left" }}>
                    Runtime status
                  </th>
                  <td>
                    <StatusIndicator tone="success" label="Online" />
                  </td>
                </tr>
                <tr>
                  <th scope="row" style={{ textAlign: "left" }}>
                    CPU load
                  </th>
                  <td className="x52-numeric">{selectedNode.cpu}%</td>
                </tr>
                <tr>
                  <th scope="row" style={{ textAlign: "left" }}>
                    Architecture
                  </th>
                  <td>x86_64 high-throughput worker</td>
                </tr>
                <tr>
                  <th scope="row" style={{ textAlign: "left" }}>
                    Allocated memory
                  </th>
                  <td className="x52-numeric">16.0 GB DDR5 ECC</td>
                </tr>
              </tbody>
            </HTMLTable>
          </div>
        )}
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button variant="minimal" text="Close" onClick={() => setSelectedNode(null)} />
            <Button
              intent={Intent.DANGER}
              icon="refresh"
              text={selectedNode ? `Reboot ${selectedNode.id}` : "Reboot node"}
              loading={isRebooting}
              onClick={() => {
                if (selectedNode) void handleRebootNode(selectedNode);
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
