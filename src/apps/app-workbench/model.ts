import { Intent } from "@blueprintjs/core";
import type { IconName } from "@blueprintjs/icons";

/**
 * Domain model for the App Workbench composer.
 *
 * The element catalog lives here rather than in the composer so the palette,
 * the canvas, the inspector, and the code generator all read from one source
 * of truth — adding an element type is a single edit.
 */

export type WidgetType =
  | "metric-card"
  | "pipeline-table"
  | "cluster-grid"
  | "callout"
  | "action-bar"
  | "entity-card"
  | "rag-search"
  | "compare-matrix"
  | "data-catalog";

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  value?: string;
  delta?: string;
  intent?: Intent;
  dataSource?: string;
}

/**
 * Element types that ship their own bounded surfaces (Cards). The canvas must
 * not wrap these in a second card, or every widget reads as a box inside a box.
 */
export const SELF_FRAMED_TYPES: ReadonlySet<WidgetType> = new Set<WidgetType>([
  "rag-search",
  "compare-matrix",
  "data-catalog",
]);

export const WIDGET_TYPE_LABEL: Record<WidgetType, string> = {
  "rag-search": "RAG search",
  "compare-matrix": "Compare matrix",
  "data-catalog": "Data catalog",
  "metric-card": "Metric card",
  "pipeline-table": "Pipeline table",
  "cluster-grid": "Cluster grid",
  "action-bar": "Action bar",
  "entity-card": "Entity card",
  callout: "Callout",
};

/** Field defaults per element type — the seed an added element starts from. */
const WIDGET_DEFAULTS: Record<WidgetType, Omit<WidgetInstance, "id">> = {
  "rag-search": {
    type: "rag-search",
    title: "Semantic Vector Search & Citations",
    subtitle: "RAG query engine over vector store",
  },
  "compare-matrix": {
    type: "compare-matrix",
    title: "Entity & Version Diff Matrix",
    subtitle: "Side-by-side attribute comparison",
  },
  "data-catalog": {
    type: "data-catalog",
    title: "Interactive Data Catalog Listing",
    subtitle: "Faceted sorting & multi-selection",
  },
  "metric-card": {
    type: "metric-card",
    title: "New telemetry metric",
    value: "1,420 RPS",
    delta: "+4.1%",
    intent: Intent.SUCCESS,
    dataSource: "Default Stream",
  },
  "pipeline-table": {
    type: "pipeline-table",
    title: "Stream Pipeline Monitor",
    dataSource: "Pipeline Registry",
  },
  "cluster-grid": {
    type: "cluster-grid",
    title: "Compute Worker Node Matrix",
    subtitle: "52 active nodes",
  },
  "action-bar": {
    type: "action-bar",
    title: "Operational Actions Bar",
    subtitle: "Command and control triggers",
  },
  callout: {
    type: "callout",
    title: "System Notice",
    subtitle: "Records are verified before persistence.",
    intent: Intent.PRIMARY,
  },
  "entity-card": {
    type: "entity-card",
    title: "Ontology Object 360",
    subtitle: "Foundry object instance",
    intent: Intent.SUCCESS,
  },
};

/**
 * Monotonic id source. `Date.now()` alone collided whenever two elements were
 * added inside the same millisecond, which produced duplicate React keys and a
 * canvas that mutated the wrong element on edit.
 */
let sequence = 0;

export function createWidget(type: WidgetType): WidgetInstance {
  sequence += 1;
  return { ...WIDGET_DEFAULTS[type], id: `w-${Date.now().toString(36)}-${sequence}` };
}

export interface PaletteEntry {
  type: WidgetType;
  icon: IconName;
  label: string;
  description: string;
}

export interface PaletteGroup {
  id: string;
  label: string;
  entries: PaletteEntry[];
}

export const PALETTE_GROUPS: readonly PaletteGroup[] = [
  {
    id: "primitives",
    label: "RAG & analytics primitives",
    entries: [
      {
        type: "rag-search",
        icon: "search-template",
        label: "RAG search + citations",
        description: "Grounded semantic retrieval over vector embeddings, with cited evidence chunks.",
      },
      {
        type: "compare-matrix",
        icon: "comparison",
        label: "Side-by-side compare",
        description: "Attribute diff matrix across 2–4 entities with automatic delta highlighting.",
      },
      {
        type: "data-catalog",
        icon: "th-filtered",
        label: "Data catalog & sort bar",
        description: "Faceted catalog listing with multi-attribute sorting and batch selection.",
      },
    ],
  },
  {
    id: "telemetry",
    label: "Telemetry & controls",
    entries: [
      {
        type: "metric-card",
        icon: "timeline-area-chart",
        label: "Metric card + sparkline",
        description: "A single headline figure with a delta tag and a trend sparkline.",
      },
      {
        type: "pipeline-table",
        icon: "th",
        label: "Pipeline data table",
        description: "Compact pipeline roster with per-stream status tags.",
      },
      {
        type: "cluster-grid",
        icon: "grid",
        label: "52 node matrix",
        description: "Dense worker-node grid for at-a-glance cluster occupancy.",
      },
      {
        type: "action-bar",
        icon: "wrench",
        label: "Action control bar",
        description: "Titled toolbar for command and control triggers.",
      },
      {
        type: "callout",
        icon: "info-sign",
        label: "Callout banner",
        description: "Persistent inline notice carrying an intent and an icon.",
      },
    ],
  },
];
