import { PageHeader } from "@/components/layout/page-header";
import { OperationsView } from "@/components/operations/operations-view";
import { getTradingService } from "@/lib/trading";

export default function OperationsPage() {
  const trading = getTradingService();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Monitoreo"
        description="Actividad del sistema en tiempo real. Sin entrar al servidor."
      />
      <OperationsView
        engineStatus={trading.getEngineStatus()}
        activityFeed={trading.getActivityFeed(20)}
        alerts={trading.getAlerts()}
        dailyStats={trading.getDailyStats()}
      />
    </div>
  );
}
