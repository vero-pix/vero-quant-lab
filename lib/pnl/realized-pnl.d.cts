// Tipos del módulo canónico realized-pnl.cjs (ver ese archivo). Mantiene la forma
// alineada con lib/historial/types para que el service la consuma sin fricción.
import type { BinanceTrade } from "@/lib/binance";
import type { ClosedTrade, HistorialSummary } from "@/lib/historial/types";

export const STABLES: Set<string>;
export const EPS: number;
export const WINDOW_DAYS: number;
export const DEFAULT_DEADBAND_USD: number;
export const DEFAULT_T_CRIT: number;
export const DEFAULT_MIN_TRADES: number;

export function feeToUsd(amount: number, asset: string, prices: Record<string, number>): number;

export function deriveClosedTrades(
  raw: BinanceTrade[],
  prices: Record<string, number>,
): { closed: ClosedTrade[]; openQty: number };

export function filterByWindow(
  closed: ClosedTrade[],
  opts?: { windowDays?: number; now?: number },
): ClosedTrade[];

export function summarize(closed: ClosedTrade[]): HistorialSummary;

export interface EdgeStats {
  n: number;
  net: number;
  wins: number;
  winRate: number | null;
  mean: number;
  se: number;
  tStat: number;
}

export function edgeStats(closed: ClosedTrade[]): EdgeStats;

export type EdgeEstado =
  | "gris_muestra"
  | "gris_breakeven"
  | "gris_ruido"
  | "verde"
  | "rojo";

export interface EdgeVerdict extends EdgeStats {
  estado: EdgeEstado;
  minTrades: number;
  deadbandUsd: number;
  tCrit: number;
}

export function edgeVerdict(
  closed: ClosedTrade[],
  opts?: { minTrades?: number; deadbandUsd?: number; tCrit?: number },
): EdgeVerdict;
