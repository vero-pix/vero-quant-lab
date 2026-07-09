import { NextResponse } from "next/server";
import { computeAplusLive } from "@/lib/aplus/live";
import { computeScore } from "@/lib/aplus/score";

// Score A+ en vivo (ETH). Recalcula por request desde velas públicas de Binance
// (misma fuente que /api/aplus-live); el cliente hace polling.
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await computeAplusLive("ETHUSDT");
  return NextResponse.json(computeScore(state));
}
