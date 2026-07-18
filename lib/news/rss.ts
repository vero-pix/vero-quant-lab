// Noticias cripto desde RSS PÚBLICO (sin API key, sin costo). Solo lectura,
// informativo. Fusiona varias fuentes, ordena por fecha y tolera fallos: si un
// feed no responde, se ignora sin romper el panel. El parser es defensivo
// (maneja CDATA, entidades HTML y el fallback <link href> de Atom).

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string; // ISO (vacío si no se pudo parsear)
  ts: number; // epoch ms para ordenar
}

export interface NewsState {
  ok: boolean;
  items: NewsItem[];
  updatedAt: string;
}

const FEEDS: { source: string; url: string }[] = [
  { source: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { source: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { source: "Decrypt", url: "https://decrypt.co/feed" },
];

export function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "") // limpia cualquier tag residual (ej. en títulos)
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1].trim() : null;
}

export function parseRss(xml: string, source: string, limit = 8): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  for (const b of blocks) {
    const rawTitle = tag(b, "title");
    let link = tag(b, "link");
    if (!link || /^\s*$/.test(link)) {
      const m = b.match(/<link[^>]*href="([^"]+)"/i); // Atom: <link href="..."/>
      link = m ? m[1] : null;
    }
    const pub = tag(b, "pubDate") ?? tag(b, "published") ?? tag(b, "updated") ?? tag(b, "dc:date");
    if (!rawTitle || !link) continue;
    const ts = pub ? Date.parse(pub) : NaN;
    items.push({
      title: decodeEntities(rawTitle),
      link: decodeEntities(link),
      source,
      pubDate: Number.isNaN(ts) ? "" : new Date(ts).toISOString(),
      ts: Number.isNaN(ts) ? 0 : ts,
    });
    if (items.length >= limit) break;
  }
  return items;
}

async function fetchFeed(source: string, url: string): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "VeroQuantLab/1.0 (+news reader; read-only)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      next: { revalidate: 600 }, // cache 10 min
    });
    clearTimeout(t);
    if (!res.ok) return [];
    return parseRss(await res.text(), source);
  } catch {
    return [];
  }
}

export async function fetchNews(): Promise<NewsState> {
  const updatedAt = new Date().toISOString();
  const results = await Promise.all(FEEDS.map((f) => fetchFeed(f.source, f.url)));
  const items = results
    .flat()
    .filter((i) => i.ts > 0)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 15);
  return { ok: items.length > 0, items, updatedAt };
}
