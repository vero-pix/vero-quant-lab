"use client";

import { useEffect, useState } from "react";
import { Telescope, RefreshCw } from "lucide-react";
import { SectionHeading } from "@/components/design-system";
import type { CasiState } from "@/lib/cockpit/casi";

const POLL_MS = 60_000; // histórico: refresco cada 60s basta

function fmtHora(iso: string): string {
  try { return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return "—"; }
}

export function CasiPanel() {
  const [state, setState] = useState<CasiState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/casi", { cache: "no-store" });
        const data = (await r.json()) as CasiState;
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
      <SectionHeading icon={Telescope} title="Casi-señales (24h)" subtitle="Cuán cerca estuvo el mercado de una A+ (radar, no avisa)" />

      {loading && !state ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">Cargando radar…</div>
      ) : !state || !state.ok ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          No pude leer el radar ahora.
        </div>
      ) : state.total === 0 ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Sin casi-señales en 24h. Mercado sin setups cercanos.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Casi-señales</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">{state.total}</p>
            </div>
            {state.masCerca && (
              <div className="col-span-1 rounded-lg border bg-card/50 px-4 py-3 text-center sm:col-span-2">
                <p className="text-xs text-muted-foreground">La más cerca</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {state.masCerca.horaChile} · {state.masCerca.symbol} — faltó <span className="text-caution">{state.masCerca.falto}</span>
                </p>
              </div>
            )}
          </div>

          {state.faltasTop.length > 0 && (
            <div className="rounded-lg border bg-card/50 px-4 py-3">
              <p className="mb-2 text-xs text-muted-foreground">Lo que falta más seguido</p>
              <div className="flex flex-wrap gap-1.5">
                {state.faltasTop.map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-xs text-foreground">
                    {f.label} <span className="tabular-nums text-muted-foreground">({f.n})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <RefreshCw className="size-3" />
            Actualizado {fmtHora(state.updatedAt)} · el gong solo suena cuando no falta NADA · solo lectura.
          </p>
        </div>
      )}
    </section>
  );
}
