import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  Icon,
} from "@blueprintjs/core";

const PRESET_TEMPLATES = {
  airbusClauseDelta: `// Palantir Foundry Function: Calculate Clause Risk Delta
function execute(payload) {
  const originalPrice = payload.originalPrice || 120000;
  const revisedPrice = payload.revisedPrice || 145000;
  const escalatorRate = 0.05;
  
  const delta = revisedPrice - originalPrice;
  const riskCategory = delta > 20000 ? "HIGH_FINANCIAL_EXPOSURE" : "NORMAL";
  
  return {
    clauseId: "CLAUSE-2.1-PRICING",
    originalPrice,
    revisedPrice,
    financialDeltaUSD: delta,
    annualCompoundedImpact5yr: Math.round(revisedPrice * Math.pow(1 + escalatorRate, 5)),
    complianceRisk: riskCategory,
    status: "PROCESSED_BY_V8_ISOLATE"
  };
}

return execute(payload);`,

  vectorCosineSearch: `// Palantir Vector Kernel: Fast Cosine Similarity
function execute(payload) {
  const vecA = payload.vecA || [0.12, 0.85, 0.44, 0.91, 0.33];
  const vecB = payload.vecB || [0.14, 0.81, 0.49, 0.88, 0.31];
  
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const score = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return {
    similarityScore: Number(score.toFixed(4)),
    confidence: score > 0.85 ? "HIGH_CONFIDENCE_MATCH" : "MEDIUM",
    matchedEntity: "Airbus_A320_SB_Rev16_Clause_24-1118"
  };
}

return execute(payload);`,
};

export const FunctionsSandboxTab: React.FC = () => {
  const [code, setCode] = useState<string>(PRESET_TEMPLATES.airbusClauseDelta);
  const [inputPayload, setInputPayload] = useState<string>('{\n  "originalPrice": 120000,\n  "revisedPrice": 145000\n}');
  const [executing, setExecuting] = useState(false);
  const [outputResult, setOutputResult] = useState<Record<string, unknown> | null>(null);
  const [executionStats, setExecutionStats] = useState<{ durationMs: number; memoryAllocatedBytes: number } | null>(null);

  const handleRunFunction = async () => {
    setExecuting(true);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(inputPayload);
      } catch {
        parsed = {};
      }

      const res = await fetch("http://localhost:4000/api/functions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          functionName: "airbusClauseEvaluator",
          code,
          inputPayload: parsed,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setOutputResult(json.data.result);
        setExecutionStats({
          durationMs: json.data.durationMs,
          memoryAllocatedBytes: json.data.memoryAllocatedBytes,
        });
      }
    } catch (err) {
      console.error("Function execution error:", err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon icon="code" color="var(--x52-accent)" />
            Functions Execution Sandbox &amp; Micro-Compiler
            <Tag minimal intent={Intent.SUCCESS}>TypeScript / Python V8 Sandbox</Tag>
          </h4>
          <div style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
            Write, execute, benchmark, and deploy language-agnostic transformation functions in an isolated runtime sandbox.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            size="small"
            variant="outlined"
            text="Load Pricing Delta Preset"
            onClick={() => {
              setCode(PRESET_TEMPLATES.airbusClauseDelta);
              setInputPayload('{\n  "originalPrice": 120000,\n  "revisedPrice": 145000\n}');
            }}
          />
          <Button
            size="small"
            variant="outlined"
            text="Load Vector Cosine Preset"
            onClick={() => {
              setCode(PRESET_TEMPLATES.vectorCosineSearch);
              setInputPayload('{\n  "vecA": [0.12, 0.85, 0.44, 0.91, 0.33],\n  "vecB": [0.14, 0.81, 0.49, 0.88, 0.31]\n}');
            }}
          />
        </div>
      </div>

      {/* Editor & Console Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "14px" }}>
        {/* Code Editor */}
        <Card
          elevation={Elevation.ZERO}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--x52-text-muted)" }}>
              SOURCE CODE (V8 SANDBOX)
            </span>
            <Button
              intent={Intent.PRIMARY}
              icon="play"
              text="Execute in Sandbox"
              loading={executing}
              onClick={handleRunFunction}
            />
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              width: "100%",
              height: "280px",
              backgroundColor: "#0d1117",
              color: "#58a6ff",
              fontFamily: "var(--x52-font-mono)",
              fontSize: "12px",
              lineHeight: 1.5,
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #30363d",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />

          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--x52-text-muted)" }}>
              INPUT PAYLOAD (JSON)
            </span>
            <textarea
              value={inputPayload}
              onChange={(e) => setInputPayload(e.target.value)}
              style={{
                width: "100%",
                height: "90px",
                backgroundColor: "#0d1117",
                color: "#7ee787",
                fontFamily: "var(--x52-font-mono)",
                fontSize: "12px",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #30363d",
                marginTop: "6px",
                boxSizing: "border-box",
              }}
            />
          </div>
        </Card>

        {/* Output Console & Benchmarking */}
        <Card
          elevation={Elevation.ZERO}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--x52-text-muted)" }}>
              EXECUTION BENCHMARK &amp; RESULT
            </span>
            {executionStats && (
              <Tag intent={Intent.SUCCESS} round style={{ fontWeight: 800 }}>
                {executionStats.durationMs}ms
              </Tag>
            )}
          </div>

          {executionStats && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ padding: "8px 12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
                <div style={{ fontSize: "10px", color: "var(--x52-text-muted)" }}>EXECUTION LATENCY</div>
                <div style={{ fontSize: "16px", fontWeight: 800 }}>{executionStats.durationMs}ms</div>
              </div>
              <div style={{ padding: "8px 12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
                <div style={{ fontSize: "10px", color: "var(--x52-text-muted)" }}>V8 HEAP CONSUMED</div>
                <div style={{ fontSize: "16px", fontWeight: 800 }}>{(executionStats.memoryAllocatedBytes / 1024).toFixed(1)} KB</div>
              </div>
            </div>
          )}

          <div
            style={{
              flex: 1,
              backgroundColor: "#0d1117",
              color: "#e6edf3",
              fontFamily: "var(--x52-font-mono)",
              fontSize: "12px",
              padding: "14px",
              borderRadius: "6px",
              border: "1px solid #30363d",
              overflowY: "auto",
              minHeight: "300px",
            }}
          >
            {outputResult ? (
              <pre style={{ margin: 0 }}>{JSON.stringify(outputResult, null, 2)}</pre>
            ) : (
              <div style={{ color: "#8b949e", fontStyle: "italic", paddingTop: "40px", textAlign: "center" }}>
                Click "Execute in Sandbox" to run function against input payload.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
