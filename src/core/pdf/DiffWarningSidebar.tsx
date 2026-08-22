import React, { useState } from "react";
import {
  Card,
  Elevation,
  Tag,
  Intent,
  InputGroup,
  Button,
  Divider,
} from "@blueprintjs/core";
import type { PDFDiffItem } from "./pdfDiffTypes";

interface DiffWarningSidebarProps {
  diffItems: PDFDiffItem[];
  selectedDiffId: string | null;
  onSelectDiff: (diffId: string) => void;
  isDarkMode?: boolean;
}

export const DiffWarningSidebar: React.FC<DiffWarningSidebarProps> = ({
  diffItems,
  selectedDiffId,
  onSelectDiff,
  isDarkMode: _isDarkMode = true,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = diffItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.section.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesSev = filterSeverity === "all" || item.severity === filterSeverity;
    return matchesSearch && matchesSev;
  });

  const highCount = diffItems.filter((i) => i.severity === "HIGH").length;
  const medCount = diffItems.filter((i) => i.severity === "MEDIUM").length;

  return (
    <Card
      elevation={Elevation.ONE}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: "1px solid var(--x52-border-subtle)",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Sidebar Header */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800 }}>
            Detected Differences ({diffItems.length})
          </h3>
          <Tag minimal round intent={highCount > 0 ? Intent.DANGER : Intent.PRIMARY} style={{ fontWeight: 700 }}>
            {highCount} HIGH RISK
          </Tag>
        </div>
        <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
          Click any warning to focus and highlight the line callout in both viewers.
        </span>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "6px" }}>
        <Button
          small
          minimal
          text="All"
          active={filterSeverity === "all"}
          onClick={() => setFilterSeverity("all")}
        />
        <Button
          small
          minimal
          intent="danger"
          text={`High (${highCount})`}
          active={filterSeverity === "HIGH"}
          onClick={() => setFilterSeverity("HIGH")}
        />
        <Button
          small
          minimal
          intent="warning"
          text={`Medium (${medCount})`}
          active={filterSeverity === "MEDIUM"}
          onClick={() => setFilterSeverity("MEDIUM")}
        />
      </div>

      <InputGroup
        leftIcon="search"
        placeholder="Filter warnings..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        small
        round
      />

      <Divider style={{ margin: "2px 0" }} />

      {/* Warnings List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", maxHeight: "680px", paddingRight: "4px" }}>
        {filtered.map((item) => {
          const isSelected = selectedDiffId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectDiff(item.id)}
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                backgroundColor: isSelected
                  ? "rgba(56, 139, 253, 0.12)"
                  : "var(--x52-card-secondary)",
                border: isSelected
                  ? "2px solid #388bfd"
                  : "1px solid var(--x52-border)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Tag
                    intent={item.severity === "HIGH" ? Intent.DANGER : Intent.WARNING}
                    round
                    minimal
                    style={{ fontWeight: 800, fontSize: "9px" }}
                  >
                    {item.severity}
                  </Tag>
                  <Tag minimal style={{ fontSize: "9px" }}>{item.category}</Tag>
                </div>
                <span style={{ fontSize: "10px", color: "var(--x52-text-muted)", fontFamily: "var(--font-mono)" }}>
                  Pg {item.pageNumber} : L{item.lineNumber}
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: "13px", lineHeight: 1.3 }}>
                {item.title}
              </div>

              <p style={{ margin: 0, fontSize: "11px", color: "var(--x52-text-muted)", lineHeight: 1.4 }}>
                {item.description}
              </p>

              {/* Pre vs Post Mini Diff Snippet */}
              {isSelected && (
                <div
                  style={{
                    marginTop: "6px",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    fontSize: "11px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <div style={{ color: "#f87171" }}>
                    - PRE: "{item.preText.substring(0, 70)}..."
                  </div>
                  <div style={{ color: "#4ade80" }}>
                    + POST: "{item.postText.substring(0, 70)}..."
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
