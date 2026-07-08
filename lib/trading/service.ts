import type { TradingRepository } from "./repository";
import type { DashboardData, SystemStatusItem, Trade, SignalAplus } from "./types";

function isToday(dateStr: string): boolean {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getUTCDate() === today.getUTCDate() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCFullYear() === today.getUTCFullYear()
  );
}

export class TradingService {
  constructor(private repo: TradingRepository) {}

  getDashboard(): DashboardData {
    const trades = this.repo.getTrades();
    const signals = this.repo.getSignals();
    const account = this.repo.getLatestReportText();

    const signalTargets = signals.filter((s) => s.resultado === "target").length;
    const signalStops = signals.filter((s) => s.resultado === "stop").length;
    const signalNet = Math.round(signals.reduce((sum, s) => sum + s.pnl, 0) * 100) / 100;
    const signalWR =
      signals.length > 0
        ? Math.round((signalTargets / signals.length) * 100)
        : 0;

    const isActive = signals.length > 0 || trades.length > 10;

    return {
      tradingStatus: isActive ? "active" : "inactive",
      tradeCount: trades.length,
      signalCount: signals.length,
      signalTargets,
      signalStops,
      signalNet,
      signalWinRate: signalWR,
      accountBalance: account.balance,
    };
  }

  getSignals(): SignalAplus[] {
    return this.repo.getSignals();
  }

  getTrades(): Trade[] {
    return this.repo.getTrades();
  }

  getSystemStatus(): SystemStatusItem[] {
    const dashboard = this.getDashboard();
    const trades = this.repo.getTrades();
    const reports = this.repo.getDailyReports();
    const account = this.repo.getLatestReportText();

    const todayTrades = trades.filter((t) => isToday(t.openT));
    const todayNet = todayTrades.reduce((sum, t) => sum + (t.net ?? 0), 0);

    const items: SystemStatusItem[] = [
      { label: "Research", value: "Ready" },
      { label: "Academy", value: "Ready" },
      { label: "Knowledge", value: "Ready" },
      {
        label: "Trading Engine",
        value: dashboard.tradingStatus === "active" ? "Active" : "Pending",
      },
    ];

    if (dashboard.tradingStatus === "active") {
      items.push(
        { label: "Señales A+", value: String(dashboard.signalCount) },
        { label: "Win rate", value: `${dashboard.signalWinRate}%` },
        { label: "P&L señales", value: `$${dashboard.signalNet}` },
      );

      if (todayTrades.length > 0) {
        items.push({
          label: "Hoy",
          value: `${todayTrades.length} trades, $${Math.round(todayNet * 100) / 100}`,
        });
      }

      if (account.balance !== null) {
        items.push({
          label: "Cuenta",
          value: `$${account.balance}`,
        });
      }

      if (reports.length > 0) {
        const last = reports[reports.length - 1];
        items.push({
          label: "Último reporte",
          value: `${last.n} trades, ${last.wr}% WR, $${last.net}`,
        });
      }
    }

    items.push({ label: "AI Copilot", value: "Planned" });
    return items;
  }
}
