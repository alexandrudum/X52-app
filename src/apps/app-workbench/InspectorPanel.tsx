import React, { useId } from "react";
import {
  Divider,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  NonIdealState,
  Tag,
} from "@blueprintjs/core";
import type { X52AppManifest } from "../../core/registry";
import { WIDGET_TYPE_LABEL, type WidgetInstance } from "./model";

interface InspectorPanelProps {
  selectedWidget: WidgetInstance | null;
  onUpdateSelected: (patch: Partial<WidgetInstance>) => void;
  appCategory: X52AppManifest["category"];
  onAppCategoryChange: (category: X52AppManifest["category"]) => void;
}

const INTENT_OPTIONS: { value: Intent; label: string }[] = [
  { value: Intent.PRIMARY, label: "Primary — main action or selection" },
  { value: Intent.SUCCESS, label: "Success — passed or healthy" },
  { value: Intent.WARNING, label: "Warning — pending or partial" },
  { value: Intent.DANGER, label: "Danger — error or destructive" },
  { value: Intent.NONE, label: "Neutral — no status" },
];

const CATEGORY_OPTIONS: X52AppManifest["category"][] = [
  "analytics",
  "operations",
  "engineering",
  "governance",
];

/** Small, uppercase field label — matches `.x52-label` density in the rails. */
const fieldLabel = (text: string) => <span className="x52-label">{text}</span>;

/**
 * Right rail of the composer: element properties on top, application-level
 * settings underneath. The application block stays mounted whether or not an
 * element is selected — previously the app category was unreachable until you
 * happened to select something.
 */
export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedWidget,
  onUpdateSelected,
  appCategory,
  onAppCategoryChange,
}) => {
  const idBase = useId();

  return (
    <aside
      aria-label="Properties inspector"
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        backgroundColor: "var(--x52-card-bg)",
        borderLeft: "1px solid var(--x52-border-subtle)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--x52-space-2)",
          padding: "var(--x52-space-2) var(--x52-space-3)",
          borderBottom: "1px solid var(--x52-border-subtle)",
          minHeight: "var(--x52-h-control)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "var(--x52-fs-base)",
            fontWeight: "var(--x52-fw-bold)",
            color: "var(--x52-heading)",
          }}
        >
          Properties
        </h2>
        {selectedWidget && <Tag minimal>{WIDGET_TYPE_LABEL[selectedWidget.type]}</Tag>}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "var(--x52-space-3)",
          overflowY: "auto",
        }}
      >
        {selectedWidget ? (
          <>
            <FormGroup label={fieldLabel("Element title")} labelFor={`${idBase}-title`}>
              <InputGroup
                id={`${idBase}-title`}
                value={selectedWidget.title}
                onValueChange={(title) => onUpdateSelected({ title })}
              />
            </FormGroup>

            {selectedWidget.value !== undefined && (
              <FormGroup label={fieldLabel("Value / metric")} labelFor={`${idBase}-value`}>
                <InputGroup
                  id={`${idBase}-value`}
                    className="x52-numeric"
                  value={selectedWidget.value}
                  onValueChange={(value) => onUpdateSelected({ value })}
                />
              </FormGroup>
            )}

            {selectedWidget.delta !== undefined && (
              <FormGroup label={fieldLabel("Badge / delta")} labelFor={`${idBase}-delta`}>
                <InputGroup
                  id={`${idBase}-delta`}
                    className="x52-numeric"
                  value={selectedWidget.delta}
                  onValueChange={(delta) => onUpdateSelected({ delta })}
                />
              </FormGroup>
            )}

            {selectedWidget.subtitle !== undefined && (
              <FormGroup label={fieldLabel("Subtitle")} labelFor={`${idBase}-subtitle`}>
                <InputGroup
                  id={`${idBase}-subtitle`}
                    value={selectedWidget.subtitle}
                  onValueChange={(subtitle) => onUpdateSelected({ subtitle })}
                />
              </FormGroup>
            )}

            <FormGroup
              label={fieldLabel("Intent")}
              labelFor={`${idBase}-intent`}
              helperText="Intent carries status, not decoration."
            >
              <HTMLSelect
                id={`${idBase}-intent`}
                fill
                value={selectedWidget.intent ?? Intent.NONE}
                onChange={(e) => onUpdateSelected({ intent: e.currentTarget.value as Intent })}
              >
                {INTENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </HTMLSelect>
            </FormGroup>
          </>
        ) : (
          <NonIdealState
            layout="vertical"
            iconSize={20}
            icon="select"
            title="No element selected"
            description="Choose an element on the canvas to inspect and edit its properties."
          />
        )}

        <Divider style={{ margin: "var(--x52-space-2) 0 var(--x52-space-3)" }} />

        <div className="x52-label" style={{ marginBottom: "var(--x52-space-2)" }}>
          Application
        </div>
        <FormGroup
          label={fieldLabel("Category")}
          labelFor={`${idBase}-category`}
          style={{ marginBottom: 0 }}
        >
          <HTMLSelect
            id={`${idBase}-category`}
            fill
            value={appCategory}
            onChange={(e) =>
              onAppCategoryChange(e.currentTarget.value as X52AppManifest["category"])
            }
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>
      </div>
    </aside>
  );
};
