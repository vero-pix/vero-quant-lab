// Checklist A+ estilo indicador de TradingView — evalúa las 9 condiciones del
// sistema A+ (mismos umbrales que lib/aplus/live.ts) sobre la ÚLTIMA vela del
// símbolo/temporalidad elegidos, más el contexto de 5m. Solo lee.

import type { Candle } from "./klines";
import { ema, rsi, atr, efficiencyRatio, momentum, relativeVolume, vwap, nearestResistanceAbove } from "./indicators";

export interface ChecklistRow {
  label: string; // "Filtro A+"
  ok: boolean; // Estado ✓ / ✗
  value: string; // valor actual legible
}

export interface AplusChecklist {
  ok: boolean;
  price: number;
  rows: ChecklistRow[];
  passed: number;
  total: number;
}

const CFG = { rsiMin: 50, rsiMax: 70, er1Min: 0.3, er5Min: 0.25, momAtr: 0.6, volrMin: 1.0, pullbackAtr: 0.5, resMinPct: 0.3 };

const last = (s: (number | null)[]): number | null => {
  for (let i = s.length - 1; i >= 0; i--) if (s[i] != null) return s[i]!;
  return null;
};
const n2 = (x: number) => x.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// `main` = velas del timeframe elegido; `ctx5m` = velas de 5m (contexto).
export function computeChecklist(main: Candle[], ctx5m: Candle[]): AplusChecklist {
  if (main.length < 30) return { ok: false, price: 0, rows: [], passed: 0, total: 9 };

  const closes = main.map((c) => c.close);
  const vols = main.map((c) => c.volume);
  const price = closes[closes.length - 1];

  const e9 = last(ema(closes, 9))!;
  const e21 = last(ema(closes, 21))!;
  const rsiV = last(rsi(closes, 14))!;
  const atrV = last(atr(main, 14)) ?? 0;
  const er1 = last(efficiencyRatio(closes, 14)) ?? 0;
  const er5 = last(efficiencyRatio(ctx5m.map((c) => c.close), 14)) ?? 0;
  const mom5 = last(momentum(closes, 5)) ?? 0;
  const volr = last(relativeVolume(vols, 3, 20)) ?? 0;
  const vwapV = last(vwap(main))!;
  const res = nearestResistanceAbove(main, price, 3);
  const resPct = res != null ? ((res - price) / price) * 100 : null;
  const distEma = price - e9;

  const rows: ChecklistRow[] = [
    { label: "Tendencia 1m (ER)", ok: er1 >= CFG.er1Min, value: `ER ${n2(er1)} ≥ ${CFG.er1Min.toFixed(2)}` },
    { label: "Contexto 5m (ER)", ok: er5 >= CFG.er5Min, value: `ER5 ${n2(er5)} ≥ ${CFG.er5Min.toFixed(2)}` },
    { label: "Tendencia alcista", ok: e9 > e21, value: e9 > e21 ? "EMA9 ▲ sobre EMA21" : "EMA9 ▼ bajo EMA21" },
    { label: "Pullback al EMA9", ok: distEma <= CFG.pullbackAtr * atrV, value: `precio−EMA9 ${n2(distEma)} ≤ ${n2(CFG.pullbackAtr * atrV)}` },
    { label: "Rebote con momentum", ok: mom5 >= CFG.momAtr * atrV, value: `mom5 ${n2(mom5)} ≥ ${n2(CFG.momAtr * atrV)}` },
    { label: "RSI en banda", ok: rsiV >= CFG.rsiMin && rsiV <= CFG.rsiMax, value: `RSI ${rsiV.toFixed(0)} en ${CFG.rsiMin}–${CFG.rsiMax}` },
    { label: "Volumen del rebote", ok: volr >= CFG.volrMin, value: `VolR ${n2(volr)} ≥ ${CFG.volrMin.toFixed(1)}` },
    { label: "Sobre VWAP", ok: price >= vwapV, value: `precio ${price >= vwapV ? "≥" : "<"} VWAP ${n2(vwapV)}` },
    {
      label: "Distancia a resistencia",
      ok: resPct == null || resPct >= CFG.resMinPct,
      value: resPct == null ? "sin resistencia cerca" : `${n2(resPct)}% a ${n2(res!)}`,
    },
  ];

  return { ok: true, price, rows, passed: rows.filter((r) => r.ok).length, total: rows.length };
}
