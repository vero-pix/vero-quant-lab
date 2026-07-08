import { readFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import { homedir } from "os";
import type { Trade, SignalAplus, DailyReport } from "./types";

export interface TradingRepository {
  getTrades(): Trade[];
  getSignals(): SignalAplus[];
  getDailyReports(): DailyReport[];
  getLatestReportText(): { balance: number | null; date: string | null };
}

const DEFAULT_PATH = resolve(homedir(), "Trading");

export class JsonTradingRepository implements TradingRepository {
  private basePath: string;

  constructor(path?: string) {
    this.basePath = path ?? process.env.TRADING_DATA_PATH ?? DEFAULT_PATH;
  }

  getTrades(): Trade[] {
    return this.readJsonl<Trade>("diario_trades.jsonl");
  }

  getSignals(): SignalAplus[] {
    return this.readJsonl<SignalAplus>("senales_aplus.jsonl");
  }

  getDailyReports(): DailyReport[] {
    return this.readJsonl<DailyReport>("reporte_diario.jsonl");
  }

  getLatestReportText(): { balance: number | null; date: string | null } {
    try {
      if (!existsSync(this.basePath)) return { balance: null, date: null };
      const files = readdirSync(this.basePath)
        .filter((f) => f.startsWith("reporte_") && f.endsWith(".txt"))
        .sort()
        .reverse();
      if (files.length === 0) return { balance: null, date: null };
      const content = readFileSync(join(this.basePath, files[0]), "utf-8");
      const balanceMatch = content.match(/\$?([\d.]+)/);
      const balance = balanceMatch ? Number.parseFloat(balanceMatch[1]) : null;
      const dateMatch = files[0].match(/reporte_(\d{8})/);
      const date = dateMatch ? dateMatch[1] : null;
      return { balance, date };
    } catch {
      return { balance: null, date: null };
    }
  }

  private readJsonl<T>(filename: string): T[] {
    const filePath = join(this.basePath, filename);
    try {
      if (!existsSync(filePath)) return [];
      const raw = readFileSync(filePath, "utf-8");
      return raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          // Algunas líneas traen basura antes del JSON (ej. un "1" pegado en la
          // primera línea del diario). Recortamos hasta el primer { o [.
          const start = line.search(/[{[]/);
          if (start === -1) return null;
          try {
            // Posiciones abiertas vienen sin net/closeT: son JSON válido, no rompen.
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
}
