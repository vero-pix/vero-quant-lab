"use client";

import { useEffect, useState } from "react";
import { Zap, RefreshCw } from "lucide-react";
import { SectionHeading } from "@/components/design-system";
import type { FeedState, PendingSignal, FeedSignal } from "@/lib/vps/feed";
import { cn } from "@/lib/utils";

const POLL_MS = 30_000; // señal en vivo: refresco cada 30s
const WINDOW_MIN = 5; // ventana de validez de la señal armada (como el bot)

function fmtUsd(n: number) {
  return `$${n.toLocaleString("es-CL", { maximumFractionDigits: 2 })}`;
}
function fmtHora(iso: string): string {
  try { return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return "—"; }
}
function edadMin(ts: number): number {
  return Math.max(0, Math.round((Date.now() - ts) / 60000));
}

function PendingCard({ p }: { p: PendingSignal }) {
  const edad = edadMin(p.ts);
  const vigente = edad < WINDOW_MIN;
  return (
    <div className={cn("rounded-xl border p-5", vigente ? "border-go/40 bg-go/10" : "border-caution/40 bg-caution/10")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex size-3 rounded-full", vigente ? "bg-go" : "bg-caution")} aria-hidden="true" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Señal A+ armada</p>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">{p.epic}</h3>
          </div>
        </div>
        <span className={cn("text-xs font-medium", vigente ? "text-go" : "text-caution")}>
          {vigente ? `vigente · ${WINDOW_MIN - edad} min` : `caducó · hace ${edad} min`}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border bg-card/50 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Entrada</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{fmtUsd(p.entry)}</p>
        </div>
        <div className="rounded-lg border bg-card/50 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Stop</p>
          <p className="text-sm font-semibold tabular-nums text-block">{fmtUsd(p.stop)}</p>
        </div>
        <div className="rounded-lg border bg-card/50 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Objetivo</p>
          <p className="text-sm font-semibold tabular-nums text-go">{fmtUsd(p.tp)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        VQL solo la muestra — confirma en Telegram/Binance. No ejecuta órdenes.
      </p>
    </div>
  );
}

function SignalRow({ s }: { s: FeedSignal }) {
  const res = s.resultado;
  const dot = res === "target" ? "bg-go" : res === "stop" ? "bg-block" : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card/50 px-4 py-2 text-sm">
      <span className={cn("inline-flex size-1.5 shrink-0 rounded-full", dot)} />
      <span className="w-28 shrink-0 text-[11px] text-muted-foreground tabular-nums">{s.fecha.slice(5, 16)}</span>
      <span className="font-medium text-foreground">{s.symbol.replace("USDT", "")}</span>
      <span className="text-xs text-muted-foreground tabular-nums">@ {fmtUsd(s.entry)}</span>
      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
        RSI {s.rsi.toFixed(0)} · ER {s.er.toFixed(2)}
        {typeof s.pnl === "number" && (
          <span className={cn("ml-2 font-medium", s.pnl >= 0 ? "text-go" : "text-block")}>
            {s.pnl >= 0 ? "+" : ""}{s.pnl.toFixed(2)}
          </span>
        )}
      </span>
    </div>
  );
}

export function SenalVivaPanel() {
  const [state, setState] = useState<FeedState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/feed", { cache: "no-store" });
        const data = (await r.json()) as FeedState;
        if (alive) setState(data);
      } catch {
        // conservamos el último estado
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <section>
      <SectionHeading icon={Zap} title="Señal A+ en vivo" subtitle="Feed del VPS · la señal armada y las últimas disparadas" />

      {loading && !state ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">Conectando al feed…</div>
      ) : !state || !state.ok ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Feed del VPS no disponible (sin VPS_API_URL o sin conexión).
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {state.pending.length > 0 ? (
            <div className="space-y-3">
              {state.pending.map((p) => <PendingCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="rounded-lg border bg-card/50 px-4 py-5 text-center text-sm text-muted-foreground">
              Sin señal armada ahora. El detector vigila; te llega apenas arme.
            </div>
          )}

          {state.report && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border bg-card/50 px-4 py-3 text-sm">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Reporte del día</span>
              <span className="text-foreground">{state.report.n} trades</span>
              <span className="text-foreground">WR {state.report.wr}%</span>
              <span className={cn("font-medium tabular-nums", state.report.net >= 0 ? "text-go" : "text-block")}>
                {state.report.net >= 0 ? "+" : ""}{fmtUsd(state.report.net)}
              </span>
            </div>
          )}

          {state.lastSignals.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Últimas señales</h4>
              <div className="space-y-1.5">
                {state.lastSignals.map((s) => <SignalRow key={s.ts} s={s} />)}
              </div>
            </div>
          )}

          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <RefreshCw className="size-3" />
            Actualizado {fmtHora(state.updatedAt)} · refresca cada {POLL_MS / 1000}s · solo lectura.
          </p>
        </div>
      )}
    </section>
  );
}
