"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Minus, X } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";
import { cn } from "@/lib/utils";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

// ---- datos ----
interface Candle {
  t: number;
  close: number;
  high: number;
  low: number;
  rsi: number;
  er: number;
  er5: number;
  mom5: number;
  atr: number;
  volr: number;
  ema9: number;
  ema21: number;
  vol: number;
  pullback: boolean;
}

interface Settings {
  rsiMin: number;
  rsiMax: number;
  er1Min: number;
  er5Min: number;
  momAtr: number;
  volrMin: number;
  useEmaTrend: boolean;
  usePullback: boolean;
}

// A+ calibrado (A+_construccion.md)
const DEFAULTS: Settings = {
  rsiMin: 50,
  rsiMax: 70,
  er1Min: 0.3,
  er5Min: 0.25,
  momAtr: 0.6,
  volrMin: 1.0,
  useEmaTrend: true,
  usePullback: true,
};

const MIN_SAMPLE = 12; // menos que esto = muestra no fiable
const MAX_HOLD = 120; // velas máximas dentro del trade
const LIQ_MIN = 50; // paso 1 "mercado vivo": volumen absoluto mínimo (LIQ_MIN real)

type Tone = "up" | "caution" | "down" | "signal" | "muted";

interface SimResult {
  count: number;
  days: number;
  perDay: number;
  wr: number;
  pf: number;
  net: number;
  equity: number[];
}

// Simulación por vela: dispara si pasa los 6 umbrales; bracket 2×ATR; camina
// hacia adelante con high/low hasta tocar stop/target (máx MAX_HOLD velas, si no
// cierra en la última). Resultado en R. Sin trades solapados.
function simulate(rows: Candle[], s: Settings): SimResult {
  const n = rows.length;
  const trades: number[] = [];
  let i = 0;
  while (i < n) {
    const c = rows[i];
    const fires =
      c.atr > 0 &&
      c.vol >= LIQ_MIN && // paso 1: mercado vivo
      (!s.useEmaTrend || c.ema9 > c.ema21) && // paso 4: alcista
      (!s.usePullback || c.pullback) && // paso 5: pullback al EMA9
      c.rsi >= s.rsiMin &&
      c.rsi <= s.rsiMax &&
      c.er >= s.er1Min &&
      c.er5 >= s.er5Min &&
      c.mom5 >= s.momAtr * c.atr &&
      c.volr >= s.volrMin;
    if (!fires) {
      i++;
      continue;
    }
    const entry = c.close;
    const risk = 2 * c.atr;
    const stop = entry - risk;
    const target = entry + risk;
    const maxJ = Math.min(n - 1, i + MAX_HOLD);
    let r: number | null = null;
    let closeIdx = maxJ;
    for (let j = i + 1; j <= maxJ; j++) {
      if (rows[j].low <= stop) {
        r = -1;
        closeIdx = j;
        break;
      }
      if (rows[j].high >= target) {
        r = 1;
        closeIdx = j;
        break;
      }
    }
    if (r === null) {
      // timeout: cierra al valor de la última vela mirada
      const exit = rows[maxJ].close;
      r = risk > 0 ? (exit - entry) / risk : 0;
    }
    trades.push(r);
    i = closeIdx + 1; // sin solapamiento
  }

  const count = trades.length;
  const days = n > 1 ? (rows[n - 1].t - rows[0].t) / 86_400_000 || 1 : 1;
  const wins = trades.filter((r) => r > 0);
  const grossW = wins.reduce((a, r) => a + r, 0);
  const grossL = Math.abs(trades.filter((r) => r <= 0).reduce((a, r) => a + r, 0));
  const pf = grossL > 0 ? grossW / grossL : grossW > 0 ? Infinity : 0;
  const net = trades.reduce((a, r) => a + r, 0);
  const wr = count ? (wins.length / count) * 100 : 0;
  let acc = 0;
  const equity = trades.map((r) => (acc += r));

  return { count, days, perDay: count / days, wr, pf, net, equity };
}

// Capa de narrativa: no solo el número, el porqué.
function verdict(res: SimResult, s: Settings): { text: string; tone: Tone } {
  const { count, perDay, pf } = res;
  const r1 = (x: number) => x.toFixed(1);
  const r2 = (x: number) => (x === Infinity ? "∞" : x.toFixed(2));

  if (count === 0) {
    return { text: "Ningún disparo: los umbrales están demasiado apretados. Afloja alguno.", tone: "caution" };
  }
  if (count < MIN_SAMPLE) {
    return { text: `Muestra chica (n=${count}): no es fiable todavía, no te fíes del PF.`, tone: "caution" };
  }
  if (pf < 1) {
    return { text: `Sin edge (PF ${r2(pf)} < 1): esta config pierde plata en el histórico.`, tone: "down" };
  }
  if (perDay > 5) {
    return { text: `Demasiadas señales/día (${r1(perDay)}): esto es sobre-operar, no una señal A+.`, tone: "down" };
  }
  if (s.momAtr > DEFAULTS.momAtr && pf < 1.8) {
    return { text: `Subiste el momentum (${s.momAtr}×ATR): entras tarde al envión y el PF cae a ${r2(pf)}.`, tone: "caution" };
  }
  if (perDay < 0.3) {
    return { text: `Casi no dispara (${r1(perDay)}/día): filtros muy estrictos, te pierdes casi todo.`, tone: "caution" };
  }
  if (pf >= 1.8) {
    return { text: `Zona sana: ${r1(perDay)} señales/día, PF ${r2(pf)}. Frecuencia útil con edge real.`, tone: "up" };
  }
  return { text: `PF ${r2(pf)} con ${r1(perDay)} señales/día: hay edge pero flojo, busca afinar los filtros.`, tone: "caution" };
}

// ---- Checklist A+ (8 condiciones de A+_construccion.md) ----
type StepState = "ok" | "fail" | "off" | "nomodel";

interface Step {
  n: number | string;
  label: string;
  detail: string;
  pct: number | null;
  state: StepState;
}

function computeChecklist(rows: Candle[], s: Settings): Step[] {
  const n = rows.length;
  let liq = 0, er1 = 0, er5 = 0, ema = 0, pb = 0, mom = 0, rsi = 0, volr = 0;
  for (const c of rows) {
    if (c.vol >= LIQ_MIN) liq++;
    if (c.er >= s.er1Min) er1++;
    if (c.er5 >= s.er5Min) er5++;
    if (c.ema9 > c.ema21) ema++;
    if (c.pullback) pb++;
    if (c.mom5 >= s.momAtr * c.atr) mom++;
    if (c.rsi >= s.rsiMin && c.rsi <= s.rsiMax) rsi++;
    if (c.volr >= s.volrMin) volr++;
  }
  const pct = (x: number) => (n ? (x / n) * 100 : 0);
  // ✓ si al menos algunas velas lo cumplen; ✗ si el umbral no deja pasar ninguna.
  const st = (count: number, on = true): StepState => (!on ? "off" : count > 0 ? "ok" : "fail");

  return [
    { n: 1, label: "Mercado vivo", detail: "volumen ≥ 50", pct: pct(liq), state: st(liq) },
    { n: 2, label: "Tendencia 1m", detail: `ER ≥ ${s.er1Min.toFixed(2)}`, pct: pct(er1), state: st(er1) },
    { n: 3, label: "Tendencia 5m", detail: `ER ≥ ${s.er5Min.toFixed(2)}`, pct: pct(er5), state: st(er5) },
    { n: 4, label: "Tendencia alcista", detail: "EMA9 > EMA21", pct: pct(ema), state: st(ema, s.useEmaTrend) },
    { n: 5, label: "Pullback al EMA9", detail: "precio − EMA9 ≤ 0.5×ATR", pct: pct(pb), state: st(pb, s.usePullback) },
    { n: 6, label: "Rebote con momentum", detail: `mom5 ≥ ${s.momAtr.toFixed(1)}×ATR`, pct: pct(mom), state: st(mom) },
    { n: 7, label: "RSI en banda", detail: `${Math.round(s.rsiMin)}–${Math.round(s.rsiMax)}`, pct: pct(rsi), state: st(rsi) },
    { n: 8, label: "Volumen del rebote", detail: `volr ≥ ${s.volrMin.toFixed(1)}`, pct: pct(volr), state: st(volr) },
  ];
}

// Confirmaciones del indicador real que aún no modelamos (sin inventar su estado).
const UNMODELED: Step[] = [
  { n: "+", label: "VWAP", detail: "precio sobre su VWAP (confirmación manual)", pct: null, state: "nomodel" },
  { n: "+", label: "Distancia a resistencia", detail: "espacio hasta la próxima resistencia", pct: null, state: "nomodel" },
];

// ---- helpers de formato ----
const toneText: Record<Tone, string> = {
  up: "text-up",
  caution: "text-caution",
  down: "text-down",
  signal: "text-signal",
  muted: "text-muted-foreground",
};

function pfTone(pf: number): Tone {
  if (pf >= 1.8) return "up";
  if (pf >= 1) return "caution";
  return "down";
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
      />
    </label>
  );
}

function Metric({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", tone === "muted" ? "text-foreground" : toneText[tone])}>
        {value}
      </p>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-secondary",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-background transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}

const stepIcon: Record<StepState, { Icon: typeof Check; cls: string }> = {
  ok: { Icon: Check, cls: "text-up" },
  fail: { Icon: X, cls: "text-down" },
  off: { Icon: Minus, cls: "text-muted-foreground" },
  nomodel: { Icon: Minus, cls: "text-muted-foreground" },
};

function ChecklistRow({ step }: { step: Step }) {
  const { Icon, cls } = stepIcon[step.state];
  return (
    <li className="flex items-center gap-3 py-2">
      <span className="w-4 shrink-0 text-center text-xs font-semibold text-muted-foreground tabular-nums">
        {step.n}
      </span>
      <Icon className={cn("size-4 shrink-0", cls)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{step.label}</p>
        <p className="truncate text-xs text-muted-foreground">{step.detail}</p>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {step.state === "nomodel"
          ? "no modelado aún"
          : step.state === "off"
            ? "desactivado"
            : `${Math.round(step.pct ?? 0)}% velas`}
      </span>
    </li>
  );
}

export function AplusSimulator() {
  const [rows, setRows] = useState<Candle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [s, setS] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    let alive = true;
    fetch("/aplus-features.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Candle[]) => {
        if (alive) setRows(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (alive) setError(String(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  const res = useMemo(() => (rows && rows.length ? simulate(rows, s) : null), [rows, s]);
  const v = res ? verdict(res, s) : null;
  const checklist = useMemo(() => (rows && rows.length ? computeChecklist(rows, s) : null), [rows, s]);

  const set = (k: keyof Settings) => (value: number) => setS((prev) => ({ ...prev, [k]: value }));

  const chartData = useMemo(() => {
    if (!res) return null;
    return {
      labels: res.equity.map((_, i) => i + 1),
      datasets: [
        {
          data: res.equity,
          borderColor: "hsl(48, 97%, 60%)",
          backgroundColor: "hsla(48, 97%, 60%, 0.10)",
          borderWidth: 2,
          fill: true,
          pointRadius: 0,
          tension: 0.15,
        },
      ],
    };
  }, [res]);

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        No se pudo cargar el dataset (<span className="text-down">{error}</span>). Verifica que
        exista <code>/aplus-features.json</code>.
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Cargando velas…
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Controles — la interacción manda */}
      <div className="space-y-5 rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Umbrales A+</h2>
          <button
            onClick={() => setS(DEFAULTS)}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Reset A+
          </button>
        </div>
        <Slider label="RSI mín" value={s.rsiMin} min={0} max={100} step={1} onChange={set("rsiMin")} display={String(Math.round(s.rsiMin))} />
        <Slider label="RSI máx" value={s.rsiMax} min={0} max={100} step={1} onChange={set("rsiMax")} display={String(Math.round(s.rsiMax))} />
        <Slider label="ER 1m mín" value={s.er1Min} min={0} max={0.8} step={0.01} onChange={set("er1Min")} display={s.er1Min.toFixed(2)} />
        <Slider label="ER 5m mín" value={s.er5Min} min={0} max={0.8} step={0.01} onChange={set("er5Min")} display={s.er5Min.toFixed(2)} />
        <Slider label="Momentum (×ATR)" value={s.momAtr} min={0} max={3} step={0.1} onChange={set("momAtr")} display={`${s.momAtr.toFixed(1)}×`} />
        <Slider label="Volumen rel. mín" value={s.volrMin} min={0} max={3} step={0.1} onChange={set("volrMin")} display={s.volrMin.toFixed(1)} />
        <div className="space-y-3 border-t pt-4">
          <Toggle
            label="Tendencia alcista (EMA9 > EMA21)"
            checked={s.useEmaTrend}
            onChange={(v) => setS((prev) => ({ ...prev, useEmaTrend: v }))}
          />
          <Toggle
            label="Pullback al EMA9"
            checked={s.usePullback}
            onChange={(v) => setS((prev) => ({ ...prev, usePullback: v }))}
          />
        </div>
        <p className="pt-1 text-xs text-muted-foreground">
          {rows.length.toLocaleString("es-CL")} velas ETH 1m · {res ? res.days.toFixed(1) : "—"} días
        </p>
      </div>

      {/* Resultado */}
      <div className="space-y-4">
        {/* Veredicto narrativo */}
        {v && (
          <div
            className={cn(
              "rounded-lg border p-4 text-sm font-medium",
              v.tone === "up" && "border-up/40 bg-up/10 text-up",
              v.tone === "caution" && "border-caution/40 bg-caution/10 text-caution",
              v.tone === "down" && "border-down/40 bg-down/10 text-down",
              v.tone === "signal" && "border-signal/40 bg-signal/10 text-signal",
              v.tone === "muted" && "border-border bg-card text-muted-foreground",
            )}
          >
            {v.text}
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Señales/día" value={res ? res.perDay.toFixed(1) : "0"} tone="signal" />
          <Metric label="Win rate" value={res ? `${Math.round(res.wr)}%` : "0%"} />
          <Metric
            label="Profit factor"
            value={res ? (res.pf === Infinity ? "∞" : res.pf.toFixed(2)) : "0"}
            tone={res ? pfTone(res.pf) : "muted"}
          />
          <Metric
            label="Neto (R)"
            value={res ? `${res.net >= 0 ? "+" : ""}${res.net.toFixed(1)}` : "0"}
            tone={res ? (res.net >= 0 ? "up" : "down") : "muted"}
          />
        </div>

        {/* Curva de equity */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-foreground">Curva de equity (R acumulado)</h3>
            <span className="text-xs text-muted-foreground">{res ? res.count : 0} trades</span>
          </div>
          <div className="mt-4 h-64">
            {chartData && res && res.count > 0 ? (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: false,
                  plugins: { legend: { display: false }, tooltip: { enabled: true } },
                  scales: {
                    x: { display: false },
                    y: {
                      ticks: { color: "hsl(215 14% 62%)", font: { size: 10 } },
                      grid: { color: "hsl(220 16% 17%)" },
                    },
                  },
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin trades con estos umbrales — afloja alguno.
              </div>
            )}
          </div>
        </div>

        {/* Checklist A+ — las 8 condiciones del indicador real */}
        {checklist && (
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-foreground">Checklist A+</h3>
              <span className="text-xs text-muted-foreground">% de velas que cumple cada paso</span>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {checklist.map((step) => (
                <ChecklistRow key={step.n} step={step} />
              ))}
              {UNMODELED.map((step, i) => (
                <ChecklistRow key={`nm-${i}`} step={step} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
