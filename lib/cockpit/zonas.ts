// Zonas S/R en vivo — replica el comando "zonas" del bot de Telegram.
// Lee los niveles de scripts/zonas.env y los compara con el precio ETH actual
// (ticker PÚBLICO de Binance, sin key). Solo lee.

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

export type ZonaTipo = "resistencia" | "soporte";

export interface ZonaNivel {
  precio: number;
  tipo: ZonaTipo;
  distUsd: number; // distancia con signo respecto al precio (+ arriba, - abajo)
  distPct: number;
}

export interface ZonasState {
  ok: boolean;
  price: number;
  niveles: ZonaNivel[];
  todasAUnLado: boolean; // todas arriba o todas abajo => conviene refrescar zonas
  updatedAt: string;
}

function tradingBase(): string {
  return process.env.TRADING_DATA_PATH ?? resolve(homedir(), "Trading");
}

async function fetchEthPrice(): Promise<number> {
  const base = process.env.BINANCE_API_URL ?? "https://api.binance.com";
  const res = await fetch(`${base}/api/v3/ticker/price?symbol=ETHUSDT`, { cache: "no-store" });
  if (!res.ok) throw new Error(`ticker ${res.status}`);
  const data = (await res.json()) as { price: string };
  return Number.parseFloat(data.price);
}

export async function computeZonas(): Promise<ZonasState> {
  const updatedAt = new Date().toISOString();
  const empty: ZonasState = { ok: false, price: 0, niveles: [], todasAUnLado: false, updatedAt };

  const file = resolve(tradingBase(), "tradingview-mcp", "scripts", "zonas.env");
  if (!existsSync(file)) return empty;

  let raw: string;
  try {
    raw = readFileSync(file, "utf-8");
  } catch {
    return empty;
  }
  const m = raw.match(/ZONAS="([^"]+)"/);
  if (!m) return empty;

  const niveles = m[1]
    .split(",")
    .map((x) => Number.parseFloat(x.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => b - a); // mayor a menor

  if (niveles.length === 0) return empty;

  let price: number;
  try {
    price = await fetchEthPrice();
  } catch {
    return empty;
  }

  const rows: ZonaNivel[] = niveles.map((z) => ({
    precio: z,
    tipo: z > price ? "resistencia" : "soporte",
    distUsd: Number((z - price).toFixed(2)),
    distPct: Number((((z - price) / price) * 100).toFixed(2)),
  }));

  const todasAUnLado = rows.every((r) => r.precio > price) || rows.every((r) => r.precio < price);

  return { ok: true, price, niveles: rows, todasAUnLado, updatedAt };
}
