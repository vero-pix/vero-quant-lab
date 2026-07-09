import { NextResponse } from "next/server";
import { computeAplusLive } from "@/lib/aplus/live";

// Estado A+ en vivo (ETH). Se recalcula en cada request (klines públicos de
// Binance). El cliente hace polling cada ~45s; no cacheamos aquí.
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await computeAplusLive("ETHUSDT");
  return NextResponse.json(state);
}
