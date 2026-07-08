import { PageHeader } from "@/components/layout/page-header";
import { OperationsView } from "@/components/operations/operations-view";
import { getTradingService } from "@/lib/trading";
import { getMonitoringService } from "@/lib/monitoring";
import { getLogsService } from "@/lib/logs";

export default async function OperationsPage() {
  const trading = getTradingService();
  const monitoring = getMonitoringService();
  const logs = getLogsService();

  const [systemHealth, services, logEntries] = await Promise.all([
    monitoring.getSystemHealth(),
    monitoring.getServices(),
    logs.getLogs(50),
  ]);

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
        systemHealth={systemHealth}
        services={services}
        logEntries={logEntries}
      />
    </div>
  );
}
