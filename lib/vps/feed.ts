// Feed en vivo del VPS — señal A+ armada, últimas señales y reporte del día.
// Lee GET ${VPS_API_URL}/api/feed con bearer token (server-side; el token nunca
// llega al navegador). Si no hay VPS_API_URL o falla, devuelve estado vacío.

export interface PendingSignal {
  id: string;
  ts: number;
  epic: string;
  entry: number;
  stop: number;
  tp: number;
}

export interface FeedSignal {
  ts: number;
  fecha: string;
  symbol: string;
  epic: string;
  entry: number;
  sl: number;
  tp: number;
  atr: number;
  rsi: number;
  er: number;
  volr: number;
  regimen: string;
  resultado?: string; // "target" | "stop" | undefined (aún abierta)
  pnl?: number;
}

export interface FeedReport {
  fecha: string;
  n: number;
  wr: number;
  net: number;
}

export interface FeedState {
  ok: boolean;
  pending: PendingSignal[];
  lastSignals: FeedSignal[];
  report: FeedReport | null;
  updatedAt: string;
}

export async function fetchFeed(): Promise<FeedState> {
  const updatedAt = new Date().toISOString();
  const empty: FeedState = { ok: false, pending: [], lastSignals: [], report: null, updatedAt };

  const base = process.env.VPS_API_URL;
  if (!base) return empty; // VPS no configurado todavía

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${base}/api/feed`, {
      signal: controller.signal,
      headers: process.env.VPS_API_TOKEN ? { Authorization: `Bearer ${process.env.VPS_API_TOKEN}` } : undefined,
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      ok: true,
      pending: Array.isArray(data.pending) ? data.pending : [],
      lastSignals: Array.isArray(data.lastSignals) ? data.lastSignals : [],
      report: data.report ?? null,
      updatedAt: data.updatedAt ?? updatedAt,
    };
  } catch {
    return empty;
  }
}
