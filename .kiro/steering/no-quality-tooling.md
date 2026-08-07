---
inclusion: auto
---

# No Quality Tooling Policy

## Policy
This project intentionally operates without automated quality gates during this phase.

## Prohibited
- Test runners: Vitest, Jest, Playwright, Cypress
- Linters: ESLint, Biome, stylelint
- Formatters: Prettier, Biome
- Type-check scripts: `tsc --noEmit`
- Pre-commit hooks: Husky, lint-staged
- Commit linters: commitlint

## Rationale
The team has decided to defer quality tooling to a later phase. During this phase the focus is on structural cleanup, backend integration wiring, and deployment infrastructure. Quality gates will be re-introduced once the architecture stabilizes.

## Instructions for AI
- Do NOT suggest adding quality-related devDependencies
- Do NOT generate test files (*.test.ts, *.spec.ts)
- Do NOT create configuration for prohibited tools
- Do NOT add lint/format/typecheck scripts to package.json
