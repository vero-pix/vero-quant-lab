import fs from "node:fs";
import path from "node:path";
import type { LogEntry, LogLevel } from "./types";

export interface LogAdapter {
  fetchLogs(limit?: number): Promise<LogEntry[]>;
}

function logLevelFromPnl(pnl: number): LogLevel {
  if (pnl > 0) return "success";
  if (pnl < 0) return "error";
  return "info";
}

export class CompositeLogAdapter implements LogAdapter {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? path.join(process.env.HOME || "~", "Desktop", "Trading");
  }

  async fetchLogs(limit = 100): Promise<LogEntry[]> {
    const logs: LogEntry[] = [];

    const tradeLines = this.readLines("diario_trades.jsonl");
    for (const line of tradeLines) {
      try {
        const t = JSON.parse(line);
        const pnl = t.net ?? t.rpl ?? 0;
        logs.push({
          id: `trade-${t.id ?? logs.length}`,
          ts: new Date(t.closeT ?? t.openT).toISOString(),
          level: logLevelFromPnl(pnl),
          source: "engine",
          message: `${t.dir === "long" ? "🟢" : "🔴"} ${t.sym} — ${pnl >= 0 ? "ganancia" : "pérdida"}`,
          detail: `Entrada: ${t.entryPx} · Salida: ${t.exitPx} · R: ${t.rpl?.toFixed(2) ?? "—"}`,
          metadata: { sym: t.sym, pnl, rpl: t.rpl ?? 0 },
        });
      } catch { /* skip malformed */ }
    }

    const signalLines = this.readLines("senales_aplus.jsonl");
    for (const line of signalLines) {
      try {
        const s = JSON.parse(line);
        logs.push({
          id: `signal-${s.ts ?? logs.length}`,
          ts: new Date(s.fecha ?? s.ts * 1000).toISOString(),
          level: s.resultado === "target" ? "success" : "warning",
          source: "engine",
          message: `Señal A+ ${s.symbol} — ${s.resultado === "target" ? "target alcanzado" : "stop loss"}`,
          detail: `Entrada: ${s.entry} · SL: ${s.sl} · TP: ${s.tp} · RSI: ${s.rsi} · Régimen: ${s.regimen}`,
          metadata: { symbol: s.symbol, pnl: s.pnl, rsi: s.rsi },
        });
      } catch { /* skip */ }
    }

    const reportLines = this.readLines("reporte_diario.jsonl");
    for (const line of reportLines) {
      try {
        const r = JSON.parse(line);
        logs.push({
          id: `report-${r.fecha ?? logs.length}`,
          ts: new Date(r.fecha).toISOString(),
          level: r.net >= 0 ? "success" : "error",
          source: "engine",
          message: `Reporte diario — ${r.n} trades · ${r.wr}% WR · ${r.net >= 0 ? "+" : ""}${r.net}`,
          detail: `Fecha: ${r.fecha} · Trades: ${r.n} · Win Rate: ${r.wr}% · Net: ${r.net >= 0 ? "+" : ""}${r.net}`,
          metadata: { trades: r.n, wr: r.wr, net: r.net },
        });
      } catch { /* skip */ }
    }

    return logs
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, limit);
  }

  private readLines(filename: string): string[] {
    try {
      const fullPath = path.join(this.baseDir, filename);
      if (!fs.existsSync(fullPath)) return [];
      const content = fs.readFileSync(fullPath, "utf-8");
      return content.split("\n").filter(Boolean);
    } catch {
      return [];
    }
  }
}

export class MockLogAdapter implements LogAdapter {
  async fetchLogs(limit = 100): Promise<LogEntry[]> {
    const now = Date.now();
    const entries: LogEntry[] = [
      { id: "l1", ts: new Date(now - 60000).toISOString(), level: "success", source: "engine", message: "Señal A+ ETH alcanzó target", detail: "Entrada: 2450 · SL: 2380 · TP: 2520 · R: 2.1" },
      { id: "l2", ts: new Date(now - 120000).toISOString(), level: "info", source: "telegram", message: "Resumen matutino enviado", detail: "5 señales activas · 3 en profit · 2 en breakeven" },
      { id: "l3", ts: new Date(now - 300000).toISOString(), level: "error", source: "engine", message: "Señal A+ BTC perdió en stop loss", detail: "Entrada: 42000 · SL: 41500 · TP: 43000 · R: -1.0" },
      { id: "l4", ts: new Date(now - 600000).toISOString(), level: "warning", source: "binance", message: "Latencia alta en WebSocket", detail: "300ms de retraso en el feed de precios" },
      { id: "l5", ts: new Date(now - 900000).toISOString(), level: "success", source: "engine", message: "Reporte diario generado", detail: "8 trades · 75% WR · +2.4R" },
      { id: "l6", ts: new Date(now - 1800000).toISOString(), level: "info", source: "system", message: "VPS health check OK", detail: "CPU: 23% · RAM: 3.2/8 GB · Disco: 42/100 GB" },
      { id: "l7", ts: new Date(now - 3600000).toISOString(), level: "critical", source: "telegram", message: "Bot de Telegram desconectado", detail: "Reconectando automáticamente en 30s" },
      { id: "l8", ts: new Date(now - 7200000).toISOString(), level: "info", source: "engine", message: "Recalibración completada", detail: "Parámetros A+ actualizados para ETH y BTC" },
      { id: "l9", ts: new Date(now - 14400000).toISOString(), level: "warning", source: "binance", message: "Orden parcialmente llenada", detail: "ETH 0.5/1.0 — precio promedio 2448" },
      { id: "l10", ts: new Date(now - 28800000).toISOString(), level: "success", source: "engine", message: "Señal A+ BTC activada", detail: "Entrada: 41500 · SL: 40800 · TP: 42800 · Score: 92" },
    ];
    return entries.slice(0, limit);
  }
}
