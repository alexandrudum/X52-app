import React, { useMemo, useState } from "react";
import {
  Card,
  Divider,
  Elevation,
  InputGroup,
  Intent,
  NonIdealState,
  NonIdealStateIconSize,
  SegmentedControl,
  Tag,
} from "@blueprintjs/core";
import type { DiffSeverity, PDFDiffItem } from "./pdfDiffTypes";
import { severityIntent } from "./pdfDiffTypes";
import "./pdfDiff.css";

interface DiffWarningSidebarProps {
  diffItems: PDFDiffItem[];
  selectedDiffId: string | null;
  onSelectDiff: (diffId: string) => void;
  isDarkMode?: boolean;
}

type SeverityFilter = "all" | DiffSeverity;

const SNIPPET_LENGTH = 72;

function truncate(text: string): string {
  return text.length > SNIPPET_LENGTH ? `${text.slice(0, SNIPPET_LENGTH)}…` : text;
}

export const DiffWarningSidebar: React.FC<DiffWarningSidebarProps> = ({
  diffItems,
  selectedDiffId,
  onSelectDiff,
  isDarkMode: _isDarkMode = true,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<SeverityFilter>("all");
  const [search, setSearch] = useState("");

  const highCount = useMemo(
    () => diffItems.filter((i) => i.severity === "HIGH").length,
    [diffItems],
  );
  const medCount = useMemo(
    () => diffItems.filter((i) => i.severity === "MEDIUM").length,
    [diffItems],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return diffItems.filter((item) => {
      const matchesSearch =
        needle === "" ||
        item.title.toLowerCase().includes(needle) ||
        item.section.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle);
      const matchesSeverity = filterSeverity === "all" || item.severity === filterSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [diffItems, filterSeverity, search]);

  return (
    <Card
      elevation={Elevation.ZERO}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: "1px solid var(--x52-border-subtle)",
        borderRadius: "var(--x52-radius)",
        boxShadow: "none",
        padding: "var(--x52-space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--x52-space-3)",
        height: "calc(100vh - 220px)",
        minHeight: "560px",
        boxSizing: "border-box",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-1)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "var(--x52-space-2)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "var(--x52-fs-h6)",
              fontWeight: "var(--x52-fw-bold)",
              color: "var(--x52-heading)",
            }}
          >
            Detected differences
          </h2>
          <span className="x52-numeric x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
            {filtered.length} / {diffItems.length}
          </span>
        </div>
        <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
          Select a finding to focus its line callout in both panes.
        </span>
      </header>

      <SegmentedControl
        size="small"
        fill
        aria-label="Filter findings by severity"
        options={[
          { label: `All ${diffItems.length}`, value: "all" },
          { label: `High ${highCount}`, value: "HIGH" },
          { label: `Medium ${medCount}`, value: "MEDIUM" },
        ]}
        value={filterSeverity}
        onValueChange={(value) => setFilterSeverity(value as SeverityFilter)}
      />

      <InputGroup
        size="small"
        leftIcon="search"
        placeholder="Filter findings…"
        aria-label="Filter findings by text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Divider style={{ margin: 0 }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--x52-space-2)",
          overflowY: "auto",
          flex: 1,
          minHeight: 0,
          paddingRight: "var(--x52-space-1)",
        }}
      >
        {filtered.length === 0 ? (
          <NonIdealState
            icon="search"
            iconSize={NonIdealStateIconSize.EXTRA_SMALL}
            title="No matching findings"
            description={
              diffItems.length === 0
                ? "This document pair produced no differences."
                : "No finding matches the current severity filter and search."
            }
          />
        ) : (
          filtered.map((item) => {
            const isSelected = selectedDiffId === item.id;
            const intent = severityIntent(item.severity);
            return (
              <button
                key={item.id}
                type="button"
                className={`x52-pdf-warning x52-pdf-warning--${intent === Intent.DANGER ? "danger" : "warning"}`}
                aria-current={isSelected ? "true" : undefined}
                onClick={() => onSelectDiff(item.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "var(--x52-space-2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-1)" }}>
                    <Tag minimal intent={intent} icon={intent === Intent.DANGER ? "error" : "warning-sign"}>
                      {item.severity}
                    </Tag>
                    <Tag minimal>{item.category.replace("_", " ")}</Tag>
                  </div>
                  <span className="x52-numeric x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
                    p{item.pageNumber}:{item.lineNumber}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: "var(--x52-fs-base)",
                    fontWeight: "var(--x52-fw-medium)",
                    color: "var(--x52-heading)",
                  }}
                >
                  {item.title}
                </span>

                <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
                  {item.section}
                </span>

                {isSelected && (
                  <>
                    <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
                      {item.description}
                    </span>
                    {/* Marker glyphs carry the direction, so the snippet still
                        reads in greyscale or with colour vision deficiency. */}
                    <div className="x52-pdf-snippet">
                      <span className="x52-pdf-snippet__pre">- {truncate(item.preText)}</span>
                      <span className="x52-pdf-snippet__post">+ {truncate(item.postText)}</span>
                    </div>
                  </>
                )}
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
};
