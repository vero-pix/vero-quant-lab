import { NextResponse } from "next/server";
import { computeZonas } from "@/lib/cockpit/zonas";

// Zonas S/R en vivo (ETH). Recalcula por request (lee zonas.env + precio público).
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await computeZonas();
  return NextResponse.json(state);
}
