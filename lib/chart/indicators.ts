// Indicadores como MÓDULOS puros: cada uno es una función que produce una serie
// alineada con las velas (un valor por vela, null donde no hay historia suficiente).
// Mismas fórmulas que lib/aplus/live.ts (EMA, RSI Wilder, ATR Wilder, ER Kaufman).
// Diseño extensible: para sumar MACD/VWAP se agrega una función más acá y una
// entrada en el registro de overlays del chart — sin tocar el resto.

import type { Candle } from "./klines";

export type Series = (number | null)[];

// EMA con semilla SMA en `period` (idéntico a calc_indicators.js).
export function ema(values: number[], period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  if (values.length < period) return out;
  const k = 2 / (period + 1);
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

// RSI Wilder(14).
export function rsi(closes: number[], period = 14): Series {
  const out: Series = new Array(closes.length).fill(null);
  if (closes.length <= period) return out;
  let gain = 0, loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d; else loss -= d;
  }
  let avgG = gain / period, avgL = loss / period;
  const rsiAt = () => (avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL));
  out[period] = rsiAt();
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgG = (avgG * (period - 1) + (d > 0 ? d : 0)) / period;
    avgL = (avgL * (period - 1) + (d < 0 ? -d : 0)) / period;
    out[i] = rsiAt();
  }
  return out;
}

// ATR Wilder(14) sobre velas.
export function atr(candles: Candle[], period = 14): Series {
  const out: Series = new Array(candles.length).fill(null);
  if (candles.length <= period + 1) return out;
  const tr: number[] = candles.map((c, i) =>
    i === 0 ? c.high - c.low
      : Math.max(c.high - c.low, Math.abs(c.high - candles[i - 1].close), Math.abs(c.low - candles[i - 1].close)));
  let a = tr.slice(1, period + 1).reduce((s, v) => s + v, 0) / period;
  out[period] = a;
  for (let i = period + 1; i < tr.length; i++) {
    a = (a * (period - 1) + tr[i]) / period;
    out[i] = a;
  }
  return out;
}

// Efficiency Ratio (Kaufman) sobre N velas: neto/ruido. 1 = tendencia, 0 = choppy.
export function efficiencyRatio(closes: number[], period = 14): Series {
  const out: Series = new Array(closes.length).fill(null);
  for (let i = period; i < closes.length; i++) {
    const seg = closes.slice(i - period, i + 1);
    const neto = Math.abs(seg[seg.length - 1] - seg[0]);
    let ruido = 0;
    for (let k = 1; k < seg.length; k++) ruido += Math.abs(seg[k] - seg[k - 1]);
    out[i] = ruido > 0 ? neto / ruido : 0;
  }
  return out;
}

// Momentum de precio: close[i] - close[i-lookback].
export function momentum(closes: number[], lookback = 5): Series {
  const out: Series = new Array(closes.length).fill(null);
  for (let i = lookback; i < closes.length; i++) out[i] = closes[i] - closes[i - lookback];
  return out;
}

// Volumen relativo: media de las últimas `recent` velas / SMA(baseline) del volumen.
export function relativeVolume(volumes: number[], recent = 3, baseline = 20): Series {
  const out: Series = new Array(volumes.length).fill(null);
  for (let i = baseline - 1; i < volumes.length; i++) {
    const rec = volumes.slice(Math.max(0, i - recent + 1), i + 1);
    const base = volumes.slice(i - baseline + 1, i + 1);
    const promRec = rec.reduce((a, v) => a + v, 0) / rec.length;
    const promBase = base.reduce((a, v) => a + v, 0) / base.length;
    out[i] = promBase > 0 ? promRec / promBase : 0;
  }
  return out;
}

// Registro de EMAs a superponer (extensible: agrega o quita periodos acá).
export const EMA_OVERLAYS = [
  { period: 9, color: "#3AB7BF" },
  { period: 21, color: "#6C8EEF" },
  { period: 55, color: "#C084FC" },
  { period: 200, color: "#F4A93C" },
] as const;
