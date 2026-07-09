import { createHmac } from "crypto";
import type { BinanceSnapshot, BinanceBalance, BinanceOrder } from "./types";

export interface BinanceAdapter {
  fetchSnapshot(): Promise<BinanceSnapshot>;
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
