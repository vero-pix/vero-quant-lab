import type { Meta, StoryObj } from "@storybook/react";

import {
  AppContainer,
  ContentContainer,
  PageTitle,
  Section,
} from "@/components/design-system";

const meta = {
  title: "Design System/Layout",
  parameters: {
    docs: {
      description: {
        component:
          "Layout primitives provide consistent application surfaces, content width, page titles, and section spacing.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const LayoutPrimitives: Story = {
  render: () => (
    <AppContainer className="rounded-lg border">
      <ContentContainer size="narrow">
        <Section spacing="loose">
          <PageTitle
            eyebrow="Workspace"
            title="Vero Quant Lab"
            description="Use PageTitle at the top of each major product surface."
          />
          <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
            Section content inherits consistent spacing and width constraints.
          </div>
        </Section>
      </ContentContainer>
    </AppContainer>
  ),
};

export const PageTitles: Story = {
  render: () => (
    <div className="space-y-8">
      <PageTitle
        eyebrow="Research"
        title="Research Workspace"
        description="A page title with eyebrow, headline, and explanatory text."
      />
      <PageTitle title="Simple page title" />
    </div>
  ),
};
