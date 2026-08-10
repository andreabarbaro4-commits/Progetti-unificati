# Requirements Document

## Introduction

This spec defines performance optimization requirements for the VerticalCarousel component's card transition animations in the signup/onboarding flow. The current implementation animates the CSS `top` property (triggering layout recalculation every frame) and uses a JavaScript `requestAnimationFrame` loop to recompute `mask-image` gradient strings per frame (triggering style recalc + repaint). The goal is to achieve smooth 60fps transitions by migrating all animations to compositor-friendly properties (`transform`, `opacity`) without changing the visual layout or behavior.

## Glossary

- **Carousel**: The `VerticalCarousel` React component that manages vertical card-to-card transitions during the onboarding wizard flow.
- **Card**: A `VerticalCarouselCard` element representing one step in the wizard. Cards have states: active, peek, above, hidden.
- **Compositor**: The browser's GPU-accelerated compositing layer that can animate `transform` and `opacity` without triggering layout or paint.
- **Layout_Thrash**: When CSS properties that affect geometry (e.g. `top`, `left`, `width`) are animated, forcing the browser to recalculate layout every frame.
- **Mask_Animation**: The gradient fade effect applied to outgoing and peek cards to create a smooth visual transition between steps.
- **Content_Fade**: The opacity transition applied to card children (form content) during step transitions.
- **Peek_Card**: The partially visible next-step card shown below the active card, indicating there is a next step.
- **Transition_Duration**: The 500ms animation duration defined in `verticalCarouselConfig.ts`.
- **Easing_Function**: The `cubic-bezier(0.4, 0, 0.2, 1)` timing function used for all transition animations.

## Requirements

### Requirement 1: Transform-based Card Positioning

**User Story:** As a user, I want card transitions to be visually smooth, so that the onboarding flow feels polished and responsive.

#### Acceptance Criteria

1. WHEN a card transition is triggered, THE Carousel SHALL animate card vertical position using `transform: translateY()` instead of the `top` CSS property
2. THE Carousel SHALL compute the same pixel offsets currently produced by `getCardTop()` and apply them as `translateY` values
3. WHEN the transition completes, THE Carousel SHALL maintain the final card positions identical to the current implementation
4. IF a transition is triggered while viewport dimensions change, THEN THE Carousel SHALL recalculate translateY values based on current dimensions

### Requirement 2: GPU Layer Promotion

**User Story:** As a user on a mid-range device, I want animations to not stutter, so that the experience feels native.

#### Acceptance Criteria

1. THE Carousel SHALL apply `will-change: transform` to all card elements that participate in transitions
2. WHEN a card is in the hidden state, THE Carousel SHALL not promote it to a compositing layer to avoid unnecessary memory use
3. THE Carousel SHALL ensure promoted layers do not exceed the number of visible/transitioning cards at any time

### Requirement 3: CSS-driven Content Opacity

**User Story:** As a user, I want card content to fade in and out smoothly during transitions, so that text doesn't abruptly appear or disappear.

#### Acceptance Criteria

1. WHEN a card becomes active, THE Carousel SHALL fade its content from opacity 0 to 1 using a CSS transition
2. WHEN a card transitions away from active state, THE Carousel SHALL fade its content from opacity 1 to 0 using a CSS transition
3. THE Carousel SHALL use the same Transition_Duration (500ms) and Easing_Function for content opacity transitions as for position transitions
4. THE Carousel SHALL not use JavaScript `requestAnimationFrame` loops to animate content opacity

### Requirement 4: Compositor-friendly Mask Effects

**User Story:** As a user, I want the gradient fade effects on outgoing and peek cards to animate smoothly without frame drops.

#### Acceptance Criteria

1. WHEN a card transitions out (advance direction), THE Carousel SHALL produce a top-to-bottom fade effect equivalent to the current `mask-image` gradient animation
2. WHEN a card transitions out (back direction), THE Carousel SHALL produce a bottom-to-top fade effect equivalent to the current `mask-image` gradient animation
3. THE Carousel SHALL implement mask fade effects using CSS transitions on `opacity` of overlay or pseudo-elements rather than per-frame JavaScript `mask-image` string computation
4. THE Carousel SHALL not invoke `requestAnimationFrame` for mask gradient updates during transitions
5. WHILE the Peek_Card is in its resting state, THE Carousel SHALL display it with the same reduced opacity and visual treatment as the current implementation

### Requirement 5: Visual Fidelity Preservation

**User Story:** As a product owner, I want the optimized transitions to look identical to the current ones, so that the design intent is preserved.

#### Acceptance Criteria

1. THE Carousel SHALL position cards at the same pixel offsets as the current `getCardTop()` function produces
2. THE Carousel SHALL preserve the peek card's vertical offset, reduced opacity (0.3), and hidden content in its resting state
3. THE Carousel SHALL preserve the active card's full opacity and visible content in its resting state
4. THE Carousel SHALL maintain the same Transition_Duration of 500ms for all animation phases
5. THE Carousel SHALL maintain the same Easing_Function `cubic-bezier(0.4, 0, 0.2, 1)` for all transitions
6. THE Carousel SHALL preserve the current card dimensions, border-radius, padding, and box-shadow

### Requirement 6: Timing and Interaction Preservation

**User Story:** As a user, I want the step navigation to feel the same as before, so that my muscle memory is preserved.

#### Acceptance Criteria

1. WHILE a transition is in progress, THE Carousel SHALL ignore additional advance or back requests (guard against double-tap)
2. WHEN a transition completes, THE Carousel SHALL immediately accept new navigation input
3. THE Carousel SHALL complete position, opacity, and mask animations within the same 500ms window so all effects finish simultaneously

### Requirement 7: Responsive Behavior Preservation

**User Story:** As a mobile user, I want the onboarding carousel to work correctly on my device, so that the experience is not degraded.

#### Acceptance Criteria

1. THE Carousel SHALL preserve current responsive breakpoint behavior (peek card hidden on mobile <768px)
2. THE Carousel SHALL recalculate card dimensions and translateY offsets when the viewport is resized
3. THE Carousel SHALL preserve current mobile padding, border-radius, and width adjustments

### Requirement 8: Performance Targets

**User Story:** As a user on a mid-range device, I want transitions to run at 60fps, so that the experience feels fluid.

#### Acceptance Criteria

1. WHILE a card transition is animating, THE Carousel SHALL not trigger layout recalculation (no animated `top`, `left`, `width`, or `height` properties)
2. WHILE a card transition is animating, THE Carousel SHALL not trigger paint operations beyond compositing (no per-frame `mask-image` string updates)
3. THE Carousel SHALL not allocate additional offscreen canvases or large bitmap buffers for the mask effect
4. IF additional DOM elements are required for the overlay mask approach, THEN THE Carousel SHALL minimize their count to the fewest necessary

