"use client";

import { useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { APP_VERSION, NOVEDADES } from "@/lib/version";
import { cn } from "@/lib/utils";

export function VersionBadge() {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Actualizar a la última versión: limpia Cache API y recarga con cache-bust.
  async function actualizar() {
    setUpdating(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      // si Cache API falla, igual forzamos la recarga
    }
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(Date.now()));
    window.location.replace(url.toString());
  }

  return (
    <>
      {/* Chip fijo abajo-izquierda (respeta safe-area en móvil) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver novedades y versión"
        className="fixed z-50 inline-flex items-center gap-1.5 rounded-full border bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
        style={{
          left: "max(1rem, env(safe-area-inset-left))",
          bottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
        v{APP_VERSION}
      </button>

      {/* Modal Novedades */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-background/70 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
                <h2 className="text-base font-semibold text-foreground">Novedades</h2>
                <span className="text-xs text-muted-foreground">v{APP_VERSION}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {NOVEDADES.map((n) => (
                <div key={n.version}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      v{n.version}
                    </span>
                    <span className="text-xs text-muted-foreground">{n.fecha}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {n.cambios.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground/85">
                        <span className="mt-1.5 inline-flex size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t px-5 py-3">
              <button
                type="button"
                onClick={actualizar}
                disabled={updating}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity",
                  updating ? "opacity-70" : "hover:opacity-90",
                )}
              >
                <RefreshCw className={cn("size-4", updating && "animate-spin")} aria-hidden="true" />
                {updating ? "Actualizando…" : "Actualizar a la última versión"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
