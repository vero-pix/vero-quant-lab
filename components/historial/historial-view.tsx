import { Coins, Info, ReceiptText, Target, TrendingUp, Wallet } from "lucide-react";
import { SectionHeading } from "@/components/design-system";
import type { ClosedTrade, HistorialSnapshot, SymbolHistorial } from "@/lib/historial";
import { cn } from "@/lib/utils";

function fmtUsd(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("es-CL", { maximumFractionDigits: 2 })}`;
}

function fmtSignedUsd(n: number) {
  return `${n >= 0 ? "+" : ""}${fmtUsd(n)}`;
}

function fmtPx(n: number) {
  return `$${n.toLocaleString("es-CL", { maximumFractionDigits: 2 })}`;
}

function fmtQty(n: number) {
  return n.toLocaleString("es-CL", { maximumFractionDigits: 6 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function pnlClass(n: number) {
  return n > 0 ? "text-go" : n < 0 ? "text-block" : "text-muted-foreground";
}

// Comisión: "0.0018 BNB" (con equivalente USD) si es una sola moneda; si es mixta,
// el total en USD. Badge cuando se pagó en BNB (descuento de comisiones).
function CommissionCell({ trade }: { trade: ClosedTrade }) {
  const native =
    trade.commissionNative !== null && trade.commissionAsset !== "mixto"
      ? `${trade.commissionNative.toLocaleString("es-CL", { maximumFractionDigits: 6 })} ${trade.commissionAsset}`
      : `${fmtUsd(trade.commissionUsd)} · mixto`;
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="tabular-nums text-foreground">{native}</span>
      <span className="flex items-center gap-1.5">
        {trade.commissionAsset !== "mixto" && (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            ≈ {fmtUsd(trade.commissionUsd)}
          </span>
        )}
        {trade.feePaidInBnb && (
          <span className="inline-flex items-center rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
            BNB
          </span>
        )}
      </span>
    </div>
  );
}

function TradesTable({ trades }: { trades: ClosedTrade[] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Fecha</th>
            <th className="px-4 py-2.5 text-right font-medium">Entrada</th>
            <th className="px-4 py-2.5 text-right font-medium">Salida</th>
            <th className="px-4 py-2.5 text-right font-medium">Size</th>
            <th className="px-4 py-2.5 text-right font-medium">Comisión</th>
            <th className="px-4 py-2.5 text-right font-medium">Neto realizado</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((tr, i) => (
            <tr key={`${tr.symbol}-${tr.exitTime}-${i}`} className="border-b last:border-0">
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-foreground">{fmtDate(tr.exitTime)}</span>
                  <span className="text-[11px] text-muted-foreground">
                    desde {fmtDate(tr.entryTime)}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">{fmtPx(tr.entryPx)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-foreground">{fmtPx(tr.exitPx)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{fmtQty(tr.size)}</td>
              <td className="px-4 py-3 text-right">
                <CommissionCell trade={tr} />
              </td>
              <td className={cn("px-4 py-3 text-right font-semibold tabular-nums", pnlClass(tr.netPnl))}>
                {fmtSignedUsd(tr.netPnl)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCards({ s }: { s: SymbolHistorial["summary"] }) {
  const cards = [
    { icon: ReceiptText, label: "Trades cerrados", value: String(s.nTrades) },
    {
      icon: Target,
      label: "Win rate real",
      value: `${Math.round(s.winRate * 100)}%`,
      detail: `${s.wins}/${s.nTrades} ganadores`,
    },
    {
      icon: TrendingUp,
      label: "Neto acumulado",
      value: fmtSignedUsd(s.netAcum),
      valueClass: pnlClass(s.netAcum),
    },
    {
      icon: Wallet,
      label: "Comisión total",
      value: fmtUsd(s.feeTotalUsd),
      detail: s.feePaidInBnb ? "incluye BNB con descuento" : undefined,
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border bg-card p-4">
          <SectionHeading icon={c.icon} title={c.label} />
          <p className={cn("mt-3 text-2xl font-semibold tabular-nums text-foreground", c.valueClass)}>
            {c.value}
          </p>
          {c.detail && <p className="mt-1 text-xs text-muted-foreground">{c.detail}</p>}
        </div>
      ))}
    </div>
  );
}

function SymbolBlock({ data, informativo = false }: { data: SymbolHistorial; informativo?: boolean }) {
  return (
    <section className={cn(informativo && "opacity-95")}>
      <SectionHeading
        icon={informativo ? Info : Coins}
        title={informativo ? `${data.asset} · informativo` : `${data.asset} · lo que se opera`}
        subtitle={
          informativo
            ? "Ejecuciones reales de BTC — no se opera activamente, va como referencia."
            : "Cada fila es un trade cerrado (compra casada con venta por FIFO)."
        }
      />

      {!informativo && <div className="mt-4"><SummaryCards s={data.summary} /></div>}

      {data.closed.length === 0 ? (
        <div className="mt-3 rounded-lg border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Sin trades cerrados en la ventana de ejecuciones.
        </div>
      ) : (
        <TradesTable trades={data.closed} />
      )}

      {data.openQty > 0 && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Posición abierta (aún sin vender): {fmtQty(data.openQty)} {data.asset} · no cuenta en el neto realizado.
        </p>
      )}

      {informativo && (
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Mini label="Trades" value={String(data.summary.nTrades)} />
          <Mini label="WR real" value={`${Math.round(data.summary.winRate * 100)}%`} />
          <Mini label="Neto acum." value={fmtSignedUsd(data.summary.netAcum)} valueClass={pnlClass(data.summary.netAcum)} />
          <Mini label="Comisión" value={fmtUsd(data.summary.feeTotalUsd)} />
        </div>
      )}
    </section>
  );
}

function Mini({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-lg border bg-card/50 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold tabular-nums text-foreground", valueClass)}>{value}</p>
    </div>
  );
}

export function HistorialView({ snapshot }: { snapshot: HistorialSnapshot }) {
  return (
    <div className="space-y-10">
      <SymbolBlock data={snapshot.principal} />
      <SymbolBlock data={snapshot.informativo} informativo />

      <p className="text-[11px] text-muted-foreground">
        Actualizado: {new Date(snapshot.updatedAt).toLocaleString("es-CL")} · Ventana: últimos 14 días
        · Datos reales de Binance (myTrades, key read-only). El veredicto y el PnL salen de ejecuciones
        reales, no del senales_aplus simulado — misma fuente y ventana que el semáforo de Telegram.
        VQL es visor: no ejecuta órdenes.
      </p>
    </div>
  );
}
