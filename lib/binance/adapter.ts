import { createHmac } from "crypto";
import type { BinanceSnapshot, BinanceBalance, BinanceOrder, BinanceTrade } from "./types";

export interface BinanceAdapter {
  fetchSnapshot(): Promise<BinanceSnapshot>;
  fetchMyTrades(symbol: string): Promise<BinanceTrade[]>;
}

const MOCK_BALANCES: BinanceBalance[] = [
  { asset: "USDT", free: 8472.35, locked: 1500.00 },
  { asset: "ETH", free: 0.42, locked: 0.05 },
  { asset: "BTC", free: 0.0085, locked: 0 },
];

const MOCK_ORDERS: BinanceOrder[] = [
  // ETH protegido con un stop (SELL STOP_LOSS_LIMIT). BTC queda naked.
  { symbol: "ETHUSDT", side: "SELL", type: "STOP_LOSS_LIMIT", price: 1600.00, stopPrice: 1610.00, origQty: 0.47, executedQty: 0, status: "NEW" },
];

const MOCK_PRICES: Record<string, number> = {
  ETHUSDT: 1725.80,
  BTCUSDT: 62340.00,
  BNBUSDT: 605.00,
};

// Ejecuciones de ejemplo (para el modo sin keys). Compras y ventas reales de
// spot con comisión pagada en BNB (con descuento) y alguna en USDT, para ejercer
// el casado FIFO y el flag "pagó en BNB".
const t = (iso: string) => new Date(iso).getTime();
const MOCK_TRADES: Record<string, BinanceTrade[]> = {
  ETHUSDT: [
    { symbol: "ETHUSDT", id: 1, orderId: 11, price: 1700.0, qty: 0.30, quoteQty: 510.0, commission: 0.00090, commissionAsset: "BNB", time: t("2026-07-02T13:10:00Z"), isBuyer: true, isMaker: false },
    { symbol: "ETHUSDT", id: 2, orderId: 12, price: 1760.0, qty: 0.30, quoteQty: 528.0, commission: 0.00093, commissionAsset: "BNB", time: t("2026-07-03T09:40:00Z"), isBuyer: false, isMaker: false },
    { symbol: "ETHUSDT", id: 3, orderId: 13, price: 1800.0, qty: 0.25, quoteQty: 450.0, commission: 0.00085, commissionAsset: "BNB", time: t("2026-07-04T15:05:00Z"), isBuyer: true, isMaker: false },
    { symbol: "ETHUSDT", id: 4, orderId: 14, price: 1775.0, qty: 0.25, quoteQty: 443.75, commission: 0.00084, commissionAsset: "BNB", time: t("2026-07-05T11:20:00Z"), isBuyer: false, isMaker: false },
    { symbol: "ETHUSDT", id: 5, orderId: 15, price: 1740.0, qty: 0.40, quoteQty: 696.0, commission: 0.696, commissionAsset: "USDT", time: t("2026-07-07T10:00:00Z"), isBuyer: true, isMaker: false },
    { symbol: "ETHUSDT", id: 6, orderId: 16, price: 1795.0, qty: 0.40, quoteQty: 718.0, commission: 0.718, commissionAsset: "USDT", time: t("2026-07-08T16:30:00Z"), isBuyer: false, isMaker: false },
    { symbol: "ETHUSDT", id: 7, orderId: 17, price: 1810.0, qty: 0.20, quoteQty: 362.0, commission: 0.00060, commissionAsset: "BNB", time: t("2026-07-09T12:00:00Z"), isBuyer: true, isMaker: false },
  ],
  BTCUSDT: [
    { symbol: "BTCUSDT", id: 21, orderId: 31, price: 61000.0, qty: 0.010, quoteQty: 610.0, commission: 0.00090, commissionAsset: "BNB", time: t("2026-07-01T08:00:00Z"), isBuyer: true, isMaker: false },
    { symbol: "BTCUSDT", id: 22, orderId: 32, price: 62500.0, qty: 0.010, quoteQty: 625.0, commission: 0.00092, commissionAsset: "BNB", time: t("2026-07-02T18:15:00Z"), isBuyer: false, isMaker: false },
    { symbol: "BTCUSDT", id: 23, orderId: 33, price: 63000.0, qty: 0.008, quoteQty: 504.0, commission: 0.00074, commissionAsset: "BNB", time: t("2026-07-06T07:30:00Z"), isBuyer: true, isMaker: false },
    { symbol: "BTCUSDT", id: 24, orderId: 34, price: 62200.0, qty: 0.008, quoteQty: 497.6, commission: 0.00073, commissionAsset: "BNB", time: t("2026-07-07T19:45:00Z"), isBuyer: false, isMaker: false },
  ],
};

export class MockBinanceAdapter implements BinanceAdapter {
  async fetchSnapshot(): Promise<BinanceSnapshot> {
    return {
      balances: MOCK_BALANCES,
      openOrders: MOCK_ORDERS,
      prices: MOCK_PRICES,
      updatedAt: new Date().toISOString(),
    };
  }

  async fetchMyTrades(symbol: string): Promise<BinanceTrade[]> {
    return MOCK_TRADES[symbol] ?? [];
  }
}

export class HttpBinanceAdapter implements BinanceAdapter {
  private baseUrl: string;
  private apiKey: string;
  private secretKey: string;

  constructor() {
    this.baseUrl = process.env.BINANCE_API_URL ?? "https://api.binance.com";
    this.apiKey = process.env.BINANCE_API_KEY ?? "";
    this.secretKey = process.env.BINANCE_SECRET_KEY ?? "";
  }

  async fetchSnapshot(): Promise<BinanceSnapshot> {
    const [balances, openOrders, prices] = await Promise.all([
      this.fetchBalances(),
      this.fetchOpenOrders(),
      this.fetchPrices(),
    ]);

    return {
      balances,
      openOrders,
      prices,
      updatedAt: new Date().toISOString(),
    };
  }

  private async signedGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const timestamp = Date.now().toString();
    const query = new URLSearchParams({ ...params, timestamp }).toString();
    const signature = createHmac("sha256", this.secretKey).update(query).digest("hex");
    const url = `${this.baseUrl}${path}?${query}&signature=${signature}`;

    const res = await fetch(url, {
      headers: { "X-MBX-APIKEY": this.apiKey },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Binance API ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  // Ejecuciones reales del par (GET /api/v3/myTrades, firmado). La key read-only
  // tiene permiso de lectura. Ante error o sin keys devolvemos [] (0 ejecuciones
  // es un estado válido y honesto: NO inventamos trades falsos en la vista real).
  async fetchMyTrades(symbol: string): Promise<BinanceTrade[]> {
    if (!this.apiKey || !this.secretKey) return [];
    try {
      const data = await this.signedGet<
        Array<{
          symbol: string;
          id: number;
          orderId: number;
          price: string;
          qty: string;
          quoteQty: string;
          commission: string;
          commissionAsset: string;
          time: number;
          isBuyer: boolean;
          isMaker: boolean;
        }>
      >("/api/v3/myTrades", { symbol, limit: "1000" });
      return data
        .map((r) => ({
          symbol: r.symbol,
          id: r.id,
          orderId: r.orderId,
          price: Number.parseFloat(r.price),
          qty: Number.parseFloat(r.qty),
          quoteQty: Number.parseFloat(r.quoteQty),
          commission: Number.parseFloat(r.commission),
          commissionAsset: r.commissionAsset,
          time: r.time,
          isBuyer: r.isBuyer,
          isMaker: r.isMaker,
        }))
        .sort((a, b) => a.time - b.time);
    } catch {
      return [];
    }
  }

  private async fetchBalances(): Promise<BinanceBalance[]> {
    if (!this.apiKey || !this.secretKey) return MOCK_BALANCES;
    try {
      const data = await this.signedGet<{ balances: { asset: string; free: string; locked: string }[] }>("/api/v3/account");
      return data.balances
        .filter((b) => Number.parseFloat(b.free) > 0 || Number.parseFloat(b.locked) > 0)
        .map((b) => ({ asset: b.asset, free: Number.parseFloat(b.free), locked: Number.parseFloat(b.locked) }));
    } catch {
      return MOCK_BALANCES;
    }
  }

  private async fetchOpenOrders(): Promise<BinanceOrder[]> {
    if (!this.apiKey || !this.secretKey) return MOCK_ORDERS;
    try {
      const data = await this.signedGet<BinanceOrder[]>("/api/v3/openOrders");
      return data.map((o) => ({
        ...o,
        price: Number.parseFloat(String(o.price)),
        stopPrice: Number.parseFloat(String(o.stopPrice ?? 0)) || 0,
        origQty: Number.parseFloat(String(o.origQty)),
        executedQty: Number.parseFloat(String(o.executedQty)),
      }));
    } catch {
      return MOCK_ORDERS;
    }
  }

  // Trae TODOS los precios USDT del exchange para poder valorizar cualquier
  // holding (no solo ETH/BTC). Endpoint público, sin firma.
  private async fetchPrices(): Promise<Record<string, number>> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v3/ticker/price`, {
        next: { revalidate: 30 },
      });
      if (!res.ok) return MOCK_PRICES;
      const data = await res.json() as { symbol: string; price: string }[];
      const prices: Record<string, number> = {};
      for (const item of data) {
        prices[item.symbol] = Number.parseFloat(item.price);
      }
      return prices;
    } catch {
      return MOCK_PRICES;
    }
  }
}
