/**
 * Generic, reusable "top N by criterion" selection utility.
 *
 * Per the design document's "Property 10: Capped top-N selection by
 * criterion" template, this is the single named utility every Dashboard
 * widget that caps a list (AlertsWidget cap 5, DocumentsWidget cap 5,
 * ActionItemsWidget cap 5, MilestonesWeekWidget cap 10 — Requirement 12.1)
 * imports and uses, rather than each widget reimplementing inline
 * sort/slice logic with potentially inconsistent semantics.
 */

/**
 * Selects at most `cap` items from `items`, ordered by `criterion(item)`
 * descending (highest value first — e.g. most-recent timestamp, highest
 * priority score).
 *
 * Pure: does not mutate `items`. Total: handles an empty `items` array and
 * any `cap` value (including 0 or negative) without throwing.
 *
 * - If `items.length <= cap`, every item is returned, still sorted by
 *   criterion (just not truncated).
 * - If `cap <= 0`, returns an empty array.
 * - Sorting uses `Array.prototype.sort`, which is stable in modern JS
 *   engines (guaranteed by spec since ES2019), so items with equal
 *   criterion values preserve their original relative order rather than
 *   being reordered arbitrarily.
 *
 * @param items The items to select from.
 * @param criterion Returns the numeric value to sort by, descending.
 * @param cap The maximum number of items to return.
 */
export function selectTopN<T>(items: T[], criterion: (item: T) => number, cap: number): T[] {
  if (cap <= 0) return [];

  return [...items].sort((a, b) => criterion(b) - criterion(a)).slice(0, cap);
}
