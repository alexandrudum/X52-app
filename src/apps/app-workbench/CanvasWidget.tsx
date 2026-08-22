import React, { useCallback } from "react";
import { Button, Tooltip } from "@blueprintjs/core";
import { WidgetPreview } from "./WidgetPreview";
import { SELF_FRAMED_TYPES, WIDGET_TYPE_LABEL, type WidgetInstance } from "./model";

interface CanvasWidgetProps {
  widget: WidgetInstance;
  isDarkMode: boolean;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

/**
 * One element on the composer canvas.
 *
 * Selection reads as a Blueprint selection — a 1px primary-intent ring on the
 * frame, no coloured fill and no lift — so the element's own content stays the
 * thing you look at.
 */
export const CanvasWidget: React.FC<CanvasWidgetProps> = ({
  widget,
  isDarkMode,
  isEditing,
  isSelected,
  onSelect,
  onRemove,
}) => {
  const typeLabel = WIDGET_TYPE_LABEL[widget.type];
  const selfFramed = SELF_FRAMED_TYPES.has(widget.type);

  const handleSelect = useCallback(() => onSelect(widget.id), [onSelect, widget.id]);
  const handleRemove = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onRemove(widget.id);
    },
    [onRemove, widget.id],
  );

  // Preview mode drops the composer chrome entirely: self-framed elements bring
  // their own surfaces, built-ins get a single flat panel.
  if (!isEditing) {
    if (selfFramed) return <WidgetPreview widget={widget} isDarkMode={isDarkMode} />;
    return (
      <div className="x52-panel" style={{ padding: "var(--x52-space-4)" }}>
        <WidgetPreview widget={widget} isDarkMode={isDarkMode} />
      </div>
    );
  }

  return (
    <section
      aria-label={`${typeLabel}: ${widget.title}`}
      onClick={handleSelect}
      // Tabbing into any control inside the element selects it, so the
      // inspector follows keyboard focus without a mouse.
      onFocusCapture={handleSelect}
      style={{
        backgroundColor: "var(--x52-card-bg)",
        border: `1px solid ${isSelected ? "var(--x52-intent-primary)" : "var(--x52-border-subtle)"}`,
        boxShadow: isSelected ? "0 0 0 1px var(--x52-intent-primary)" : "none",
        borderRadius: "var(--x52-radius)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--x52-space-2)",
          padding: "0 var(--x52-space-1) 0 var(--x52-space-2)",
          minHeight: "var(--x52-h-control)",
          backgroundColor: "var(--x52-card-secondary)",
          borderBottom: "1px solid var(--x52-border-subtle)",
        }}
      >
        <Button
          variant="minimal"
          text={typeLabel}
          active={isSelected}
          aria-pressed={isSelected}
          aria-label={`Select ${typeLabel}: ${widget.title}`}
          onClick={handleSelect}
        />
        <span
          className="x52-muted"
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: "var(--x52-fs-small)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {widget.title}
        </span>
        <Tooltip content="Remove from canvas" placement="top-end">
          <Button
            variant="minimal"
            intent="danger"
            icon="cross"
            aria-label={`Remove ${typeLabel}: ${widget.title}`}
            onClick={handleRemove}
          />
        </Tooltip>
      </div>

      <div style={{ padding: selfFramed ? "var(--x52-space-3)" : "var(--x52-space-4)" }}>
        <WidgetPreview widget={widget} isDarkMode={isDarkMode} />
      </div>
    </section>
  );
};
