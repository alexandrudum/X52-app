import React, { useCallback, useMemo, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Code,
  Elevation,
  HTMLTable,
  Icon,
  type IconName,
  Intent,
  NonIdealState,
  Tag,
} from "@blueprintjs/core";
import { FilterSortBar, type FilterSortState } from "./FilterSortBar";

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  recordsCount: number;
  lastUpdated: string;
  status: "ONLINE" | "STABLE" | "SYNCING" | "DEPRECATED";
  score: number; // 0-100
  tags: string[];
}

interface DataCatalogListProps {
  isDarkMode?: boolean;
  onCompareSelected?: (selectedItems: CatalogItem[]) => void;
}

const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: "ds-01",
    name: "Global Telemetry Ingestion Log",
    category: "Telemetry",
    recordsCount: 14200000,
    lastUpdated: "2026-08-22 21:30",
    status: "ONLINE",
    score: 98,
    tags: ["Kafka", "DDR5", "Real-Time"],
  },
  {
    id: "ds-02",
    name: "Palantir Foundry Core Ontology Links",
    category: "Ontology",
    recordsCount: 4850000,
    lastUpdated: "2026-08-22 21:15",
    status: "SYNCING",
    score: 94,
    tags: ["Foundry", "REST", "Semantic"],
  },
  {
    id: "ds-03",
    name: "Compute Node Metric Attestation Ledger",
    category: "Security",
    recordsCount: 890000,
    lastUpdated: "2026-08-22 20:45",
    status: "STABLE",
    score: 89,
    tags: ["Security", "Ed25519", "Attestation"],
  },
  {
    id: "ds-04",
    name: "Snowflake Daily Analytics Warehouse Snapshot",
    category: "Lakehouse",
    recordsCount: 32400000,
    lastUpdated: "2026-08-22 18:00",
    status: "STABLE",
    score: 91,
    tags: ["Snowflake", "Parquet", "Cold-Storage"],
  },
  {
    id: "ds-05",
    name: "Vector Knowledge Base Chunk Partition Store",
    category: "RAG & Vector",
    recordsCount: 1250000,
    lastUpdated: "2026-08-22 21:00",
    status: "ONLINE",
    score: 96,
    tags: ["Embeddings", "1536-D", "Cosine"],
  },
];

const SORT_OPTIONS = [
  { label: "Quality Score", value: "score" },
  { label: "Records Count", value: "recordsCount" },
  { label: "Item Name", value: "name" },
  { label: "Last Updated", value: "lastUpdated" },
];

const INITIAL_FILTER_STATE: FilterSortState = {
  searchQuery: "",
  sortBy: "score",
  sortOrder: "desc",
  selectedCategory: "all",
  statusFilter: "all",
};

/**
 * Status carries an icon as well as an intent, so the state is readable in
 * grayscale. Only the two states that need attention spend colour.
 */
const STATUS_META: Record<CatalogItem["status"], { intent: Intent; icon: IconName }> = {
  ONLINE: { intent: Intent.SUCCESS, icon: "tick-circle" },
  SYNCING: { intent: Intent.WARNING, icon: "refresh" },
  STABLE: { intent: Intent.NONE, icon: "dot" },
  DEPRECATED: { intent: Intent.NONE, icon: "outdated" },
};

const SELECTED_ROW_BG = "color-mix(in srgb, var(--x52-intent-primary) 10%, transparent)";

interface CatalogColumn {
  key: string;
  label: string;
  sortable: boolean;
  numeric: boolean;
  width?: string;
}

const COLUMNS: CatalogColumn[] = [
  { key: "name", label: "Dataset", sortable: true, numeric: false },
  { key: "category", label: "Category", sortable: false, numeric: false, width: "140px" },
  { key: "tags", label: "Facets", sortable: false, numeric: false, width: "220px" },
  { key: "recordsCount", label: "Records", sortable: true, numeric: true, width: "120px" },
  { key: "lastUpdated", label: "Updated", sortable: true, numeric: true, width: "150px" },
  { key: "score", label: "Quality", sortable: true, numeric: true, width: "90px" },
  { key: "status", label: "Status", sortable: false, numeric: false, width: "130px" },
];

function compareValues(a: CatalogItem, b: CatalogItem, key: string): number {
  const rawA = a[key as keyof CatalogItem];
  const rawB = b[key as keyof CatalogItem];
  if (typeof rawA === "number" && typeof rawB === "number") return rawA - rawB;
  return String(rawA).toLowerCase().localeCompare(String(rawB).toLowerCase());
}

/**
 * Foundry-style data catalog: a compact sortable table with a card grid
 * alternative. Sorting is driven from real header buttons (with `aria-sort`) so
 * it is reachable by keyboard, and stays in sync with the toolbar's sort menu.
 *
 * `isDarkMode` is accepted for widget-registry compatibility only; all theming
 * comes from the token layer.
 */
export const DataCatalogList: React.FC<DataCatalogListProps> = ({
  isDarkMode: _isDarkMode = true,
  onCompareSelected,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterState, setFilterState] = useState<FilterSortState>(INITIAL_FILTER_STATE);

  const categories = useMemo(
    () => Array.from(new Set(CATALOG_ITEMS.map((i) => i.category))),
    [],
  );

  const sorted = useMemo(() => {
    const needle = filterState.searchQuery.trim().toLowerCase();
    const filtered = CATALOG_ITEMS.filter((item) => {
      const matchesSearch =
        needle === "" ||
        item.name.toLowerCase().includes(needle) ||
        item.id.toLowerCase().includes(needle) ||
        item.tags.some((t) => t.toLowerCase().includes(needle));
      const matchesCat =
        filterState.selectedCategory === "all" || item.category === filterState.selectedCategory;
      // `statusFilter` lives on the shared state shape; honour it so a host
      // that sets it actually filters instead of being silently ignored.
      const matchesStatus =
        filterState.statusFilter === "all" || item.status === filterState.statusFilter;
      return matchesSearch && matchesCat && matchesStatus;
    });

    const direction = filterState.sortOrder === "asc" ? 1 : -1;
    // `filter` already produced a fresh array, but sort in a copy anyway so the
    // comparator can never reorder a caller-owned source array.
    return [...filtered].sort((a, b) => direction * compareValues(a, b, filterState.sortBy));
  }, [filterState]);

  const visibleIds = useMemo(() => sorted.map((i) => i.id), [sorted]);
  const visibleSelectedCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.includes(id)).length,
    [visibleIds, selectedIds],
  );

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  // Select-all operates on what is currently visible, and never drops a
  // selection that the active filter has hidden.
  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allVisibleSelected =
        visibleIds.length > 0 && visibleIds.every((id) => prev.includes(id));
      if (allVisibleSelected) return prev.filter((id) => !visibleIds.includes(id));
      return Array.from(new Set([...prev, ...visibleIds]));
    });
  }, [visibleIds]);

  const handleSort = useCallback((key: string) => {
    setFilterState((prev) =>
      prev.sortBy === key
        ? { ...prev, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" }
        : { ...prev, sortBy: key, sortOrder: "desc" },
    );
  }, []);

  const selectedItems = useMemo(
    () => CATALOG_ITEMS.filter((i) => selectedIds.includes(i.id)),
    [selectedIds],
  );

  const isEmpty = sorted.length === 0;

  const headerCellStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: "var(--x52-card-secondary)",
    borderBottom: "1px solid var(--x52-border)",
    padding: 0,
    textAlign: "left",
    whiteSpace: "nowrap",
  };

  const cellStyle: React.CSSProperties = {
    padding: "var(--x52-space-2) var(--x52-space-3)",
    borderBottom: "1px solid var(--x52-border-subtle)",
    verticalAlign: "middle",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-3)" }}>
      <FilterSortBar
        state={filterState}
        onChange={setFilterState}
        categories={categories}
        sortOptions={SORT_OPTIONS}
        totalResults={sorted.length}
      />

      {/* Bulk actions + view switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--x52-space-3)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-3)" }}>
          <Checkbox
            checked={visibleIds.length > 0 && visibleSelectedCount === visibleIds.length}
            indeterminate={visibleSelectedCount > 0 && visibleSelectedCount < visibleIds.length}
            disabled={visibleIds.length === 0}
            onChange={handleSelectAll}
            style={{ margin: 0 }}
          >
            <span style={{ fontSize: "var(--x52-fs-small)" }}>
              Select all
              {selectedIds.length > 0 && (
                <>
                  {" · "}
                  <span className="x52-numeric">{selectedIds.length}</span> selected
                </>
              )}
            </span>
          </Checkbox>

          {selectedIds.length >= 2 && onCompareSelected && (
            <Button
              intent="primary"
              size="small"
              icon="comparison"
              text={`Compare ${selectedIds.length}`}
              onClick={() => onCompareSelected(selectedItems)}
            />
          )}

          {selectedIds.length > 0 && (
            <Button variant="minimal" size="small" icon="download" text="Export batch" />
          )}
        </div>

        <ButtonGroup variant="outlined" aria-label="Catalog view mode">
          <Button
            icon="list"
            active={viewMode === "list"}
            aria-pressed={viewMode === "list"}
            aria-label="List view"
            onClick={() => setViewMode("list")}
          />
          <Button
            icon="grid-view"
            active={viewMode === "grid"}
            aria-pressed={viewMode === "grid"}
            aria-label="Grid view"
            onClick={() => setViewMode("grid")}
          />
        </ButtonGroup>
      </div>

      {isEmpty ? (
        <div className="x52-panel" style={{ padding: "var(--x52-space-8)" }}>
          <NonIdealState
            icon="search"
            title="No datasets match"
            description="No catalog entry matches the current query and facet selection."
            action={
              <Button
                variant="outlined"
                size="small"
                icon="filter-remove"
                text="Clear filters"
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    searchQuery: "",
                    selectedCategory: "all",
                    statusFilter: "all",
                  }))
                }
              />
            }
          />
        </div>
      ) : viewMode === "list" ? (
        <div className="x52-panel" style={{ overflow: "auto", maxHeight: "480px" }}>
          <HTMLTable compact interactive={false} style={{ width: "100%" }}>
            <thead>
              <tr>
                <th
                  scope="col"
                  style={{ ...headerCellStyle, width: "36px", padding: "0 var(--x52-space-2)" }}
                >
                  <span className="x52-label">Sel</span>
                </th>
                {COLUMNS.map((col) => {
                  const isActiveSort = filterState.sortBy === col.key;
                  const ariaSort: React.AriaAttributes["aria-sort"] = !col.sortable
                    ? undefined
                    : isActiveSort
                    ? filterState.sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none";
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={ariaSort}
                      style={{
                        ...headerCellStyle,
                        width: col.width,
                        textAlign: col.numeric ? "right" : "left",
                      }}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          className="x52-label"
                          onClick={() => handleSort(col.key)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: col.numeric ? "flex-end" : "flex-start",
                            gap: "var(--x52-space-1)",
                            width: "100%",
                            minHeight: "28px",
                            padding: "var(--x52-space-1) var(--x52-space-3)",
                            background: "none",
                            border: "none",
                            font: "inherit",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: isActiveSort ? "var(--x52-text)" : "var(--x52-text-muted)",
                            cursor: "pointer",
                          }}
                        >
                          {col.label}
                          <Icon
                            icon={
                              !isActiveSort
                                ? "double-caret-vertical"
                                : filterState.sortOrder === "asc"
                                ? "caret-up"
                                : "caret-down"
                            }
                            size={12}
                            className={isActiveSort ? undefined : "x52-muted"}
                          />
                        </button>
                      ) : (
                        <span
                          className="x52-label"
                          style={{
                            display: "inline-block",
                            padding: "var(--x52-space-2) var(--x52-space-3)",
                          }}
                        >
                          {col.label}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const status = STATUS_META[item.status];
                return (
                  <tr
                    key={item.id}
                    className="x52-table-row"
                    style={{ backgroundColor: isSelected ? SELECTED_ROW_BG : undefined }}
                  >
                    <td style={{ ...cellStyle, padding: "var(--x52-space-2)" }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        aria-label={`Select ${item.name}`}
                        style={{ margin: 0 }}
                      />
                    </td>
                    <td style={cellStyle}>
                      <div
                        style={{
                          fontSize: "var(--x52-fs-base)",
                          fontWeight: "var(--x52-fw-medium)",
                          color: "var(--x52-heading)",
                        }}
                      >
                        {item.name}
                      </div>
                      <Code
                        className="x52-numeric"
                        style={{ fontSize: "var(--x52-fs-small)" }}
                      >
                        {item.id}
                      </Code>
                    </td>
                    <td className="x52-muted" style={{ ...cellStyle, fontSize: "var(--x52-fs-small)" }}>
                      {item.category}
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--x52-space-1)" }}>
                        {item.tags.map((tag) => (
                          <Tag key={tag} minimal>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </td>
                    <td className="x52-numeric" style={{ ...cellStyle, textAlign: "right" }}>
                      {item.recordsCount.toLocaleString()}
                    </td>
                    <td
                      className="x52-numeric x52-muted"
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                        fontSize: "var(--x52-fs-small)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.lastUpdated}
                    </td>
                    <td className="x52-numeric" style={{ ...cellStyle, textAlign: "right" }}>
                      {item.score}%
                    </td>
                    <td style={cellStyle}>
                      <Tag minimal intent={status.intent} icon={status.icon}>
                        {item.status}
                      </Tag>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </HTMLTable>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--x52-space-3)",
          }}
        >
          {sorted.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const status = STATUS_META[item.status];
            return (
              <Card
                key={item.id}
                compact
                elevation={Elevation.ZERO}
                selected={isSelected}
                style={{
                  backgroundColor: "var(--x52-card-bg)",
                  border: `1px solid ${
                    isSelected ? "var(--x52-intent-primary)" : "var(--x52-border-subtle)"
                  }`,
                  borderRadius: "var(--x52-radius)",
                  boxShadow: "none",
                  padding: "var(--x52-space-3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--x52-space-2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "var(--x52-space-2)",
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleToggleSelect(item.id)}
                    aria-label={`Select ${item.name}`}
                    style={{ margin: 0 }}
                  />
                  <Tag minimal intent={status.intent} icon={status.icon}>
                    {item.status}
                  </Tag>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "var(--x52-fs-base)",
                      fontWeight: "var(--x52-fw-medium)",
                      color: "var(--x52-heading)",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    className="x52-muted"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--x52-space-2)",
                      marginTop: "var(--x52-space-1)",
                      fontSize: "var(--x52-fs-small)",
                    }}
                  >
                    <span>{item.category}</span>
                    <span aria-hidden="true">/</span>
                    <span>
                      <span className="x52-numeric">{item.recordsCount.toLocaleString()}</span>{" "}
                      records
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--x52-space-1)" }}>
                  {item.tags.map((tag) => (
                    <Tag key={tag} minimal>
                      {tag}
                    </Tag>
                  ))}
                </div>

                <div
                  className="x52-muted"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "var(--x52-fs-small)",
                    borderTop: "1px solid var(--x52-border-subtle)",
                    paddingTop: "var(--x52-space-2)",
                  }}
                >
                  <span>
                    Quality <span className="x52-numeric">{item.score}%</span>
                  </span>
                  <span className="x52-numeric">{item.lastUpdated}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
