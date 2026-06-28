# Flowlee Platform

Flowlee is the workflow management and automation platform. This repository
contains the front-end onboarding experience: a two-step wizard that asks
whether the user works with a company or as a freelancer and then collects the
relevant organisation details.

## Tech stack

| Concern           | Tool                                                           |
| ----------------- | -------------------------------------------------------------- |
| Runtime / PM      | [Bun](https://bun.sh)                                          |
| Build tool        | [Vite](https://vite.dev)                                       |
| UI library        | [React 19](https://react.dev)                                  |
| Language          | [TypeScript](https://www.typescriptlang.org)                   |
| Styling           | [Tailwind CSS v4](https://tailwindcss.com)                     |
| Linting           | [ESLint](https://eslint.org) (flat config)                     |
| Formatting        | [Prettier](https://prettier.io)                                |
| Git hooks         | [Husky](https://typicode.github.io/husky)                      |
| Commit convention | [commitlint](https://commitlint.js.org) (Conventional Commits) |

## Prerequisites

- [Bun](https://bun.sh) `>= 1.3.0` (the pinned version lives in
  `package.json` → `packageManager`).

## Getting started

```bash
bun install      # install dependencies and set up Husky hooks
bun run dev      # start the Vite dev server (http://localhost:5173)
```

## Available scripts

| Script                 | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `bun run dev`          | Start the Vite dev server with HMR.             |
| `bun run build`        | Type-check (`tsc -b`) and build for production. |
| `bun run preview`      | Preview the production build locally.           |
| `bun run lint`         | Lint the codebase with ESLint.                  |
| `bun run lint:fix`     | Lint and auto-fix where possible.               |
| `bun run format`       | Format the codebase with Prettier.              |
| `bun run format:check` | Verify formatting without writing changes.      |
| `bun run typecheck`    | Run the TypeScript compiler without emitting.   |

## Project structure

```
src/
├── main.tsx                       # App entry point (React root)
├── App.tsx                        # Top-level component
├── index.css                      # Tailwind entry + global reset
├── assets/                        # Static assets imported by components
├── components/
│   └── ui/
│       └── Button.tsx             # Shared pill button
└── features/
    └── onboarding/
        ├── OnboardingWizard.tsx   # Wizard shell + state
        ├── types.ts               # Shared onboarding types
        └── steps/
            ├── OrgTypeStep.tsx     # Step 1: company vs. freelancer
            └── OrgDetailsStep.tsx  # Step 2: organisation details
```

## Styling notes

The UI is built with Tailwind CSS v4 utilities. Tailwind's **Preflight** base
reset is intentionally **not** loaded — the app ships its own universal reset in
`src/index.css`. See the comment at the top of that file for the rationale.

## Git workflow

Commits must follow the [Conventional Commits](https://www.conventionalcommits.org)
specification; this is enforced by commitlint via a Husky `commit-msg` hook. The
`pre-commit` hook runs ESLint. Example:

```
feat: add employee-count field to the onboarding form
```
