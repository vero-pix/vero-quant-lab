import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/news/rss";

// Noticias cripto desde RSS público. Cache 10 min (revalidate); el cliente hace
// polling suave. Informativo, solo lectura.
export const revalidate = 600;

export async function GET() {
  const state = await fetchNews();
  return NextResponse.json(state);
}
