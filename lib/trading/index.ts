import { JsonTradingRepository } from "./repository";
import { TradingService } from "./service";

let instance: TradingService | null = null;

export function getTradingService(): TradingService {
  if (!instance) {
    const repo = new JsonTradingRepository();
    instance = new TradingService(repo);
  }
  return instance;
}

export type { Trade, SignalAplus, DailyReport, DashboardData, SystemStatusItem } from "./types";
export type { TradingRepository } from "./repository";
export { TradingService } from "./service";
export { JsonTradingRepository } from "./repository";
