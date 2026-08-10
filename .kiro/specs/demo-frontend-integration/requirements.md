# Requirements Document

## Introduction

This document defines requirements for integrating the product surface built out in the sibling `../demo` repository into this repo (the canonical Flowlee frontend). This repo currently implements onboarding/auth scaffolding (registration carousel, organisation setup carousel, Auth0/OIDC, mock mode, language switcher) but has only a placeholder Dashboard and no other post-login screens. `../demo` has substantially more product surface built out — Dashboard, Projects List, Project Creation Wizard, Project Detail, AI Chat, Team Page, and Admin Panel — but is not visually coherent with this repo's design system.

The integration folds this missing product surface into this repo both functionally (screens/flows work end-to-end against mock data) and visually (rebuilt to match this repo's existing design language — the Tailwind v4 + `class-variance-authority` component pattern seen in `src/components/ui/`, and the visual language established by the onboarding carousels — not ported as-is from Demo's Material-Web-based visual style). Backend integration, tests, linting, formatting, and type-check tooling are explicitly out of scope, consistent with this repo's `no-quality-tooling` steering.

Where a screen already exists here (even as a placeholder, e.g. Dashboard), its implementation is replaced/extended in place. Where a screen does not exist yet, it is created fresh using this repo's structure and conventions, with Demo's implementation serving only as a functional reference (data shapes, interaction behavior, numeric limits) — never as a visual template.

## Glossary

- **Frontend_App**: This repository's React single-page application (the integration target)
- **Demo_App**: The sibling `../demo` repository, used exclusively as a functional/behavioral reference
- **Design_System**: This repo's existing visual language — Tailwind v4 utility classes, `class-variance-authority`-driven components in `src/components/ui/`, rem-based sizing (per `consistent-units` steering), and the visual style established by the onboarding carousels
- **Mock_Data_System**: This repo's existing mock infrastructure — `isMockMode()`, `registerMockHandler`, fixtures under `src/mock/fixtures/`, and the `mock-api-client` interceptor
- **Dashboard**: The authenticated landing screen at `/dashboard`, replacing the current placeholder
- **Timeline_Day_View**: The hourly vertical timeline shown on the Dashboard when day mode is active
- **Timeline_Week_View**: The Mon–Fri column grid shown on the Dashboard when week mode is active
- **Widget_Board**: The draggable/resizable tile grid on the Dashboard hosting individual Widgets
- **Widget**: A single tile on the Widget_Board (e.g. KPI stats, alerts, recent documents, action items, milestones, photo gallery)
- **Top_Navbar**: The authenticated-area top navigation bar (back button, title/breadcrumb, profile panel)
- **Bottom_Navbar**: The authenticated-area mobile-oriented bottom navigation bar with an active-item cutout highlight
- **AI_Mascot_FAB**: The floating action button that opens the AI_Chat_Page
- **Greeting_Bubble**: The post-login speech bubble anchored above the AI_Mascot_FAB
- **Projects_List**: The screen at `/projects` showing the responsive grid of Project_Cards
- **Project_Card**: A single card in the Projects_List representing one project
- **Project_Wizard**: The 3-step project creation flow (`/projects/new`, `/projects/new/analysis`, `/projects/new/team`)
- **Wizard_Chat_Panel**: The AI-chat-styled panel shown alongside the form/analysis content in the Project_Wizard
- **Milestone_Roadmap**: The horizontal, scrollable row of milestone cards shown in Project_Wizard step 2 and in Project_Detail's Milestones tab
- **Team_Selection_Step**: Project_Wizard step 3, where team members are chosen for the new project
- **Member_Graph**: A force-directed visualization of team members as bubbles around a center point (used in Team_Selection_Step and Project_Detail's Team tab)
- **Project_Detail**: The tabbed screen at `/projects/:id` showing a single project's Overview, Milestones & Tasks, Team, Documents, Alerts, and conditional Economics tabs
- **Economics_Tab**: The conditional Project_Detail tab shown only when a project has financial data
- **AI_Chat_Page**: The standalone conversational AI screen (equivalent of Demo's `/agent`)
- **Chat_Session_Sidebar**: The panel/drawer in AI_Chat_Page listing past chat sessions
- **Team_Page**: The screen at `/team` showing the cross-project force-directed cluster graph
- **Cluster_Graph**: The physics-driven visualization on Team_Page grouping members into clusters (by project, organizational unit, or client)
- **Member_Bubble**: A single team member's visual representation within a Member_Graph or Cluster_Graph
- **Admin_Panel**: The admin-only screen at `/admin` with tabbed CRUD sections
- **Admin_Route_Guard**: The route-level check that restricts Admin_Panel access to admin users

## Requirements

### Area: Cross-Cutting (Design System, Mock Data, Scope Constraints)

### Requirement 1: Design System Conformance

**User Story:** As a user of the Flowlee frontend, I want every new or replaced screen to look and feel consistent with the onboarding flow I already see, so that the product feels like one coherent application.

#### Acceptance Criteria

1. THE Frontend_App SHALL implement all screens and components introduced or replaced by this integration using the Design_System's existing patterns, defined as Tailwind v4 utility classes, `class-variance-authority` component variants, and rem-based sizing.
2. THE Frontend_App SHALL NOT import or reference `@material/web` or any other component library used by Demo_App in any screen or component introduced or replaced by this integration.
3. IF an existing shared component in `src/components/ui/` (Button, Card, Badge, CustomSelect, FormField, Toggle) provides equivalent visual style and interaction behavior for a required UI element using only its existing props and variants, THEN THE Frontend_App SHALL reuse that component instead of recreating an equivalent from Demo_App.
4. IF Demo_App implements the same interaction pattern (e.g. modal dialogs, status/priority chips, avatars) — defined as sharing the same triggering action and dismiss/interaction behavior — in 2 or more page-local implementations, THEN THE Frontend_App SHALL consolidate the pattern into one reusable component under `src/components/` rather than duplicating it per feature.
5. IF a UI pattern required by this integration (e.g. force-graph cluster view, milestone roadmap, widget board) has no component in `src/components/ui/` or `src/components/` that provides equivalent visual structure and interaction behavior, THEN THE Frontend_App SHALL implement it as a first-class reusable component under `src/components/` rather than as page-local markup.
6. THE Frontend_App SHALL express all new sizing, spacing, and typography values in rem units in accordance with the `consistent-units` steering document, except for values the steering document explicitly permits in non-rem units (e.g. hairline borders, media query breakpoints).
7. THE Frontend_App SHALL retain this repo's existing AnimatedBackground and LocaleSwitcher components on all new or replaced authenticated screens rather than introducing Demo_App's equivalents.

---

### Requirement 2: Mock Data System Extension

**User Story:** As a developer working on this integration, I want all new screens wired to this repo's existing mock system, so that the product surface works end-to-end without any backend dependency.

#### Acceptance Criteria

1. THE Frontend_App SHALL represent every new domain entity introduced by this integration (Project, Task, Milestone, Team_Member, Document, Alert, Chat_Session, Chat_Message, Timeline_Block, Client, Economics data) as a typed fixture module under `src/mock/fixtures/` containing at least 3 records per entity (or exactly 1 for the Economics singleton), with cross-entity references (e.g. a Task's project reference) pointing to a real fixture ID of the referenced entity.
2. THE Frontend_App SHALL register exactly one mock handler via `registerMockHandler`, keyed by HTTP method (GET/POST/PUT/PATCH/DELETE) and path, for every distinct method+path combination these screens call, following the existing pattern in `src/mock/setup.ts`.
3. WHILE `VITE_MOCK` is not set to `"true"`, THE Frontend_App SHALL NOT make any real network request from the screens introduced by this integration.
4. THE Frontend_App SHALL NOT introduce a second, parallel mock mechanism distinct from `isMockMode()` / `mock-api-client`.
5. WHILE mock mode is active, THE Frontend_App SHALL bypass form validation and progression gates on every new form and multi-step flow introduced by this integration, per the `mock-mode-bypass-validation` steering document.
6. IF a screen introduced by this integration calls a method+path with no registered mock handler, THEN THE mock-api-client SHALL throw an error identifying the missing method and path rather than silently returning fallback data.

---

### Requirement 3: Integration Scope Constraints

**User Story:** As the project owner, I want this integration strictly limited to frontend scaffolding and UI parity, so that backend work and tooling changes remain deferred to a later phase.

#### Acceptance Criteria

1. THE Frontend_App SHALL NOT initiate any network request to a real backend API, database, or third-party service (including but not limited to S3, Bedrock, or Auth0 usage beyond the existing onboarding flow) as part of this integration.
2. THE Frontend_App SHALL use only local mock or static data in place of any backend, database, or third-party service response during this integration.
3. THE Frontend_App SHALL NOT add test files, test runners, linters, formatters, or type-check scripts as part of this integration, per the `no-quality-tooling` steering document.
4. THE Frontend_App SHALL NOT modify, rewire, or re-enable the `CompanySettingsStep` component, regardless of its current enabled or disabled state, as part of this integration.
5. THE Frontend_App SHALL preserve every existing onboarding route, component, and behavior unchanged, except for modifications strictly limited to wrapping existing onboarding components within the App Shell layout and wiring App Shell navigation.
6. THE Frontend_App SHALL NOT alter existing onboarding route paths, step order, or step-internal logic or behavior as part of App Shell integration.

---

### Area: App Shell (Net-New)

### Requirement 4: Authenticated Top Navigation Bar

**User Story:** As a logged-in user, I want a top navigation bar with context-aware back navigation and access to my profile, so that I can orient myself and manage my session from anywhere in the app.

#### Acceptance Criteria

1. THE Top_Navbar SHALL render on every authenticated route and display, at minimum, a back/context button (when a parent route exists), the current page's title or the Flowlee brand mark, and a user profile control.
2. WHEN the current route has a defined parent route, THE Top_Navbar SHALL render a back button that navigates to that parent route when activated.
3. WHEN the current route has a defined parent route, THE Top_Navbar SHALL render the current page's title instead of the Flowlee brand mark.
4. WHEN the current route has no defined parent route, THE Top_Navbar SHALL render the Flowlee brand mark instead of a page title, and SHALL NOT render a back button.
5. WHEN the user activates the profile control, THE Top_Navbar SHALL reveal a panel showing the user's name, role, an admin-management link (WHERE the user is an admin), and a logout action.
6. WHEN the user activates a control outside the profile panel while it is open, THE Top_Navbar SHALL dismiss the profile panel.
7. WHEN the user activates the logout action, THE Top_Navbar SHALL invoke this repo's existing auth logout flow, resulting in the user's session being terminated and the user being treated as unauthenticated.

---

### Requirement 5: Authenticated Bottom Navigation Bar

**User Story:** As a mobile user, I want a bottom navigation bar that clearly shows which section I'm in, so that I can switch between the app's main areas with one tap.

#### Acceptance Criteria

1. THE Bottom_Navbar SHALL render on every authenticated route except the AI_Chat_Page, and SHALL NOT render on any unauthenticated route.
2. THE Bottom_Navbar SHALL provide navigation entries for at least Dashboard, Projects_List, and Team_Page, and SHALL NOT provide more than 5 navigation entries in total.
3. WHEN the current route matches a Bottom_Navbar entry's path (or a sub-path of it), THE Bottom_Navbar SHALL visually distinguish that entry from the other entries via a cutout/highlight treatment.
4. WHEN the current route matches a Bottom_Navbar entry's path (or a sub-path of it), THE Bottom_Navbar SHALL set that entry's `aria-current="page"` attribute so assistive technology can identify it as the current entry.
5. WHEN the current route does not match any Bottom_Navbar entry's path or sub-path, THE Bottom_Navbar SHALL display all entries without the cutout/highlight treatment and without the `aria-current` attribute.
6. WHEN the user activates a Bottom_Navbar entry, THE Frontend_App SHALL navigate to that entry's associated route.
7. THE Bottom_Navbar SHALL expose an accessible name for each entry via `aria-label`, independent of any icon-only visual presentation.

---

### Requirement 6: AI Mascot FAB and Post-Login Greeting

**User Story:** As a logged-in user, I want quick access to the AI assistant and a brief daily catch-up right after I log in, so that I can jump into a conversation or get oriented immediately.

#### Acceptance Criteria

1. THE AI_Mascot_FAB SHALL render on every authenticated route except the AI_Chat_Page itself.
2. WHEN the user activates the AI_Mascot_FAB, THE Frontend_App SHALL navigate to the AI_Chat_Page.
3. WHEN a user completes login and lands on an authenticated route other than the AI_Chat_Page, THE Greeting_Bubble SHALL appear above the AI_Mascot_FAB showing a time-of-day greeting ("Good morning" 05:00–11:59, "Good afternoon" 12:00–16:59, "Good evening" 17:00–04:59, device local time) with the user's first name.
4. WHEN 9 seconds have elapsed since the Greeting_Bubble appeared without the user dismissing it, THE Greeting_Bubble SHALL dismiss itself automatically.
5. WHEN the user activates the Greeting_Bubble's close control, THE Greeting_Bubble SHALL dismiss within 200 milliseconds.
6. THE Greeting_Bubble SHALL render at most once per sign-in session, and SHALL NOT reappear on subsequent route changes, reloads, or additional tabs within that same sign-in session.
7. IF the authenticated user's first name is unavailable or empty, THEN THE Greeting_Bubble SHALL display the time-of-day greeting alone, without a name.

---

### Area: Dashboard (Replace-in-Place)

### Requirement 7: Dashboard Greeting Header

**User Story:** As a logged-in user, I want the Dashboard to greet me by name with the right time-of-day context, so that the screen feels personal from the first glance.

#### Acceptance Criteria

1. WHEN an authenticated user's Dashboard finishes loading, THE Dashboard SHALL replace the placeholder heading with a greeting header showing a time-of-day salutation ("Good morning" for 05:00–11:59, "Good afternoon" for 12:00–16:59, or "Good evening" for 17:00–04:59, based on the user's device local time) followed by the user's first name.
2. IF the authenticated user's first name is unavailable or empty, THEN THE Dashboard SHALL display the time-of-day salutation alone in the greeting header, without a name.

---

### Requirement 8: Dashboard Day/Week Toggle

**User Story:** As a user planning my time, I want to switch the Dashboard's calendar between a day view and a week view, so that I can see either fine-grained detail or a broader overview.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a single toggle control with exactly two mutually exclusive options, Timeline_Day_View and Timeline_Week_View, for switching the calendar area between these two views.
2. WHEN the Dashboard is rendered at the `/dashboard` route, THE Dashboard SHALL default the calendar area to Timeline_Day_View, regardless of any view selected during a previous visit.
3. WHEN the user switches modes, THE Dashboard SHALL render the selected view anchored to the same date shown immediately before the switch, without navigating away from `/dashboard`.
4. WHILE the calendar area displays Timeline_Day_View or Timeline_Week_View, THE Dashboard SHALL indicate on the toggle control which of the two views is currently active.

---

### Requirement 9: Dashboard Day View Timeline with Drag-and-Drop

**User Story:** As a user reviewing my day, I want to see my meetings, tasks, breaks, and deadlines positioned on an hourly timeline and reschedule them by dragging, so that I can adjust my day without opening a separate editor.

#### Acceptance Criteria

1. THE Timeline_Day_View SHALL render each timeline block for the current day as a card positioned proportionally along a continuous hourly axis spanning the full 24-hour period (00:00–24:00) of the current day, color-coded by block type (meeting, task, deadline, break), with overlapping blocks rendered side by side rather than obscuring each other.
2. IF the current time falls within the displayed 00:00–24:00 axis range, THEN THE Timeline_Day_View SHALL render a "now" indicator line at the vertical position corresponding to the current time.
3. IF the current time does not fall within the displayed day (e.g. viewing a different day), THEN THE Timeline_Day_View SHALL NOT render the "now" indicator line.
4. WHEN the user drags a timeline block of any type (meeting, task, deadline, or break) vertically to a new position within the axis range, THE Timeline_Day_View SHALL update that block's time to the value corresponding to the drop position, snapped to the nearest 5-minute increment, and persist the change across reload.
5. IF the user drags a timeline block to a drop position before 00:00 or after 24:00, THEN THE Timeline_Day_View SHALL clamp that block's new time to the nearest boundary (00:00 or 24:00 minus the block's duration).
6. IF a drag-updated block's time change fails to persist, THEN THE Timeline_Day_View SHALL revert that block to its pre-drag time and display an error indicating the change could not be saved.
7. WHEN the Timeline_Day_View contains no blocks for the current day, THE Timeline_Day_View SHALL render an empty-state message instead of an empty timeline.

---

### Requirement 10: Dashboard Week View Grid

**User Story:** As a user planning ahead, I want to see my whole business week at a glance, so that I can spot conflicts and free time across days.

#### Acceptance Criteria

1. THE Timeline_Week_View SHALL render five day columns (Monday through Friday) using an identical hourly axis range and vertical scale across all columns, with each day's timeline blocks positioned so that a block's vertical offset and height correspond proportionally to its start time and duration relative to that shared axis range.
2. IF the current date falls within the displayed week, THEN THE Timeline_Week_View SHALL apply a distinct background or border treatment to that day's column that is not applied to any of the other columns.
3. WHEN the user drags a timeline block and drops it within a day column's valid hourly axis range in the Timeline_Week_View, THE Timeline_Week_View SHALL update that block's day and time to correspond to the drop column and vertical position, snapped to the nearest 5-minute increment.
4. IF the user drops a timeline block outside all day columns or outside the displayed hourly axis range in the Timeline_Week_View, THEN THE Timeline_Week_View SHALL return the block to its original day and time without saving any change.

---

### Requirement 11: Dashboard Widget Board

**User Story:** As a user, I want a customizable grid of widgets on my Dashboard that remembers how I've arranged them, so that I can surface the information that matters most to me.

#### Acceptance Criteria

1. THE Widget_Board SHALL render as a grid of Widget tiles occupying a distinct region of the Dashboard that does not overlap the Timeline_Day_View / Timeline_Week_View.
2. WHEN the user drags a Widget to a new grid position, THE Widget_Board SHALL update that Widget's position without overlapping another Widget. IF the user releases a dragged Widget over a position that would overlap another Widget or that falls outside the Widget_Board's grid bounds, THEN THE Widget_Board SHALL return that Widget to the position it occupied before the drag started.
3. WHEN the user resizes a Widget to an allowed size for that Widget type, THE Widget_Board SHALL update that Widget's occupied grid cells accordingly. IF resizing a Widget to the requested size would cause it to overlap another Widget, THEN THE Widget_Board SHALL reject the resize and retain that Widget's prior size and occupied grid cells.
4. THE Widget_Board SHALL persist the current layout (Widget identities, positions, and sizes) across page reloads and browser sessions on the same device. WHEN the Widget_Board is rendered for a user with no previously persisted layout on the current device, THE Widget_Board SHALL render a default set of Widgets in a default arrangement.
5. WHEN the user removes a Widget from the Widget_Board, THE Widget_Board SHALL exclude that Widget from the persisted layout and free its previously occupied grid cells for other Widgets, until the user adds that Widget back via the add-Widget control.
6. WHEN the user activates the Widget_Board's add-Widget control and selects a Widget type not currently on the board, THE Widget_Board SHALL add a Widget of that type to the grid at a non-overlapping position and include it in the persisted layout.

---

### Requirement 12: Dashboard Widgets

**User Story:** As a user, I want at-a-glance widgets for my projects, alerts, documents, action items, milestones, and personal photos, so that the Dashboard surfaces what I need without navigating away.

#### Acceptance Criteria

1. THE Widget_Board SHALL offer, at minimum, the following Widget types: KPI project stats; active alerts limited to the 5 most recently triggered alerts that have not been dismissed or resolved; recent documents limited to the 5 most recently modified documents; recommended action items limited to the 5 action items flagged as highest priority in the mock data; weekly milestones limited to the 10 milestones with due dates falling within the current calendar week; and a personal photo gallery.
2. THE KPI stats Widget SHALL display, at minimum, the count of active projects and the overall completion percentage, calculated as the average completion percentage across all active projects in the mock project data, rounded to the nearest whole percent and displayed as a value between 0% and 100%.
3. THE personal photo gallery Widget SHALL allow the user to upload, reorder, and delete photos in JPEG, PNG, GIF, or WebP format, capping the collection at 10 images per user.
4. IF the user attempts to upload an image exceeding 20 MB or a file whose type is not JPEG, PNG, GIF, or WebP to the personal photo gallery Widget, THEN THE personal photo gallery Widget SHALL reject that file and display an error indicating the specific reason (unsupported type or size limit).
5. WHILE the personal photo gallery Widget's collection contains 10 images, IF the user attempts to upload another image, THEN THE personal photo gallery Widget SHALL reject the upload and display an error indicating the gallery is full.

---

### Area: Projects List (Net-New)

### Requirement 13: Projects Grid and Client Filtering

**User Story:** As a user managing multiple projects, I want a filterable grid of project cards, so that I can quickly find and open the project I need.

#### Acceptance Criteria

1. THE Projects_List SHALL render each project as a Project_Card in a grid that displays 1 column when the viewport width is below 640px, 2 columns when the viewport width is between 640px and 1023px, and 3 or more columns when the viewport width is 1024px or greater.
2. THE Projects_List SHALL render a client filter control listing an "Internal" option first, followed by every client that owns at least one project sorted alphabetically in ascending, case-insensitive order.
3. WHILE no client filter has been selected, THE Projects_List SHALL render Project_Cards for all projects regardless of client.
4. WHEN the user selects a client filter value, THE Projects_List SHALL render only Project_Cards for projects matching that client (or, for "Internal", projects with no external client).
5. WHILE the active client filter matches no projects, THE Projects_List SHALL render an empty-state message indicating that no projects match the selected filter in place of Project_Cards, while continuing to display the "+" creation card.
6. THE Projects_List SHALL render a "+" creation card as the last grid item regardless of the active client filter, WHICH navigates to the Project_Wizard's first step when activated.

---

### Requirement 14: Project Card

**User Story:** As a user scanning the Projects_List, I want each card to summarize a project's status, progress, and team, so that I can assess it without opening the detail page.

#### Acceptance Criteria

1. THE Project_Card SHALL display, at minimum, the project's cover image (when set), client name, project title, and a progress bar showing the project's `progress` value as a percentage between 0 and 100.
2. IF a project has no cover image set, THEN THE Project_Card SHALL display a fallback placeholder image in place of the cover image.
3. THE Project_Card SHALL display avatars for the project owner and up to 4 additional project members, and SHALL display a visual indicator (such as an icon, label, or badge) that distinguishes the owner's avatar from other members' avatars.
4. WHILE a project has more than 4 members excluding the owner, THE Project_Card SHALL display a count indicator showing the number of members not shown as avatars.
5. WHILE a project has one or more active alerts, THE Project_Card SHALL display a badge showing the exact alert count for counts from 1 to 99, and an indication that the count exceeds 99 for counts greater than 99.
6. WHEN the user activates a Project_Card via pointer click, tap, or keyboard interaction, excluding activation of its edit or delete controls, THE Frontend_App SHALL navigate to that project's Project_Detail screen.

---

### Requirement 15: Project and Client Management Dialogs

**User Story:** As a user managing projects, I want to create, edit, delete, and add clients without leaving the Projects_List, so that routine management stays fast.

#### Acceptance Criteria

1. THE Projects_List SHALL provide, accessible via a "New Project" control, per-Project_Card "Edit" and "Delete" controls, and an "Add Client" control, a create-project dialog, an edit-project dialog, a delete-project confirmation dialog, and an add-client dialog, respectively.
2. WHEN the user confirms the create-project dialog with valid input (a non-empty project name of at most 100 characters and a selected client), THE Projects_List SHALL add the new project to the mock project collection and render its Project_Card.
3. WHEN the user confirms the edit-project dialog with valid input (a non-empty project name of at most 100 characters and a selected client), THE Projects_List SHALL update the corresponding project's data in the mock project collection and re-render its Project_Card to reflect the changes.
4. WHEN the user confirms the add-client dialog with valid input (a non-empty client name of at most 100 characters), THE Projects_List SHALL add the new client to the mock client collection and make it available for selection in the create-project and edit-project dialogs.
5. WHEN the user confirms the delete-project confirmation dialog, THE Projects_List SHALL remove the corresponding project from the mock project collection and its Project_Card from the grid.
6. IF the user confirms the create-project, edit-project, or add-client dialog with invalid input (a required field left empty or a value exceeding its specified maximum length), THEN THE Projects_List SHALL keep the dialog open, display a validation message identifying the invalid field(s), and SHALL NOT modify the mock project or client collection.
7. IF the user attempts to delete or reassign the client designated as the default "Internal" client while it is referenced by at least one existing project, THEN THE add-client / edit dialogs SHALL prevent the operation and display a message indicating that the client is in use by an existing project and cannot be deleted or reassigned.

---

### Area: Project Creation Wizard (Net-New)

### Requirement 16: Wizard Step 1 — Project Form and Chat Panel

**User Story:** As a user creating a new project, I want a form for the project basics alongside an AI chat panel, so that I can either fill the form directly or lean on the assistant.

#### Acceptance Criteria

1. WHILE the viewport width is at or above 1024px, THE Project_Wizard's first step SHALL render a two-column split-panel layout with the project form on the left and the Wizard_Chat_Panel on the right.
2. WHILE the viewport width is below 1024px, THE Project_Wizard's first step SHALL render the project form only, without the Wizard_Chat_Panel.
3. THE project form SHALL collect, at minimum: name (1 to 100 characters), brief (20 to 500 characters), owner (selected from a list of users), deadline (a calendar date of today or later), budget (a non-negative numeric value up to 999,999,999.99), project type (selected from a predefined list of project types), and an optional thumbnail image (an image file up to 5 MB).
4. IF the user submits the project form with an empty name, a name longer than 100 characters, a brief shorter than 20 characters or longer than 500 characters, no owner selected, no deadline selected, a deadline earlier than today, or no project type selected, THEN THE project form SHALL block submission and display a field-level validation message for each invalid field.
5. WHEN the user submits a valid project form, THE Project_Wizard SHALL navigate to its second step, carrying the submitted form data forward.
6. WHEN the user sends a chat message of 1 to 2000 characters through the Wizard_Chat_Panel, THE Wizard_Chat_Panel SHALL add the message to the chat log and render a simulated assistant reply within 3 seconds.
7. IF the user attempts to send an empty or whitespace-only message through the Wizard_Chat_Panel, THEN THE Wizard_Chat_Panel SHALL prevent the send action.

---

### Requirement 17: Wizard Step 1 — Drag-to-Fill Demo Data

**User Story:** As a user exploring the wizard, I want to drag a sample document onto the chat panel and have the form auto-fill, so that I can see the flow working without typing everything myself.

#### Acceptance Criteria

1. WHEN the user views the Project_Wizard's first step, THE Project_Wizard SHALL render a draggable mock document affordance as a UI element positioned outside the boundaries of both the form panel and the Wizard_Chat_Panel.
2. WHEN the user drags the mock document onto the Wizard_Chat_Panel and releases it within the Wizard_Chat_Panel boundaries, THE Project_Wizard SHALL populate every project form field with its corresponding predefined demo value.
3. WHEN the Project_Wizard populates the project form fields from the mock document drop, THE Project_Wizard SHALL append a chat message to the Wizard_Chat_Panel indicating that the form was populated with demo data.
4. IF the user releases the mock document outside the Wizard_Chat_Panel boundaries, THEN THE Project_Wizard SHALL return the mock document affordance to its original position and SHALL NOT modify the project form fields or the Wizard_Chat_Panel content.
5. IF the mock document affordance has already been used to populate the form during the current wizard session, THEN THE Project_Wizard SHALL NOT render the draggable mock document affordance on the first step.

---

### Requirement 18: Wizard Step 2 — AI Analysis and Milestone Roadmap

**User Story:** As a user who just submitted a project brief, I want the wizard to propose a milestone roadmap I can edit, so that I don't have to plan the whole project from scratch.

#### Acceptance Criteria

1. WHEN the Project_Wizard's second step is entered with valid step-1 data, THE Project_Wizard SHALL render a loading sequence of at most 30 seconds followed by a generated analysis containing a Milestone_Roadmap (at most 20 milestones), a task list, a risks section, and an open-questions section.
2. IF the analysis generation fails or times out after 30 seconds, THEN THE Project_Wizard SHALL display an error message and a control to retry generation.
3. IF the generated analysis contains zero milestones, THEN THE Milestone_Roadmap SHALL render an empty-state message and still offer the "add milestone" affordance.
4. THE Milestone_Roadmap SHALL render each milestone as a card in a horizontally scrollable row connected by a track line, plus an "add milestone" affordance at the end, disabled once 20 milestones exist.
5. WHEN the user selects a milestone in the Milestone_Roadmap that is not the currently selected milestone, THE task list SHALL filter to show only tasks belonging to that milestone within 300 milliseconds.
6. WHEN the user selects the already-selected milestone again, THE task list SHALL revert to showing all tasks within 300 milliseconds.
7. WHEN the user adds a milestone with a non-empty name of at most 100 characters, renames a milestone to a non-empty name of at most 100 characters, reorders, or deletes a milestone or task within this step, THE Project_Wizard SHALL reflect the change in the Milestone_Roadmap and task list within 300 milliseconds without requiring a page reload.
8. IF the user attempts to rename a milestone or task to an empty name, THEN THE Project_Wizard SHALL reject the rename and retain the milestone's or task's previous name.
9. WHEN the user deletes a milestone that has associated tasks, THE Project_Wizard SHALL also remove those tasks from the task list.
10. IF the Project_Wizard's second step is entered without valid step-1 data (e.g. direct navigation), THEN THE Project_Wizard SHALL redirect to its first step.

---

### Requirement 19: Wizard Step 2 — Task List, Risks, and Open Questions

**User Story:** As a user reviewing the AI analysis, I want to edit generated tasks and see flagged risks and open questions, so that I can shape the plan before committing to a team.

#### Acceptance Criteria

1. THE task list SHALL render each task with its name, a priority chip, a drag handle for reordering, and a delete control.
2. WHEN the user activates a task's priority chip, THE task list SHALL cycle that task's priority to the next value in the high → medium → low → high sequence.
3. WHEN the user drags a task to a new position within its current milestone's group, THE task list SHALL reorder that task to the drop position within the group.
4. WHEN the user drags a task from one milestone's group to another, THE task list SHALL reassign that task to the target milestone at the drop position within the target group.
5. WHEN the user activates a task's delete control, THE task list SHALL remove that task from the task list and from its milestone's task set.
6. THE risks section SHALL render each risk with a severity level (high, medium, or low) shown via a visual treatment that is distinguishable between all three levels, and a description.
7. THE open-questions section SHALL render each AI-generated question as a distinct list item.

---

### Requirement 20: Wizard Step 3 — Team Selection

**User Story:** As a user finishing project setup, I want to pick team members visually or from a list, and see which ones the AI suggests, so that I assemble the right team quickly.

#### Acceptance Criteria

1. THE Team_Selection_Step SHALL provide a toggle between a Member_Graph view and a list view, defaulting to the Member_Graph view.
2. THE Member_Graph SHALL render each Member_Bubble in a state that reflects its status: selected members as full-color bubbles at full opacity, AI-suggested-but-unselected members with reduced opacity (no more than 60% of full opacity) and reduced color saturation (no more than 50% of full saturation) relative to selected members, and unselected non-suggested members in a default full-color, full-opacity appearance visually distinct from the AI-suggested state.
3. WHEN the user activates a Member_Bubble in the Member_Graph, THE Team_Selection_Step SHALL toggle that member's selection state.
4. WHEN the user activates the center control in the Member_Graph, THE Team_Selection_Step SHALL open an add-member popup listing every currently non-selected member, filterable by a search input that matches against member name or skill tags (case-insensitive).
5. THE list view SHALL render each member with a selection checkbox reflecting that member's current selection state, skill tags, a workload indicator, and an AI-suggestion indicator for members identified as AI-suggested.
6. WHEN the user has selected at least one member and confirms the Team_Selection_Step, THE Project_Wizard SHALL create the new project in the mock project collection (including the wizard-generated milestones and tasks) and navigate to that project's Project_Detail screen.
7. IF the user attempts to confirm the Team_Selection_Step with zero members selected, THEN THE Team_Selection_Step SHALL prevent confirmation and display an indication to the user that at least one member must be selected.
8. WHEN the user selects a member from the add-member popup, THE Team_Selection_Step SHALL mark that member as selected in both the Member_Graph and list view, and SHALL close the popup.
9. WHEN the user activates the view toggle control, THE Team_Selection_Step SHALL switch the displayed view between the Member_Graph view and the list view without changing the current member selection state.
10. WHEN the user activates the selection checkbox for a member in the list view, THE Team_Selection_Step SHALL toggle that member's selection state consistently with the Member_Graph view.

---

### Area: Project Detail (Net-New)

### Requirement 21: Project Detail Tab Structure

**User Story:** As a user viewing a project, I want its information organized into clear tabs, so that I can navigate directly to the section I need.

#### Acceptance Criteria

1. THE Project_Detail SHALL render exactly five tabs, in the fixed order Overview, Milestones & Tasks, Team, Documents, and Alerts, for every project.
2. WHERE a project has a defined economics value (the economics field is not null or empty), THE Project_Detail SHALL additionally render an Economics_Tab, positioned immediately after the Overview tab.
3. WHEN the user selects a tab (via click or keyboard activation), THE Project_Detail SHALL render only the selected tab's content and SHALL hide the content of all other tabs.
4. WHERE a project has one or more active alerts, THE Alerts tab's label SHALL display a count badge showing the exact number of active alerts, up to a maximum displayed value of 99 (counts above 99 SHALL display as "99+").
5. IF a project has zero active alerts, THEN THE Alerts tab's label SHALL NOT display a count badge.
6. WHEN the user opens Project_Detail, THE Project_Detail SHALL render the Overview tab as the initially active tab.

---

### Requirement 22: Project Detail — Overview Tab

**User Story:** As a user opening a project, I want a quick summary of who's on it and how it's progressing, so that I get oriented before diving into detail tabs.

#### Acceptance Criteria

1. THE Overview tab SHALL display an avatar for each team member assigned to the project, up to a maximum of 5 visible avatars. IF more than 5 members are assigned to the project, THEN THE Overview tab SHALL display a count indicator showing the number of members beyond the first 5.
2. THE Overview tab SHALL display the project's description text, truncated to 500 characters with a truncation indicator if the description exceeds that length. IF the project has no description, THEN THE Overview tab SHALL display placeholder text indicating that no description has been provided.
3. THE Overview tab SHALL display a thumbnail preview of the project's most recently updated document. IF the project has no documents, THEN THE Overview tab SHALL display a placeholder indicating that no documents have been added.
4. THE Overview tab SHALL display an overall progress indicator representing the project's completion status as a percentage value between 0% and 100%.
5. WHERE the project has `economics` data, THE Overview tab SHALL display a budget summary showing the total allocated budget and the amount spent to date.

---

### Requirement 23: Project Detail — Milestones & Tasks Tab

**User Story:** As a user tracking project execution, I want to see milestones on a timeline and manage tasks beneath them, so that I can assign work and track status in one place.

#### Acceptance Criteria

1. THE Milestones & Tasks tab SHALL render a Milestone_Roadmap-style timeline in which each milestone displays a state indicator identifying whether that milestone's state is completed, current, late, or future.
2. WHEN the user selects a milestone in this tab's timeline that is not the currently selected milestone, THE task rows below SHALL filter to display only that milestone's tasks.
3. WHEN the user selects the milestone that is already the currently selected milestone, THE task rows below SHALL revert to displaying all tasks.
4. THE task rows SHALL each display the task name, a status chip, a priority chip, and an avatar for each of the task's assignees.
5. WHILE a task has no assignee, THE task row SHALL display an unassigned indicator in place of an avatar.
6. WHEN the user activates a task's status chip, THE task row SHALL open a status menu offering the four task statuses (unassigned, in progress, completed, blocked).
7. WHEN the user selects a status option from the status menu, THE Project_Detail SHALL set the task's status to the selected option and close the status menu.
8. WHEN the user activates a task's assign/reassign control, THE Project_Detail SHALL open an assignment dialog that lists the project's team members and indicates as suggested the team member(s) with the fewest tasks currently assigned to them within the project, where a member's assigned task count includes only tasks with status in progress or blocked.
9. WHEN the user confirms a member in the assignment dialog, THE Project_Detail SHALL set that member as the task's assignee and, WHERE the task's prior status was unassigned, transition it to in-progress.

---

### Requirement 24: Project Detail — Team Tab

**User Story:** As a user reviewing a project's staffing, I want a graph scoped to just that project's members, so that I can see workload and alerts for this project only.

#### Acceptance Criteria

1. THE Team tab SHALL render a Member_Graph containing only Member_Bubbles for members of the current project's member list, excluding all other team members.
2. WHERE a member represented in this tab's Member_Graph has a workload at or above 85%, THE Member_Graph SHALL render that member's Member_Bubble with the overload indicator defined in Requirement 34.
3. WHERE the current project has at least one active alert, THE Member_Graph in this tab SHALL render a distinct visual indicator on the graph reflecting the project's alert status, consistent with the alert glow/highlight described for Cluster_Graph in Requirement 34.
4. WHEN the user activates a Member_Bubble in this tab's Member_Graph, THE Project_Detail SHALL display that member's detail information.

---

### Requirement 25: Project Detail — Documents Tab

**User Story:** As a user managing project files, I want to browse, upload, and link documents to milestones and tasks, so that reference material stays organized.

#### Acceptance Criteria

1. WHEN the Documents tab is displayed, THE Documents tab SHALL render the project's documents in a grid that can be filtered by milestone, task, and file name, showing a thumbnail preview for documents that support one and a generic file-type icon for documents that do not.
2. WHEN the user initiates adding a document, THE Documents tab SHALL display an add-document dialog that allows selecting a file of any type, entering an optional name override of up to 255 characters, and selecting optional milestone/task links.
3. IF the user selects a file exceeding 50 MB in the add-document dialog, THEN THE add-document dialog SHALL block the upload action, display a size-limit error message, and retain the previously entered name override and milestone/task selections.
4. WHEN the user initiates editing a document's links, THE Documents tab SHALL display an edit-links dialog that allows changing or removing the document's milestone/task associations without altering its name or file.
5. WHEN the user confirms the add-document dialog with a valid file under the size limit, THE Documents tab SHALL add the new document to the project's document collection and render it in the grid.
6. IF the user cancels the add-document dialog, THEN THE Documents tab SHALL close the dialog without adding a document to the project's document collection.
7. WHEN the user confirms the edit-links dialog, THE Documents tab SHALL update the document's milestone/task associations to match the dialog's selections and close the dialog.
8. IF the user cancels the edit-links dialog, THEN THE Documents tab SHALL close the dialog and retain the document's milestone/task associations as they were before the dialog was opened.

---

### Requirement 26: Project Detail — Alerts Tab

**User Story:** As a user checking on project health, I want a clear list of active issues, so that I know what needs attention.

#### Acceptance Criteria

1. THE Alerts tab SHALL render every active alert for the project in a stable order that does not change between renders for the same set of active alerts.
2. THE Alerts tab SHALL render, for each active alert, an icon that visually distinguishes its alert type from the icons of other alert types.
3. THE Alerts tab SHALL render, for each active alert, a non-empty text description of the alert.
4. IF a project has zero active alerts, THEN THE Alerts tab SHALL render an empty-state message indicating that no active alerts exist for the project.
5. WHILE the number of active alerts exceeds the visible area of the Alerts tab, THE Alerts tab SHALL present the alert list within a scrollable container so that all active alerts remain accessible.

---

### Requirement 27: Project Detail — Economics Tab

**User Story:** As a user responsible for a project's budget, I want a financial breakdown with charts, so that I can track spend against budget without leaving the project.

#### Acceptance Criteria

1. WHEN the user opens the Economics_Tab, THE Economics_Tab SHALL render a budget summary card showing total budget, amount spent, and remaining budget, and a cost-by-category donut chart, in a left column.
2. WHEN the user opens the Economics_Tab, THE Economics_Tab SHALL render a right column with switchable sub-tabs (budget variance, invoices, cost items, and hours), with the budget variance sub-tab selected by default.
3. WHEN the user switches the Economics_Tab's sub-tab, THE Economics_Tab SHALL render only the selected sub-tab's chart or list.
4. WHEN a sub-tab has no underlying data (e.g. no invoices, no cost items), THE Economics_Tab SHALL render an empty-state message for that sub-tab instead of an empty chart or list.
5. IF the cost-by-category donut chart has no cost data, THEN THE Economics_Tab SHALL render an empty-state message in place of the chart.
6. IF the Economics_Tab's financial data fails to load, THEN THE Economics_Tab SHALL render an error message indicating the data could not be loaded.
7. IF the Economics_Tab's financial data fails to load, THEN THE Economics_Tab SHALL provide a control to retry loading the data.

---

### Area: AI Chat (Net-New)

### Requirement 28: Chat Session Sidebar

**User Story:** As a user of the AI assistant, I want to see and manage my past conversations, so that I can pick up where I left off or start fresh.

#### Acceptance Criteria

1. THE AI_Chat_Page SHALL render a Chat_Session_Sidebar listing past chat sessions ordered most-recently-active first, each with a title and a relative timestamp, as a fixed panel on viewports 768px and wider and as an overlay drawer on viewports narrower than 768px.
2. WHEN the user activates a session in the Chat_Session_Sidebar, THE AI_Chat_Page SHALL load that session's message history into the chat area.
3. WHEN the user activates a session's delete control, THE Chat_Session_Sidebar SHALL remove that session from the mock session collection.
4. IF the session removed via the delete control was the active session, THEN THE AI_Chat_Page SHALL clear the chat area and start a new, unsaved session.
5. WHEN the user sends the first message within a new, unsaved session, THE AI_Chat_Page SHALL add that session to the mock session collection and render it in the Chat_Session_Sidebar.
6. THE Chat_Session_Sidebar SHALL expose the delete control on hover on viewports 768px and wider and via a swipe-left gesture on viewports narrower than 768px.

---

### Requirement 29: Chat Message Area with Markdown Rendering

**User Story:** As a user reading assistant responses, I want formatted text, code, and tables to render properly, so that structured answers are easy to read.

#### Acceptance Criteria

1. THE AI_Chat_Page SHALL render each message as a bubble, aligning user message bubbles to the right side of the message list and assistant message bubbles to the left side, with a visually distinct background or border style for each role.
2. THE AI_Chat_Page SHALL render assistant message text as Markdown, including support for bold/italic text, lists, tables, links, and code blocks.
3. WHEN the user sends a message, THE AI_Chat_Page SHALL append the message to the message list within 100 milliseconds of the send action.
4. WHEN the AI_Chat_Page appends a user message to the message list, THE AI_Chat_Page SHALL render a simulated assistant reply after a delay between 500 milliseconds and 1500 milliseconds.
5. THE AI_Chat_Page SHALL render user message text as plain text without Markdown formatting.
6. IF an assistant message contains malformed or unsupported Markdown syntax, THEN THE AI_Chat_Page SHALL render the affected content as plain text without interrupting the rendering of the rest of the message.

---

### Requirement 30: Chat Input — File Attachments

**User Story:** As a user asking the assistant about a document, I want to attach files to my message, so that I don't have to describe the content manually.

#### Acceptance Criteria

1. THE AI_Chat_Page's input area SHALL allow attaching up to 3 files of any file type per message, provided each file is no larger than 5 MB.
2. IF the user attempts to attach a fourth file to a message that already has 3 attached files, THEN THE AI_Chat_Page SHALL reject the attempt, indicate that the maximum of 3 attachments has been reached, and retain the 3 previously attached files unchanged.
3. IF the user attempts to attach a file larger than 5 MB, THEN THE AI_Chat_Page SHALL reject that file, display an error indicating the 5 MB size limit has been exceeded, and retain any previously attached files unchanged.
4. WHEN the user attaches a file to a message, THE AI_Chat_Page SHALL render a preview for that file showing the file name and a control to remove it, before the message is sent.
5. WHEN the user activates the remove control on an attached file's preview, THE AI_Chat_Page SHALL remove that file from the message and make its attachment slot available for a new attachment.

---

### Requirement 31: Chat Input — Voice Recording

**User Story:** As a user who prefers speaking over typing, I want to record a voice note and send it as a message, so that I can communicate hands-free.

#### Acceptance Criteria

1. WHERE the browser supports the required media APIs, THE AI_Chat_Page's input area SHALL provide a voice recording control.
2. IF the browser does not support the required media APIs, THEN THE AI_Chat_Page SHALL hide the voice recording control from the input area.
3. WHEN the user starts a voice recording and microphone access is granted, THE AI_Chat_Page SHALL display an elapsed-time indicator that updates at least once per second, counting up from 0 seconds.
4. IF the user denies microphone access when starting a voice recording, THEN THE AI_Chat_Page SHALL display an error message indicating that microphone access was denied and return the input area to its idle state.
5. WHEN the elapsed recording time reaches 60 seconds, THE AI_Chat_Page SHALL automatically stop the recording, finalize it, and enable sending it as a message attachment.
6. WHEN the user manually stops a voice recording that is at least 1 second long before the elapsed time reaches 60 seconds, THE AI_Chat_Page SHALL finalize the recording and enable sending it as a message attachment.
7. WHEN the user selects the cancel control during an in-progress recording, THE AI_Chat_Page SHALL discard the recorded audio and return the input area to its idle state.

---

### Area: Team Page (Net-New)

### Requirement 32: Team Page Grouping Selector

**User Story:** As a user viewing the whole team, I want to switch how members are grouped, so that I can see the organization from different angles.

#### Acceptance Criteria

1. THE Team_Page SHALL provide a grouping selector offering exactly three mutually exclusive grouping modes: project, organizational unit, and client.
2. WHEN the Team_Page is initially displayed, THE Team_Page SHALL set the grouping mode to project.
3. WHEN the user changes the grouping mode, THE Cluster_Graph SHALL re-render its clusters according to the newly selected grouping, replacing the previously displayed clusters without requiring a page reload.
4. IF a team member does not have a value assigned for the currently selected grouping mode, THEN THE Cluster_Graph SHALL place that member in a distinct cluster indicating no assignment.

---

### Requirement 33: Cluster Graph and Physics Interactions

**User Story:** As a user exploring team structure, I want to drag, flick, and rotate clusters, so that the graph feels responsive and lets me inspect crowded areas.

#### Acceptance Criteria

1. THE Cluster_Graph SHALL render each group as a cluster with a labeled center and its Member_Bubbles arranged evenly spaced in a ring around that center.
2. WHILE the user drags a cluster center, THE Cluster_Graph SHALL reposition that cluster to follow the pointer. WHEN the user releases the drag, IF the release velocity exceeds a minimum threshold, THEN THE Cluster_Graph SHALL continue moving that cluster under decaying momentum for up to 2 seconds after release; IF the release velocity does not exceed that threshold, THEN THE Cluster_Graph SHALL stop that cluster's movement immediately upon release.
3. WHILE the user drags a Member_Bubble around its cluster's ring, THE Cluster_Graph SHALL rotate that ring to follow the pointer. WHEN the user releases the drag, IF the release angular velocity exceeds a minimum threshold, THEN THE Cluster_Graph SHALL continue rotating that ring under decaying angular momentum for up to 2 seconds after release; IF the release angular velocity does not exceed that threshold, THEN THE Cluster_Graph SHALL stop that ring's rotation immediately upon release.
4. WHEN the user activates a Member_Bubble without moving the pointer beyond the minimum drag distance that distinguishes a drag from an activation, THE Cluster_Graph SHALL display that member's detail information, at minimum the member's name, role, and current workload, together with a dismiss control.
5. WHEN the user activates a cluster's center without moving the pointer beyond the minimum drag distance that distinguishes a drag from an activation, THE Cluster_Graph SHALL display a tooltip summarizing that cluster's underlying project or group, at minimum the group's name and its associated project(s), together with a dismiss control.
6. WHEN the user dismisses a member's detail information or a cluster's tooltip via its dismiss control, or activates a control outside it, THE Cluster_Graph SHALL close that detail information or tooltip.
7. WHEN the user activates a different Member_Bubble or cluster center while a detail information panel or tooltip is already open, THE Cluster_Graph SHALL replace the currently displayed detail information or tooltip with the one corresponding to the newly activated element.

---

### Requirement 34: Member Bubble Visual Indicators

**User Story:** As a user scanning the Cluster_Graph, I want overloaded or flagged members to stand out, so that I can spot problems at a glance.

#### Acceptance Criteria

1. IF a member's photo is available, THEN THE Member_Bubble SHALL render the member's photo.
2. IF a member's photo is unavailable or fails to load, THEN THE Member_Bubble SHALL render a gradient-initials fallback derived deterministically from the member's name or unique identifier, such that the same member always renders the same fallback.
3. WHILE a member's workload is at or above 85%, THE Member_Bubble SHALL render an overload indicator (e.g. a colored ring) that is visually distinguishable from the Member_Bubble's appearance when workload is below 85%.
4. WHILE a cluster's underlying project has at least one active alert, THE Cluster_Graph SHALL render a glow/highlight on that cluster that is visually distinguishable from clusters with no active alerts.

---

### Area: Admin Panel (Net-New)

### Requirement 35: Admin Route Guard

**User Story:** As a product owner, I want the Admin_Panel restricted to admin users, so that ordinary users cannot reach management tooling.

#### Acceptance Criteria

1. WHEN an authenticated user whose profile indicates admin status navigates to the Admin_Panel's route, THE Admin_Route_Guard SHALL render the Admin_Panel.
2. IF a non-admin authenticated user navigates to the Admin_Panel's route, THEN THE Admin_Route_Guard SHALL redirect that user to the Dashboard instead of rendering the Admin_Panel.
3. IF an unauthenticated user navigates to the Admin_Panel's route, THEN THE Admin_Route_Guard SHALL prevent the Admin_Panel from rendering for that user.
4. WHILE the authenticated user's admin status has not yet been determined, THE Admin_Route_Guard SHALL prevent the Admin_Panel from rendering until the determination completes.

---

### Requirement 36: Admin Panel Tabbed CRUD

**User Story:** As an admin, I want tabbed CRUD screens for the core data entities, so that I can manage demo data without leaving the app. The Users tab is a read-only mirror of mock Auth0 profiles; Projects, Team Members, Timeline Blocks, Agent Chat, and Email Trigger remain fully manageable.

#### Acceptance Criteria

1. THE Admin_Panel SHALL render six tabs: Users, Projects, Team Members, Timeline Blocks, Agent Chat, and Email Trigger.
2. WHEN an admin submits a complete create or edit form on the Projects or Team Members tab, THE tab SHALL save the entity to its respective mock entity collection and display the updated entity in the tab's list.
3. IF an admin attempts to delete a project, team member, or timeline block that is referenced by the Email Trigger configuration, THEN THE Projects, Team Members, or Timeline Blocks tab (respectively) SHALL block the deletion and display an error message indicating that the entity is in use by the Email Trigger configuration.
4. WHEN an admin submits a complete create or edit form on the Timeline Blocks tab, THE tab SHALL save the timeline block to the mock timeline block collection and display the updated block in the tab's list.
5. WHEN an admin adds or edits a mock chat message of up to 2000 characters on the Agent Chat tab, THE tab SHALL save the message to the mock conversation used to seed the AI_Chat_Page's initial conversation.
6. WHEN an admin clicks Save on the Email Trigger tab with a target project, task, team member, and between 1 and 10 recipient email addresses selected, THE Email Trigger tab SHALL persist the configuration to the mock data layer, overwriting any existing Email Trigger configuration.
7. IF an admin attempts to add an 11th recipient, a duplicate email address, or an email address that does not match a standard email format (local-part@domain) in the Email Trigger tab, THEN THE Email Trigger tab SHALL reject the addition and display a field-level error indicating the reason.
8. IF an admin submits a create or edit form on the Projects, Team Members, or Timeline Blocks tab with a required field left empty, THEN THE tab SHALL reject the submission and display a field-level error indicating which field is required.
9. WHEN an admin initiates a delete action on the Projects, Team Members, or Timeline Blocks tab, THE tab SHALL prompt the admin for confirmation before removing the entity from its respective mock entity collection.
10. IF an admin clicks Save on the Email Trigger tab without a target project, task, team member, or at least one recipient email address selected, THEN THE Email Trigger tab SHALL block the save and display a field-level error indicating the missing selection.
11. THE Users tab SHALL render a read-only list of mock Auth0 user profiles (name, email, role, admin status) sourced from the mock identity/auth fixtures, and SHALL NOT provide create, edit, or delete controls for user records.
