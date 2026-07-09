import type { GuardianAdapter } from "./adapter";
import type { GuardianSemaforo, GuardianSnapshot } from "./types";

export class GuardianService {
  constructor(private adapter: GuardianAdapter) {}

  async getSnapshot(): Promise<GuardianSnapshot> {
    const snapshot = await this.adapter.fetchSnapshot();
    return { ...snapshot, semaforo: this.computeSemaforo(snapshot) };
  }

  private computeSemaforo(snapshot: GuardianSnapshot): GuardianSemaforo {
    const { dailyLoss, consecutiveLosses, positions, holdings } = snapshot;

    const bloqueo: string[] = [];
    if (dailyLoss.current >= dailyLoss.limitUsd) {
      bloqueo.push(
        `Pérdida diaria (${dailyLoss.current}) alcanzó el límite (${dailyLoss.limitUsd}).`,
      );
    }
    if (consecutiveLosses.current >= consecutiveLosses.max) {
      bloqueo.push(
        `${consecutiveLosses.current} pérdidas consecutivas (máximo ${consecutiveLosses.max}).`,
      );
    }
    if (positions.naked > 0) {
      const nakedSymbols = holdings.filter((h) => h.naked).map((h) => h.asset);
      const detalle = nakedSymbols.length > 0 ? ` (${nakedSymbols.join(", ")})` : "";
      bloqueo.push(
        `${positions.naked} posición(es) sin stop loss${detalle}.`,
      );
    }
    if (positions.riskPct > positions.riskLimitPct) {
      bloqueo.push(
        `Riesgo abierto ${positions.riskPct}% supera el límite ${positions.riskLimitPct}%.`,
      );
    }
    if (bloqueo.length > 0) {
      return { estado: "BLOQUEO", razones: bloqueo };
    }

    const precaucion: string[] = [];
    if (positions.open >= positions.maxPos) {
      precaucion.push(
        `${positions.open} posiciones abiertas (máximo ${positions.maxPos}).`,
      );
    }
    if (positions.averaging) {
      precaucion.push("Promediando a la baja.");
    }
    if (dailyLoss.pctUsed >= 0.7) {
      precaucion.push(
        `Pérdida diaria al ${Math.round(dailyLoss.pctUsed * 100)}% del límite.`,
      );
    }
    if (precaucion.length > 0) {
      return { estado: "PRECAUCION", razones: precaucion };
    }

    return { estado: "GO", razones: ["Todo dentro de los límites."] };
  }
}
