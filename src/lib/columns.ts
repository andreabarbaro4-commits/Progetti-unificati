/**
 * Responsive grid column count for the Projects_List grid.
 *
 * Per the design document's "Property 13: Grid column count is a step
 * function of viewport width", this is the single named utility the
 * Projects_List grid (Requirement 13.1) uses to determine how many
 * columns to render at a given viewport width, rather than duplicating
 * the breakpoint thresholds inline as Tailwind class logic.
 */

/** Breakpoint below which the grid renders 1 column. */
const SM_BREAKPOINT = 640;
/** Breakpoint below which the grid renders 2 columns (at/above SM_BREAKPOINT). */
const LG_BREAKPOINT = 1024;

/**
 * Returns the number of grid columns for a given viewport width.
 *
 * - `width < 640` -> 1 column.
 * - `640 <= width < 1024` -> 2 columns.
 * - `width >= 1024` -> 3 columns (the baseline value for "3 or more" per
 *   Requirement 13.1; a wider breakpoint offering additional columns can
 *   be layered on by the caller/CSS via Tailwind classes without this
 *   function needing further branches).
 *
 * Pure and total: any finite number is accepted, including negative,
 * zero, fractional, or very large values — this never throws. Negative or
 * fractional widths are treated the same as their non-negative/rounded
 * equivalent for classification purposes (e.g. `-100` and `0` both yield
 * 1 column; a viewport width is never actually negative in practice, but
 * the function stays defensive rather than assuming well-formed input).
 *
 * @param width Viewport width in pixels.
 * @returns The number of grid columns (1, 2, or 3).
 */
export function columnsForWidth(width: number): number {
  if (width < SM_BREAKPOINT) return 1;
  if (width < LG_BREAKPOINT) return 2;
  return 3;
}
