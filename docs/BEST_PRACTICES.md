# Best-practices review

A review of the project against current best practices for a **React + Bun +
TypeScript + ESLint + Tailwind + Husky + commitlint** stack, plus the changes
applied in this cleanup. The overriding constraint for this pass was **absolute
visual fidelity** — the rendered output must not change.

## Summary

| Area        | Before                                              | After                                                       |
| ----------- | --------------------------------------------------- | ----------------------------------------------------------- |
| Package mgr | npm (`package-lock.json`), hooks called `npm`/`npx` | Bun (`bun.lock`), `packageManager` pinned, hooks call `bun` |
| Tailwind    | Listed in the stack but **not installed**           | Tailwind v4 via `@tailwindcss/vite`; CSS fully migrated     |
| React       | React 19, `StrictMode` ✔                            | Same, plus a thin `App` and feature-based components        |
| TypeScript  | Strict bundler config ✔, but wrong/typo'd types     | Same config; types corrected, no `any`                      |
| ESLint      | Flat config ✔                                       | Added `eslint-config-prettier` to avoid rule conflicts      |
| Formatting  | **No formatter**                                    | Prettier + `prettier-plugin-tailwindcss`                    |
| Husky       | Hooks present ✔                                     | Updated to Bun                                              |
| commitlint  | Conventional config ✔                               | Unchanged (already correct)                                 |
| Structure   | Everything in `App.tsx` + two conflicting CSS files | Feature-based folders, single Tailwind entry                |
| Docs        | Default Vite template README + a duplicate file     | Real README, `CLAUDE.md`, this report                       |

## What was already good

- **React 19** with `createRoot` and `<StrictMode>`.
- **Flat ESLint config** with `typescript-eslint`, `react-hooks`, and
  `react-refresh` — the current recommended setup.
- **Strict TypeScript** project references (`tsconfig.app.json` /
  `tsconfig.node.json`) with `noUnusedLocals`, `noUnusedParameters`,
  `verbatimModuleSyntax`, and bundler module resolution.
- **commitlint** with `@commitlint/config-conventional`.
- **Husky** hooks wired through the `prepare` script.

## Issues found and fixed

### Tooling / configuration

1. **Package manager mismatch.** The stack targets Bun, but the repo used npm.
   Migrated to Bun: generated `bun.lock`, removed `package-lock.json`, pinned
   `packageManager: bun@…`, added an `engines.bun` constraint, and updated the
   Husky hooks (`bun run lint`, `bunx commitlint`).
2. **Tailwind missing entirely.** Tailwind was named in the stack but no
   dependency, config, or directive existed. Installed Tailwind v4 with the
   `@tailwindcss/vite` plugin and migrated all styling to utilities.
3. **No code formatter.** Added Prettier and `prettier-plugin-tailwindcss`,
   plus `format` / `format:check` scripts and a `.prettierignore`.
4. **ESLint/Prettier conflicts.** Added `eslint-config-prettier` (last in the
   `extends` chain) so formatting rules don't fight ESLint.
5. **Added scripts.** `lint:fix`, `format`, `format:check`, and `typecheck`.

### Correctness / hygiene

6. **`index.html` was malformed** — the closing `</html` tag was missing its
   `>`. Fixed, and added a `meta description`.
7. **Two conflicting stylesheets.** `index.css` and `App.css` defined the same
   selectors with different values and relied on import order to resolve. The
   winning (rendered) values were extracted from the live DOM and reproduced as
   utilities; both files were replaced by a single Tailwind entry.
8. **Invalid CSS selectors** (`.4`, `.5`) and dead rules (e.g. `.app-wrapper`,
   which the markup never used) were removed.
9. **Typo'd TypeScript unions** — e.g. `'azienda |proffessionista'` — that did
   not match the values actually passed at runtime. Replaced with a single
   correct `OrgType` union. Runtime values were preserved exactly.
10. **`useState<string>()` with no initial value** (implicitly `undefined`,
    making the textarea briefly uncontrolled) was given an empty-string default.
11. **Unused assets** (`hero.png`, `react.svg`, `vite.svg`) and the unused
    `App.css` import were removed.
12. **Duplicate README** — there were two files, `README.md` (the default Vite
    template) and `README.md ` (with a trailing space). Both were replaced by a
    single project README.

### Structure

13. A single 250-line `App.tsx` was split into a feature module
    (`features/onboarding/*`) with a wizard shell, two step components, shared
    types, and a reusable `Button` in `components/ui/`.

## Visual-fidelity method

Because the cleanup must not change the look, every change was verified against
pixel baselines:

1. Screenshots of all six states (step 1, step 2 × company/freelancer, at
   desktop and mobile widths) were captured from the original build.
2. The **computed** styles of every element were extracted from the live DOM —
   the source of truth, given the conflicting CSS — and used to drive the
   Tailwind migration.
3. After migrating, screenshots were re-captured and diffed against the
   baselines. The first pass surfaced one real regression: the dark button
   inherited the native UA border (because Preflight is disabled and the
   original `.btn { border: none }` was dropped), making it 4px larger. After
   restoring `border-none` / explicit `border-solid`, the diff reached
   **0.0000%** across all six states, in both dev and production builds.

## Deliberate non-changes

- **Tailwind Preflight is left disabled.** The app's original universal reset is
  preserved instead; enabling Preflight would alter the output.
- **Unusual but intentional visuals were kept** (both step-1 buttons are black;
  inputs are yellow; the step-1 buttons stack because their container is not a
  flex row). These reflect the current design and were reproduced exactly.

## Recommended follow-ups (out of scope here)

These would change behaviour or appearance and so were intentionally not done:

- Add automated visual-regression tests (e.g. Playwright snapshots) so future
  changes are guarded the way this migration was.
- Add a CI workflow running `build`, `lint`, and `format:check`.
- Revisit the intentional-but-likely-unintended visuals (yellow inputs, the
  `30-55s persone` option typo, the duplicated-meaning button labels) with the
  design owner.
- Add accessibility passes (labels/roles, focus styles) and responsive handling
  for narrow viewports, where the card currently overflows.
