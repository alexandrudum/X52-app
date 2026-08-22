import React from "react";
import {
  InputGroup,
  HTMLSelect,
  Button,
  ButtonGroup,
  Tag,
  Intent,
} from "@blueprintjs/core";

export interface FilterSortState {
  searchQuery: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  selectedCategory: string;
  statusFilter: string;
}

interface FilterSortBarProps {
  state: FilterSortState;
  onChange: (newState: FilterSortState) => void;
  categories: string[];
  sortOptions: { label: string; value: string }[];
  totalResults: number;
}

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  state,
  onChange,
  categories,
  sortOptions,
  totalResults,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px 20px",
        backgroundColor: "var(--x52-card-bg)",
        border: "1px solid var(--x52-border-subtle)",
        borderRadius: "10px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        {/* Search Bar */}
        <div style={{ flex: 1, minWidth: "260px" }}>
          <InputGroup
            leftIcon="search"
            placeholder="Search items, tags, or IDs..."
            value={state.searchQuery}
            onChange={(e) => onChange({ ...state, searchQuery: e.target.value })}
            rightElement={
              state.searchQuery ? (
                <Button minimal icon="cross" onClick={() => onChange({ ...state, searchQuery: "" })} />
              ) : undefined
            }
          />
        </div>

        {/* Sort & Order Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)" }}>SORT BY:</span>
          <HTMLSelect
            value={state.sortBy}
            onChange={(e) => onChange({ ...state, sortBy: e.target.value })}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </HTMLSelect>

          <ButtonGroup>
            <Button
              icon="sort-asc"
              active={state.sortOrder === "asc"}
              onClick={() => onChange({ ...state, sortOrder: "asc" })}
              title="Ascending"
            />
            <Button
              icon="sort-desc"
              active={state.sortOrder === "desc"}
              onClick={() => onChange({ ...state, sortOrder: "desc" })}
              title="Descending"
            />
          </ButtonGroup>

          <Tag minimal round intent={Intent.PRIMARY} style={{ fontWeight: 700, marginLeft: "6px" }}>
            {totalResults} ITEMS
          </Tag>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--x52-text-muted)", marginRight: "4px" }}>
          CATEGORY:
        </span>
        <Tag
          interactive
          round
          intent={state.selectedCategory === "all" ? Intent.PRIMARY : Intent.NONE}
          onClick={() => onChange({ ...state, selectedCategory: "all" })}
          style={{ cursor: "pointer", fontWeight: 600 }}
        >
          All Categories
        </Tag>
        {categories.map((cat) => (
          <Tag
            key={cat}
            interactive
            round
            intent={state.selectedCategory === cat ? Intent.PRIMARY : Intent.NONE}
            onClick={() => onChange({ ...state, selectedCategory: cat })}
            style={{ cursor: "pointer", fontWeight: 600 }}
          >
            {cat}
          </Tag>
        ))}
      </div>
    </div>
  );
};
