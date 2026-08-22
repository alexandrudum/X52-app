import React, { useState } from "react";
import {
  Card,
  Elevation,
  InputGroup,
  Button,
  Tag,
  Intent,
  Spinner,
} from "@blueprintjs/core";
import type { OntologyInstance } from "../widgetTypes";

interface AIPAssistWidgetProps {
  selectedObject: OntologyInstance | null;
  isDarkMode?: boolean;
}

export const AIPAssistWidget: React.FC<AIPAssistWidgetProps> = ({
  selectedObject,
  isDarkMode: _isDarkMode = true,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(
    selectedObject
      ? `AIP Analysis for ${selectedObject.title}: Object is performing nominally. Node allocation is healthy and all 3 linked ontology relationships are synchronized.`
      : "Ask Palantir AIP to summarize, detect anomalies, or optimize selected ontology objects."
  );

  const handleAskAIP = () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResponse(
        `AIP reasoning for "${prompt}" over ${selectedObject?.title || "Cluster State"}: Detected 0 critical anomalies. Telemetry throughput is running within the top 5th percentile of expected baseline.`
      );
      setPrompt("");
    }, 800);
  };

  return (
    <Card
      elevation={Elevation.ONE}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: "1px solid var(--x52-border-subtle)",
        borderRadius: "10px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Tag minimal round intent={Intent.PRIMARY} style={{ fontWeight: 800 }}>
            PALANTIR AIP ASSISTANT
          </Tag>
          <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>
            Context: <strong>{selectedObject?.title || "Global Ontology"}</strong>
          </span>
        </div>
      </div>

      <div
        style={{
          padding: "14px 16px",
          borderRadius: "8px",
          backgroundColor: "var(--x52-card-secondary)",
          border: "1px solid var(--x52-border)",
          fontSize: "13px",
          lineHeight: "1.6",
          minHeight: "60px",
        }}
      >
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Spinner size={18} intent={Intent.PRIMARY} />
            <span>AIP is reasoning over ontology link graph...</span>
          </div>
        ) : (
          response
        )}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <InputGroup
          placeholder={`Ask AIP about ${selectedObject ? selectedObject.title : "this workspace"}...`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAskAIP()}
          fill
          small
        />
        <Button
          intent="primary"
          icon="chat"
          text="Ask AIP"
          loading={isLoading}
          onClick={handleAskAIP}
          small
        />
      </div>
    </Card>
  );
};
