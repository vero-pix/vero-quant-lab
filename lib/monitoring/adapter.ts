import type { ServiceInfo } from "./types";

export interface VpsSnapshot {
  system: {
    cpu: number;
    ram: { used: number; total: number };
    disk: { used: number; total: number };
    uptime: string;
  };
  services: ServiceInfo[];
}

export interface VpsAdapter {
  fetchSnapshot(): Promise<VpsSnapshot>;
}

export class MockVpsAdapter implements VpsAdapter {
  async fetchSnapshot(): Promise<VpsSnapshot> {
    return {
      system: {
        cpu: 23,
        ram: { used: 3.2, total: 8 },
        disk: { used: 42, total: 100 },
        uptime: "14d 6h 32m",
      },
      services: [
        { id: "detectoreth", name: "vero-detectoreth", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Escanea ETH en 15m buscando patrones A+" },
        { id: "detectorbtc", name: "vero-detectorbtc", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Escanea BTC en 15m buscando patrones A+" },
        { id: "detectoreth1h", name: "vero-detectoreth1h", status: "running", uptime: "5d 6h", lastRestart: "hace 5 días", description: "Escanea ETH en 1h para tendencia" },
        { id: "binanceautoexec", name: "vero-binanceautoexec", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Ejecuta órdenes automáticas en Binance" },
        { id: "binanceguard", name: "vero-binanceguard", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Protege posiciones abiertas con sl/tp dinámico" },
        { id: "binancetrailing", name: "vero-binancetrailing", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Aplica trailing stop a posiciones activas" },
        { id: "telegrambot", name: "vero-telegrambot", status: "restarting", uptime: "—", lastRestart: "hace 2 min", description: "Bot de notificaciones a Telegram" },
        { id: "stopguard", name: "vero-stopguard", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Monitorea stops y activa protecciones" },
        { id: "tpguard", name: "vero-tpguard", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Gestiona take profits automáticos" },
        { id: "trailing", name: "vero-trailing", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Motor principal de trailing stops" },
        { id: "continuacion", name: "vero-continuacion", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Detecta patrones de continuación" },
        { id: "freno", name: "vero-freno", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Detecta señales de freno y reversión" },
        { id: "reportetrading", name: "vero-reportetrading", status: "stopped", uptime: "—", lastRestart: "Stopped hace 18 min", description: "Genera reportes diarios de trading" },
        { id: "scoresenales", name: "vero-scoresenales", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Calcula score de calidad de señales" },
        { id: "recalibracion", name: "vero-recalibracion", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Recalibra parámetros del sistema A+" },
        { id: "resumenmanana", name: "vero-resumenmanana", status: "running", uptime: "2d 14h", lastRestart: "hace 3 días", description: "Envía resumen matutino por Telegram" },
      ],
    };
  }
}

export class HttpVpsAdapter implements VpsAdapter {
  private fallback: MockVpsAdapter;
  private defaultSnapshot: Promise<VpsSnapshot>;

  constructor(private baseUrl: string) {
    this.fallback = new MockVpsAdapter();
    this.defaultSnapshot = this.fallback.fetchSnapshot();
  }

  async fetchSnapshot(): Promise<VpsSnapshot> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${this.baseUrl}/api/status`, {
        signal: controller.signal,
        headers: process.env.VPS_API_TOKEN ? { Authorization: `Bearer ${process.env.VPS_API_TOKEN}` } : undefined,
        next: { revalidate: 30 },
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        system: {
          cpu: data.system?.cpu ?? 0,
          ram: { used: data.system?.ram?.used ?? 0, total: data.system?.ram?.total ?? 1 },
          disk: { used: data.system?.disk?.used ?? 0, total: data.system?.disk?.total ?? 1 },
          uptime: data.system?.uptime ?? "—",
        },
        services: Array.isArray(data.services) ? data.services : [],
      };
    } catch {
      return this.defaultSnapshot;
    }
  }
}
