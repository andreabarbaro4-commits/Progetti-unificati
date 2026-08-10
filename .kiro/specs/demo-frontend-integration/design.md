# Design Document

## Overview

This design integrates the product surface prototyped in `../demo` into this repo, rebuilding every screen against this repo's own component system (Tailwind v4 + `class-variance-authority`, rem-based sizing) and its own mock-data infrastructure (`isMockMode()` / `registerMockHandler` / `src/mock/fixtures/`). `../demo` is read exclusively for *behavior*: data shapes, interaction sequences, numeric limits (5MB, 20 milestones, 85% workload, etc.), and algorithms (grid-collision, cluster physics, milestone filtering). None of `../demo`'s Material-Web-based markup, styling, or MD3 components are ported.

Nine areas are affected: Cross-Cutting (design system + mock data + scope guardrails), App Shell, Dashboard, Projects List, Project Wizard, Project Detail, AI Chat, Team Page, Admin Panel. The App Shell is genuinely new (this repo has no authenticated chrome yet). Dashboard is replaced in place. Everything else is net-new screens reachable only once authenticated.

Three areas define **shared, cross-area components** that get built once and reused:
- **Member_Graph / Cluster_Graph** — one physics engine + `MemberBubble` component, reused by `Team_Selection_Step` (wizard step 3), `Project_Detail`'s Team tab, and the standalone `Team_Page`.
- **Milestone_Roadmap** — one horizontally-scrollable milestone-timeline component, reused by wizard step 2 and `Project_Detail`'s Milestones & Tasks tab.
- **Modal / dialog primitive, `StatusChip`/`PriorityChip`, `AvatarStack`** — consolidated per Requirement 1.4 because Demo implements each of these as 2+ page-local re-implementations.

### New dependencies

This repo's `package.json` currently has no grid-drag library, charting library, or markdown renderer. Three additions are needed, matching exactly what Demo already validated works for these use cases (not MD3-related, so reuse is safe and consistent with Requirement 1.2):

| Package | Used for | Pin |
|---|---|---|
| `react-grid-layout` | Widget_Board drag/resize grid (Req 11) | `^2.2.3` (matches Demo) |
| `recharts` | Economics_Tab donut + variance charts (Req 27) | `^3.9.2` (matches Demo) |
| `react-markdown` + `remark-gfm` | AI_Chat_Page assistant message rendering (Req 29.2) | `^10.1.0` / `^4.0.1` |

Icons use this repo's existing `react-icons` dependency (already installed), **not** `@material/web`'s Material Symbols font that Demo uses via its `MdIcon` wrapper. Every icon reference below assumes an `react-icons` icon (e.g. `react-icons/md` or `react-icons/hi2`) substituted for Demo's `<MdIcon>icon_name</MdIcon>` calls.

## Architecture

### Routing

All new routes are added to `src/routes.tsx` following the existing `RouteDefinition[]` pattern, all with `isPublic: false` (they require the existing `AuthGuard`):

```
/dashboard        (existing path, component swapped)
/projects
/projects/new
/projects/new/analysis
/projects/new/team
/projects/:id
/team
/agent
/admin
```

Route→parent and route→label metadata (needed by `Top_Navbar` for back-button/breadcrumb resolution, Req 4.2–4.4) is centralized in one new pure module, `src/lib/route-meta.ts`, rather than duplicated inline like Demo's `getPageMeta` does in `TopNavbar.tsx`:

```ts
// src/lib/route-meta.ts
export interface RouteMeta { labelKey: string; parent: string | null }
export function resolveRouteMeta(pathname: string): RouteMeta
```

This function pattern-matches static routes first (`/dashboard`, `/projects`, `/team`, `/agent`, `/admin`), then dynamic prefixes (`/projects/new/*` → parent chain, `/projects/:id` → parent `/projects`). It is pure and unit/property-testable in isolation from React.

### App Shell composition

`App.tsx` currently renders `AnimatedBackground`, `LocaleSwitcher`, and `AppRoutes` as siblings at the top level, with no authenticated chrome. The App Shell adds one wrapper, `src/components/AppShell/AppShell.tsx`, which is rendered *inside* the route tree (not in `App.tsx`) so unauthenticated routes (the onboarding wizard) remain unaffected — this satisfies Req 3.5/3.6's "no changes to onboarding except wrapping/wiring".

Concretely, `routes.tsx` gains an `isAuthenticatedLayout: boolean` flag per route (default `true` for every new route, `false`/absent for onboarding + auth-callback), and `App.tsx`'s route rendering wraps matching routes in `<AppShell>{...}</AppShell>`. `AppShell` renders:

```
<AppShell>
  <TopNavbar />                 (Req 4)
  <main>{children}</main>       (route content)
  <BottomNavbar />              (Req 5, hidden on /agent)
  <AiMascotFab />               (Req 6, hidden on /agent)
  <GreetingBubble />            (Req 6, session-scoped, hidden on /agent)
</AppShell>
```

`AnimatedBackground` and `LocaleSwitcher` are **not** duplicated inside `AppShell` — they stay exactly where they are in `App.tsx` today (rendered once, globally), satisfying Req 1.7 by construction rather than by convention.

### Data flow

Every screen reads/writes through **`@tanstack/react-query`** (already a dependency), calling `apiClient` methods whose paths are intercepted by `mock-api-client.ts` when `isMockMode()`. No new state-management layer is introduced for server-shaped data — this matches the existing pattern (`react-query` + `apiClient`) rather than Demo's bespoke `services/db.ts` + custom hooks per entity.

Two pieces of **client-only** UI state get lightweight `zustand` stores (already a dependency, already used by `useOnboardingStore`), because they are not "data" the mock server owns:
- `useWizardStore` — carries `Project_Wizard` form/analysis/team-selection state across the three wizard routes, session-persisted exactly like `useOnboardingStore`.
- `useWidgetBoardLayout` — Dashboard's per-device widget arrangement, `localStorage`-persisted (Req 11.4 requires survival across reloads *and* browser sessions, so `localStorage`, not `sessionStorage`).

## Components and Interfaces

### Cross-cutting new shared components (`src/components/`)

| Component | Path | Reused by |
|---|---|---|
| `Modal` | `src/components/ui/Modal.tsx` | Every create/edit/delete/add dialog across Projects List, Project Detail, Admin Panel |
| `StatusChip` / `PriorityChip` | `src/components/ui/StatusChip.tsx` | Task rows, Project cards, Wizard task list |
| `AvatarStack` | `src/components/ui/AvatarStack.tsx` | Project cards, Overview tab, task assignee rows |
| `Avatar` | `src/components/ui/Avatar.tsx` | `AvatarStack`, `MemberBubble`, chat bubbles, assignment dialogs |
| `MemberGraph` (cluster physics + bubble ring) | `src/components/MemberGraph/` | Team_Selection_Step, Project_Detail Team tab, Team_Page |
| `MilestoneRoadmap` | `src/components/MilestoneRoadmap/` | Project_Wizard step 2, Project_Detail Milestones & Tasks tab |
| `WidgetBoard` | `src/components/WidgetBoard/` | Dashboard only today, structured as a standalone reusable primitive per Req 1.5 |

**Why `Modal` instead of porting `ModalOverlay`:** Demo's `ModalOverlay` is functionally solid (focus trap, Escape, backdrop click, focus-return) and that *behavior* is preserved 1:1. Only its visuals change: inline `style={{ borderRadius: 20 ... background: white }}` becomes a `cva`-driven component using this repo's rounded/shadow tokens (matching `Card`'s existing `rounded-3xl shadow-[...]` pattern), and it accepts `className` for `cn()`-based overrides like every other `ui/` component.

**Why `StatusChip`/`PriorityChip` as one consolidated pair instead of one-per-screen:** Demo already keeps these consolidated in `components/StatusChip.tsx` reused across Project Detail and the Wizard task list — this repo keeps that consolidation, just rebuilt as `cva` variants (`variant="unassigned" | "in_progress" | "completed" | "blocked"` and `variant="high" | "medium" | "low"`) instead of a `STATO_CONFIG` inline-style lookup table.

#### `MemberGraph` — the single shared cluster/graph engine

```
src/components/MemberGraph/
  MemberGraph.tsx          — public component: <MemberGraph clusters={ClusterSource[]} members={...} onMemberActivate onClusterActivate />
  MemberBubble.tsx          — single bubble: photo | gradient-initials fallback, overload ring, opacity/saturation state
  ClusterCenter.tsx         — labeled center node (logo/initials) + tooltip
  DetailPanel.tsx           — the single "one open panel at a time" popover (member detail OR cluster tooltip)
  useClusterPhysics.ts       — composition hook (ports useClusterPhysics.ts 1:1 — pure physics logic, no visual dependency)
  useClusterMomentum.ts     — cluster drag + flick decay (ports 1:1)
  useRingRotation.ts        — ring rotation + flick decay (ports 1:1)
  usePhysicsLoop.ts         — shared RAF loop (ports 1:1)
  clusterGeometry.ts        — pure geometry: ring radius, angles, circle-packing (ports 1:1)
  groupingLogic.ts          — groupByProject / groupByUnit / groupByClient / cross-links (ports 1:1)
  gestureClassifier.ts      — drag-vs-tap distance threshold (ports 1:1)
```

The physics/geometry/grouping modules (`useClusterPhysics`, `useClusterMomentum`, `useRingRotation`, `usePhysicsLoop`, `clusterGeometry`, `groupingLogic`, `gestureClassifier`) contain **zero JSX and zero MD3 dependency** in Demo already — they are pure TypeScript logic operating on coordinates, velocities, and plain data arrays. These port essentially unchanged; only the consuming components (`MemberBubble`, `ClusterCenter`, `DetailPanel`) are rebuilt visually. This is the mechanism by which "one physics engine, three consumers" (Req: Member_Graph/Cluster_Graph shared surface) is achieved: `Team_Selection_Step`, the Team tab, and `Team_Page` each pass a different `clusters: ClusterSource[]` (respectively: one synthetic "new project" cluster with AI-suggestion state; one cluster scoped to `project.members`; N clusters from `groupByProject/Unit/Client`) into the *same* `<MemberGraph>` component.

Visual rebuild specifics:
- `MemberBubble` fallback avatar: same deterministic-hash-to-gradient algorithm as Demo's `Avatar.tsx`, but the two gradient stops become Tailwind arbitrary-value classes (`bg-[linear-gradient(135deg,...)]`) sized in rem, and the overload ring becomes a `ring-2 ring-red-500` (or equivalent existing color) rather than an inline `box-shadow` string.
- `ClusterCenter` label uses `Badge`-style pill markup instead of MD3's plain text + emoji.
- `DetailPanel` (member detail / cluster tooltip) is built on the new `Modal`-adjacent lightweight `Popover` pattern (non-modal — it doesn't need a backdrop or focus trap since dismissal is click-outside/dismiss-button/replace-with-another, per Req 33.6/33.7), styled as a `Card` with `size="sm"`.

#### `MilestoneRoadmap` — shared timeline component

```
src/components/MilestoneRoadmap/
  MilestoneRoadmap.tsx     — <MilestoneRoadmap milestones={} selectedId={} onSelect={} onAdd? onReorder? readOnly? />
  MilestoneCard.tsx        — single card: name, date, state indicator (completed/current/late/future)
  milestoneState.ts        — pure classify(milestone, today) -> 'completed'|'current'|'late'|'future'
```

Two call sites configure the same component differently:
- **Wizard step 2** passes `onAdd`, `onReorder`, editable milestone names, and no state-indicator coloring beyond "exists" (analysis milestones don't have a completed/late notion yet).
- **Project_Detail Milestones & Tasks tab** passes `readOnly={false}` with full state classification (Req 23.1) driving each card's border/dot color, and add/edit/delete affordances scoped to that tab's own dialogs (`MilestoneCreateDialog` etc., area-local, not part of the shared component).

The horizontal-scroll + connecting track-line visual (Req 18.4) is rebuilt with a plain flex row + `overflow-x-auto` and a Tailwind `before:` pseudo-element line, replacing Demo's whatever-it-uses-internally; the *behavior* (click-to-select, click-selected-again-to-deselect, disabled "add" past 20) is what's ported.

### Area: App Shell (`src/components/AppShell/`)

```
src/components/AppShell/
  AppShell.tsx
  TopNavbar.tsx        — Req 4
  BottomNavbar.tsx     — Req 5
  AiMascotFab.tsx      — Req 6.1-6.2
  GreetingBubble.tsx   — Req 6.3-6.7
  ProfilePanel.tsx     — the hover/click panel inside TopNavbar (Req 4.5-4.6)
```

- **Reused:** `Avatar` (profile badge, `LocaleSwitcher` and `AnimatedBackground` stay where they already are (per Architecture above), `Button`/`Badge` where applicable for the bottom-nav cutout highlight is custom SVG-mask geometry ported from Demo's `BottomNavbar.tsx` (the mask math is pure geometry, not MD3-styled — the *pill/glass* visual treatment is restyled to this repo's white/shadow card language instead of Demo's `rgba(255,255,255,0.92)` inline glass).
- **New:** all five files above are net-new; nothing in `src/components/ui/` today covers app-shell chrome.
- **Rethink vs. Demo:** Demo's `TopNavbar` computes `getPageMeta` inline per-render with hardcoded path checks; this design extracts that into the testable `resolveRouteMeta()` pure function (see Architecture) so Req 4.2–4.4's "for any route" behavior is independently verifiable. Demo's `AgentButton` background image is an animated `.webp` mascot asset that does not exist in this repo — the FAB is rebuilt as a plain circular `Button`-style control with an icon (react-icons) until/unless a mascot asset is supplied; this is a visual simplification, not a behavior change (Req 6.1–6.2 only require it navigates to AI_Chat_Page on activation, not a specific image).

Greeting text formatting (time-of-day salutation + optional first name) is one pure function shared between `GreetingBubble` and the Dashboard header (Req 7.1/7.2 use the identical rule):

```ts
// src/lib/greeting.ts
export function greetingFor(hour: number, firstName?: string): string
```

### Area: Dashboard (`src/features/dashboard/`, replaces the placeholder)

```
src/features/dashboard/
  Dashboard.tsx                 — replaces existing placeholder export
  Timeline/
    TimelineDayView.tsx         — Req 9
    TimelineWeekView.tsx        — Req 10
    TimelineBlockCard.tsx       — single block, color-coded by type
    NowIndicator.tsx
    timelineLayout.ts            — pure: timeToPosition(), assignLanes(), snapAndClamp()
    useDragTimelineBlock.ts      — pointer-event drag hook (ports Demo's useDragBlock.ts logic)
  widgets/
    StatsWidget.tsx              — KPI (Req 12.2)
    AlertsWidget.tsx
    DocumentsWidget.tsx
    ActionItemsWidget.tsx
    MilestonesWeekWidget.tsx
    PhotoGalleryWidget.tsx       — Req 12.3-12.5
    widgetCatalog.ts             — registry (id, label, icon, defaultSize, allowedSizes, Component)
```

- **Reused:** `WidgetBoard` (shared primitive above), `Card` (each widget tile body), `Badge` (alert-count badges), `Toggle` is *not* used for the day/week switch — that needs mutually-exclusive two-option semantics closer to a segmented control, so it's a small local `SegmentedToggle` built from two `Button`-style pills (documented below), `AvatarStack`.
- **New:** everything under `Timeline/` and `widgets/` (except `WidgetBoard` itself, which lives in shared `components/`).
- **Rethink vs. Demo:**
  - Demo's `CalendarGrid`/`WeekGrid` are plain inline-styled divs with drag handled by a bespoke `useDragBlock` pointer-event hook — no MD3 dependency here, so the *drag/snap logic* ports essentially unchanged into `timelineLayout.ts` + `useDragTimelineBlock.ts`; only the block card visuals (`TimelineBlockCard`) get rebuilt with Tailwind + `cva` variants keyed by block type (`meeting | task | deadline | break`), replacing Demo's `BLOCCO_COLOR`/`BLOCCO_BG` inline-style lookup tables.
  - Demo's `WidgetBoard` uses `react-grid-layout`'s **legacy** import path (`react-grid-layout/legacy`) with inline styles for every control (edit toggle, add-widget picker, empty-cell outlines). This design keeps `react-grid-layout` (the grid-collision/drag engine, Req 11.2/11.3/11.5/11.6's correctness properties depend on this library's collision detection, which is exactly what it's designed for) but rebuilds every surrounding control — the edit/add buttons, the picker popover, the empty-cell placeholder — with `Button`, `Card`, and Tailwind instead of Demo's ad-hoc inline `iconBtn`/`btnPrimary` style objects.
  - Demo's day/week toggle button is a plain text button (`{expanded ? <MdIcon>unfold_less</MdIcon> : t('viewAll')}`) that doesn't actually satisfy Req 8.1's "single toggle control with exactly two mutually exclusive options" as a visible segmented control — this design implements a real two-option segmented toggle (visually similar to `LocaleSwitcher`'s two-button pill pattern) so the "indicate which view is active" requirement (Req 8.4) is unambiguous.

### Area: Projects List (`src/features/projects/`)

```
src/features/projects/
  ProjectsList.tsx
  ProjectCard.tsx
  ClientFilter.tsx
  CreateCard.tsx
  dialogs/
    ProjectCreateDialog.tsx
    ProjectEditDialog.tsx
    ProjectDeleteDialog.tsx
    AddClientDialog.tsx
```

- **Reused:** `Card` (project card shell), `Badge` (alert-count, client label), `AvatarStack`, `Modal` (all four dialogs), `FormField` + `CustomSelect` + `Button` (dialog forms), `createFormConfig`/`zod` for validation (Req 15.6 — name/client length rules become a `zod` schema, e.g. `z.string().trim().min(1).max(100)`, exactly like `PersonalInfoSchema` in onboarding).
- **New:** `ProjectCard`, `ClientFilter`, `CreateCard` are area-local (not reused elsewhere), plus the 4 dialogs.
- **Rethink vs. Demo:** Demo's grid uses raw Tailwind (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) already close to Tailwind-native — this ports almost as-is, just re-expressed with this repo's `gap`/`p` rem scale. Demo's dialogs are page-local inline-styled `<div style={{position:'fixed'...}}>` blocks (not `ModalOverlay`, oddly — `ProjectCreateDialog` etc. don't consistently use the shared overlay in Demo); this design standardizes all four onto the new shared `Modal` primitive, which is a *consolidation* the requirements explicitly call for (Req 1.4).

### Area: Project Wizard (`src/features/project-wizard/`)

```
src/features/project-wizard/
  useWizardStore.ts             — zustand + sessionStorage persist (form, analysis, chatMessages, selectedMembers, usedMockDocument)
  ProjectFormStep.tsx            — route: /projects/new
  AnalysisStep.tsx                — route: /projects/new/analysis
  TeamSelectionStep.tsx           — route: /projects/new/team
  WizardChatPanel.tsx             — right-column AI chat panel (Req 16.1-16.2, 16.6-16.7)
  MockDocumentDraggable.tsx       — Req 17
  TaskListEditor.tsx              — Req 19 (drag reorder/reassign, priority cycle, delete)
  RiskList.tsx                    — Req 19.6
  OpenQuestionsList.tsx           — Req 19.7
  AddMemberPopup.tsx              — Req 20.4
```

- **Reused:** `MilestoneRoadmap` (step 2), `MemberGraph` (step 3), `FormField`/`CustomSelect`/`Button`/`Toggle` (step 1 form), `StatusChip`/`PriorityChip` (step 2 task list), `Modal` is not needed here (no dialogs in the wizard itself).
- **New:** everything listed is area-local except the two shared components it consumes.
- **Rethink vs. Demo:**
  - Demo's `WizardLayout` + `ChatPanel` are the split-panel/chat-and-drag-drop mechanics — this *behavior* (drag mock doc onto chat panel populates form, viewport-width-gated split layout) is preserved, rebuilt as a local `WizardLayout` (area-local, not promoted to shared `components/` since only this wizard uses a form+chat split) using `useMediaQuery`-style breakpoint logic already implied by the repo's Tailwind `lg:` conventions rather than Demo's manual `matchMedia` listener (though the listener approach is fine too and is what's ported for the exact 1024px breakpoint check, since Tailwind's `lg:` utility classes alone can't drive *which component tree* renders — only CSS visibility — and Req 16.2 requires the chat panel to not render at all below 1024px, not just be hidden).
  - The `AIAnalysisPage`'s "AI analysis" is entirely mocked/deterministic in Demo (a `generateAnalysis()` pure function with canned milestones/tasks/risks) — this ports directly, since Req 18.1's "generated analysis" has no real AI backend in scope (Req 3.1-3.2 forbid real backend calls). The 30-second-max loading sequence (Req 18.1) and its failure/retry path (Req 18.2) are implemented as a `setTimeout`-driven mock with an injectable failure flag for testing, not a real async operation.
  - Demo's drag-and-drop for task reorder/reassign across milestone groups (Req 19.3/19.4) uses native HTML5 drag events directly on divs (no library) — this ports the same native-DOMEvents approach (`onDragStart`/`onDragOver`/`onDrop`) rather than introducing a DnD library, keeping dependencies minimal.

### Area: Project Detail (`src/features/project-detail/`)

```
src/features/project-detail/
  ProjectDetail.tsx
  tabs/
    OverviewTab.tsx
    MilestonesTasksTab.tsx
    TeamTab.tsx
    DocumentsTab.tsx
    AlertsTab.tsx
    EconomicsTab.tsx
  TaskRow.tsx
  TaskStatusMenu.tsx
  AssignDialog.tsx
  dialogs/
    MilestoneCreateDialog.tsx / EditDialog.tsx / DeleteDialog.tsx
    TaskCreateDialog.tsx / EditDialog.tsx / DeleteDialog.tsx
    AddDocumentDialog.tsx
    EditLinksDialog.tsx
```

- **Reused:** `MilestoneRoadmap` + `milestoneState.ts` (Milestones tab), `MemberGraph` (Team tab, scoped to `project.members`), `StatusChip`/`PriorityChip`/`AvatarStack`/`Modal`/`Card`/`Badge` throughout, `recharts` (Economics tab charts, area-local since only this tab needs charts).
- **New:** the tab components and area-local dialogs.
- **Rethink vs. Demo:** Demo's tab bar is a horizontally-scrolling pill row with inline gradient-background active state (`linear-gradient(to left, #716dc0, #423f85)`) — this rebuilds as a `Badge`-variant-driven tab strip (`active`/`default` variants already exist on `Badge`) so the active-tab treatment reuses an existing token rather than a one-off gradient. The Economics tab's donut + variance charts are the one place `recharts` is introduced; Demo already proves this library handles the exact chart shapes needed (donut, bar/variance), so it is reused rather than hand-rolling SVG charts.

### Area: AI Chat (`src/features/ai-chat/`)

```
src/features/ai-chat/
  AiChatPage.tsx
  ChatSessionSidebar.tsx
  SessionListItem.tsx
  MessageBubble.tsx              — Req 29.1-29.2
  MessageInput.tsx                — Req 30, 31
  AttachmentPreview.tsx
  RecordingIndicator.tsx
  useVoiceRecording.ts            — ports Demo's hook 1:1 (MediaRecorder API usage has no MD3 dependency)
  useFileAttachments.ts           — ports Demo's hook 1:1
```

- **Reused:** `Avatar` (message bubble avatars), `Card`/`Button` for input-area controls, `react-markdown` + `remark-gfm` (new dependency, assistant messages only, per Req 29.2/29.5).
- **New:** everything else, all area-local except the two ported hooks (which are pure browser-API wrappers, not visual, so they port with zero rework beyond TypeScript housekeeping).
- **Rethink vs. Demo:** Demo's `MessageBubble` renders `react-markdown` with a large `components={{...}}` override map that reimplements every markdown element's styling inline (used because MD3 has no markdown-aware theming). This design keeps the same `components` override *mechanism* (react-markdown always needs this to control element styling) but every override maps to Tailwind classes instead of inline `style` objects, and the two roles' bubble container styles (Req 29.1) become two `cva` variants (`role="user" | "assistant"`) on a `ChatBubble` wrapper rather than duplicated conditional inline styles.

### Area: Team Page (`src/features/team/`)

```
src/features/team/
  TeamPage.tsx
  GroupingSelector.tsx           — Req 32.1-32.2
```

- **Reused:** `MemberGraph` (the entire cluster-canvas surface — `TeamPage.tsx` itself is a thin composition: fetch team members/projects/clients, compute `clusters` via the shared `groupingLogic.ts`, pass to `<MemberGraph>`).
- **New:** `TeamPage.tsx` (composition/data-fetching only) and `GroupingSelector.tsx` (a 3-option segmented control, same pattern as the Dashboard's day/week toggle).
- **Rethink vs. Demo:** Demo's `TeamPage` also offers an alternate Leaflet-based map view (`TeamMapView`, `ViewModeSelector`) — **this is out of scope**: no requirement in this integration mentions a geographic map view, so it is intentionally not built, and `leaflet`/`react-leaflet` are **not** added as dependencies. Only the cluster-graph view (Req 32-34) is in scope.

### Area: Admin Panel (`src/features/admin/`)

```
src/features/admin/
  AdminGuard.tsx                  — Req 35 (wraps the route element, not a full page)
  AdminPanel.tsx
  tabs/
    UsersTab.tsx                  — read-only (Req 36.11)
    ProjectsTab.tsx
    TeamMembersTab.tsx
    TimelineBlocksTab.tsx
    AgentChatTab.tsx
    EmailTriggerTab.tsx
```

- **Reused:** `Modal`/`FormField`/`CustomSelect`/`Button`/`Card` for every tab's create/edit forms and delete-confirmation dialogs.
- **New:** all six tabs plus `AdminGuard`.
- **Rethink vs. Demo:** Demo's `AdminPage` renders every tab's CRUD form as inline `style={card}` / `style={inputStyle}` objects defined at module scope (`const card: React.CSSProperties = {...}`) — a pattern this repo's `cva` components already replace structurally; each tab's form becomes ordinary `FormField`-wrapped inputs. `AdminGuard` is a **new, small, dedicated component** (Demo instead does an inline `if (!user?.isAdmin) return <...>` at the top of its single `AdminPage` function) — splitting it out makes the redirect-vs-block-vs-render decision table (Req 35.1-35.4) independently testable as a pure function, matching the `resolveRouteMeta` pattern used for `Top_Navbar`.

```ts
// src/features/admin/AdminGuard.tsx (uses a pure decision function)
export type AdminGuardDecision = 'render' | 'redirect' | 'block'
export function resolveAdminGuardDecision(
  isAuthenticated: boolean,
  isAdminStatusResolved: boolean,
  isAdmin: boolean,
): AdminGuardDecision
```

## Data Models

All new fixtures live under `src/mock/fixtures/`, one module per entity, following the existing file-per-domain convention (`dashboard.ts`, `onboarding.ts`, `user.ts`). The existing `dashboard.ts` module's `Project`/`Task`/`TeamMember` interfaces are **superseded** by the richer shapes below (Dashboard is being replaced in place per the Introduction, so its placeholder fixtures are replaced too) — `src/mock/setup.ts`'s existing `GET /projects`, `GET /tasks`, `GET /team` handlers are updated to point at the new fixture modules and richer shapes rather than left as a second, parallel simplified model (which Req 2.4 forbids).

```
src/mock/fixtures/
  clients.ts          — Client[]           (>= 3, "Internal" is a fixed sentinel client)
  teamMembers.ts       — TeamMember[]       (>= 3)
  projects.ts          — Project[]          (>= 3, references clients.ts + teamMembers.ts ids)
  milestones.ts        — Milestone[]        (>= 3, references projects.ts ids)
  tasks.ts             — Task[]             (>= 3, references milestones.ts + teamMembers.ts ids)
  documents.ts         — Document[]         (>= 3, references projects.ts + milestones.ts + tasks.ts ids)
  alerts.ts            — Alert[]            (>= 3, references projects.ts + teamMembers.ts ids)
  economics.ts         — Economics[]        (exactly 1 per project that has economics; singleton per Req 2.1)
  chatSessions.ts       — ChatSession[]      (>= 3)
  chatMessages.ts       — ChatMessage[]      (>= 3, references chatSessions.ts ids)
  timelineBlocks.ts     — TimelineBlock[]    (>= 3, references projects.ts + teamMembers.ts ids)
  galleryImages.ts      — GalleryImage[]     (>= 3, references teamMembers.ts/user ids)
  authUsers.ts          — AuthUserProfile[]  (>= 3, mirrors mock Auth0 profiles for Admin Users tab, Req 36.11)
  widgetLayouts.ts       — default Widget_Board layout constant (not a network-backed entity — consumed directly by `useWidgetBoardLayout`, no handler needed)
```

Type shapes are adapted from `../demo`'s `packages/shared/src/index.ts` (already well-factored: `Project`, `TeamMember`, `Task`, `Milestone`, `Document`, `Alert`, `Economics`, `Invoice`, `CostItem`, `TimelineBlock`, `AgentMessage`, `Client`, `ClusterSource`, `GroupingMode`) with two additions not present there:
- `ChatSession { id, title, lastActiveAt, projectContext? }` — Demo threads sessions through a backend service (`db.aws.ts`) rather than a typed fixture; this design gives sessions an explicit fixture-friendly shape.
- `AuthUserProfile { id, name, email, role, isAdmin }` — a deliberately thin mirror of Demo's `DemoUser` minus `password` (Req 36.11 explicitly says *read-only mirror of mock Auth0 profiles*, so no password field belongs in this repo's fixture at all, unlike Demo's `DemoUser` which stores a mock password for its own login flow — this repo's onboarding/login is already wired to real Auth0 mock mode via `MockAuthProvider`, so `AuthUserProfile` is display-only data, not an authentication credential store).

### Mock handler registration (`src/mock/setup.ts`)

One handler per method+path per Req 2.2. Every mutating handler (`POST`/`PUT`/`PATCH`/`DELETE`) mutates the in-memory fixture array module-scope reference so subsequent `GET`s in the same session reflect the change (matching the existing pattern — there is no real persistence across page reloads for mutated mock data today, and nothing in the requirements asks for that beyond the Widget_Board layout, which persists via `localStorage` directly, not through the mock API).

Representative additions (illustrative, not exhaustive — every distinct screen action gets its own method+path per Req 2.2):

```ts
registerMockHandler('GET',    '/projects', () => mockProjects);
registerMockHandler('POST',   '/projects', (body) => { ...push, return new project });
registerMockHandler('PUT',    /^\/projects\/[^/]+$/, (body) => { ...update, return updated });
registerMockHandler('DELETE', /^\/projects\/[^/]+$/, () => { ...splice });
registerMockHandler('GET',    '/clients', () => mockClients);
registerMockHandler('POST',   '/clients', (body) => { ... });
registerMockHandler('GET',    '/team-members', () => mockTeamMembers);
registerMockHandler('GET',    '/chat-sessions', () => mockChatSessions);
registerMockHandler('GET',    /^\/chat-sessions\/[^/]+\/messages$/, () => [...]);
registerMockHandler('DELETE', /^\/chat-sessions\/[^/]+$/, () => { ... });
registerMockHandler('GET',    '/admin/users', () => mockAuthUsers); // read-only, no POST/PUT/DELETE
registerMockHandler('GET',    '/admin/email-trigger', () => currentEmailTriggerConfig);
registerMockHandler('PUT',    '/admin/email-trigger', (body) => { validate, overwrite, return });
```

`mock-api-client.ts`'s existing `findHandler` already supports `RegExp` path patterns (used today for nothing, but the type signature already allows it: `pathPattern: string | RegExp`), so dynamic-id routes (`/projects/:id`) use `RegExp` patterns — no change needed to `mock-api-client.ts` itself.

### Referential integrity (Req 2.1)

Every fixture with a foreign-key-shaped field references a real id from the referenced module:
- `projects.ts[].clientId` → a `clients.ts[].id` (including the fixed `"client-internal"` sentinel)
- `projects.ts[].members[]` / `owner` → `teamMembers.ts[].id`
- `milestones.ts[].taskIds[]` and `tasks.ts[].milestoneId` → mutually consistent
- `tasks.ts[].assignedTo` → `teamMembers.ts[].id` or absent (unassigned)
- `documents.ts[].projectId` → `projects.ts[].id`; `milestoneIds[]`/`taskIds[]` → real ids within that same project
- `alerts.ts[].projectId` / `memberId` → real ids
- `chatMessages.ts[].sessionId` → `chatSessions.ts[].id`
- `timelineBlocks.ts[].projectId` / `memberId` → real ids

This is verified by a small integration/smoke check (see Testing Strategy), not a property test — referential integrity of a fixed, static dataset is not a "for all inputs" claim.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Several properties below are stated once as a **reusable template** and then instantiated at multiple call sites, per the Property Reflection consolidation performed during prework — this avoids testing the identical logic shape three or four times under different names just because it appears in different screens.

### App Shell

#### Property 1: Route metadata resolution is total and correct
*For any* pathname string, `resolveRouteMeta(pathname)` returns exactly one of `{label: pageLabel, parent: null}` (no matching parent — brand mark, no back button) or `{label: pageLabel, parent: parentPath}` (back button navigates to `parentPath`, page title shown instead of brand mark), and the returned `parent` (when non-null) is itself a valid route in the route table.

**Validates: Requirements 4.2, 4.3, 4.4**

#### Property 2: Bottom navbar highlights exactly the matching entry
*For any* pathname and *any* list of Bottom_Navbar entries, at most one entry is marked active (cutout/highlight + `aria-current="page"`), and that entry is active if and only if the pathname equals its path or is a sub-path of it; if no entry matches, none are marked active.

**Validates: Requirements 5.3, 5.4, 5.5**

#### Property 3: Greeting text formatting is a total, deterministic function of time and name
*For any* hour value 0–23 and *any* optional first name (including empty string or undefined), `greetingFor(hour, firstName)` contains exactly one of the three salutations ("Good morning" for 5–11, "Good afternoon" for 12–16, "Good evening" for 17–23 and 0–4), and includes the name appended if and only if a non-empty name was provided.

**Validates: Requirements 6.3, 6.7, 7.1, 7.2**

### Dashboard

#### Property 4: Timeline block position is proportional to time, consistently across day and week views
*For any* timeline block with a start time and duration within a 00:00–24:00 axis, and *for any* of the (up to 5) day columns it could render in, its computed vertical offset and height are proportional to `(start, duration)` relative to the same shared axis range — i.e. two blocks with identical `(start, duration)` in different day columns compute identical offset/height.

**Validates: Requirements 9.1, 10.1**

#### Property 5: Overlapping blocks never share a lane
*For any* set of timeline blocks on the same day, the lane-assignment function assigns lanes such that no two blocks whose time ranges overlap are assigned the same lane, and every block is assigned some lane.

**Validates: Requirements 9.1**

#### Property 6: "Now" indicator visibility is exactly a function of whether the current moment falls in the displayed range
*For any* current time and *any* displayed day, the now-indicator is rendered at the position corresponding to the current time if and only if the current time's date matches the displayed day; otherwise it is not rendered at all.

**Validates: Requirements 9.2, 9.3**

#### Property 7: Drag-drop time resolution snaps to 5 minutes and clamps to valid bounds
*For any* drop position (including positions before 00:00, after 24:00 minus the block's duration, outside all day columns in week view, or squarely within a valid column), the resulting time is the nearest 5-minute increment to the drop position, clamped to `[00:00, 24:00 - duration]`; drops outside all day columns or outside the axis range leave the block's day/time completely unchanged (revert).

**Validates: Requirements 9.4, 9.5, 10.3, 10.4**

#### Property 8: Widget_Board occupied cells never overlap and always match the widgets present
*For any* sequence of add/move/resize/remove operations applied to a Widget_Board layout, at every point the set of occupied grid cells has no two widgets sharing a cell, and the set of widgets with occupied cells equals exactly the set of widgets currently on the board; any operation that would violate non-overlap is rejected and the layout reverts to its pre-operation state.

**Validates: Requirements 11.2, 11.3, 11.5, 11.6**

#### Property 9: Widget_Board layout persistence round-trips, with a default fallback
*For any* valid Widget_Board layout, persisting it and then reading it back produces an equivalent layout (same widget ids, positions, sizes); for a device with no previously persisted layout, reading returns the default layout.

**Validates: Requirements 11.4**

#### Property 10 (template): Capped top-N selection by criterion
*For any* collection of items of arbitrary size (including sizes larger than the cap) and *any* selection criterion (most-recently-triggered-and-unresolved for alerts, most-recently-modified for documents, highest-priority for action items, soonest-due-within-current-week for milestones), the widget displays at most N items, and those items are exactly the top-N items under that criterion from the full collection.

**Validates: Requirements 12.1** (instantiated for: alerts cap 5, documents cap 5, action items cap 5, milestones cap 10)

#### Property 11: KPI completion percentage is a bounded, correctly-rounded average
*For any* set of active projects with arbitrary `progress` values in `[0, 100]`, the displayed overall completion percentage equals `round(average(progress))`, and the result is always within `[0, 100]`.

**Validates: Requirements 12.2**

#### Property 12: Gallery upload/reorder/delete preserve collection invariants
*For any* candidate file (varying MIME type and size) and *any* current gallery collection (0–10 images), the upload succeeds if and only if the file's type is one of JPEG/PNG/GIF/WebP, its size is ≤ 20MB, and the current collection has fewer than 10 images — a rejection identifies the specific violated rule (type, size, or capacity) and leaves the collection unchanged; reordering the collection preserves the same set of images (only order changes); deleting one image results in a collection excluding exactly that image with all others unchanged.

**Validates: Requirements 12.3, 12.4, 12.5**

### Projects List

#### Property 13: Grid column count is a step function of viewport width
*For any* viewport width, the number of grid columns is 1 for width < 640px, 2 for 640px ≤ width < 1024px, and ≥ 3 for width ≥ 1024px.

**Validates: Requirements 13.1**

#### Property 14: Client filter options are "Internal" first, then alphabetical case-insensitive
*For any* set of projects/clients, the rendered filter option list begins with "Internal", followed by every client with ≥ 1 project sorted alphabetically in ascending, case-insensitive order, with no duplicates.

**Validates: Requirements 13.2**

#### Property 15 (template): Filtered set equals exactly the matching subset
*For any* collection and *any* filter value (including "no filter selected" and values matching zero items), the rendered/returned set equals exactly the subset of the collection matching that filter's predicate — no extra items, no missing items.

**Validates: Requirements 13.3, 13.4, 13.5** (client filter on Projects_List); reused at **Requirements 20.4** (add-member popup: name-or-skill-tag match, case-insensitive), **Requirements 25.1** (Documents tab: milestone/task/filename match)

#### Property 16 (template): Avatar-overflow-count invariant
*For any* member list of arbitrary size and *any* visible-avatar cap N (with or without a distinguished "owner" slot outside the cap), exactly `min(size, N)` avatars are rendered, and if `size > N` an overflow-count indicator shows exactly `size - N`; if `size <= N`, no overflow indicator renders.

**Validates: Requirements 14.1, 14.3, 14.4** (Project_Card: owner + up to 4 others); reused at **Requirements 22.1** (Overview tab: cap 5, no distinguished owner)

#### Property 17 (template): Alert-count badge formatting
*For any* non-negative alert count, the badge shows the exact count as text for counts 1–99, shows "99+" for counts > 99, and renders no badge at all for a count of 0.

**Validates: Requirements 14.5** (Project_Card badge); reused at **Requirements 21.4, 21.5** (Alerts tab label badge)

#### Property 18 (template): Required-string-length validation is a total predicate
*For any* candidate string and *any* `(required: boolean, minLength, maxLength)` constraint triple, the field is accepted if and only if (not required or the trimmed string is non-empty) and the trimmed length is within `[minLength, maxLength]`; on rejection, the specific violated bound (empty/too-short/too-long) is identified, and no mutation occurs to the underlying collection.

**Validates: Requirements 15.6** (project name ≤100, client name ≤100); reused at **Requirements 16.4** (name 1–100, brief 20–500), **Requirements 16.6, 16.7** (chat message 1–2000, whitespace-only rejected), **Requirements 18.8** (milestone/task rename non-empty ≤100), **Requirements 36.5** (agent chat message ≤2000), **Requirements 36.8** (admin required fields), **Requirements 36.10** (Email Trigger required selections)

#### Property 19 (template): Create/edit/delete round-trip against the mock collection
*For any* valid entity input, creating it results in the collection containing a new entity matching that input and the corresponding card/row rendering it; editing an existing entity with valid input results in the collection's matching entity reflecting exactly the new field values, all other entities unchanged; deleting an entity by id results in the collection excluding exactly that id, all others unchanged.

**Validates: Requirements 15.2, 15.3, 15.4, 15.5** (Projects_List: project + client); reused at **Requirements 36.2, 36.4** (Admin Panel: Project / Team Member / Timeline Block tabs), **Requirements 25.5, 25.6** (add-document create / cancel-adds-nothing), **Requirements 28.3** (delete chat session)

### Project Wizard

#### Property 20: Split-panel vs. form-only layout is a viewport-width step function
*For any* viewport width, the wizard's first step renders the two-column split panel (form + `Wizard_Chat_Panel`) if and only if width ≥ 1024px; below 1024px, only the form renders and the chat panel does not mount at all.

**Validates: Requirements 16.1, 16.2**

#### Property 21: Valid step-1 submission carries form data forward unchanged
*For any* valid project-form data, submitting navigates to step 2 with that exact data available, unmodified.

**Validates: Requirements 16.5**

#### Property 22: Milestone_Roadmap card count and add-affordance are bounded by 0–20
*For any* number of milestones from 0 to 20 (and any attempt to add beyond 20), the roadmap renders exactly that many cards (or the empty-state message at 0), and the "add milestone" affordance is enabled if and only if the current count is below 20.

**Validates: Requirements 18.3, 18.4**

#### Property 23: Milestone selection toggles task-list filtering
*For any* sequence of milestone selections within a task list, selecting a milestone that is not currently selected filters the visible tasks to exactly those whose `milestoneId` matches; selecting the already-selected milestone again reverts to showing all tasks.

**Validates: Requirements 18.5, 18.6, 23.2, 23.3** (the latter two reuse this identical shared `MilestoneRoadmap` behavior in Project_Detail's Milestones & Tasks tab)

#### Property 24: Milestone/task CRUD operations produce the expected list state (model-based)
*For any* sequence of add/rename/reorder/delete operations on milestones and tasks (each with valid inputs), the resulting milestone and task lists match the result of applying a simple reference model of the same operations in order — reordering preserves the same set of items with updated positions, cross-group reassignment moves a task into the target milestone's group at the drop position, and deletion removes exactly the targeted item.

**Validates: Requirements 18.7, 19.3, 19.4, 19.5**

#### Property 25: Deleting a milestone cascades to remove its tasks
*For any* milestone with an arbitrary set of associated tasks, deleting that milestone results in a task list from which every task that had that milestone's id is absent, and every other task is unaffected.

**Validates: Requirements 18.9**

#### Property 26: Priority chip cycling is a period-3 state machine
*For any* current priority value and *any* number of activations N, the resulting priority equals the value obtained by applying the `high → medium → low → high` cycle N times from the current value; applying it any multiple of 3 times returns to the starting value.

**Validates: Requirements 19.2**

#### Property 27: Open questions render 1:1 with their source list
*For any* list of open-question strings (including duplicates, empty strings, or strings containing markup-like characters), exactly that many list items render, each showing its corresponding question text verbatim.

**Validates: Requirements 19.7**

#### Property 28: Member bubble visual state is a total function of (selected, suggested)
*For any* member and *any* combination of `(selected, aiSuggested)`, the rendered bubble satisfies: `selected` → opacity 100%, saturation 100%; `!selected && aiSuggested` → opacity ≤ 60% and saturation ≤ 50% (relative to the selected state); `!selected && !aiSuggested` → opacity 100%, saturation 100% (visually identical to selected in those two parameters, distinguishable only by not being in the "dimmed" bucket the suggested-unselected state occupies).

**Validates: Requirements 20.2**

#### Property 29: Selection state is consistent across all three entry points and unaffected by view toggling
*For any* sequence of selection-toggle operations issued via Member_Graph bubble clicks, add-member popup picks, or list-view checkboxes, the resulting selected-member set equals the set obtained by applying each toggle in order, and that same set is reflected identically regardless of which view (Member_Graph or list) is currently displayed; toggling the view mode itself never changes the selected set.

**Validates: Requirements 20.3, 20.8, 20.9, 20.10**

#### Property 30: Confirmation is gated on selection count
*For any* selected-member set of size 0 to N, confirming the Team_Selection_Step succeeds if and only if the set's size is ≥ 1; a size-0 attempt is blocked with a message and the set is unchanged.

**Validates: Requirements 20.6, 20.7**

### Project Detail

#### Property 31: Economics tab presence and position are derived from `project.economics`
*For any* project with or without a defined, non-empty `economics` value, the tab list includes an Economics tab if and only if `economics` is defined and non-empty, and when present it is positioned immediately after the Overview tab.

**Validates: Requirements 21.2**

#### Property 32 (template): Exactly one panel is visible per selected tab index
*For any* selected index within a finite set of tabs, exactly that tab's content panel is visible and every other panel is hidden.

**Validates: Requirements 21.3** (Project_Detail's 5–6 main tabs); reused at **Requirements 27.3** (Economics tab's 4 sub-tabs)

#### Property 33: Description truncation is bounded at 500 characters with a fallback for empty input
*For any* description string of arbitrary length (including empty/absent), the displayed text is the full string if length ≤ 500, or the first 500 characters plus a truncation indicator if length > 500; for an empty or absent description, placeholder text is shown instead of an empty region.

**Validates: Requirements 22.2**

#### Property 34: Thumbnail selection picks the most-recently-updated document
*For any* set of documents with arbitrary update timestamps (including ties), the thumbnail shown corresponds to a document with the maximum timestamp in the set; for an empty document set, a placeholder is shown instead.

**Validates: Requirements 22.3**

#### Property 35: Milestone state classification is total and deterministic
*For any* milestone with a due date and a completed flag, relative to "today", `classify(milestone, today)` returns exactly one of `completed | current | late | future`, following: `completed` if the flag is set; else `late` if the due date is before today; else `current` or `future` per the nearest-upcoming rule — every combination of (flag, due-date-vs-today) maps to exactly one state.

**Validates: Requirements 23.1**

#### Property 36: Status-chip menu selection is a correct 4×4 transition table
*For any* current task status and *any* selected target status (from the 4-value domain `unassigned | in_progress | completed | blocked`), after selection the task's status equals the target status and the menu closes.

**Validates: Requirements 23.6, 23.7**

#### Property 37: Assignment-dialog suggestion is the argmin of active task count
*For any* set of project members and *any* set of tasks with arbitrary assignees and statuses, the member(s) marked "suggested" are exactly those with the minimum count of tasks whose status is `in_progress` or `blocked` (counting only those two statuses), including correct handling of ties and members with zero qualifying tasks.

**Validates: Requirements 23.8**

#### Property 38: Task assignment transitions status only from `unassigned`
*For any* task with an arbitrary prior status and *any* confirmed assignee, after confirming the assignment the task's assignee equals that member, and the task's status becomes `in_progress` if and only if the prior status was `unassigned`; for any other prior status, the status is unchanged.

**Validates: Requirements 23.9**

#### Property 39: Team tab's Member_Graph is scoped exactly to the project's member list
*For any* project with an arbitrary subset of the full team-member roster as `members`, and *any* full roster, the graph's bubble set equals exactly `project.members`, excluding every roster member not in that list.

**Validates: Requirements 24.1**

#### Property 40 (template): Overload indicator is a threshold predicate at 85% workload
*For any* member with an arbitrary workload value, the overload indicator renders if and only if workload ≥ 85, across the full numeric domain including the boundary values 84, 85, and 86.

**Validates: Requirements 24.2, 34.3**

#### Property 41 (template): Alert-glow indicator is a threshold predicate at 1 active alert
*For any* cluster/project with an arbitrary active-alert count, the alert-glow/highlight renders if and only if the count is ≥ 1.

**Validates: Requirements 24.3, 34.4**

#### Property 42 (template): File-acceptance validator rejects with a reason matching the violated rule, preserving prior state
*For any* candidate file (varying size and, where applicable, type) and *any* current attachment/document/gallery collection state, acceptance succeeds if and only if all of that context's specific rules are satisfied (size ≤ limit; for gallery, also type ∈ allowed set and current count < cap; for chat, also current attachment count < 3); on rejection, the error identifies which specific rule was violated, and the existing collection/form state (including any partially-entered metadata) is left completely unchanged.

**Validates: Requirements 25.2, 25.3** (Documents: 50MB, preserves name-override + milestone/task selections); reused at **Requirements 30.1, 30.2, 30.3, 30.4, 30.5** (Chat attachments: 3 files max, 5MB each; remove frees a slot) and **Requirements 12.4** (Gallery: 20MB, 4 types, 10-image cap)

#### Property 43: Edit-links dialog mutates only link fields, and cancel is a full no-op
*For any* document and *any* candidate new milestone/task link set (including the empty set), confirming the edit-links dialog updates the document's `milestoneIds`/`taskIds` to exactly the candidate set while leaving its name and file untouched; canceling leaves the document's links exactly as they were before the dialog opened.

**Validates: Requirements 25.4, 25.7, 25.8**

#### Property 44: Alert rendering order is deterministic across re-renders
*For any* fixed set of active alerts, rendering it repeatedly (with no change to the underlying set) produces the identical order every time.

**Validates: Requirements 26.1**

#### Property 45: Alert type→icon mapping is injective and descriptions are always non-empty
*For any* set of alerts of arbitrary content drawn from the fixed `AlertType` domain, each alert's rendered description is non-empty, and the icon assigned to each of the distinct `AlertType` values is different from the icon assigned to every other `AlertType` value.

**Validates: Requirements 26.2, 26.3**

#### Property 46 (template): Empty underlying data renders an empty state instead of an empty chart/list
*For any* of the Economics tab's four sub-tabs (or the cost-by-category donut chart) and *any* underlying dataset (including the empty case), an empty-state message renders if and only if the dataset is empty; otherwise the corresponding chart or list renders.

**Validates: Requirements 27.4, 27.5**

### AI Chat

#### Property 47: Chat_Session_Sidebar orders sessions by most-recently-active first
*For any* set of chat sessions with arbitrary `lastActiveAt` timestamps (including ties), the rendered order is non-increasing by that timestamp.

**Validates: Requirements 28.1**

#### Property 48: Loading a session round-trips its stored message history
*For any* session with an arbitrary message history (including empty), selecting it loads exactly that history into the chat area, unmodified.

**Validates: Requirements 28.2**

#### Property 49: The first message in a new session lazily creates that session
*For any* new, unsaved session and *any* first message sent within it, after sending, the session collection contains a new session whose message history begins with that message, and the sidebar reflects it.

**Validates: Requirements 28.5**

#### Property 50: Message role determines alignment/style, a total 2-value mapping
*For any* message with role `user` or `assistant`, its alignment (right/left respectively) and background/border treatment are determined solely by its role, and the two roles' visual treatments are always distinct from each other regardless of message content.

**Validates: Requirements 29.1**

#### Property 51: Assistant markdown rendering never throws and user text is always rendered literally
*For any* arbitrary string used as message text (including malformed or unsupported markdown syntax), rendering an assistant message never throws — malformed segments degrade to plain text without interrupting the rest of the message — and rendering a user message with that same string always produces the literal text with no markdown interpretation (e.g. literal `**bold**` characters remain visible as typed, not rendered as bold).

**Validates: Requirements 29.2, 29.5, 29.6**

#### Property 52: Voice recording finalization is a boundary predicate on stop time
*For any* manual-stop elapsed time T seconds, the recording is finalized and made sendable if and only if T ≥ 1; independently, an elapsed time reaching exactly 60 seconds always triggers automatic finalization even without a manual stop.

**Validates: Requirements 31.5, 31.6**

### Team Page

#### Property 53: Grouping is a total partition — every member appears in exactly one cluster
*For any* dataset of team members, projects, and clients, and *any* of the three grouping modes, the computed cluster set is a true partition of the member roster: every member appears in exactly one cluster (a real group, or the distinct "unassigned" fallback cluster when they lack a value for the current grouping dimension), never zero clusters and never more than one.

**Validates: Requirements 32.3, 32.4**

#### Property 54: Ring layout evenly spaces members around a cluster's center
*For any* cluster with N members and *any* rotation offset, the computed angle for member `i` equals `(i / N) * 2π + offset`, so consecutive members are spaced exactly `2π / N` radians apart, and all N angles are distinct modulo 2π for N ≥ 1.

**Validates: Requirements 33.1**

#### Property 55: Momentum/rotation decay always terminates within a bounded number of ticks
*For any* release velocity (linear or angular) at or above the respective flick threshold, applying the fixed friction multiplier each tick eventually drops the magnitude below the stop threshold within a bounded, deterministic number of ticks (consistent with the "up to 2 seconds" ceiling at the implementation's fixed tick rate); for release velocities below the threshold, motion stops immediately with zero additional ticks.

**Validates: Requirements 33.2, 33.3**

#### Property 56: At most one detail panel/tooltip is open, and it always reflects the most recent activation
*For any* sequence of activate/dismiss operations on Member_Graph bubbles and cluster centers, at most one detail panel or tooltip is open at any point, and whenever one is open it corresponds to the most recently activated element; a dismiss (via its control or an outside click) always results in none being open.

**Validates: Requirements 33.4, 33.6, 33.7, 24.4**

#### Property 57: Drag-vs-activation classification is a distance threshold predicate
*For any* pointer-down-to-pointer-up movement distance D, the gesture is classified as an activation (tap) if and only if D is below the minimum-drag-distance threshold; otherwise it is classified as a drag.

**Validates: Requirements 33.5**

#### Property 58: Gradient-initials fallback is a deterministic function of the member's identity seed
*For any* member identity seed (id or name), computing the fallback avatar's gradient-pair and initials multiple times, or for two different members that happen to share the same seed, always produces the identical result.

**Validates: Requirements 34.1, 34.2**

### Admin Panel

#### Property 59: Admin route guard decision is a total, correct 3-outcome function
*For any* combination of `(isAuthenticated, isAdminStatusResolved, isAdmin)`, `resolveAdminGuardDecision` returns exactly one of `render | redirect | block`, following the precedence: unresolved admin status → `block`; else non-admin → `redirect`; else admin → `render` — every combination maps to exactly one outcome, with no combination left unhandled.

**Validates: Requirements 35.1, 35.2, 35.4**

#### Property 60: Deletion is blocked exactly when the target is referenced by the Email Trigger configuration
*For any* entity (project, team member, or timeline block) and *any* Email Trigger configuration (including the case where none exists), deleting that entity is blocked if and only if the configuration's target fields reference that entity's id; otherwise deletion proceeds.

**Validates: Requirements 36.3**

#### Property 61: Email Trigger save round-trips and overwrites any prior configuration
*For any* valid Email Trigger configuration (a selected project, task, and team member, plus 1–10 valid recipient emails), saving it results in the persisted configuration matching exactly that input, regardless of what configuration existed before the save.

**Validates: Requirements 36.6**

#### Property 62: Recipient addition is a correct three-rule validator
*For any* current recipient list (0–10 valid emails) and *any* candidate new recipient string, adding it succeeds if and only if the list currently has fewer than 10 entries, the candidate is a syntactically valid email address, and the candidate is not already present in the list (case-insensitive); on rejection, the shown error identifies which of the three rules was violated, and the list is left unchanged.

**Validates: Requirements 36.7**

## Error Handling

- **Missing mock handler:** unchanged pre-existing behavior — `mock-api-client.ts` throws `No mock handler registered for {METHOD} {path}` (Req 2.6 is satisfied by existing infrastructure; this design only adds new registered handlers, never suppresses that error path).
- **Form validation failures** (project create/edit, client add, admin CRUD forms, Email Trigger): every dialog keeps itself open, shows field-level messages via `FormField`'s existing `error` slot, and does not touch the underlying mock collection — this is enforced by the shared validation-predicate property (Property 18) plus each dialog only calling its create/update handler after `handleSubmit` succeeds (react-hook-form's standard pattern, matching onboarding steps already in this repo).
- **Widget_Board invalid drop/resize:** `react-grid-layout`'s `onLayoutChange` callback is only committed to `useWidgetBoardLayout` state when the library itself reports a non-colliding layout; Property 8 governs this, and the UI-level consequence is simply "the widget snaps back" (react-grid-layout's own drag-preview mechanics already provide this, matching Demo's usage).
- **Timeline drag persistence failure (Req 9.6):** the drag hook optimistically updates local state, then calls the mock `PUT` handler; on rejection (simulated via a mock handler that can be configured to reject in tests), the hook reverts the block to its pre-drag `(day, time)` and surfaces an inline error near the block.
- **Analysis generation timeout/failure (Req 18.2):** the mock `generateAnalysis()` call is wrapped in a `Promise.race` against a 30-second timer; on timeout or an injected failure, the step renders an error state with a "Retry" button that re-invokes generation.
- **Economics data load failure (Req 27.6-27.7):** the tab's `useQuery` failure state renders an error message and a retry button that calls `refetch()` — standard react-query pattern, no new machinery needed.
- **Microphone permission denied (Req 31.4):** `useVoiceRecording`'s `startRecording()` catches the `getUserMedia` rejection, sets an `error` state consumed by `RecordingIndicator`, and returns the input area to `idle`.
- **Admin route guard block/redirect (Req 35.2-35.4):** `AdminGuard` renders nothing while `resolveAdminGuardDecision` returns `block`, and issues a `<Navigate to="/dashboard" />` when it returns `redirect` — no error is displayed to a redirected non-admin user, consistent with Demo's own choice to redirect silently rather than show a permissions error page for this case.
- **Deletion blocked by Email Trigger reference (Req 36.3):** the Admin tab's delete handler checks Property 60's predicate before calling the mock `DELETE` handler at all, and shows an inline message instead of opening the confirmation dialog if blocked.

## Testing Strategy

**Dual approach:** unit/example tests for specific scenarios, timing-driven behavior, and static structural facts; property-based tests (via `fast-check`, already a dependency) for the 62 properties above, each configured for a minimum of 100 iterations and tagged per the format below.

Tag format for every property test:
```
// Feature: demo-frontend-integration, Property {number}: {property title}
```

**Unit/example tests cover** (not exhaustive — one representative test per bullet, following existing patterns like `AuthCallback.test.ts`):
- Static/default facts: fixed tab counts (Req 21.1, 27.1, 36.1), fixed nav-entry counts (Req 5.2), default view-on-mount (Req 8.2, 20.1, 32.2), default grouping mode (Req 32.2).
- Interaction-only sequences with no meaningful input-space beyond "did it happen": profile-panel open/dismiss (Req 4.5-4.6), logout invocation (Req 4.7), FAB navigation (Req 6.2), "+" creation card always last (Req 13.6), drag-to-fill mock document (Req 17.1-17.5), card-click-except-controls navigation (Req 14.6), delete-confirmation gate (Req 9.6's revert path, Req 36.9), Users tab read-only absence of controls (Req 36.11).
- Timing-window assertions using fake timers: greeting auto-dismiss at 9000ms vs 8999ms (Req 6.4-6.5), message-appended-within-100ms and simulated-reply-500-1500ms (Req 29.3-29.4), analysis-loading-≤30s (Req 18.1-18.2), voice-recording tick rate (Req 31.3).
- Referential-integrity smoke check: one test walking every fixture module's foreign-key fields and asserting each resolves to a real id in the referenced module (Req 2.1).
- Mock-handler-coverage smoke check: one test asserting every screen's known method+path calls have a registered handler (Req 2.2), by exercising each screen's data-fetching hooks once under `isMockMode()`.

**Out of scope for both testing approaches** (Req 3.3, `no-quality-tooling` steering): no new lint/format/typecheck scripts. Property and unit tests use the existing `vitest` + `fast-check` setup already present in `package.json` — these are test files, not the quality-tooling category the steering document prohibits (the steering explicitly targets linters/formatters/typecheck scripts, not the test runner already wired into this repo via `test`/`test:watch` npm scripts).

**PBT is intentionally not used for:** IaC/build config (none introduced here), the `react-grid-layout`/`recharts`/`react-markdown` third-party libraries themselves (trusted, already tested upstream — only *this repo's* usage/wiring of them is tested), and the physics/geometry modules' numeric *tuning constants* (friction coefficients, thresholds) — Property 55 tests the *shape* of the decay behavior (bounded termination, threshold gating) without asserting exact wall-clock timing, which is the correct level of abstraction for a property test per the guidance's "test your code's logic, not exact timing" principle.
