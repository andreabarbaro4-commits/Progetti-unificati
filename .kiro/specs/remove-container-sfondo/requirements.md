# Requirements Document

## Introduction

Remove the `.container-sfondo` wrapper div from the onboarding flow entirely. This div was originally the background container for onboarding step cards, but background rendering has been migrated to the `AnimatedBackground` component (fixed, fullscreen, z-index: -1). The `.container-sfondo` wrapper now only provides flexbox centering and viewport sizing — layout responsibilities that can be absorbed by the existing `body` styles or the `.Step` card itself. Removing it eliminates dead complexity, reduces DOM nesting, and simplifies CSS maintenance.

## Glossary

- **Step_Card**: The `.Step` div element that contains onboarding step content (white card with border-radius and box-shadow)
- **Container_Sfondo**: The `.container-sfondo` div wrapper currently wrapping every Step_Card in onboarding step components
- **AnimatedBackground**: A fixed, fullscreen React component (z-index: -1) that renders the animated gradient background for onboarding
- **Schermata_Con_Sfondo_Variant**: The `.container-sfondo.schermata-con-sfondo` CSS class variant that adds `overflow: hidden` and explicit positioning
- **Onboarding_Step_Component**: Any of the 11 step components: PersonalInfoStep, AccountStep, SendingCodeStep, VerifyCodeStep, WelcomeStep, RoleStep, JobStep, PhotoUploadStep, OrgTypeStep, OrgDetailsStep, CompanySettingsStep
- **Wide_Mode**: The `.Step.wide-mode` CSS variant used by certain steps that require different height behavior

## Requirements

### Requirement 1: Remove Container_Sfondo div from all Onboarding_Step_Components

**User Story:** As a developer, I want the Container_Sfondo wrapper removed from all step components, so that the DOM structure is simpler and there is no dead wrapper element.

#### Acceptance Criteria

1. WHEN an Onboarding_Step_Component renders, THE Onboarding_Step_Component SHALL render the Step_Card as its root element without a Container_Sfondo wrapper
2. THE codebase SHALL contain zero references to "container-sfondo" as a JSX className in any Onboarding_Step_Component
3. IF an Onboarding_Step_Component previously used the Schermata_Con_Sfondo_Variant class, THEN THE Onboarding_Step_Component SHALL remove that class reference entirely

### Requirement 2: Relocate centering and viewport layout to body or Step_Card

**User Story:** As a user, I want the Step_Card to remain visually centered in the viewport, so that removing the wrapper does not change the visual appearance.

#### Acceptance Criteria

1. THE body element or a suitable ancestor SHALL provide `display: flex`, `justify-content: center`, and `align-items: center` for centering the Step_Card
2. THE Step_Card or a suitable ancestor SHALL provide `min-height: 100vh` so that content is vertically centered within the full viewport
3. THE Step_Card or a suitable ancestor SHALL provide horizontal padding of at least 20px so that the card does not touch viewport edges on narrow screens
4. WHEN the viewport width is 600px or less, THE Step_Card SHALL apply responsive padding (20px) and margin (10px) as currently defined in the media query

### Requirement 3: Remove all Container_Sfondo CSS rules from the stylesheet

**User Story:** As a developer, I want all `.container-sfondo` CSS rules removed, so that the stylesheet has no orphaned selectors.

#### Acceptance Criteria

1. THE App.css stylesheet SHALL contain zero CSS rule blocks with a selector matching `.container-sfondo` (standalone)
2. THE App.css stylesheet SHALL contain zero CSS rule blocks with a selector matching `.container-sfondo.schermata-con-sfondo`
3. THE App.css stylesheet SHALL contain zero CSS rule blocks with a selector matching `body .container-sfondo .Step.wide-mode`
4. THE App.css stylesheet SHALL contain zero CSS rule blocks with any selector that includes the substring "container-sfondo"

### Requirement 4: Preserve Wide_Mode behavior without Container_Sfondo

**User Story:** As a user, I want the Wide_Mode step layout to continue working correctly after the wrapper removal, so that wide steps still render with correct sizing.

#### Acceptance Criteria

1. WHEN a Step_Card has the `wide-mode` class, THE Step_Card SHALL apply `min-height: 0`, `height: auto`, and `padding-bottom: 120px`
2. WHEN a Step_Card has the `wide-mode` class, THE Step_Card SHALL apply `align-self: flex-start` to prevent vertical centering of tall content
3. THE CSS selector for Wide_Mode SHALL target `.Step.wide-mode` directly without requiring a Container_Sfondo ancestor

### Requirement 5: Remove or update obsolete test files

**User Story:** As a developer, I want test files that validate Container_Sfondo behavior to be removed or rewritten, so that the test suite does not reference deleted code.

#### Acceptance Criteria

1. THE file `container-sfondo-background.test.tsx` SHALL be deleted because it tests a CSS rule that no longer exists
2. THE file `container-sfondo-preservation.test.tsx` SHALL be deleted or rewritten to validate the new layout approach without referencing Container_Sfondo selectors
3. WHEN the test suite runs, THE test runner SHALL produce zero failures related to missing Container_Sfondo CSS rules or DOM elements

### Requirement 6: Visual output remains identical

**User Story:** As a user, I want the visual appearance of every onboarding step to remain unchanged after the refactoring, so that the removal is a pure internal cleanup.

#### Acceptance Criteria

1. THE Step_Card SHALL continue to render with a white background (`background-color: #ffffff`), rounded corners (`border-radius: 20px`), and a box-shadow
2. THE Step_Card SHALL remain horizontally and vertically centered in the viewport on all screen sizes
3. WHEN the viewport width is less than or equal to 600px, THE Step_Card SHALL apply the existing responsive styles (reduced padding, hidden avatar-decorativo)
4. THE AnimatedBackground component SHALL remain visible behind the Step_Card with no opaque layer between them
