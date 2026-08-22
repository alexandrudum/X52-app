import React, { useCallback, useId, useMemo, useState } from "react";
import {
  Button,
  ButtonGroup,
  Callout,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  InputGroup,
  Intent,
  NonIdealState,
  Tag,
  Tooltip,
} from "@blueprintjs/core";
import { registry, type X52AppManifest } from "../../core/registry";
import { CanvasWidget } from "./CanvasWidget";
import { InspectorPanel } from "./InspectorPanel";
import { PublishedApp } from "./PublishedApp";
import { WidgetPalette } from "./WidgetPalette";
import { generateAppCode } from "./generateAppCode";
import { createWidget, type WidgetInstance, type WidgetType } from "./model";

const APP_DESCRIPTION =
  "Custom RAG, compare, sorting, and catalog application built with X52 Core Workbench.";

const INITIAL_WIDGETS: WidgetInstance[] = [
  {
    id: "w-rag",
    type: "rag-search",
    title: "RAG Semantic Retrieval & Knowledge Synthesis",
    subtitle: "Grounded AI search over vector embeddings with citations",
  },
  {
    id: "w-compare",
    type: "compare-matrix",
    title: "Side-by-Side Specification Comparator",
    subtitle: "Automatic delta highlighting across 2-4 entities",
  },
  {
    id: "w-catalog",
    type: "data-catalog",
    title: "Enterprise Data & Artifact Catalog",
    subtitle: "Multi-attribute sorting, category chips, and batch actions",
  },
];

interface WorkbenchNotice {
  intent: Intent;
  message: string;
}

/**
 * Visual low-code composer for X52 suite applications.
 *
 * Master–detail: element library on the left, live canvas in the middle,
 * property inspector on the right. The three rails share edges inside one
 * bordered panel — separated by 1px rules and a background step rather than
 * gaps and shadows — so the composer reads as a single instrument.
 */
export const AppWorkbench: React.FC<{ isDarkMode: boolean; isStandalone?: boolean }> = ({
  isDarkMode,
}) => {
  const nameFieldId = useId();
  const [appName, setAppName] = useState("Semantic_RAG_and_Catalog_Hub");
  const [appCategory, setAppCategory] = useState<X52AppManifest["category"]>("analytics");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>("w-rag");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [notice, setNotice] = useState<WorkbenchNotice | null>(null);
  const [widgets, setWidgets] = useState<WidgetInstance[]>(INITIAL_WIDGETS);

  const isEditing = viewMode === "edit";
  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId) ?? null;

  const handleAddWidget = useCallback((type: WidgetType) => {
    const widget = createWidget(type);
    // Functional updates: the palette callbacks outlive the render that made
    // them, so reading `widgets` from the closure could drop a concurrent add.
    setWidgets((prev) => [...prev, widget]);
    setSelectedWidgetId(widget.id);
  }, []);

  const handleRemoveWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    setSelectedWidgetId((prev) => (prev === id ? null : prev));
  }, []);

  const handleSelectWidget = useCallback((id: string) => {
    setSelectedWidgetId(id);
  }, []);

  const handleUpdateSelected = useCallback(
    (patch: Partial<WidgetInstance>) => {
      if (!selectedWidgetId) return;
      setWidgets((prev) =>
        prev.map((w) => (w.id === selectedWidgetId ? { ...w, ...patch } : w)),
      );
    },
    [selectedWidgetId],
  );

  const generatedCode = useMemo(
    () => generateAppCode({ appName, appDescription: APP_DESCRIPTION, widgets }),
    [appName, widgets],
  );

  const handlePublishApp = useCallback(() => {
    const trimmedName = appName.trim();
    const appId = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // An empty or punctuation-only name used to register an app under the id
    // "", which the launcher and the deep-link router cannot address.
    if (!appId) {
      setNotice({
        intent: Intent.WARNING,
        message: "Give the application a name containing letters or digits before publishing.",
      });
      return;
    }

    // Snapshot at publish time so later canvas edits do not mutate a published app.
    const snapshot = {
      appName: trimmedName,
      appDescription: APP_DESCRIPTION,
      widgets: [...widgets],
    };

    registry.register({
      id: appId,
      name: trimmedName,
      shortName: trimmedName.substring(0, 3).toUpperCase(),
      description: APP_DESCRIPTION,
      version: "1.0.0",
      icon: "application",
      category: appCategory,
      intent: Intent.PRIMARY,
      standaloneRoute: `/?app=${appId}`,
      component: ({ isDarkMode: darkMode }) => <PublishedApp {...snapshot} isDarkMode={darkMode} />,
    });

    setNotice({
      intent: Intent.SUCCESS,
      message: `Published "${trimmedName}" to the X52 suite. Open it from the app launcher.`,
    });
  }, [appName, appCategory, widgets]);

  const handleCopyCode = useCallback(() => {
    // The unhandled promise here used to reject silently in browsers that block
    // clipboard writes, while still reporting success to the user.
    navigator.clipboard.writeText(generatedCode).then(
      () => {
        setNotice({ intent: Intent.SUCCESS, message: "React TSX copied to the clipboard." });
        setIsExportOpen(false);
      },
      () => {
        setNotice({
          intent: Intent.WARNING,
          message: "The browser blocked clipboard access — select the code and copy it manually.",
        });
      },
    );
  }, [generatedCode]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)" }}>
      {notice && (
        <Callout compact role="status" intent={notice.intent}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--x52-space-2)",
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>{notice.message}</span>
            <Button
              variant="minimal"
              size="small"
              icon="cross"
              aria-label="Dismiss notification"
              onClick={() => setNotice(null)}
            />
          </div>
        </Callout>
      )}

      {/* Composer toolbar — identity on the left, the one primary action on the right. */}
      <div
        className="x52-panel"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--x52-space-3)",
          padding: "var(--x52-space-2) var(--x52-space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-3)", minWidth: 0 }}>
          <span
            aria-hidden="true"
            className="x52-numeric"
            style={{
              width: "28px",
              height: "28px",
              flex: "none",
              borderRadius: "var(--x52-radius)",
              border: "1px solid var(--x52-border)",
              backgroundColor: "var(--x52-card-secondary)",
              color: "var(--x52-text-muted)",
              fontSize: "var(--x52-fs-small)",
              fontWeight: "var(--x52-fw-bold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            WB
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
              <label htmlFor={nameFieldId} className="x52-sr-only">
                Application name
              </label>
              <InputGroup
                id={nameFieldId}
                value={appName}
                onValueChange={setAppName}
                style={{ width: "280px", maxWidth: "100%" }}
              />
              <Tag minimal>App Workbench</Tag>
            </div>
            <span className="x52-muted" style={{ fontSize: "var(--x52-fs-small)" }}>
              Visual application builder · RAG, compare, sorting, and listing primitives
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--x52-space-2)" }}>
          <ButtonGroup variant="outlined" aria-label="Canvas mode">
            <Button
              icon="edit"
              text="Edit"
              active={isEditing}
              aria-pressed={isEditing}
              onClick={() => setViewMode("edit")}
            />
            <Button
              icon="eye-open"
              text="Preview"
              active={!isEditing}
              aria-pressed={!isEditing}
              onClick={() => setViewMode("preview")}
            />
          </ButtonGroup>
          <Button variant="minimal" icon="code" text="Export TSX" onClick={() => setIsExportOpen(true)} />
          <Button
            intent={Intent.PRIMARY}
            icon="cloud-upload"
            text="Publish to suite"
            onClick={handlePublishApp}
          />
        </div>
      </div>

      {/* Master–detail workspace. One panel, three rails, no gutters. */}
      <div
        className="x52-panel"
        style={{
          display: "grid",
          gridTemplateColumns: isEditing
            ? "232px minmax(0, 1fr) 288px"
            : "minmax(0, 1fr)",
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
        {isEditing && <WidgetPalette onAddWidget={handleAddWidget} />}

        <div
          aria-label="Application canvas"
          role="region"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--x52-space-3)",
            padding: "var(--x52-space-3)",
            backgroundColor: "var(--x52-bg)",
            minWidth: 0,
          }}
        >
          {widgets.length === 0 ? (
            <NonIdealState
              layout="vertical"
              iconSize={20}
              icon="widget"
              title="Empty canvas"
              description="Add an element from the library on the left to start composing this application."
            />
          ) : (
            widgets.map((widget) => (
              <CanvasWidget
                key={widget.id}
                widget={widget}
                isDarkMode={isDarkMode}
                isEditing={isEditing}
                isSelected={widget.id === selectedWidgetId}
                onSelect={handleSelectWidget}
                onRemove={handleRemoveWidget}
              />
            ))
          )}
        </div>

        {isEditing && (
          <InspectorPanel
            selectedWidget={selectedWidget}
            onUpdateSelected={handleUpdateSelected}
            appCategory={appCategory}
            onAppCategoryChange={setAppCategory}
          />
        )}
      </div>

      <Dialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export standalone React component"
        icon="code"
        className={isDarkMode ? Classes.DARK : undefined}
        style={{ width: "min(760px, 92vw)" }}
      >
        <DialogBody>
          <p className="x52-muted" style={{ fontSize: "var(--x52-fs-small)", margin: "0 0 var(--x52-space-2)" }}>
            Copy this TypeScript React component into any standalone project. It consumes the same
            X52 design tokens as the suite.
          </p>
          <pre
            tabIndex={0}
            role="region"
            aria-label="Generated TSX source"
            style={{
              margin: 0,
              padding: "var(--x52-space-3)",
              backgroundColor: "var(--x52-card-secondary)",
              color: "var(--x52-text)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "var(--x52-radius)",
              fontFamily: "var(--x52-font-mono)",
              fontSize: "var(--x52-fs-small)",
              lineHeight: "var(--x52-lh)",
              maxHeight: "340px",
              overflow: "auto",
            }}
          >
            {generatedCode}
          </pre>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button variant="minimal" text="Close" onClick={() => setIsExportOpen(false)} />
              <Tooltip content="Copies the full component source" placement="top">
                <Button
                  intent={Intent.PRIMARY}
                  icon="clipboard"
                  text="Copy TSX"
                  onClick={handleCopyCode}
                />
              </Tooltip>
            </>
          }
        />
      </Dialog>
    </div>
  );
};
