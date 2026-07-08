import type { TelegramAdapter } from "./adapter";
import type { TelegramSnapshot, BotStatus, TelegramAlert, TelegramError } from "./types";

export class TelegramService {
  constructor(private adapter: TelegramAdapter) {}

  async getSnapshot(): Promise<TelegramSnapshot> {
    return this.adapter.fetchSnapshot();
  }

  async getBotStatus(): Promise<BotStatus> {
    const snapshot = await this.adapter.fetchSnapshot();
    return snapshot.botStatus;
  }

  async getAlerts(): Promise<TelegramAlert[]> {
    const snapshot = await this.adapter.fetchSnapshot();
    return snapshot.alerts;
  }

  async getErrors(): Promise<TelegramError[]> {
    const snapshot = await this.adapter.fetchSnapshot();
    return snapshot.errors;
  }
}
