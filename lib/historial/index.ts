import { MockHistorialAdapter, HttpHistorialAdapter } from "./adapter";
import { HistorialService } from "./service";

let instance: HistorialService | null = null;

export function getHistorialService(): HistorialService {
  if (!instance) {
    const hasBinanceKeys = process.env.BINANCE_API_KEY && process.env.BINANCE_SECRET_KEY;
    const useHttp = process.env.HISTORIAL_SOURCE === "http" || hasBinanceKeys;
    const adapter = useHttp ? new HttpHistorialAdapter() : new MockHistorialAdapter();
    instance = new HistorialService(adapter);
  }
  return instance;
}

export type {
  ClosedTrade,
  HistorialSummary,
  SymbolHistorial,
  HistorialSnapshot,
} from "./types";
export type { HistorialAdapter } from "./adapter";
export { HistorialService, deriveClosedTrades } from "./service";
export { MockHistorialAdapter, HttpHistorialAdapter } from "./adapter";
