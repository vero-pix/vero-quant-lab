import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { getBinanceService, type BinanceService, type BinanceSnapshot } from "@/lib/binance";
import { getMonitoringService, type MonitoringService } from "@/lib/monitoring";
import type { GuardianSnapshot } from "./types";

export interface GuardianAdapter {
  fetchSnapshot(): Promise<GuardianSnapshot>;
}

const LIMIT_PCT = 10;
const LIMIT_FLOOR_USD = 5;
const CONSECUTIVE_MAX = 4;
const MAX_POS = 2;
const RISK_LIMIT_PCT = 15;

// ---------- Mock ----------

const EQUITY_DAY_OPEN = 1000;
const DAILY_LOSS_CURRENT = 42;
const MOCK_LIMIT_USD = Math.max((EQUITY_DAY_OPEN * LIMIT_PCT) / 100, LIMIT_FLOOR_USD);

// Caso realista con 1 posición sin stop -> el semáforo debe quedar en BLOQUEO (rojo).
const MOCK_SNAPSHOT: Omit<GuardianSnapshot, "updatedAt"> = {
  equityDayOpen: EQUITY_DAY_OPEN,
  dailyLoss: {
    current: DAILY_LOSS_CURRENT,
    limitPct: LIMIT_PCT,
    limitFloorUsd: LIMIT_FLOOR_USD,
    limitUsd: MOCK_LIMIT_USD,
    pctUsed: DAILY_LOSS_CURRENT / MOCK_LIMIT_USD,
  },
  consecutiveLosses: {
    current: 1,
    max: CONSECUTIVE_MAX,
  },
  positions: {
    open: 2,
    naked: 1,
    riskPct: 8.5,
    riskLimitPct: RISK_LIMIT_PCT,
    maxPos: MAX_POS,
    averaging: false,
  },
  services: [
    { id: "binanceguard", name: "vero-binanceguard", running: true },
    { id: "binancetrailing", name: "vero-binancetrailing", running: true },
  ],
  // El servicio recomputa el semáforo; este valor es solo un placeholder.
  semaforo: { estado: "GO", razones: [] },
};

export class MockGuardianAdapter implements GuardianAdapter {
  async fetchSnapshot(): Promise<GuardianSnapshot> {
    return {
      ...MOCK_SNAPSHOT,
      updatedAt: new Date().toISOString(),
    };
  }
}

// ---------- HTTP (real, Binance-only) ----------

interface BinanceTradeRow {
  sym?: string;
  dir?: string;
  entryPx?: number;
  exitPx?: number;
  size?: number;
  sl?: number;
  tp?: number;
  net?: number;
  openT?: string;
  closeT?: string;
}

// Mismo saneo robusto que repository.readJsonl: recorta basura antes del primer
// { o [, ignora líneas no-JSON, tolera filas incompletas (posiciones abiertas).
function readJsonl<T>(filePath: string): T[] {
  try {
    if (!existsSync(filePath)) return [];
    const raw = readFileSync(filePath, "utf-8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const start = line.search(/[{[]/);
        if (start === -1) return null;
        try {
          return JSON.parse(line.slice(start)) as T;
        } catch {
          return null;
        }
      })
      .filter((x): x is T => x !== null);
  } catch {
    return [];
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Valoriza los balances de Binance a USD. USDT/USDC = 1; el resto con el precio
// {ASSET}USDT del snapshot. Asset sin precio conocido -> 0 (neutro, no crash).
function computeEquityUsd(snapshot: BinanceSnapshot): number {
  const priceOf = (asset: string): number => {
    if (asset === "USDT" || asset === "USDC") return 1;
    return snapshot.prices[`${asset}USDT`] ?? 0;
  };
  return snapshot.balances.reduce(
    (sum, b) => sum + (b.free + b.locked) * priceOf(b.asset),
    0,
  );
}

// net del trade: usa net si viene; si no, lo deriva de exitPx/entryPx/size.
function netOf(row: BinanceTradeRow): number | null {
  if (typeof row.net === "number") return row.net;
  if (
    typeof row.exitPx === "number" &&
    typeof row.entryPx === "number" &&
    typeof row.size === "number"
  ) {
    const sign = row.dir === "SHORT" ? -1 : 1;
    return (row.exitPx - row.entryPx) * row.size * sign;
  }
  return null;
}

export class HttpGuardianAdapter implements GuardianAdapter {
  private basePath: string;
  private statePath: string;

  constructor(
    private binance: BinanceService = getBinanceService(),
    private monitoring: MonitoringService = getMonitoringService(),
    basePath?: string,
  ) {
    this.basePath = basePath ?? process.env.TRADING_DATA_PATH ?? resolve(homedir(), "Trading");
    // Estado local de VQL, NUNCA en ~/Trading (VQL no escribe en la data de trading).
    this.statePath = resolve(process.cwd(), ".guardian-state.json");
  }

  async fetchSnapshot(): Promise<GuardianSnapshot> {
    const snapshot = await this.binance.getSnapshot();
    const currentEquity = computeEquityUsd(snapshot);
    const equityDayOpen = this.resolveEquityDayOpen(currentEquity);

    const rows = readJsonl<BinanceTradeRow>(join(this.basePath, "diario_trades_binance.jsonl"));

    const dailyLoss = this.computeDailyLoss(rows, equityDayOpen);
    const consecutiveLosses = this.computeConsecutiveLosses(rows);
    const positions = this.computePositions(rows, equityDayOpen);
    const services = await this.fetchServices();

    return {
      updatedAt: new Date().toISOString(),
      equityDayOpen,
      dailyLoss,
      consecutiveLosses,
      positions,
      services,
      // Placeholder; GuardianService recomputa el semáforo.
      semaforo: { estado: "GO", razones: [] },
    };
  }

  // Baseline fijo del día: si el archivo es de hoy, se reusa; si no, se captura
  // el equity actual, se persiste y se usa.
  private resolveEquityDayOpen(currentEquity: number): number {
    const today = todayIso();
    try {
      if (existsSync(this.statePath)) {
        const state = JSON.parse(readFileSync(this.statePath, "utf-8"));
        if (state?.date === today && typeof state.equityDayOpen === "number") {
          return state.equityDayOpen;
        }
      }
    } catch {
      // estado corrupto -> recapturamos
    }
    try {
      writeFileSync(
        this.statePath,
        JSON.stringify({ date: today, equityDayOpen: currentEquity }, null, 2),
      );
    } catch {
      // best effort: si no se puede escribir, seguimos con el equity actual
    }
    return currentEquity;
  }

  private closedTrades(rows: BinanceTradeRow[]): BinanceTradeRow[] {
    return rows.filter(
      (r) => typeof r.net === "number" || (!!r.closeT && typeof r.exitPx === "number"),
    );
  }

  private computeDailyLoss(rows: BinanceTradeRow[], equityDayOpen: number) {
    const today = todayIso();
    const closedToday = this.closedTrades(rows).filter(
      (r) => (r.closeT ?? "").slice(0, 10) === today,
    );
    const sumNet = closedToday.reduce((s, r) => s + (netOf(r) ?? 0), 0);
    const current = Math.max(0, -sumNet); // positivo = pérdida; ganancia deja 0

    const limitUsd = Math.max((equityDayOpen * LIMIT_PCT) / 100, LIMIT_FLOOR_USD);
    return {
      current,
      limitPct: LIMIT_PCT,
      limitFloorUsd: LIMIT_FLOOR_USD,
      limitUsd,
      pctUsed: limitUsd > 0 ? current / limitUsd : 0,
    };
  }

  private computeConsecutiveLosses(rows: BinanceTradeRow[]) {
    const closed = [...this.closedTrades(rows)].sort(
      (a, b) =>
        new Date(a.closeT ?? a.openT ?? 0).getTime() -
        new Date(b.closeT ?? b.openT ?? 0).getTime(),
    );
    let current = 0;
    for (let i = closed.length - 1; i >= 0; i--) {
      const n = netOf(closed[i]);
      if (n !== null && n < 0) current++;
      else break;
    }
    return { current, max: CONSECUTIVE_MAX };
  }

  private computePositions(rows: BinanceTradeRow[], equityDayOpen: number) {
    const open = rows.filter((r) => !r.closeT);
    const naked = open.filter((r) => r.sl === undefined || r.sl === null).length;
    const riskAbs = open
      .filter(
        (r) =>
          typeof r.sl === "number" &&
          typeof r.entryPx === "number" &&
          typeof r.size === "number",
      )
      .reduce((s, r) => s + Math.abs((r.entryPx as number) - (r.sl as number)) * (r.size as number), 0);
    const riskPct = equityDayOpen > 0 ? (riskAbs / equityDayOpen) * 100 : 0;

    return {
      open: open.length,
      naked,
      riskPct: Number(riskPct.toFixed(2)),
      riskLimitPct: RISK_LIMIT_PCT,
      maxPos: MAX_POS,
      averaging: false,
    };
  }

  // Estado de los guardianes de BINANCE (no los de Capital, retirado).
  private async fetchServices() {
    let services: Awaited<ReturnType<MonitoringService["getServices"]>> = [];
    try {
      services = await this.monitoring.getServices();
    } catch {
      services = [];
    }
    const pick = (id: string, fallbackName: string) => {
      const svc = services.find((s) => s.id === id);
      return { id, name: svc?.name ?? fallbackName, running: svc?.status === "running" };
    };
    return [
      pick("binanceguard", "vero-binanceguard"),
      pick("binancetrailing", "vero-binancetrailing"),
    ];
  }
}
