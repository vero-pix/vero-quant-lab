import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ResearchDetail } from "@/components/research/research-detail";
import { getResearchService } from "@/lib/research";

export default async function ResearchDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const service = getResearchService();
  const project = service.getById(id);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={id}
        title={project.title}
        description={project.objective ?? ""}
      />
      <ResearchDetail project={project} />
    </div>
  );
}
