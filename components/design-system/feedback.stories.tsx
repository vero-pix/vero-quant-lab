import type { Meta, StoryObj } from "@storybook/react";

import { ComingSoon, EmptyState } from "@/components/design-system";

const meta = {
  title: "Design System/Feedback",
  parameters: {
    docs: {
      description: {
        component:
          "Feedback components communicate unavailable, planned, or empty states without inventing data.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const EmptyStates: Story = {
  render: () => (
    <EmptyState
      title="Trabajo actual"
      description="El Workspace esta preparado para recibir proyectos cuando existan datos reales."
      className="max-w-2xl"
    />
  ),
};

export const ComingSoonState: Story = {
  render: () => (
    <ComingSoon
      title="AI Copilot"
      description="Esta funcionalidad esta planificada y se implementara cuando exista una SPEC aprobada."
      className="max-w-2xl"
    />
  ),
};
