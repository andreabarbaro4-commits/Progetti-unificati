# Requirements Document

## Introduction

Port the animated floating blob background from the demo application to the frontend app. The background consists of multiple absolutely-positioned blobs with radial gradients, blur filters, and CSS drift animations that cover the entire viewport. The blobs sit behind all UI content as a purely decorative layer, creating an immersive visual feel where floating UI components (cards, forms) appear layered above a colorful, gently-moving backdrop.

## Glossary

- **Animated_Background**: A fixed-position, full-viewport decorative layer containing multiple animated gradient blobs that renders behind all page content.
- **Blob**: An individual gradient element with an organic border-radius, a radial-gradient fill, a blur filter, and a CSS drift animation applied.
- **Drift_Animation**: A CSS `@keyframes` animation that translates, scales, and rotates a blob along a multi-step path to produce a slow, organic floating movement.
- **Frontend_App**: The React + TypeScript + Vite frontend application at `/home/vincenzom/github/flowlee/frontend`.
- **Reduced_Motion**: The user's OS-level `prefers-reduced-motion: reduce` media query setting indicating the user prefers minimal animation.

## Requirements

### Requirement 1: Full-Viewport Background Layer

**User Story:** As a user, I want the animated background to cover the entire browser viewport on all routes, so that the visual experience is consistent and immersive across the application.

#### Acceptance Criteria

1. THE Animated_Background SHALL render as a fixed-position element covering the full viewport (top: 0, right: 0, bottom: 0, left: 0, width: 100vw, height: 100vh).
2. THE Animated_Background SHALL appear behind all page content by using a z-index of -1, ensuring it remains below all interactive and non-interactive content layers.
3. THE Animated_Background SHALL apply overflow: hidden to its container element to prevent child blob elements from generating horizontal or vertical scrollbars on the document.
4. WHEN the user navigates between routes, THE Animated_Background SHALL remain mounted at the application root level (outside the routed view tree) so that no re-mount, opacity flash, or position reset occurs during route transitions.
5. WHEN the browser viewport is resized, THE Animated_Background SHALL continue to cover the full viewport dimensions without revealing gaps or requiring a page reload.

### Requirement 2: Animated Gradient Blobs

**User Story:** As a user, I want to see colorful, gently-drifting blobs in the background, so that the interface feels dynamic and visually appealing.

#### Acceptance Criteria

1. THE Animated_Background SHALL contain at least 8 and no more than 12 Blob elements, each with a distinct combination of position, size (between 150px and 500px diameter), border-radius, and gradient colors.
2. Each Blob SHALL use a radial-gradient fill with semi-transparent colors (opacity between 0.2 and 0.7) that blend with adjacent Blobs without producing opaque regions.
3. Each Blob SHALL have a blur filter applied with a value between 28px and 65px to produce soft, diffused edges.
4. Each Blob SHALL have a Drift_Animation applied with a unique duration between 7s and 10s and a unique animation delay between 0s and 5s, such that no two Blobs share the same duration-and-delay combination.
5. THE Drift_Animation for each Blob SHALL loop infinitely with an ease-in-out timing function, translating the Blob between 10px and 40px from its origin position along both axes.
6. WHILE the Animated_Background is visible, THE Animated_Background SHALL maintain a frame rate of at least 30 frames per second on devices meeting minimum supported hardware specifications.
7. THE Animated_Background SHALL be rendered behind all foreground content using a z-index lower than any interactive UI element, ensuring Blobs do not intercept pointer events.

### Requirement 3: Accessibility and Non-Interference

**User Story:** As a user with accessibility needs, I want the background to be purely decorative and not interfere with interaction or assistive technology.

#### Acceptance Criteria

1. THE Animated_Background SHALL be marked with `aria-hidden="true"` to exclude it from the accessibility tree.
2. THE Animated_Background SHALL have `pointer-events: none` applied so that it does not intercept clicks or touch events.
3. IF the user has enabled Reduced_Motion, THEN THE Frontend_App SHALL reduce all Drift_Animation durations to near-zero (0.01ms) and limit iterations to 1, so that Blobs remain visible in their final position without ongoing motion.
4. THE Animated_Background SHALL contain no focusable elements (no elements with tabindex >= 0, no links, buttons, or form controls) so that keyboard navigation bypasses it entirely.

### Requirement 4: Performance Optimization

**User Story:** As a user on a range of devices, I want the animated background to perform smoothly without causing jank or excessive resource usage.

#### Acceptance Criteria

1. Each Drift_Animation SHALL use only `transform` properties (translate, scale, rotate) to ensure GPU-composited rendering.
2. Each Blob SHALL use `will-change: transform` to hint the browser to optimize compositing.
3. THE Animated_Background SHALL not trigger layout or paint operations on surrounding content during animation, verifiable by producing zero "Layout Shift" and zero "Recalculate Style" entries affecting elements outside the Animated_Background in a browser performance trace.
4. WHILE the Drift_Animation is running, THE Animated_Background SHALL maintain a frame rate of at least 30 fps on a mid-range device (4× CPU throttling in DevTools performance profiling).
5. THE Animated_Background SHALL not animate properties other than `transform` and `opacity`, ensuring that no geometry or paint-triggering properties (width, height, top, left, margin, padding, background, box-shadow) are modified during animation.

### Requirement 5: Reusable Component Architecture

**User Story:** As a developer, I want the animated background extracted into a self-contained React component, so that it can be placed once in the app shell and reused or toggled easily.

#### Acceptance Criteria

1. THE Animated_Background SHALL be implemented as a standalone React component exported from a single file (`AnimatedBackground.tsx`) with no dependencies on route-level or feature-level state.
2. THE Animated_Background component SHALL accept a boolean `visible` prop (defaulting to `true`) that controls whether the background is rendered, allowing parent components to toggle it without unmounting the component.
3. THE Animated_Background component SHALL be rendered at the application root level (inside the app shell, outside route content) so that it persists across route navigation without re-mounting.
4. WHEN the Animated_Background component mounts, THE Drift_Animation keyframes SHALL be applied via a dedicated CSS file imported by the component or defined within a scoped style block, ensuring no class-name collisions with existing application styles.
5. IF the `visible` prop is set to `false`, THEN THE Animated_Background component SHALL hide its visual output without removing the DOM node, so that re-enabling it does not trigger a remount or animation restart.

### Requirement 6: Replace Existing Per-Step Background

**User Story:** As a developer, I want the old per-step inline gradient background removed from the onboarding steps, so that the new global animated background is the single source of background visuals.

#### Acceptance Criteria

1. THE Frontend_App SHALL NOT contain any inline radial-gradient background styles in onboarding step components; specifically the blurred radial-gradient overlay `div` in CompanySettingsStep SHALL be removed.
2. THE Frontend_App SHALL remove the `.container-sfondo.schermata-con-sfondo` pseudo-element backgrounds (`::before` and `::after` gradient overlays) and the `.container-sfondo.schermata-con-sfondo` background override rules from `App.css`.
3. THE Frontend_App SHALL remove the `background-image: radial-gradient(...)` declaration from the `.container-sfondo` base class in `App.css`.
4. WHILE the Animated_Background is rendered behind onboarding steps, THE onboarding step cards SHALL maintain a solid or semi-transparent background (e.g., existing `background-color: #ffffff` or `rgba(255,255,255,0.75)` with `backdrop-filter: blur(20px)`) so that all text within the card meets a minimum contrast ratio of 4.5:1 against its immediate card background.
