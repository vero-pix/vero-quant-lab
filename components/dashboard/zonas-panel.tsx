"use client";

import { useEffect, useState } from "react";
import { Map as MapIcon, RefreshCw, TriangleAlert } from "lucide-react";
import { SectionHeading } from "@/components/design-system";
import type { ZonasState } from "@/lib/cockpit/zonas";
import { cn } from "@/lib/utils";

const POLL_MS = 45_000; // el precio se mueve, refrescamos cada 45s

function fmtUsd(n: number) {
  return `$${n.toLocaleString("es-CL", { maximumFractionDigits: 2 })}`;
}
function signed(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toLocaleString("es-CL", { maximumFractionDigits: 2 })}`;
}
function fmtHora(iso: string): string {
  try { return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return "—"; }
}

export function ZonasPanel() {
  const [state, setState] = useState<ZonasState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/zonas", { cache: "no-store" });
        const data = (await r.json()) as ZonasState;
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
      <SectionHeading icon={MapIcon} title="Zonas S/R" subtitle="ETH · niveles de soporte y resistencia vs. precio actual" />

      {loading && !state ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">Cargando zonas…</div>
      ) : !state || !state.ok ? (
        <div className="mt-4 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          No hay zonas configuradas o no pude leer el precio.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <div className="mb-1 flex items-baseline justify-between px-1">
            <span className="text-xs text-muted-foreground">Precio ETH</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">{fmtUsd(state.price)}</span>
          </div>
          {state.niveles.map((z) => (
            <div key={z.precio} className="flex items-center justify-between rounded-lg border bg-card/50 px-4 py-2 text-sm">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    z.tipo === "resistencia" ? "bg-block/15 text-block" : "bg-go/15 text-go",
                  )}
                >
                  {z.tipo === "resistencia" ? "resist." : "soporte"}
                </span>
                <span className="font-medium tabular-nums text-foreground">{fmtUsd(z.precio)}</span>
              </div>
              <span className={cn("tabular-nums text-xs", z.tipo === "resistencia" ? "text-block" : "text-go")}>
                {signed(z.distUsd)} ({signed(z.distPct)}%)
              </span>
            </div>
          ))}
          {state.todasAUnLado && (
            <div className="flex items-center gap-2 rounded-lg border border-caution/30 bg-caution/5 px-4 py-2.5 text-xs text-caution">
              <TriangleAlert className="size-3.5 shrink-0" />
              Todas las zonas quedaron a un lado del precio — quizás conviene refrescarlas.
            </div>
          )}
          <p className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
            <RefreshCw className="size-3" />
            Actualizado {fmtHora(state.updatedAt)} · refresca cada {POLL_MS / 1000}s · solo lectura.
          </p>
        </div>
      )}
    </section>
  );
}
