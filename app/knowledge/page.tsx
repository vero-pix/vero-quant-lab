import { PageHeader } from "@/components/layout/page-header";
import { KnowledgeList } from "@/components/knowledge/knowledge-list";
import { getKnowledgeService } from "@/lib/knowledge";

export default function KnowledgePage() {
  const service = getKnowledgeService();
  const docs = service.list();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="Knowledge"
        description="Conceptos, referencias y documentación permanente."
      />
      <KnowledgeList docs={docs} />
    </div>
  );
}
