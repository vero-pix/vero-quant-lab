import { CompositeLogAdapter } from "./adapter";
import { LogsService } from "./service";

let instance: LogsService | null = null;

export function getLogsService(): LogsService {
  if (!instance) {
    const adapter = process.env.TRADING_DATA_DIR
      ? new CompositeLogAdapter(process.env.TRADING_DATA_DIR)
      : new CompositeLogAdapter();
    instance = new LogsService(adapter);
  }
  return instance;
}

export type { LogEntry, LogLevel } from "./types";
export type { LogAdapter } from "./adapter";
export { LogsService } from "./service";
export { CompositeLogAdapter } from "./adapter";
