// Posición de Futuros de Binance (apalancada). Informativa: VQL NO ejecuta órdenes.
export interface FuturesPosition {
  symbol: string; // ej. "ETHUSDT"
  side: "LONG" | "SHORT";
  leverage: number; // apalancamiento (x)
  entryPx: number; // precio de entrada
  markPx: number; // precio de marca (mark price)
  liqPx: number; // precio de liquidación (0 = sin liquidación calculable)
  distToLiqPct: number; // % de distancia de la marca a la liquidación (más alto = más seguro)
  notionalUsd: number; // tamaño nocional de la posición en USD
  marginUsd: number; // margen comprometido en USD
  uPnlUsd: number; // PnL no realizado en USD
  uPnlPct: number; // PnL no realizado sobre el margen (%)
  hasStop: boolean; // existe una orden STOP/TP protegiendo la posición
}

export interface FuturesSnapshot {
  positions: FuturesPosition[];
  updatedAt: string;
}
