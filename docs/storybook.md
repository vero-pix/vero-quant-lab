# Storybook Guide

Storybook documents the reusable Vero Quant Lab Design System.

## Commands

Run Storybook locally:

```bash
npm run storybook
```

Build the static Storybook:

```bash
npm run build-storybook
```

## What belongs in Storybook

Storybook should document reusable components from `components/design-system`.

Current coverage:

- Card
- MetricCard
- ActionCard
- StatusCard
- EmptyState
- PrimaryButton
- SecondaryButton
- DisplayTitle
- SectionTitle
- Caption
- StatusBadge
- StatusDot
- AppContainer
- ContentContainer
- Section
- PageTitle

## Developer usage

- Add stories next to design-system components using `*.stories.tsx`.
- Keep stories focused on component behavior and visual states.
- Do not use Storybook stories to introduce product functionality.
- Do not invent metrics, charts, tables, or fake operational data.
- Prefer empty, ready, pending, and planned examples when real data does not exist.
- Use dark theme examples by default.

## Review checklist

Before merging Design System changes:

- `npm run build`
- `npm run lint`
- Confirm the component has a Storybook example.
- Confirm props are typed.
- Confirm the component uses existing Tailwind tokens.
- Confirm the component does not modify Workspace, domain models, or product routes.
