import { MockTelegramAdapter, HttpTelegramAdapter } from "./adapter";
import { TelegramService } from "./service";

let instance: TelegramService | null = null;

export function getTelegramService(): TelegramService {
  if (!instance) {
    const vpsUrl = process.env.VPS_API_URL;
    const adapter = vpsUrl ? new HttpTelegramAdapter(vpsUrl) : new MockTelegramAdapter();
    instance = new TelegramService(adapter);
  }
  return instance;
}

export type { TelegramSnapshot, BotStatus, TelegramAlert, TelegramError } from "./types";
export type { TelegramAdapter } from "./adapter";
export { TelegramService } from "./service";
export { MockTelegramAdapter, HttpTelegramAdapter } from "./adapter";
