import { Wallet, ArrowUpDown, Clock } from "lucide-react";
import { SectionHeading } from "@/components/design-system";
import { cn } from "@/lib/utils";
import type { BinanceBalance, BinanceOrder } from "@/lib/binance";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CL", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    day: "2-digit", month: "2-digit",
  });
}

export function BinancePanel({
  balances,
  openOrders,
  prices,
  updatedAt,
}: {
  balances: BinanceBalance[];
  openOrders: BinanceOrder[];
  prices: Record<string, number>;
  updatedAt: string;
}) {
  const totalUsdt = balances.find((b) => b.asset === "USDT");
  const totalFree = totalUsdt ? totalUsdt.free + totalUsdt.locked : 0;

  return (
    <section className="space-y-5">
      <SectionHeading icon={Wallet} title="Binance" subtitle="Saldo, órdenes y precios en vivo" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Saldo USDT</p>
          <p className={cn("mt-0.5 text-xl font-semibold tabular-nums", totalFree >= 0 ? "text-foreground" : "text-destructive")}>
            ${totalFree.toFixed(2)}
          </p>
        </div>
        {prices.ETHUSDT ? (
          <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">ETH/USDT</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
              ${prices.ETHUSDT.toFixed(2)}
            </p>
          </div>
        ) : null}
        {prices.BTCUSDT ? (
          <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">BTC/USDT</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
              ${prices.BTCUSDT.toFixed(0)}
            </p>
          </div>
        ) : null}
        <div className="rounded-lg border bg-card/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Órdenes abiertas</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
            {openOrders.length}
          </p>
        </div>
      </div>

      {balances.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
            <Wallet className="size-3.5 text-primary" />
            Balance
          </h3>
          <div className="space-y-1">
            {balances.map((b) => (
              <div key={b.asset} className="flex items-center justify-between rounded-lg border bg-card/50 px-4 py-2 text-sm">
                <span className="font-medium text-foreground">{b.asset}</span>
                <span className="tabular-nums text-muted-foreground">
                  {b.free.toFixed(b.asset === "USDT" ? 2 : 4)}
                  {b.locked > 0 ? <span className="text-[11px] text-muted-foreground/60"> ({(b.locked).toFixed(b.asset === "USDT" ? 2 : 4)} locked)</span> : null}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {openOrders.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
            <ArrowUpDown className="size-3.5 text-primary" />
            Órdenes abiertas
          </h3>
          <div className="space-y-1">
            {openOrders.map((o, i) => (
              <div key={`ord-${i}`} className="flex items-center justify-between rounded-lg border bg-card/50 px-4 py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{o.symbol}</span>
                  <span className={cn("text-xs", o.side === "BUY" ? "text-primary" : "text-destructive")}>
                    {o.side}
                  </span>
                  <span className="text-xs text-muted-foreground">{o.type}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">
                  ${o.price.toFixed(o.price < 1000 ? 2 : 0)} · {o.origQty}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3" />
        Última actualización: {formatTime(updatedAt)}
      </div>
    </section>
  );
}
