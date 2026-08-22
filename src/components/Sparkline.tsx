import React, { useId } from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
}

/**
 * Minimal trend line for a metric tile. Purely decorative alongside the
 * numeric value it accompanies, so it is hidden from assistive tech — the
 * figure next to it carries the meaning.
 *
 * `color` accepts any CSS colour; callers should pass a `--x52-viz-*` token
 * so series colours stay inside the chart palette.
 */
export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = "var(--x52-viz-cerulean)",
  height = 36,
  width = 120,
  fill = true,
}) => {
  // Stable per-instance id: the gradient can no longer be keyed off `color`
  // now that colours arrive as `var(--x52-viz-*)` rather than a hex literal.
  const gradientId = `x52-spark-${useId().replace(/:/g, "")}`;

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  // Inset the plot so the 2px stroke and its round caps are never clipped.
  const inset = 4;
  const plotHeight = Math.max(height - inset * 2, 1);

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * plotHeight - inset;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", overflow: "visible", flex: "none" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.24} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <path d={areaD} fill={`url(#${gradientId})`} />}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
