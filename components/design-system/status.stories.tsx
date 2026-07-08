import type { Meta, StoryObj } from "@storybook/react";

import { StatusBadge, StatusDot } from "@/components/design-system";

const meta = {
  title: "Design System/Status",
  parameters: {
    docs: {
      description: {
        component:
          "Status primitives standardize readiness, pending work, planned modules, neutral states, and danger states.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusBadge tone="ready">Ready</StatusBadge>
      <StatusBadge tone="pending">Pending</StatusBadge>
      <StatusBadge tone="planned">Planned</StatusBadge>
      <StatusBadge tone="neutral">Neutral</StatusBadge>
      <StatusBadge tone="danger">Danger</StatusBadge>
    </div>
  ),
};

export const Dots: Story = {
  render: () => (
    <div className="space-y-3 text-sm text-muted-foreground">
      {(["ready", "pending", "planned", "neutral", "danger"] as const).map((tone) => (
        <div key={tone} className="flex items-center gap-3">
          <StatusDot tone={tone} />
          <span className="capitalize">{tone}</span>
        </div>
      ))}
    </div>
  ),
};
