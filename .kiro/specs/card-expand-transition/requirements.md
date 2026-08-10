# Requirements Document

## Introduction

The registration onboarding carousel currently transitions between steps using a horizontal slide with CSS mask fade animations. When the carousel reaches the WelcomeStep (index 4), the card should instead perform an "expand" animation — growing from its standard card dimensions (448×700px) to cover the entire viewport. This creates a moment of emphasis and delight at the point where the user transitions from verification to profile creation.

## Glossary

- **Carousel**: The horizontal card-based stepper component (`RegistrationCarousel`) that guides users through the registration onboarding flow
- **Card**: A single step container within the Carousel, normally 448px wide and 700px tall (responsive on mobile)
- **WelcomeStep**: The card at index 4 that displays a welcome message and "CREATE PROFILE" button, marking the transition from account verification to profile setup
- **Expand_Animation**: A scale/size transition where a card grows from its normal dimensions to fill the entire viewport
- **Viewport**: The full visible browser window area (100vw × 100vh)
- **Normal_Transition**: The existing horizontal slide + mask fade animation used for all other step transitions (500ms, cubic-bezier easing)
- **TopNavigation**: The shared header bar component (`TopNavigation`) that displays arrows, the Flowlee logo, and optional user icons. It appears on steps after the WelcomeStep (RoleStep onward) at the top of the card.

## Requirements

### Requirement 1: Expand animation when arriving at WelcomeStep

**User Story:** As a user going through registration, I want the WelcomeStep card to expand and fill the entire screen when I reach it, so that the welcome moment feels impactful and distinct from other steps.

#### Acceptance Criteria

1. WHEN the Carousel transitions to the WelcomeStep (index 4), THE Expand_Animation SHALL scale the card from its normal dimensions (448×700px on desktop, 95vw×640px minimum on mobile) to cover the full Viewport (100vw × 100vh) over 500ms using cubic-bezier(0.4, 0, 0.2, 1) easing
2. WHEN the Expand_Animation plays, THE Carousel SHALL NOT apply the Normal_Transition mask fade animation to the incoming WelcomeStep card, while the outgoing card (index 3) SHALL still receive its normal left-fade mask animation
3. WHEN the Expand_Animation completes, THE WelcomeStep SHALL display its content (avatar, text, button) centered both horizontally and vertically within the full Viewport, with the card border-radius at 0px
4. WHILE the Expand_Animation is playing, THE WelcomeStep card border-radius SHALL animate from 24px to 0px synchronized with the scale transition
5. IF the Expand_Animation is interrupted by a browser resize event, THEN THE Expand_Animation SHALL complete to full Viewport coverage using the new Viewport dimensions

### Requirement 2: Outgoing card behavior during expand

**User Story:** As a user, I want the previous card to fade out naturally while the WelcomeStep expands, so that the transition feels smooth and coherent.

#### Acceptance Criteria

1. WHEN the Carousel transitions to the WelcomeStep, THE Card at index 3 (VerifyCodeStep) SHALL fade out using the existing mask animation (gradient fade to left) over the same 500ms duration as the Expand_Animation, starting simultaneously with the Expand_Animation
2. WHILE the Expand_Animation is playing, THE WelcomeStep card SHALL render above the Card at index 3 in stacking order so that the outgoing card is fully occluded by the expanding card
3. WHEN the Expand_Animation completes, THE Card at index 3 SHALL be in the hidden state (not rendered or visibility hidden) and SHALL NOT remain in the DOM layout affecting the expanded WelcomeStep

### Requirement 3: Expand animation origin

**User Story:** As a user, I want the expansion to originate from where the card naturally appears, so that the motion feels connected to the carousel flow.

#### Acceptance Criteria

1. WHEN the Expand_Animation begins, THE WelcomeStep card SHALL start at its normal carousel position (centered in the carousel viewport at 448×700px on desktop, 95vw width on mobile) with a transform-origin of center center
2. WHILE the Expand_Animation is playing, THE WelcomeStep card SHALL scale outward from its center point to reach final dimensions of 100vw × 100vh, and SHALL NOT be clipped by any parent container overflow constraints
3. WHILE the Expand_Animation is playing, THE WelcomeStep card border-radius SHALL animate from 24px to 0px in sync with the scale transition

### Requirement 4: Responsive expand behavior

**User Story:** As a mobile user, I want the expand animation to work correctly on smaller screens, so that the experience is consistent across devices.

#### Acceptance Criteria

1. WHEN the viewport width is 600px or less, THE Expand_Animation SHALL scale the WelcomeStep from its mobile dimensions (95vw width, up to 700px height) to cover the full Viewport (100vw × 100vh), expanding outward from the card's center point
2. WHEN the viewport width is 600px or less, THE Expand_Animation SHALL complete within 500ms using cubic-bezier(0.4, 0, 0.2, 1) easing
3. WHEN the viewport width is 600px or less, THE Expand_Animation SHALL animate the WelcomeStep card border-radius from 24px to 0px over the duration of the animation

### Requirement 5: Transition away from WelcomeStep

**User Story:** As a user clicking "CREATE PROFILE", I want a smooth transition to the next step with the navigation bar appearing, so that the flow continues naturally and I gain access to navigation controls.

#### Acceptance Criteria

1. WHEN the user clicks "CREATE PROFILE" on the expanded WelcomeStep, THE WelcomeStep SHALL collapse back from full Viewport (100vw × 100vh) to its normal card dimensions (448×700px on desktop, 95vw on mobile) before the Normal_Transition to the next step begins
2. THE collapse animation SHALL complete within 400ms using cubic-bezier(0.4, 0, 0.2, 1) easing
3. WHILE the collapse animation is playing, THE WelcomeStep card border-radius SHALL animate from 0px to 24px
4. WHILE the collapse animation is playing, THE WelcomeStep content (avatar, text, button) SHALL remain visible and scale down together with the card
5. WHEN the collapse animation completes, THE Carousel SHALL advance to the RoleStep (index 5) using the Normal_Transition
6. WHEN the Carousel advances to the RoleStep (index 5), THE TopNavigation bar SHALL animate into view at the top of the card area using a fade-in combined with a vertical slide-down over 300ms with cubic-bezier(0.4, 0, 0.2, 1) easing
7. WHILE the WelcomeStep is in the expanded state (full Viewport), THE TopNavigation bar SHALL NOT be visible

### Requirement 6: Interaction blocking during animation

**User Story:** As a user, I want the interface to prevent double-clicks or premature navigation while animations are in progress, so that the flow does not break.

#### Acceptance Criteria

1. WHILE the Expand_Animation is playing, THE Carousel SHALL ignore all user-initiated advance triggers including button clicks, keyboard Enter key presses, and programmatic advance calls, discarding them without queuing
2. WHILE the collapse animation is playing, THE Carousel SHALL ignore all user-initiated advance triggers including button clicks, keyboard Enter key presses, and programmatic advance calls, discarding them without queuing
3. WHILE the Expand_Animation is playing, THE WelcomeStep "CREATE PROFILE" button SHALL be visually disabled (non-interactive pointer state and reduced opacity)
4. WHEN the Expand_Animation completes, THE WelcomeStep "CREATE PROFILE" button SHALL transition to an enabled state accepting click and keyboard activation within 50ms of animation end

### Requirement 7: TopNavigation bar visibility during expand/collapse

**User Story:** As a user, I want the navigation bar to be hidden during the full-screen welcome experience and appear only when I advance to profile setup steps, so that the welcome moment feels immersive.

#### Acceptance Criteria

1. WHILE the WelcomeStep is in the expanded state (covering the full Viewport), THE TopNavigation bar SHALL NOT be rendered or visible
2. WHILE the Expand_Animation is playing (transitioning TO the WelcomeStep), THE TopNavigation bar SHALL NOT be visible
3. WHEN the Carousel is at any step before the WelcomeStep (index 0–3), THE TopNavigation bar SHALL NOT be visible (it is not part of those steps)
4. WHEN the Carousel advances from WelcomeStep to RoleStep (index 5), THE TopNavigation bar SHALL fade in and slide down from opacity 0 / translateY(-20px) to opacity 1 / translateY(0) over 300ms
5. WHEN the Carousel is at RoleStep (index 5) or beyond, THE TopNavigation bar SHALL remain visible during Normal_Transitions between subsequent steps
