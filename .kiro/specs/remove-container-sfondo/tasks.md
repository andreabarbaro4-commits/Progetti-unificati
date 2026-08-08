# Implementation Plan: Remove Container Sfondo

## Overview

Remove the `.container-sfondo` wrapper div from 10 onboarding step components and clean up all associated CSS rules and test files. This is a zero-visual-change DOM/CSS refactoring that eliminates a redundant wrapper layer.

## Tasks

- [x] 1. Remove container-sfondo wrapper from step components
  - [x] 1.1 Remove wrapper from PersonalInfoStep, AccountStep, SendingCodeStep, VerifyCodeStep, and WelcomeStep
    - In each component, remove the outer `<div className="container-sfondo">` and its closing `</div>`, making `<div className="Step">` the root element
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Remove wrapper from RoleStep, JobStep, PhotoUploadStep, OrgTypeStep, and OrgDetailsStep
    - In each component, remove the outer `<div className="container-sfondo">` and its closing `</div>`, making `<div className="Step ...">` the root element
    - For OrgDetailsStep verify that `wide-mode` class is preserved on the `.Step` div
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Clean up CSS rules in App.css
  - [x] 2.1 Delete all `.container-sfondo` rule blocks from App.css
    - Delete the `.container-sfondo { ... }` block (around line 136)
    - Delete the duplicate `.container-sfondo { ... }` block (around line 1339)
    - Delete `.container-sfondo.schermata-con-sfondo { ... }` block and nested `.Step` rules (around line 1421)
    - Delete `body .container-sfondo .Step.wide-mode { ... }` rule block
    - Remove `.container-sfondo` from any media query selector lists (keep the other selectors intact)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.2 Add direct `.Step.wide-mode` selector
    - Add a new rule: `.Step.wide-mode { min-height: 0 !important; height: auto !important; padding-bottom: 120px !important; align-self: flex-start !important; }`
    - Place it near the existing `.Step` rules for discoverability
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Checkpoint - Verify CSS and component changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Delete obsolete test files and verify
  - [x] 4.1 Delete container-sfondo test files
    - Delete `src/features/onboarding/container-sfondo-background.test.tsx`
    - Delete `src/features/onboarding/container-sfondo-preservation.test.tsx`
    - _Requirements: 5.1, 5.2_

  - [ ]* 4.2 Write a smoke test verifying no container-sfondo elements render
    - Create a test that renders each step component and asserts `container.querySelector('.container-sfondo')` is null
    - Assert App.css contains zero occurrences of the string "container-sfondo"
    - _Requirements: 5.3, 6.2_

- [x] 5. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- CompanySettingsStep is excluded — it does not use `.container-sfondo`
- The `body` element already provides `display: flex; justify-content: center; align-items: center; min-height: 100vh` — no body changes needed
- `.Step` already has `margin: 20px` which replaces the padding the container provided
- No property-based tests — this is a CSS/DOM refactoring with no algorithmic logic

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1"] },
    { "id": 1, "tasks": ["2.2"] },
    { "id": 2, "tasks": ["4.1"] },
    { "id": 3, "tasks": ["4.2"] }
  ]
}
```
