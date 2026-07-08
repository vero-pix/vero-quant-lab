import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AcademyModuleDetail } from "@/components/academy/academy-module";
import { getAcademyService } from "@/lib/academy";

export default async function AcademyModulePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const service = getAcademyService();
  const mod = service.getModule(slug);

  if (!mod) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Academy"
        title={mod.title}
        description={mod.description}
      />
      <AcademyModuleDetail mod={mod} />
    </div>
  );
}
