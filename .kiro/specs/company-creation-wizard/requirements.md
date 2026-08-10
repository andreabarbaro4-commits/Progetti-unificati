# Requirements Document

## Introduction

Redesign the company creation wizard (org-type → org-details → company-settings) to follow the Figma design (node 484:1744). The current layout is broken: steps render as small constrained cards with overflow issues. The new design uses a vertical carousel with full-width cards, a fixed top navigation bar decoupled from card content, and vertical peek/ghost transitions between steps.

## Glossary

- **Vertical_Carousel**: A multi-step container component that moves cards along the Y-axis (vertically), showing one active card and a peek of the next card below, analogous to how RegistrationCarousel works horizontally.
- **Top_Navigation_Bar**: A fixed/static navigation bar rendered at the top of the viewport, completely decoupled from card content. Contains navigation arrows, step label, Flowlee logo, and user avatar.
- **Active_Card**: The currently visible and interactive step card in the carousel.
- **Peek_Card**: The next step card partially visible below the active card, providing spatial context of the flow progression.
- **Wizard**: The overall company creation flow comprising the org-type, org-details, and company-settings steps.
- **Card_Container**: The full-width card element (max 1341px in Figma at 1512px viewport) holding step content with rounded corners and shadow.

## Requirements

### Requirement 1: Vertical Carousel Component

**User Story:** As a user, I want the company creation steps to transition vertically, so that I experience a coherent flow that matches the Figma design.

#### Acceptance Criteria

1. THE Vertical_Carousel SHALL render step cards stacked along the Y-axis with vertical transitions (translateY) between steps.
2. WHEN the user completes the current step's required action (e.g., form submission or selection confirmation), THE Vertical_Carousel SHALL animate the active card upward and bring the next card into view from below using a CSS transition of 500ms with cubic-bezier(0.4, 0, 0.2, 1) easing.
3. THE Vertical_Carousel SHALL display a Peek_Card below the Active_Card, showing the top 80px of the next step with a gradient fade mask (top-to-bottom, from 50% opacity to transparent).
4. WHEN the user activates the back control on the current step, THE Vertical_Carousel SHALL animate the active card downward and bring the previous card into view from above using a CSS transition of 500ms with cubic-bezier(0.4, 0, 0.2, 1) easing.
5. WHILE a transition is in progress, THE Vertical_Carousel SHALL disable user interaction with both the outgoing and incoming cards until the 500ms transition completes.
6. THE Vertical_Carousel SHALL support exactly three steps in order: org-type, org-details, and company-settings.
7. IF the active step is the first step (org-type), THEN THE Vertical_Carousel SHALL not render a back control or allow backward navigation.
8. IF the active step is the last step (company-settings), THEN THE Vertical_Carousel SHALL not display a Peek_Card below the Active_Card.

### Requirement 2: Top Navigation Bar Decoupling

**User Story:** As a user, I want the navigation bar to remain fixed at the top regardless of which step is active, so that I always have access to navigation controls.

#### Acceptance Criteria

1. THE Top_Navigation_Bar SHALL be rendered as a standalone component positioned fixed at the top of the viewport, outside the Vertical_Carousel card content.
2. THE Top_Navigation_Bar SHALL contain navigation arrows (up/down), a step label displaying the format "{StepName} / {StepNumber}" (e.g., "Organizzazione / 1"), the Flowlee logo centered, and the user avatar on the right.
3. WHEN the user clicks the up arrow in the Top_Navigation_Bar, THE Wizard SHALL navigate to the previous step.
4. WHEN the user clicks the down arrow in the Top_Navigation_Bar, THE Wizard SHALL navigate to the next step.
5. WHILE the user is on the first step, THE Top_Navigation_Bar SHALL disable the up navigation arrow by rendering it visually muted (reduced opacity) and non-interactive (click events ignored).
6. WHILE the user is on the last step, THE Top_Navigation_Bar SHALL disable the down navigation arrow by rendering it visually muted (reduced opacity) and non-interactive (click events ignored).
7. WHEN the active step changes, THE Top_Navigation_Bar SHALL update the step label to display the name and 1-based index of the currently active step within 1 frame of the transition completing.

### Requirement 3: Card Layout and Sizing

**User Story:** As a user, I want the step cards to be full-width and properly proportioned, so that the content is readable without overflow issues.

#### Acceptance Criteria

1. THE Card_Container SHALL have a maximum width of 1341px at a viewport width of 1512px, scaling proportionally (maintaining the same width-to-viewport ratio of 88.7%) for viewport widths between 768px and 1512px.
2. THE Card_Container SHALL maintain a minimum height of 536px to accommodate step content without vertical scrolling when step content is 500 characters or fewer.
3. THE Card_Container SHALL have a border-radius of 24px and a box-shadow of 0px 4px 40px rgba(0, 0, 0, 0.1).
4. THE Card_Container SHALL use horizontal padding of 40px and vertical padding of 32px for step content.
5. IF the viewport width is less than 768px, THEN THE Card_Container SHALL expand to fill 95% of the viewport width, reduce padding to 20px horizontal and 24px vertical, and reduce border-radius to 16px.
6. IF the step content exceeds the Card_Container minimum height of 536px, THEN THE Card_Container SHALL expand its height to fit all content without introducing internal scrollbars.
7. THE Card_Container SHALL enforce a minimum width of 288px regardless of viewport size to prevent content from becoming unreadable.

### Requirement 4: Responsive Behavior

**User Story:** As a user on a mobile device, I want the wizard to adapt gracefully to smaller screens, so that I can complete the company creation on any device.

#### Acceptance Criteria

1. IF the viewport width is less than 768px, THEN THE Vertical_Carousel SHALL hide the Peek_Card and display only the Active_Card.
2. IF the viewport width is less than 768px, THEN THE Top_Navigation_Bar SHALL maintain its fixed position and function with horizontal padding reduced to 16px and navigation arrow touch targets of at least 44×44px.
3. WHEN the viewport is resized, THE Vertical_Carousel SHALL recalculate card dimensions and translate offsets within 150ms such that the Active_Card remains fully visible and correctly positioned without content clipping or overflow.
4. IF the viewport is resized while a card transition is in progress, THEN THE Vertical_Carousel SHALL complete the current transition before applying the recalculated layout.

### Requirement 5: Visual Consistency with Figma Design

**User Story:** As a product designer, I want the wizard to match the Figma specification, so that the implementation faithfully represents the intended design.

#### Acceptance Criteria

1. THE Wizard SHALL position the Top_Navigation_Bar at a vertical offset of 78px from the top of the viewport at a reference viewport width of 1512px, matching Figma node 484:1744.
2. THE Wizard SHALL position the Active_Card starting at a vertical offset of 223px from the top of the viewport at a reference viewport width of 1512px.
3. THE Wizard SHALL position the Peek_Card starting at a vertical offset of 799px from the top of the viewport at a reference viewport width of 1512px, ensuring the Peek_Card top edge is below the initial viewport fold on standard 900px-height displays.
4. THE Wizard SHALL render two decorative planet ellipse elements in the viewport background: one positioned in the top-right corner and one positioned in the bottom-right corner of the viewport, rendered behind all card and navigation content (z-index below interactive elements).
5. WHEN the Vertical_Carousel transitions between steps, THE Vertical_Carousel SHALL fade out the outgoing card content from opacity 1 to 0 and fade in the incoming card content from opacity 0 to 1, synchronized with the 500ms vertical translateY movement using the same cubic-bezier(0.4, 0, 0.2, 1) easing defined in Requirement 1.
6. IF the viewport width is less than 768px, THEN THE Wizard SHALL maintain the relative vertical ordering of Top_Navigation_Bar, Active_Card, and Peek_Card while allowing absolute pixel offsets to adapt proportionally to the viewport height.

### Requirement 6: Step Content Preservation

**User Story:** As a developer, I want the existing step content logic to remain functional inside the new carousel, so that no business logic is lost during the redesign.

#### Acceptance Criteria

1. THE Wizard SHALL preserve the existing OrgTypeStep functionality: presenting "Company" and "Freelance" as two distinct selection buttons alongside a character illustration, where clicking either button records the user's choice and triggers advancement to the next step.
2. THE Wizard SHALL preserve the existing OrgDetailsStep functionality: a form containing a company name text input (required, minimum 1 character), a team size dropdown selector displaying the corresponding price tier beside it, and an optional description textarea.
3. THE Wizard SHALL preserve the existing CompanySettingsStep functionality: a modal-style panel with a sidebar listing navigation items (Details, Admins, Contacts, Billing, Work Model), a 180×180px logo placeholder area, and a form containing company name, team size with price indicator, and description fields.
4. WHEN the user clicks a selection button on OrgTypeStep or submits the form on OrgDetailsStep or CompanySettingsStep with valid data, THE Vertical_Carousel SHALL advance to the next step.
5. IF form validation fails on OrgDetailsStep or CompanySettingsStep, THEN THE Vertical_Carousel SHALL remain on the current step and display validation error messages inline adjacent to each invalid field.
6. WHEN the user activates the back navigation on OrgDetailsStep, THE Vertical_Carousel SHALL return to the previous step without discarding data entered on the current step.
