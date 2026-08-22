import { Router } from "express";
import { getAuditEvents, logAuditEvent } from "../services/auditLogger";

const router = Router();

// GET /api/security/audit
router.get("/audit", (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  res.json({
    success: true,
    data: getAuditEvents(limit),
  });
});

// GET /api/security/telemetry
router.get("/telemetry", (_req, res) => {
  res.json({
    success: true,
    data: {
      authMode: "SESSION_LOCAL",
      activeSessions: 1,
      tlsEnabled: false,
      corsAllowedOrigins: ["http://localhost:5173", "http://localhost:4000"],
      rateLimiter: {
        windowMs: 60000,
        maxRequestsPerWindow: 1200,
        currentWindowRequests: 84,
      },
      apiTokens: [
        {
          id: "TOK-ADMIN-PRIMARY",
          name: "Platform Master Admin Key",
          prefix: "x52_live_adm_...",
          role: "SUPER_ADMIN",
          createdAt: "2026-08-20T10:00:00.000Z",
          expiresAt: "2027-08-20T10:00:00.000Z",
          status: "ACTIVE",
        },
        {
          id: "TOK-PDF-INGEST",
          name: "Document Ingestion Automation Key",
          prefix: "x52_live_ing_...",
          role: "WRITE_INGEST",
          createdAt: "2026-08-21T12:00:00.000Z",
          expiresAt: "2027-08-21T12:00:00.000Z",
          status: "ACTIVE",
        },
      ],
    },
  });
});

// POST /api/security/audit/log
router.post("/audit/log", (req, res) => {
  const { category, action, details, severity } = req.body;
  const event = logAuditEvent(category || "SYSTEM", action || "USER_ACTION", details || "", severity || "INFO");
  res.json({ success: true, event });
});

export default router;
