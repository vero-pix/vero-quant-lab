import { PageHeader } from "@/components/layout/page-header";
import { AplusChart } from "@/components/chart/aplus-chart";

export default function ChartPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gráfico"
        title="Chart A+"
        description="Velas en vivo de Binance con EMAs, RSI y los markers de señal A+. Solo lectura."
      />
      <AplusChart />
    </div>
  );
}
