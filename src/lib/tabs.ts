/**
 * Generic, reusable single-panel-visible tab helper.
 *
 * Per the design document's "Property 32: Exactly one panel is visible per
 * selected tab index" template, this is the single named utility every
 * tab-strip component (Project_Detail's main tabs — Requirement 21.3 — and
 * Economics_Tab's sub-tab switcher, which reuses the same property at
 * Requirement 27.3) imports and uses to decide panel visibility, rather
 * than each component reimplementing an inline `selectedIndex === index`
 * check with potentially inconsistent semantics.
 *
 * Because every panel's visibility is driven by this same function against
 * the same single `selectedIndex` state variable, "exactly one panel
 * visible" holds trivially by construction: for any fixed `selectedIndex`,
 * exactly one `tabIndex` in the set of rendered tabs satisfies strict
 * equality.
 */

/**
 * Returns true if and only if `tabIndex` is the currently selected tab.
 *
 * Pure and total: never throws, regardless of input.
 *
 * @param selectedIndex The index of the currently selected tab.
 * @param tabIndex The index of the tab being checked.
 */
export function isTabActive(selectedIndex: number, tabIndex: number): boolean {
  return selectedIndex === tabIndex;
}
