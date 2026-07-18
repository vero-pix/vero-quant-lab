"use client";

import { useEffect, useState } from "react";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import type { NewsState } from "@/lib/news/rss";
import { cn } from "@/lib/utils";

const POLL_MS = 600_000; // 10 min

function edad(ts: number): string {
  const min = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

const SOURCE_TONE: Record<string, string> = {
  CoinDesk: "border-signal/40 text-signal",
  Cointelegraph: "border-go/40 text-go",
  Decrypt: "border-caution/40 text-caution",
};

export function NewsPanel() {
  const [state, setState] = useState<NewsState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/news", { cache: "no-store" });
        const data = (await r.json()) as NewsState;
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

  if (loading && !state) {
    return <div className="rounded-lg border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">Cargando noticias…</div>;
  }
  if (!state || !state.ok || state.items.length === 0) {
    return (
      <div className="rounded-lg border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
        No pude leer las fuentes de noticias ahora. Reintenta en un rato.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-border overflow-hidden rounded-lg border bg-card">
        {state.items.map((n) => (
          <li key={n.link}>
            <a
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/50"
            >
              <Newspaper className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground group-hover:underline">{n.title}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className={cn("rounded border px-1.5 py-0.5 font-medium", SOURCE_TONE[n.source] ?? "border-border")}>{n.source}</span>
                  {n.ts > 0 && <span className="tabular-nums">{edad(n.ts)}</span>}
                </div>
              </div>
              <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        <RefreshCw className="size-3" />
        Fuentes RSS públicas (CoinDesk · Cointelegraph · Decrypt) · informativo, VQL no opera con esto.
      </p>
    </div>
  );
}
