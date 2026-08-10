import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import { MilestoneRoadmap } from '../../../components/MilestoneRoadmap/MilestoneRoadmap'
import { filterTasksByMilestone, toggleMilestoneSelection } from '../../../components/MilestoneRoadmap/taskFilter'
import type { Milestone, Task } from '../../../mock/fixtures/types'

export interface MilestonesTasksTabProps {
  /** The project ID to fetch milestones and tasks for. */
  projectId: string
}

/**
 * MilestonesTasksTab — renders the shared `MilestoneRoadmap` (with full
 * `milestoneState.classify` state indicators) and a task list filtered by
 * the selected milestone via the shared "select-to-filter / re-select-to-
 * revert" logic (Requirements 23.1, 23.2, 23.3).
 *
 * This tab is one of two consumers of the shared `MilestoneRoadmap` +
 * `taskFilter` logic (the other being the Project Wizard's step 2). The
 * key differences from the Wizard use case:
 * - `showStateIndicator={true}` — milestones here have a real timeline
 *   state (completed/current/late/future) classified by `milestoneState.classify`.
 * - `editable={false}` — names are not inline-editable here (edits route
 *   through area-local dialogs instead, wired at task 24.8).
 * - The add/edit/delete affordances are managed by the parent via
 *   area-local dialogs (task 24.8), not by this component or the
 *   `MilestoneRoadmap`'s own "+" affordance.
 */
export function MilestonesTasksTab({ projectId }: MilestonesTasksTabProps) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)

  // ── Fetch milestones for this project ─────────────────────────────────────

  const { data: allMilestones = [] } = useQuery<Milestone[]>({
    queryKey: ['milestones'],
    queryFn: () => apiClient.get<Milestone[]>('/milestones'),
  })

  const projectMilestones = useMemo(
    () => allMilestones.filter((ms) => ms.projectId === projectId),
    [allMilestones, projectId],
  )

  // ── Fetch tasks for this project ──────────────────────────────────────────

  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => apiClient.get<Task[]>('/tasks'),
  })

  const projectTasks = useMemo(
    () => allTasks.filter((task) => task.projectId === projectId),
    [allTasks, projectId],
  )

  // ── Apply the shared milestone-selection task filter ───────────────────────

  const visibleTasks = useMemo(
    () => filterTasksByMilestone(projectTasks, selectedMilestoneId),
    [projectTasks, selectedMilestoneId],
  )

  // ── Milestone selection handler (select-to-filter, re-select-to-revert) ───

  function handleMilestoneSelect(id: string | null) {
    if (id === null) {
      // Deselection coming directly from MilestoneRoadmap's toggle logic
      setSelectedMilestoneId(null)
    } else {
      setSelectedMilestoneId(toggleMilestoneSelection(selectedMilestoneId, id))
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Milestone Roadmap with full state classification (Req 23.1) */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Milestones</h2>
        <MilestoneRoadmap
          milestones={projectMilestones}
          selectedId={selectedMilestoneId}
          onSelect={handleMilestoneSelect}
          showStateIndicator
          editable={false}
          readOnly
        />
      </section>

      {/* Task list filtered by selected milestone (Req 23.2, 23.3) */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
          {selectedMilestoneId && (
            <span className="text-xs text-gray-500">
              Filtered by milestone
            </span>
          )}
        </div>

        {visibleTasks.length === 0 ? (
          <p className="text-sm text-gray-500">No tasks to display.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibleTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)]"
              >
                <span className="text-sm font-medium text-gray-900">{task.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 capitalize">{task.status.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-400 capitalize">{task.priority}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
