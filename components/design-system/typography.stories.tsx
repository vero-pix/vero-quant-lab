import type { Meta, StoryObj } from "@storybook/react";

import { Caption, DisplayTitle, SectionTitle } from "@/components/design-system";

const meta = {
  title: "Design System/Typography",
  parameters: {
    docs: {
      description: {
        component:
          "Typography primitives keep hierarchy consistent across dense work surfaces.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const TypographyScale: Story = {
  render: () => (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Caption>Caption</Caption>
        <DisplayTitle>Display title</DisplayTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Use DisplayTitle only for primary page or surface headings.
        </p>
      </div>
      <div className="space-y-2">
        <SectionTitle>Section title</SectionTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Use SectionTitle inside workspace sections, cards, and panels.
        </p>
      </div>
    </div>
  ),
};
