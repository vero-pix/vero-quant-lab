import type { HistorialAdapter } from "./adapter";
import type { HistorialSnapshot, SymbolHistorial } from "./types";
// FUENTE ÚNICA del PnL realizado — la MISMA que lee el semáforo de Telegram
// (tradingview-mcp/scripts/senales_score.cjs). Misma ventana, mismo cálculo → mismos números.
import {
  deriveClosedTrades,
  filterByWindow,
  summarize,
  WINDOW_DAYS,
} from "@/lib/pnl/realized-pnl.cjs";

// Re-export para no romper a quien lo importaba desde este módulo.
export { deriveClosedTrades };

export class HistorialService {
  constructor(private adapter: HistorialAdapter) {}

  async getSnapshot(): Promise<HistorialSnapshot> {
    const { groups, prices } = await this.adapter.fetchRaw();
    const now = Date.now();

    const build = (symbol: string, asset: string): SymbolHistorial => {
      const group = groups.find((g) => g.symbol === symbol);
      const { closed: all, openQty } = deriveClosedTrades(group?.trades ?? [], prices);
      // Ventana canónica (WINDOW_DAYS) por tiempo de salida — idéntica a Telegram.
      const closed = filterByWindow(all, { windowDays: WINDOW_DAYS, now });
      return { symbol, asset, closed, openQty, summary: summarize(closed) };
    };

    return {
      principal: build("ETHUSDT", "ETH"),
      informativo: build("BTCUSDT", "BTC"),
      updatedAt: new Date().toISOString(),
    };
  }
}
