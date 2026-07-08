import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { KnowledgeDetail } from "@/components/knowledge/knowledge-detail";
import { getKnowledgeService } from "@/lib/knowledge";

export default async function KnowledgeDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const service = getKnowledgeService();
  const doc = service.getBySlug(slug);

  if (!doc) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Knowledge"
        title={doc.title}
        description=""
      />
      <KnowledgeDetail doc={doc} />
    </div>
  );
}
