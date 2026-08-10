/**
 * Generic, reusable filtering utility.
 *
 * Per the design document's "Property 15: Filtered set equals exactly the
 * matching subset" template, this is the single named utility every
 * filtering call site (client filter on Projects_List, member search
 * filter in AddMemberPopup, document filter in DocumentsTab) imports and
 * uses, rather than each site reimplementing inline `.filter()` calls with
 * potentially inconsistent semantics.
 *
 * Intentionally a thin wrapper around `Array.prototype.filter` — the value
 * is having one well-typed, well-known name for this shape of operation,
 * not novel logic.
 */

/**
 * Returns exactly the subset of `collection` for which `predicate` returns
 * true, preserving the original order.
 *
 * Pure: does not mutate `collection` and has no side effects.
 *
 * @param collection The items to filter.
 * @param predicate Returns true for items that should be included.
 */
export function filterExact<T>(collection: T[], predicate: (item: T) => boolean): T[] {
  return collection.filter(predicate);
}
