import React, { useCallback, useMemo, useState } from "react";
import {
  Button,
  HTMLSelect,
  HTMLTable,
  Icon,
  NonIdealState,
  Section,
  SectionCard,
  Tag,
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

const DEFAULT_POOL: CompareEntity[] = [
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
      Compression: "Zstandard-19",
      Attestation: "Cryptographic SHA-256",
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
      Compression: "Gzip-6",
      Attestation: "Disabled",
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
      Compression: "Zstandard-22",
      Attestation: "Cryptographic Ed25519",
    },
  },
];

/**
 * Low-alpha intent washes. `color-mix` against `transparent` keeps the tint
 * relative to the live intent token, so both themes stay legible without a
 * second hard-coded palette.
 */
const DIFF_WASH = "color-mix(in srgb, var(--x52-intent-warning) 14%, transparent)";
const MISSING_WASH = "color-mix(in srgb, var(--x52-intent-danger) 12%, transparent)";
const DIFF_WASH_OPAQUE = "color-mix(in srgb, var(--x52-intent-warning) 14%, var(--x52-card-bg))";

/** A cell that is numeric-looking gets the tabular treatment so units line up. */
const NUMERIC_RE = /^[\d.,\s]+(\s?[A-Za-z/%]+)?$/;

/**
 * Specification diff matrix. Rows are attributes, columns are the selected
 * entities; a row whose values disagree is washed with `warning` AND carries a
 * delta glyph, so the signal never depends on colour alone.
 *
 * `isDarkMode` is accepted for widget-registry compatibility; theming is done
 * entirely through the token layer.
 */
export const CompareMatrixWidget: React.FC<CompareMatrixWidgetProps> = ({
  isDarkMode: _isDarkMode = true,
  initialEntities,
}) => {
  const pool = initialEntities && initialEntities.length > 0 ? initialEntities : DEFAULT_POOL;

  const [selectedIds, setSelectedIds] = useState<string[]>(() => [
    pool[0]?.id ?? "",
    pool[1]?.id ?? pool[0]?.id ?? "",
  ]);
  const [diffOnly, setDiffOnly] = useState(false);

  // Resolve by position, not by `filter(includes)`: filtering collapses the
  // matrix to one column when the same entity is picked on both sides, and it
  // silently reorders the columns back into pool order after a swap.
  const selectedEntities = useMemo(
    () =>
      selectedIds
        .map((id) => pool.find((e) => e.id === id))
        .filter((e): e is CompareEntity => e != null),
    [selectedIds, pool],
  );

  const allKeys = useMemo(
    () => Array.from(new Set(selectedEntities.flatMap((e) => Object.keys(e.attributes)))),
    [selectedEntities],
  );

  const isDiffKey = useCallback(
    (key: string) => {
      if (selectedEntities.length < 2) return false;
      const firstVal = selectedEntities[0].attributes[key];
      return selectedEntities.some((e) => e.attributes[key] !== firstVal);
    },
    [selectedEntities],
  );

  const visibleKeys = useMemo(
    () => (diffOnly ? allKeys.filter(isDiffKey) : allKeys),
    [diffOnly, allKeys, isDiffKey],
  );

  const diffCount = useMemo(() => allKeys.filter(isDiffKey).length, [allKeys, isDiffKey]);

  const setSide = useCallback((index: 0 | 1, id: string) => {
    setSelectedIds((prev) => {
      const next = [...prev];
      next[index] = id;
      return next;
    });
  }, []);

  const headerCellStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 2,
    backgroundColor: "var(--x52-card-secondary)",
    borderBottom: "1px solid var(--x52-border)",
    padding: "var(--x52-space-2) var(--x52-space-3)",
    textAlign: "left",
    verticalAlign: "bottom",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-3)" }}>
      <Section
        compact
        title="Side-by-side comparator"
        subtitle="Specifications, throughput limits, and configuration deltas between two entities."
        rightElement={
          <Tag minimal icon="changes">
            <span className="x52-numeric">{diffCount}</span> of{" "}
            <span className="x52-numeric">{allKeys.length}</span> differ
          </Tag>
        }
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "var(--x52-radius)",
          boxShadow: "none",
        }}
      >
        <SectionCard padded={false} style={{ padding: "var(--x52-space-2) var(--x52-space-3)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--x52-space-2)",
              flexWrap: "wrap",
            }}
          >
            <HTMLSelect
              aria-label="Left-hand entity"
              value={selectedIds[0] ?? ""}
              onChange={(e) => setSide(0, e.currentTarget.value)}
            >
              {pool.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </HTMLSelect>

            <span className="x52-label" aria-hidden="true">
              vs
            </span>

            <HTMLSelect
              aria-label="Right-hand entity"
              value={selectedIds[1] ?? ""}
              onChange={(e) => setSide(1, e.currentTarget.value)}
            >
              {pool.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </HTMLSelect>

            <Button
              variant="outlined"
              size="small"
              icon="swap-horizontal"
              text="Swap"
              aria-label="Swap the two compared entities"
              onClick={() => setSelectedIds((prev) => [prev[1], prev[0]])}
              style={{ marginLeft: "var(--x52-space-2)" }}
            />

            <Button
              variant="minimal"
              size="small"
              icon={diffOnly ? "filter-keep" : "filter"}
              active={diffOnly}
              aria-pressed={diffOnly}
              text={diffOnly ? "Differences only" : "All attributes"}
              onClick={() => setDiffOnly((prev) => !prev)}
            />
          </div>
        </SectionCard>
      </Section>

      <div
        className="x52-panel"
        style={{ overflow: "auto", maxHeight: "560px" }}
      >
        <HTMLTable compact interactive={false} style={{ width: "100%" }}>
          <caption
            className="x52-muted"
            style={{
              captionSide: "bottom",
              textAlign: "left",
              padding: "var(--x52-space-2) var(--x52-space-3)",
              fontSize: "var(--x52-fs-small)",
            }}
          >
            Rows marked with a delta glyph differ across the selected entities.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                style={{
                  ...headerCellStyle,
                  left: 0,
                  zIndex: 3,
                  width: "26%",
                  minWidth: "200px",
                }}
              >
                <span className="x52-label">Specification</span>
              </th>
              {selectedEntities.map((entity, index) => (
                <th
                  key={`${entity.id}-${index}`}
                  scope="col"
                  style={{ ...headerCellStyle, width: `${74 / Math.max(selectedEntities.length, 1)}%` }}
                >
                  <div
                    style={{
                      fontSize: "var(--x52-fs-base)",
                      fontWeight: "var(--x52-fw-bold)",
                      color: "var(--x52-heading)",
                    }}
                  >
                    {entity.name}
                  </div>
                  <div
                    className="x52-muted"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--x52-space-2)",
                      marginTop: "var(--x52-space-1)",
                      fontSize: "var(--x52-fs-small)",
                      fontWeight: "var(--x52-fw-normal)",
                    }}
                  >
                    <span className="x52-numeric">v{entity.version}</span>
                    <Tag minimal size="medium">
                      {entity.category}
                    </Tag>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleKeys.length === 0 ? (
              <tr>
                <td colSpan={selectedEntities.length + 1} style={{ padding: "var(--x52-space-6)" }}>
                  <NonIdealState
                    icon="tick-circle"
                    title={diffOnly ? "No differences detected" : "Nothing to compare"}
                    description={
                      diffOnly
                        ? "Every attribute matches across the selected entities."
                        : "Select two entities to build the diff matrix."
                    }
                    action={
                      diffOnly ? (
                        <Button
                          variant="outlined"
                          size="small"
                          icon="filter"
                          text="Show all attributes"
                          onClick={() => setDiffOnly(false)}
                        />
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              visibleKeys.map((key) => {
                const hasDiff = isDiffKey(key);
                return (
                  <tr key={key} className="x52-table-row">
                    <th
                      scope="row"
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        // Sticky cells must be opaque; pre-mix the wash with the
                        // card background instead of layering a translucent one.
                        backgroundColor: hasDiff ? DIFF_WASH_OPAQUE : "var(--x52-card-bg)",
                        borderBottom: "1px solid var(--x52-border-subtle)",
                        borderRight: "1px solid var(--x52-border-subtle)",
                        padding: "var(--x52-space-2) var(--x52-space-3)",
                        textAlign: "left",
                        fontWeight: "var(--x52-fw-medium)",
                        color: "var(--x52-text)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--x52-space-2)",
                        }}
                      >
                        {key}
                        {hasDiff && (
                          <Icon
                            icon="delta"
                            size={12}
                            intent="warning"
                            title="Values differ across the selected entities"
                          />
                        )}
                      </span>
                    </th>
                    {selectedEntities.map((entity, index) => {
                      const raw = entity.attributes[key];
                      const isMissing = raw === undefined || raw === null || raw === "";
                      const val = isMissing ? "Not set" : String(raw);
                      const isNumericish = !isMissing && NUMERIC_RE.test(val);
                      return (
                        <td
                          key={`${entity.id}-${index}`}
                          style={{
                            backgroundColor: isMissing
                              ? MISSING_WASH
                              : hasDiff
                              ? DIFF_WASH
                              : undefined,
                            borderBottom: "1px solid var(--x52-border-subtle)",
                            padding: "var(--x52-space-2) var(--x52-space-3)",
                            color: isMissing ? "var(--x52-text-muted)" : "var(--x52-text)",
                            fontWeight: hasDiff
                              ? "var(--x52-fw-medium)"
                              : "var(--x52-fw-normal)",
                          }}
                        >
                          <span
                            className={isNumericish ? "x52-numeric" : undefined}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "var(--x52-space-1)",
                            }}
                          >
                            {isMissing && (
                              <Icon icon="disable" size={12} intent="danger" title="Not set" />
                            )}
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
        </HTMLTable>
      </div>
    </div>
  );
};
