import { PageHeader } from "@/components/layout/page-header";
import { AcademyList } from "@/components/academy/academy-list";
import { getAcademyService } from "@/lib/academy";

export default function AcademyPage() {
  const service = getAcademyService();
  const modules = service.listModules();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning"
        title="Academy"
        description="Biblioteca personal de módulos y lecciones."
      />
      <AcademyList modules={modules} />
    </div>
  );
}
