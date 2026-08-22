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

// ==========================================
// Palantir Foundry Governance Types
// ==========================================

export interface PBACPurposeData {
  id: string;
  name: string;
  code: string;
  description: string;
  retentionDays: number;
  assignedDatasetsCount: number;
  authorizedUsersCount: number;
  status: "ACTIVE" | "REVIEW_REQUIRED" | "RESTRICTED";
  governor: string;
}

export interface ApprovalRequestData {
  id: string;
  title: string;
  category: "DATA_ACCESS" | "SECURITY_OVERRIDE" | "SCHEMA_MUTATION" | "POLICY_CHANGE";
  requestedBy: string;
  requestedAt: string;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approversRequired: number;
  approversCompleted: string[];
  justification: string;
}

export interface RetentionPolicyData {
  id: string;
  name: string;
  framework: "GDPR" | "FAA_EASA" | "FEDRAMP_IL6" | "SOC2";
  retentionDuration: string;
  autoPurgeEnabled: boolean;
  lastPurgeTimestamp: string;
  affectedDatasets: string[];
  recordsManaged: number;
}

export interface ApolloReleaseTrackData {
  track: "STABLE" | "CANARY" | "EXTENDED_SUPPORT";
  currentVersion: string;
  availableVersion: string;
  releaseDate: string;
  compatibilityScorePercent: number;
  releaseNotes: string[];
  status: "READY_TO_DEPLOY" | "UP_TO_DATE" | "TESTING_REQUIRED";
}

export interface FunctionsConfigData {
  sandboxingEnabled: boolean;
  allowedRuntimes: string[];
  maxExecutionTimeoutSec: number;
  memoryLimitMB: number;
  allowOutboundHttp: boolean;
  allowFileSystemWrite: boolean;
  enableSimdVectorization: boolean;
}

export interface PlatformBroadcastData {
  id: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  active: boolean;
  publishedAt: string;
  author: string;
}

export interface LineageGraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    health: string;
    records: number;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label: string;
  }>;
}
