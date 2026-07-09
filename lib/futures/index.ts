import { MockFuturesAdapter, HttpFuturesAdapter } from "./adapter";
import { FuturesService } from "./service";

let instance: FuturesService | null = null;

export function getFuturesService(): FuturesService {
  if (!instance) {
    const hasKeys = process.env.BINANCE_API_KEY && process.env.BINANCE_SECRET_KEY;
    const useHttp = process.env.FUTURES_SOURCE === "http" || hasKeys;
    const adapter = useHttp ? new HttpFuturesAdapter() : new MockFuturesAdapter();
    instance = new FuturesService(adapter);
  }
  return instance;
}

export type { FuturesPosition, FuturesSnapshot } from "./types";
export type { FuturesAdapter } from "./adapter";
export { FuturesService } from "./service";
export { MockFuturesAdapter, HttpFuturesAdapter } from "./adapter";
