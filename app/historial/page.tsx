import { PageHeader } from "@/components/layout/page-header";
import { HistorialView } from "@/components/historial/historial-view";
import { getHistorialService } from "@/lib/historial";

export default async function HistorialPage() {
  const historial = getHistorialService();
  const snapshot = await historial.getSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Historial"
        title="Historial de ejecuciones"
        description="Las operaciones reales ejecutadas en Binance, sin abrir Binance ni Telegram. El PnL y el win rate salen de trades reales, no de señales simuladas."
      />
      <HistorialView snapshot={snapshot} />
    </div>
  );
}
