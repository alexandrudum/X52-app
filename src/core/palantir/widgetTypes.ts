import { Intent } from "@blueprintjs/core";

export interface OntologyProperty {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "timestamp" | "tag";
}

export interface OntologyInstance {
  id: string;
  type: string;
  title: string;
  properties: Record<string, string | number | boolean>;
  linkedObjects: { type: string; count: number; ids: string[] }[];
}

export type PalantirWidgetType =
  | "object-table"
  | "object-view-360"
  | "metric-kpi"
  | "timeseries-chart"
  | "aip-assist"
  | "action-trigger"
  | "faceted-filter"
  | "compare-matrix"
  | "rag-search";

export interface PalantirWidgetConfig {
  id: string;
  type: PalantirWidgetType;
  title: string;
  objectType?: string;
  selectedProperties?: string[];
  aggregation?: "count" | "sum" | "avg" | "max";
  intent?: Intent;
  subtitle?: string;
}

export interface WorkshopVariableState {
  selectedObject: OntologyInstance | null;
  activeFilter: { property: string; value: string | null };
  activeCategory: string;
  searchQuery: string;
}
