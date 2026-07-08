export interface Trade {
  id: string;
  sym: string;
  dir: string;
  entryPx?: number;
  exitPx?: number;
  rpl?: number;
  net?: number;
  swap?: number;
  openT: string;
  closeT?: string;
  tag?: string;
  lesson?: string;
  sl?: number;
  tp?: number;
}

export interface SignalAplus {
  ts: number;
  fecha: string;
  symbol: string;
  entry: number;
  sl: number;
  tp: number;
  resultado: "target" | "stop";
  pnl: number;
  rsi: number;
  regimen: string;
}

export interface DailyReport {
  fecha: string;
  n: number;
  wr: number;
  net: number;
}

export interface DashboardData {
  tradingStatus: "active" | "inactive" | "error";
  tradeCount: number;
  signalCount: number;
  signalTargets: number;
  signalStops: number;
  signalNet: number;
  signalWinRate: number;
  accountBalance: number | null;
}

export interface SystemStatusItem {
  label: string;
  value: string;
}
