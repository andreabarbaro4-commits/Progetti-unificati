import type { TaskPriority } from '../mock/fixtures/types';

/**
 * Priority-chip cycling: high → medium → low → high.
 *
 * A pure function returning the next priority in the fixed period-3 cycle.
 * Used by the TaskListEditor (Project Wizard step 2) to update a task's
 * priority when the user clicks/activates the PriorityChip.
 *
 * @param current - The task's current priority value.
 * @returns The next priority in the cycle.
 *
 * @example
 * nextPriority('high')   // 'medium'
 * nextPriority('medium') // 'low'
 * nextPriority('low')    // 'high'
 */
export function nextPriority(current: TaskPriority): TaskPriority {
  const cycle: Record<TaskPriority, TaskPriority> = {
    high: 'medium',
    medium: 'low',
    low: 'high',
  };
  return cycle[current];
}
