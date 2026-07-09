import { NextResponse } from "next/server";
import { fetchFeed } from "@/lib/vps/feed";

// Proxy same-origin del feed del VPS: el cliente hace polling a /api/feed y el
// token del VPS queda SOLO en el server (nunca llega al navegador).
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await fetchFeed();
  return NextResponse.json(state);
}
