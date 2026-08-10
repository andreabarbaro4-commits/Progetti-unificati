# Implementation Plan: Frontend Cleanliness Refactor

## Overview

A sequential refactoring of the Flowlee frontend codebase to achieve consistent Tailwind utility usage, shared component library with cva variants, responsive layouts, and clean naming conventions — all while preserving visual neutrality. Each phase builds on the previous: dependencies → cn() helper → dead code → duplication → component library → Tailwind utilization → px→scale → responsiveness → naming consistency → playground → audit finalization → visual verification.

## Tasks

- [x] 1. Install dependencies and create cn() helper
  - [x] 1.1 Install tailwind-merge and class-variance-authority as runtime dependencies
    - Run `npm install tailwind-merge class-variance-authority`
    - Note: `clsx` is not yet in package.json, so install it as well: `npm install clsx`
    - Verify `npm run build` still passes after installation
    - _Requirements: 4.1, 4.5, 11.1_

  - [x] 1.2 Create cn() utility function in src/lib/utils.ts
    - Create `src/lib/utils.ts` with named export `cn()`
    - Accept variadic `ClassValue` arguments (strings, arrays, objects, undefined, null, false)
    - Pipe through clsx first, then tailwind-merge
    - _Requirements: 4.2_

  - [ ]* 1.3 Write property tests for cn() utility (Properties 1-3)
    - Create `src/lib/utils.test.ts`
    - **Property 1: cn() idempotent conflict resolution** — for conflicting utilities, only last-specified wins
    - **Property 2: cn() pass-through for non-conflicting classes** — all non-conflicting classes preserved
    - **Property 3: cn() handles falsy inputs gracefully** — no literal "undefined", "null", "false" in output
    - Use fast-check with minimum 100 iterations per property
    - **Validates: Requirements 4.2**

- [x] 2. Create px-to-Tailwind scale conversion utility
  - [x] 2.1 Implement px-to-scale conversion function in src/lib/tailwind-scale.ts
    - Create mapping of Tailwind scale steps to pixel values (1=4px, 2=8px, 3=12px, etc.)
    - Implement `pxToSpacing(px: number, prefix: string)` that returns standard class or arbitrary value
    - Implement `pxToTypography(fontSizePx: number, lineHeightPx: number)` returning independent text-* and leading-* classes
    - Apply 2px snap threshold logic: if nearest scale ≤ 2px away → standard class, else → arbitrary value bracket
    - Leave border/shadow/ring values unchanged (return null/skip indicator)
    - Handle calc() and CSS custom property inputs by returning them unchanged
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 2.2 Write property tests for px-to-scale conversion (Properties 4-6)
    - Create `src/lib/tailwind-scale.test.ts`
    - **Property 4: px-to-scale snap threshold correctness** — within 2px → standard class
    - **Property 5: px-to-scale arbitrary fallback** — beyond 2px → bracket notation with exact original value
    - **Property 6: Typography conversion independence** — font-size and line-height mapped independently
    - Use fast-check with minimum 100 iterations per property
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5, 6.6**

- [x] 3. Checkpoint - Verify utilities
  - Ensure all tests pass (`npm run test`), ensure build passes (`npm run build`), ask the user if questions arise.

- [x] 4. Visual baseline capture and audit report scaffold
  - [x] 4.1 Create audit report directory structure and README index
    - Create `docs/audit/frontend-cleanliness/README.md` with links to all area reports and status (all "in-progress")
    - Create empty template files for each area: `dead-code.md`, `duplication.md`, `component-library.md`, `tailwind-utilization.md`, `sizing-conversion.md`, `responsiveness.md`, `naming-consistency.md`, `visual-neutrality.md`
    - Create `docs/audit/frontend-cleanliness/screenshots/` directory
    - _Requirements: 10.1, 10.4_

  - [x] 4.2 Capture baseline screenshots at all three reference viewports
    - Capture full-page screenshots of every routed page (Onboarding, Dashboard, NotFound) at 375px, 768px, 1280px
    - Save as PNG files in `docs/audit/frontend-cleanliness/screenshots/` with pattern `{page-name}-{viewport}px.png`
    - Document in `visual-neutrality.md` that baseline was captured
    - _Requirements: 12.1, 12.3, 10.3_

- [x] 5. Dead code removal
  - [x] 5.1 Audit src/ for dead exports, components, functions, types, and files
    - Manually search for exports with zero import references across all source files
    - Check route configuration and index.html for dynamic references
    - Treat symbols referenced only by test files (not app code) as dead code per Requirement 1.6
    - Record all findings in `docs/audit/frontend-cleanliness/dead-code.md`
    - _Requirements: 1.1, 1.3, 1.6_

  - [x] 5.2 Remove identified dead code and verify
    - Delete dead exports/files one by one
    - Run `tsc -b` after each removal to verify zero new errors
    - Verify visual neutrality at 375px, 768px, 1280px after all removals
    - Update `dead-code.md` with each removal: file path, symbol name, search method
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 6. Duplication consolidation
  - [x] 6.1 Audit src/ for duplicated logic (≥80% identical lines)
    - Identify components or utilities where ≥80% of logic lines are identical or differ only in parameterizable values
    - Record findings in `docs/audit/frontend-cleanliness/duplication.md` with original locations
    - _Requirements: 2.1, 2.3_

  - [x] 6.2 Consolidate duplicated code into shared implementations
    - Create shared implementations: UI components in `src/components/ui/`, utilities in `src/lib/`
    - Migrate all call sites to use shared implementations
    - Run `tsc -b` after each migration to verify zero new errors
    - Verify visual neutrality at all viewports
    - Update `duplication.md` with: original locations, new shared location, parameterized differences
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 7. Checkpoint - Dead code and duplication complete
  - Ensure all tests pass, ensure build passes, verify visual neutrality at 1280px, ask the user if questions arise.

- [x] 8. Component library creation
  - [x] 8.1 Inventory all UI primitive patterns across src/
    - Identify buttons, inputs, cards, badges, modals, dropdowns, toggles
    - Flag patterns appearing in 2+ locations as extraction candidates
    - Record inventory in `docs/audit/frontend-cleanliness/component-library.md`
    - _Requirements: 3.1, 3.7_

  - [x] 8.2 Create shared Button component with cva variants
    - Refactor `src/components/ui/Button.tsx` to use cva and cn()
    - Define visual variants based on inventory (primary, secondary, ghost)
    - Define at least 2 size variants (default, sm)
    - Include `className` prop for consumer overrides (consumer wins via tailwind-merge)
    - _Requirements: 3.2, 3.3_

  - [x] 8.3 Create shared Card component with cva variants
    - Create `src/components/ui/Card.tsx` extracting the `.Step` CSS pattern
    - Define variants based on inventory findings
    - Include `className` prop for consumer overrides
    - _Requirements: 3.2, 3.3_

  - [x] 8.4 Create shared Badge/Tag component with cva variants
    - Create `src/components/ui/Badge.tsx` extracting the `.ruolo-tag` CSS pattern
    - Define active/inactive variants
    - Include `className` prop for consumer overrides
    - _Requirements: 3.2, 3.3_

  - [x] 8.5 Create shared Toggle component with cva variants
    - Create `src/components/ui/Toggle.tsx` extracting the `.switch`/`.slider` pattern from CompanySettingsStep
    - Define size variants (default, sm)
    - Include `className` prop for consumer overrides
    - _Requirements: 3.2, 3.3_

  - [x] 8.6 Refactor FormField component to use cn() for class composition
    - Update `src/components/ui/FormField.tsx` to use cn() instead of CSS class patterns
    - Replace conditional class logic with cn() calls
    - _Requirements: 3.2, 4.3_

  - [x] 8.7 Migrate all ad-hoc instances to shared components
    - Replace all ad-hoc button markup with `<Button>` component across onboarding steps
    - Replace `.Step` CSS usages with `<Card>` component
    - Replace `.ruolo-tag` usages with `<Badge>` component
    - Replace inline toggle markup with `<Toggle>` component
    - Verify visual neutrality after each migration
    - Document any instances left in place with justification in audit report
    - _Requirements: 3.4, 3.5, 3.6, 3.7_

- [x] 9. Checkpoint - Component library complete
  - Ensure all tests pass, ensure build passes, verify visual neutrality at all viewports, ask the user if questions arise.

- [x] 10. Tailwind utilization audit and conversion
  - [x] 10.1 Audit inline styles and raw CSS for Tailwind-expressible properties
    - Scan all components in `src/` for inline `style` attributes with Tailwind-expressible properties
    - Scan CSS files (especially `App.css`) for declarations expressible as Tailwind utilities
    - Identify repeated class strings (≥3 tokens in ≥3 files) for extraction
    - Record findings in `docs/audit/frontend-cleanliness/tailwind-utilization.md`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 10.2 Convert inline styles to Tailwind utility classes
    - Replace inline `style` attributes with equivalent Tailwind classes using cn()
    - Use arbitrary values for properties without standard utility equivalents, document in report
    - Verify visual neutrality after each conversion
    - _Requirements: 5.1, 5.5, 5.6_

  - [x] 10.3 Migrate raw CSS declarations to Tailwind utilities
    - Convert CSS declarations to Tailwind classes on the consuming components
    - Remove migrated declarations from CSS files
    - Leave keyframe animations, custom properties, and non-utility-expressible declarations in CSS
    - Delete empty CSS files and remove their imports
    - Verify visual neutrality after migrations
    - _Requirements: 5.2, 5.5, 5.7, 5.8_

  - [x] 10.4 Extract repeated utility class patterns into constants or components
    - Identify patterns of ≥3 utility tokens repeated in ≥3 component files
    - Extract to named constants in relevant files or promote to shared components
    - _Requirements: 5.3_

- [x] 11. Sizing unit conversion (px → Tailwind scale)
  - [x] 11.1 Convert pixel spacing values to Tailwind scale classes
    - Apply px-to-scale conversion utility logic to all spacing classes (margin, padding, gap)
    - Convert inline styles, CSS, and Tailwind arbitrary brackets (e.g., `p-[16px]` → `p-4`)
    - Use snap threshold: ≤2px difference → standard class; >2px → arbitrary value
    - Leave border/shadow/ring pixel values unchanged
    - Leave calc() and CSS custom property values unchanged
    - Document conversions and exceptions in `docs/audit/frontend-cleanliness/sizing-conversion.md`
    - _Requirements: 6.1, 6.4, 6.5, 6.6, 6.7_

  - [x] 11.2 Convert pixel sizing values to Tailwind scale classes
    - Apply conversion to width, height, min/max dimensions
    - Same snap threshold rules apply
    - Verify visual neutrality after conversions
    - _Requirements: 6.2, 6.5, 6.8_

  - [x] 11.3 Convert pixel typography values to Tailwind text/leading classes
    - Convert font-size to `text-*` classes and line-height to `leading-*` classes independently
    - Each mapping uses snap threshold independently per Property 6
    - Verify visual neutrality after conversions
    - _Requirements: 6.3, 6.8_

- [x] 12. Checkpoint - Tailwind and sizing complete
  - Ensure all tests pass, ensure build passes, verify visual neutrality at all viewports, ask the user if questions arise.

- [x] 13. Responsiveness audit and fixes
  - [x] 13.1 Audit all pages at 375px, 768px, 1280px viewports
    - Check for horizontal overflow, content truncation, overlapping elements
    - Check touch targets at 375px (minimum 44×44px)
    - Check navigation accessibility at 375px
    - Record findings in `docs/audit/frontend-cleanliness/responsiveness.md`
    - _Requirements: 7.1, 7.6_

  - [x] 13.2 Fix horizontal overflow issues with responsive Tailwind utilities
    - Apply responsive classes to eliminate horizontal scrollbars at all viewports
    - Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) not CSS media queries
    - Ensure 1280px desktop remains visually identical to baseline
    - _Requirements: 7.2, 7.5, 7.7_

  - [x] 13.3 Fix touch target sizes at mobile viewport
    - Increase touch targets below 44×44px at 375px using responsive utilities
    - Apply enlargement only below `md:` breakpoint to preserve desktop visual neutrality
    - _Requirements: 7.3, 7.7_

  - [x] 13.4 Implement collapsible navigation for mobile viewport if needed
    - If navigation overflows or is hidden at 375px, implement hamburger/drawer pattern
    - Use responsive Tailwind utilities for show/hide behavior
    - Ensure desktop layout unchanged
    - **Result: No changes needed** — audit verified navigation is accessible at 375px without overflow. Existing CSS responsive overrides handle mobile layout adequately.
    - _Requirements: 7.4, 7.5, 7.7_

  - [x] 13.5 Capture post-responsiveness screenshots
    - Screenshot all pages at 375px, 768px, 1280px after fixes
    - Store in `docs/audit/frontend-cleanliness/screenshots/` with appropriate filenames
    - Update responsiveness audit report with before/after comparison
    - _Requirements: 7.6, 10.3, 12.5, 12.6_

- [x] 14. Naming and prop-ordering consistency
  - [x] 14.1 Audit and fix file naming conventions
    - Ensure component files use PascalCase matching default export
    - Ensure hook files use camelCase prefixed with `use`
    - Ensure utility/library files use kebab-case
    - Exempt barrel/index files from naming rules
    - Update all import paths affected by renames
    - Verify `tsc -b` passes after each rename
    - Record findings in `docs/audit/frontend-cleanliness/naming-consistency.md`
    - _Requirements: 8.1, 8.2, 8.3, 8.7, 8.8, 8.9_

  - [x] 14.2 Apply prop-ordering conventions to all components
    - Order TypeScript interface props: identification → event handlers → layout/style → className last
    - Order JSX attributes: key → ref → className → alphabetical → event handlers last
    - Ensure all exported types/interfaces use PascalCase
    - Verify visual neutrality (prop reordering is purely cosmetic)
    - _Requirements: 8.4, 8.5, 8.6, 8.8_

- [x] 15. Component playground creation
  - [x] 15.1 Create Playground page component
    - Create `src/features/dev/playground/Playground.tsx`
    - Import all components from `src/components/ui/` (Button, FormField, LocaleSwitcher, Card, Badge, Toggle)
    - Render each component in a labelled section with every variant × size combination
    - Add visible text labels for each combination
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 15.2 Register playground route with production exclusion
    - Add route at `/dev/playground` in `src/routes.tsx`
    - Use `import.meta.env.DEV` guard for static dead-code elimination in production
    - Use lazy loading pattern (React.lazy with dynamic import) for code splitting
    - Verify playground is excluded from production bundle (`npm run build` then check dist/)
    - _Requirements: 9.4, 9.5, 9.6_

- [x] 16. Audit report finalization
  - [x] 16.1 Complete all audit area reports with final data
    - Ensure each area report has: summary (total issues identified/resolved), list of changes with file paths, before/after snippets for >3 line changes, exceptions with justifications
    - Update README.md index with completion status for each area
    - Add overall summary: total findings, total changes, total items unchanged
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [x] 17. Final visual neutrality verification
  - [x] 17.1 Perform final visual comparison against baseline
    - Compare current state screenshots against baseline at all three viewports
    - Verify 1280px is pixel-identical to baseline (no layout shifts ≥1px, no color/font changes)
    - Document pass/fail per page per viewport in `visual-neutrality.md`
    - Note acceptable deviations at 375px/768px from responsiveness improvements
    - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 18. Final checkpoint - All complete
  - Ensure all tests pass (`npm run test`), ensure build passes (`npm run build`), verify all audit reports are complete, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at phase boundaries
- Property tests validate universal correctness properties (cn() and px-to-scale)
- Unit tests validate specific examples and edge cases
- The strict execution order (dead code → component library → Tailwind → responsiveness → naming) ensures each phase builds cleanly on the previous
- Visual neutrality at 1280px desktop is non-negotiable; deviations at smaller viewports are acceptable only for responsiveness fixes
- All changes are within `src/` scope; `node_modules`, `dist`, codegen, vendored, and i18n JSON are excluded

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "2.1"] },
    { "id": 3, "tasks": ["2.2", "4.1"] },
    { "id": 4, "tasks": ["4.2", "5.1"] },
    { "id": 5, "tasks": ["5.2"] },
    { "id": 6, "tasks": ["6.1"] },
    { "id": 7, "tasks": ["6.2"] },
    { "id": 8, "tasks": ["8.1"] },
    { "id": 9, "tasks": ["8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 10, "tasks": ["8.7"] },
    { "id": 11, "tasks": ["10.1"] },
    { "id": 12, "tasks": ["10.2", "10.3", "10.4"] },
    { "id": 13, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 14, "tasks": ["13.1"] },
    { "id": 15, "tasks": ["13.2", "13.3", "13.4"] },
    { "id": 16, "tasks": ["13.5"] },
    { "id": 17, "tasks": ["14.1"] },
    { "id": 18, "tasks": ["14.2"] },
    { "id": 19, "tasks": ["15.1"] },
    { "id": 20, "tasks": ["15.2"] },
    { "id": 21, "tasks": ["16.1"] },
    { "id": 22, "tasks": ["17.1"] }
  ]
}
```
