import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { getBinanceService, type BinanceService, type BinanceSnapshot, type BinanceOrder } from "@/lib/binance";
import { getMonitoringService, type MonitoringService } from "@/lib/monitoring";
import type { GuardianHolding, GuardianSnapshot } from "./types";

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
  holdings: [
    { asset: "ETH", pair: "ETHUSDT", qty: 0.47, valueUsd: 811.13, hasStop: true, hasTp: false, protected: true, naked: false },
    { asset: "BTC", pair: "BTCUSDT", qty: 0.0085, valueUsd: 529.89, hasStop: false, hasTp: false, protected: false, naked: true },
  ],
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

// Los balances de Binance Simple Earn / Flexible Savings llegan con prefijo "LD"
// (LDUSDT, LDETH). Normalizamos al asset subyacente para valorizarlos como spot.
function normalizeAsset(asset: string): string {
  return asset.startsWith("LD") && asset.length > 2 ? asset.slice(2) : asset;
}

// Valoriza los balances de Binance a USD. USDT/USDC = 1; el resto con el precio
// {ASSET}USDT del snapshot. Asset sin precio conocido -> 0 (neutro, no crash).
function computeEquityUsd(snapshot: BinanceSnapshot): number {
  const priceOf = (asset: string): number => {
    const a = normalizeAsset(asset);
    if (a === "USDT" || a === "USDC") return 1;
    return snapshot.prices[`${a}USDT`] ?? 0;
  };
  return snapshot.balances.reduce(
    (sum, b) => sum + (b.free + b.locked) * priceOf(b.asset),
    0,
  );
}

const STABLES = new Set(["USDT", "USDC", "BUSD", "FDUSD", "TUSD", "DAI"]);
const MIN_HOLDING_USD = 1;

// ¿Esta orden abierta protege un holding long (venta de stop) para el par?
// Un stop se reconoce por tener stopPrice > 0 o un type que contenga "STOP".
function isStopOrder(o: BinanceOrder): boolean {
  return o.side === "SELL" && (o.stopPrice > 0 || o.type.toUpperCase().includes("STOP"));
}

// ¿Es una pata de take-profit? (TAKE_PROFIT* o la pata LIMIT_MAKER de un OCO.)
function isTakeProfitOrder(o: BinanceOrder): boolean {
  const t = o.type.toUpperCase();
  return o.side === "SELL" && (t.includes("TAKE_PROFIT") || t === "LIMIT_MAKER");
}

// Deriva las posiciones en vivo: cada holding cripto (no stablecoin) valorizado
// > $1 es una posición abierta. Se cruza con las órdenes abiertas del mismo par
// para marcar si tiene stop (protegida) o no (naked = riesgo central).
// Los balances Earn (LDETH, ...) se normalizan y se agregan al asset spot.
function computeHoldings(snapshot: BinanceSnapshot): GuardianHolding[] {
  const priceOf = (asset: string): number => {
    if (asset === "USDT" || asset === "USDC") return 1;
    return snapshot.prices[`${asset}USDT`] ?? 0;
  };

  // Agregamos qty por asset normalizado (spot + Earn del mismo símbolo).
  const qtyByAsset = new Map<string, number>();
  for (const b of snapshot.balances) {
    const asset = normalizeAsset(b.asset);
    if (STABLES.has(asset)) continue;
    qtyByAsset.set(asset, (qtyByAsset.get(asset) ?? 0) + b.free + b.locked);
  }

  const holdings: GuardianHolding[] = [];
  for (const [asset, qty] of qtyByAsset) {
    const pair = `${asset}USDT`;
    const valueUsd = qty * priceOf(asset);
    if (valueUsd <= MIN_HOLDING_USD) continue;

    const ordersForPair = snapshot.openOrders.filter((o) => o.symbol === pair);
    const hasStop = ordersForPair.some(isStopOrder);
    const hasTp = ordersForPair.some(isTakeProfitOrder);

    holdings.push({
      asset,
      pair,
      qty,
      valueUsd: Number(valueUsd.toFixed(2)),
      hasStop,
      hasTp,
      protected: hasStop,
      naked: !hasStop,
    });
  }

  // Mayor exposición primero.
  return holdings.sort((a, b) => b.valueUsd - a.valueUsd);
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

    // POSICIONES: en vivo desde Binance (holdings cripto + órdenes abiertas).
    const holdings = computeHoldings(snapshot);
    const positions = this.computePositions(holdings, equityDayOpen);

    // Histórico (pérdida diaria / rachas): del JSONL, que queda solo de respaldo.
    const rows = readJsonl<BinanceTradeRow>(join(this.basePath, "diario_trades_binance.jsonl"));
    const dailyLoss = this.computeDailyLoss(rows, equityDayOpen);
    const consecutiveLosses = this.computeConsecutiveLosses(rows);

    const services = await this.fetchServices();

    return {
      updatedAt: new Date().toISOString(),
      equityDayOpen,
      dailyLoss,
      consecutiveLosses,
      positions,
      holdings,
      services,
      // Placeholder; GuardianService recomputa el semáforo.
      semaforo: { estado: "GO", razones: [] },
    };
  }

  // Baseline fijo del día: si el archivo es de hoy, se reusa; si no, se captura
  // el equity actual, se persiste y se usa. Nunca persistimos ni usamos un
  // baseline <= 0 (equity vacío/erróneo): eso congelaría el día en 0; en ese
  // caso tratamos el baseline como "no disponible" y usamos el equity del momento.
  private resolveEquityDayOpen(currentEquity: number): number {
    const today = todayIso();
    try {
      if (existsSync(this.statePath)) {
        const state = JSON.parse(readFileSync(this.statePath, "utf-8"));
        if (
          state?.date === today &&
          typeof state.equityDayOpen === "number" &&
          state.equityDayOpen > 0
        ) {
          return state.equityDayOpen;
        }
      }
    } catch {
      // estado corrupto -> recapturamos
    }
    // No congelar el día con un baseline no fiable.
    if (currentEquity <= 0) return currentEquity;
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

  // Posiciones derivadas de los holdings en vivo. El "riesgo abierto" ya no viene
  // de un stop registrado en JSONL, sino de la exposición cripto SIN stop (naked):
  // capital que quedaría expuesto de golpe si el mercado va en contra.
  private computePositions(holdings: GuardianHolding[], equityDayOpen: number) {
    const naked = holdings.filter((h) => h.naked);
    const nakedValue = naked.reduce((s, h) => s + h.valueUsd, 0);
    const riskPct = equityDayOpen > 0 ? (nakedValue / equityDayOpen) * 100 : 0;

    return {
      open: holdings.length,
      naked: naked.length,
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
