---
inclusion: auto
---

# Mock Mode — Bypass Validation & Gate Removal

## Policy
When `VITE_MOCK=true` (mock mode), all form validation and progression gates MUST be disabled so the UI is fully navigable without filling in any fields.

## Rules

1. **Form validation**: `createFormConfig()` in `src/lib/form-utils.ts` skips the Zod resolver in mock mode. All new forms using `createFormConfig` automatically inherit this behavior — no extra work needed.

2. **Button/step gates**: Any `disabled` condition on buttons that gates on user-provided data (e.g. `disabled={!selectedRole}`) must be wrapped with a mock-mode bypass: `disabled={!isMockMode() && <original condition>}`.

3. **Data dependencies**: If a component renders data from a previous step that may be empty in mock mode, provide a hardcoded fallback. Use the pattern: `value || 'Mock Fallback'`.

4. **API calls**: In mock mode the mock API client intercepts all requests. If a new endpoint is needed, register a handler in `src/mock/setup.ts` with fixture data from `src/mock/fixtures/`.

## Instructions for AI
- When creating new forms, always use `createFormConfig()` — it handles mock mode automatically.
- When adding progression gates (disabled buttons, conditional renders), always bypass them in mock mode using `isMockMode()` from `src/mock/index.ts`.
- When a step depends on data from a prior step, provide a sensible mock fallback for empty values.
- Never require filled fields to navigate the UI in mock mode.
