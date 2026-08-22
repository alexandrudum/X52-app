import { Router } from "express";
import { logAuditEvent } from "../services/auditLogger";

const router = Router();

// POST /api/compare/entities
router.post("/entities", (req, res) => {
  const { entityA, entityB, attributes } = req.body;

  const comparisonAttributes = attributes || [
    "thrustRatingKN",
    "fuelBurnKgHr",
    "maximumTakeoffWeightKg",
    "rangeNauticalMiles",
    "maintenanceIntervalHours",
  ];

  const diffMatrix = comparisonAttributes.map((attr: string) => {
    const valA = entityA?.[attr] ?? 24000;
    const valB = entityB?.[attr] ?? 27000;
    const isNumeric = typeof valA === "number" && typeof valB === "number";
    const delta = isNumeric ? valB - valA : String(valA) !== String(valB);
    const variancePercent = isNumeric && valA !== 0 ? Number((((valB - valA) / valA) * 100).toFixed(2)) : 0;

    return {
      attribute: attr,
      entityAValue: valA,
      entityBValue: valB,
      delta,
      variancePercent,
      hasDiscrepancy: isNumeric ? valA !== valB : valA !== valB,
    };
  });

  logAuditEvent("SYSTEM", "ENTITY_COMPARISON_PERFORMED", `Entity comparison executed across ${comparisonAttributes.length} dimensions`, "INFO");

  res.json({
    success: true,
    data: {
      entityAName: entityA?.name || "Baseline Specification",
      entityBName: entityB?.name || "Variant Specification",
      diffMatrix,
      discrepancyCount: diffMatrix.filter((d: { hasDiscrepancy: boolean }) => d.hasDiscrepancy).length,
    },
  });
});

export default router;
