import type { Meta, StoryObj } from "@storybook/react";
import { BookOpen, Brain, GitCompare, Inbox, Library } from "lucide-react";

import {
  ActionCard,
  Card,
  EmptyStateCard,
  MetricCard,
  StatusCard,
} from "@/components/design-system";

const meta = {
  title: "Design System/Cards",
  parameters: {
    docs: {
      description: {
        component:
          "Cards group related content with subtle borders and restrained hierarchy.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const BaseCard: Story = {
  render: () => (
    <Card className="max-w-md">
      <h3 className="text-lg font-semibold text-foreground">Base card</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Use Card for simple grouped content that does not need a specialized pattern.
      </p>
    </Card>
  ),
};

export const MetricCards: Story = {
  render: () => (
    <div className="grid max-w-4xl gap-4 sm:grid-cols-3">
      <MetricCard label="Real metric" value="--" detail="Use only with real data" />
      <MetricCard label="Pending source" value="--" detail="No simulated numbers" />
      <MetricCard label="Verified data" value="--" detail="Connect later" />
    </div>
  ),
};

export const ActionCards: Story = {
  render: () => (
    <div className="grid max-w-5xl gap-4 sm:grid-cols-3">
      <ActionCard
        title="Research"
        description="Continuar investigaciones y experimentos."
        icon={Brain}
        status="Ready"
        statusTone="ready"
      />
      <ActionCard
        title="Knowledge"
        description="Documentacion y arquitectura."
        icon={Library}
        status="Ready"
        statusTone="ready"
      />
      <ActionCard
        title="AI Copilot"
        description="Proximamente."
        icon={Inbox}
        status="Planned"
        statusTone="planned"
        disabled
      />
    </div>
  ),
};

export const EmptyStateCards: Story = {
  render: () => (
    <div className="grid max-w-5xl gap-4 lg:grid-cols-2">
      <EmptyStateCard
        title="Papers"
        description="Repositorio preparado para papers estudiados, notas de lectura y referencias metodologicas."
        icon={BookOpen}
      />
      <EmptyStateCard
        title="Benchmark"
        description="Sin benchmarks ejecutados."
        icon={GitCompare}
      />
    </div>
  ),
};

export const StatusCards: Story = {
  render: () => (
    <StatusCard
      title="Estado del sistema"
      className="max-w-lg"
      items={[
        { label: "Research", value: "Ready", tone: "ready" },
        { label: "Trading Engine", value: "Pending Integration", tone: "pending" },
        { label: "AI Copilot", value: "Planned", tone: "planned" },
      ]}
    />
  ),
};
