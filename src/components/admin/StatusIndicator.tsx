import React from "react";

/**
 * Tone drives only the dot colour. Colour is never the sole signal in the
 * control plane: the dot always ships with a text label beside it.
 */
export type StatusTone = "success" | "warning" | "danger" | "neutral";

const TONE_COLOR: Record<StatusTone, string> = {
  success: "var(--x52-intent-success)",
  warning: "var(--x52-intent-warning)",
  danger: "var(--x52-intent-danger)",
  neutral: "var(--x52-text-muted)",
};

export interface StatusIndicatorProps {
  tone: StatusTone;
  /** Human-readable state, e.g. "Online". Required — the dot alone is not accessible. */
  label: string;
  /** Adds the quiet pulse reserved for a live feed. Honours prefers-reduced-motion. */
  live?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ tone, label, live = false }) => {
  const className = [
    "x52-status-dot",
    tone === "neutral" ? null : `x52-status-dot--${tone}`,
    live ? "x52-status-dot--live" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--x52-space-2)",
        whiteSpace: "nowrap",
      }}
    >
      {/* `color` only feeds the pulse box-shadow; the fill comes from the modifier class. */}
      <span aria-hidden="true" className={className} style={{ color: TONE_COLOR[tone] }} />
      <span>{label}</span>
    </span>
  );
};
