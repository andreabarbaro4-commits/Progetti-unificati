# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Container Background Transparency
  - **IMPORTANT**: Write this property-based test BEFORE implementing the fix
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate `.container-sfondo` has an opaque white background blocking `AnimatedBackground`
  - **Scoped PBT Approach**: Scope the property to concrete failing cases — render any onboarding step with `.container-sfondo` wrapper and assert background is transparent
  - Test that for any element with class `container-sfondo`, `getComputedStyle(element).backgroundColor` equals `rgba(0, 0, 0, 0)` or `transparent` (from Bug Condition in design: `isBugCondition` checks `.container-sfondo` has `background-color: rgb(255, 255, 255)`)
  - The test assertions should match Expected Behavior: no opaque background-color on `.container-sfondo`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bug exists because `.container-sfondo` currently has `background-color: #ffffff`)
  - Document counterexamples found (e.g., "`.container-sfondo` computed backgroundColor is `rgb(255, 255, 255)` instead of transparent")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Step Card Appearance and Layout
  - **IMPORTANT**: Follow observation-first methodology
  - **IMPORTANT**: Write these tests BEFORE implementing the fix
  - Observe on UNFIXED code: `.container-sfondo` has `display: flex`, `justify-content: center`, `align-items: center`, `min-height: 100vh`, `width: 100%`
  - Observe on UNFIXED code: `.Step` card has `background-color: rgb(255, 255, 255)`, `border-radius: 20px`, and a box-shadow
  - Write property-based tests for preservation:
    - For all elements with class `container-sfondo`: assert flexbox centering (`display: flex`, `justify-content: center`, `align-items: center`), full viewport height (`min-height: 100vh`), full width (`width: 100%`)
    - For all elements with class `Step`: assert white background (`background-color: rgb(255, 255, 255)`), rounded corners (`border-radius: 20px`), box-shadow is present
  - Verify `.container-sfondo.schermata-con-sfondo` variant is unaffected
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline layout and card styling to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix for container-sfondo white background blocking AnimatedBackground

  - [x] 3.1 Remove `background-color: #ffffff` from `.container-sfondo` in `src/App.css`
    - Locate the `.container-sfondo` rule (around line 1856 in App.css)
    - Remove the `background-color: #ffffff` property declaration
    - Keep all other properties intact: `display: flex`, `justify-content: center`, `align-items: center`, `min-height: 100vh`, `width: 100%`, `padding: 20px`
    - Do NOT modify the `.Step` class or `AnimatedBackground` component
    - Verify `.container-sfondo.schermata-con-sfondo` variant is unaffected (it does not explicitly set background-color)
    - _Bug_Condition: isBugCondition(element) where element.classList.contains('container-sfondo') AND getComputedStyle(element).backgroundColor === 'rgb(255, 255, 255)'_
    - _Expected_Behavior: getComputedStyle(element).backgroundColor === 'rgba(0, 0, 0, 0)' for all .container-sfondo elements_
    - _Preservation: .Step retains white background, .container-sfondo retains flexbox centering and viewport sizing_
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Container Background Transparency
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (transparent background)
    - When this test passes, it confirms `.container-sfondo` no longer has opaque white background
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed — background is now transparent)
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Step Card Appearance and Layout
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions — layout, centering, and Step card styling unchanged)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
