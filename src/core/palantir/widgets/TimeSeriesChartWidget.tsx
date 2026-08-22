import React from "react";
import { Card, Elevation, Tag, Intent } from "@blueprintjs/core";

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
  isDarkMode = true,
}) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card
      elevation={Elevation.ONE}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: "1px solid var(--x52-border-subtle)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>{title}</h4>
          <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>{metricLabel}</span>
        </div>
        <Tag minimal round intent={Intent.PRIMARY} style={{ fontWeight: 700 }}>
          HOURLY AGGREGATION
        </Tag>
      </div>

      {/* Bar Chart Visualization */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "12px",
          height: "140px",
          padding: "10px 0",
          borderBottom: "1px solid var(--x52-border)",
        }}
      >
        {data.map((item, idx) => {
          const heightPct = Math.round((item.value / maxVal) * 100);
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                justifyContent: "flex-end",
                gap: "6px",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                {item.value}
              </div>
              <div
                style={{
                  width: "100%",
                  maxWidth: "32px",
                  height: `${heightPct}%`,
                  borderRadius: "4px 4px 0 0",
                  backgroundColor: isDarkMode ? "#388bfd" : "#0f172a",
                  transition: "height 0.3s ease",
                  boxShadow: isDarkMode ? "0 0 10px rgba(56, 139, 253, 0.4)" : undefined,
                }}
              />
              <div style={{ fontSize: "10px", color: "var(--x52-text-muted)" }}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
