import { Router, Request, Response } from "express";

const router = Router();

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  role: "ADMIN" | "OPERATOR" | "READ_ONLY";
  created: string;
  lastUsed: string;
  status: "ACTIVE" | "REVOKED";
}

let apiKeys: ApiKey[] = [
  {
    id: "key-x52-root",
    name: "Production Ingestion Root Key",
    prefix: "x52_live_9f8a",
    role: "ADMIN",
    created: "2026-08-01",
    lastUsed: "2m ago",
    status: "ACTIVE",
  },
  {
    id: "key-foundry-bridge",
    name: "Foundry Data Sync Service Token",
    prefix: "x52_live_3c2d",
    role: "OPERATOR",
    created: "2026-08-10",
    lastUsed: "Just now",
    status: "ACTIVE",
  },
  {
    id: "key-analyst-ro",
    name: "BI & Dashboard Read-Only Token",
    prefix: "x52_live_1e7b",
    role: "READ_ONLY",
    created: "2026-08-15",
    lastUsed: "4h ago",
    status: "ACTIVE",
  },
];

// GET /api/security/keys
router.get("/keys", (_req: Request, res: Response) => {
  res.json({ success: true, data: apiKeys });
});

// POST /api/security/keys
router.post("/keys", (req: Request, res: Response) => {
  const { name, role } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: "Key name is required" });
  }

  const randomHex = Math.random().toString(16).substring(2, 6);
  const newKey: ApiKey = {
    id: `key-${Date.now()}`,
    name,
    prefix: `x52_live_${randomHex}`,
    role: role || "OPERATOR",
    created: new Date().toISOString().split("T")[0],
    lastUsed: "Never",
    status: "ACTIVE",
  };

  apiKeys.unshift(newKey);
  res.status(201).json({
    success: true,
    data: newKey,
    rawSecret: `x52_live_${randomHex}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
  });
});

// DELETE /api/security/keys/:id
router.delete("/keys/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const key = apiKeys.find((k) => k.id === id);

  if (!key) {
    return res.status(404).json({ success: false, error: "Key not found" });
  }

  key.status = "REVOKED";
  res.json({ success: true, message: `Key ${key.name} has been revoked.`, key });
});

export default router;
