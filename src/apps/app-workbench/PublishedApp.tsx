import React from "react";
import { WidgetPreview } from "./WidgetPreview";
import { SELF_FRAMED_TYPES, type WidgetInstance } from "./model";

export interface PublishedAppSnapshot {
  appName: string;
  appDescription: string;
  widgets: WidgetInstance[];
}

interface PublishedAppProps extends PublishedAppSnapshot {
  isDarkMode: boolean;
}

/**
 * The runtime view of a composed app once it has been published into the suite.
 * It is fed an immutable snapshot taken at publish time, so later edits in the
 * workbench cannot retroactively change an already-published app.
 */
export const PublishedApp: React.FC<PublishedAppProps> = ({
  appName,
  appDescription,
  widgets,
  isDarkMode,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)" }}>
    <header>
      <h1
        style={{
          margin: 0,
          fontSize: "var(--x52-fs-h4)",
          fontWeight: "var(--x52-fw-bold)",
          color: "var(--x52-heading)",
        }}
      >
        {appName}
      </h1>
      <p className="x52-muted" style={{ margin: 0, fontSize: "var(--x52-fs-small)" }}>
        {appDescription}
      </p>
    </header>

    {widgets.map((widget) =>
      SELF_FRAMED_TYPES.has(widget.type) ? (
        <WidgetPreview key={widget.id} widget={widget} isDarkMode={isDarkMode} />
      ) : (
        <div key={widget.id} className="x52-panel" style={{ padding: "var(--x52-space-4)" }}>
          <WidgetPreview widget={widget} isDarkMode={isDarkMode} />
        </div>
      ),
    )}
  </div>
);
