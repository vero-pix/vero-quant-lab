"use client";

import { useEffect, useState } from "react";
import { Check, X, Radar, RefreshCw } from "lucide-react";
import { SectionHeading } from "@/components/design-system";
import type { AplusLiveState, AplusVerdict } from "@/lib/aplus/live";
import { cn } from "@/lib/utils";

const POLL_MS = 45_000; // refresco cada 45s (dentro del rango 30-60s)

const verdictStyle: Record<AplusVerdict, { border: string; bg: string; text: string; dot: string }> = {
  alineado: { border: "border-go/40", bg: "bg-go/10", text: "text-go", dot: "bg-go" },
  falta: { border: "border-caution/40", bg: "bg-caution/10", text: "text-caution", dot: "bg-caution" },
  esperar: { border: "border-border", bg: "bg-card/50", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

function fmtHora(iso: string): string {
  try { return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return "—"; }
}

export function AplusLivePanel() {
  const [state, setState] = useState<AplusLiveState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/aplus-live", { cache: "no-store" });
        const data = (await r.json()) as AplusLiveState;
        if (alive) setState(data);
      } catch {
        // dejamos el último estado; el próximo tick reintenta
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const v = state && state.ok ? verdictStyle[state.verdict] : verdictStyle.esperar;

  return (
    <section>
      <SectionHeading icon={Radar} title="Estado A+ en vivo" subtitle="ETH · lectura en tiempo real (como el comando estado)" />

      {loading && !state ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Leyendo el mercado…
        </div>
      ) : !state || !state.ok ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          {state?.reason ?? "No pude leer las velas ahora. Reintentando…"}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Veredicto */}
          <div className={cn("rounded-xl border p-5", v.border, v.bg)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={cn("inline-flex size-3 shrink-0 rounded-full", v.dot)} aria-hidden="true" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Veredicto</p>
                  <h3 className={cn("text-2xl font-semibold tracking-tight", v.text)}>{state.headline}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-foreground">${state.price.toLocaleString("es-CL", { maximumFractionDigits: 2 })}</p>
                <p className="text-[11px] text-muted-foreground">ETH/USDT</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/80">{state.reason}</p>
          </div>

          {/* Checklist */}
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h4 className="text-sm font-semibold text-foreground">Checklist A+</h4>
              <span className="text-xs text-muted-foreground">
                ER1 {state.indicators.er1.toFixed(2)} · ER5 {state.indicators.er5.toFixed(2)} · RSI {state.indicators.rsi.toFixed(0)}
              </span>
            </div>
            <ul className="mt-2 divide-y divide-border">
              {state.steps.map((step) => (
                <li key={step.n} className="flex items-center gap-3 py-2">
                  <span className="w-4 shrink-0 text-center text-xs font-semibold text-muted-foreground tabular-nums">{step.n}</span>
                  {step.state === "ok"
                    ? <Check className="size-4 shrink-0 text-go" aria-hidden="true" />
                    : <X className="size-4 shrink-0 text-block" aria-hidden="true" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {step.label}
                      {step.gate && <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">contexto</span>}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{step.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{step.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <RefreshCw className="size-3" />
            Actualizado {fmtHora(state.updatedAt)} · refresca cada {POLL_MS / 1000}s · solo lectura, no ejecuta nada.
          </p>
        </div>
      )}
    </section>
  );
}
