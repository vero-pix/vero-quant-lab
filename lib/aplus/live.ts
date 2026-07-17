// Estado A+ en VIVO de ETH — replica el comando "estado" del bot de Telegram.
// Baja klines 1m y 5m del endpoint PÚBLICO de Binance (/api/v3/klines, sin key),
// calcula los indicadores con las MISMAS fórmulas que scripts/calc_indicators.js
// y evalúa el checklist A+ (mismos umbrales que el Simulador). Solo lee.

import { readZoneLevels } from "@/lib/cockpit/zonas";

export type AplusStepState = "ok" | "fail" | "na"; // na = no evaluable (ej: sin zonas)
export type AplusVerdict = "alineado" | "esperar" | "falta";

export interface AplusStep {
  n: number;
  label: string;
  detail: string;
  value: string; // valor actual legible
  state: AplusStepState;
  gate: boolean; // true = condición de contexto (su fallo => "esperar")
}

export interface AplusLiveState {
  ok: boolean; // hubo datos
  price: number;
  indicators: {
    e9: number;
    e21: number;
    rsi: number;
    er1: number;
    er5: number;
    mom5: number;
    mom2: number;
    atr: number;
    volr: number;
    volabs: number;
    vwap: number;
  };
  steps: AplusStep[];
  verdict: AplusVerdict;
  headline: string;
  reason: string;
  updatedAt: string;
}

// Umbrales A+ (A+_construccion.md — iguales al Simulador y al detector).
const CFG = { rsiMin: 50, rsiMax: 70, er1Min: 0.3, er5Min: 0.25, momAtr: 0.6, mom2Min: 1.0, volrMin: 1.0, liqMin: 50, pullbackAtr: 0.5, trendAtr: 0.25, resMinUsd: 3 };

interface Bar { high: number; low: number; close: number; volume: number }

// ---- indicadores (idénticos a calc_indicators.js) ----
function ema(values: number[], period: number): number {
  const k = 2 / (period + 1);
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period; // SMA inicial
  for (let i = period; i < values.length; i++) prev = values[i] * k + prev * (1 - k);
  return prev;
}

function rsiWilder(closes: number[], period = 14): number {
  let gain = 0, loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d; else loss -= d;
  }
  let avgG = gain / period, avgL = loss / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgG = (avgG * (period - 1) + (d > 0 ? d : 0)) / period;
    avgL = (avgL * (period - 1) + (d < 0 ? -d : 0)) / period;
  }
  if (avgL === 0) return 100;
  const rs = avgG / avgL;
  return 100 - 100 / (1 + rs);
}

interface Indicators {
  price: number; e9: number; e21: number; rsi: number;
  mom5: number; mom2: number; er: number; volr: number; volabs: number; atr: number;
}

// price = última vela (en formación); indicadores = solo velas CERRADAS.
function computeIndicators(bars: Bar[]): Indicators | null {
  const allCloses = bars.map((b) => b.close);
  if (allCloses.length < 30) return null;
  const price = allCloses[allCloses.length - 1];
  const closed = allCloses.slice(0, -1);
  const e9 = ema(closed, 9);
  const e21 = ema(closed, 21);
  const rsi = rsiWilder(closed, 14);
  const mom5 = closed[closed.length - 1] - closed[closed.length - 6];
  const mom2 = closed[closed.length - 1] - closed[closed.length - 3];

  const N = 14;
  const seg = closed.slice(-N - 1);
  const neto = Math.abs(seg[seg.length - 1] - seg[0]);
  let ruido = 0;
  for (let k = 1; k < seg.length; k++) ruido += Math.abs(seg[k] - seg[k - 1]);
  const er = ruido > 0 ? neto / ruido : 0;

  const closedVols = bars.map((b) => b.volume).slice(0, -1);
  const promTodos = closedVols.reduce((a, v) => a + v, 0) / (closedVols.length || 1);
  const ult3 = closedVols.slice(-3);
  const promUlt3 = ult3.reduce((a, v) => a + v, 0) / (ult3.length || 1);
  const volr = promTodos > 0 ? promUlt3 / promTodos : 0;
  const volabs = promUlt3;

  const closedBars = bars.slice(0, -1);
  let atr = 0;
  if (closedBars.length > 15) {
    const tr = closedBars.map((b, i) => i === 0 ? b.high - b.low
      : Math.max(b.high - b.low, Math.abs(b.high - closedBars[i - 1].close), Math.abs(b.low - closedBars[i - 1].close)));
    let a = tr.slice(1, 15).reduce((s, v) => s + v, 0) / 14;
    for (let i = 15; i < tr.length; i++) a = (a * 13 + tr[i]) / 14;
    atr = a;
  }
  return { price, e9, e21, rsi, mom5, mom2, er, volr, volabs, atr };
}

// VWAP de sesión: anclado a las 00:00 UTC del día en curso. Baja los klines 1m
// desde ese inicio y acumula (precio típico × volumen) / volumen. Si el inicio
// es muy reciente cae en el fallback (VWAP de la ventana disponible).
function vwapFromBars(bars: Bar[]): number {
  let pv = 0, vol = 0;
  for (const b of bars) {
    const typical = (b.high + b.low + b.close) / 3;
    pv += typical * b.volume;
    vol += b.volume;
  }
  return vol > 0 ? pv / vol : 0;
}

async function fetchSessionVwap(symbol: string, fallback: Bar[]): Promise<number> {
  try {
    const base = process.env.BINANCE_API_URL ?? "https://api.binance.com";
    const startOfDayUtc = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
    const res = await fetch(
      `${base}/api/v3/klines?symbol=${symbol}&interval=1m&startTime=${startOfDayUtc}&limit=1000`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`vwap klines ${res.status}`);
    const raw = (await res.json()) as unknown[][];
    const bars: Bar[] = raw.map((k) => ({
      high: Number.parseFloat(String(k[2])),
      low: Number.parseFloat(String(k[3])),
      close: Number.parseFloat(String(k[4])),
      volume: Number.parseFloat(String(k[5])),
    }));
    // Al inicio de la sesión UTC hay pocas velas; usamos la ventana como respaldo.
    if (bars.length < 5) return vwapFromBars(fallback);
    return vwapFromBars(bars);
  } catch {
    return vwapFromBars(fallback); // respaldo: VWAP de la ventana de klines ya bajada
  }
}

// Klines del endpoint PÚBLICO de Binance (sin firma, sin key).
async function fetchBars(symbol: string, interval: string, limit = 100): Promise<Bar[]> {
  const base = process.env.BINANCE_API_URL ?? "https://api.binance.com";
  const res = await fetch(`${base}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`klines ${interval} ${res.status}`);
  const raw = (await res.json()) as unknown[][];
  return raw.map((k) => ({
    high: Number.parseFloat(String(k[2])),
    low: Number.parseFloat(String(k[3])),
    close: Number.parseFloat(String(k[4])),
    volume: Number.parseFloat(String(k[5])),
  }));
}

function fmt(n: number, d = 2): string { return n.toLocaleString("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d }); }

export async function computeAplusLive(symbol = "ETHUSDT"): Promise<AplusLiveState> {
  const updatedAt = new Date().toISOString();
  const empty: AplusLiveState = {
    ok: false, price: 0,
    indicators: { e9: 0, e21: 0, rsi: 0, er1: 0, er5: 0, mom5: 0, mom2: 0, atr: 0, volr: 0, volabs: 0, vwap: 0 },
    steps: [], verdict: "esperar", headline: "Sin datos", reason: "No pude leer las velas de Binance ahora.", updatedAt,
  };

  let ind: Indicators | null, er5: number, vwap: number;
  try {
    const [bars1, bars5] = await Promise.all([fetchBars(symbol, "1m"), fetchBars(symbol, "5m")]);
    ind = computeIndicators(bars1);
    const ind5 = computeIndicators(bars5);
    if (!ind || !ind5) return empty;
    er5 = ind5.er;
    // VWAP de sesión (00:00 UTC). La ventana 1m ya bajada sirve de respaldo.
    vwap = await fetchSessionVwap(symbol, bars1.slice(0, -1));
  } catch {
    return empty;
  }

  const { price, e9, e21, rsi, mom5, mom2, er, volr, volabs, atr } = ind;
  const pullbackOk = price - e9 <= CFG.pullbackAtr * atr;
  const mom5Ok = mom5 >= CFG.momAtr * atr;
  const mom2Ok = mom2 >= CFG.mom2Min;
  // Tendencia = EMA9 sobre EMA21 con margen sobre el ruido (detector: TREND_ATR=0.25).
  // No basta el cruce: el gap debe superar 0.25×ATR, o es tendencia plana/falsa.
  const trendOk = e9 - e21 >= CFG.trendAtr * atr;

  // Paso 9: distancia a la resistencia más cercana ARRIBA del precio. Las zonas
  // vienen de zonas.env (solo ETH). Sin zonas => "na" (no inventamos niveles).
  const zoneLevels = symbol === "ETHUSDT" ? readZoneLevels() : null;
  const resAbove = zoneLevels?.filter((z) => z > price).sort((a, b) => a - b)[0] ?? null;
  const resDist = resAbove !== null ? resAbove - price : null;

  const steps: AplusStep[] = [
    { n: 1, label: "Mercado vivo", detail: `volumen ≥ ${CFG.liqMin}`, value: fmt(volabs, 0), state: volabs >= CFG.liqMin ? "ok" : "fail", gate: true },
    { n: 2, label: "Tendencia 1m", detail: `ER ≥ ${CFG.er1Min.toFixed(2)}`, value: fmt(er), state: er >= CFG.er1Min ? "ok" : "fail", gate: true },
    { n: 3, label: "Tendencia 5m", detail: `ER ≥ ${CFG.er5Min.toFixed(2)}`, value: fmt(er5), state: er5 >= CFG.er5Min ? "ok" : "fail", gate: true },
    { n: 4, label: "Tendencia alcista", detail: `EMA9−EMA21 ≥ ${CFG.trendAtr}×ATR`, value: trendOk ? `▲ Δ${fmt(e9 - e21)}` : `▼ Δ${fmt(e9 - e21)} < ${fmt(CFG.trendAtr * atr)}`, state: trendOk ? "ok" : "fail", gate: true },
    {
      n: 5, label: "Pullback + rebote",
      detail: `pull ≤ ${CFG.pullbackAtr}×ATR · mom5 ≥ ${CFG.momAtr}×ATR · mom2 ≥ ${CFG.mom2Min.toFixed(1)}`,
      value: `pb ${fmt(price - e9)} · m5 ${fmt(mom5)} · m2 ${fmt(mom2)}`,
      state: pullbackOk && mom5Ok && mom2Ok ? "ok" : "fail", gate: false,
    },
    { n: 6, label: "RSI en banda", detail: `${CFG.rsiMin}–${CFG.rsiMax}`, value: fmt(rsi, 0), state: rsi >= CFG.rsiMin && rsi <= CFG.rsiMax ? "ok" : "fail", gate: false },
    { n: 7, label: "Volumen del rebote", detail: `volr ≥ ${CFG.volrMin.toFixed(2)}`, value: fmt(volr), state: volr >= CFG.volrMin ? "ok" : "fail", gate: false },
    { n: 8, label: "Precio > VWAP", detail: "sobre VWAP de sesión", value: price > vwap ? `▲ sobre (${fmt(vwap)})` : `▼ bajo (${fmt(vwap)})`, state: price > vwap ? "ok" : "fail", gate: false },
    {
      n: 9, label: "Lejos de resistencia",
      detail: `distancia ≥ $${CFG.resMinUsd}`,
      value: resDist !== null ? `$${fmt(resDist)}` : "requiere zonas",
      state: resDist === null ? "na" : resDist >= CFG.resMinUsd ? "ok" : "fail", gate: false,
    },
  ];

  // Veredicto: si falla una condición de CONTEXTO (gate) => "esperar". Si el
  // contexto está OK pero faltan gatillos => "falta: ...". Todo OK => "alineado".
  // Los pasos "na" (sin datos, ej. sin zonas) no cuentan como fallo.
  const gateFail = steps.find((s) => s.gate && s.state === "fail");
  let verdict: AplusVerdict, headline: string, reason: string;
  if (gateFail) {
    verdict = "esperar";
    const motivo: Record<number, string> = {
      1: "mercado muerto sin liquidez",
      2: "1m choppy (sin tendencia)",
      3: "contexto 5m débil",
      4: "no es alcista (EMA9 bajo EMA21)",
    };
    headline = "Esperar";
    reason = `Contexto aún no: ${motivo[gateFail.n] ?? gateFail.label}. No es momento de A+.`;
  } else {
    const faltan = steps.filter((s) => !s.gate && s.state === "fail").map((s) => s.label.toLowerCase());
    if (faltan.length === 0) {
      verdict = "alineado";
      headline = "Alineado";
      reason = "Todas las condiciones A+ se cumplen. Si arma el gatillo, es entrada A+.";
    } else {
      verdict = "falta";
      headline = "Falta: " + faltan.join(", ");
      reason = `Contexto OK, pero falta el gatillo: ${faltan.join(", ")}. Atenta a la pantalla.`;
    }
  }

  return {
    ok: true,
    price,
    indicators: { e9, e21, rsi, er1: er, er5, mom5, mom2, atr, volr, volabs, vwap },
    steps, verdict, headline, reason, updatedAt,
  };
}
