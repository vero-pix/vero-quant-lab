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
  services: GuardianServiceStatus[];
  semaforo: GuardianSemaforo;
}
