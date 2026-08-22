import { Router } from "express";
import { logAuditEvent } from "../services/auditLogger";

const router = Router();

export interface OntologyObject {
  id: string;
  type: string;
  title: string;
  properties: Record<string, unknown>;
  linkedObjectIds: string[];
  lastModified: string;
  version: number;
}

let ontologyObjects: OntologyObject[] = [
  {
    id: "OBJ-AIRCRAFT-02011",
    type: "AircraftAirframe",
    title: "Airbus A320-214 (MSN 02011)",
    properties: {
      tailNumber: "N320AA",
      fleetModel: "A320-200",
      engineType: "CFM56-5B4/P",
      flightHours: 34200,
      complianceStatus: "COMPLIANT_REV16",
      galleyPowerMod: "INSTALLED",
    },
    linkedObjectIds: ["OBJ-SB-24-1118", "OBJ-OPERATOR-DELTA"],
    lastModified: new Date().toISOString(),
    version: 4,
  },
  {
    id: "OBJ-SB-24-1118",
    type: "ServiceBulletin",
    title: "Airbus SB 24-1118 (Galley Supply Control)",
    properties: {
      ataChapter: "24 - Electrical Power",
      revisionNumber: 16,
      releaseDate: "2026-08-15",
      riskClassification: "HIGH_FINANCIAL_IMPACT",
      affectedAirframes: 64,
    },
    linkedObjectIds: ["OBJ-AIRCRAFT-02011"],
    lastModified: new Date().toISOString(),
    version: 16,
  },
  {
    id: "OBJ-OPERATOR-DELTA",
    type: "AirlineOperator",
    title: "Delta Air Lines Fleet Division",
    properties: {
      icaoCode: "DAL",
      hubBase: "KATL",
      activeFleetSize: 184,
      slaContractTier: "ENTERPRISE_GOLD",
    },
    linkedObjectIds: ["OBJ-AIRCRAFT-02011"],
    lastModified: new Date().toISOString(),
    version: 2,
  },
];

// GET /api/ontology/objects
router.get("/objects", (_req, res) => {
  res.json({ success: true, data: ontologyObjects });
});

// POST /api/ontology/objects (Create Object Entity)
router.post("/objects", (req, res) => {
  const { type, title, properties, linkedObjectIds } = req.body;

  const newObj: OntologyObject = {
    id: `OBJ-${(type || "ENTITY").toUpperCase()}-${Date.now().toString().slice(-4)}`,
    type: type || "CustomEntity",
    title: title || "New Ontology Object",
    properties: properties || {},
    linkedObjectIds: linkedObjectIds || [],
    lastModified: new Date().toISOString(),
    version: 1,
  };

  ontologyObjects.unshift(newObj);
  logAuditEvent("SYSTEM", "ONTOLOGY_OBJECT_CREATED", `Ontology entity [${newObj.title}] (${newObj.type}) instantiated`, "INFO");

  res.json({ success: true, data: newObj });
});

// PUT /api/ontology/objects/:id (Update properties)
router.put("/objects/:id", (req, res) => {
  const { id } = req.params;
  const { properties, title } = req.body;
  const obj = ontologyObjects.find((o) => o.id === id);

  if (!obj) return res.status(404).json({ success: false, error: "Ontology object not found" });

  if (title) obj.title = title;
  if (properties) obj.properties = { ...obj.properties, ...properties };
  obj.version += 1;
  obj.lastModified = new Date().toISOString();

  logAuditEvent("SYSTEM", "ONTOLOGY_OBJECT_MUTATED", `Ontology entity [${obj.title}] updated to v${obj.version}`, "INFO");

  res.json({ success: true, data: obj });
});

export default router;
