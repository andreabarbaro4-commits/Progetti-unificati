# Requirements Document

## Introduction

Refactor the user registration flow (steps 1–9) from a multi-page wizard into a single-page horizontal carousel. The carousel renders all registration step cards on one page with a fixed uniform height. The active card is centered with faint shadow previews of adjacent cards visible on either side. After completing the 9 registration steps, the flow continues to the remaining organizational steps (OrgType, OrgDetails, CompanySettings) which remain outside the carousel.

## Glossary

- **Carousel**: A horizontal, single-page layout component that displays one active card centered on screen with faint previews of adjacent cards visible on either side.
- **Card**: A rounded-corner container within the Carousel that holds the content of one registration step.
- **Active_Card**: The Card currently centered in the Carousel viewport, fully visible and interactive.
- **Adjacent_Card_Shadow**: A faint, partially visible preview of the previous or next Card rendered on the left or right side of the Active_Card.
- **Step_Indicator**: A row of dots at the bottom of the Carousel indicating the current step position within the 9 registration steps.
- **Registration_Flow**: The first 9 steps of the onboarding process (PersonalInfo, Account, SendingCode, VerifyCode, Welcome, Role, Job, PhotoUpload, PhotoUploaded).
- **Organizational_Flow**: The remaining onboarding steps (OrgType, OrgDetails, CompanySettings) that follow after the Registration_Flow and are not part of the Carousel.

## Requirements

### Requirement 1: Single-Page Carousel Layout

**User Story:** As a user, I want all registration steps displayed in a single-page carousel, so that the flow feels smooth and continuous without full page transitions.

#### Acceptance Criteria

1. THE Carousel SHALL render all 9 Registration_Flow Cards on a single page without triggering full page reloads or route changes.
2. THE Carousel SHALL display Cards with a fixed, uniform height regardless of the content within each Card.
3. THE Carousel SHALL center the Active_Card horizontally within the viewport.
4. WHEN the Carousel is displayed, THE Active_Card SHALL be fully visible and interactive.

### Requirement 2: Adjacent Card Shadows

**User Story:** As a user, I want to see faint previews of the previous and next cards, so that I have spatial context of where I am in the registration flow.

#### Acceptance Criteria

1. WHILE the Active_Card is not the first Card, THE Carousel SHALL render an Adjacent_Card_Shadow on the left side.
2. WHILE the Active_Card is not the last Card, THE Carousel SHALL render an Adjacent_Card_Shadow on the right side.
3. WHILE the Active_Card is the first Card, THE Carousel SHALL NOT render an Adjacent_Card_Shadow on the left side.
4. WHILE the Active_Card is the last Card, THE Carousel SHALL NOT render an Adjacent_Card_Shadow on the right side.
5. THE Adjacent_Card_Shadow SHALL appear as a faint, non-interactive preview of the neighboring Card.

### Requirement 3: Carousel Navigation

**User Story:** As a user, I want to advance through the carousel using navigation actions, so that I can progress through the registration steps.

#### Acceptance Criteria

1. WHEN the user completes a step (submits a form or clicks the next button), THE Carousel SHALL advance to the next Card with a horizontal slide animation.
2. THE Carousel SHALL NOT allow the user to navigate backward to a previous Card.
3. WHEN the Carousel advances, THE Step_Indicator SHALL update to reflect the new active step position.
4. THE Carousel SHALL transition between Cards with a smooth horizontal animation.

### Requirement 4: Step Indicator

**User Story:** As a user, I want to see a step indicator showing my progress, so that I know how far along I am in the registration process.

#### Acceptance Criteria

1. THE Step_Indicator SHALL display exactly 9 dots corresponding to the 9 Registration_Flow steps.
2. THE Step_Indicator SHALL visually distinguish the current active step from the remaining steps.
3. WHEN the Active_Card changes, THE Step_Indicator SHALL update the highlighted dot to match the new active step.

### Requirement 5: Card Visual Design

**User Story:** As a user, I want each registration card to have a consistent, polished visual design, so that the experience feels cohesive and professional.

#### Acceptance Criteria

1. THE Card SHALL have rounded corners.
2. THE Card SHALL display the Flowlee logo at the top of each step.
3. THE Card SHALL position the primary action button (next/submit) at the bottom.
4. THE Card SHALL maintain its fixed height regardless of varying content across different steps.

### Requirement 6: Transition to Organizational Flow

**User Story:** As a user, I want the registration carousel to seamlessly transition to the organizational setup steps, so that the onboarding continues naturally after registration.

#### Acceptance Criteria

1. WHEN the user completes the last Registration_Flow step (step 9), THE system SHALL exit the Carousel and transition to the Organizational_Flow.
2. THE Organizational_Flow (OrgType, OrgDetails, CompanySettings) SHALL remain as separate full-page components outside the Carousel.
3. WHEN transitioning from the Carousel to the Organizational_Flow, THE system SHALL maintain any state collected during the Registration_Flow.

### Requirement 7: Responsive Behavior

**User Story:** As a user, I want the carousel to work on different screen sizes, so that I can register from any device.

#### Acceptance Criteria

1. THE Carousel SHALL scale the Card width appropriately to the viewport while maintaining the fixed height.
2. WHILE the viewport is narrow (mobile), THE Carousel SHALL reduce or hide the Adjacent_Card_Shadows to prioritize the Active_Card content.
3. THE Carousel SHALL remain functional and navigable across desktop and mobile viewports.
