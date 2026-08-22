import React from "react";
import { Card, Elevation, Tag, Intent } from "@blueprintjs/core";
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

export const MetricStatWidget: React.FC<MetricStatWidgetProps> = ({
  title,
  value,
  delta,
  intent = Intent.SUCCESS,
  sparklineData = [20, 35, 30, 48, 52, 60, 58, 75, 88],
  sparklineColor = "#22c55e",
  subtitle,
}) => {
  return (
    <Card
      elevation={Elevation.ONE}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: "1px solid var(--x52-border)",
        borderRadius: "10px",
        padding: "18px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
      }}
    >
      <div>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--x52-text-muted)", marginBottom: "4px" }}>
          {title.toUpperCase()}
        </div>
        <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.03em", marginBottom: "4px" }}>
          {value}
        </div>
        {delta && (
          <Tag minimal round intent={intent} style={{ fontWeight: 700, fontSize: "11px" }}>
            {delta}
          </Tag>
        )}
        {subtitle && (
          <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", marginTop: "4px" }}>
            {subtitle}
          </div>
        )}
      </div>
      <Sparkline data={sparklineData} color={sparklineColor} width={110} height={42} />
    </Card>
  );
};
