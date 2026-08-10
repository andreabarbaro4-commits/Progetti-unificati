# Implementation Plan: Company Creation Wizard

## Overview

Replace the current company creation flow (org-type → org-details → company-settings) with a vertical carousel layout. The implementation follows the existing `RegistrationCarousel` pattern (CSS transforms + JS mask animations) but oriented vertically. A new `VerticalCarouselWizard` wraps the three existing step components, a fixed `TopNavigationBar` is decoupled from card content, and a dedicated Zustand store manages carousel state.

## Tasks

- [x] 1. Create Zustand store and configuration constants
  - [x] 1.1 Create `useCompanyWizardStore` in `src/features/onboarding/useCompanyWizardStore.ts`
    - Define `CompanyWizardStore` interface with `activeStep`, `isTransitioning`, `formData`, and actions
    - Persist to sessionStorage under key `flowlee-company-wizard`
    - Handle sessionStorage corruption with fallback to defaults
    - _Requirements: 1.6, 6.6, 5.1_

  - [x] 1.2 Create `verticalCarouselConfig.ts` in `src/features/onboarding/components/`
    - Define `VERTICAL_CAROUSEL_CONFIG` constants (offsets, timing, breakpoints, ratios)
    - Define `WIZARD_STEPS` configuration array with ids and labels
    - Export `CardDimensions` interface and dimension calculation utility function
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3_

- [x] 2. Implement BackgroundDecorations component
  - [x] 2.1 Create `BackgroundDecorations.tsx` in `src/features/onboarding/components/`
    - Render two decorative planet/ellipse SVG elements
    - Position one in top-right corner, one in bottom-right corner
    - Set z-index below all interactive elements
    - Use absolute/fixed positioning
    - _Requirements: 5.4_

- [x] 3. Implement TopNavigationBar component
  - [x] 3.1 Create `TopNavigationBar.tsx` in `src/features/onboarding/components/`
    - Accept `activeStep`, `totalSteps`, `stepLabels`, `onBack`, `onForward`, `isTransitioning` props
    - Render up/down navigation arrows, step label (`"{label} / {index+1}"`), Flowlee logo centered, user avatar right
    - Position fixed at top of viewport with ~78px top offset
    - _Requirements: 2.1, 2.2, 5.1_

  - [x] 3.2 Implement navigation arrow disable logic
    - Disable up arrow (muted opacity + non-interactive) when `activeStep === 0`
    - Disable down arrow (muted opacity + non-interactive) when `activeStep === totalSteps - 1`
    - Disable both arrows while `isTransitioning === true`
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

  - [x] 3.3 Implement step label updates
    - Update label text within 1 frame of transition completing
    - _Requirements: 2.7_

  - [x] 3.4 Implement responsive behavior for TopNavigationBar
    - Reduce horizontal padding to 16px below 768px viewport
    - Ensure arrow touch targets are at least 44×44px on mobile
    - _Requirements: 4.2_

- [x] 4. Implement VerticalCarousel engine
  - [x] 4.1 Create `VerticalCarousel.tsx` and `VerticalCarousel.css` in `src/features/onboarding/components/`
    - Render a vertical track container with `translateY`-based positioning
    - Accept `activeStep`, `onAdvance`, `onBack`, and `children` props
    - Manage `transitioning` ref, `cardRefs`, and `animFrameRef` for mask animations
    - _Requirements: 1.1, 1.6_

  - [x] 4.2 Implement card state logic (active, peek, above, hidden)
    - Active card: fully visible and interactive
    - Peek card: top 80px visible below active card with gradient fade mask (top-to-bottom, 50% opacity to transparent)
    - Above cards: translated above viewport, pointer-events disabled
    - Hidden cards: visibility hidden
    - No peek card when active step is last step
    - _Requirements: 1.3, 1.7, 1.8_

  - [x] 4.3 Implement vertical transition animations
    - On advance: animate active card upward, bring next card from below (500ms, cubic-bezier(0.4, 0, 0.2, 1))
    - On back: animate active card downward, bring previous card from above (same timing)
    - Synchronize content opacity fade (out 1→0, in 0→1) with translateY movement
    - Disable user interaction on both cards during 500ms transition
    - _Requirements: 1.2, 1.4, 1.5, 5.5_

  - [x] 4.4 Implement JS mask animations (requestAnimationFrame)
    - Animate gradient mask intensity on outgoing/incoming cards (mirroring RegistrationCarousel pattern)
    - Clear inline styles after transition completes so CSS classes take over
    - Cancel animation frames on unmount
    - _Requirements: 1.3, 5.5_

  - [x] 4.5 Implement card container styling (`VerticalCarouselCard`)
    - Max width: `min(viewport * 0.887, 1341px)`, min 288px
    - Min height: 536px, expanding for content without internal scrollbars
    - Border-radius: 24px, box-shadow: `0px 4px 40px rgba(0, 0, 0, 0.1)`
    - Padding: 40px horizontal, 32px vertical
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_

  - [x] 4.6 Implement responsive behavior for carousel
    - Below 768px: hide peek card, card width 95% of viewport, padding 20px/24px, border-radius 16px
    - Recalculate dimensions on resize within 150ms
    - Defer recalculation if resize occurs during transition, apply after transition completes
    - _Requirements: 4.1, 4.3, 4.4, 3.5_

- [x] 5. Checkpoint - Ensure carousel mechanics work in isolation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Refactor step components to remove embedded TopNavigation and container styling
  - [x] 6.1 Refactor `OrgTypeStep` to remove `TopNavigation` and `Card variant="wide"` wrapper
    - Remove `TopNavigation` import and render
    - Remove `Card` wrapper — step content renders directly as carousel card child
    - Keep all business logic (Company/Freelance buttons, `onNext` callback)
    - _Requirements: 6.1_

  - [x] 6.2 Refactor `OrgDetailsStep` to remove `TopNavigation` and `Card variant="wide"` wrapper
    - Remove `TopNavigation` import and render
    - Remove `Card` wrapper
    - Keep form validation, team size pricing, all fields, and `onBack`/`onNext` callbacks
    - _Requirements: 6.2, 6.5_

  - [x] 6.3 Refactor `CompanySettingsStep` to remove full-page container styling
    - Remove `fixed inset-0 w-screen h-screen bg-black` outer container
    - Keep sidebar, logo placeholder, and form with all validation logic
    - Adjust styling so the component renders inside the carousel card container
    - _Requirements: 6.3_

- [x] 7. Create VerticalCarouselWizard orchestrator and wire into OnboardingWizard
  - [x] 7.1 Create `VerticalCarouselWizard.tsx` in `src/features/onboarding/components/`
    - Compose `TopNavigationBar`, `BackgroundDecorations`, and `VerticalCarousel`
    - Accept `onComplete` prop, called when last step saves successfully
    - Read `activeStep` from `useCompanyWizardStore`, pass to nav bar and carousel
    - Provide `onAdvance` and `onBack` callbacks wired to store
    - _Requirements: 1.6, 2.1, 5.4_

  - [x] 7.2 Wire step components into VerticalCarousel as children
    - Render `OrgTypeStep`, `OrgDetailsStep`, `CompanySettingsStep` as carousel children
    - Connect step callbacks: OrgType selection → advance, OrgDetails submit → advance, CompanySettings save → `onComplete`
    - Ensure back navigation on OrgDetailsStep preserves entered form data
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

  - [x] 7.3 Update `OnboardingWizard.tsx` to render `VerticalCarouselWizard`
    - Replace the individual `OrgTypeStep`, `OrgDetailsStep`, `CompanySettingsStep` phase cases
    - Render `VerticalCarouselWizard` for all three org phases with `onComplete={() => setPhase('done')}`
    - Keep `RegistrationCarousel` rendering for `registration` phase unchanged
    - _Requirements: 6.4_

- [x] 8. Implement visual positioning matching Figma specification
  - [x] 8.1 Apply precise Figma positioning values
    - TopNavigationBar: 78px from viewport top (at 1512px reference)
    - Active card: 223px from viewport top (at 1512px reference)
    - Peek card: 799px from viewport top (at 1512px reference)
    - Scale offsets proportionally for other viewport widths
    - _Requirements: 5.1, 5.2, 5.3, 5.6_

- [x] 9. Checkpoint - Full wizard integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Write unit and integration tests
  - [ ]* 10.1 Write unit tests for `useCompanyWizardStore`
    - Test initial state, `setActiveStep`, `setTransitioning`, form data persistence
    - Test sessionStorage persistence and corruption fallback
    - _Requirements: 1.6, 6.6_

  - [ ]* 10.2 Write unit tests for `VerticalCarousel` state logic
    - Test card state assignment (active, peek, above, hidden)
    - Test transition guard prevents double-advance
    - Test resize during transition is deferred
    - _Requirements: 1.5, 4.4_

  - [ ]* 10.3 Write unit tests for `TopNavigationBar`
    - Test up arrow disabled on first step
    - Test down arrow disabled on last step
    - Test step label displays correctly for each step
    - Test arrows disabled during transitions
    - _Requirements: 2.5, 2.6, 2.7_

  - [ ]* 10.4 Write unit tests for card dimension calculations
    - Test: viewport 1512px → width 1341px
    - Test: viewport 900px → width ~798px
    - Test: viewport 320px → width clamped at 288px
    - Test: mobile breakpoint hides peek card
    - _Requirements: 3.1, 3.5, 3.7, 4.1_

  - [ ]* 10.5 Write integration tests for full wizard flow
    - Test happy path: OrgType selection → OrgDetails form → CompanySettings save → onComplete
    - Test back navigation preserves form data
    - Test form validation blocks advancement
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The existing `RegistrationCarousel` pattern (CSS transforms + JS mask via requestAnimationFrame) is the reference implementation for the animation approach
- Step component refactoring (task 6) must be done before wiring into the wizard (task 7) to avoid rendering conflicts
- The `useCompanyWizardStore` is separate from `useOnboardingStore` — the phase store manages entry/exit, the wizard store manages internal step index

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1"] },
    { "id": 1, "tasks": ["3.1", "4.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "4.2", "4.5"] },
    { "id": 3, "tasks": ["4.3", "4.4", "4.6"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.2", "8.1"] },
    { "id": 7, "tasks": ["7.3"] },
    { "id": 8, "tasks": ["10.1", "10.2", "10.3", "10.4"] },
    { "id": 9, "tasks": ["10.5"] }
  ]
}
```
