# Implementation Plan: Animated Background

## Overview

Port the animated floating blob background from the demo application into the production frontend as a self-contained React component. The implementation creates `AnimatedBackground.tsx` and `AnimatedBackground.css`, integrates the component at the app root level inside `ErrorBoundary`, and removes the old per-step gradient backgrounds from `CompanySettingsStep.tsx` and `App.css`.

## Tasks

- [x] 1. Create AnimatedBackground component and CSS
  - [x] 1.1 Create `src/components/AnimatedBackground/AnimatedBackground.css` with keyframe animations and reduced-motion media query
    - Define `@keyframes blob-drift-1` through `blob-drift-6` (ported from demo)
    - Add `@media (prefers-reduced-motion: reduce)` rule that sets `.blob` animation-duration to `0.01ms` and iteration-count to `1`
    - _Requirements: 2.4, 2.5, 3.3, 4.1, 4.5_

  - [x] 1.2 Create `src/components/AnimatedBackground/AnimatedBackground.tsx` component
    - Export `AnimatedBackground` function component accepting `visible?: boolean` prop (default `true`)
    - Render a container `div` with `aria-hidden="true"`, `position: fixed`, `inset: 0`, `width: 100vw`, `height: 100vh`, `z-index: -1`, `pointer-events: none`, `overflow: hidden`
    - Control visibility via `visibility: visible/hidden` based on `visible` prop
    - Render 8 blob child `div` elements with inline styles for position, size, gradient, blur, border-radius, and animation (per design blob table)
    - Each blob gets `will-change: transform` and a CSS class `blob blob-N`
    - Import `AnimatedBackground.css`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.7, 3.1, 3.2, 3.4, 4.2, 5.1, 5.2, 5.4, 5.5_

- [x] 2. Integrate component into app shell
  - [x] 2.1 Add `<AnimatedBackground />` to `App.tsx` inside `ErrorBoundary`, before `SessionExpiredNotification` and other children
    - Import from `./components/AnimatedBackground/AnimatedBackground`
    - Place as the first child inside `<ErrorBoundary>` so it renders behind all content
    - _Requirements: 1.4, 5.3_

- [x] 3. Remove old background styles
  - [x] 3.1 Remove the inline radial-gradient overlay `div` from `CompanySettingsStep.tsx`
    - Remove the absolute-positioned `<div>` with `radial-gradient`, `filter: blur(120px)`, and `zIndex: 0`
    - Keep the modal container and its content intact
    - _Requirements: 6.1_

  - [x] 3.2 Remove old gradient rules from `App.css`
    - Remove `background-image: radial-gradient(...)` from `.container-sfondo` base class
    - Remove `.container-sfondo.schermata-con-sfondo` background override (`background: #000 !important; background-image: none !important;`)
    - Remove `.container-sfondo.schermata-con-sfondo::before` pseudo-element gradient
    - Remove `.container-sfondo.schermata-con-sfondo::after` pseudo-element gradient
    - _Requirements: 6.2, 6.3_

- [x] 4. Checkpoint - Verify integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Write unit tests
  - [x]* 5.1 Write unit tests for AnimatedBackground component
    - Create `src/components/AnimatedBackground/AnimatedBackground.test.tsx`
    - Test: renders with `aria-hidden="true"` on container
    - Test: renders exactly 8 blob child divs
    - Test: container has `pointer-events: none`
    - Test: no focusable elements inside the component (no tabindex, links, buttons)
    - Test: `visible={false}` sets `visibility: hidden` and DOM node stays mounted
    - Test: default render (no prop) shows blobs visible
    - Test: container has `position: fixed` and `inset: 0` (or equivalent)
    - Test: container has `overflow: hidden`
    - _Requirements: 3.1, 3.2, 3.4, 5.2, 5.5, 1.1, 1.2, 1.3_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design uses TypeScript (React + Vite), matching the existing project stack
- Checkpoints ensure incremental validation
- Unit tests use Vitest + React Testing Library (already configured in the project)
- The `CompanySettingsStep.tsx` removal only targets the decorative gradient overlay div; the modal structure remains unchanged
- Onboarding cards already have `background: rgba(255, 255, 255, 0.75)` with `backdrop-filter: blur(20px)` which maintains text contrast (Requirement 6.4)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1", "3.2"] },
    { "id": 2, "tasks": ["5.1"] }
  ]
}
```
