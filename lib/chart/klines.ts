// Velas públicas de Binance (/api/v3/klines) — sin key, funciona en Vercel.

export interface Candle {
  time: number; // segundos UTC (openTime/1000) — formato de lightweight-charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const SYMBOLS = ["ETHUSDT", "BTCUSDT", "SOLUSDT"] as const;
export type Symbol = (typeof SYMBOLS)[number];

export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

// Etiqueta legible de la temporalidad para la UI.
export const TF_LABEL: Record<Timeframe, string> = {
  "1m": "1m", "5m": "5m", "15m": "15m", "1h": "1h", "4h": "4h", "1d": "1D",
};

export async function fetchKlines(symbol: string, interval: string, limit = 500): Promise<Candle[]> {
  const base = process.env.NEXT_PUBLIC_BINANCE_API_URL ?? "https://api.binance.com";
  const res = await fetch(`${base}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`klines ${res.status}`);
  const raw = (await res.json()) as unknown[][];
  return raw.map((k) => ({
    time: Math.floor(Number(k[0]) / 1000),
    open: Number.parseFloat(String(k[1])),
    high: Number.parseFloat(String(k[2])),
    low: Number.parseFloat(String(k[3])),
    close: Number.parseFloat(String(k[4])),
    volume: Number.parseFloat(String(k[5])),
  }));
}
