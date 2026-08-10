/**
 * Generic, reusable text truncation utility.
 *
 * Per the design document's "Property 33: Description truncation is
 * bounded at 500 characters with a fallback for empty input" template,
 * this is the single named utility used to render a project's description
 * in OverviewTab (Requirement 22.2) — truncating overly long text and
 * substituting placeholder text when no description is provided, rather
 * than each call site reimplementing inline length checks and slicing.
 */

/**
 * Returns `text` (trimmed), or `placeholder` if `text` is undefined, null,
 * or empty/whitespace-only after trimming. If the trimmed text's length
 * exceeds `maxLength`, it is truncated and a single-character ellipsis
 * ("…") is appended.
 *
 * Ellipsis convention: the ellipsis counts toward `maxLength`, i.e. the
 * text is sliced to `maxLength - 1` characters before the ellipsis is
 * appended, so the returned string's length never exceeds `maxLength`
 * (for `maxLength >= 1`). A single-character ellipsis is used (rather than
 * three literal dots) to keep the truncated text closer to the full
 * `maxLength` budget.
 *
 * Pure and total: never throws, regardless of input.
 *
 * @param text The text to display, or undefined/null if unavailable.
 * @param maxLength The maximum length of the returned string (excluding
 * the placeholder, which is always returned in full).
 * @param placeholder The text to return when `text` is missing or blank.
 */
export function truncateWithFallback(
  text: string | undefined | null,
  maxLength: number,
  placeholder: string,
): string {
  const trimmed = text?.trim() ?? '';

  if (trimmed.length === 0) return placeholder;
  if (trimmed.length <= maxLength) return trimmed;
  if (maxLength <= 0) return '';

  return `${trimmed.slice(0, Math.max(maxLength - 1, 0))}…`;
}
