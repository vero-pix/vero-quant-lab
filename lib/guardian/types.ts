import type { FuturesPosition } from "@/lib/futures";

export interface GuardianDailyLoss {
  current: number;
  limitPct: number;
  limitFloorUsd: number;
  limitUsd: number;
  pctUsed: number;
}

export interface GuardianConsecutiveLosses {
  current: number;
  max: number;
}

export interface GuardianPositions {
  open: number;
  naked: number;
  riskPct: number;
  riskLimitPct: number;
  maxPos: number;
  averaging: boolean;
}

// Un holding cripto en vivo (spot/Earn) valorizado > $1 = posición abierta.
export interface GuardianHolding {
  asset: string; // símbolo normalizado, ej. "ETH"
  pair: string; // par de valorización, ej. "ETHUSDT"
  qty: number;
  valueUsd: number;
  hasStop: boolean; // existe orden de stop protegiendo el holding
  hasTp: boolean; // existe orden de take-profit
  protected: boolean; // hasStop
  naked: boolean; // !hasStop -> riesgo real
}

export interface GuardianServiceStatus {
  id: string;
  name: string;
  running: boolean;
}

export type SemaforoEstado = "GO" | "PRECAUCION" | "BLOQUEO";

export interface GuardianSemaforo {
  estado: SemaforoEstado;
  razones: string[];
}

export interface GuardianSnapshot {
  updatedAt: string;
  equityDayOpen: number;
  dailyLoss: GuardianDailyLoss;
  consecutiveLosses: GuardianConsecutiveLosses;
  positions: GuardianPositions;
  holdings: GuardianHolding[];
  futures: FuturesPosition[];
  services: GuardianServiceStatus[];
  semaforo: GuardianSemaforo;
}
