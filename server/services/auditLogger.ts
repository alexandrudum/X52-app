export interface AuditEvent {
  id: string;
  timestamp: string;
  category: "SYSTEM" | "SECURITY" | "PIPELINE" | "PDF_DIFF" | "STORAGE" | "SCHEDULER";
  action: string;
  details: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  clientIp?: string;
}

const auditEvents: AuditEvent[] = [
  {
    id: "AUDIT-001",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    category: "SYSTEM",
    action: "SERVER_BOOTSTRAP",
    details: "X52 Backend Control Panel service initialized on port 4000",
    severity: "INFO",
    clientIp: "127.0.0.1",
  },
  {
    id: "AUDIT-002",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    category: "SECURITY",
    action: "SESSION_ESTABLISHED",
    details: "Administrator session established from localhost",
    severity: "INFO",
    clientIp: "127.0.0.1",
  },
  {
    id: "AUDIT-003",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    category: "PDF_DIFF",
    action: "DOCUMENT_ANALYSIS_COMPLETED",
    details: "Parsed Airbus Service Bulletin Rev 15 vs Rev 16 and mapped differences",
    severity: "INFO",
    clientIp: "127.0.0.1",
  },
];

export function logAuditEvent(
  category: AuditEvent["category"],
  action: string,
  details: string,
  severity: AuditEvent["severity"] = "INFO",
  clientIp = "127.0.0.1"
): AuditEvent {
  const event: AuditEvent = {
    id: `AUDIT-${String(auditEvents.length + 1).padStart(3, "0")}`,
    timestamp: new Date().toISOString(),
    category,
    action,
    details,
    severity,
    clientIp,
  };
  
  auditEvents.unshift(event);
  // Keep last 100 events
  if (auditEvents.length > 100) {
    auditEvents.pop();
  }
  return event;
}

export function getAuditEvents(limit = 50): AuditEvent[] {
  return auditEvents.slice(0, limit);
}
