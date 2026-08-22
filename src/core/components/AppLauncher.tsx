import React from "react";
import {
  Dialog,
  Classes,
  Card,
  Elevation,
  Tag,
  Button,
} from "@blueprintjs/core";
import type { X52AppManifest } from "../registry";

interface AppLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  apps: X52AppManifest[];
  currentAppId: string;
  onSelectApp: (appId: string) => void;
  isDarkMode: boolean;
}

export const AppLauncher: React.FC<AppLauncherProps> = ({
  isOpen,
  onClose,
  apps,
  currentAppId,
  onSelectApp,
  isDarkMode,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="X52 Applications Suite & Platform Hub"
      className={isDarkMode ? Classes.DARK : ""}
      style={{ width: "680px", borderRadius: "12px" }}
    >
      <div className={Classes.DIALOG_BODY}>
        <p style={{ fontSize: "13px", color: "var(--x52-text-muted)", margin: "0 0 16px 0" }}>
          Launch any standalone application or switch workspaces within the X52 platform suite:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
          {apps.map((app) => (
            <Card
              key={app.id}
              interactive
              elevation={Elevation.ONE}
              onClick={() => {
                onSelectApp(app.id);
                onClose();
              }}
              style={{
                backgroundColor: currentAppId === app.id ? (isDarkMode ? "#1f2937" : "#e2e8f0") : "var(--x52-card-bg)",
                border: currentAppId === app.id ? "1px solid #388bfd" : "1px solid var(--x52-border)",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: isDarkMode ? "#ffffff" : "#0f172a",
                  color: isDarkMode ? "#090d11" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                {app.shortName}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "14px" }}>{app.name}</strong>
                  <Tag minimal round intent={app.intent} style={{ fontSize: "10px" }}>
                    v{app.version}
                  </Tag>
                </div>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--x52-text-muted)", lineHeight: 1.4 }}>
                  {app.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Close Hub</Button>
        </div>
      </div>
    </Dialog>
  );
};
