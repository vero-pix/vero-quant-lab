import type { BinanceTrade } from "@/lib/binance";
import type { HistorialAdapter } from "./adapter";
import type {
  ClosedTrade,
  HistorialSnapshot,
  HistorialSummary,
  SymbolHistorial,
} from "./types";

const STABLES = new Set(["USDT", "USDC", "BUSD", "FDUSD", "TUSD", "DAI"]);
const EPS = 1e-12;

// Valoriza una comisión a USD. Stablecoin = 1:1; el resto con {ASSET}USDT.
// Sin precio conocido -> 0 (neutro, no rompe el neto).
function feeToUsd(amount: number, asset: string, prices: Record<string, number>): number {
  if (amount <= 0) return 0;
  if (STABLES.has(asset)) return amount;
  const px = prices[`${asset}USDT`] ?? 0;
  return amount * px;
}

// Lote de compra pendiente en la cola FIFO.
interface Lot {
  qty: number; // cantidad restante sin casar
  px: number; // precio de compra
  time: number; // epoch ms de la compra
  feeNativePerUnit: number; // comisión de la compra por unidad, en su moneda
  feeAsset: string; // moneda de la comisión de la compra
}

// Casa compras con ventas por FIFO. Cada VENTA (fill) produce un trade cerrado,
// con entrada = promedio ponderado de las compras que consumió. Las comisiones
// (compra prorrateada + venta) se acumulan por moneda y se valorizan a USD.
export function deriveClosedTrades(
  raw: BinanceTrade[],
  prices: Record<string, number>,
): { closed: ClosedTrade[]; openQty: number } {
  const trades = [...raw].sort((a, b) => a.time - b.time);
  const lots: Lot[] = [];
  const closed: ClosedTrade[] = [];

  for (const tr of trades) {
    if (tr.isBuyer) {
      lots.push({
        qty: tr.qty,
        px: tr.price,
        time: tr.time,
        feeNativePerUnit: tr.qty > EPS ? tr.commission / tr.qty : 0,
        feeAsset: tr.commissionAsset,
      });
      continue;
    }

    // VENTA: casa contra los lotes de compra más antiguos.
    let remaining = tr.qty;
    const sellFeePerUnit = tr.qty > EPS ? tr.commission / tr.qty : 0;
    const feeNativeByAsset: Record<string, number> = {};
    let matchedQty = 0;
    let costSum = 0; // Σ px*qty de las compras casadas
    let earliestTime = tr.time;

    const addFee = (asset: string, amount: number) => {
      if (amount <= 0 || !asset) return;
      feeNativeByAsset[asset] = (feeNativeByAsset[asset] ?? 0) + amount;
    };

    while (remaining > EPS && lots.length > 0) {
      const lot = lots[0];
      const q = Math.min(remaining, lot.qty);
      matchedQty += q;
      costSum += q * lot.px;
      addFee(lot.feeAsset, q * lot.feeNativePerUnit);
      earliestTime = Math.min(earliestTime, lot.time);
      lot.qty -= q;
      remaining -= q;
      if (lot.qty <= EPS) lots.shift();
    }

    // Venta sin compra previa en la ventana de myTrades: no se puede casar.
    if (matchedQty <= EPS) continue;

    // Comisión de la venta, prorrateada a lo efectivamente casado.
    addFee(tr.commissionAsset, matchedQty * sellFeePerUnit);

    const feeAssets = Object.keys(feeNativeByAsset);
    const commissionUsd = feeAssets.reduce(
      (s, a) => s + feeToUsd(feeNativeByAsset[a], a, prices),
      0,
    );
    const entryPx = costSum / matchedQty;
    const exitPx = tr.price;
    const grossPnl = (exitPx - entryPx) * matchedQty;

    closed.push({
      symbol: tr.symbol,
      side: "LONG",
      entryTime: new Date(earliestTime).toISOString(),
      exitTime: new Date(tr.time).toISOString(),
      entryPx,
      exitPx,
      size: matchedQty,
      grossPnl,
      commissionUsd,
      commissionNative: feeAssets.length === 1 ? feeNativeByAsset[feeAssets[0]] : null,
      commissionAsset: feeAssets.length === 1 ? feeAssets[0] : "mixto",
      feePaidInBnb: feeAssets.includes("BNB"),
      netPnl: grossPnl - commissionUsd,
    });
  }

  const openQty = lots.reduce((s, l) => s + l.qty, 0);
  // Más reciente primero para la tabla.
  return { closed: closed.reverse(), openQty };
}

function summarize(closed: ClosedTrade[]): HistorialSummary {
  const wins = closed.filter((c) => c.netPnl > 0).length;
  const netAcum = closed.reduce((s, c) => s + c.netPnl, 0);
  const grossAcum = closed.reduce((s, c) => s + c.grossPnl, 0);
  const feeTotalUsd = closed.reduce((s, c) => s + c.commissionUsd, 0);
  return {
    nTrades: closed.length,
    wins,
    winRate: closed.length > 0 ? wins / closed.length : 0,
    grossAcum,
    netAcum,
    feeTotalUsd,
    feePaidInBnb: closed.some((c) => c.feePaidInBnb),
  };
}

export class HistorialService {
  constructor(private adapter: HistorialAdapter) {}

  async getSnapshot(): Promise<HistorialSnapshot> {
    const { groups, prices } = await this.adapter.fetchRaw();

    const build = (symbol: string, asset: string): SymbolHistorial => {
      const group = groups.find((g) => g.symbol === symbol);
      const { closed, openQty } = deriveClosedTrades(group?.trades ?? [], prices);
      return { symbol, asset, closed, openQty, summary: summarize(closed) };
    };

    return {
      principal: build("ETHUSDT", "ETH"),
      informativo: build("BTCUSDT", "BTC"),
      updatedAt: new Date().toISOString(),
    };
  }
}
