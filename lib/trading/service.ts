import type { TradingRepository } from "./repository";
import type {
  DashboardData,
  SystemStatusItem,
  Trade,
  SignalAplus,
  EngineStatus,
  EngineComponent,
  DailyStats,
  ActivityEntry,
  AlertEntry,
} from "./types";

function isToday(dateStr: string): boolean {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getUTCDate() === today.getUTCDate() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCFullYear() === today.getUTCFullYear()
  );
}

function minutesAgo(dateStr: string | number): number {
  const date = new Date(dateStr);
  return (Date.now() - date.getTime()) / 60000;
}

function formatTimestamp(dateStr: string | number): string {
  const d = new Date(dateStr);
  return d.toLocaleString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

export class TradingService {
  constructor(private repo: TradingRepository) {}

  getDashboard(): DashboardData {
    const trades = this.repo.getTrades();
    const signals = this.repo.getSignals();
    const account = this.repo.getLatestReportText();

    const signalTargets = signals.filter((s) => s.resultado === "target").length;
    const signalStops = signals.filter((s) => s.resultado === "stop").length;
    const signalNet =
      Math.round(signals.reduce((sum, s) => sum + s.pnl, 0) * 100) / 100;
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

  getRecentSignals(limit = 5): SignalAplus[] {
    return this.repo
      .getSignals()
      .sort((a, b) => b.ts - a.ts)
      .slice(0, limit);
  }

  getRecentTrades(limit = 5): Trade[] {
    return this.repo
      .getTrades()
      .sort(
        (a, b) =>
          new Date(b.openT).getTime() - new Date(a.openT).getTime(),
      )
      .slice(0, limit);
  }

  getDailyStats(): DailyStats {
    const trades = this.repo
      .getTrades()
      .filter((t) => t.net !== undefined && isToday(t.openT));
    const signals = this.repo
      .getSignals()
      .filter((s) => isToday(s.fecha));

    const wins = trades.filter((t) => (t.net ?? 0) > 0);
    const totalNet = trades.reduce((sum, t) => sum + (t.net ?? 0), 0);
    const winRate =
      trades.length > 0
        ? Math.round((wins.length / trades.length) * 100)
        : 0;

    return {
      tradeCount: trades.length,
      net: Math.round(totalNet * 100) / 100,
      winRate,
      signalCount: signals.length,
    };
  }

  getEngineStatus(): EngineStatus {
    const signals = this.repo.getSignals();
    const trades = this.repo.getTrades();
    const reports = this.repo.getDailyReports();

    const lastSignal = signals.length > 0 ? signals[signals.length - 1] : null;
    const lastTrade = trades.length > 0 ? trades[trades.length - 1] : null;

    const lastSignalMin = lastSignal ? minutesAgo(lastSignal.fecha) : Infinity;
    const lastTradeMin = lastTrade ? minutesAgo(lastTrade.openT) : Infinity;

    const components: EngineComponent[] = [
      {
        name: "VPS",
        status: signals.length > 0 || trades.length > 0 ? "online" : "unknown",
        detail:
          signals.length > 0 && trades.length > 0
            ? "Hetzner"
            : "Sin datos",
      },
      {
        name: "Binance",
        status: lastSignal && lastSignalMin < 1440 ? "online" : "unknown",
        detail:
          lastSignal
            ? `Último dato: ${formatTimestamp(lastSignal.fecha)}`
            : "Sin conexión",
      },
      {
        name: "Capital",
        status:
          lastTrade && lastTradeMin < 1440 ? "online" : "unknown",
        detail:
          lastTrade
            ? `Último trade: ${formatTimestamp(lastTrade.openT)}`
            : "Sin actividad",
      },
      {
        name: "Telegram",
        status: reports.length > 0 ? "online" : "unknown",
        detail:
          reports.length > 0
            ? `${reports.length} reportes`
            : "Sin reportes",
      },
      {
        name: "Detector",
        status: lastSignal && lastSignalMin < 60 ? "online" : "offline",
        detail:
          lastSignal
            ? `Hace ${Math.round(lastSignalMin)} min`
            : "Sin señales",
      },
    ];

    const timestamps = [
      lastSignal?.fecha,
      lastTrade?.openT,
    ].filter(Boolean) as string[];
    const lastUpdate =
      timestamps.length > 0
        ? formatTimestamp(
            timestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0],
          )
        : "—";

    return { components, lastUpdate };
  }

  getActivityFeed(limit = 20): ActivityEntry[] {
    const signals = this.repo.getSignals();
    const trades = this.repo.getTrades();
    const reports = this.repo.getDailyReports();

    const signalEntries: ActivityEntry[] = signals.map((s) => ({
      ts: s.fecha,
      type: "señal" as const,
      description: `Señal A+ ${s.symbol} @ $${s.entry.toFixed(0)}`,
      pnl: s.pnl,
      result: s.resultado,
      symbol: s.symbol,
    }));

    const tradeEntries: ActivityEntry[] = trades
      .filter((t) => t.net !== undefined)
      .map((t) => ({
        ts: t.closeT ?? t.openT,
        type: "trade" as const,
        description: `${t.sym} ${t.dir} ${t.entryPx ? `@ $${t.entryPx.toFixed(0)}` : ""}`,
        pnl: t.net ?? 0,
        result: (t.net ?? 0) >= 0 ? "ganancia" : "pérdida",
        symbol: t.sym,
      }));

    const reportEntries: ActivityEntry[] = reports.map((r) => ({
      ts: r.fecha,
      type: "reporte" as const,
      description: `Reporte diario: ${r.n} trades, ${r.wr}% WR`,
      pnl: r.net,
      result: null,
      symbol: "—",
    }));

    return [...signalEntries, ...tradeEntries, ...reportEntries]
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, limit);
  }

  getAlerts(): AlertEntry[] {
    const alerts: AlertEntry[] = [];
    const signals = this.repo.getSignals();
    const trades = this.repo.getTrades();

    const stopLosses = signals.filter((s) => s.resultado === "stop");
    for (const s of stopLosses) {
      alerts.push({
        ts: s.fecha,
        severity: "warning",
        message: `Stop loss en ${s.symbol}`,
        detail: `Pérdida: $${s.pnl.toFixed(2)}. Entrada: $${s.entry.toFixed(0)}`,
      });
    }

    const lessons = trades.filter((t) => t.lesson);
    for (const t of lessons) {
      alerts.push({
        ts: t.closeT ?? t.openT,
        severity: "info",
        message: `Lección registrada en trade ${t.id.slice(0, 8)}`,
        detail: t.lesson!.slice(0, 120),
      });
    }

    const losingTrades = trades
      .filter((t) => t.net !== undefined && t.net < -5);
    for (const t of losingTrades) {
      alerts.push({
        ts: t.closeT ?? t.openT,
        severity: "critical",
        message: `Pérdida significativa en ${t.sym}`,
        detail: `P&L: $${t.net!.toFixed(2)}. Tag: ${t.tag ?? "sin tag"}`,
      });
    }

    const errors = trades.filter((t) => t.tag?.includes("error"));
    for (const t of errors) {
      alerts.push({
        ts: t.openT,
        severity: "warning",
        message: `Error operacional en trade ${t.id.slice(0, 8)}`,
        detail: `Tag: ${t.tag}. Símbolo: ${t.sym}`,
      });
    }

    return alerts.sort(
      (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
    );
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
