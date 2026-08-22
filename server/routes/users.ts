import { Router } from "express";
import { logAuditEvent } from "../services/auditLogger";

const router = Router();

export interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "DATA_GOVERNOR" | "MODEL_ENGINEER" | "AUDITOR" | "VIEWER";
  department: string;
  assignedPurposes: string[];
  mfaEnabled: boolean;
  activeSessions: number;
  lastLogin: string;
  status: "ACTIVE" | "SUSPENDED" | "INVITED";
}

let enterpriseUsers: EnterpriseUser[] = [
  {
    id: "USR-001",
    name: "Alexandru Dumitru",
    email: "alexandru.dum@x52.defense",
    role: "SUPER_ADMIN",
    department: "Executive Avionics",
    assignedPurposes: ["PURPOSE_FLEET_OPS", "PURPOSE_LEGAL_AUDIT", "PURPOSE_TELEMETRY"],
    mfaEnabled: true,
    activeSessions: 2,
    lastLogin: new Date().toISOString(),
    status: "ACTIVE",
  },
  {
    id: "USR-002",
    name: "Sarah Connor",
    email: "sarah.connor@defense.aero",
    role: "DATA_GOVERNOR",
    department: "Fleet Compliance",
    assignedPurposes: ["PURPOSE_FLEET_OPS"],
    mfaEnabled: true,
    activeSessions: 1,
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "USR-003",
    name: "Marcus Vance",
    email: "marcus.vance@defense.aero",
    role: "MODEL_ENGINEER",
    department: "RAG & Search Analytics",
    assignedPurposes: ["PURPOSE_TELEMETRY"],
    mfaEnabled: true,
    activeSessions: 1,
    lastLogin: new Date(Date.now() - 14400000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "USR-004",
    name: "Elena Rostova",
    email: "elena.rostova@foundry.internal",
    role: "AUDITOR",
    department: "General Counsel Office",
    assignedPurposes: ["PURPOSE_LEGAL_AUDIT"],
    mfaEnabled: false,
    activeSessions: 0,
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    status: "ACTIVE",
  },
];

// GET /api/users
router.get("/", (_req, res) => {
  res.json({ success: true, data: enterpriseUsers });
});

// POST /api/users (Add/Invite new user)
router.post("/", (req, res) => {
  const { name, email, role, department, assignedPurposes } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: "Name and email are required" });
  }

  const newUser: EnterpriseUser = {
    id: `USR-${String(enterpriseUsers.length + 1).padStart(3, "0")}`,
    name,
    email,
    role: role || "MODEL_ENGINEER",
    department: department || "Engineering",
    assignedPurposes: assignedPurposes || ["PURPOSE_FLEET_OPS"],
    mfaEnabled: true,
    activeSessions: 0,
    lastLogin: "Never (Pending Invite)",
    status: "INVITED",
  };

  enterpriseUsers.unshift(newUser);
  logAuditEvent("SECURITY", "USER_PROVISIONED", `User account ${email} provisioned with role ${newUser.role}`, "INFO");

  res.json({ success: true, data: newUser });
});

// POST /api/users/:id/revoke (Revoke active sessions)
router.post("/:id/revoke", (req, res) => {
  const { id } = req.params;
  const user = enterpriseUsers.find((u) => u.id === id);
  if (!user) return res.status(404).json({ success: false, error: "User not found" });

  user.activeSessions = 0;
  logAuditEvent("SECURITY", "SESSIONS_REVOKED", `All active login sessions revoked for ${user.email}`, "WARNING");

  res.json({ success: true, message: `Active sessions for ${user.name} revoked successfully.` });
});

// DELETE /api/users/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const idx = enterpriseUsers.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: "User not found" });

  const deleted = enterpriseUsers.splice(idx, 1)[0];
  logAuditEvent("SECURITY", "USER_OFFBOARDED", `User account ${deleted.email} offboarded from enterprise directory`, "WARNING");

  res.json({ success: true, message: `User ${deleted.name} removed successfully.` });
});

export default router;
