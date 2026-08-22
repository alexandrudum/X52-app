export interface SystemMetricsData {
  timestamp: string;
  os: {
    platform: string;
    type: string;
    release: string;
    arch: string;
    hostname: string;
    uptimeSeconds: number;
    loadAvg: number[];
    cpuCount: number;
    cpuModel: string;
  };
  cpuUsagePercent: number;
  memory: {
    totalBytes: number;
    freeBytes: number;
    usedBytes: number;
    usedPercent: number;
    processHeapUsedBytes: number;
    processHeapTotalBytes: number;
    processRssBytes: number;
    processExternalBytes: number;
  };
  process: {
    pid: number;
    nodeVersion: string;
    uptimeSeconds: number;
    memoryUsageMB: number;
  };
}

export interface ServiceComponentData {
  id: string;
  name: string;
  category: "INGESTION" | "SEARCH" | "DATABASE" | "GATEWAY";
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  version: string;
  uptimeSeconds: number;
  requestCount: number;
  errorRatePercent: number;
  averageLatencyMs: number;
  healthDescription: string;
}

export interface StorageConnectorData {
  id: string;
  name: string;
  type: string;
  path: string;
  status: string;
  totalFiles: number;
  totalSizeBytes: number;
  readOnly: boolean;
}

export interface StorageInfoData {
  workspaceRoot: string;
  totalFiles: number;
  totalSizeBytes: number;
  connectors: StorageConnectorData[];
}

export interface ScheduledJobData {
  id: string;
  name: string;
  category: "MAINTENANCE" | "INDEXING" | "HEALTH" | "BACKUP";
  schedule: string;
  status: "ACTIVE" | "PAUSED" | "RUNNING";
  lastRunTimestamp: string | null;
  lastRunDurationMs: number | null;
  lastRunStatus: "SUCCESS" | "FAILED" | "SKIPPED" | null;
  executionCount: number;
}

export interface AuditEventData {
  id: string;
  timestamp: string;
  category: "SYSTEM" | "SECURITY" | "PIPELINE" | "PDF_DIFF" | "STORAGE" | "SCHEDULER";
  action: string;
  details: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  clientIp?: string;
}

export interface SecurityTelemetryData {
  authMode: string;
  activeSessions: number;
  tlsEnabled: boolean;
  corsAllowedOrigins: string[];
  rateLimiter: {
    windowMs: number;
    maxRequestsPerWindow: number;
    currentWindowRequests: number;
  };
  apiTokens: Array<{
    id: string;
    name: string;
    prefix: string;
    role: string;
    createdAt: string;
    expiresAt: string;
    status: string;
  }>;
}
