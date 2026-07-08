import type { Preview } from "@storybook/react";

import "../app/globals.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-background p-6 font-sans text-foreground">
        <Story />
      </div>
    ),
  ],
};

export default preview;
