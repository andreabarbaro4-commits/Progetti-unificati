# Implementation Plan: Card Expand Transition

## Overview

Implement the expand/collapse animation for the WelcomeStep (index 4) in the RegistrationCarousel. The card grows from normal dimensions to cover the full viewport when arriving at WelcomeStep, and collapses back before advancing to RoleStep. TopNavigation animates into view after the collapse completes.

## Tasks

- [x] 1. Extend configuration and add ExpandState type
  - [x] 1.1 Add ExpandState type and extend CAROUSEL_CONFIG
    - Add `type ExpandState = 'idle' | 'expanding' | 'expanded' | 'collapsing'` in `RegistrationCarousel.tsx`
    - Extend `CAROUSEL_CONFIG` with `expandDuration: 500`, `collapseDuration: 400`, `topNavAnimDuration: 300`, `welcomeStepIndex: 4`
    - Add `expandState` and `showTopNav` state variables to the component
    - _Requirements: 1.1, 5.6, 6.1_

- [x] 2. Add expand/collapse CSS keyframes and classes
  - [x] 2.1 Add expanding, expanded, and collapsing CSS classes to RegistrationCarousel.css
    - Add `.carousel-card.expanding` with `position: fixed`, `z-index: 100`, and `card-expand` animation (500ms)
    - Add `.carousel-card.expanded` with `position: fixed`, full viewport dimensions, `border-radius: 0`
    - Add `.carousel-card.collapsing` with `position: fixed`, `z-index: 100`, and `card-collapse` animation (400ms)
    - Add `@keyframes card-expand` animating from 448×700px / border-radius 24px to 100vw×100vh / border-radius 0
    - Add `@keyframes card-collapse` animating from 100vw×100vh / border-radius 0 to 448×700px / border-radius 24px
    - Both keyframes use `transform: translate(-50%, -50%)` for center-origin positioning
    - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3_

  - [x] 2.2 Add TopNavigation entrance animation CSS
    - Add `.top-nav-wrapper` with `position: absolute`, `opacity: 0`, `transform: translateX(-50%) translateY(-20px)`, 300ms transitions
    - Add `.top-nav-wrapper.visible` with `opacity: 1`, `translateY(0)`
    - Set width to 448px (desktop)
    - _Requirements: 5.6, 7.4_

  - [x] 2.3 Add mobile responsive keyframes at 600px breakpoint
    - Override `@keyframes card-expand` starting from 95vw × 640px on mobile
    - Override `@keyframes card-collapse` ending at 95vw × 640px on mobile
    - Set `.top-nav-wrapper` width to 95vw on mobile
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Modify advance() to handle expand/collapse state machine
  - [x] 3.1 Implement expand logic when arriving at WelcomeStep (activeIndex === 3 advancing to 4)
    - Block advance if `expandState` is `expanding` or `collapsing`
    - Set `activeIndex` to 4 and `expandState` to `'expanding'`
    - Animate outgoing card (index 3) mask as normal left-fade
    - After `expandDuration` (500ms), set `expandState` to `'expanded'` and clear `transitioning.current`
    - Skip the normal mask animation for the incoming WelcomeStep card
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 6.1, 6.2_

  - [x] 3.2 Implement collapse logic when leaving WelcomeStep (activeIndex === 4, expandState === 'expanded')
    - Set `expandState` to `'collapsing'` and `transitioning.current = true`
    - After `collapseDuration` (400ms), set `expandState` to `'idle'`
    - Then perform normal advance from index 4 to 5 using existing mask transition logic
    - After normal transition completes, set `showTopNav` to true and clear `transitioning.current`
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6, 6.2_

  - [x] 3.3 Extract performNormalAdvance helper function
    - Refactor the existing advance logic (mask animations, setTimeout cleanup) into a reusable `performNormalAdvance(fromIndex, toIndex)` function
    - Use this helper for both normal transitions (steps 0–3, 5–6) and the post-collapse advance to step 5
    - _Requirements: 5.5_

- [x] 4. Update getCardClassName to handle expand states
  - [x] 4.1 Extend getCardClassName to return expand/collapse classes for WelcomeStep
    - When `index === welcomeStepIndex` and `expandState` is `'expanding'`, return `'carousel-card expanding'`
    - When `expandState` is `'expanded'`, return `'carousel-card expanded'`
    - When `expandState` is `'collapsing'`, return `'carousel-card collapsing'`
    - Fall through to existing logic for `'idle'` state
    - _Requirements: 1.1, 1.3, 5.1_

- [x] 5. Checkpoint - Verify expand/collapse animations work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Add disabled prop to WelcomeStep
  - [x] 6.1 Add disabled prop to WelcomeStep component
    - Add `disabled?: boolean` to `WelcomeStepProps` interface
    - Apply `disabled` attribute to the "CREATE PROFILE" button element
    - Add disabled styling: `disabled:opacity-40 disabled:cursor-not-allowed` Tailwind classes to the button
    - _Requirements: 6.3, 6.4_

  - [x] 6.2 Pass disabled prop from RegistrationCarousel to WelcomeStep
    - Pass `disabled={expandState === 'expanding'}` to the WelcomeStep component in the carousel render
    - _Requirements: 6.3, 6.4_

- [x] 7. Implement TopNavigation conditional rendering and entrance animation
  - [x] 7.1 Add TopNavigation rendering with entrance animation to RegistrationCarousel
    - Render TopNavigation inside a `.top-nav-wrapper` div only when `showTopNav` is true
    - Add a `topNavVisible` state flag, set to true after a requestAnimationFrame delay when `showTopNav` becomes true (to trigger CSS transition)
    - Apply the `visible` class based on `topNavVisible` state
    - Position the wrapper inside `.carousel-viewport` so it appears above the card track
    - _Requirements: 5.6, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8. Handle cleanup and edge cases
  - [x] 8.1 Add cleanup for setTimeout references on unmount
    - Store setTimeout IDs in refs for the expand/collapse timers
    - Clear all timeout refs in the existing useEffect cleanup function
    - _Requirements: 1.5 (resize resilience), error handling (component unmount)_

- [x] 9. Final checkpoint - Verify complete integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 10. Write unit tests for expand state machine
  - [ ]* 10.1 Write unit tests for getCardClassName with expand states
    - Test that `getCardClassName(4, 'expanding')` returns `'carousel-card expanding'`
    - Test that `getCardClassName(4, 'expanded')` returns `'carousel-card expanded'`
    - Test that `getCardClassName(4, 'collapsing')` returns `'carousel-card collapsing'`
    - Test that `getCardClassName(4, 'idle')` falls through to normal logic
    - _Requirements: 1.1, 5.1_

  - [ ]* 10.2 Write unit tests for advance blocking during expand/collapse states
    - Test that `advance()` is a no-op when `expandState === 'expanding'`
    - Test that `advance()` is a no-op when `expandState === 'collapsing'`
    - Test that `advance()` triggers collapse when `expandState === 'expanded'` and `activeIndex === 4`
    - _Requirements: 6.1, 6.2_

  - [ ]* 10.3 Write unit tests for WelcomeStep disabled prop
    - Test that button is disabled when `disabled={true}`
    - Test that button is enabled when `disabled={false}` or undefined
    - Test that disabled button has correct styling classes
    - _Requirements: 6.3, 6.4_

  - [ ]* 10.4 Write unit tests for TopNavigation conditional rendering
    - Test that TopNavigation is not rendered when `showTopNav === false`
    - Test that TopNavigation is rendered when `showTopNav === true`
    - Test that `.top-nav-wrapper` receives `visible` class when `topNavVisible === true`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The design explicitly states property-based testing does not apply to this feature (UI animation concern)
- The implementation uses TypeScript + React with existing Tailwind CSS utilities and plain CSS for animations
- All animation timing values come from CAROUSEL_CONFIG for easy tuning

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "6.1"] },
    { "id": 2, "tasks": ["3.3", "4.1", "6.2"] },
    { "id": 3, "tasks": ["3.1", "3.2"] },
    { "id": 4, "tasks": ["7.1", "8.1"] },
    { "id": 5, "tasks": ["10.1", "10.2", "10.3", "10.4"] }
  ]
}
```
