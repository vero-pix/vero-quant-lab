"use client";

import { useEffect, useMemo, useState } from "react";
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
}

interface Settings {
  rsiMin: number;
  rsiMax: number;
  er1Min: number;
  er5Min: number;
  momAtr: number;
  volrMin: number;
}

// A+ calibrado
const DEFAULTS: Settings = {
  rsiMin: 50,
  rsiMax: 70,
  er1Min: 0.3,
  er5Min: 0.25,
  momAtr: 0.6,
  volrMin: 1.0,
};

const MIN_SAMPLE = 12; // menos que esto = muestra no fiable
const MAX_HOLD = 120; // velas máximas dentro del trade

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
      </div>
    </div>
  );
}
