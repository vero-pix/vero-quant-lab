import { MockBinanceAdapter, HttpBinanceAdapter } from "./adapter";
import { BinanceService } from "./service";

let instance: BinanceService | null = null;

export function getBinanceService(): BinanceService {
  if (!instance) {
    const hasKeys = process.env.BINANCE_API_KEY && process.env.BINANCE_SECRET_KEY;
    const adapter = hasKeys ? new HttpBinanceAdapter() : new MockBinanceAdapter();
    instance = new BinanceService(adapter);
  }
  return instance;
}

export type { BinanceSnapshot, BinanceBalance, BinanceOrder } from "./types";
export type { BinanceAdapter } from "./adapter";
export { BinanceService } from "./service";
export { MockBinanceAdapter, HttpBinanceAdapter } from "./adapter";
