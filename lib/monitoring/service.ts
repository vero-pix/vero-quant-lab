import type { VpsAdapter } from "./adapter";
import type { SystemHealthData, ServiceInfo } from "./types";

function detailLine(label: string, value: string): string {
  return `${label}: ${value}`;
}

export class MonitoringService {
  constructor(private adapter: VpsAdapter) {}

  async getSystemHealth(): Promise<SystemHealthData> {
    const snapshot = await this.adapter.fetchSnapshot();
    const sys = snapshot.system;
    const ramPct = Math.round((sys.ram.used / sys.ram.total) * 100);
    const diskPct = Math.round((sys.disk.used / sys.disk.total) * 100);

    return {
      components: [
        {
          id: "vps",
          name: "VPS",
          status: sys.cpu < 90 ? "online" : "warning",
          detail: [
            detailLine("CPU", `${sys.cpu}%`),
            detailLine("RAM", `${ramPct}% (${sys.ram.used.toFixed(1)}/${sys.ram.total.toFixed(0)} GB)`),
            detailLine("Disco", `${diskPct}% (${sys.disk.used.toFixed(0)}/${sys.disk.total.toFixed(0)} GB)`),
            detailLine("Uptime", sys.uptime),
          ].join(" · "),
        },
        {
          id: "trading-engine",
          name: "Trading Engine",
          status: "online",
          detail: `Ejecutando A+ v2.1 — ${snapshot.services.filter((s) => s.status === "running").length} servicios activos`,
        },
        {
          id: "binance",
          name: "Binance",
          status: "online",
          detail: "Conectado",
        },
        {
          id: "telegram",
          name: "Telegram",
          status: snapshot.services.find((s) => s.id === "telegrambot")?.status === "running" ? "online" : "warning",
          detail: snapshot.services.find((s) => s.id === "telegrambot")?.status === "running" ? "Bot activo" : "Bot desconectado",
        },
      ],
      heartbeat: `${sys.cpu}% CPU · ${ramPct}% RAM · ${diskPct}% disco`,
      updatedAt: sys.uptime,
    };
  }

  async getServices(): Promise<ServiceInfo[]> {
    const snapshot = await this.adapter.fetchSnapshot();
    return snapshot.services;
  }
}
