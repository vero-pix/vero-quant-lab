import { NextResponse } from "next/server";
import { computeCasi } from "@/lib/cockpit/casi";

// Casi-señales de las últimas 24h. Recalcula por request (lee casi_senales.jsonl).
export const dynamic = "force-dynamic";

export async function GET() {
  const state = computeCasi();
  return NextResponse.json(state);
}
