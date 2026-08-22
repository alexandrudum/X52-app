import React from "react";
import { Button, Tooltip } from "@blueprintjs/core";
import { PALETTE_GROUPS, type WidgetType } from "./model";

interface WidgetPaletteProps {
  onAddWidget: (type: WidgetType) => void;
}

/**
 * Left rail of the composer. A flat, dense command list: every entry is a real
 * button, none of them carry an intent — the palette is navigation, and colour
 * here would compete with the one primary action in the toolbar.
 */
export const WidgetPalette: React.FC<WidgetPaletteProps> = ({ onAddWidget }) => (
  <nav
    aria-label="Element library"
    style={{
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      backgroundColor: "var(--x52-card-bg)",
      borderRight: "1px solid var(--x52-border-subtle)",
    }}
  >
    <div
      style={{
        padding: "var(--x52-space-2) var(--x52-space-3)",
        borderBottom: "1px solid var(--x52-border-subtle)",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "var(--x52-fs-base)",
          fontWeight: "var(--x52-fw-bold)",
          color: "var(--x52-heading)",
        }}
      >
        Elements
      </h2>
    </div>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--x52-space-3)",
        padding: "var(--x52-space-3) var(--x52-space-2)",
        overflowY: "auto",
      }}
    >
      {PALETTE_GROUPS.map((group) => (
        <div key={group.id} style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-1)" }}>
          <div className="x52-label" style={{ padding: "0 var(--x52-space-1) var(--x52-space-1)" }}>
            {group.label}
          </div>
          {group.entries.map((entry) => (
            <Tooltip
              key={entry.type}
              content={entry.description}
              placement="right"
              hoverOpenDelay={400}
              fill
            >
              <Button
                variant="minimal"
                alignText="start"
                fill
                icon={entry.icon}
                text={entry.label}
                aria-label={`Add ${entry.label} to the canvas`}
                onClick={() => onAddWidget(entry.type)}
              />
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  </nav>
);
