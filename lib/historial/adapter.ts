import { getBinanceService, type BinanceService, type BinanceTrade } from "@/lib/binance";
import type { HistorialRaw, HistorialRawGroup } from "./types";

export interface HistorialAdapter {
  fetchRaw(): Promise<HistorialRaw>;
}

// Pares que mira la vista: ETH es lo que se opera (principal); BTC es informativo.
const SYMBOLS: { symbol: string; asset: string }[] = [
  { symbol: "ETHUSDT", asset: "ETH" },
  { symbol: "BTCUSDT", asset: "BTC" },
];

// ---------- Mock ----------

const mk = (iso: string) => new Date(iso).getTime();

const MOCK_TRADES: Record<string, BinanceTrade[]> = {
  ETHUSDT: [
    { symbol: "ETHUSDT", id: 1, orderId: 11, price: 1700.0, qty: 0.30, quoteQty: 510.0, commission: 0.0009, commissionAsset: "BNB", time: mk("2026-07-02T13:10:00Z"), isBuyer: true, isMaker: false },
    { symbol: "ETHUSDT", id: 2, orderId: 12, price: 1760.0, qty: 0.30, quoteQty: 528.0, commission: 0.00093, commissionAsset: "BNB", time: mk("2026-07-03T09:40:00Z"), isBuyer: false, isMaker: false },
    { symbol: "ETHUSDT", id: 3, orderId: 13, price: 1800.0, qty: 0.25, quoteQty: 450.0, commission: 0.00085, commissionAsset: "BNB", time: mk("2026-07-04T15:05:00Z"), isBuyer: true, isMaker: false },
    { symbol: "ETHUSDT", id: 4, orderId: 14, price: 1775.0, qty: 0.25, quoteQty: 443.75, commission: 0.00084, commissionAsset: "BNB", time: mk("2026-07-05T11:20:00Z"), isBuyer: false, isMaker: false },
    { symbol: "ETHUSDT", id: 5, orderId: 15, price: 1740.0, qty: 0.40, quoteQty: 696.0, commission: 0.696, commissionAsset: "USDT", time: mk("2026-07-07T10:00:00Z"), isBuyer: true, isMaker: false },
    { symbol: "ETHUSDT", id: 6, orderId: 16, price: 1795.0, qty: 0.40, quoteQty: 718.0, commission: 0.718, commissionAsset: "USDT", time: mk("2026-07-08T16:30:00Z"), isBuyer: false, isMaker: false },
    { symbol: "ETHUSDT", id: 7, orderId: 17, price: 1810.0, qty: 0.20, quoteQty: 362.0, commission: 0.0006, commissionAsset: "BNB", time: mk("2026-07-09T12:00:00Z"), isBuyer: true, isMaker: false },
  ],
  BTCUSDT: [
    { symbol: "BTCUSDT", id: 21, orderId: 31, price: 61000.0, qty: 0.010, quoteQty: 610.0, commission: 0.0009, commissionAsset: "BNB", time: mk("2026-07-01T08:00:00Z"), isBuyer: true, isMaker: false },
    { symbol: "BTCUSDT", id: 22, orderId: 32, price: 62500.0, qty: 0.010, quoteQty: 625.0, commission: 0.00092, commissionAsset: "BNB", time: mk("2026-07-02T18:15:00Z"), isBuyer: false, isMaker: false },
    { symbol: "BTCUSDT", id: 23, orderId: 33, price: 63000.0, qty: 0.008, quoteQty: 504.0, commission: 0.00074, commissionAsset: "BNB", time: mk("2026-07-06T07:30:00Z"), isBuyer: true, isMaker: false },
    { symbol: "BTCUSDT", id: 24, orderId: 34, price: 62200.0, qty: 0.008, quoteQty: 497.6, commission: 0.00073, commissionAsset: "BNB", time: mk("2026-07-07T19:45:00Z"), isBuyer: false, isMaker: false },
  ],
};

const MOCK_PRICES: Record<string, number> = {
  ETHUSDT: 1795.0,
  BTCUSDT: 62200.0,
  BNBUSDT: 605.0,
};

export class MockHistorialAdapter implements HistorialAdapter {
  async fetchRaw(): Promise<HistorialRaw> {
    const groups: HistorialRawGroup[] = SYMBOLS.map(({ symbol, asset }) => ({
      symbol,
      asset,
      trades: MOCK_TRADES[symbol] ?? [],
    }));
    return { groups, prices: MOCK_PRICES };
  }
}

// ---------- HTTP (real, Binance-only) ----------

// VQL es visor: lee las ejecuciones DIRECTO de Binance con la key read-only (igual
// que Guardian). No depende de archivos del sistema de trading ni toca vero-*.
export class HttpHistorialAdapter implements HistorialAdapter {
  private baseUrl: string;

  constructor(private binance: BinanceService = getBinanceService()) {
    this.baseUrl = process.env.BINANCE_API_URL ?? "https://api.binance.com";
  }

  async fetchRaw(): Promise<HistorialRaw> {
    const [groups, prices] = await Promise.all([
      Promise.all(
        SYMBOLS.map(async ({ symbol, asset }) => ({
          symbol,
          asset,
          trades: await this.binance.getMyTrades(symbol),
        })),
      ),
      this.fetchPrices(),
    ]);
    return { groups, prices };
  }

  // Precios spot (endpoint público, sin firma) para valorizar comisiones a USD
  // —sobre todo el BNB de las fees. Ante error, {} (fee en USD cae a 0, neutro).
  private async fetchPrices(): Promise<Record<string, number>> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v3/ticker/price`, {
        next: { revalidate: 30 },
      });
      if (!res.ok) return {};
      const data = (await res.json()) as { symbol: string; price: string }[];
      const prices: Record<string, number> = {};
      for (const item of data) prices[item.symbol] = Number.parseFloat(item.price);
      return prices;
    } catch {
      return {};
    }
  }
}
