import React, { useCallback } from "react";
import { Button, ButtonGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";

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

/**
 * Dense single-row toolbar over a catalog listing: query, category facet, sort
 * key + direction, a clear affordance, and the live result count.
 *
 * Controls sit at Blueprint's 30px default rather than `size="small"`, because
 * `HTMLSelect` has no small variant in v6 and mixing 24px inputs with 30px
 * selects breaks the toolbar baseline.
 */
export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  state,
  onChange,
  categories,
  sortOptions,
  totalResults,
}) => {
  const hasActiveFilters =
    state.searchQuery.trim() !== "" ||
    state.selectedCategory !== "all" ||
    state.statusFilter !== "all";

  const handleClear = useCallback(() => {
    onChange({
      ...state,
      searchQuery: "",
      selectedCategory: "all",
      statusFilter: "all",
    });
  }, [onChange, state]);

  return (
    <div
      className="x52-panel"
      role="search"
      aria-label="Filter and sort the catalog"
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--x52-space-2)",
        padding: "var(--x52-space-2) var(--x52-space-3)",
      }}
    >
      <InputGroup
        aria-label="Search catalog by name, tag, or identifier"
        leftIcon="search"
        placeholder="Name, tag, or ID"
        value={state.searchQuery}
        onValueChange={(searchQuery) => onChange({ ...state, searchQuery })}
        rightElement={
          state.searchQuery ? (
            <Button
              variant="minimal"
              icon="cross"
              aria-label="Clear the search query"
              onClick={() => onChange({ ...state, searchQuery: "" })}
            />
          ) : undefined
        }
        style={{ flex: "1 1 220px", minWidth: "180px" }}
      />

      <label
        className="x52-label"
        htmlFor="x52-catalog-category"
        style={{ marginLeft: "var(--x52-space-2)" }}
      >
        Category
      </label>
      <HTMLSelect
        id="x52-catalog-category"
        value={state.selectedCategory}
        onChange={(e) => onChange({ ...state, selectedCategory: e.currentTarget.value })}
      >
        <option value="all">All categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </HTMLSelect>

      <label
        className="x52-label"
        htmlFor="x52-catalog-sort"
        style={{ marginLeft: "var(--x52-space-2)" }}
      >
        Sort
      </label>
      <HTMLSelect
        id="x52-catalog-sort"
        value={state.sortBy}
        onChange={(e) => onChange({ ...state, sortBy: e.currentTarget.value })}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </HTMLSelect>

      <ButtonGroup variant="outlined" aria-label="Sort direction">
        <Button
          icon="sort-asc"
          aria-label="Sort ascending"
          aria-pressed={state.sortOrder === "asc"}
          active={state.sortOrder === "asc"}
          onClick={() => onChange({ ...state, sortOrder: "asc" })}
        />
        <Button
          icon="sort-desc"
          aria-label="Sort descending"
          aria-pressed={state.sortOrder === "desc"}
          active={state.sortOrder === "desc"}
          onClick={() => onChange({ ...state, sortOrder: "desc" })}
        />
      </ButtonGroup>

      <Button
        variant="minimal"
        icon="filter-remove"
        text="Clear filters"
        disabled={!hasActiveFilters}
        onClick={handleClear}
      />

      <span
        className="x52-muted"
        aria-live="polite"
        style={{
          marginLeft: "auto",
          fontSize: "var(--x52-fs-small)",
          whiteSpace: "nowrap",
        }}
      >
        <span className="x52-numeric">{totalResults}</span> items
      </span>
    </div>
  );
};
