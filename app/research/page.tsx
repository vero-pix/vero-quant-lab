import { PageHeader } from "@/components/layout/page-header";
import { ResearchList } from "@/components/research/research-list";
import { getResearchService } from "@/lib/research";

export default function ResearchPage() {
  const service = getResearchService();
  const projects = service.list();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Research"
        title="Investigaciones"
        description="Cada investigación termina en una decisión concreta."
      />
      <ResearchList projects={projects} />
    </div>
  );
}
