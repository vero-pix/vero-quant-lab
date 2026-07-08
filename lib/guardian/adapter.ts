import type { GuardianSnapshot } from "./types";

export interface GuardianAdapter {
  fetchSnapshot(): Promise<GuardianSnapshot>;
}

const EQUITY_DAY_OPEN = 1000;
const DAILY_LOSS_CURRENT = 42;
const LIMIT_PCT = 10;
const LIMIT_FLOOR_USD = 5;

const MOCK_LIMIT_USD = Math.max((EQUITY_DAY_OPEN * LIMIT_PCT) / 100, LIMIT_FLOOR_USD);

// Caso realista con 1 posición sin stop -> el semáforo debe quedar en BLOQUEO (rojo).
const MOCK_SNAPSHOT: Omit<GuardianSnapshot, "updatedAt"> = {
  equityDayOpen: EQUITY_DAY_OPEN,
  dailyLoss: {
    current: DAILY_LOSS_CURRENT,
    limitPct: LIMIT_PCT,
    limitFloorUsd: LIMIT_FLOOR_USD,
    limitUsd: MOCK_LIMIT_USD,
    pctUsed: DAILY_LOSS_CURRENT / MOCK_LIMIT_USD,
  },
  consecutiveLosses: {
    current: 1,
    max: 4,
  },
  positions: {
    open: 2,
    naked: 1,
    riskPct: 8.5,
    riskLimitPct: 15,
    maxPos: 2,
    averaging: false,
  },
  services: [
    { id: "freno", name: "Freno anti-sobre-operar", running: true },
    { id: "stopguard", name: "Stop protector", running: true },
    { id: "tpguard", name: "Take-profit automático", running: true },
    { id: "trailing", name: "Trailing de salida", running: true },
  ],
  // El servicio recomputa el semáforo; este valor es solo un placeholder.
  semaforo: { estado: "GO", razones: [] },
};

export class MockGuardianAdapter implements GuardianAdapter {
  async fetchSnapshot(): Promise<GuardianSnapshot> {
    return {
      ...MOCK_SNAPSHOT,
      updatedAt: new Date().toISOString(),
    };
  }
}

export class HttpGuardianAdapter implements GuardianAdapter {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.GUARDIAN_API_URL ?? "";
  }

  async fetchSnapshot(): Promise<GuardianSnapshot> {
    // Stub: aún no hay endpoint del VPS. Fallback al mock, igual que binance sin credenciales.
    return new MockGuardianAdapter().fetchSnapshot();
  }
}
