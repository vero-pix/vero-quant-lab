import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AcademyLesson } from "@/lib/academy";

export function AcademyLessonDetail({
  lesson, moduleSlug, moduleTitle,
}: {
  lesson: AcademyLesson;
  moduleSlug: string;
  moduleTitle: string;
}) {
  return (
    <div className="space-y-6">
      <Link
        href={`/academy/${moduleSlug}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Volver a {moduleTitle}
      </Link>

      <h1 className="text-xl font-semibold text-foreground">{lesson.title}</h1>

      <div className="rounded-lg border bg-card/50 px-5 py-4">
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
