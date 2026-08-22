import React, { useState } from "react";
import {
  Alignment,
  Button,
  Elevation,
  HTMLTable,
  InputGroup,
  Intent,
  NonIdealState,
  NonIdealStateIconSize,
  Section,
  SectionCard,
  Tag,
} from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { OntologyInstance } from "../widgetTypes";

interface ObjectTableWidgetProps {
  objects: OntologyInstance[];
  selectedObject: OntologyInstance | null;
  onSelectObject: (obj: OntologyInstance) => void;
  title?: string;
  isDarkMode?: boolean;
}

/** Flat widget frame — a hairline and a background step, no drop shadow. */
const FRAME: React.CSSProperties = {
  backgroundColor: "var(--x52-card-bg)",
  border: "1px solid var(--x52-border-subtle)",
  borderRadius: "var(--x52-radius)",
  boxShadow: "none",
};

const HEAD_CELL: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  backgroundColor: "var(--x52-card-secondary)",
  borderBottom: "1px solid var(--x52-border)",
  padding: 0,
  whiteSpace: "nowrap",
};

const CELL: React.CSSProperties = {
  padding: "var(--x52-space-2) var(--x52-space-3)",
  verticalAlign: "middle",
};

type SortKey = "id" | "title" | "type" | "Throughput";

/**
 * Sort values are read from the object's own fields first and only then from
 * the property bag — the previous lookup went straight to `properties`, so
 * sorting by "Object ID" silently fell back to sorting by title.
 */
function sortValue(obj: OntologyInstance, key: SortKey): string {
  if (key === "id") return obj.id;
  if (key === "title") return obj.title;
  if (key === "type") return obj.type;
  return String(obj.properties[key] ?? "");
}

/** "148.2 GB/s" must sort above "92.4 GB/s"; a plain string compare does not. */
function compareValues(a: string, b: string): number {
  const numA = Number.parseFloat(a);
  const numB = Number.parseFloat(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) {
    return numA - numB;
  }
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

function statusIntent(status: string): Intent {
  if (status === "ONLINE" || status === "OPTIMAL" || status === "STABLE") return Intent.SUCCESS;
  if (status === "SYNCING") return Intent.PRIMARY;
  return Intent.WARNING;
}

function statusIcon(status: string): IconName {
  const intent = statusIntent(status);
  if (intent === Intent.SUCCESS) return "tick-circle";
  if (intent === Intent.PRIMARY) return "refresh";
  return "warning-sign";
}

export const ObjectTableWidget: React.FC<ObjectTableWidgetProps> = ({
  objects,
  selectedObject,
  onSelectObject,
  title = "Ontology object set",
}) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const filtered = objects.filter((o) => {
    const term = search.toLowerCase();
    return (
      o.title.toLowerCase().includes(term) ||
      o.id.toLowerCase().includes(term) ||
      o.type.toLowerCase().includes(term)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const result = compareValues(sortValue(a, sortKey), sortValue(b, sortKey));
    return sortAsc ? result : -result;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortHeader = (key: SortKey, label: string, align: "left" | "right" = "left") => (
    <th
      scope="col"
      aria-sort={sortKey === key ? (sortAsc ? "ascending" : "descending") : "none"}
      style={{ ...HEAD_CELL, textAlign: align }}
    >
      <Button
        variant="minimal"
        size="small"
        className="x52-label"
        fill
        alignText={align === "right" ? Alignment.END : Alignment.START}
        endIcon={
          sortKey === key
            ? sortAsc
              ? "chevron-up"
              : "chevron-down"
            : "double-caret-vertical"
        }
        text={label}
        onClick={() => handleSort(key)}
      />
    </th>
  );

  const staticHeader = (label: string, width?: string) => (
    <th
      scope="col"
      style={{
        ...HEAD_CELL,
        padding: "var(--x52-space-2) var(--x52-space-3)",
        width,
      }}
    >
      <span className="x52-label">{label}</span>
    </th>
  );

  return (
    <Section
      compact
      elevation={Elevation.ZERO}
      style={FRAME}
      title={<span className="x52-label">{title}</span>}
      rightElement={
        <>
          <Tag minimal>
            <span className="x52-numeric">{sorted.length}</span> of{" "}
            <span className="x52-numeric">{objects.length}</span>
          </Tag>
          <InputGroup
            leftIcon="search"
            size="small"
            aria-label="Search the object set"
            placeholder="Search objects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "200px" }}
          />
        </>
      }
    >
      <SectionCard padded={false}>
        {sorted.length === 0 ? (
          <div style={{ padding: "var(--x52-space-6) var(--x52-space-4)" }}>
            <NonIdealState
              icon="search"
              iconSize={NonIdealStateIconSize.EXTRA_SMALL}
              title="No matching objects"
              description="No ontology object matches the current search term."
              action={
                <Button
                  variant="minimal"
                  size="small"
                  text="Clear search"
                  onClick={() => setSearch("")}
                />
              }
            />
          </div>
        ) : (
          <div style={{ maxHeight: "320px", overflow: "auto" }}>
            <HTMLTable compact interactive style={{ width: "100%" }}>
              <thead>
                <tr>
                  {sortHeader("id", "Object ID")}
                  {sortHeader("title", "Instance title")}
                  {sortHeader("type", "Ontology type")}
                  {sortHeader("Throughput", "Throughput", "right")}
                  {staticHeader("Status")}
                  {staticHeader("Select", "72px")}
                </tr>
              </thead>
              <tbody>
                {sorted.map((obj) => {
                  const isSelected = selectedObject?.id === obj.id;
                  const status = String(obj.properties["Status"] ?? "UNKNOWN");
                  return (
                    <tr
                      key={obj.id}
                      aria-selected={isSelected}
                      onClick={() => onSelectObject(obj)}
                      style={{
                        cursor: "pointer",
                        // Selection is carried by a rail plus a background step,
                        // so it survives greyscale and colour-blindness.
                        backgroundColor: isSelected ? "var(--x52-row-hover)" : undefined,
                        boxShadow: isSelected
                          ? "inset 2px 0 0 0 var(--x52-intent-primary)"
                          : undefined,
                      }}
                    >
                      <td style={{ ...CELL, width: "132px" }}>
                        <span
                          className="x52-numeric"
                          style={{ fontSize: "var(--x52-fs-small)" }}
                        >
                          {obj.id}
                        </span>
                      </td>
                      <td style={{ ...CELL, fontWeight: "var(--x52-fw-medium)" }}>
                        {obj.title}
                      </td>
                      <td style={CELL}>
                        <Tag minimal>{obj.type}</Tag>
                      </td>
                      <td
                        className="x52-numeric"
                        style={{ ...CELL, textAlign: "right" }}
                      >
                        {String(obj.properties["Throughput"] ?? "—")}
                      </td>
                      <td style={CELL}>
                        <Tag minimal intent={statusIntent(status)} icon={statusIcon(status)}>
                          {status}
                        </Tag>
                      </td>
                      <td style={{ ...CELL, textAlign: "right" }}>
                        <Button
                          size="small"
                          variant="minimal"
                          icon={isSelected ? "tick" : "chevron-right"}
                          intent={isSelected ? Intent.PRIMARY : Intent.NONE}
                          aria-label={
                            isSelected
                              ? `${obj.title} is selected`
                              : `Select ${obj.title}`
                          }
                          aria-pressed={isSelected}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectObject(obj);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </HTMLTable>
          </div>
        )}
      </SectionCard>
    </Section>
  );
};
