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
