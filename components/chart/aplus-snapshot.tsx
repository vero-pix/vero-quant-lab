"use client";

import { useState } from "react";
import { Check, X, Minus, Share2, Printer } from "lucide-react";
import type { AplusLiveState } from "@/lib/aplus/live";
import type { ZonasState } from "@/lib/cockpit/zonas";
import { cn } from "@/lib/utils";

// Botón "Compartir" + tarjeta imprimible con el estado A+ de ETH 1m (#29).
// Reusa el estado que el chart ya trae (misma fuente que el cockpit y el bot);
// no vuelve a pedir datos. "Descargar PDF" usa window.print() sobre una tarjeta
// aislada por CSS de impresión — sin dependencias, sin canvas, robusto.
function fmt(n: number, d = 2) {
  return n.toLocaleString("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtHora(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-CL", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

export function AplusSnapshot({ state, zonas }: { state: AplusLiveState | null; zonas: ZonasState | null }) {
  const [open, setOpen] = useState(false);
  const ready = state?.ok;

  const verdictTone =
    state?.verdict === "alineado" ? "text-go"
      : state?.verdict === "esperar" ? "text-caution"
        : "text-muted-foreground";
  const passed = state?.steps.filter((s) => s.state === "ok").length ?? 0;
  const evaluable = state?.steps.filter((s) => s.state !== "na").length ?? 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={!ready}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
          ready ? "text-foreground hover:bg-secondary" : "cursor-not-allowed text-muted-foreground opacity-60",
        )}
        title="Compartir el estado A+ como PDF"
      >
        <Share2 className="size-4" /> Compartir
      </button>

      {open && state && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="Cerrar"
            className="snapshot-backdrop absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col">
            {/* Tarjeta imprimible */}
            <div id="aplus-snapshot-card" className="overflow-y-auto rounded-xl border bg-card p-5 shadow-xl">
              <div className="flex items-baseline justify-between border-b pb-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Estado A+ · ETH · 1m</h3>
                  <p className="text-[11px] text-muted-foreground">{fmtHora(state.updatedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums text-foreground">${fmt(state.price)}</p>
                  <p className="text-[11px] text-muted-foreground">precio Binance</p>
                </div>
              </div>

              <div className={cn("flex items-center justify-between py-3 text-sm font-semibold", verdictTone)}>
                <span>{state.headline}</span>
                <span className="tabular-nums">{passed} / {evaluable}</span>
              </div>

              <ul className="divide-y divide-border border-y">
                {state.steps.map((s) => (
                  <li key={s.n} className="flex items-center gap-2 py-1.5">
                    {s.state === "ok" ? <Check className="size-4 shrink-0 text-go" />
                      : s.state === "na" ? <Minus className="size-4 shrink-0 text-muted-foreground" />
                        : <X className="size-4 shrink-0 text-block" />}
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{s.n}. {s.label}</span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{s.value}</span>
                  </li>
                ))}
              </ul>

              {zonas?.ok && zonas.niveles.length > 0 && (
                <div className="pt-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Zonas S/R</p>
                  <div className="flex flex-wrap gap-1.5">
                    {zonas.niveles.map((z) => (
                      <span
                        key={z.precio}
                        className={cn("rounded border px-1.5 py-0.5 text-[11px] tabular-nums",
                          z.tipo === "resistencia" ? "border-block/40 text-block" : "border-go/40 text-go")}
                      >
                        {z.tipo === "resistencia" ? "R" : "S"} {fmt(z.precio)} ({z.distUsd >= 0 ? "+" : "−"}{Math.abs(Math.round(z.distUsd))})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-4 border-t pt-2 text-[10px] text-muted-foreground">
                Vero Quant Lab · lectura del detector (mismos umbrales que el sistema) · no ejecuta órdenes.
              </p>
            </div>

            {/* Acciones (no se imprimen) */}
            <div className="snapshot-actions mt-3 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
              >
                <Printer className="size-4" /> Descargar PDF
              </button>
            </div>
          </div>

          {/* Aísla la tarjeta al imprimir: oculta todo lo demás. */}
          <style media="print">{`
            body * { visibility: hidden !important; }
            #aplus-snapshot-card, #aplus-snapshot-card * { visibility: visible !important; }
            #aplus-snapshot-card { position: fixed; inset: 0; margin: 0; max-height: none; border: none; box-shadow: none; }
            .snapshot-backdrop, .snapshot-actions { display: none !important; }
          `}</style>
        </div>
      )}
    </>
  );
}
