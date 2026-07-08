export type LogLevel = "info" | "success" | "warning" | "error" | "critical";

export interface LogEntry {
  id: string;
  ts: string;
  level: LogLevel;
  source: "engine" | "binance" | "telegram" | "system" | "vps";
  message: string;
  detail?: string;
  metadata?: Record<string, string | number>;
}
