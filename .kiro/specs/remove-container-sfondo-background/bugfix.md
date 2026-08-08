# Bugfix Requirements Document

## Introduction

The `.container-sfondo` class in `App.css` applies `background-color: #ffffff` and `padding: 20px`, creating a visible white rectangular background behind the onboarding/login card. This blocks the animated background (rendered at the App level via `<AnimatedBackground />`) from being visible behind the card. The white background should be removed so that the animated gradient shows through directly behind the `.Step` card across all onboarding steps.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN any onboarding step renders with a `.container-sfondo` wrapper THEN the system displays a solid white (#ffffff) rectangular background behind the `.Step` card, blocking the animated background from being visible

1.2 WHEN any onboarding step renders with a `.container-sfondo` wrapper THEN the system applies 20px of padding that contributes to the visible white area around the card

### Expected Behavior (Correct)

2.1 WHEN any onboarding step renders with a `.container-sfondo` wrapper THEN the system SHALL display a transparent background on `.container-sfondo`, allowing the animated background to be visible directly behind the `.Step` card

2.2 WHEN any onboarding step renders with a `.container-sfondo` wrapper THEN the system SHALL NOT display any opaque background-color on `.container-sfondo` that blocks the animated background

### Unchanged Behavior (Regression Prevention)

3.1 WHEN any onboarding step renders the `.Step` card THEN the system SHALL CONTINUE TO display the card with its own white background (`background-color: #ffffff`), rounded corners (`border-radius: 20px`), and box shadow

3.2 WHEN the `.container-sfondo` element is used as a layout wrapper THEN the system SHALL CONTINUE TO center its child content both horizontally and vertically using flexbox (`display: flex; justify-content: center; align-items: center`)

3.3 WHEN the `.container-sfondo` element is used as a layout wrapper THEN the system SHALL CONTINUE TO take up the full viewport height (`min-height: 100vh`) and full width (`width: 100%`)

3.4 WHEN the animated background is rendered at the App level THEN the system SHALL CONTINUE TO display behind all page content including the `.Step` card
