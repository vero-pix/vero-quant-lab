export type BotStatus = "running" | "stopped" | "error";

export interface TelegramAlert {
  timestamp: string;
  text: string;
}

export interface TelegramError {
  timestamp: string;
  text: string;
}

export interface TelegramSnapshot {
  botStatus: BotStatus;
  lastMessage: string | null;
  lastMessageAt: string | null;
  alerts: TelegramAlert[];
  errors: TelegramError[];
  uptime: string;
}
