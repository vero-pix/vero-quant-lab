import type { BinanceAdapter } from "./adapter";
import type { BinanceSnapshot, BinanceBalance, BinanceOrder, BinanceTrade } from "./types";

export class BinanceService {
  constructor(private adapter: BinanceAdapter) {}

  async getSnapshot(): Promise<BinanceSnapshot> {
    return this.adapter.fetchSnapshot();
  }

  // Ejecuciones reales del par (fills de myTrades), ordenadas por tiempo.
  async getMyTrades(symbol: string): Promise<BinanceTrade[]> {
    return this.adapter.fetchMyTrades(symbol);
  }

  async getBalances(): Promise<BinanceBalance[]> {
    const snapshot = await this.adapter.fetchSnapshot();
    return snapshot.balances;
  }

  async getOpenOrders(): Promise<BinanceOrder[]> {
    const snapshot = await this.adapter.fetchSnapshot();
    return snapshot.openOrders;
  }

  async getPrices(): Promise<Record<string, number>> {
    const snapshot = await this.adapter.fetchSnapshot();
    return snapshot.prices;
  }

  async getBalanceTotal(): Promise<number> {
    const snapshot = await this.adapter.fetchSnapshot();
    return snapshot.balances.reduce((sum, b) => sum + b.free + b.locked, 0);
  }
}
