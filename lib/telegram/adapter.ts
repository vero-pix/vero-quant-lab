import type { TelegramSnapshot, TelegramAlert, TelegramError } from "./types";

export interface TelegramAdapter {
  fetchSnapshot(): Promise<TelegramSnapshot>;
}

function ago(minutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
}

const MOCK_ALERTS: TelegramAlert[] = [
  { timestamp: ago(5), text: "🔔 Señal A+ ETHUSDT detectada — entrada en $1,725" },
  { timestamp: ago(18), text: "✅ Trade ETHUSDT cerrado: +$4.50 (target alcanzado)" },
  { timestamp: ago(45), text: "⚠️ BTCUSDT: stop loss ejecutado en $62,200 (-$100)" },
  { timestamp: ago(120), text: "📊 Reporte diario: 3 trades, 67% WR, neto -$92" },
  { timestamp: ago(360), text: "🌅 Buenos días, Vero. Resumen: 0 señales activas, mercado calmo." },
];

const MOCK_ERRORS: TelegramError[] = [
  { timestamp: ago(1440), text: "Rate limit excedido al enviar alerta — reenviado en 5s" },
  { timestamp: ago(2880), text: "Fallo temporal al conectar con API de Binance — reintento exitoso" },
];

export class MockTelegramAdapter implements TelegramAdapter {
  async fetchSnapshot(): Promise<TelegramSnapshot> {
    return {
      botStatus: "running",
      lastMessage: "🔔 Señal A+ ETHUSDT detectada — entrada en $1,725",
      lastMessageAt: ago(5),
      alerts: MOCK_ALERTS,
      errors: MOCK_ERRORS,
      uptime: "14d 6h 32m",
    };
  }
}

export class HttpTelegramAdapter implements TelegramAdapter {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchSnapshot(): Promise<TelegramSnapshot> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${this.baseUrl}/api/telegram`, {
        signal: controller.signal,
        next: { revalidate: 30 },
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        botStatus: data.botStatus ?? "running",
        lastMessage: data.lastMessage ?? null,
        lastMessageAt: data.lastMessageAt ?? null,
        alerts: Array.isArray(data.alerts) ? data.alerts : [],
        errors: Array.isArray(data.errors) ? data.errors : [],
        uptime: data.uptime ?? "—",
      };
    } catch {
      const mock = new MockTelegramAdapter();
      return mock.fetchSnapshot();
    }
  }
}
