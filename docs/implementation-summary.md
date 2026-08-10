# Flowlee Frontend — What's Built

## The App

A single-page app for onboarding new users onto the Flowlee platform. The main implemented flow is the **sign-up/onboarding wizard**. Post-onboarding screens are placeholder only.

---

## Screens

### Phase 1: Registration (horizontal card carousel)

A swipeable horizontal carousel of cards. Each card slides left when the user advances.

| # | Screen | What the user sees |
|---|--------|-------------------|
| 1 | **Personal Info** | Name, surname, gender (dropdown), date of birth. Validated with Zod. |
| 2 | **Create Account** | Greeting by first name, email, password, confirm password. |
| 3 | **Sending Code** | Animated avatar + message telling the user a verification code is on its way. Has a "Next" button (auto-advance placeholder). |
| 4 | **Verify Code** | Code input field, "Resend code" button, "Confirm" button. |
| 5 | **Welcome** | Full-screen expand animation. Avatar image + "Nice to meet you" + "Create Profile" button. |
| 6 | **Role Selection** | "What is your job?" with a tag cloud of roles (Project Manager, HR Manager, etc.). User picks one. |
| 7 | **Photo Upload** | Circular photo upload area, shows user name/email/selected roles beneath. "Start" button to proceed. |

After step 7, a cross-fade transition takes the user into Phase 2.

### Phase 2: Organisation Setup (vertical carousel)

Full-screen cards that slide vertically. A top navigation bar with step indicators appears.

| # | Screen | What the user sees |
|---|--------|-------------------|
| 8 | **Org Type** | "Do you work with a company or are you a freelance?" Two buttons: "Company" (advances) or "Freelance" (skips entire phase, goes to dashboard). |
| 9 | **Org Details** | Two-column layout. Left: logo upload placeholder (square box). Right: company name, team size dropdown (with pricing shown), description textarea. |
| 10 | **Contact Info** | Left: large heading "Insert some contact data". Right: address, company email, phone. Has both "Proceed" and "Skip" buttons — all fields are optional. |

**CompanySettingsStep exists in code but is NOT wired into the flow.** It's a standalone component (sidebar with sections: Details, Admins, Contacts, Billing, Work Model) — disabled / not rendered anywhere in the current wizard.

### Post-Onboarding

| Screen | What it is |
|--------|-----------|
| **Dashboard** | Placeholder heading only. "Dashboard" text, nothing else. Awaiting backend integration. |
| **404 / Not Found** | Simple page with "404 — Page not found" and a link home. |

---

## Other notable things

- **Language switcher** — toggles between English and Italian, visible on every screen (top-right corner)
- **Auth system** — OIDC via Auth0 is fully wired (provider, guard, callback, session-expired notification), but the onboarding flow itself is public
- **Animated background** — decorative animated element present across screens
- **Mock mode** — a full mock system (fake auth, mock API, fixtures) that lets the whole onboarding run without a real backend
- **Dev playground** — a component sandbox available only in development builds at `/dev/playground`

---

## What's NOT done yet

- Dashboard (empty placeholder)
- CompanySettings (component exists but disabled/not in the flow)
- Any post-login functionality
- Backend integration (everything runs against mocks)
