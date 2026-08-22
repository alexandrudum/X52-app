import React from "react";
import { Card, Elevation, Tag, Intent } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import { Sparkline } from "../../../components/Sparkline";

interface MetricStatWidgetProps {
  title: string;
  value: string;
  delta?: string;
  intent?: Intent;
  sparklineData?: number[];
  sparklineColor?: string;
  subtitle?: string;
}

/**
 * Shared widget frame: flat 1px hairline + a background step, never a drop
 * shadow. Widgets sit inside a composed layout, so elevation is reserved for
 * genuine overlays (dialogs, popovers).
 */
const FRAME: React.CSSProperties = {
  backgroundColor: "var(--x52-card-bg)",
  border: "1px solid var(--x52-border-subtle)",
  borderRadius: "var(--x52-radius)",
  boxShadow: "none",
};

/**
 * A delta must never be readable by colour alone. Any leading arrow / sign in
 * the caller's string is promoted to an icon; otherwise the intent supplies a
 * status glyph. The numeric sign always survives in the text.
 */
const DIRECTION_ICON: Record<"up" | "down", IconName> = {
  up: "arrow-up",
  down: "arrow-down",
};

const INTENT_ICON: Partial<Record<Intent, IconName>> = {
  [Intent.SUCCESS]: "tick-circle",
  [Intent.WARNING]: "warning-sign",
  [Intent.DANGER]: "error",
  [Intent.PRIMARY]: "info-sign",
};

function describeDelta(delta: string, intent: Intent) {
  const trimmed = delta.trim();
  const direction = /^[↑+]/.test(trimmed)
    ? "up"
    : /^[↓−-]/.test(trimmed)
      ? "down"
      : null;
  const text = direction
    ? trimmed.replace(/^[↑↓]\s*/, "")
    : trimmed;
  return {
    text,
    icon: direction ? DIRECTION_ICON[direction] : INTENT_ICON[intent],
  };
}

export const MetricStatWidget: React.FC<MetricStatWidgetProps> = ({
  title,
  value,
  delta,
  intent = Intent.SUCCESS,
  sparklineData = [20, 35, 30, 48, 52, 60, 58, 75, 88],
  // Series colours come from the chart-only viz ramp, never from an Intent.
  sparklineColor = "var(--x52-viz-cerulean)",
  subtitle,
}) => {
  const deltaParts = delta ? describeDelta(delta, intent) : null;

  return (
    <Card
      elevation={Elevation.ZERO}
      style={{
        ...FRAME,
        padding: "var(--x52-space-4)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "var(--x52-space-3)",
      }}
    >
      <div
        style={{
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "var(--x52-space-1)",
        }}
      >
        <span className="x52-label">{title}</span>
        <span
          className="x52-numeric"
          style={{
            fontSize: "var(--x52-fs-h3)",
            fontWeight: "var(--x52-fw-bold)",
            color: "var(--x52-heading)",
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>
        {deltaParts && (
          <Tag minimal intent={intent} icon={deltaParts.icon}>
            {deltaParts.text}
          </Tag>
        )}
        {subtitle && (
          <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Decorative trend only — the value and delta carry the meaning. */}
      <div aria-hidden="true" style={{ flex: "none" }}>
        <Sparkline
          data={sparklineData}
          color={sparklineColor}
          width={104}
          height={32}
          fill={false}
        />
      </div>
    </Card>
  );
};
