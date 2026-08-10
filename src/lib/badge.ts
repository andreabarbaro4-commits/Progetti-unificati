/**
 * Alert-count badge formatting.
 *
 * Used by Project_Card (Requirement 14.5) and Project_Detail's Alerts tab
 * label (Requirements 21.4, 21.5) to render a count badge for active alerts.
 */

/**
 * Format an alert count into its badge display string.
 *
 * - `count <= 0` → `null` (no badge renders; negative counts are treated
 *   defensively the same as zero).
 * - `1 <= count <= 99` → the exact count as a string (e.g. "5", "42").
 * - `count > 99` → `"99+"`.
 *
 * Callers should only ever pass integers, but non-integer input is handled
 * defensively by flooring toward zero (`Math.trunc`) before classifying,
 * so e.g. `0.5` is treated as `0` (no badge) and `1.9` is treated as `1`.
 *
 * @param count - The number of active alerts.
 * @returns The badge string, or `null` if no badge should render.
 */
export function formatCountBadge(count: number): string | null {
  const normalized = Math.trunc(count);

  if (normalized <= 0) return null;
  if (normalized > 99) return '99+';
  return String(normalized);
}
