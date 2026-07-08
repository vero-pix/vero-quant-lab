import { PageHeader } from "@/components/layout/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { BinancePanel } from "@/components/binance/binance-panel";
import { TelegramPanel } from "@/components/telegram/telegram-panel";
import { getTradingService } from "@/lib/trading";
import { getBinanceService } from "@/lib/binance";
import { getTelegramService } from "@/lib/telegram";

export default async function DashboardPage() {
  const trading = getTradingService();
  const binance = getBinanceService();
  const telegram = getTelegramService();

  const [engineStatus, dailyStats, activityFeed, binanceSnapshot, telegramSnapshot] = await Promise.all([
    Promise.resolve(trading.getEngineStatus()),
    Promise.resolve(trading.getDailyStats()),
    Promise.resolve(trading.getActivityFeed(5)),
    binance.getSnapshot(),
    telegram.getSnapshot(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Centro de operaciones"
        title="Dashboard"
        description="Estado completo de tu operación en menos de 10 segundos."
      />
      <DashboardView
        engineStatus={engineStatus}
        dailyStats={dailyStats}
        activityFeed={activityFeed}
        lastSignal={trading.getRecentSignals(1)[0] ?? null}
        lastTrade={trading.getRecentTrades(1)[0] ?? null}
        tradingStatus={trading.getDashboard().tradingStatus}
      />
      <BinancePanel
        balances={binanceSnapshot.balances}
        openOrders={binanceSnapshot.openOrders}
        prices={binanceSnapshot.prices}
        updatedAt={binanceSnapshot.updatedAt}
      />
      <TelegramPanel snapshot={telegramSnapshot} />
    </div>
  );
}
