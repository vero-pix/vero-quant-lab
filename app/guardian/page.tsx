import { PageHeader } from "@/components/layout/page-header";
import { GuardianView } from "@/components/guardian/guardian-view";
import { getGuardianService } from "@/lib/guardian";

export default async function GuardianPage() {
  const guardian = getGuardianService();
  const snapshot = await guardian.getSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Guardian"
        title="Protección de capital"
        description="Visibilidad y semáforo sobre el enforcement de riesgo. No ejecuta órdenes."
      />
      <GuardianView snapshot={snapshot} />
    </div>
  );
}
