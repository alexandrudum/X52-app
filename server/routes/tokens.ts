import { Router } from "express";
import crypto from "crypto";
import { logAuditEvent } from "../services/auditLogger";

const router = Router();

export interface ApiTokenRecord {
  id: string;
  name: string;
  prefix: string;
  token?: string; // Only returned on creation
  role: "SUPER_ADMIN" | "WRITE_INGEST" | "READ_ONLY" | "PIPELINE_RUNNER";
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  status: "ACTIVE" | "REVOKED";
}

let tokenStore: ApiTokenRecord[] = [
  {
    id: "TOK-001",
    name: "Platform Master Admin Key",
    prefix: "x52_live_adm_8f92",
    role: "SUPER_ADMIN",
    scopes: ["*"],
    createdAt: "2026-08-20T10:00:00.000Z",
    expiresAt: "2027-08-20T10:00:00.000Z",
    lastUsedAt: new Date().toISOString(),
    status: "ACTIVE",
  },
  {
    id: "TOK-002",
    name: "Airbus Document Ingestion Service Token",
    prefix: "x52_live_ing_4a11",
    role: "WRITE_INGEST",
    scopes: ["documents:write", "diff:execute", "ontology:read"],
    createdAt: "2026-08-21T12:00:00.000Z",
    expiresAt: "2027-08-21T12:00:00.000Z",
    lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
    status: "ACTIVE",
  },
];

// GET /api/tokens
router.get("/", (_req, res) => {
  // Strip secret tokens for security
  const safeTokens = tokenStore.map(({ token: _t, ...rest }) => rest);
  res.json({ success: true, data: safeTokens });
});

// POST /api/tokens (Generate new API Key)
router.post("/", (req, res) => {
  const { name, role, scopes, expiresInDays } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: "Token name is required" });
  }

  const rawSecret = crypto.randomBytes(24).toString("hex");
  const prefix = `x52_live_${(role || "read").substring(0, 3).toLowerCase()}_${rawSecret.substring(0, 4)}`;
  const fullToken = `${prefix}_${rawSecret}`;

  const days = expiresInDays || 365;
  const expiresAt = new Date(Date.now() + days * 86400000).toISOString();

  const newToken: ApiTokenRecord = {
    id: `TOK-${String(tokenStore.length + 1).padStart(3, "0")}`,
    name,
    prefix,
    token: fullToken, // Returned once upon creation
    role: role || "READ_ONLY",
    scopes: scopes || ["documents:read", "ontology:read"],
    createdAt: new Date().toISOString(),
    expiresAt,
    lastUsedAt: null,
    status: "ACTIVE",
  };

  tokenStore.unshift(newToken);
  logAuditEvent("SECURITY", "API_KEY_GENERATED", `API token [${name}] created with scopes [${newToken.scopes.join(", ")}]`, "INFO");

  res.json({ success: true, data: newToken });
});

// DELETE /api/tokens/:id (Revoke token)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const tok = tokenStore.find((t) => t.id === id);
  if (!tok) return res.status(404).json({ success: false, error: "Token not found" });

  tok.status = "REVOKED";
  logAuditEvent("SECURITY", "API_KEY_REVOKED", `API token [${tok.name}] (${tok.prefix}) was permanently revoked`, "WARNING");

  res.json({ success: true, message: `Token ${tok.name} revoked successfully.` });
});

export default router;
