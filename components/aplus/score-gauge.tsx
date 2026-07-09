"use client";

import { useEffect, useState } from "react";
import { Gauge, RefreshCw } from "lucide-react";
import { SectionHeading } from "@/components/design-system";
import type { AplusScore, Signal, Mercado } from "@/lib/aplus/score";
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
        <SectionHeading icon={Gauge} title="Score A+" subtitle={`${activeLabel} · medidor 0-100 de calidad del setup en vivo`} />
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
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
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

            {/* Desglose por componente */}
            <div className="space-y-3">
              {score.components.map((comp) => {
                const b = band(comp.score);
                return (
                  <div key={comp.key}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-foreground">
                        {comp.label}
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">{Math.round(comp.peso * 100)}%</span>
                      </span>
                      <span className={cn("font-semibold tabular-nums", b.text)}>{comp.score}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                      <div className={cn("h-full rounded-full transition-all duration-500", b.bar)} style={{ width: `${comp.score}%` }} />
                    </div>
                  </div>
                );
              })}
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
