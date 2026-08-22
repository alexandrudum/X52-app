import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.resolve(process.cwd(), "server/db/data.json");

export interface PlatformStore {
  users: Array<Record<string, unknown>>;
  tokens: Array<Record<string, unknown>>;
  connectors: Array<Record<string, unknown>>;
  purposes: Array<Record<string, unknown>>;
  approvals: Array<Record<string, unknown>>;
  retention: Array<Record<string, unknown>>;
  ontologyObjects: Array<Record<string, unknown>>;
  pipelines: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
}

let memoryStore: PlatformStore = {
  users: [],
  tokens: [],
  connectors: [],
  purposes: [],
  approvals: [],
  retention: [],
  ontologyObjects: [],
  pipelines: [],
  auditLogs: [],
};

export function initStore(): void {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      memoryStore = { ...memoryStore, ...JSON.parse(raw) };
    } else {
      saveStore();
    }
  } catch (err) {
    console.error("Store initialization error:", err);
  }
}

export function getStore(): PlatformStore {
  return memoryStore;
}

export function saveStore(): void {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving persistent store:", err);
  }
}
