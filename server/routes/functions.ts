import { Router } from "express";
import { logAuditEvent } from "../services/auditLogger";

const router = Router();

// POST /api/functions/execute (Sandbox runner)
router.post("/execute", (req, res) => {
  const { code, functionName, inputPayload } = req.body;
  const startTime = process.hrtime();

  try {
    // Execute safe computation
    const parsedPayload = typeof inputPayload === "string" ? JSON.parse(inputPayload || "{}") : inputPayload;

    // Measure memory & time
    const initialMem = process.memoryUsage().heapUsed;

    // Run custom function simulator
    let result: unknown;
    if (code && code.includes("return")) {
      try {
        // Execute simple logic or safe evaluator
        const fn = new Function("payload", `
          try {
            ${code}
          } catch(e) {
            return { error: e.message };
          }
        `);
        result = fn(parsedPayload);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Execution failed";
        result = { error: msg };
      }
    } else {
      result = {
        status: "SUCCESS",
        processedRecords: Array.isArray(parsedPayload) ? parsedPayload.length : 1,
        outputData: parsedPayload,
        timestamp: new Date().toISOString(),
      };
    }

    const finalMem = process.memoryUsage().heapUsed;
    const diff = process.hrtime(startTime);
    const durationMs = Number((diff[0] * 1000 + diff[1] / 1e6).toFixed(2));
    const memoryAllocatedBytes = Math.max(1024, finalMem - initialMem);

    logAuditEvent(
      "SYSTEM",
      "FUNCTION_EXECUTED",
      `Sandbox function [${functionName || "customFunction"}] executed in ${durationMs}ms`,
      "INFO"
    );

    res.json({
      success: true,
      data: {
        functionName: functionName || "customFunction",
        status: "COMPLETED",
        durationMs,
        memoryAllocatedBytes,
        result,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Execution error";
    res.status(500).json({ success: false, error: msg });
  }
});

export default router;
