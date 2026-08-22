import os from "os";
import fs from "fs";
import path from "path";

export interface SystemMetrics {
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

let lastCpuInfo = os.cpus();

export function getRealSystemMetrics(): SystemMetrics {
  const currentCpuInfo = os.cpus();
  
  // Compute real CPU % utilization across cores
  let totalIdle = 0;
  let totalTick = 0;
  
  for (let i = 0; i < currentCpuInfo.length; i++) {
    const cpu = currentCpuInfo[i];
    const prev = lastCpuInfo[i] || cpu;
    
    const idle = cpu.times.idle - prev.times.idle;
    const total = 
      (cpu.times.user - prev.times.user) +
      (cpu.times.nice - prev.times.nice) +
      (cpu.times.sys - prev.times.sys) +
      (cpu.times.irq - prev.times.irq) +
      idle;
      
    totalIdle += idle;
    totalTick += total;
  }
  
  lastCpuInfo = currentCpuInfo;
  
  const rawCpuPercent = totalTick > 0 ? 100 - Math.round((totalIdle / totalTick) * 100) : 15;
  const cpuUsagePercent = Math.min(100, Math.max(2, rawCpuPercent));

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = process.memoryUsage();

  return {
    timestamp: new Date().toISOString(),
    os: {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptimeSeconds: Math.floor(os.uptime()),
      loadAvg: os.loadavg().map((l) => Number(l.toFixed(2))),
      cpuCount: currentCpuInfo.length,
      cpuModel: currentCpuInfo[0]?.model || "Apple Silicon / Generic Multi-Core",
    },
    cpuUsagePercent,
    memory: {
      totalBytes: totalMem,
      freeBytes: freeMem,
      usedBytes: usedMem,
      usedPercent: Math.round((usedMem / totalMem) * 100),
      processHeapUsedBytes: memUsage.heapUsed,
      processHeapTotalBytes: memUsage.heapTotal,
      processRssBytes: memUsage.rss,
      processExternalBytes: memUsage.external,
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMB: Math.round(memUsage.heapUsed / 1024 / 1024),
    },
  };
}

export function getDirectoryStats(dirPath: string): { totalFiles: number; totalSizeBytes: number } {
  let totalFiles = 0;
  let totalSizeBytes = 0;

  function traverse(current: string) {
    try {
      if (!fs.existsSync(current)) return;
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          totalFiles++;
          try {
            const stat = fs.statSync(fullPath);
            totalSizeBytes += stat.size;
          } catch {
            // Ignore unreadable files
          }
        }
      }
    } catch {
      // Ignore unreadable dirs
    }
  }

  traverse(dirPath);
  return { totalFiles, totalSizeBytes };
}
