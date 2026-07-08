import { PageHeader } from "@/components/layout/page-header";

export default function AcademyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning"
        title="Academy"
        description="Content hub for lessons, study tracks, and internal learning material."
      />
      <section className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Academy workspace ready.
      </section>
    </div>
  );
}
