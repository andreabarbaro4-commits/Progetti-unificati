import { filterExact } from '../../lib/filter';

/**
 * Shared "select-to-filter, re-select-to-revert" task filtering logic, per
 * Requirements 18.5, 18.6, 23.2, and 23.3 and the design's "Property 23:
 * Milestone selection toggles task-list filtering".
 *
 * Both the Project_Wizard's step 2 (Milestone_Roadmap + task list) and
 * Project_Detail's Milestones & Tasks tab need identical behavior when a
 * milestone card is selected: filter the visible task list to that
 * milestone's tasks, or revert to showing all tasks if the same milestone
 * is selected again. This module is the single canonical implementation
 * both call sites (and `MilestoneRoadmap.tsx`'s own `onSelect` wiring)
 * reuse, so the "click already-selected -> null" rule isn't duplicated.
 */

/**
 * Filters `tasks` down to those belonging to `selectedMilestoneId`.
 *
 * Pure and total: works for any `tasks` array (including an empty one)
 * and any `selectedMilestoneId` value.
 *
 * - IF `selectedMilestoneId` is `null` (no milestone selected, or
 *   re-selected to revert), returns ALL tasks unfiltered.
 * - Otherwise, returns only tasks whose `milestoneId` matches
 *   `selectedMilestoneId`, via `filterExact`.
 *
 * @param tasks The tasks to filter.
 * @param selectedMilestoneId The currently selected milestone's id, or
 *   `null` if no milestone is selected.
 */
export function filterTasksByMilestone<T extends { milestoneId?: string }>(
  tasks: T[],
  selectedMilestoneId: string | null,
): T[] {
  if (selectedMilestoneId === null) {
    return tasks;
  }

  return filterExact(tasks, (task) => task.milestoneId === selectedMilestoneId);
}

/**
 * Computes the next selected-milestone id after a milestone card is
 * clicked, implementing the "select-to-filter, re-select-to-revert"
 * toggle rule.
 *
 * Pure and total.
 *
 * - IF `clickedMilestoneId` equals `currentSelectedId`, returns `null`
 *   (deselect/revert to showing all tasks).
 * - Otherwise, returns `clickedMilestoneId` (select the newly clicked
 *   milestone).
 *
 * @param currentSelectedId The currently selected milestone's id, or
 *   `null` if none is selected.
 * @param clickedMilestoneId The id of the milestone the user just
 *   clicked.
 */
export function toggleMilestoneSelection(
  currentSelectedId: string | null,
  clickedMilestoneId: string,
): string | null {
  if (clickedMilestoneId === currentSelectedId) {
    return null;
  }

  return clickedMilestoneId;
}
