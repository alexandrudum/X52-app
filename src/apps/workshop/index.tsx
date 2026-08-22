import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  Callout,
} from "@blueprintjs/core";
import type { OntologyInstance } from "../../core/palantir/widgetTypes";
import { ObjectTableWidget } from "../../core/palantir/widgets/ObjectTableWidget";
import { ObjectViewWidget } from "../../core/palantir/widgets/ObjectViewWidget";
import { MetricStatWidget } from "../../core/palantir/widgets/MetricStatWidget";
import { TimeSeriesChartWidget } from "../../core/palantir/widgets/TimeSeriesChartWidget";
import { AIPAssistWidget } from "../../core/palantir/widgets/AIPAssistWidget";

export const PalantirWorkshopApp: React.FC<{ isDarkMode?: boolean; isStandalone?: boolean }> = ({
  isDarkMode = true,
}) => {
  const [ontologyObjects] = useState<OntologyInstance[]>([
    {
      id: "ONT-OBJ-01",
      type: "PipelineNode",
      title: "Kafka High-Speed Telemetry Ingestor",
      properties: {
        Throughput: "148.2 GB/s",
        Status: "ONLINE",
        AllocatedCores: 64,
        MemoryAllocated: "256 GB",
        FoundrySync: "Active v2",
      },
      linkedObjects: [
        { type: "ComputeWorker", count: 16, ids: ["N-01", "N-02", "N-03"] },
        { type: "OntologySchema", count: 2, ids: ["Schema-Telemetry", "Schema-Audit"] },
      ],
    },
    {
      id: "ONT-OBJ-02",
      type: "OntologyEntity",
      title: "Palantir Foundry Core Graph Transform",
      properties: {
        Throughput: "92.4 GB/s",
        Status: "SYNCING",
        AllocatedCores: 32,
        MemoryAllocated: "128 GB",
        FoundrySync: "Active v2",
      },
      linkedObjects: [
        { type: "ComputeWorker", count: 12, ids: ["N-10", "N-11"] },
        { type: "ObjectDataset", count: 4, ids: ["DS-Ontology-Nodes", "DS-Ontology-Links"] },
      ],
    },
    {
      id: "ONT-OBJ-03",
      type: "SecurityVault",
      title: "Cryptographic Attestation & Key Store",
      properties: {
        Throughput: "24.0 GB/s",
        Status: "OPTIMAL",
        AllocatedCores: 16,
        MemoryAllocated: "64 GB",
        FoundrySync: "Encrypted",
      },
      linkedObjects: [
        { type: "SecurityCredential", count: 3, ids: ["key-x52-root", "key-foundry-bridge"] },
      ],
    },
    {
      id: "ONT-OBJ-04",
      type: "LakehouseTable",
      title: "Snowflake Analytics Warehouse Sink",
      properties: {
        Throughput: "68.5 GB/s",
        Status: "STABLE",
        AllocatedCores: 24,
        MemoryAllocated: "96 GB",
        FoundrySync: "Periodic Batch",
      },
      linkedObjects: [
        { type: "DatasetPartition", count: 52, ids: ["Part-01", "Part-02"] },
      ],
    },
  ]);

  const [selectedObject, setSelectedObject] = useState<OntologyInstance | null>(ontologyObjects[0]);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  const handleAction = (actionName: string, obj: OntologyInstance) => {
    setActionNotification(`Action "${actionName}" executed on ${obj.title} (${obj.id}).`);
    setTimeout(() => setActionNotification(null), 4000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {actionNotification && (
        <Callout intent={Intent.SUCCESS} icon="tick-circle">
          {actionNotification}
        </Callout>
      )}

      {/* Workshop Header Bar */}
      <Card
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
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
              Palantir Foundry Workshop Runtime
            </h3>
            <Tag minimal intent={Intent.PRIMARY} round>FOUNDRY WORKBENCH READY</Tag>
          </div>
          <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
            High-density application with inter-widget reactive state binding and AIP intelligence.
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button icon="refresh" text="Reload Ontology" />
          <Button intent="primary" icon="layers" text="Workshop Layout" />
        </div>
      </Card>

      {/* KPI Metric Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        <MetricStatWidget
          title="Aggregated Bandwidth"
          value="333.1 GB/s"
          delta="↑ +18.4% HIGHER"
          intent={Intent.SUCCESS}
          sparklineColor="#22c55e"
        />
        <MetricStatWidget
          title="Active Ontology Objects"
          value="4 Objects"
          delta="100% HEALTHY"
          intent={Intent.PRIMARY}
          sparklineColor="#388bfd"
        />
        <MetricStatWidget
          title="Avg Query Latency"
          value="3.2 ms"
          delta="↓ -0.6 ms"
          intent={Intent.SUCCESS}
          sparklineColor="#a855f7"
        />
        <MetricStatWidget
          title="Cluster Nodes Bound"
          value="52 / 52"
          delta="SYNCHRONIZED"
          intent={Intent.NONE}
          sparklineColor="#64748b"
        />
      </div>

      {/* Main 2-Column Workshop Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px", alignItems: "start" }}>
        
        {/* Left Column: Object Table & Time Series */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <ObjectTableWidget
            objects={ontologyObjects}
            selectedObject={selectedObject}
            onSelectObject={setSelectedObject}
            isDarkMode={isDarkMode}
          />

          <TimeSeriesChartWidget
            title="Hourly Ontology Event Ingestion"
            metricLabel="Records per Second (Thousands)"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Right Column: Object 360 View & AIP Assistant */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <ObjectViewWidget
            object={selectedObject}
            onExecuteAction={handleAction}
            isDarkMode={isDarkMode}
          />

          <AIPAssistWidget
            selectedObject={selectedObject}
            isDarkMode={isDarkMode}
          />
        </div>

      </div>
    </div>
  );
};
