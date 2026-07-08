import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio overview"
        title="Dashboard"
        description="Operational snapshot for research, academy content, and knowledge workflows."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Research streams" value="04" detail="Active workspaces" />
        <StatCard label="Academy modules" value="12" detail="Planned lessons" />
        <StatCard label="Knowledge notes" value="28" detail="Indexed references" />
      </div>
    </div>
  );
}
