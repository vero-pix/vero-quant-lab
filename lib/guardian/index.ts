import { MockGuardianAdapter, HttpGuardianAdapter } from "./adapter";
import { GuardianService } from "./service";

let instance: GuardianService | null = null;

export function getGuardianService(): GuardianService {
  if (!instance) {
    const adapter = process.env.GUARDIAN_API_URL
      ? new HttpGuardianAdapter()
      : new MockGuardianAdapter();
    instance = new GuardianService(adapter);
  }
  return instance;
}

export type {
  GuardianSnapshot,
  GuardianDailyLoss,
  GuardianConsecutiveLosses,
  GuardianPositions,
  GuardianServiceStatus,
  GuardianSemaforo,
  SemaforoEstado,
} from "./types";
export type { GuardianAdapter } from "./adapter";
export { GuardianService } from "./service";
export { MockGuardianAdapter, HttpGuardianAdapter } from "./adapter";
