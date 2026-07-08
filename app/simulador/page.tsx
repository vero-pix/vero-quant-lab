import { PageHeader } from "@/components/layout/page-header";
import { AplusSimulator } from "@/components/simulador/aplus-simulator";

export default function SimuladorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Simulador"
        title="Simulador A+"
        description="Mueve los umbrales y mira cómo cambia el edge. Datos reales de ETH 1m."
      />
      <AplusSimulator />
    </div>
  );
}
