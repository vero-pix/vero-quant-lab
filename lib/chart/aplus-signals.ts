// Marcadores A+ por vela — evalúa las condiciones de compra del sistema (mismos
// umbrales que lib/aplus/live.ts) sobre CADA vela y devuelve markers para el chart.
// Nota: se omite el filtro de liquidez absoluta (volabs≥50), específico de ETH 1m;
// aquí evaluamos las condiciones ESTRUCTURALES en la temporalidad mostrada.

import type { Candle } from "./klines";
import { ema, rsi, atr, efficiencyRatio, momentum, relativeVolume } from "./indicators";

export interface ChartMarker {
  time: number;
  position: "aboveBar" | "belowBar";
  color: string;
  shape: "arrowUp" | "arrowDown" | "circle";
  text: string;
}

// Umbrales A+ (A+_construccion.md — iguales al Simulador, detector y live.ts).
const CFG = { rsiMin: 50, rsiMax: 70, er1Min: 0.3, momAtr: 0.6, volrMin: 1.0, pullbackAtr: 0.5, rsiExitLo: 75, rsiExitHi: 80 };

export interface AplusMarkers {
  buys: ChartMarker[];
  exits: ChartMarker[];
}

export function computeAplusMarkers(
  candles: Candle[],
  colors: { signal: string; exit: string },
): AplusMarkers {
  const closes = candles.map((c) => c.close);
  const vols = candles.map((c) => c.volume);
  const e9 = ema(closes, 9);
  const e21 = ema(closes, 21);
  const r = rsi(closes, 14);
  const a = atr(candles, 14);
  const er = efficiencyRatio(closes, 14);
  const mom5 = momentum(closes, 5);
  const volr = relativeVolume(vols, 3, 20);

  const buys: ChartMarker[] = [];
  const exits: ChartMarker[] = [];
  let prevFired = false;
  let prevOverbought = false;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    if (e9[i] == null || e21[i] == null || r[i] == null || a[i] == null || er[i] == null || mom5[i] == null || volr[i] == null) {
      continue;
    }
    const ema9 = e9[i]!, ema21 = e21[i]!, rsiV = r[i]!, atrV = a[i]!, erV = er[i]!, momV = mom5[i]!, volrV = volr[i]!;

    const trending = erV >= CFG.er1Min && ema9 > ema21 && c.close >= ema9;
    const pullback = c.close - ema9 <= CFG.pullbackAtr * atrV;
    const momOk = momV >= CFG.momAtr * atrV;
    const rsiBand = rsiV >= CFG.rsiMin && rsiV <= CFG.rsiMax;
    const volOk = volrV >= CFG.volrMin;
    const fires = trending && pullback && momOk && rsiBand && volOk;

    // Marca solo el INICIO de una racha de velas que disparan (evita clusters).
    if (fires && !prevFired) {
      buys.push({ time: c.time, position: "belowBar", color: colors.signal, shape: "arrowUp", text: "A+" });
    }
    prevFired = fires;

    // Salida por sobrecompra: primera vela que entra a la banda 75-80 (opcional).
    const overbought = rsiV >= CFG.rsiExitLo && rsiV <= CFG.rsiExitHi;
    if (overbought && !prevOverbought) {
      exits.push({ time: c.time, position: "aboveBar", color: colors.exit, shape: "arrowDown", text: "salida" });
    }
    prevOverbought = overbought;
  }

  return { buys, exits };
}
