import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  InputGroup,
} from "@blueprintjs/core";

export interface ServerLogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "SQL" | "HTTP";
  module: string;
  message: string;
}

export const LiveLogTerminalTab: React.FC = () => {
  const [logs, setLogs] = useState<ServerLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [isStreaming, setIsStreaming] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/logs/stream");
      const json = await res.json();
      if (json.success) setLogs(json.data);
    } catch (err) {
      console.error("Fetch logs error:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (!isStreaming) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (isStreaming) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isStreaming]);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.module.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "ALL" || l.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level: ServerLogEntry["level"]) => {
    switch (level) {
      case "ERROR":
        return "#f87171";
      case "WARN":
        return "#fbbf24";
      case "SQL":
        return "#a78bfa";
      case "HTTP":
        return "#38bdf8";
      default:
        return "#4ade80";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ width: "280px" }}>
          <InputGroup
            leftIcon="search"
            placeholder="Search terminal output..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {(["ALL", "INFO", "HTTP", "SQL", "WARN", "ERROR"] as const).map((lvl) => (
            <Button
              key={lvl}
              size="small"
              active={selectedLevel === lvl}
              text={lvl}
              onClick={() => setSelectedLevel(lvl)}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button
            size="small"
            variant="outlined"
            icon={isStreaming ? "pause" : "play"}
            text={isStreaming ? "Pause Stream" : "Resume Stream"}
            onClick={() => setIsStreaming(!isStreaming)}
          />
          <Button
            size="small"
            variant="minimal"
            icon="trash"
            text="Clear Buffer"
            onClick={() => setLogs([])}
          />
        </div>
      </div>

      {/* High-Density Terminal Window */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "#090d13",
          border: "1px solid #1f293d",
          borderRadius: "10px",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1f293d", paddingBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            </div>
            <span style={{ fontSize: "12px", fontFamily: "var(--x52-font-mono)", color: "#8b949e", marginLeft: "8px" }}>
              x52-backend-stream // pid: 22811 // port: 4000
            </span>
          </div>

          <Tag round intent={isStreaming ? Intent.SUCCESS : Intent.WARNING} style={{ fontSize: "10px", fontWeight: 800 }}>
            {isStreaming ? "● STREAMING (2s)" : "PAUSED"}
          </Tag>
        </div>

        <div
          style={{
            height: "440px",
            overflowY: "auto",
            fontFamily: "var(--x52-font-mono)",
            fontSize: "12px",
            lineHeight: 1.6,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            paddingRight: "8px",
          }}
        >
          {filteredLogs.map((log) => (
            <div key={log.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ color: "#4b5563", flexShrink: 0 }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                style={{
                  color: getLevelColor(log.level),
                  fontWeight: 800,
                  flexShrink: 0,
                  width: "50px",
                }}
              >
                [{log.level}]
              </span>
              <span style={{ color: "#9ca3af", flexShrink: 0, width: "110px" }}>
                &lt;{log.module}&gt;
              </span>
              <span style={{ color: "#f3f4f6", flex: 1, wordBreak: "break-all" }}>
                {log.message}
              </span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </Card>
    </div>
  );
};
