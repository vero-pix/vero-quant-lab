"use client";

import { useEffect, useState } from "react";
import { Gauge, RefreshCw, Check, X, Minus } from "lucide-react";
import { SectionHeading } from "@/components/design-system";
import type { AplusScore, Signal, Mercado } from "@/lib/aplus/score";
import type { AplusStep } from "@/lib/aplus/live";
import { cn } from "@/lib/utils";

const POLL_MS = 45_000;

// Color por puntaje (tokens de datos): verde ≥70, ámbar 40-69, rojo <40.
function band(n: number): { text: string; bar: string; stroke: string; ring: string } {
  if (n >= 70) return { text: "text-go", bar: "bg-go", stroke: "stroke-go", ring: "text-go" };
  if (n >= 40) return { text: "text-caution", bar: "bg-caution", stroke: "stroke-caution", ring: "text-caution" };
  return { text: "text-block", bar: "bg-block", stroke: "stroke-block", ring: "text-block" };
}

const signalStyle: Record<Signal, string> = {
  COMPRA: "border-go/40 bg-go/15 text-go",
  ESPERAR: "border-caution/40 bg-caution/15 text-caution",
  EVITAR: "border-block/40 bg-block/15 text-block",
};
const mercadoStyle: Record<Mercado, string> = {
  ALCISTA: "text-go",
  LATERAL: "text-muted-foreground",
  BAJISTA: "text-block",
};

function fmtHora(iso: string): string {
  try { return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return "—"; }
}

// Anillo SVG 0-100.
function Ring({ value }: { value: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const b = band(value);
  return (
    <div className="relative flex size-44 shrink-0 items-center justify-center">
      <svg viewBox="0 0 180 180" className="size-44 -rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" strokeWidth="14" className="stroke-secondary" />
        <circle
          cx="90" cy="90" r={r} fill="none" strokeWidth="14" strokeLinecap="round"
          className={cn("transition-all duration-700", b.stroke)}
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-5xl font-semibold tabular-nums leading-none", b.text)}>{value}</span>
        <span className="mt-1 text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

// Una fila del checklist A+: número, condición + umbral, valor en vivo, estado.
function StepRow({ step }: { step: AplusStep }) {
  const ok = step.state === "ok";
  const na = step.state === "na";
  const StateIcon = ok ? Check : na ? Minus : X;
  const stateCls = ok ? "text-go" : na ? "text-muted-foreground" : "text-block";
  const valueCls = ok ? "text-go" : na ? "text-muted-foreground" : "text-block";
  return (
    <div className="flex items-center gap-2.5 border-b border-border/50 py-2 last:border-0">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold tabular-nums text-muted-foreground">
        {step.n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{step.label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{step.detail}</p>
      </div>
      <span className={cn("shrink-0 text-right text-xs font-semibold tabular-nums", valueCls)}>{step.value}</span>
      <StateIcon className={cn("size-4 shrink-0", stateCls)} strokeWidth={3} />
    </div>
  );
}

const SYMBOLS = [
  { id: "ETHUSDT", label: "ETH" },
  { id: "BTCUSDT", label: "BTC" },
] as const;
type SymbolId = (typeof SYMBOLS)[number]["id"];

export function ScoreGauge() {
  const [symbol, setSymbol] = useState<SymbolId>("ETHUSDT");
  const [score, setScore] = useState<AplusScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    // Al cambiar de símbolo mostramos el estado de carga hasta la primera lectura.
    setScore(null);
    setLoading(true);
    async function load() {
      try {
        const r = await fetch(`/api/aplus-score?symbol=${symbol}`, { cache: "no-store" });
        const data = (await r.json()) as AplusScore;
        if (alive) setScore(data);
      } catch {
        // conservamos el último estado
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [symbol]);

  const activeLabel = SYMBOLS.find((s) => s.id === symbol)?.label ?? "ETH";

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeading icon={Gauge} title="Score A+" subtitle={`${activeLabel} · medidor 0-100 + checklist de 9 pasos en vivo`} />
        {/* Selector de símbolo — BTC es informativo (no ejecuta), solo lectura. */}
        <div className="inline-flex shrink-0 rounded-lg border bg-secondary/50 p-0.5" role="group" aria-label="Símbolo del Score A+">
          {SYMBOLS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSymbol(s.id)}
              aria-pressed={symbol === s.id}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                symbol === s.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !score ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">Calculando score…</div>
      ) : !score || !score.ok ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Score no disponible (sin datos de mercado ahora).
        </div>
      ) : (
        <div className="mt-4 rounded-xl border bg-card p-5">
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
            {/* Medidor + señal */}
            <div className="flex flex-col items-center gap-3">
              <Ring value={score.total} />
              <div className="flex flex-col items-center gap-1.5">
                <span className={cn("inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold", signalStyle[score.signal])}>
                  {score.signal}
                </span>
                <span className="text-xs text-muted-foreground">
                  Confianza {score.confianza} · Mercado <span className={cn("font-medium", mercadoStyle[score.mercado])}>{score.mercado}</span>
                </span>
              </div>
            </div>

            {/* Checklist A+ de 9 pasos (estilo indicador) */}
            <div>
              <div className="rounded-lg border bg-card/40 px-3 py-1">
                {score.steps.map((step) => <StepRow key={step.n} step={step} />)}
              </div>
              {/* Fila final: veredicto (COMPRA / ESPERAR / EVITAR) */}
              <div className={cn("mt-2 flex items-center justify-between rounded-lg border px-3 py-2.5", signalStyle[score.signal])}>
                <span className="text-sm font-semibold tracking-wide">→ SEÑAL</span>
                <span className="text-sm font-bold tracking-wide">{score.signal}</span>
              </div>
            </div>
          </div>

          <p className="mt-4 flex items-center gap-1.5 border-t pt-3 text-[11px] text-muted-foreground">
            <RefreshCw className="size-3" />
            Actualizado {fmtHora(score.updatedAt)} · refresca cada {POLL_MS / 1000}s · ponderado desde la lectura A+ en vivo · solo lectura.
          </p>
        </div>
      )}
    </section>
  );
}
