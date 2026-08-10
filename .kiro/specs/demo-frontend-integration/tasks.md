# Implementation Plan: Demo Frontend Integration

## Overview

This plan builds the integration bottom-up: shared mock data and mock handlers first, then the cross-cutting shared primitives and pure utilities (`Modal`, `Avatar`/`AvatarStack`, `StatusChip`/`PriorityChip`, `resolveRouteMeta`, `greetingFor`, and the other property-templated utilities), then the two heavier shared components (`MemberGraph`, `MilestoneRoadmap`), then the App Shell, and finally each product area (Dashboard, Projects List, Project Wizard, Project Detail, AI Chat, Team Page, Admin Panel) — each area consuming the shared pieces built earlier rather than re-implementing them. Property-based tests (via `fast-check`, per the design's Testing Strategy) are placed immediately after the implementation they validate; template properties (stated once in the design and reused at multiple call sites) are property-tested only at their first/shared implementation site and simply wired in at reuse sites. No lint/format/typecheck tooling setup tasks are included, per Requirement 3.3 and the `no-quality-tooling` steering document; `vitest` and `fast-check` are already present in this repo and are used as-is for the test tasks below.

All new sizing/spacing/typography introduced across every UI task below must use rem units per Requirement 1.6, and must reuse an existing `src/components/ui/` component instead of recreating it wherever one already covers the needed interaction (Requirement 1.1, 1.2, 1.3). `AnimatedBackground` and `LocaleSwitcher` are never duplicated inside new screens (Requirement 1.7) — this is enforced structurally in the App Shell task. No screen introduced by this plan makes a real network call; all data flows through `isMockMode()` / `registerMockHandler` (Requirements 2.3, 2.4, 3.1, 3.2), and every new form/multi-step flow bypasses validation/progression gates while mock mode is active (Requirement 2.5). No task in this plan modifies `CompanySettingsStep` or alters any existing onboarding route/step behavior (Requirements 3.4, 3.5, 3.6).

## Tasks

- [x] 1. Set up dependencies and shared domain types
  - [x] 1.1 Add `react-grid-layout` (`^2.2.3`), `recharts` (`^3.9.2`), `react-markdown` (`^10.1.0`), and `remark-gfm` (`^4.0.1`) to `package.json` and install
    - _Requirements: 11.1, 27.1, 29.2_
  - [x] 1.2 Define shared TypeScript interfaces for the new domain entities (`Project`, `Task`, `Milestone`, `TeamMember`, `Document`, `Alert`, `Economics`, `Client`, `ChatSession`, `ChatMessage`, `TimelineBlock`, `GalleryImage`, `AuthUserProfile`, `ClusterSource`, `GroupingMode`) in a shared fixtures types module
    - _Requirements: 2.1_

- [x] 2. Build mock fixture data and handlers
  - [x] 2.1 Create fixture modules `clients.ts`, `teamMembers.ts`, `projects.ts`, `milestones.ts`, `tasks.ts` under `src/mock/fixtures/` (≥3 records each, cross-referencing real ids), superseding the placeholder `dashboard.ts` shapes
    - _Requirements: 2.1_
  - [x] 2.2 Create fixture modules `documents.ts`, `alerts.ts`, `economics.ts`, `chatSessions.ts`, `chatMessages.ts`, `timelineBlocks.ts`, `galleryImages.ts`, `authUsers.ts`, and the default `widgetLayouts.ts` layout constant
    - _Requirements: 2.1_
  - [x] 2.3 Register mock handlers in `src/mock/setup.ts` for every method+path combination these screens will call (projects, clients, team-members, milestones, tasks, documents, alerts, economics, chat-sessions, chat-messages, timeline-blocks, gallery-images, admin/users read-only, admin/email-trigger), updating the existing `GET /projects`/`/tasks`/`/team` handlers to point at the new fixtures
    - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2_
  - [ ]* 2.4 Write a referential-integrity smoke test walking every fixture module's foreign-key fields and asserting each resolves to a real id in its referenced module
    - _Requirements: 2.1_
  - [ ]* 2.5 Write a mock-handler-coverage smoke test asserting every screen's known method+path calls have a registered handler, and that an unregistered call throws identifying the missing method/path
    - _Requirements: 2.2, 2.6_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Build shared UI primitives
  - [x] 4.1 Implement `Modal` primitive at `src/components/ui/Modal.tsx` (focus trap, Escape, backdrop click, focus-return, `cva`-driven visuals, `className` override support)
    - _Requirements: 1.3, 1.4, 1.5_
  - [x] 4.2 Implement `Avatar` at `src/components/ui/Avatar.tsx` with a deterministic gradient-initials fallback derived from the member's name/id
    - _Requirements: 1.4, 1.5, 34.1, 34.2_
  - [ ]* 4.3 Write property test for the gradient-initials fallback
    - **Property 58: Gradient-initials fallback is a deterministic function of the member's identity seed**
    - **Validates: Requirements 34.1, 34.2**
  - [x] 4.4 Implement `AvatarStack` at `src/components/ui/AvatarStack.tsx` (owner-distinguishing indicator, capped visible avatars, overflow-count indicator)
    - _Requirements: 1.4, 1.5, 14.1, 14.3, 14.4_
  - [ ]* 4.5 Write property test for the avatar-overflow-count invariant
    - **Property 16: Avatar-overflow-count invariant**
    - **Validates: Requirements 14.1, 14.3, 14.4**
  - [x] 4.6 Implement `StatusChip`/`PriorityChip` as `cva` variants at `src/components/ui/StatusChip.tsx` (`variant="unassigned"|"in_progress"|"completed"|"blocked"` and `variant="high"|"medium"|"low"`)
    - _Requirements: 1.4, 1.5, 19.1, 23.4_

- [x] 5. Build shared pure utilities — routing, greeting, validation
  - [x] 5.1 Implement `resolveRouteMeta()` in `src/lib/route-meta.ts` (static route table + dynamic prefix matching)
    - _Requirements: 4.2, 4.3, 4.4_
  - [ ]* 5.2 Write property test for route metadata resolution
    - **Property 1: Route metadata resolution is total and correct**
    - **Validates: Requirements 4.2, 4.3, 4.4**
  - [x] 5.3 Implement `greetingFor(hour, firstName?)` in `src/lib/greeting.ts`
    - _Requirements: 6.3, 6.7, 7.1, 7.2_
  - [ ]* 5.4 Write property test for greeting text formatting
    - **Property 3: Greeting text formatting is a total, deterministic function of time and name**
    - **Validates: Requirements 6.3, 6.7, 7.1, 7.2**
  - [x] 5.5 Implement `validateStringLength(value, { required, minLength, maxLength })` in `src/lib/validation.ts`
    - _Requirements: 15.6_
  - [ ]* 5.6 Write property test for the required-string-length validator
    - **Property 18: Required-string-length validation is a total predicate**
    - **Validates: Requirements 15.6** (reused, no re-test, at Requirements 16.4, 16.6, 16.7, 18.8, 36.5, 36.8, 36.10)

- [x] 6. Build shared pure utilities — selection, formatting, and file/tab helpers
  - [x] 6.1 Implement `selectTopN(items, criterion, cap)` in `src/lib/topN.ts`
    - _Requirements: 12.1_
  - [ ]* 6.2 Write property test for capped top-N selection
    - **Property 10: Capped top-N selection by criterion**
    - **Validates: Requirements 12.1**
  - [x] 6.3 Implement `filterExact(collection, predicate)` in `src/lib/filter.ts`
    - _Requirements: 13.3, 13.4, 13.5_
  - [ ]* 6.4 Write property test for exact filtered-subset matching
    - **Property 15: Filtered set equals exactly the matching subset**
    - **Validates: Requirements 13.3, 13.4, 13.5** (reused, no re-test, at Requirements 20.4, 25.1)
  - [x] 6.5 Implement `formatCountBadge(count)` in `src/lib/badge.ts` (exact count 1–99, "99+" above, no badge at 0)
    - _Requirements: 14.5_
  - [ ]* 6.6 Write property test for alert-count badge formatting
    - **Property 17: Alert-count badge formatting**
    - **Validates: Requirements 14.5** (reused, no re-test, at Requirements 21.4, 21.5)
  - [x] 6.7 Implement `validateFileAcceptance(file, rules, collectionState)` in `src/lib/fileValidation.ts` (generic size/type/capacity rule validator with reason-identifying rejection and state preservation)
    - _Requirements: 25.2, 25.3_
  - [ ]* 6.8 Write property test for the generic file-acceptance validator
    - **Property 42: File-acceptance validator rejects with a reason matching the violated rule, preserving prior state**
    - **Validates: Requirements 25.2, 25.3** (reused, no re-test, at Requirements 30.1, 30.2, 30.3, 30.4, 30.5, 12.4)
  - [x] 6.9 Implement `columnsForWidth(width)` in `src/lib/columns.ts`
    - _Requirements: 13.1_
  - [ ]* 6.10 Write property test for the grid-column step function
    - **Property 13: Grid column count is a step function of viewport width**
    - **Validates: Requirements 13.1**
  - [x] 6.11 Implement `truncateWithFallback(text, maxLength, placeholder)` in `src/lib/truncate.ts`
    - _Requirements: 22.2_
  - [ ]* 6.12 Write property test for description truncation with placeholder fallback
    - **Property 33: Description truncation is bounded at 500 characters with a fallback for empty input**
    - **Validates: Requirements 22.2**
  - [x] 6.13 Implement a single-panel-visible tab helper (`isTabActive(selectedIndex, tabIndex)`) in `src/lib/tabs.ts`
    - _Requirements: 21.3_
  - [ ]* 6.14 Write property test for exactly-one-panel-visible
    - **Property 32: Exactly one panel is visible per selected tab index**
    - **Validates: Requirements 21.3** (reused, no re-test, at Requirements 27.3)

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build shared `MemberGraph` component
  - [x] 8.1 Port `clusterGeometry.ts` (ring radius, angle spacing, circle-packing) into `src/components/MemberGraph/`
    - _Requirements: 33.1_
  - [ ]* 8.2 Write property test for even ring spacing
    - **Property 54: Ring layout evenly spaces members around a cluster's center**
    - **Validates: Requirements 33.1**
  - [x] 8.3 Port `groupingLogic.ts` (`groupByProject`/`groupByUnit`/`groupByClient` + cross-links) into `src/components/MemberGraph/`
    - _Requirements: 32.1, 32.3, 32.4_
  - [ ]* 8.4 Write property test for grouping as a total partition
    - **Property 53: Grouping is a total partition — every member appears in exactly one cluster**
    - **Validates: Requirements 32.3, 32.4**
  - [x] 8.5 Port `gestureClassifier.ts` (drag-vs-tap distance threshold) into `src/components/MemberGraph/`
    - _Requirements: 33.5_
  - [ ]* 8.6 Write property test for drag-vs-activation classification
    - **Property 57: Drag-vs-activation classification is a distance threshold predicate**
    - **Validates: Requirements 33.5**
  - [x] 8.7 Port `useClusterPhysics.ts`, `useClusterMomentum.ts`, `useRingRotation.ts`, and `usePhysicsLoop.ts` (cluster drag/flick momentum, ring rotation/flick momentum, shared RAF loop) into `src/components/MemberGraph/`
    - _Requirements: 33.2, 33.3_
  - [ ]* 8.8 Write property test for bounded momentum/rotation decay
    - **Property 55: Momentum/rotation decay always terminates within a bounded number of ticks**
    - **Validates: Requirements 33.2, 33.3**
  - [x] 8.9 Implement `MemberBubble.tsx` (photo or gradient-initials fallback via `Avatar`, overload ring, selected/AI-suggested opacity-and-saturation states)
    - _Requirements: 20.2, 24.2, 34.1, 34.2, 34.3_
  - [ ]* 8.10 Write property test for member-bubble visual state
    - **Property 28: Member bubble visual state is a total function of (selected, suggested)**
    - **Validates: Requirements 20.2**
  - [ ]* 8.11 Write property test for the overload indicator threshold
    - **Property 40: Overload indicator is a threshold predicate at 85% workload**
    - **Validates: Requirements 24.2, 34.3**
  - [x] 8.12 Implement `ClusterCenter.tsx` (labeled center node, alert glow/highlight)
    - _Requirements: 24.3, 33.1, 34.4_
  - [ ]* 8.13 Write property test for the alert-glow threshold
    - **Property 41: Alert-glow indicator is a threshold predicate at 1 active alert**
    - **Validates: Requirements 24.3, 34.4**
  - [x] 8.14 Implement `DetailPanel.tsx` (single open member-detail/cluster-tooltip popover, dismiss control, click-outside dismiss, replace-on-new-activation)
    - _Requirements: 33.4, 33.6, 33.7, 24.4_
  - [ ]* 8.15 Write property test for single-open-panel behavior
    - **Property 56: At most one detail panel/tooltip is open, and it always reflects the most recent activation**
    - **Validates: Requirements 33.4, 33.6, 33.7, 24.4**
  - [x] 8.16 Implement the public `MemberGraph.tsx` composing bubbles, clusters, physics hooks, and `DetailPanel` behind a `clusters: ClusterSource[]` prop
    - _Requirements: 33.1, 33.2, 33.3, 33.4, 33.5, 33.6, 33.7_

- [x] 9. Build shared `MilestoneRoadmap` component
  - [x] 9.1 Implement `milestoneState.ts` `classify(milestone, today)` in `src/components/MilestoneRoadmap/`
    - _Requirements: 23.1_
  - [ ]* 9.2 Write property test for milestone state classification
    - **Property 35: Milestone state classification is total and deterministic**
    - **Validates: Requirements 23.1**
  - [x] 9.3 Implement `MilestoneCard.tsx` and `MilestoneRoadmap.tsx` (horizontal scroll with connecting track line, select/deselect, add-milestone affordance disabled at 20)
    - _Requirements: 18.3, 18.4, 18.5, 18.6, 23.2, 23.3_
  - [ ]* 9.4 Write property test for the roadmap's 0–20 bound
    - **Property 22: Milestone_Roadmap card count and add-affordance are bounded by 0–20**
    - **Validates: Requirements 18.3, 18.4**
  - [x] 9.5 Implement shared milestone-selection task-filter logic (select-to-filter, re-select-to-revert) reused by the Project Wizard's step 2 and Project Detail's Milestones & Tasks tab
    - _Requirements: 18.5, 18.6, 23.2, 23.3_
  - [ ]* 9.6 Write property test for milestone-selection task filtering
    - **Property 23: Milestone selection toggles task-list filtering**
    - **Validates: Requirements 18.5, 18.6, 23.2, 23.3**

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Build the App Shell
  - [x] 11.1 Add all new authenticated routes to `src/routes.tsx` with `isAuthenticatedLayout: true` (`/dashboard` swap, `/projects`, `/projects/new`, `/projects/new/analysis`, `/projects/new/team`, `/projects/:id`, `/team`, `/agent`, `/admin`), leaving every onboarding route's path/order/behavior untouched
    - _Requirements: 3.5, 3.6, 4.1_
  - [x] 11.2 Implement `AppShell.tsx` wrapping matching routes with `TopNavbar`, route content, `BottomNavbar`, `AiMascotFab`, and `GreetingBubble`, wired into `App.tsx`'s route rendering without touching `AnimatedBackground`/`LocaleSwitcher`'s existing placement
    - _Requirements: 1.7, 3.5, 3.6, 4.1, 5.1, 6.1_
  - [x] 11.3 Implement `TopNavbar.tsx` using `resolveRouteMeta` for back-button/brand-mark/title resolution
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 11.4 Implement `ProfilePanel.tsx` (open on activation, name/role/admin-link/logout, dismiss on outside activation, logout invokes the existing auth logout flow)
    - _Requirements: 4.5, 4.6, 4.7_
  - [x] 11.5 Implement `BottomNavbar.tsx` (≤5 entries incl. Dashboard/Projects/Team, cutout highlight + `aria-current` on match, `aria-label` per entry, hidden on `/agent` and on unauthenticated routes)
    - _Requirements: 5.1, 5.2, 5.6, 5.7_
  - [ ]* 11.6 Write property test for bottom-navbar active-entry highlighting
    - **Property 2: Bottom navbar highlights exactly the matching entry**
    - **Validates: Requirements 5.3, 5.4, 5.5**
  - [x] 11.7 Implement `AiMascotFab.tsx` (renders on every authenticated route except `/agent`, navigates to AI_Chat_Page on activation)
    - _Requirements: 6.1, 6.2_
  - [x] 11.8 Implement `GreetingBubble.tsx` using `greetingFor` (renders once per sign-in session, 9s auto-dismiss, manual dismiss within 200ms, hidden on `/agent`)
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Build the Dashboard greeting header and timeline
  - [x] 13.1 Implement `Dashboard.tsx` replacing the placeholder export, rendering the greeting header via `greetingFor`
    - _Requirements: 7.1, 7.2_
  - [x] 13.2 Implement the day/week `SegmentedToggle` (two mutually-exclusive options, defaults to day view on `/dashboard` mount, preserves the anchored date across switches, indicates the active option)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 13.3 Implement `timelineLayout.ts` (`timeToPosition()`, `assignLanes()`, `snapAndClamp()`)
    - _Requirements: 9.1, 9.4, 9.5, 10.1, 10.3, 10.4_
  - [ ]* 13.4 Write property test for proportional block positioning across day/week views
    - **Property 4: Timeline block position is proportional to time, consistently across day and week views**
    - **Validates: Requirements 9.1, 10.1**
  - [ ]* 13.5 Write property test for lane assignment
    - **Property 5: Overlapping blocks never share a lane**
    - **Validates: Requirements 9.1**
  - [ ]* 13.6 Write property test for drag-drop snap/clamp resolution
    - **Property 7: Drag-drop time resolution snaps to 5 minutes and clamps to valid bounds**
    - **Validates: Requirements 9.4, 9.5, 10.3, 10.4**
  - [x] 13.7 Implement `NowIndicator.tsx` and its day-match visibility logic
    - _Requirements: 9.2, 9.3_
  - [ ]* 13.8 Write property test for now-indicator visibility
    - **Property 6: "Now" indicator visibility is exactly a function of whether the current moment falls in the displayed range**
    - **Validates: Requirements 9.2, 9.3**
  - [x] 13.9 Implement `TimelineBlockCard.tsx` (`cva` variants by block type) and `TimelineDayView.tsx` (proportional positioning, side-by-side overlap via lanes, empty-state message)
    - _Requirements: 9.1, 9.7_
  - [x] 13.10 Implement `useDragTimelineBlock.ts` (optimistic drag update, mock `PUT` persistence, revert-and-error on failure)
    - _Requirements: 9.4, 9.5, 9.6_
  - [x] 13.11 Implement `TimelineWeekView.tsx` (5 day columns on a shared axis, current-day distinct treatment, drop handling with revert outside valid bounds)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 14. Build the Dashboard widget board and widgets
  - [x] 14.1 Implement `useWidgetBoardLayout.ts` (zustand + `localStorage` persistence, default-layout fallback, add/move/resize/remove reducer using `react-grid-layout` collision detection)
    - _Requirements: 11.4, 11.5, 11.6_
  - [ ]* 14.2 Write property test for layout persistence round-trip with default fallback
    - **Property 9: Widget_Board layout persistence round-trips, with a default fallback**
    - **Validates: Requirements 11.4**
  - [x] 14.3 Implement `WidgetBoard.tsx` (`react-grid-layout` grid wiring, edit/add-widget controls, empty-cell placeholder, revert on invalid drop/resize)
    - _Requirements: 11.1, 11.2, 11.3_
  - [ ]* 14.4 Write property test for non-overlapping occupied cells
    - **Property 8: Widget_Board occupied cells never overlap and always match the widgets present**
    - **Validates: Requirements 11.2, 11.3, 11.5, 11.6**
  - [x] 14.5 Implement `widgetCatalog.ts` registry and the add-widget picker popover
    - _Requirements: 11.6, 12.1_
  - [x] 14.6 Implement `StatsWidget.tsx` (active-project count, rounded average completion percentage)
    - _Requirements: 12.2_
  - [ ]* 14.7 Write property test for the KPI completion percentage
    - **Property 11: KPI completion percentage is a bounded, correctly-rounded average**
    - **Validates: Requirements 12.2**
  - [x] 14.8 Implement `AlertsWidget.tsx`, `DocumentsWidget.tsx`, `ActionItemsWidget.tsx`, and `MilestonesWeekWidget.tsx` using `selectTopN` (caps of 5/5/5/10 respectively)
    - _Requirements: 12.1_
  - [x] 14.9 Implement `PhotoGalleryWidget.tsx` (upload/reorder/delete, 10-image cap, JPEG/PNG/GIF/WebP, 20MB limit, via `validateFileAcceptance`)
    - _Requirements: 12.3, 12.4, 12.5_
  - [ ]* 14.10 Write property test for gallery collection invariants
    - **Property 12: Gallery upload/reorder/delete preserve collection invariants**
    - **Validates: Requirements 12.3, 12.4, 12.5**

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Build the Projects List grid
  - [x] 16.1 Implement `ProjectCard.tsx` (cover-image fallback, progress bar, `AvatarStack` with owner distinction, alert-count badge via `formatCountBadge`, click/tap/keyboard navigation excluding edit/delete controls)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  - [x] 16.2 Implement `ClientFilter.tsx` ("Internal" first, then alphabetical case-insensitive)
    - _Requirements: 13.2_
  - [ ]* 16.3 Write property test for client-filter option ordering
    - **Property 14: Client filter options are "Internal" first, then alphabetical case-insensitive**
    - **Validates: Requirements 13.2**
  - [x] 16.4 Implement `CreateCard.tsx` (always-last "+" card navigating to the Project_Wizard's first step)
    - _Requirements: 13.6_
  - [x] 16.5 Implement `ProjectsList.tsx` (responsive grid via `columnsForWidth`, client filtering via `filterExact`, empty-state message while retaining the creation card)
    - _Requirements: 13.1, 13.3, 13.4, 13.5_

- [x] 17. Build the Projects List management dialogs
  - [x] 17.1 Implement `ProjectCreateDialog.tsx` and `ProjectEditDialog.tsx` (`Modal` + `FormField`/`CustomSelect` + `zod` validation via `validateStringLength` rules, mock-mode validation bypass)
    - _Requirements: 15.1, 15.2, 15.3, 15.6, 2.5_
  - [x] 17.2 Implement `ProjectDeleteDialog.tsx` and `AddClientDialog.tsx` (Internal-client delete/reassign protection)
    - _Requirements: 15.1, 15.4, 15.5, 15.7_
  - [ ]* 17.3 Write property test for create/edit/delete round-trip against the mock collection
    - **Property 19: Create/edit/delete round-trip against the mock collection**
    - **Validates: Requirements 15.2, 15.3, 15.4, 15.5** (reused, no re-test, at Requirements 36.2, 36.4, 25.5, 25.6, 28.3)

- [x] 18. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Build the Project Wizard store and step 1
  - [x] 19.1 Implement `useWizardStore.ts` (zustand + `sessionStorage` persistence of form/analysis/chat/selection/used-mock-document state)
    - _Requirements: 16.5_
  - [ ]* 19.2 Write property test for step-1-to-step-2 data carry-forward
    - **Property 21: Valid step-1 submission carries form data forward unchanged**
    - **Validates: Requirements 16.5**
  - [x] 19.3 Implement the `WizardLayout` viewport-breakpoint logic (1024px split-panel vs. form-only, chat panel does not mount below 1024px)
    - _Requirements: 16.1, 16.2_
  - [ ]* 19.4 Write property test for the layout viewport step function
    - **Property 20: Split-panel vs. form-only layout is a viewport-width step function**
    - **Validates: Requirements 16.1, 16.2**
  - [x] 19.5 Implement `ProjectFormStep.tsx` (name/brief/owner/deadline/budget/type/thumbnail fields, field-level validation messages, mock-mode bypass)
    - _Requirements: 16.3, 16.4, 2.5_
  - [x] 19.6 Implement `WizardChatPanel.tsx` (1–2000 char messages, simulated reply within 3s, blocks empty/whitespace-only sends)
    - _Requirements: 16.6, 16.7_
  - [x] 19.7 Implement `MockDocumentDraggable.tsx` (drag-to-fill demo data, confirmation chat message, revert on drop outside the panel, hidden after first use in the session)
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 20. Build the Project Wizard step 2
  - [x] 20.1 Implement the mock `generateAnalysis()` call and `AnalysisStep.tsx` loading/error/retry states (≤30s loading, injectable failure, redirect to step 1 without valid step-1 data)
    - _Requirements: 18.1, 18.2, 18.10_
  - [x] 20.2 Wire `MilestoneRoadmap` into `AnalysisStep` with add/rename/reorder/delete affordances and the zero-milestone empty state
    - _Requirements: 18.3, 18.4, 18.7, 18.8_
  - [x] 20.3 Implement `TaskListEditor.tsx` (name/priority chip/drag handle/delete per task; drag reorder within a milestone group and reassignment across groups; milestone-delete cascades to its tasks)
    - _Requirements: 19.1, 19.3, 19.4, 19.5, 18.9_
  - [ ]* 20.4 Write property test for milestone/task CRUD operations
    - **Property 24: Milestone/task CRUD operations produce the expected list state (model-based)**
    - **Validates: Requirements 18.7, 19.3, 19.4, 19.5**
  - [ ]* 20.5 Write property test for milestone-delete cascade
    - **Property 25: Deleting a milestone cascades to remove its tasks**
    - **Validates: Requirements 18.9**
  - [x] 20.6 Implement priority-chip cycling (`high → medium → low → high`) on activation
    - _Requirements: 19.2_
  - [ ]* 20.7 Write property test for priority cycling
    - **Property 26: Priority chip cycling is a period-3 state machine**
    - **Validates: Requirements 19.2**
  - [x] 20.8 Implement `RiskList.tsx` (distinguishable high/medium/low severity treatment) and `OpenQuestionsList.tsx`
    - _Requirements: 19.6, 19.7_
  - [ ]* 20.9 Write property test for open-question rendering
    - **Property 27: Open questions render 1:1 with their source list**
    - **Validates: Requirements 19.7**

- [x] 21. Build the Project Wizard step 3
  - [x] 21.1 Implement `TeamSelectionStep.tsx` view toggle (Member_Graph default, list view) wiring `MemberGraph` with a synthetic AI-suggestion `ClusterSource`
    - _Requirements: 20.1, 20.9_
  - [x] 21.2 Implement the shared member-selection-state reducer used by Member_Graph clicks, the add-member popup, and list-view checkboxes
    - _Requirements: 20.3, 20.8, 20.10_
  - [ ]* 21.3 Write property test for cross-entry-point selection consistency
    - **Property 29: Selection state is consistent across all three entry points and unaffected by view toggling**
    - **Validates: Requirements 20.3, 20.8, 20.9, 20.10**
  - [x] 21.4 Implement `AddMemberPopup.tsx` (search filter by name/skill tag via `filterExact`, case-insensitive)
    - _Requirements: 20.4_
  - [x] 21.5 Implement the list view (selection checkbox, skill tags, workload indicator, AI-suggestion indicator)
    - _Requirements: 20.5_
  - [x] 21.6 Implement confirm-selection gating and project creation (blocks confirm at zero selected members; on success creates the project with wizard-generated milestones/tasks and navigates to Project_Detail)
    - _Requirements: 20.6, 20.7_
  - [ ]* 21.7 Write property test for confirmation gating
    - **Property 30: Confirmation is gated on selection count**
    - **Validates: Requirements 20.6, 20.7**

- [x] 22. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 23. Build Project Detail tab structure and the Overview tab
  - [x] 23.1 Implement the `ProjectDetail.tsx` tab strip (5 fixed tabs + conditional Economics tab, Overview active by default, single-visible-panel via the shared tab helper)
    - _Requirements: 21.1, 21.2, 21.3, 21.6_
  - [ ]* 23.2 Write property test for Economics-tab presence and position
    - **Property 31: Economics tab presence and position are derived from `project.economics`**
    - **Validates: Requirements 21.2**
  - [x] 23.3 Implement the Alerts tab's label count badge via `formatCountBadge`
    - _Requirements: 21.4, 21.5_
  - [x] 23.4 Implement `OverviewTab.tsx` (`AvatarStack` capped at 5, description via `truncateWithFallback`, most-recently-updated document thumbnail, progress indicator, budget summary when `economics` is present)
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_
  - [ ]* 23.5 Write property test for most-recently-updated document selection
    - **Property 34: Thumbnail selection picks the most-recently-updated document**
    - **Validates: Requirements 22.3**

- [x] 24. Build Project Detail's Milestones & Tasks tab
  - [x] 24.1 Implement `MilestonesTasksTab.tsx` wiring the shared `MilestoneRoadmap` (with `milestoneState.classify`) and the shared milestone-selection task filter
    - _Requirements: 23.1, 23.2, 23.3_
  - [x] 24.2 Implement `TaskRow.tsx` (name, `StatusChip`, `PriorityChip`, per-assignee avatars, unassigned indicator)
    - _Requirements: 23.4, 23.5_
  - [x] 24.3 Implement `TaskStatusMenu.tsx` (4-status menu, selection sets status and closes)
    - _Requirements: 23.6, 23.7_
  - [ ]* 24.4 Write property test for the status-menu transition table
    - **Property 36: Status-chip menu selection is a correct 4×4 transition table**
    - **Validates: Requirements 23.6, 23.7**
  - [x] 24.5 Implement `AssignDialog.tsx` (suggested-member argmin of in-progress/blocked task count; confirming sets the assignee and transitions `unassigned` → `in_progress`)
    - _Requirements: 23.8, 23.9_
  - [ ]* 24.6 Write property test for assignment-suggestion argmin
    - **Property 37: Assignment-dialog suggestion is the argmin of active task count**
    - **Validates: Requirements 23.8**
  - [ ]* 24.7 Write property test for the assignment status transition
    - **Property 38: Task assignment transitions status only from `unassigned`**
    - **Validates: Requirements 23.9**
  - [x] 24.8 Implement the tab's local `MilestoneCreateDialog`/`EditDialog`/`DeleteDialog` and `TaskCreateDialog`/`EditDialog`/`DeleteDialog`
    - _Requirements: 23.1_

- [x] 25. Build Project Detail's Team tab
  - [x] 25.1 Implement `TeamTab.tsx` (`MemberGraph` scoped to `project.members`, reusing the overload-ring and alert-glow indicators, member-detail display on activation)
    - _Requirements: 24.1, 24.2, 24.3, 24.4_
  - [ ]* 25.2 Write property test for member-graph scoping
    - **Property 39: Team tab's Member_Graph is scoped exactly to the project's member list**
    - **Validates: Requirements 24.1**

- [x] 26. Build Project Detail's Documents tab
  - [x] 26.1 Implement `DocumentsTab.tsx` grid (filter by milestone/task/filename via `filterExact`, thumbnail vs. generic file-type icon)
    - _Requirements: 25.1_
  - [x] 26.2 Implement `AddDocumentDialog.tsx` (file selection, optional 255-char name override, milestone/task links, 50MB limit via `validateFileAcceptance`, cancel adds nothing)
    - _Requirements: 25.2, 25.3, 25.5, 25.6_
  - [x] 26.3 Implement `EditLinksDialog.tsx` (change/remove milestone/task associations only, cancel is a full no-op)
    - _Requirements: 25.4, 25.7, 25.8_
  - [ ]* 26.4 Write property test for edit-links mutation scope
    - **Property 43: Edit-links dialog mutates only link fields, and cancel is a full no-op**
    - **Validates: Requirements 25.4, 25.7, 25.8**

- [x] 27. Build Project Detail's Alerts tab
  - [x] 27.1 Implement `AlertsTab.tsx` (stable ordering, per-type icon, non-empty description, empty-state message, scrollable container)
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5_
  - [ ]* 27.2 Write property test for deterministic alert ordering
    - **Property 44: Alert rendering order is deterministic across re-renders**
    - **Validates: Requirements 26.1**
  - [ ]* 27.3 Write property test for the alert type→icon mapping
    - **Property 45: Alert type→icon mapping is injective and descriptions are always non-empty**
    - **Validates: Requirements 26.2, 26.3**

- [x] 28. Build Project Detail's Economics tab
  - [x] 28.1 Implement `EconomicsTab.tsx` budget summary card and cost-by-category donut chart (`recharts`) in the left column
    - _Requirements: 27.1, 27.5_
  - [x] 28.2 Implement the right-column sub-tab switcher (budget variance default, invoices, cost items, hours) via the shared single-panel-visible tab helper
    - _Requirements: 27.2, 27.3_
  - [x] 28.3 Implement per-sub-tab empty states and the error/retry state for a failed data load
    - _Requirements: 27.4, 27.6, 27.7_
  - [ ]* 28.4 Write property test for empty-state rendering
    - **Property 46: Empty underlying data renders an empty state instead of an empty chart/list**
    - **Validates: Requirements 27.4, 27.5**

- [x] 29. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 30. Build the AI Chat session sidebar and page composition
  - [x] 30.1 Implement `ChatSessionSidebar.tsx` (most-recently-active-first ordering, fixed panel ≥768px / overlay drawer <768px, hover/swipe-left delete control)
    - _Requirements: 28.1, 28.6_
  - [ ]* 30.2 Write property test for session ordering
    - **Property 47: Chat_Session_Sidebar orders sessions by most-recently-active first**
    - **Validates: Requirements 28.1**
  - [x] 30.3 Implement `AiChatPage.tsx` session load/select/delete/new-unsaved-session logic
    - _Requirements: 28.2, 28.3, 28.4, 28.5_
  - [ ]* 30.4 Write property test for session-history load round-trip
    - **Property 48: Loading a session round-trips its stored message history**
    - **Validates: Requirements 28.2**
  - [ ]* 30.5 Write property test for lazy session creation on first message
    - **Property 49: The first message in a new session lazily creates that session**
    - **Validates: Requirements 28.5**

- [x] 31. Build AI Chat message rendering
  - [x] 31.1 Implement `ChatBubble.tsx` `cva` role variants (`role="user"|"assistant"`, right/left alignment, distinct background/border per role)
    - _Requirements: 29.1_
  - [ ]* 31.2 Write property test for role-based alignment/style mapping
    - **Property 50: Message role determines alignment/style, a total 2-value mapping**
    - **Validates: Requirements 29.1**
  - [x] 31.3 Implement `MessageBubble.tsx` (`react-markdown` + `remark-gfm` for assistant messages with Tailwind-classed element overrides, plain text for user messages, append within 100ms, simulated reply after 500–1500ms)
    - _Requirements: 29.2, 29.3, 29.4, 29.5, 29.6_
  - [ ]* 31.4 Write property test for markdown-rendering resilience and literal user text
    - **Property 51: Assistant markdown rendering never throws and user text is always rendered literally**
    - **Validates: Requirements 29.2, 29.5, 29.6**

- [x] 32. Build AI Chat input, attachments, and voice recording
  - [x] 32.1 Implement `useFileAttachments.ts` and `AttachmentPreview.tsx` (cap 3 files, 5MB each, via `validateFileAcceptance`, remove frees a slot)
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5_
  - [x] 32.2 Implement `useVoiceRecording.ts` and `RecordingIndicator.tsx` (capability detection, elapsed-time indicator, mic-denied error, 60s auto-stop, manual stop ≥1s finalizes, cancel discards)
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.7_
  - [ ]* 32.3 Write property test for recording finalization
    - **Property 52: Voice recording finalization is a boundary predicate on stop time**
    - **Validates: Requirements 31.5, 31.6**
  - [x] 32.4 Implement `MessageInput.tsx` wiring attachments and voice recording into `AiChatPage`'s send action
    - _Requirements: 30.1, 31.1_

- [x] 33. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 34. Build the Team Page
  - [x] 34.1 Implement `GroupingSelector.tsx` (3 mutually exclusive modes, defaults to project)
    - _Requirements: 32.1, 32.2_
  - [x] 34.2 Implement `TeamPage.tsx` (fetches members/projects/clients, computes clusters via `groupingLogic`, passes them to the shared `MemberGraph`, re-renders on grouping change)
    - _Requirements: 32.3, 32.4_

- [x] 35. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 36. Build the Admin route guard and panel shell
  - [x] 36.1 Implement `resolveAdminGuardDecision()` and `AdminGuard.tsx` (unresolved → block, non-admin → redirect, admin → render)
    - _Requirements: 35.1, 35.2, 35.3, 35.4_
  - [ ]* 36.2 Write property test for the admin-guard decision function
    - **Property 59: Admin route guard decision is a total, correct 3-outcome function**
    - **Validates: Requirements 35.1, 35.2, 35.4**
  - [x] 36.3 Implement `AdminPanel.tsx` tab shell (Users, Projects, Team Members, Timeline Blocks, Agent Chat, Email Trigger)
    - _Requirements: 36.1_

- [x] 37. Build the Users/Projects/Team Members/Timeline Blocks admin tabs
  - [x] 37.1 Implement `UsersTab.tsx` (read-only list of `authUsers.ts` profiles, no create/edit/delete controls)
    - _Requirements: 36.11_
  - [x] 37.2 Implement `ProjectsTab.tsx` and `TeamMembersTab.tsx` (create/edit forms with required-field validation, delete confirmation prompt)
    - _Requirements: 36.2, 36.8, 36.9_
  - [x] 37.3 Implement `TimelineBlocksTab.tsx` (create/edit/delete with the same validation/confirmation rules)
    - _Requirements: 36.4, 36.8, 36.9_
  - [x] 37.4 Implement the shared deletion-blocked-by-Email-Trigger-reference predicate and wire it into the delete handlers of the Projects, Team Members, and Timeline Blocks tabs
    - _Requirements: 36.3_
  - [ ]* 37.5 Write property test for reference-blocked deletion
    - **Property 60: Deletion is blocked exactly when the target is referenced by the Email Trigger configuration**
    - **Validates: Requirements 36.3**

- [x] 38. Build the Agent Chat and Email Trigger admin tabs
  - [x] 38.1 Implement `AgentChatTab.tsx` (add/edit mock chat messages up to 2000 chars via `validateStringLength`, seeding the AI_Chat_Page's initial conversation)
    - _Requirements: 36.5_
  - [x] 38.2 Implement `EmailTriggerTab.tsx` save logic (target project/task/team member + 1–10 recipients, overwrites any prior configuration, missing-selection field error)
    - _Requirements: 36.6, 36.10_
  - [ ]* 38.3 Write property test for Email Trigger save round-trip
    - **Property 61: Email Trigger save round-trips and overwrites any prior configuration**
    - **Validates: Requirements 36.6**
  - [x] 38.4 Implement the recipient-list add validator (≤10 entries, valid email format, no case-insensitive duplicates)
    - _Requirements: 36.7_
  - [ ]* 38.5 Write property test for the recipient-addition validator
    - **Property 62: Recipient addition is a correct three-rule validator**
    - **Validates: Requirements 36.7**

- [x] 39. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional (property/unit/integration tests) and can be skipped for a faster MVP; core implementation tasks are never marked optional.
- Template properties (10, 15, 16, 17, 18, 19, 32, 40, 41, 42, 46) are stated and property-tested once, at their first/shared implementation site; every reuse site listed in the design is wired to the existing tested logic rather than re-tested.
- Requirements 1.1, 1.2, 1.6, 1.7, 2.3, 2.4, 2.5, 3.1, 3.2, 3.4, 3.5, and 3.6 are cross-cutting constraints enforced throughout every task in this plan rather than in a single dedicated task (see Overview).
- Requirement 3.3 and the `no-quality-tooling` steering document are honored by omission: no lint/format/typecheck tooling setup tasks appear anywhere in this plan, and all test tasks reuse the `vitest`/`fast-check` setup already present in this repo.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.4", "4.6", "5.1", "5.3", "5.5", "6.1", "6.3", "6.5", "6.7", "6.9", "6.11", "6.13"] },
    { "id": 5, "tasks": ["4.3", "4.5", "5.2", "5.4", "5.6", "6.2", "6.4", "6.6", "6.8", "6.10", "6.12", "6.14"] },
    { "id": 6, "tasks": ["8.1", "8.3", "8.5", "8.7", "8.9", "8.12", "8.14"] },
    { "id": 7, "tasks": ["8.2", "8.4", "8.6", "8.8", "8.10", "8.11", "8.13", "8.15"] },
    { "id": 8, "tasks": ["8.16"] },
    { "id": 9, "tasks": ["9.1", "9.3", "9.5"] },
    { "id": 10, "tasks": ["9.2", "9.4", "9.6"] },
    { "id": 11, "tasks": ["11.1", "11.3", "11.4", "11.5", "11.7", "11.8"] },
    { "id": 12, "tasks": ["11.2", "11.6"] },
    { "id": 13, "tasks": ["13.1", "13.2", "13.3", "13.7"] },
    { "id": 14, "tasks": ["13.4", "13.5", "13.6", "13.8", "13.9"] },
    { "id": 15, "tasks": ["13.10"] },
    { "id": 16, "tasks": ["13.11"] },
    { "id": 17, "tasks": ["14.1", "14.5", "14.6", "14.9"] },
    { "id": 18, "tasks": ["14.2", "14.7", "14.10", "14.3"] },
    { "id": 19, "tasks": ["14.4", "14.8"] },
    { "id": 20, "tasks": ["16.1", "16.2", "16.4", "16.5"] },
    { "id": 21, "tasks": ["16.3"] },
    { "id": 22, "tasks": ["17.1", "17.2"] },
    { "id": 23, "tasks": ["17.3"] },
    { "id": 24, "tasks": ["19.1", "19.3", "19.5", "19.6", "19.7"] },
    { "id": 25, "tasks": ["19.2", "19.4"] },
    { "id": 26, "tasks": ["20.1"] },
    { "id": 27, "tasks": ["20.2", "20.3", "20.6", "20.8"] },
    { "id": 28, "tasks": ["20.4", "20.5", "20.7", "20.9"] },
    { "id": 29, "tasks": ["21.1"] },
    { "id": 30, "tasks": ["21.2", "21.4", "21.5", "21.6"] },
    { "id": 31, "tasks": ["21.3", "21.7"] },
    { "id": 32, "tasks": ["23.1", "23.3", "23.4"] },
    { "id": 33, "tasks": ["23.2", "23.5"] },
    { "id": 34, "tasks": ["24.1", "24.2", "24.3", "24.5", "24.8"] },
    { "id": 35, "tasks": ["24.4", "24.6", "24.7"] },
    { "id": 36, "tasks": ["25.1"] },
    { "id": 37, "tasks": ["25.2"] },
    { "id": 38, "tasks": ["26.1", "26.2", "26.3"] },
    { "id": 39, "tasks": ["26.4"] },
    { "id": 40, "tasks": ["27.1"] },
    { "id": 41, "tasks": ["27.2", "27.3"] },
    { "id": 42, "tasks": ["28.1", "28.2", "28.3"] },
    { "id": 43, "tasks": ["28.4"] },
    { "id": 44, "tasks": ["30.1", "30.3"] },
    { "id": 45, "tasks": ["30.2", "30.4", "30.5"] },
    { "id": 46, "tasks": ["31.1", "31.3"] },
    { "id": 47, "tasks": ["31.2", "31.4"] },
    { "id": 48, "tasks": ["32.1", "32.2", "32.4"] },
    { "id": 49, "tasks": ["32.3"] },
    { "id": 50, "tasks": ["34.1"] },
    { "id": 51, "tasks": ["34.2"] },
    { "id": 52, "tasks": ["36.1"] },
    { "id": 53, "tasks": ["36.2", "36.3"] },
    { "id": 54, "tasks": ["37.1", "37.2", "37.3", "37.4"] },
    { "id": 55, "tasks": ["37.5"] },
    { "id": 56, "tasks": ["38.1", "38.2", "38.4"] },
    { "id": 57, "tasks": ["38.3", "38.5"] }
  ]
}
```
