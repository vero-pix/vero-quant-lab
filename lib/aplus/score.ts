// Score A+ — medidor 0-100 del cockpit. Deriva de la lectura A+ en vivo
// (lib/aplus/live.ts): sub-scores por componente, un score total ponderado, y
// las lecturas cualitativas (señal, confianza, estado de mercado). Solo calcula.

import type { AplusLiveState, AplusVerdict, AplusStep } from "./live";

export type Signal = "COMPRA" | "ESPERAR" | "EVITAR";
export type Confianza = "alta" | "media" | "baja";
export type Mercado = "ALCISTA" | "LATERAL" | "BAJISTA";

export interface ScoreComponent {
  key: "tendencia" | "momentum" | "volumen" | "estructura" | "riesgo";
  label: string;
  score: number; // 0-100
  peso: number; // ponderación en el total
}

export interface AplusScore {
  ok: boolean;
  total: number; // 0-100
  signal: Signal;
  confianza: Confianza;
  mercado: Mercado;
  verdict: AplusVerdict;
  price: number;
  components: ScoreComponent[];
  steps: AplusStep[]; // checklist A+ de 9 pasos (desde la lectura en vivo)
  updatedAt: string;
}

// Umbrales A+ (iguales al Simulador / detector / live.ts).
const CFG = { rsiMin: 50, rsiMax: 70, er1Min: 0.3, er5Min: 0.25, momAtr: 0.6, volrMin: 1.0, pullbackAtr: 0.5 };

const clamp = (x: number) => Math.max(0, Math.min(100, x));
// Mapea x del rango [a,b] a [0,100] (linealmente, clamp).
const lin = (x: number, a: number, b: number) => clamp(((x - a) / (b - a)) * 100);

// Ponderaciones del total (suman 1).
const PESOS: Record<ScoreComponent["key"], number> = {
  tendencia: 0.3, momentum: 0.2, volumen: 0.15, estructura: 0.2, riesgo: 0.15,
};

export function computeScore(state: AplusLiveState): AplusScore {
  const updatedAt = state.updatedAt;
  if (!state.ok) {
    return {
      ok: false, total: 0, signal: "ESPERAR", confianza: "baja", mercado: "LATERAL",
      verdict: state.verdict, price: state.price,
      components: [], steps: state.steps, updatedAt,
    };
  }

  const { e9, e21, rsi, er1, er5, mom5, atr, volr } = state.indicators;
  const alcista = e9 > e21;
  const distAtr = atr > 0 ? (state.price - e9) / atr : 0; // distancia precio↔EMA9 en ATR

  // --- Sub-scores (0-100) ---
  // Tendencia: fuerza direccional 1m y 5m (ER) + alineación de EMAs.
  const erScore1 = lin(er1, 0.15, 0.5);
  const erScore5 = lin(er5, 0.1, 0.45);
  const emaAlign = alcista ? clamp(50 + lin((e9 - e21) / (atr || 1), 0, 2) / 2) : lin((e9 - e21) / (atr || 1), -1, 0) * 0.4;
  const tendencia = clamp(0.45 * erScore1 + 0.3 * erScore5 + 0.25 * emaAlign);

  // Momentum: fuerza del rebote respecto al ATR (umbral 0.6×ATR).
  const momRatio = atr > 0 ? Math.max(0, mom5) / atr : 0;
  const momentum = clamp((momRatio / (CFG.momAtr * 2)) * 100);

  // Volumen: volumen relativo del rebote (umbral 1.0).
  const volumen = lin(volr, 0.5, 1.5);

  // Estructura: pullback sano (precio cerca del EMA9, sobre él) + EMAs apiladas.
  let pullbackScore: number;
  if (distAtr < 0) pullbackScore = clamp(60 + distAtr * 60); // bajo el EMA9: penaliza
  else if (distAtr <= CFG.pullbackAtr) pullbackScore = 100; // dentro del pullback sano
  else pullbackScore = clamp(100 - (distAtr - CFG.pullbackAtr) * 120); // estirado: cae
  const estructura = clamp(0.6 * pullbackScore + 0.4 * (alcista ? 100 : 0));

  // Riesgo: cercanía a sobrecompra. 100 = lejos (seguro), 0 = en zona de sobrecompra.
  const riesgo = clamp(((75 - rsi) / (75 - 60)) * 100);

  const parts: ScoreComponent[] = [
    { key: "tendencia", label: "Tendencia", score: Math.round(tendencia), peso: PESOS.tendencia },
    { key: "momentum", label: "Momentum", score: Math.round(momentum), peso: PESOS.momentum },
    { key: "volumen", label: "Volumen", score: Math.round(volumen), peso: PESOS.volumen },
    { key: "estructura", label: "Estructura", score: Math.round(estructura), peso: PESOS.estructura },
    { key: "riesgo", label: "Riesgo", score: Math.round(riesgo), peso: PESOS.riesgo },
  ];
  const total = Math.round(parts.reduce((s, p) => s + p.score * p.peso, 0));

  // --- Estado de mercado (EMAs + ER) ---
  const trending = er1 >= CFG.er1Min;
  const mercado: Mercado = !trending ? "LATERAL" : alcista ? "ALCISTA" : "BAJISTA";

  // --- Señal (checklist + score + mercado) ---
  let signal: Signal;
  if (mercado === "BAJISTA" || total < 35) signal = "EVITAR";
  else if (state.verdict === "alineado" || (total >= 75 && mercado === "ALCISTA")) signal = "COMPRA";
  else signal = "ESPERAR";

  // --- Confianza ---
  const confianza: Confianza = total >= 75 ? "alta" : total >= 50 ? "media" : "baja";

  return { ok: true, total, signal, confianza, mercado, verdict: state.verdict, price: state.price, components: parts, steps: state.steps, updatedAt };
}
