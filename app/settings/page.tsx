import { PageHeader } from "@/components/layout/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Project-level settings shell for future studio configuration."
      />
      <section className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Settings workspace ready.
      </section>
    </div>
  );
}
