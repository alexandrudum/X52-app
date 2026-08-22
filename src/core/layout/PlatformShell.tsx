import React, { useCallback, useState } from "react";
import {
  Navbar,
  Alignment,
  Tag,
  Button,
  ButtonGroup,
  Tooltip,
} from "@blueprintjs/core";
import { useTheme } from "../theme";
import { X52Logo } from "../../components/X52Logo";
import { AppLauncher } from "../components/AppLauncher";
import { type X52AppManifest, registry } from "../registry";
import { PipelineStudioApp } from "../../apps/pipeline-studio";
import { OntologyExplorerApp } from "../../apps/ontology-explorer";
import { AppWorkbench } from "../../apps/app-workbench";
import { RAGExplorerApp } from "../../apps/rag-explorer";
import { ComparatorApp } from "../../apps/comparator";
import { PalantirWorkshopApp } from "../../apps/workshop";
import { PDFComparatorApp } from "../../apps/pdf-comparator";
import { BackendControlPanel } from "../../components/admin/BackendControlPanel";
import Dashboard from "../../Dashboard";

// Register all Suite Applications in the X52 Core
const suiteApps: X52AppManifest[] = [
  {
    id: "pdf-diff",
    name: "PDF Diff Auditor",
    shortName: "PDF",
    description: "Dual PDF split-screen comparison with inline line callouts, warning inspector sidebar, and compliance audit.",
    version: "1.0.0",
    icon: "document-share",
    category: "governance",
    intent: "danger",
    standaloneRoute: "/?app=pdf-diff",
    component: PDFComparatorApp,
  },
  {
    id: "workshop",
    name: "Foundry Workshop",
    shortName: "WS",
    description: "Palantir Foundry interactive application runtime with reactive inter-widget variable binding and AIP.",
    version: "1.0.0",
    icon: "layout-auto",
    category: "analytics",
    intent: "primary",
    standaloneRoute: "/?app=workshop",
    component: PalantirWorkshopApp,
  },
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
    id: "rag-explorer",
    name: "RAG Semantic Explorer",
    shortName: "RAG",
    description: "Vector similarity search, evidence chunk ranking, and grounded AI synthesis with citations.",
    version: "1.0.0",
    icon: "search-template",
    category: "analytics",
    intent: "primary",
    standaloneRoute: "/?app=rag-explorer",
    component: RAGExplorerApp,
  },
  {
    id: "comparator",
    name: "Entity & Model Comparator",
    shortName: "CMP",
    description: "Side-by-side specification diff matrix, multi-attribute sorting, and data catalog listing.",
    version: "1.0.0",
    icon: "comparison",
    category: "analytics",
    intent: "success",
    standaloneRoute: "/?app=comparator",
    component: ComparatorApp,
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
    component: Dashboard,
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
  // Deep-link / standalone mode both come off the query string.
  const urlParams = new URLSearchParams(window.location.search);
  const initialAppId = urlParams.get("app") || "operations";
  const isStandalone = urlParams.get("standalone") === "true";

  const [activeAppId, setActiveAppId] = useState<string>(initialAppId);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const currentApp = registry.get(activeAppId) ?? suiteApps[0];
  const ActiveComponent = currentApp.component;

  const handleSelectApp = useCallback(
    (appId: string) => {
      setActiveAppId(appId);
      // Keep the URL shareable without a reload.
      const query = `?app=${appId}${isStandalone ? "&standalone=true" : ""}`;
      window.history.pushState({}, "", `${window.location.pathname}${query}`);
    },
    [isStandalone],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--x52-bg)",
        color: "var(--x52-text)",
        padding: isStandalone
          ? "var(--x52-space-3) var(--x52-space-4)"
          : "var(--x52-space-4)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "var(--x52-space-4)",
      }}
    >
      {/* Universal platform navigation shell */}
      <Navbar
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "var(--x52-radius)",
          boxShadow: "none",
          padding: "0 var(--x52-space-3)",
          flex: "none",
        }}
      >
        <Navbar.Group align={Alignment.START} style={{ gap: "var(--x52-space-2)" }}>
          <Tooltip content="Open the X52 app suite" placement="bottom-start">
            <Button
              icon="applications"
              variant="minimal"
              aria-label="Open the X52 app suite"
              aria-haspopup="dialog"
              onClick={() => setIsLauncherOpen(true)}
            />
          </Tooltip>
          <X52Logo size={24} inverted={!isDarkMode} />

          <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
            <span style={{ fontWeight: "var(--x52-fw-bold)", fontSize: "var(--x52-fs-base)" }}>
              X52 Suite
            </span>
            <span aria-hidden="true" style={{ color: "var(--x52-text-muted)" }}>
              /
            </span>
            <span style={{ color: "var(--x52-text-muted)", fontSize: "var(--x52-fs-base)" }}>
              {currentApp.name}
            </span>
            {isStandalone && (
              <Tag minimal intent="warning">
                Standalone
              </Tag>
            )}
          </div>

          <Navbar.Divider />

          {/* Quick app switcher. `active` is the only selection signal these
              need — colouring them by intent would spend colour on chrome. */}
          <ButtonGroup variant="minimal" aria-label="Switch application">
            {suiteApps.map((app) => (
              <Tooltip key={app.id} content={app.name} placement="bottom">
                <Button
                  icon={app.icon as never}
                  text={app.shortName}
                  active={activeAppId === app.id}
                  aria-current={activeAppId === app.id ? "page" : undefined}
                  onClick={() => handleSelectApp(app.id)}
                />
              </Tooltip>
            ))}
          </ButtonGroup>
        </Navbar.Group>

        <Navbar.Group align={Alignment.END} style={{ gap: "var(--x52-space-1)" }}>
          <Button
            variant="minimal"
            icon={isStandalone ? "fullscreen" : "export"}
            text={isStandalone ? "Suite view" : "Standalone"}
            onClick={() => {
              const targetStandalone = !isStandalone;
              const query = `?app=${activeAppId}${targetStandalone ? "&standalone=true" : ""}`;
              window.location.href = `${window.location.pathname}${query}`;
            }}
          />
          <Navbar.Divider />
          <Tooltip content={isDarkMode ? "Switch to light theme" : "Switch to dark theme"} placement="bottom-end">
            <Button
              variant="minimal"
              icon={isDarkMode ? "flash" : "moon"}
              aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
              aria-pressed={isDarkMode}
              onClick={toggleTheme}
            />
          </Tooltip>
        </Navbar.Group>
      </Navbar>

      {/* Mounted application. Remounting on app change keeps each app's
          internal state from leaking into the next one. */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <ActiveComponent
          key={currentApp.id}
          isDarkMode={isDarkMode}
          isStandalone={isStandalone}
        />
      </main>

      <AppLauncher
        isOpen={isLauncherOpen}
        onClose={() => setIsLauncherOpen(false)}
        apps={suiteApps}
        currentAppId={activeAppId}
        onSelectApp={handleSelectApp}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
