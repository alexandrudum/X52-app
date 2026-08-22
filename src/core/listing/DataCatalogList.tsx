import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  ButtonGroup,
  Checkbox,
  Tag,
  Intent,
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

export const DataCatalogList: React.FC<DataCatalogListProps> = ({
  isDarkMode: _isDarkMode = true,
  onCompareSelected,
}) => {
  const [items] = useState<CatalogItem[]>([
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
  ]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterState, setFilterState] = useState<FilterSortState>({
    searchQuery: "",
    sortBy: "score",
    sortOrder: "desc",
    selectedCategory: "all",
    statusFilter: "all",
  });

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const sortOptions = [
    { label: "Quality Score", value: "score" },
    { label: "Records Count", value: "recordsCount" },
    { label: "Item Name", value: "name" },
    { label: "Last Updated", value: "lastUpdated" },
  ];

  // Filtering
  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(filterState.searchQuery.toLowerCase())) ||
      item.id.toLowerCase().includes(filterState.searchQuery.toLowerCase());
    const matchesCat =
      filterState.selectedCategory === "all" || item.category === filterState.selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[filterState.sortBy as keyof CatalogItem];
    let valB = b[filterState.sortBy as keyof CatalogItem];
    if (typeof valA === "string") valA = (valA as string).toLowerCase();
    if (typeof valB === "string") valB = (valB as string).toLowerCase();

    if (valA < valB) return filterState.sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return filterState.sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sorted.length) setSelectedIds([]);
    else setSelectedIds(sorted.map((i) => i.id));
  };

  const selectedItems = items.filter((i) => selectedIds.includes(i.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Filter & Sort Bar */}
      <FilterSortBar
        state={filterState}
        onChange={setFilterState}
        categories={categories}
        sortOptions={sortOptions}
        totalResults={sorted.length}
      />

      {/* Bulk Actions & View Switcher Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Checkbox
            checked={selectedIds.length > 0 && selectedIds.length === sorted.length}
            indeterminate={selectedIds.length > 0 && selectedIds.length < sorted.length}
            onChange={handleSelectAll}
            style={{ margin: 0 }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700 }}>
              Select All ({selectedIds.length} selected)
            </span>
          </Checkbox>

          {selectedIds.length >= 2 && onCompareSelected && (
            <Button
              intent="primary"
              icon="comparison"
              text={`Compare Selected (${selectedIds.length})`}
              onClick={() => onCompareSelected(selectedItems)}
            />
          )}

          {selectedIds.length > 0 && (
            <Button minimal icon="download" text="Export Batch" small />
          )}
        </div>

        <ButtonGroup>
          <Button
            icon="list"
            active={viewMode === "list"}
            onClick={() => setViewMode("list")}
            title="List View"
          />
          <Button
            icon="grid-view"
            active={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          />
        </ButtonGroup>
      </div>

      {/* Render Items */}
      {viewMode === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sorted.map((item) => (
            <Card
              key={item.id}
              elevation={Elevation.ONE}
              style={{
                backgroundColor: "var(--x52-card-bg)",
                border: selectedIds.includes(item.id)
                  ? "1px solid #388bfd"
                  : "1px solid var(--x52-border)",
                borderRadius: "8px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 2, minWidth: "260px" }}>
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggleSelect(item.id)}
                  style={{ margin: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "2px" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                    <code>{item.id}</code> • {item.recordsCount.toLocaleString()} Records • Updated {item.lastUpdated}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {item.tags.map((tag) => (
                  <Tag key={tag} minimal round style={{ fontSize: "10px" }}>
                    {tag}
                  </Tag>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    {item.score}%
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--x52-text-muted)" }}>QUALITY</div>
                </div>

                <Tag
                  intent={
                    item.status === "ONLINE"
                      ? Intent.SUCCESS
                      : item.status === "SYNCING"
                      ? Intent.PRIMARY
                      : Intent.NONE
                  }
                  round
                  minimal
                  style={{ fontWeight: 700 }}
                >
                  {item.status}
                </Tag>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {sorted.map((item) => (
            <Card
              key={item.id}
              elevation={Elevation.ONE}
              style={{
                backgroundColor: "var(--x52-card-bg)",
                border: selectedIds.includes(item.id)
                  ? "1px solid #388bfd"
                  : "1px solid var(--x52-border)",
                borderRadius: "10px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggleSelect(item.id)}
                  style={{ margin: 0 }}
                />
                <Tag
                  intent={item.status === "ONLINE" ? Intent.SUCCESS : Intent.PRIMARY}
                  round
                  minimal
                >
                  {item.status}
                </Tag>
              </div>

              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>
                  {item.name}
                </h4>
                <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
                  {item.recordsCount.toLocaleString()} Records
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {item.tags.map((t) => (
                  <Tag key={t} minimal style={{ fontSize: "10px" }}>{t}</Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
