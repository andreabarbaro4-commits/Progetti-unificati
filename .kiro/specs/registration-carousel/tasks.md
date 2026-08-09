# Implementation Plan: Registration Carousel

## Overview

Refactor the onboarding registration flow into a CSS-transform-based horizontal carousel. The implementation is incremental: first the carousel infrastructure, then adapting existing steps, then polish (indicator, responsive, transitions).

## Tasks

- [x] 1. Create carousel infrastructure
  - [x] 1.1 Create `RegistrationCarousel.tsx` component with viewport, track, and activeIndex state
    - Create `src/features/onboarding/components/RegistrationCarousel.tsx`
    - Implement the viewport container (`overflow: hidden`, centered)
    - Implement the track div that holds 9 card slots
    - Manage `activeIndex` state (0–8) with an `advance` function
    - Guard against double-advance during transitions with a `useRef` flag
    - Accept `onComplete` prop called when user completes step 9
    - Render each registration step inside a `.carousel-card` wrapper
    - Pass `onNext={advance}` to each step (and `onComplete` to step 9)
    - _Requirements: 1.1, 1.3, 1.4, 3.1, 3.2_

  - [x] 1.2 Create `RegistrationCarousel.css` with carousel layout and animation styles
    - Create `src/features/onboarding/components/RegistrationCarousel.css`
    - `.carousel-viewport`: overflow hidden, centered, full width
    - `.carousel-track`: flexbox row, transition on transform (400ms ease)
    - `.carousel-card`: fixed width (450px), fixed height (640px), flex-shrink 0, overflow-y auto
    - Adjacent card styles: reduced opacity (0.4), scale(0.92) via CSS classes
    - Responsive media query: hide adjacent shadows on narrow viewports
    - _Requirements: 1.2, 2.5, 5.4, 7.1, 7.2_

  - [x] 1.3 Create `StepIndicator.tsx` component
    - Create `src/features/onboarding/components/StepIndicator.tsx`
    - Accept `total` and `current` props
    - Render a row of dot elements
    - Apply active styling to the dot at index `current`
    - Style dots inline or via a small CSS class in RegistrationCarousel.css
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Refactor OnboardingWizard to use the carousel
  - [x] 2.1 Refactor `OnboardingWizard.tsx` to delegate registration steps to RegistrationCarousel
    - Replace the `Step` type state with a `Phase` state (`'registration' | 'org-type' | 'org-details' | 'company-settings' | 'done'`)
    - During `'registration'` phase, render `<RegistrationCarousel onComplete={() => setPhase('org-type')} />`
    - During org phases, render OrgTypeStep / OrgDetailsStep / CompanySettingsStep as before
    - Pass `selectedRole` / `setSelectedRole` into the carousel or lift to a shared store if needed
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 2.2 Adapt step components (1–9) to work inside carousel cards
    - Each step already renders a `<div className="Step">` with the logo, form, and button
    - Ensure the `.Step` class inside `.carousel-card` fills height properly (flex-grow, justify-content)
    - Verify that the logo remains at top and submit button at bottom within fixed height
    - Handle the `RoleStep` and `JobStep` that need `selectedRole` state — pass through RegistrationCarousel
    - Handle `PhotoUploadStep` / `PhotoUploadedStep` which share a component with a `hasPhoto` flag
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Adjacent card shadows and visual polish
  - [x] 4.1 Implement adjacent card shadow visibility logic
    - Apply `.adjacent-left` / `.adjacent-right` classes to cards at `activeIndex - 1` and `activeIndex + 1`
    - These classes set opacity and scale
    - Cards further away get `visibility: hidden` or `opacity: 0` to avoid rendering all 9
    - On first card: no left shadow; on last card: no right shadow
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.2 Implement responsive behavior for mobile viewports
    - Add media query (max-width: 600px) that hides adjacent shadows
    - Scale `.carousel-card` width to 95% of viewport on mobile
    - Adjust card height or allow more vertical scroll on small screens
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 5. Write tests
  - [ ]* 5.1 Write unit tests for RegistrationCarousel
    - Test that all 9 cards are rendered in the DOM
    - Test that advancing updates the transform translateX value
    - Test that advancing past step 9 calls onComplete
    - Test that double-advance during transition is prevented
    - _Requirements: 1.1, 3.1, 3.2_

  - [ ]* 5.2 Write unit tests for StepIndicator
    - Test that 9 dots are rendered
    - Test that the correct dot has the active class
    - Test that updating `current` moves the active class
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 5.3 Write unit tests for adjacent card shadow logic
    - Test that first card has no left shadow
    - Test that last card has no right shadow
    - Test that middle cards have both shadows
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- No external carousel or animation library is added — pure CSS transforms + transitions
- Step components remain mostly unchanged; they are wrapped by the carousel, not rewritten
- The `selectedRole` state currently lives in OnboardingWizard — it will be passed through RegistrationCarousel to RoleStep/JobStep

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["4.1", "4.2"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3"] }
  ]
}
```
