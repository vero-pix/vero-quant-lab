import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AcademyLessonDetail } from "@/components/academy/academy-lesson";
import { getAcademyService } from "@/lib/academy";

export default async function AcademyLessonPage(props: {
  params: Promise<{ slug: string; lesson: string }>;
}) {
  const { slug, lesson } = await props.params;
  const service = getAcademyService();
  const mod = service.getModule(slug);
  const lessonData = service.getLesson(slug, lesson);

  if (!mod || !lessonData) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${mod.title} / ${lessonData.title}`}
        title={lessonData.title}
        description=""
      />
      <AcademyLessonDetail
        lesson={lessonData}
        moduleSlug={slug}
        moduleTitle={mod.title}
      />
    </div>
  );
}
