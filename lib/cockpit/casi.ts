// Casi-señales en vivo — replica el comando "casi" del bot de Telegram.
// Lee casi_senales.jsonl y resume las de las últimas 24h: cuántas, la más cerca,
// y qué condición falta más seguido. Solo lee.

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

export interface CasiRow {
  ts: number;
  fecha: string;
  symbol: string;
  faltaron: string[];
  p: number;
  rsi: number;
  er: number;
  volr: number;
}

export interface CasiState {
  ok: boolean;
  total: number;
  masCerca: {
    horaChile: string;
    symbol: string;
    falto: string; // etiquetas legibles, ej. "momentum"
  } | null;
  faltasTop: { label: string; n: number }[];
  updatedAt: string;
}

// Etiquetas legibles de qué filtro faltó (iguales a FALTA_LBL del bot).
const FALTA_LBL: Record<string, string> = {
  mom5: "momentum",
  mom2: "momentum",
  volr: "volumen",
  rsi: "RSI",
  pullback: "pullback",
  "sobre-EMA9": "sobre EMA9",
  er: "tendencia 1m",
  er5: "contexto 5m",
};

function lbl(k: string): string {
  return FALTA_LBL[k] ?? k;
}

function tradingBase(): string {
  return process.env.TRADING_DATA_PATH ?? resolve(homedir(), "Trading");
}

// Saneo robusto tipo readJsonl (lib/guardian/adapter.ts): ignora líneas no-JSON.
function readJsonl<T>(filePath: string): T[] {
  try {
    if (!existsSync(filePath)) return [];
    return readFileSync(filePath, "utf-8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const start = line.search(/[{[]/);
        if (start === -1) return null;
        try {
          return JSON.parse(line.slice(start)) as T;
        } catch {
          return null;
        }
      })
      .filter((x): x is T => x !== null);
  } catch {
    return [];
  }
}

function horaChile(tsMs: number): string {
  try {
    return new Date(tsMs).toLocaleTimeString("es-CL", {
      timeZone: "America/Santiago",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function computeCasi(now = Date.now()): CasiState {
  const updatedAt = new Date(now).toISOString();
  const file = resolve(tradingBase(), "casi_senales.jsonl");

  const desde = now - 24 * 3600 * 1000;
  const rows = readJsonl<CasiRow>(file).filter((r) => typeof r.ts === "number" && r.ts >= desde);

  if (rows.length === 0) {
    return { ok: true, total: 0, masCerca: null, faltasTop: [], updatedAt };
  }

  // Conteo de faltas por tipo (agrega mom2/mom5 bajo "momentum" vía FALTA_LBL).
  const conteo: Record<string, number> = {};
  for (const r of rows) for (const x of r.faltaron ?? []) {
    const label = lbl(x);
    conteo[label] = (conteo[label] ?? 0) + 1;
  }
  const faltasTop = Object.entries(conteo)
    .map(([label, n]) => ({ label, n }))
    .sort((a, b) => b.n - a.n);

  // La más cerca: la que solo le faltó 1 condición (más reciente); si no, la más nueva.
  const ordenadas = [...rows].sort((a, b) => b.ts - a.ts);
  const casiUna = ordenadas.find((r) => (r.faltaron ?? []).length === 1) ?? ordenadas[0];
  const falto = (casiUna.faltaron ?? []).map(lbl).join(", ") || "nada";

  return {
    ok: true,
    total: rows.length,
    masCerca: {
      horaChile: horaChile(casiUna.ts),
      symbol: String(casiUna.symbol).replace("USDT", ""),
      falto,
    },
    faltasTop,
    updatedAt,
  };
}
