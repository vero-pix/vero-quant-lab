import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Plus } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/design-system";

const meta = {
  title: "Design System/Buttons",
  parameters: {
    docs: {
      description: {
        component:
          "Buttons express primary and secondary actions. Use one primary action per decision area.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Buttons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <PrimaryButton icon={<Plus className="size-4" />}>Create item</PrimaryButton>
      <SecondaryButton icon={<ArrowRight className="size-4" />}>Open workspace</SecondaryButton>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <PrimaryButton disabled>Primary disabled</PrimaryButton>
      <SecondaryButton disabled>Secondary disabled</SecondaryButton>
    </div>
  ),
};
