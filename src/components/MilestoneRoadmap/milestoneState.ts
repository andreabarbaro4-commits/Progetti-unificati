import type { Milestone } from '../../mock/fixtures/types';

/**
 * A milestone's classified state relative to "today", per Requirement 23.1
 * and Property 35 (milestone state classification is total and
 * deterministic).
 */
export type MilestoneState = 'completed' | 'current' | 'late' | 'future';

/**
 * Truncates a Date to a date-only key (local calendar date, no
 * time-of-day component) so comparisons ignore hours/minutes/seconds.
 */
function toDateOnly(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Classifies a milestone's state relative to `today`.
 *
 * Pure, total, and deterministic:
 * - `completed` if `milestone.completed` is true, regardless of date.
 * - Otherwise `late` if the milestone's date is before today (date-only
 *   comparison), `current` if it's today, or `future` if it's after today.
 *
 * Date comparisons ignore time-of-day on both `milestone.date` and `today`,
 * so a milestone due "today" classifies as `current` no matter what hour
 * `today` represents. `milestone.date` is parsed via the `Date` constructor
 * (ISO date strings, e.g. `"2025-01-15"`); any valid date string is
 * handled without throwing.
 *
 * @param milestone The milestone to classify.
 * @param today The reference date to compare against (typically `new
 *   Date()` at call time).
 */
export function classify(milestone: Milestone, today: Date): MilestoneState {
  if (milestone.completed) {
    return 'completed';
  }

  const milestoneDay = toDateOnly(new Date(milestone.date));
  const todayDay = toDateOnly(today);

  if (milestoneDay < todayDay) {
    return 'late';
  }
  if (milestoneDay === todayDay) {
    return 'current';
  }
  return 'future';
}
