import React, { useState } from "react";
import {
  Navbar,
  Alignment,
  Classes,
  Tag,
  Button,
} from "@blueprintjs/core";
import { X52Logo } from "../../components/X52Logo";
import { AppLauncher } from "../components/AppLauncher";
import { type X52AppManifest, registry } from "../registry";
import { PipelineStudioApp } from "../../apps/pipeline-studio";
import { OntologyExplorerApp } from "../../apps/ontology-explorer";
import { AppWorkbench } from "../../apps/app-workbench";
import { BackendControlPanel } from "../../components/admin/BackendControlPanel";
import Dashboard from "../../Dashboard";

// Register all Suite Applications in the X52 Core
const suiteApps: X52AppManifest[] = [
  {
    id: "workbench",
    name: "App Workbench",
    shortName: "WB",
    description: "Visual application composer and low-code builder using X52 Core UI widgets.",
    version: "1.0.0",
    icon: "build",
    category: "engineering",
    intent: "primary",
    standaloneRoute: "/?app=workbench",
    component: AppWorkbench,
  },
  {
    id: "operations",
    name: "Operations Console",
    shortName: "OPS",
    description: "Real-time telemetry, 52-node cluster diagnostics, and stream pipeline monitoring.",
    version: "1.0.0",
    icon: "dashboard",
    category: "operations",
    intent: "success",
    standaloneRoute: "/?app=operations",
    component: Dashboard as unknown as React.ComponentType<{ isDarkMode: boolean; isStandalone?: boolean }>,
  },
  {
    id: "pipeline-studio",
    name: "Pipeline Studio",
    shortName: "PS",
    description: "Visual DAG workflow designer, schema validation, and transform execution engine.",
    version: "1.0.0",
    icon: "layers",
    category: "engineering",
    intent: "primary",
    standaloneRoute: "/?app=pipeline-studio",
    component: PipelineStudioApp,
  },
  {
    id: "ontology-explorer",
    name: "Ontology Explorer",
    shortName: "ONT",
    description: "Palantir Foundry semantic link layer, object schema matrix, and graph relations.",
    version: "1.0.0",
    icon: "graph",
    category: "analytics",
    intent: "warning",
    standaloneRoute: "/?app=ontology-explorer",
    component: OntologyExplorerApp,
  },
  {
    id: "control-plane",
    name: "Backend Control Plane",
    shortName: "CTL",
    description: "Cluster node scaling, data source connector latency testing, and API secret vault.",
    version: "1.0.0",
    icon: "control",
    category: "governance",
    intent: "danger",
    standaloneRoute: "/?app=control-plane",
    component: BackendControlPanel,
  },
];

suiteApps.forEach((app) => registry.register(app));

export const PlatformShell: React.FC = () => {
  // Check URL params for standalone mode or deep link
  const urlParams = new URLSearchParams(window.location.search);
  const initialAppId = urlParams.get("app") || "operations";
  const isStandalone = urlParams.get("standalone") === "true";

  const [activeAppId, setActiveAppId] = useState<string>(initialAppId);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const currentApp = registry.get(activeAppId) || suiteApps[0];
  const ActiveComponent = currentApp.component;

  const handleSelectApp = (appId: string) => {
    setActiveAppId(appId);
    // Update URL query without page reload
    const newUrl = `${window.location.pathname}?app=${appId}${isStandalone ? "&standalone=true" : ""}`;
    window.history.pushState({}, "", newUrl);
  };

  return (
    <div
      className={isDarkMode ? Classes.DARK : ""}
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--x52-bg)",
        color: "var(--x52-text)",
        padding: isStandalone ? "16px" : "20px 32px 40px 32px",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Universal Platform Navigation Shell */}
        <Navbar
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            boxShadow: isDarkMode ? "0 8px 24px rgba(0,0,0,0.6)" : "0 2px 10px rgba(0,0,0,0.05)",
            padding: "0 16px",
          }}
        >
          <Navbar.Group align={Alignment.LEFT} style={{ gap: "10px" }}>
            {/* Palantir 9-dots App Suite Launcher Button */}
            <Button
              icon="applications"
              minimal
              title="Open X52 App Suite Hub"
              onClick={() => setIsLauncherOpen(true)}
              style={{ fontWeight: 700 }}
            />
            <X52Logo size={28} inverted={!isDarkMode} />
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "-0.02em" }}>
                X52 SUITE
              </span>
              <span style={{ color: "var(--x52-text-muted)" }}>/</span>
              <span style={{ fontWeight: 700, fontSize: "14px" }}>
                {currentApp.name}
              </span>
              {isStandalone && (
                <Tag minimal round intent="warning" style={{ fontSize: "10px" }}>
                  STANDALONE
                </Tag>
              )}
            </div>

            <Navbar.Divider />

            {/* Quick App Switcher Tabs */}
            {suiteApps.map((app) => (
              <Button
                key={app.id}
                minimal
                icon={app.icon as any}
                text={app.shortName}
                active={activeAppId === app.id}
                onClick={() => handleSelectApp(app.id)}
                title={app.name}
              />
            ))}
          </Navbar.Group>

          <Navbar.Group align={Alignment.RIGHT} style={{ gap: "8px" }}>
            <Button
              minimal
              icon={isStandalone ? "fullscreen" : "export"}
              title={isStandalone ? "Exit Standalone Mode" : "Open in Standalone View"}
              text={isStandalone ? "Suite View" : "Standalone"}
              onClick={() => {
                const targetStandalone = !isStandalone;
                const newUrl = `${window.location.pathname}?app=${activeAppId}${targetStandalone ? "&standalone=true" : ""}`;
                window.location.href = newUrl;
              }}
            />
            <Navbar.Divider />
            <Button
              minimal
              icon={isDarkMode ? "flash" : "moon"}
              onClick={() => setIsDarkMode((prev) => !prev)}
            />
          </Navbar.Group>
        </Navbar>

        {/* Dynamic Mounted Application */}
        {activeAppId === "operations" ? (
          <Dashboard />
        ) : (
          <ActiveComponent isDarkMode={isDarkMode} isStandalone={isStandalone} />
        )}

        {/* Global Suite Hub Modal */}
        <AppLauncher
          isOpen={isLauncherOpen}
          onClose={() => setIsLauncherOpen(false)}
          apps={suiteApps}
          currentAppId={activeAppId}
          onSelectApp={handleSelectApp}
          isDarkMode={isDarkMode}
        />

      </div>
    </div>
  );
};
