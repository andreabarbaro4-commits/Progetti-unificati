# CLAUDE.md

Guidance for AI agents (and humans) working in this repository.

## Commands

- Install: `bun install`
- Dev server: `bun run dev`
- Build (type-check + bundle): `bun run build`
- Lint: `bun run lint` (auto-fix: `bun run lint:fix`)
- Format: `bun run format` (check only: `bun run format:check`)
- Type-check only: `bun run typecheck`

Bun is the package manager (pinned via `packageManager` in `package.json`). Do
not introduce `npm`/`yarn`/`pnpm` lockfiles.

## Architecture

- React 19 + Vite + TypeScript single-page app.
- The only feature is the onboarding wizard under
  `src/features/onboarding/`. `OnboardingWizard.tsx` owns the wizard state
  (current step, selected org type, form values) and renders one of two step
  components from `steps/`.
- Shared, presentational components live in `src/components/ui/`.

## Styling

- Tailwind CSS v4, configured via the `@tailwindcss/vite` plugin. There is no
  `tailwind.config.js`; configuration is CSS-first in `src/index.css`.
- **Preflight is disabled on purpose.** `src/index.css` imports only the
  `theme` and `utilities` layers and keeps the project's original universal
  reset. Re-enabling Preflight will change the rendered output.
- Styling is done with utility classes in JSX (often arbitrary values such as
  `text-[28px]`) to mirror the original hand-written CSS exactly.

## Visual fidelity

This UI was migrated from hand-written CSS to Tailwind under a strict
"no visual change" requirement. Some styles look unusual but are intentional
(both step-1 buttons are black; form inputs are yellow). When changing markup
or classes, preserve the rendered output.

## Conventions

- Conventional Commits, enforced by commitlint (`commit-msg` Husky hook).
- `pre-commit` runs ESLint. Keep the build, lint, and format checks green.
