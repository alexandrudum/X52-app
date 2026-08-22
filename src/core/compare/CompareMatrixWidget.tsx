import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  HTMLSelect,
  Callout,
} from "@blueprintjs/core";

export interface CompareEntity {
  id: string;
  name: string;
  version: string;
  category: string;
  attributes: Record<string, string | number | boolean>;
}

interface CompareMatrixWidgetProps {
  isDarkMode?: boolean;
  initialEntities?: CompareEntity[];
}

export const CompareMatrixWidget: React.FC<CompareMatrixWidgetProps> = ({
  isDarkMode: _isDarkMode = true,
  initialEntities,
}) => {
  const defaultPool: CompareEntity[] = [
    {
      id: "ent-01",
      name: "X52 Telemetry Pipeline v2.4",
      version: "2.4.0",
      category: "Streaming ETL",
      attributes: {
        "Target Throughput": "148.2 GB/s",
        "P99 Ingestion Latency": "2.1 ms",
        "Allocated Nodes": 52,
        "Memory Buffer": "512 GB DDR5",
        "Palantir Sync": "Active (REST v2)",
        "Compression": "Zstandard-19",
        "Attestation": "Cryptographic SHA-256",
      },
    },
    {
      id: "ent-02",
      name: "X52 Legacy Pipeline v1.9",
      version: "1.9.2",
      category: "Batch ETL",
      attributes: {
        "Target Throughput": "42.0 GB/s",
        "P99 Ingestion Latency": "18.4 ms",
        "Allocated Nodes": 16,
        "Memory Buffer": "128 GB DDR4",
        "Palantir Sync": "Batched (v1)",
        "Compression": "Gzip-6",
        "Attestation": "Disabled",
      },
    },
    {
      id: "ent-03",
      name: "X52 Edge Sync Node v2.5-RC",
      version: "2.5.0-RC",
      category: "Edge Gateway",
      attributes: {
        "Target Throughput": "180.0 GB/s",
        "P99 Ingestion Latency": "1.4 ms",
        "Allocated Nodes": 52,
        "Memory Buffer": "1024 GB DDR5",
        "Palantir Sync": "Active (gRPC/v2)",
        "Compression": "Zstandard-22",
        "Attestation": "Cryptographic Ed25519",
      },
    },
  ];

  const pool = initialEntities || defaultPool;
  const [selectedIds, setSelectedIds] = useState<string[]>([pool[0].id, pool[1].id]);
  const [diffOnly, setDiffOnly] = useState(false);

  const selectedEntities = pool.filter((e) => selectedIds.includes(e.id));

  // Extract unique attribute keys across all selected entities
  const allKeys = Array.from(
    new Set(selectedEntities.flatMap((e) => Object.keys(e.attributes)))
  );

  const isDiffKey = (key: string) => {
    if (selectedEntities.length < 2) return false;
    const firstVal = selectedEntities[0].attributes[key];
    return selectedEntities.some((e) => e.attributes[key] !== firstVal);
  };

  const visibleKeys = diffOnly ? allKeys.filter(isDiffKey) : allKeys;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header & Controls */}
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
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>Side-by-Side Comparator Matrix</h3>
            <Tag minimal round intent={Intent.PRIMARY}>DIFF ENGINE</Tag>
          </div>
          <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
            Compare specifications, throughput limits, and configuration deltas between entities.
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            minimal
            icon={diffOnly ? "eye-open" : "filter-keep"}
            intent={diffOnly ? Intent.WARNING : Intent.NONE}
            text={diffOnly ? "Showing Differences Only" : "Show All Attributes"}
            onClick={() => setDiffOnly(!diffOnly)}
          />
          
          {/* Entity Selector 1 */}
          <HTMLSelect
            value={selectedIds[0] || ""}
            onChange={(e) => setSelectedIds([e.target.value, selectedIds[1]])}
          >
            {pool.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </HTMLSelect>

          <span style={{ fontWeight: 800, color: "var(--x52-text-muted)" }}>vs</span>

          {/* Entity Selector 2 */}
          <HTMLSelect
            value={selectedIds[1] || ""}
            onChange={(e) => setSelectedIds([selectedIds[0], e.target.value])}
          >
            {pool.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </HTMLSelect>
        </div>
      </Card>

      {/* Comparison Table */}
      <Card
        elevation={Elevation.ONE}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--x52-card-secondary)", borderBottom: "1px solid var(--x52-border)" }}>
              <th style={{ padding: "14px 18px", textAlign: "left", width: "25%", fontWeight: 700 }}>
                Specification / Attribute
              </th>
              {selectedEntities.map((entity) => (
                <th key={entity.id} style={{ padding: "14px 18px", textAlign: "left", width: `${75 / selectedEntities.length}%` }}>
                  <div style={{ fontWeight: 800, fontSize: "14px" }}>{entity.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", fontWeight: 500 }}>
                    Version {entity.version} • <Tag minimal round style={{ fontSize: "10px" }}>{entity.category}</Tag>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleKeys.length === 0 ? (
              <tr>
                <td colSpan={selectedEntities.length + 1} style={{ padding: "24px", textAlign: "center" }}>
                  <Callout intent={Intent.SUCCESS}>No differences detected between selected entities.</Callout>
                </td>
              </tr>
            ) : (
              visibleKeys.map((key) => {
                const hasDiff = isDiffKey(key);
                return (
                  <tr
                    key={key}
                    style={{
                      borderBottom: "1px solid var(--x52-border)",
                      backgroundColor: hasDiff ? "rgba(56, 139, 253, 0.06)" : undefined,
                    }}
                  >
                    <td style={{ padding: "12px 18px", fontWeight: 600, color: "var(--x52-text-muted)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {key}
                        {hasDiff && (
                          <Tag minimal intent={Intent.PRIMARY} round style={{ fontSize: "9px", padding: "1px 4px" }}>
                            DELTA
                          </Tag>
                        )}
                      </div>
                    </td>
                    {selectedEntities.map((entity) => {
                      const val = String(entity.attributes[key] ?? "—");
                      return (
                        <td key={entity.id} style={{ padding: "12px 18px", fontWeight: hasDiff ? 700 : 500 }}>
                          <span style={{ color: hasDiff ? "var(--x52-text)" : "var(--x52-text-muted)" }}>
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
