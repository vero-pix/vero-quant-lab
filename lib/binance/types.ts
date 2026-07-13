export interface BinanceBalance {
  asset: string;
  free: number;
  locked: number;
}

export interface BinanceOrder {
  symbol: string;
  side: "BUY" | "SELL";
  type: string;
  price: number;
  stopPrice: number;
  origQty: number;
  executedQty: number;
  status: string;
}

export interface BinanceSnapshot {
  balances: BinanceBalance[];
  openOrders: BinanceOrder[];
  prices: Record<string, number>;
  updatedAt: string;
}

// Una ejecución REAL (fill) de Binance — GET /api/v3/myTrades. Cada compra o venta
// que efectivamente se ejecutó, con su comisión y la moneda en que se pagó.
export interface BinanceTrade {
  symbol: string;
  id: number;
  orderId: number;
  price: number;
  qty: number;
  quoteQty: number;
  commission: number;
  commissionAsset: string;
  time: number; // epoch ms
  isBuyer: boolean;
  isMaker: boolean;
}
