import { NextRequest, NextResponse } from "next/server";
import { computeAplusLive } from "@/lib/aplus/live";
import { computeScore } from "@/lib/aplus/score";

// Score A+ en vivo. Recalcula por request desde velas públicas de Binance
// (misma fuente que /api/aplus-live); el cliente hace polling.
// ?symbol=ETHUSDT (default) | BTCUSDT — BTC es informativo, solo lectura.
export const dynamic = "force-dynamic";

const SYMBOLS = new Set(["ETHUSDT", "BTCUSDT"]);

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("symbol") ?? "ETHUSDT").toUpperCase();
  const symbol = SYMBOLS.has(raw) ? raw : "ETHUSDT";
  const state = await computeAplusLive(symbol);
  return NextResponse.json(computeScore(state));
}
