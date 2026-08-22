import React from "react";
import { Elevation, Section, SectionCard, Tag } from "@blueprintjs/core";

interface DataPoint {
  label: string;
  value: number;
}

interface TimeSeriesChartWidgetProps {
  title: string;
  data?: DataPoint[];
  metricLabel?: string;
  isDarkMode?: boolean;
}

/** Flat widget frame — a hairline and a background step, no drop shadow. */
const FRAME: React.CSSProperties = {
  backgroundColor: "var(--x52-card-bg)",
  border: "1px solid var(--x52-border-subtle)",
  borderRadius: "var(--x52-radius)",
  boxShadow: "none",
};

/**
 * The single series uses the chart-only viz ramp, never an Intent colour.
 * Cerulean clears 3:1 against both `--x52-card-bg` surfaces (≈4.5:1 on white,
 * ≈3.2:1 on `--x52-dark-gray2`), so the bars stay readable in either theme.
 */
const SERIES_COLOR = "var(--x52-viz-cerulean)";

const PLOT_HEIGHT = 160;
const GRIDLINES = [0, 0.25, 0.5, 0.75, 1];

export const TimeSeriesChartWidget: React.FC<TimeSeriesChartWidgetProps> = ({
  title,
  data = [
    { label: "18:00", value: 42 },
    { label: "19:00", value: 58 },
    { label: "20:00", value: 74 },
    { label: "21:00", value: 92 },
    { label: "22:00", value: 85 },
    { label: "23:00", value: 110 },
  ],
  metricLabel = "Throughput (GB/s)",
}) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const axisTicks = [maxVal, Math.round(maxVal / 2), 0];

  return (
    <Section
      compact
      elevation={Elevation.ZERO}
      style={FRAME}
      title={<span className="x52-label">{title}</span>}
      subtitle={metricLabel}
      rightElement={<Tag minimal>Hourly aggregation</Tag>}
    >
      <SectionCard>
        <div style={{ display: "flex", gap: "var(--x52-space-3)" }}>
          {/* Y axis */}
          <div
            className="x52-numeric"
            aria-hidden="true"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: `${PLOT_HEIGHT}px`,
              fontSize: "var(--x52-fs-small)",
              color: "var(--x52-text-muted)",
              lineHeight: 1,
              flex: "none",
            }}
          >
            {axisTicks.map((tick, idx) => (
              <span key={`${tick}-${idx}`}>{tick}</span>
            ))}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Plot area. The bars are decorative; every value is repeated as
                real text in the axis row below, so nothing is lost to a
                screen reader. */}
            <div
              aria-hidden="true"
              style={{ position: "relative", height: `${PLOT_HEIGHT}px` }}
            >
              {GRIDLINES.map((fraction) => (
                <div
                  key={fraction}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${(1 - fraction) * 100}%`,
                    borderTop: "1px solid var(--x52-border-subtle)",
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "var(--x52-space-2)",
                }}
              >
                {data.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-end",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "32px",
                        height: `${(item.value / maxVal) * 100}%`,
                        backgroundColor: SERIES_COLOR,
                        borderRadius: "var(--x52-radius) var(--x52-radius) 0 0",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* X axis: value over tick label, both on the bar's column. */}
            <div
              style={{
                display: "flex",
                gap: "var(--x52-space-2)",
                paddingTop: "var(--x52-space-2)",
                borderTop: "1px solid var(--x52-border)",
              }}
            >
              {data.map((item) => (
                <div
                  key={item.label}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "var(--x52-space-1)",
                  }}
                >
                  <span
                    className="x52-numeric"
                    style={{
                      fontSize: "var(--x52-fs-small)",
                      fontWeight: "var(--x52-fw-medium)",
                      color: "var(--x52-text)",
                    }}
                  >
                    {item.value}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--x52-fs-small)",
                      color: "var(--x52-text-muted)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </Section>
  );
};
