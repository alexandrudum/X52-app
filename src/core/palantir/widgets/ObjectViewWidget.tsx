import React from "react";
import {
  Button,
  Elevation,
  Icon,
  Intent,
  NonIdealState,
  NonIdealStateIconSize,
  Section,
  SectionCard,
  Tab,
  Tabs,
  Tag,
} from "@blueprintjs/core";
import type { OntologyInstance } from "../widgetTypes";

interface ObjectViewWidgetProps {
  object: OntologyInstance | null;
  onExecuteAction?: (actionName: string, object: OntologyInstance) => void;
  isDarkMode?: boolean;
}

/** Flat widget frame — a hairline and a background step, no drop shadow. */
const FRAME: React.CSSProperties = {
  backgroundColor: "var(--x52-card-bg)",
  border: "1px solid var(--x52-border-subtle)",
  borderRadius: "var(--x52-radius)",
  boxShadow: "none",
};

/** Definition rows share one baseline grid so labels and values line up. */
const DEF_ROW: React.CSSProperties = {
  padding: "var(--x52-space-2) 0",
  borderTop: "1px solid var(--x52-border-subtle)",
  minWidth: 0,
};

/** "MemoryAllocated" reads as a property name, not a label. */
function humanize(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

export const ObjectViewWidget: React.FC<ObjectViewWidgetProps> = ({
  object,
  onExecuteAction,
}) => {
  const [activeTab, setActiveTab] = React.useState<string>("properties");

  if (!object) {
    return (
      <Section
        compact
        elevation={Elevation.ZERO}
        style={FRAME}
        title={<span className="x52-label">Object view</span>}
      >
        <SectionCard>
          <NonIdealState
            icon="select"
            iconSize={NonIdealStateIconSize.EXTRA_SMALL}
            title="No object selected"
            description="Choose an instance in the object table to inspect its properties and linked objects."
          />
        </SectionCard>
      </Section>
    );
  }

  const propertiesPanel = (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(120px, 38%) 1fr",
        columnGap: "var(--x52-space-4)",
        rowGap: 0,
        margin: 0,
      }}
    >
      {Object.entries(object.properties).map(([key, val]) => (
        <React.Fragment key={key}>
          <dt
            style={{
              ...DEF_ROW,
              fontSize: "var(--x52-fs-small)",
              color: "var(--x52-text-muted)",
            }}
          >
            {humanize(key)}
          </dt>
          <dd
            className={typeof val === "number" ? "x52-numeric" : undefined}
            style={{
              ...DEF_ROW,
              margin: 0,
              fontSize: "var(--x52-fs-base)",
              color: "var(--x52-text)",
              overflowWrap: "anywhere",
            }}
          >
            {String(val)}
          </dd>
        </React.Fragment>
      ))}
    </dl>
  );

  const linksPanel = (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {object.linkedObjects.map((link) => (
        <li
          key={link.type}
          style={{
            ...DEF_ROW,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "var(--x52-space-3)",
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
            <Icon icon="link" size={12} color="var(--x52-text-muted)" />
            <span style={{ fontWeight: "var(--x52-fw-medium)" }}>{link.type}</span>
            <Tag minimal>
              <span className="x52-numeric">{link.count}</span>
            </Tag>
          </span>
          <span
            className="x52-numeric x52-muted"
            style={{
              fontSize: "var(--x52-fs-small)",
              textAlign: "right",
              overflowWrap: "anywhere",
            }}
          >
            {link.ids.join(", ")}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <Section
      compact
      elevation={Elevation.ZERO}
      style={FRAME}
      title={<span className="x52-label">Object view</span>}
      rightElement={
        <>
          <Button
            size="small"
            variant="minimal"
            icon="edit"
            text="Edit"
            onClick={() => onExecuteAction?.("Edit Properties", object)}
          />
          <Button
            size="small"
            intent={Intent.PRIMARY}
            icon="refresh"
            text="Sync object"
            onClick={() => onExecuteAction?.("Sync Object", object)}
          />
        </>
      }
    >
      <SectionCard>
        {/* Identity block: type + id as metadata, title as the heading. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--x52-space-1)",
            marginBottom: "var(--x52-space-3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--x52-space-2)",
              flexWrap: "wrap",
            }}
          >
            <Tag minimal>{object.type}</Tag>
            <span
              className="x52-numeric x52-muted"
              style={{ fontSize: "var(--x52-fs-small)" }}
            >
              {object.id}
            </span>
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "var(--x52-fs-h5)",
              fontWeight: "var(--x52-fw-bold)",
              color: "var(--x52-heading)",
            }}
          >
            {object.title}
          </h3>
        </div>

        <Tabs
          id={`object-view-${object.id}`}
          selectedTabId={activeTab}
          onChange={(id) => setActiveTab(id.toString())}
          animate={false}
        >
          <Tab id="properties" title="Properties" panel={propertiesPanel} />
          <Tab
            id="links"
            title={`Linked objects (${object.linkedObjects.length})`}
            panel={linksPanel}
          />
        </Tabs>
      </SectionCard>
    </Section>
  );
};
