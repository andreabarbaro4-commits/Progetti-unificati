# Duplication Consolidation Audit

## Summary
- Issues identified: 6
- Issues resolved: 2
- Items deferred to task 8 (component library): 4

## Findings

### Finding 1: RoleStep.tsx and JobStep.tsx — nearly identical step structure

**Files:**
- `src/features/onboarding/steps/RoleStep.tsx`
- `src/features/onboarding/steps/JobStep.tsx`

**What's duplicated (~85% identical lines):**
Both components render the same structural pattern:
1. `<div className="Step step-header-layout">`
2. `<TopNavigation>` with a label
3. `<h1 className="section-title">` with heading text
4. `<RoleTagList>` with identical props (`selectedRole`, `onSelectRole`)
5. A "proceed" button

**Parameters that differ:**
| Parameter | RoleStep | JobStep |
|-----------|----------|---------|
| TopNavigation `leftLabel` | _(omitted)_ | `"Profilo/Lavoro"` |
| Title text | "Benvenuto!\nRaccontaci chi sei" | "Che lavoro fai?" |
| Decorative image | _(none)_ | `avatar3` with class `avatar-decorativo` |
| Button className | `"procedi-btn"` | `"tr"` |
| Button disabled logic | `disabled={!selectedRole}` | _(none)_ |

**Consolidation opportunity:** Extract a shared `TagSelectionStep` component parameterized by `title`, `navLabel`, `showAvatar`, `buttonClassName`, and `buttonDisabled`.

---

### Finding 2: PersonalInfoStep.tsx and AccountStep.tsx — identical form step shell

**Files:**
- `src/features/onboarding/steps/PersonalInfoStep.tsx`
- `src/features/onboarding/steps/AccountStep.tsx`

**What's duplicated (~80% identical lines):**
Both components share the exact same outer structure and hook setup:
1. `useForm` with `createFormConfig(Schema)`
2. `useTranslation()` for labels
3. `<div className="Step"> <div className="logo"> <FlowleeLogo />`
4. `<h1 className="section-title">` with two-line heading
5. `<form onSubmit={handleSubmit(() => onNext())}>`
6. Multiple `<FormField>` wrappers each containing an `<input>` with `register()`, `aria-invalid`, `aria-describedby`
7. `<button className="de" type="submit">{t('next')}</button>`

**Parameters that differ:**
| Parameter | PersonalInfoStep | AccountStep |
|-----------|-----------------|-------------|
| Schema | `PersonalInfoSchema` | `AccountSchema` |
| Title lines | "welcome" / "tell_us_who_you_are" | "hello_marco" / "create_account" |
| Fields | name, surname, gender (select), birthDate | email, password, confirmPassword |
| Has `Step-inner-container` wrapper | No | Yes |

**Consolidation opportunity:** Extract a generic `FormStep` component parameterized by `schema`, `title`, `fields` config array, and optional layout variant. Each field config would specify name, type, placeholder, and input element type.

---

### Finding 3: SendingCodeStep.tsx and VerifyCodeStep.tsx — identical logo-step shell

**Files:**
- `src/features/onboarding/steps/SendingCodeStep.tsx`
- `src/features/onboarding/steps/VerifyCodeStep.tsx`

**What's duplicated (~80% identical lines):**
Both share the same container pattern:
1. `<div className="Step">`
2. `<div className="logo">`
3. `<FlowleeLogo />`
4. `<h1 className="section-title">` with multiline text
5. A primary action button calling `onNext`

**Parameters that differ:**
| Parameter | SendingCodeStep | VerifyCodeStep |
|-----------|----------------|----------------|
| Decorative image | `avatar` above title | _(none)_ |
| Title text | "Sto inviando il codice..." | "Inserisci il codice..." |
| Body content | _(none)_ | Email display + input field + "resend" button |
| Button className | `"de"` | `"era"` |
| Button text | "Successivo" | "Conferma" |

**Consolidation opportunity:** Extract a `LogoStep` layout component that provides the Step > logo > FlowleeLogo > title shell, and accepts `children` for the body content and button.

---

### Finding 4: Full-width submit button CSS classes (.de, .era, .procedi-btn, .tr, .qa)

**Files:**
- `src/App.css` (lines ~733, ~812, ~999, ~1196)
- Referenced in: `AccountStep.tsx`, `PersonalInfoStep.tsx`, `SendingCodeStep.tsx`, `VerifyCodeStep.tsx`, `RoleStep.tsx`, `JobStep.tsx`, `PhotoUploadStep.tsx`

**What's duplicated (≥90% identical declarations):**
Five separate CSS classes that all define essentially the same button:
```css
/* Common pattern across .de, .era, .procedi-btn, .tr, .qa */
width: 100%;
padding: 10-15px;
background-color: #000;
color: #fff;
border: none;
border-radius: 8px;
cursor: pointer;
font-weight: bold; /* some have this */
```

**Parameters that differ:**
| Class | margin-top | font-size | Other |
|-------|-----------|-----------|-------|
| `.de` / `.era` | 0px | _(default)_ | font-weight: bold |
| `.procedi-btn` | 140-160px | 20px | — |
| `.tr` | 160px | 20px | — |
| `.qa` | 140px | 20px | display: block; margin: auto |

**Consolidation opportunity:** Replace all five classes with a single shared `Button` component variant (e.g., `variant="fullWidth"`) that accepts `marginTop` as a prop or uses a wrapper/Tailwind utility for spacing.

---

### Finding 5: Class composition via .filter(Boolean).join(' ') pattern

**Files:**
- `src/components/ui/Button.tsx` (line 25)
- `src/components/ui/LocaleSwitcher.tsx` (line 31)

**What's duplicated:**
Both components use the same imperative pattern for conditional class composition:
```typescript
[baseClasses, conditionalClass, className].filter(Boolean).join(' ')
```

**Parameters that differ:**
| Location | Base classes | Conditional logic |
|----------|-------------|-------------------|
| Button.tsx | `baseClasses` + `variantClasses[variant]` + `className` | — |
| LocaleSwitcher.tsx | outer `div` classes + `className`; inner button active/inactive | Ternary for active state |

**Consolidation opportunity:** Replace with `cn()` helper (already created in `src/lib/utils.ts`). This is a direct 1:1 replacement that eliminates the duplicated pattern.

---

### Finding 6: Sidebar button inline style pattern in CompanySettingsStep.tsx

**Files:**
- `src/features/onboarding/steps/CompanySettingsStep.tsx` (lines ~60–105)

**What's duplicated (5 instances within same file, ~90% identical):**
Five sidebar `<button>` elements with nearly identical inline styles:
```tsx
<button type="button" style={{
  backgroundColor: 'transparent',  // first one is '#000'
  border: '1px solid #e5e5e5',     // first one: 'none'
  padding: '12px',
  borderRadius: '10px',
  textAlign: 'left',
  fontSize: '13px',
  cursor: 'pointer',
}}>
```

**Parameters that differ:**
| Instance | backgroundColor | border | color | Text content |
|----------|----------------|--------|-------|-------------|
| 1 (active) | `#000` | none | `#fff` | sidebar_details |
| 2–5 (inactive) | `transparent` | `1px solid #e5e5e5` | _(default)_ | sidebar_admins, sidebar_contacts, sidebar_billing, sidebar_work_model |

**Consolidation opportunity:** Extract a `SidebarButton` component (or use a shared Button variant like `variant="sidebar"` with `active` prop) that parameterizes the active/inactive state. Alternatively, since this is within a single file, extract a local component or map over a config array.

---

## Exceptions

_No exceptions recorded yet. All findings above meet the ≥80% identical lines threshold._

---

## Consolidation Applied

### Finding 5 — `.filter(Boolean).join(' ')` → `cn()` (RESOLVED)

**Original locations:**
- `src/components/ui/Button.tsx` (line 25)
- `src/components/ui/LocaleSwitcher.tsx` (line 31, 38)

**New shared location:** `src/lib/utils.ts` — `cn()` helper (already existed from task 1.2)

**What changed:**
- `Button.tsx`: Replaced `[baseClasses, variantClasses[variant], className].filter(Boolean).join(' ')` with `cn(baseClasses, variantClasses[variant], className)`
- `LocaleSwitcher.tsx`: Replaced `['...', className].filter(Boolean).join(' ')` with `cn('...', className)` for the outer div, and `['...', ternary].join(' ')` with `cn('...', ternary)` for inner buttons

**Parameterized differences:** None — this was a direct 1:1 pattern replacement using the existing `cn()` utility.

---

### Finding 6 — Sidebar button inline styles in CompanySettingsStep.tsx (RESOLVED)

**Original location:** `src/features/onboarding/steps/CompanySettingsStep.tsx` (lines ~60–105)

**Consolidation approach:** Replaced 5 nearly-identical `<button>` elements with a single `.map()` over a config array of translation keys, using the index to determine active/inactive styling.

**Before:** 5 separate `<button>` blocks (~50 lines)
**After:** Single `.map()` expression (~15 lines)

**Parameterized differences:**
| Parameter | Active (index 0) | Inactive (index 1–4) |
|-----------|-----------------|---------------------|
| `backgroundColor` | `#000` | `transparent` |
| `color` | `#fff` | _(default)_ |
| `border` | `none` | `1px solid #e5e5e5` |
| `text` | `sidebar_details` | `sidebar_admins`, `sidebar_contacts`, `sidebar_billing`, `sidebar_work_model` |

---

## Deferred to Task 8 (Component Library Creation)

### Finding 1 — RoleStep.tsx / JobStep.tsx step structure
**Reason:** These are structural patterns best addressed when creating shared Card/Step components with cva variants in task 8.

### Finding 2 — PersonalInfoStep.tsx / AccountStep.tsx form step shell
**Reason:** Requires a generic `FormStep` component which will be part of the component library in task 8.

### Finding 3 — SendingCodeStep.tsx / VerifyCodeStep.tsx logo-step shell
**Reason:** Will be extracted as a `LogoStep` layout component during task 8.

### Finding 4 — Full-width submit button CSS classes (.de, .era, .procedi-btn, .tr, .qa)
**Reason:** These will be consolidated into a shared `Button` component variant (e.g., `variant="fullWidth"`) in task 8 when the Button component gets cva variants.
