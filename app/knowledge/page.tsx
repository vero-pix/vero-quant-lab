import { PageHeader } from "@/components/layout/page-header";

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="Knowledge"
        description="Organized space for concepts, references, frameworks, and reusable notes."
      />
      <section className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Knowledge workspace ready.
      </section>
    </div>
  );
}
