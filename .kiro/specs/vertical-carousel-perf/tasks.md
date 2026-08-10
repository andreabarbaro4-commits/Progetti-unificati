# Implementation Plan: Vertical Carousel Performance Optimization

## Overview

Migrate the VerticalCarousel's transition animations from layout-triggering properties (`top`, per-frame `mask-image`, per-frame `opacity`) to compositor-friendly properties (`transform: translateY`, CSS pseudo-element opacity, CSS content opacity). All changes are in three files: `VerticalCarousel.css`, `VerticalCarousel.tsx`, and `VerticalCarouselCard.tsx`. Tasks are ordered for safe incremental delivery — each task produces a working carousel.

## Tasks

- [x] 1. Add CSS infrastructure
  - [x] 1.1 Add transform-based positioning, layer promotion, pseudo-element overlays, and utility classes to VerticalCarousel.css
    - Add `will-change: transform` to `.vertical-carousel-card`
    - Change `transform: translateX(-50%)` to `transform: translateX(-50%) translateY(var(--card-y, 0px))` and add `transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1)`
    - Add `::before` pseudo-element with `linear-gradient(to top, transparent, rgba(255,255,255,1))`, `opacity: 0`, and `transition: opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)`
    - Add `::after` pseudo-element with `linear-gradient(to bottom, transparent, rgba(255,255,255,1))`, `opacity: 0`, and `transition: opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)`
    - Add `.mask-top` class that sets `::before { opacity: 1 }`
    - Add `.mask-bottom` class that sets `::after { opacity: 1 }`
    - Add `.content-hidden` class that sets `> * { opacity: 0 }`
    - Add `.transitioning` class that sets `> * { transition: opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) }`
    - Override `.hidden-card` with `will-change: auto`
    - _Requirements: 2.1, 2.2, 3.3, 4.3, 8.1, 8.2_

- [x] 2. Switch from `top` to `transform: translateY`
  - [x] 2.1 Update VerticalCarousel.tsx render to use CSS custom property `--card-y` instead of inline `top`
    - Replace `style={{ top: \`${top / 16}rem\` }}` with `style={{ '--card-y': \`${top}px\` } as React.CSSProperties}`
    - Remove the existing `transform: translateX(-50%)` from the CSS `.vertical-carousel-card` rule (now handled by the combined transform declaration added in Task 1)
    - Verify cards render at the same positions as before
    - _Requirements: 1.1, 1.2, 1.3, 5.1_

  - [x] 2.2 Update transition useEffect to animate `--card-y` instead of `style.top`
    - Change outgoing card animation: set `--card-y` to exit position (the CSS transition on `transform` handles the animation)
    - Change incoming card animation: set `transition: none` on the element, set `--card-y` to start position, force reflow, then remove `transition: none` and set `--card-y` to final position
    - Update the cleanup setTimeout to clear `--card-y` or leave it at resting position
    - Remove all `style.top` manipulations in the transition useEffect
    - _Requirements: 1.1, 1.4, 5.4, 5.5, 6.3, 8.1_

- [x] 3. Replace JS mask animation with CSS classes
  - [x] 3.1 Remove `animateMask` callback and `animFrameRef`, use CSS class-based mask transitions
    - Delete the entire `animateMask` useCallback
    - Delete the `animFrameRef` ref declaration
    - Remove the `cancelAnimationFrame` cleanup in the unmount useEffect
    - In the transition useEffect, replace `animateMask(outgoingIndex, 'top', 0, 1, ...)` with adding `.mask-top` class to the outgoing card ref
    - Replace `animateMask(outgoingIndex, 'bottom', 0, 1, ...)` with adding `.mask-bottom` class to the outgoing card ref
    - Replace `animateMask(incomingIndex, 'bottom', 1, 0, ...)` with removing `.mask-bottom` class (if present) from the incoming card ref
    - Replace `animateMask(incomingIndex, 'top', 1, 0, ...)` with removing `.mask-top` class (if present) from the incoming card ref
    - Remove the new-peek-card inline mask-image assignment (the peek card's CSS resting state handles this)
    - In the cleanup setTimeout, remove `.mask-top` and `.mask-bottom` classes from all affected cards and clear any inline `mask-image`/`webkitMaskImage` styles
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.2, 8.4_

- [x] 4. Replace JS content opacity with CSS transitions
  - [x] 4.1 Use `.content-hidden` and `.transitioning` classes instead of direct `content.style.opacity` manipulation
    - In the transition useEffect: add `.content-hidden` and `.transitioning` to outgoing card (content fades to 0 via CSS)
    - Add `.transitioning` to incoming card and ensure `.content-hidden` is NOT present (content fades to 1 via CSS)
    - Remove all `content.style.opacity` lines from the transition useEffect and cleanup setTimeout
    - In the cleanup setTimeout: remove `.content-hidden` and `.transitioning` classes from both cards
    - Verify peek card content stays hidden via its existing `.peek-card > * { opacity: 0 }` CSS rule
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.2_

- [x] 5. Cleanup and verification
  - [x] 5.1 Remove dead code and verify all transitions work correctly
    - Remove any remaining references to `animFrameRef`
    - Remove any remaining inline `mask-image`, `webkitMaskImage`, or `content.style.opacity` manipulations
    - Verify the unmount cleanup only clears `transitionTimerRef` (no more `animFrameRef`)
    - Confirm `transitioning` ref guard still works correctly for double-tap prevention
    - Verify the advance transition: active card slides up with top-fade mask, incoming slides up from peek with content fade-in
    - Verify the back transition: active card slides down with bottom-fade mask, incoming slides down from above with content fade-in
    - Verify responsive behavior: peek card hidden on mobile (<768px), card padding/border-radius adjustments still apply
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 6.1, 6.2, 7.1, 7.2, 7.3_

- [x] 6. Final checkpoint
  - Ensure no TypeScript errors, all transitions look identical to before, and no layout/paint during animations in DevTools. Ask the user if questions arise.

## Notes

- All tasks modify only 3 files: `VerticalCarousel.css`, `VerticalCarousel.tsx`, and `VerticalCarouselCard.tsx`
- Each task produces a working carousel — if stopped mid-way, the carousel still functions
- The imperative ref-based class manipulation style matches the existing codebase pattern
- No new component props are introduced — all orchestration is via direct DOM class manipulation on card refs
- The `getCardTop()` and `calculateCardDimensions()` functions remain completely unchanged
- Property-based testing is not applicable here (CSS rendering/GPU compositing behavior)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["3.1", "4.1"] },
    { "id": 4, "tasks": ["5.1"] }
  ]
}
```
