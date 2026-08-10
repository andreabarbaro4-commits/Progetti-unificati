# Requirements Document

## Introduction

This spec covers a comprehensive code cleanliness, responsiveness, and Tailwind consistency refactoring of the Flowlee frontend. The goal is to bring the codebase to a consistent, maintainable state with maximal Tailwind utility usage, a real responsive layout at standard breakpoints, and clean component code — with zero visible/visual change. Success means "looks the same, code is cleaner and more consistent underneath."

The refactor follows a strict execution order: dead code/duplication first, component library second, Tailwind utilization + px→scale third, responsiveness fourth, naming/prop-ordering consistency last.

Scope is limited to `src/` only, excluding `node_modules`, `dist`, codegen, vendored code, and i18n JSON files.

## Glossary

- **Refactoring_Engine**: The developer(s) performing the refactoring work within the `src/` directory
- **Component_Library**: The shared UI component collection in `src/components/ui/`
- **Tailwind_Scale**: The rem-based spacing/sizing system provided by Tailwind CSS utility classes
- **cn_Helper**: A utility function combining `clsx` and `tailwind-merge` for conditional and conflict-free class composition
- **cva**: The `class-variance-authority` library used for declarative variant mapping in shared components
- **Reference_Viewports**: The three viewport widths used to verify visual neutrality: 375px (mobile), 768px (tablet), 1280px (desktop)
- **Visual_Neutrality**: Identical rendered output at 100% browser zoom, default OS/browser text-size settings, at each of the three Reference_Viewports
- **Audit_Report**: A markdown document in `docs/audit/frontend-cleanliness/` recording findings for a specific audit area
- **Component_Playground**: A developer-only route at `/dev/playground` that renders all shared UI components with their variants
- **Snap_Threshold**: The 2px tolerance within which an arbitrary Tailwind value (e.g., `p-[14px]`) should be rounded to the nearest Tailwind scale step (e.g., `p-3.5`)

---

## Requirements

### Requirement 1: Dead Code Removal

**User Story:** As a developer, I want dead code and unused exports removed from the codebase, so that the remaining code is all actively referenced and the project is easier to navigate.

#### Acceptance Criteria

1. WHEN the Refactoring_Engine identifies an export, component, function, type, or file within `src/` that has zero static or dynamic import references across all project source files (including `src/`, `index.html`, and route configuration files), THE Refactoring_Engine SHALL remove it from the codebase
2. WHEN dead code is deleted, THE Refactoring_Engine SHALL verify removal via TypeScript compilation (zero new errors) before proceeding to the next removal
3. THE Refactoring_Engine SHALL NOT use any automated dead-code detection tools or install new packages for detection purposes
4. WHEN dead code is removed, THE Refactoring_Engine SHALL record each removal in the Audit_Report at `docs/audit/frontend-cleanliness/dead-code.md`, including: the file path, the removed export or symbol name, and the search method used to confirm zero references
5. WHEN a removal is performed, THE Refactoring_Engine SHALL ensure Visual_Neutrality is preserved at all three Reference_Viewports
6. IF a symbol is referenced only by test files and not by any application source file within `src/`, THEN THE Refactoring_Engine SHALL treat it as dead code and remove both the symbol and its associated test references

---

### Requirement 2: Duplication Consolidation

**User Story:** As a developer, I want duplicated code consolidated into shared abstractions, so that changes only need to be made in one place.

#### Acceptance Criteria

1. WHEN the Refactoring_Engine identifies two or more components or utility functions where at least 80% of the logic lines are identical or differ only in parameterizable values, THE Refactoring_Engine SHALL consolidate them into a single shared implementation that accepts parameters for the varying parts
2. WHEN duplication is consolidated, THE Refactoring_Engine SHALL migrate all call sites to use the shared implementation and verify zero new TypeScript compilation errors after each migration
3. THE Refactoring_Engine SHALL record each consolidation in the Audit_Report at `docs/audit/frontend-cleanliness/duplication.md`, listing original locations, the new shared location, and the parameterized differences between the originals
4. WHEN a consolidation is performed, THE Refactoring_Engine SHALL ensure Visual_Neutrality is preserved at all three Reference_Viewports
5. THE Refactoring_Engine SHALL NOT introduce new runtime dependencies for deduplication purposes
6. WHEN the Refactoring_Engine consolidates UI components, THE Refactoring_Engine SHALL place the shared implementation in `src/components/ui/`; WHEN consolidating utility functions, THE Refactoring_Engine SHALL place them in `src/lib/`

---

### Requirement 3: Component Library Creation

**User Story:** As a developer, I want a shared component library with variant support, so that all UI primitives are reusable, consistent, and centrally maintained.

#### Acceptance Criteria

1. THE Refactoring_Engine SHALL inventory all UI primitive patterns (buttons, inputs, cards, badges, modals, dropdowns, toggles) across `src/`, identifying each pattern that appears in 2 or more locations as a candidate for shared component extraction
2. THE Refactoring_Engine SHALL create shared components in `src/components/ui/` using cva for variant mapping and the cn_Helper for class composition
3. WHEN a shared component is created, THE Refactoring_Engine SHALL define: one visual variant per distinct visual treatment found in the inventory, at least 2 size variants (default and small as a minimum), and a `className` prop for consumer overrides
4. THE Refactoring_Engine SHALL migrate all ad-hoc instances of each primitive to use the corresponding shared component, where an ad-hoc instance is any inline or locally-defined markup that replicates the visual pattern of an inventoried primitive without importing the shared component
5. WHEN migrating an ad-hoc instance, THE Refactoring_Engine SHALL ensure Visual_Neutrality is preserved at all three Reference_Viewports
6. IF a primitive instance cannot be generalized into the shared component without altering its unique behavior or layout context, THEN THE Refactoring_Engine SHALL leave it in place and document the justification in the Audit_Report
7. THE Refactoring_Engine SHALL record the component inventory and migration status in the Audit_Report at `docs/audit/frontend-cleanliness/component-library.md`, including for each primitive: the component name, the number of ad-hoc instances found, the number migrated, and any instances intentionally excluded with justification

---

### Requirement 4: cn() Helper and tailwind-merge Setup

**User Story:** As a developer, I want a single utility for composing Tailwind classes that handles conditional application and conflict resolution, so that class strings are predictable and overridable.

#### Acceptance Criteria

1. THE Refactoring_Engine SHALL install `tailwind-merge` and `clsx` as runtime dependencies for composing the cn_Helper
2. THE Refactoring_Engine SHALL create a named export `cn()` function in `src/lib/utils.ts` that accepts variadic arguments of type `ClassValue` (strings, arrays, objects with boolean values, undefined, null, and false) and returns a single resolved class string by passing all arguments through `clsx` then `tailwind-merge`
3. WHEN a component uses any of the following patterns to compose class names — ternary expressions inside `className`, template literal interpolation of class segments, string concatenation of class fragments, or array-based class joining — THE Refactoring_Engine SHALL refactor that component to use the cn_Helper instead
4. THE Refactoring_Engine SHALL NOT refactor components that use only a single static `className` string literal with no conditional or dynamic segments
5. IF `clsx` or an equivalent conditional-class library is already present in `package.json` at the time of implementation, THEN THE Refactoring_Engine SHALL reuse the existing package rather than installing a duplicate
6. WHEN the cn_Helper is introduced in a component, THE Refactoring_Engine SHALL ensure Visual_Neutrality is preserved at all three Reference_Viewports (375px, 768px, 1280px)

---

### Requirement 5: Tailwind Utilization Audit

**User Story:** As a developer, I want all styling expressed as Tailwind utility classes, so that the styling approach is consistent and co-located with markup.

#### Acceptance Criteria

1. WHEN a component uses inline `style` attributes for properties expressible as Tailwind utilities, THE Refactoring_Engine SHALL convert them to equivalent Tailwind classes
2. WHEN a component uses raw CSS or CSS Modules for properties expressible as Tailwind utilities, THE Refactoring_Engine SHALL convert them to equivalent Tailwind classes and remove the migrated declarations from the source CSS file
3. WHEN repeated class strings consisting of 3 or more utility tokens appear identically in 3 or more component files, THE Refactoring_Engine SHALL extract them into a named constant or a shared component
4. THE Refactoring_Engine SHALL record all conversions in the Audit_Report at `docs/audit/frontend-cleanliness/tailwind-utilization.md`, with one entry per component file listing the properties converted and their Tailwind replacements
5. WHEN a conversion is performed, THE Refactoring_Engine SHALL ensure Visual_Neutrality is preserved at all three Reference_Viewports
6. IF a CSS property cannot be expressed as a standard Tailwind utility, THEN THE Refactoring_Engine SHALL use an arbitrary value (e.g., `bg-[#custom]`) and document the reason in the Audit_Report
7. IF a CSS file contains only CSS keyframe animations, custom properties, or declarations that have no Tailwind utility equivalent, THEN THE Refactoring_Engine SHALL leave that file unchanged and document it as out-of-scope in the Audit_Report
8. WHEN all Tailwind-expressible declarations have been migrated out of a CSS or CSS Module file leaving it empty, THE Refactoring_Engine SHALL delete the empty file and remove its import from the consuming component

---

### Requirement 6: Sizing Unit Conversion (px to Tailwind Scale)

**User Story:** As a developer, I want spacing, sizing, and typography values expressed in Tailwind's rem-based scale, so that the design system is proportional and consistent.

#### Acceptance Criteria

1. WHEN a component uses pixel values for spacing (margin, padding, gap) — whether in inline styles, CSS, or existing Tailwind arbitrary-value brackets (e.g., `p-[16px]`) — THE Refactoring_Engine SHALL convert them to the nearest Tailwind_Scale class
2. WHEN a component uses pixel values for sizing (width, height, min/max dimensions) — whether in inline styles, CSS, or existing Tailwind arbitrary-value brackets — THE Refactoring_Engine SHALL convert them to the nearest Tailwind_Scale class
3. WHEN a component uses pixel values for font-size or line-height, THE Refactoring_Engine SHALL convert them to separate Tailwind typography classes: a `text-*` class for font-size and a `leading-*` class for line-height, each mapped independently to its nearest scale step using the Snap_Threshold
4. THE Refactoring_Engine SHALL leave pixel values for borders, shadows, and rings unchanged
5. WHEN the nearest Tailwind scale step is within the 2px Snap_Threshold of the original pixel value, THE Refactoring_Engine SHALL use the standard scale class rather than an arbitrary value
6. WHEN the difference exceeds the 2px Snap_Threshold, THE Refactoring_Engine SHALL use a Tailwind arbitrary value (e.g., `p-[14px]`) and document it in the Audit_Report at `docs/audit/frontend-cleanliness/sizing-conversion.md`
7. IF a pixel value appears inside a `calc()` expression or references a CSS custom property, THEN THE Refactoring_Engine SHALL leave it unchanged and document it as an exception in the Audit_Report at `docs/audit/frontend-cleanliness/sizing-conversion.md`
8. WHEN a conversion is performed, THE Refactoring_Engine SHALL ensure Visual_Neutrality is preserved at all three Reference_Viewports

---

### Requirement 7: Responsiveness Audit and Fixes

**User Story:** As a developer, I want the application to render correctly at mobile, tablet, and desktop viewports, so that users on any device have a functional experience.

#### Acceptance Criteria

1. THE Refactoring_Engine SHALL verify every page and component at the three Reference_Viewports (375px, 768px, 1280px) by checking for: horizontal overflow, content truncation that hides information, overlapping elements, and touch target compliance
2. WHEN horizontal overflow is detected (element scrollWidth exceeds viewport width, producing a horizontal scrollbar) at any Reference_Viewport, THE Refactoring_Engine SHALL fix it using responsive Tailwind utilities
3. WHEN a touch target (button, link, interactive element) is smaller than 44×44px at the 375px viewport, THE Refactoring_Engine SHALL increase it to meet the 44×44px minimum using responsive Tailwind utilities so that the enlargement applies only at viewports below `md:` and the 1280px desktop viewport retains Visual_Neutrality
4. WHEN navigation links overflow the viewport, are visually hidden, or cannot be reached by vertical scrolling alone at the 375px viewport, THE Refactoring_Engine SHALL implement a collapsible navigation pattern (e.g., hamburger menu or expandable drawer) using responsive Tailwind utilities
5. THE Refactoring_Engine SHALL use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) for layout adaptation rather than CSS media queries
6. THE Refactoring_Engine SHALL record all responsiveness issues and fixes in the Audit_Report at `docs/audit/frontend-cleanliness/responsiveness.md`, including for each issue: the affected component or page, the viewport at which it was detected, a description of the problem, and the fix applied
7. WHEN a responsiveness fix is applied, THE Refactoring_Engine SHALL ensure that the 1280px desktop viewport retains Visual_Neutrality

---

### Requirement 8: Naming and Prop-Ordering Consistency

**User Story:** As a developer, I want consistent naming conventions and prop ordering across all components, so that the codebase is predictable and easy to read.

#### Acceptance Criteria

1. THE Refactoring_Engine SHALL ensure all component file names (files whose default export is a React component) use PascalCase matching the default export name
2. THE Refactoring_Engine SHALL ensure all hook files (files whose primary export is a function prefixed with `use`) use camelCase prefixed with `use` (e.g., `useAuth.ts`)
3. THE Refactoring_Engine SHALL ensure all utility/library files (files that do not export a React component or hook as their primary export) use kebab-case (e.g., `api-client.ts`)
4. WHEN a component declares props in its TypeScript interface or type, THE Refactoring_Engine SHALL order them as: identification props (`id`, `name`, `type`, `value`) first, then event handler props (props prefixed with `on` followed by an uppercase letter), then layout/style props (`style`, `hidden`, `aria-*`, and dimension/spacing-related props), then `className` last
5. WHEN a component renders JSX attributes, THE Refactoring_Engine SHALL order them as: `key`, `ref`, `className`, remaining props alphabetically, then event handlers (attributes prefixed with `on` followed by an uppercase letter) last
6. THE Refactoring_Engine SHALL ensure all exported types and interfaces use PascalCase
7. THE Refactoring_Engine SHALL record naming convention violations found and fixed in the Audit_Report at `docs/audit/frontend-cleanliness/naming-consistency.md`
8. WHEN a file rename or prop reordering is performed, THE Refactoring_Engine SHALL ensure Visual_Neutrality is preserved at all three Reference_Viewports
9. IF a file serves as a barrel/index re-export (e.g., `index.ts`), THEN THE Refactoring_Engine SHALL exempt it from the PascalCase/camelCase/kebab-case naming rules and leave it named `index.ts`

---

### Requirement 9: Component Playground

**User Story:** As a developer, I want a playground route where I can view all shared UI components with their variants, so that I can visually verify the component library without navigating the full application.

#### Acceptance Criteria

1. THE Refactoring_Engine SHALL create a route at `/dev/playground` that renders every exported component from `src/components/ui/` (initially: Button, FormField, LocaleSwitcher), each in its own labelled section identified by the component name
2. THE Refactoring_Engine SHALL display each component with every defined variant and size prop combination, rendering one instance per combination with a visible text label indicating the variant/size values used
3. THE Refactoring_Engine SHALL NOT install Storybook or any external component documentation tool
4. THE Refactoring_Engine SHALL register the `/dev/playground` route using the existing lazy-loading pattern (React.lazy with dynamic import) so that the playground module is code-split into a separate chunk
5. WHILE the application is built for production (i.e., `vite build` with `mode=production`), THE Refactoring_Engine SHALL ensure the playground route, its component, and all playground-only code are excluded from the production bundle by guarding the route registration behind an environment or mode check that is statically analyzable by the bundler
6. IF a new component is added to `src/components/ui/` but not yet added to the playground, THEN THE Refactoring_Engine SHALL still compile and render the playground with all previously registered components without error

---

### Requirement 10: Audit Report Deliverables

**User Story:** As a team lead, I want structured audit reports documenting all findings and changes, so that the refactoring work is traceable and reviewable.

#### Acceptance Criteria

1. THE Refactoring_Engine SHALL create audit reports in `docs/audit/frontend-cleanliness/` with one markdown file per audit area (dead-code, duplication, component-library, tailwind-utilization, sizing-conversion, responsiveness, naming-consistency), where each filename follows the pattern `{area-name}.md`
2. WHEN an audit area is completed, THE Refactoring_Engine SHALL include in the corresponding report: a summary of findings stating the total number of issues identified and resolved, a list of all changes made with file paths, before/after code snippets for changes affecting more than 3 lines of logic, and any items intentionally left unchanged with a one-sentence justification per item
3. WHEN responsiveness changes are made to a page, THE Refactoring_Engine SHALL include screenshots at the three Reference_Viewports (375px, 768px, 1280px) stored as PNG files in a `screenshots/` subdirectory alongside the relevant audit report, with filenames following the pattern `{page-name}-{viewport-width}px.png`
4. THE Refactoring_Engine SHALL maintain a top-level index file at `docs/audit/frontend-cleanliness/README.md` that links to all individual area reports and displays a completion status (complete or in-progress) for each audit area
5. WHEN all audit areas are completed, THE Refactoring_Engine SHALL include in the README.md index a summary section listing the total number of findings across all areas, the total number of changes applied, and the total number of items left unchanged

---

### Requirement 11: Dependency and Tooling Constraints

**User Story:** As a team lead, I want strict limits on new dependencies and tooling, so that the refactoring does not expand the project's dependency surface or introduce maintenance overhead.

#### Acceptance Criteria

1. THE Refactoring_Engine SHALL install at most two new runtime dependencies: `tailwind-merge` and `class-variance-authority` (cva)
2. THE Refactoring_Engine SHALL NOT add any new devDependencies beyond those already present in `package.json`
3. THE Refactoring_Engine SHALL NOT install any new linters, formatters, pre-commit hooks, or automated detection packages
4. THE Refactoring_Engine SHALL NOT modify the existing CI/CD configuration files (`.github/workflows/*.yml`), and SHALL limit Vite configuration changes exclusively to adding or adjusting route-level code-splitting entries for the playground route
5. IF a dependency is already present in `package.json` (such as `clsx` if added), THEN THE Refactoring_Engine SHALL reuse it rather than installing an alternative that provides equivalent functionality

---

### Requirement 12: Visual Neutrality Verification

**User Story:** As a product owner, I want confirmation that the refactoring does not alter the user-visible appearance, so that users experience no regression after deployment.

#### Acceptance Criteria

1. WHEN the Refactoring_Engine begins the refactoring work, THE Refactoring_Engine SHALL capture full-page screenshots of every routed page at each of the three Reference_Viewports (375px, 768px, 1280px) to serve as the visual baseline for comparison
2. THE Refactoring_Engine SHALL verify Visual_Neutrality by performing a side-by-side manual visual comparison of each affected page against the baseline screenshots at each of the three Reference_Viewports (375px, 768px, 1280px) after each category of change (dead code, component library, Tailwind, responsiveness, naming)
3. THE Refactoring_Engine SHALL perform all visual comparisons at 100% browser zoom with default OS/browser text-size settings using the same browser and version throughout the entire refactoring process
4. IF a change introduces any visible difference at the 1280px desktop viewport — including layout shifts of 1px or more, color changes, font rendering differences, or element visibility changes — THEN THE Refactoring_Engine SHALL revert the change and find an alternative approach that preserves Visual_Neutrality
5. THE Refactoring_Engine SHALL document verification results in `docs/audit/frontend-cleanliness/visual-neutrality.md` with one entry per refactoring category containing: the list of pages verified, pass/fail status per page per viewport, and a description of any deviation found and corrective action taken
6. WHEN responsiveness fixes add new layout behavior at the 375px or 768px viewports, THE Refactoring_Engine SHALL consider those additions acceptable deviations from Visual_Neutrality only at those specific smaller viewports, provided the 1280px desktop viewport remains visually identical to the baseline
