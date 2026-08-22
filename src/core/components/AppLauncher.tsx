import React from "react";
import {
  Button,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  Elevation,
  Icon,
  Tag,
} from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";
import type { X52AppManifest } from "../registry";

interface AppLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  apps: X52AppManifest[];
  currentAppId: string;
  onSelectApp: (appId: string) => void;
  isDarkMode: boolean;
}

const DESCRIPTION_ID = "x52-launcher-description";

/**
 * Blueprint's own card styling on a real `<button>`: the grid tiles stay
 * keyboard-reachable and get the global focus ring, while `Classes.SELECTED`
 * draws the primary-intent ring on the app you are already in.
 */
const tileClasses = (isCurrent: boolean) =>
  [
    Classes.CARD,
    Classes.INTERACTIVE,
    Classes.elevationClass(Elevation.ZERO),
    isCurrent ? Classes.SELECTED : undefined,
  ]
    .filter(Boolean)
    .join(" ");

export const AppLauncher: React.FC<AppLauncherProps> = ({
  isOpen,
  onClose,
  apps,
  currentAppId,
  onSelectApp,
}) => {
  // NOTE: no `className={Classes.DARK}` here. The shell puts Blueprint's dark
  // class on <html>, and this dialog portals into <body>, so it already
  // inherits the theme; re-applying it nested the dark scope inside itself and
  // tied the overlay's theme to a prop instead of the document.
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      icon="applications"
      title="X52 application suite"
      aria-describedby={DESCRIPTION_ID}
      style={{ width: "min(760px, 92vw)" }}
    >
      <DialogBody>
        <p
          id={DESCRIPTION_ID}
          className="x52-muted"
          style={{
            margin: "0 0 var(--x52-space-4) 0",
            fontSize: "var(--x52-fs-small)",
          }}
        >
          Switch workspaces, or open any application standalone. {apps.length} applications
          registered.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(228px, 1fr))",
            gap: "var(--x52-space-2)",
          }}
        >
          {apps.map((app) => {
            const isCurrent = app.id === currentAppId;
            return (
              <button
                key={app.id}
                type="button"
                className={tileClasses(isCurrent)}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => {
                  onSelectApp(app.id);
                  onClose();
                }}
                style={{
                  padding: "var(--x52-space-3)",
                  textAlign: "left",
                  font: "inherit",
                  color: "var(--x52-text)",
                  border: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--x52-space-2)",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--x52-space-2)",
                    minWidth: 0,
                  }}
                >
                  <Icon icon={app.icon as IconName} className="x52-muted" />
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontWeight: "var(--x52-fw-medium)",
                      fontSize: "var(--x52-fs-base)",
                      color: "var(--x52-heading)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {app.name}
                  </span>
                  {isCurrent && (
                    <Tag minimal intent="primary" icon="tick">
                      Current
                    </Tag>
                  )}
                </span>

                <span
                  className="x52-muted"
                  style={{
                    fontSize: "var(--x52-fs-small)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {app.description}
                </span>

                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--x52-space-2)",
                  }}
                >
                  <Tag minimal>{app.category}</Tag>
                  <span
                    className="x52-numeric x52-muted"
                    style={{ fontSize: "var(--x52-fs-small)" }}
                  >
                    v{app.version}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogBody>

      <DialogFooter actions={<Button onClick={onClose}>Close</Button>} />
    </Dialog>
  );
};
