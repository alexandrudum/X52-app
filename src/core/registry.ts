import React from "react";
import { Intent } from "@blueprintjs/core";

export interface X52AppManifest {
  id: string;
  name: string;
  shortName: string;
  description: string;
  version: string;
  icon: string;
  category: "operations" | "engineering" | "analytics" | "governance";
  intent: Intent;
  standaloneRoute: string;
  component: React.ComponentType<{ isDarkMode: boolean; isStandalone?: boolean }>;
}

class AppRegistry {
  private apps: Map<string, X52AppManifest> = new Map();

  register(manifest: X52AppManifest) {
    this.apps.set(manifest.id, manifest);
  }

  get(id: string): X52AppManifest | undefined {
    return this.apps.get(id);
  }

  getAll(): X52AppManifest[] {
    return Array.from(this.apps.values());
  }

  getByCategory(category: X52AppManifest["category"]): X52AppManifest[] {
    return this.getAll().filter((app) => app.category === category);
  }
}

export const registry = new AppRegistry();
