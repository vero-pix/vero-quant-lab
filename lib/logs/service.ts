import type { LogAdapter } from "./adapter";
import type { LogEntry } from "./types";

export class LogsService {
  constructor(private adapter: LogAdapter) {}

  async getLogs(limit = 100): Promise<LogEntry[]> {
    return this.adapter.fetchLogs(limit);
  }
}
