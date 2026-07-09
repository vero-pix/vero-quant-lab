import { createHmac } from "crypto";
import type { FuturesPosition, FuturesSnapshot } from "./types";

export interface FuturesAdapter {
  fetchSnapshot(): Promise<FuturesSnapshot>;
}

// Distancia de la marca a la liquidación (%). Para LONG la liquidación está abajo;
// para SHORT, arriba. liqPx<=0 => sin liquidación calculable -> "muy lejos".
function distToLiq(side: "LONG" | "SHORT", markPx: number, liqPx: number): number {
  if (!liqPx || liqPx <= 0 || !markPx) return 999;
  const raw = side === "LONG" ? (markPx - liqPx) / markPx : (liqPx - markPx) / markPx;
  return Number((raw * 100).toFixed(2));
}

// ---------- Mock ----------

// 1 posición de ejemplo: ETH LONG 5x. Entrada 1700, marca 1742. Liquidación ~1385
// (≈20% bajo la marca, distancia realista para 5x). Margen = nocional/leverage.
const MOCK_POSITION: FuturesPosition = (() => {
  const side = "LONG" as const;
  const leverage = 5;
  const entryPx = 1700;
  const markPx = 1742;
  const liqPx = 1385;
  const qty = 0.5;
  const notionalUsd = Number((qty * markPx).toFixed(2)); // ~871
  const marginUsd = Number((notionalUsd / leverage).toFixed(2)); // ~174.2
  const uPnlUsd = Number(((markPx - entryPx) * qty).toFixed(2)); // ~21
  const uPnlPct = Number(((uPnlUsd / marginUsd) * 100).toFixed(2)); // ~12%
  return {
    symbol: "ETHUSDT",
    side,
    leverage,
    entryPx,
    markPx,
    liqPx,
    distToLiqPct: distToLiq(side, markPx, liqPx),
    notionalUsd,
    marginUsd,
    uPnlUsd,
    uPnlPct,
    hasStop: false,
  };
})();

export class MockFuturesAdapter implements FuturesAdapter {
  async fetchSnapshot(): Promise<FuturesSnapshot> {
    return {
      positions: [MOCK_POSITION],
      updatedAt: new Date().toISOString(),
    };
  }
}

// ---------- HTTP (Binance Futures, firmado) ----------

interface PositionRiskRow {
  symbol: string;
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  liquidationPrice: string;
  leverage: string;
  unRealizedProfit: string;
  notional: string;
  isolatedWallet?: string;
}

interface AccountPositionRow {
  symbol: string;
  positionAmt: string;
  positionInitialMargin: string;
  isolatedWallet?: string;
}

interface FuturesOrderRow {
  symbol: string;
  type: string;
  stopPrice?: string;
}

// Requiere una API key CON permiso de Futuros. Si la key no lo tiene, Binance
// responde -2015/-2014 y devolvemos lista vacía (sin crashear).
export class HttpFuturesAdapter implements FuturesAdapter {
  private baseUrl: string;
  private apiKey: string;
  private secretKey: string;

  constructor() {
    this.baseUrl = process.env.BINANCE_FAPI_URL ?? "https://fapi.binance.com";
    this.apiKey = process.env.BINANCE_API_KEY ?? "";
    this.secretKey = process.env.BINANCE_SECRET_KEY ?? "";
  }

  async fetchSnapshot(): Promise<FuturesSnapshot> {
    const updatedAt = new Date().toISOString();
    if (!this.apiKey || !this.secretKey) return { positions: [], updatedAt };

    try {
      // positionRisk = fuente principal; account = margen por posición; openOrders = stops.
      const [risk, account, orders] = await Promise.all([
        this.signedGet<PositionRiskRow[]>("/fapi/v2/positionRisk"),
        this.signedGet<{ positions?: AccountPositionRow[] }>("/fapi/v2/account").then((a) => a.positions ?? []).catch(() => []),
        this.signedGet<FuturesOrderRow[]>("/fapi/v1/openOrders").catch(() => []),
      ]);

      const marginBySymbol = new Map<string, number>();
      for (const p of account) {
        const m = Number.parseFloat(p.isolatedWallet ?? "0") || Number.parseFloat(p.positionInitialMargin ?? "0");
        if (m > 0) marginBySymbol.set(p.symbol, m);
      }
      const stopSymbols = new Set(
        (orders ?? [])
          .filter((o) => /STOP|TAKE_PROFIT/i.test(o.type) || Number.parseFloat(o.stopPrice ?? "0") > 0)
          .map((o) => o.symbol),
      );

      const positions: FuturesPosition[] = [];
      for (const r of risk ?? []) {
        const amt = Number.parseFloat(r.positionAmt);
        if (!amt) continue; // sin posición abierta en este símbolo

        const side = amt > 0 ? "LONG" : "SHORT";
        const qty = Math.abs(amt);
        const markPx = Number.parseFloat(r.markPrice);
        const entryPx = Number.parseFloat(r.entryPrice);
        const liqPx = Number.parseFloat(r.liquidationPrice);
        const leverage = Number.parseFloat(r.leverage) || 1;
        const notionalUsd = Math.abs(Number.parseFloat(r.notional)) || qty * markPx;
        const marginUsd = marginBySymbol.get(r.symbol) ?? (leverage > 0 ? notionalUsd / leverage : notionalUsd);
        const uPnlUsd = Number.parseFloat(r.unRealizedProfit) || 0;

        positions.push({
          symbol: r.symbol,
          side,
          leverage,
          entryPx,
          markPx,
          liqPx,
          distToLiqPct: distToLiq(side, markPx, liqPx),
          notionalUsd: Number(notionalUsd.toFixed(2)),
          marginUsd: Number(marginUsd.toFixed(2)),
          uPnlUsd: Number(uPnlUsd.toFixed(2)),
          uPnlPct: marginUsd > 0 ? Number(((uPnlUsd / marginUsd) * 100).toFixed(2)) : 0,
          hasStop: stopSymbols.has(r.symbol),
        });
      }

      // Mayor riesgo primero (más cerca de liquidación).
      positions.sort((a, b) => a.distToLiqPct - b.distToLiqPct);
      return { positions, updatedAt };
    } catch {
      // Key sin permiso de futuros, red caída, etc. -> vacío, nunca crash.
      return { positions: [], updatedAt };
    }
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
      throw new Error(`Binance Futures ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }
}
