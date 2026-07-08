import { PageHeader } from "@/components/layout/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getTradingService } from "@/lib/trading";
import { getLabService } from "@/lib/lab";

export default function DashboardPage() {
  const trading = getTradingService();
  const lab = getLabService();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Centro de operaciones"
        title="Dashboard"
        description="Estado completo de tu operación en menos de 10 segundos."
      />
      <DashboardView
        engineStatus={trading.getEngineStatus()}
        dailyStats={trading.getDailyStats()}
        recentSignals={trading.getRecentSignals(5)}
        recentTrades={trading.getRecentTrades(5)}
        labStatus={lab.getLabStatus()}
        nextAction={lab.getNextAction()}
      />
    </div>
  );
}
