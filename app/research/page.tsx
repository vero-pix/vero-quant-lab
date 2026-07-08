import { PageHeader } from "@/components/layout/page-header";

export default function ResearchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analysis"
        title="Research"
        description="A clean base for hypotheses, market notes, and structured quantitative research."
      />
      <section className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Research workspace ready.
      </section>
    </div>
  );
}
