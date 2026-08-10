# Dead Code Removal Audit

## Summary
- Issues identified: 24
- Issues resolved: 24
- Items left unchanged: 5 (intentional future use from this spec)

---

## Dead Files

Files that are never imported by any application code.

### 1. `src/stores/ui-store.ts`
- **Export:** `useUiStore`
- **Search method:** `grep -rn "useUiStore\|ui-store" src/` — zero results outside the file itself
- **Status:** Removed — entire file deleted

### 2. `src/features/onboarding/types.ts`
- **Export:** `Step` (type)
- **Search method:** `grep -rn "from.*types\|from.*onboarding/types" src/features/onboarding/` — zero results
- **Status:** Removed — entire file deleted

### 3. `src/features/onboarding/components/StepIndicator.tsx`
- **Export:** `StepIndicator` (component)
- **Search method:** `grep -rn "StepIndicator" src/` — found only in its own file definition
- **Status:** Removed — entire file deleted

### 4. `src/lib/useFormatters.ts`
- **Export:** `useFormatters`, `Formatters`
- **Search method:** `grep -rn "useFormatters" src/` — only imported by `src/lib/useFormatters.test.ts`
- **Status:** Removed — dead per Requirement 1.6, entire file deleted

### 5. `src/lib/useFormatters.test.ts`
- **Association:** Test file for dead hook `useFormatters`
- **Status:** Removed — tests dead code per Requirement 1.6, file deleted

---

## Dead Asset Files

Image/SVG files in `src/assets/` with zero import references across all source files.

### 6. `src/assets/Barra.png`
- **Search method:** `grep -rn "Barra" src/ --include="*.ts" --include="*.tsx" --include="*.css"` — zero results referencing the file
- **Status:** Removed — file deleted

### 7. `src/assets/caffe.png`
- **Search method:** `grep -rn "caffe" src/ --include="*.ts" --include="*.tsx"` — zero results referencing the file
- **Status:** Removed — file deleted

### 8. `src/assets/faccia.png`
- **Search method:** `grep -rn "faccia" src/ --include="*.ts" --include="*.tsx"` — zero results referencing the file
- **Status:** Removed — file deleted

### 9. `src/assets/foto.png`
- **Search method:** `grep -rn "assets/foto" src/` — zero results (CSS `.foto-wrapper` classes are unrelated)
- **Status:** Removed — file deleted

### 10. `src/assets/Group 233.png`
- **Search method:** `grep -rn "Group 233" src/` — zero results
- **Status:** Removed — file deleted

### 11. `src/assets/gufo.jpeg`
- **Search method:** `grep -rn "gufo" src/` — zero results
- **Status:** Removed — file deleted

### 12. `src/assets/hero.png`
- **Search method:** `grep -rn "hero" src/ --include="*.ts" --include="*.tsx"` — zero results referencing the file
- **Status:** Removed — file deleted

### 13. `src/assets/Nav bar.png`
- **Search method:** `grep -rn "Nav bar" src/` — zero results
- **Status:** Removed — file deleted

### 14. `src/assets/react.svg`
- **Search method:** `grep -rn "react.svg\|assets/react" src/` — zero results
- **Status:** Removed — file deleted

### 15. `src/assets/Settings.png`
- **Search method:** `grep -rn "Settings" src/ --include="*.ts" --include="*.tsx"` — zero results referencing the file
- **Status:** Removed — file deleted

### 16. `src/assets/unnamed.jpg`
- **Search method:** `grep -rn "unnamed" src/` — zero results
- **Status:** Removed — file deleted

### 17. `src/assets/violetto.png`
- **Search method:** `grep -rn "violetto" src/` — zero results
- **Status:** Removed — file deleted

### 18. `src/assets/vite.svg`
- **Search method:** `grep -rn "vite.svg\|assets/vite" src/` — zero results
- **Status:** Removed — file deleted

---

## Dead Exports (within otherwise-live files)

Exported symbols that are never imported externally. These are exports where the `export` keyword could be removed (the function/type may still be used internally).

### 19. `ButtonVariant` — `src/components/ui/Button.tsx`
- **Search method:** `grep -rn "ButtonVariant" src/` — only used within `Button.tsx` itself
- **Status:** Removed — `export` keyword removed, type remains internal

### 20. `AppEnvironment` — `src/env.ts`
- **Search method:** `grep -rn "import.*AppEnvironment" src/` — zero results
- **Status:** Removed — `export` keyword removed, type remains internal

### 21. `disableMockApi` — `src/mock/mock-api-client.ts`
- **Search method:** `grep -rn "disableMockApi" src/` — only found in its own definition
- **Status:** Removed — entire function deleted (never called)

### 22. `RouteDefinition` — `src/routes.tsx`
- **Search method:** `grep -rn "RouteDefinition" src/` — only used within `routes.tsx` itself
- **Status:** Removed — `export` keyword removed, interface remains internal

### 23. `STORAGE_KEY` — `src/lib/i18n.ts`
- **Search method:** `grep -rn "STORAGE_KEY" src/ | grep -v i18n.ts` — zero results
- **Status:** Removed — `export` keyword removed, constant remains internal

### 24. `getInitialLocale` — `src/lib/i18n.ts`
- **Search method:** `grep -rn "getInitialLocale" src/ | grep -v i18n.ts` — zero results
- **Status:** Removed — `export` keyword removed, function remains internal (used within i18n.ts initialization)

---

## Exceptions (Intentionally Unchanged)

### `src/lib/utils.ts` (`cn` function)
- **Reason:** Created as part of this spec (task 1.2) for use in upcoming tasks (8.x, 10.x). Not pre-existing dead code.

### `src/lib/tailwind-scale.ts` (`pxToSpacing`, `pxToTypography`, `processValue`, `SpacingResult`, `TypographyResult`)
- **Reason:** Created as part of this spec (task 2.1) for use in upcoming task 11.x. Not pre-existing dead code.

### `zodErrorMap` — `src/lib/form-utils.ts`
- **Reason:** Although never imported externally, this is used internally via `z.setErrorMap(zodErrorMap)` in the same file — the export is unnecessary but the symbol is actively consumed at module load time.

### `ApiError` — `src/lib/api-client.ts`
- **Reason:** Interface used internally to type error objects. The export is unnecessary but the type is actively consumed within the module. Consumers may benefit from the export for error handling in future code.

### `OnboardingWizard` (named export) — `src/features/onboarding/OnboardingWizard.tsx`
- **Reason:** The file provides both a named and default export pointing to the same function. Only the default is consumed by `routes.tsx`. The named export is redundant but its removal is a refactoring choice rather than dead-code removal — keeping both allows import flexibility.

---

## Dynamic Reference Check

- **`index.html`** — Only references `/src/main.tsx` via `<script type="module">`. No direct references to source files or assets.
- **`src/routes.tsx`** — Uses `React.lazy()` with dynamic `import()` for: `OnboardingWizard`, `callback`, `Dashboard`, `NotFound`. All lazy-loaded modules are live.
- **`src/App.tsx`** — Uses dynamic `import()` for mock components (`mock-auth-provider`, `MockIndicator`). Both are live.
- **`src/main.tsx`** — Uses dynamic `import('./mock/setup')`. Live.
