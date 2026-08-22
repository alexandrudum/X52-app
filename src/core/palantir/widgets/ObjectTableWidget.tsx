import React, { useState } from "react";
import {
  Card,
  Elevation,
  InputGroup,
  Tag,
  Intent,
  Button,
} from "@blueprintjs/core";
import type { OntologyInstance } from "../widgetTypes";

interface ObjectTableWidgetProps {
  objects: OntologyInstance[];
  selectedObject: OntologyInstance | null;
  onSelectObject: (obj: OntologyInstance) => void;
  title?: string;
  isDarkMode?: boolean;
}

export const ObjectTableWidget: React.FC<ObjectTableWidgetProps> = ({
  objects,
  selectedObject,
  onSelectObject,
  title = "Ontology Object Set (Table View)",
  isDarkMode = true,
}) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("title");
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
    const valA = String(a.properties[sortKey] || a.title).toLowerCase();
    const valB = String(b.properties[sortKey] || b.title).toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <Card
      elevation={Elevation.ONE}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: "1px solid var(--x52-border-subtle)",
        borderRadius: "10px",
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Table Toolbar */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--x52-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>{title}</h4>
          <Tag minimal round intent={Intent.PRIMARY} style={{ fontWeight: 700, fontSize: "10px" }}>
            {sorted.length} OBJECTS
          </Tag>
        </div>

        <div style={{ width: "240px" }}>
          <InputGroup
            leftIcon="search"
            placeholder="Search object set..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            small
            round
          />
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--x52-card-secondary)", borderBottom: "1px solid var(--x52-border)" }}>
              <th
                onClick={() => handleSort("id")}
                style={{ padding: "10px 16px", textAlign: "left", cursor: "pointer", fontWeight: 700, width: "130px" }}
              >
                Object ID {sortKey === "id" && (sortAsc ? "▲" : "▼")}
              </th>
              <th
                onClick={() => handleSort("title")}
                style={{ padding: "10px 16px", textAlign: "left", cursor: "pointer", fontWeight: 700 }}
              >
                Instance Title {sortKey === "title" && (sortAsc ? "▲" : "▼")}
              </th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700 }}>
                Ontology Type
              </th>
              <th
                onClick={() => handleSort("Throughput")}
                style={{ padding: "10px 16px", textAlign: "left", cursor: "pointer", fontWeight: 700 }}
              >
                Throughput
              </th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700 }}>
                Status
              </th>
              <th style={{ padding: "10px 16px", textAlign: "center", width: "80px", fontWeight: 700 }}>
                Select
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((obj) => {
              const isSelected = selectedObject?.id === obj.id;
              const status = String(obj.properties["Status"] || "ONLINE");
              return (
                <tr
                  key={obj.id}
                  onClick={() => onSelectObject(obj)}
                  style={{
                    borderBottom: "1px solid var(--x52-border)",
                    backgroundColor: isSelected
                      ? isDarkMode
                        ? "rgba(56, 139, 253, 0.15)"
                        : "rgba(56, 139, 253, 0.08)"
                      : undefined,
                    cursor: "pointer",
                    transition: "background-color 0.1s ease",
                  }}
                >
                  <td style={{ padding: "10px 16px" }}>
                    <code style={{ fontSize: "11px", fontWeight: 700 }}>{obj.id}</code>
                  </td>
                  <td style={{ padding: "10px 16px", fontWeight: 600 }}>
                    {obj.title}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <Tag minimal style={{ fontSize: "10px" }}>{obj.type}</Tag>
                  </td>
                  <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    {String(obj.properties["Throughput"] || "—")}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <Tag
                      minimal
                      round
                      intent={
                        status === "ONLINE" || status === "OPTIMAL"
                          ? Intent.SUCCESS
                          : status === "SYNCING"
                          ? Intent.PRIMARY
                          : Intent.WARNING
                      }
                      style={{ fontWeight: 700, fontSize: "10px" }}
                    >
                      {status}
                    </Tag>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "center" }}>
                    <Button
                      small
                      minimal
                      icon={isSelected ? "tick" : "chevron-right"}
                      intent={isSelected ? Intent.PRIMARY : Intent.NONE}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
