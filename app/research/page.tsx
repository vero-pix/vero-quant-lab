import { PageHeader } from "@/components/layout/page-header";
import { ResearchWorkspace } from "@/components/research/research-workspace";
import { getLabService } from "@/lib/lab";

export default function ResearchPage() {
  const lab = getLabService();
  const research = lab.listResearch();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Research"
        title="Investigaciones"
        description="Administra tus investigaciones. Cada aprendizaje se convierte en conocimiento permanente."
      />
      <ResearchWorkspace research={research} />
    </div>
  );
}
