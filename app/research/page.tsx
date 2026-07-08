import { BookOpen, FlaskConical, GitCompare, Lightbulb } from "lucide-react";

import {
  EmptyStateCard,
  PageTitle,
  Section,
  StatusBadge,
} from "@/components/design-system";

export default function ResearchPage() {
  return (
    <div className="space-y-10 py-4">
      <PageTitle
        eyebrow="Research"
        title="Research"
        description="El espacio donde nacen, se cuestionan y evolucionan las estrategias de Vero Quant Lab."
      />

      <Section>
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyStateCard
            title="Papers"
            icon={BookOpen}
            description="Repositorio preparado para papers estudiados, notas de lectura y referencias metodológicas."
          />
          <EmptyStateCard
            title="Experimentos"
            icon={FlaskConical}
            description="Listado vacío preparado para futuros experimentos, validaciones y aprendizajes derivados."
          />
          <EmptyStateCard
            title="Hipótesis"
            icon={Lightbulb}
            description={
              <div className="flex items-center gap-3">
                <StatusBadge tone="neutral">Empty</StatusBadge>
                <span>No hay hipótesis activas.</span>
              </div>
            }
          />
          <EmptyStateCard
            title="Benchmark"
            icon={GitCompare}
            description={
              <div className="flex items-center gap-3">
                <StatusBadge tone="neutral">Empty</StatusBadge>
                <span>Sin benchmarks ejecutados.</span>
              </div>
            }
          />
        </div>
      </Section>
    </div>
  );
}
