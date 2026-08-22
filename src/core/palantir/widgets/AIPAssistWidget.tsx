import React, { useId, useState } from "react";
import {
  Button,
  Callout,
  ControlGroup,
  Elevation,
  FormGroup,
  InputGroup,
  Intent,
  Section,
  SectionCard,
  Spinner,
  SpinnerSize,
  Tag,
} from "@blueprintjs/core";
import type { OntologyInstance } from "../widgetTypes";

interface AIPAssistWidgetProps {
  selectedObject: OntologyInstance | null;
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
 * Dense transcript row. Deliberately not a chat bubble: a square surface, a
 * small muted speaker label, and body text on the same 4px rhythm as the rest
 * of the suite — this is an analyst tool, not a messaging app.
 */
const MESSAGE_ROW: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "56px 1fr",
  columnGap: "var(--x52-space-3)",
  alignItems: "baseline",
  padding: "var(--x52-space-2) 0",
  borderTop: "1px solid var(--x52-border-subtle)",
};

const SPEAKER: React.CSSProperties = {
  fontSize: "var(--x52-fs-small)",
  fontWeight: "var(--x52-fw-bold)",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--x52-text-muted)",
};

export const AIPAssistWidget: React.FC<AIPAssistWidgetProps> = ({
  selectedObject,
}) => {
  const promptId = useId();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [citations, setCitations] = useState<string[]>(
    selectedObject ? [selectedObject.id] : [],
  );
  const [response, setResponse] = useState<string>(
    selectedObject
      ? `Object is performing nominally. Node allocation is healthy and all linked ontology relationships are synchronized.`
      : "Ask AIP to summarize, detect anomalies, or optimize the selected ontology objects.",
  );

  const handleAskAIP = () => {
    const question = prompt.trim();
    if (!question) return;
    setIsLoading(true);
    setLastQuestion(question);
    setTimeout(() => {
      setIsLoading(false);
      setResponse(
        `Detected 0 critical anomalies across ${
          selectedObject?.title ?? "the cluster state"
        }. Telemetry throughput is running within the top 5th percentile of the expected baseline.`,
      );
      setCitations(selectedObject ? [selectedObject.id, selectedObject.type] : []);
      setPrompt("");
    }, 800);
  };

  return (
    <Section
      compact
      elevation={Elevation.ZERO}
      style={FRAME}
      title={<span className="x52-label">AIP assistant</span>}
      rightElement={
        <Tag minimal icon="database">
          <span className="x52-numeric">
            {selectedObject?.id ?? "GLOBAL-ONTOLOGY"}
          </span>
        </Tag>
      }
    >
      <SectionCard>
        {/* Live region: announced politely, never focused, so a running
            answer cannot pull the caret out of the input. */}
        <div
          role="status"
          aria-live="polite"
          aria-busy={isLoading}
          style={{
            backgroundColor: "var(--x52-card-secondary)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "var(--x52-radius)",
            padding: "0 var(--x52-space-3) var(--x52-space-2)",
            marginBottom: "var(--x52-space-3)",
          }}
        >
          {lastQuestion && (
            <div style={{ ...MESSAGE_ROW, borderTop: "none" }}>
              <span style={SPEAKER}>Analyst</span>
              <span style={{ color: "var(--x52-text-muted)" }}>{lastQuestion}</span>
            </div>
          )}
          <div
            style={{
              ...MESSAGE_ROW,
              borderTop: lastQuestion ? MESSAGE_ROW.borderTop : "none",
            }}
          >
            <span style={SPEAKER}>AIP</span>
            {isLoading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--x52-space-2)",
                  color: "var(--x52-text-muted)",
                }}
              >
                <Spinner size={SpinnerSize.SMALL} />
                Reasoning over the ontology link graph…
              </span>
            ) : (
              <span style={{ color: "var(--x52-text)" }}>{response}</span>
            )}
          </div>
        </div>

        {!isLoading && citations.length > 0 && (
          <Callout
            icon="citation"
            title="Grounded in"
            style={{ marginBottom: "var(--x52-space-3)" }}
          >
            <span className="x52-numeric" style={{ fontSize: "var(--x52-fs-small)" }}>
              {citations.join("  ·  ")}
            </span>
          </Callout>
        )}

        <FormGroup
          label={<span className="x52-label">Prompt</span>}
          labelFor={promptId}
          style={{ marginBottom: 0 }}
        >
          <ControlGroup fill>
            <InputGroup
              id={promptId}
              size="small"
              fill
              placeholder={`Ask AIP about ${
                selectedObject ? selectedObject.title : "this workspace"
              }`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAskAIP();
              }}
            />
            <Button
              size="small"
              intent={Intent.PRIMARY}
              icon="send-message"
              text="Ask"
              loading={isLoading}
              disabled={!prompt.trim()}
              onClick={handleAskAIP}
            />
          </ControlGroup>
        </FormGroup>
      </SectionCard>
    </Section>
  );
};
