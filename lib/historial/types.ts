// Historial de ejecuciones REALES: trades cerrados derivados de las ejecuciones
// (fills) de Binance casando compras con ventas por FIFO. El veredicto y el PnL
// salen de lo que efectivamente se ejecutó, NO del senales_aplus simulado.

// Un trade cerrado: una tanda de compra(s) casada con una venta (FIFO).
export interface ClosedTrade {
  symbol: string;
  side: "LONG"; // spot: se compra y luego se vende
  entryTime: string; // ISO — primera compra casada
  exitTime: string; // ISO — venta que cerró
  entryPx: number; // precio de entrada promedio ponderado
  exitPx: number; // precio de salida
  size: number; // cantidad de base cerrada
  grossPnl: number; // PnL bruto en USDT (sin comisiones)
  commissionUsd: number; // comisión total valorizada en USD
  commissionNative: number | null; // monto en su moneda si es una sola; null si mixto
  commissionAsset: string; // "BNB" | "USDT" | … | "mixto"
  feePaidInBnb: boolean; // se pagó (total o parcialmente) en BNB
  netPnl: number; // grossPnl - commissionUsd
}

// Resumen de un símbolo: veredicto real acumulado.
export interface HistorialSummary {
  nTrades: number;
  wins: number;
  winRate: number; // 0..1 (WR real sobre trades cerrados)
  grossAcum: number;
  netAcum: number; // neto realizado acumulado (USD)
  feeTotalUsd: number; // comisión total pagada (USD)
  feePaidInBnb: boolean; // hubo comisiones en BNB
}

export interface SymbolHistorial {
  symbol: string;
  asset: string; // "ETH" | "BTC"
  closed: ClosedTrade[]; // más reciente primero
  openQty: number; // base comprada aún sin vender (posición abierta, informativo)
  summary: HistorialSummary;
}

export interface HistorialSnapshot {
  principal: SymbolHistorial; // ETH — lo que se opera
  informativo: SymbolHistorial; // BTC — informativo, no se opera
  updatedAt: string;
}

// Datos crudos que entrega el adapter al service.
export interface HistorialRawGroup {
  symbol: string;
  asset: string;
  trades: import("@/lib/binance").BinanceTrade[];
}

export interface HistorialRaw {
  groups: HistorialRawGroup[];
  prices: Record<string, number>; // para valorizar comisiones a USD (BNBUSDT, etc.)
}
