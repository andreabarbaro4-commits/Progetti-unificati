import { useState } from 'react'
import type React from 'react'
import { cn } from '../../lib/utils'
import { PriorityChip } from '../../components/ui/StatusChip'
import { useWizardStore } from './useWizardStore'
import type { WizardAnalysis } from './useWizardStore'

type WizardTask = WizardAnalysis['tasks'][number]

/**
 * Cycles a task's priority through the high → medium → low → high sequence.
 * Implementation lives here temporarily; task 20.6 will extract it as a shared utility.
 */
function cyclePriority(current: WizardTask['priority']): WizardTask['priority'] {
  const cycle: Record<WizardTask['priority'], WizardTask['priority']> = {
    high: 'medium',
    medium: 'low',
    low: 'high',
  }
  return cycle[current]
}

export interface TaskListEditorProps {
  /** When a milestone is selected, only show tasks belonging to that milestone. */
  selectedMilestoneId?: string | null
  className?: string
}

/**
 * TaskListEditor — renders the wizard's step 2 task list grouped by milestone.
 *
 * Features:
 * - Each task row: editable name, clickable priority chip (cycles high→medium→low→high),
 *   drag handle, delete button.
 * - Drag reorder within a milestone group (native HTML5 drag, no library).
 * - Drag reassignment across milestone groups (dragging a task from one group to
 *   another changes its milestoneId).
 * - Milestone-delete cascade: when a milestone is deleted externally, its tasks
 *   are automatically removed (handled via the store's analysis state).
 *
 * Requirements: 19.1, 19.3, 19.4, 19.5, 18.9
 */
export function TaskListEditor({ selectedMilestoneId, className }: TaskListEditorProps) {
  const analysis = useWizardStore((s) => s.analysis)
  const setAnalysis = useWizardStore((s) => s.setAnalysis)

  const [dragState, setDragState] = useState<{
    taskId: string
    sourceMilestoneId: string
  } | null>(null)
  const [dropTarget, setDropTarget] = useState<{
    milestoneId: string
    insertIndex: number
  } | null>(null)

  if (!analysis) return null

  const { milestones, tasks } = analysis

  // Filter milestones based on selection
  const visibleMilestones = selectedMilestoneId
    ? milestones.filter((m) => m.id === selectedMilestoneId)
    : milestones

  // Group tasks by milestone
  function getTasksForMilestone(milestoneId: string): WizardTask[] {
    return tasks.filter((t) => t.milestoneId === milestoneId)
  }

  // --- Mutations ---

  function updateTasks(updater: (tasks: WizardTask[]) => WizardTask[]) {
    if (!analysis) return
    setAnalysis({ ...analysis, tasks: updater(analysis.tasks) })
  }

  /** Rename a task (Req 18.7, 18.8 — reject empty names). */
  function handleRenameTask(taskId: string, newName: string) {
    const trimmed = newName.trim()
    if (!trimmed) return // Req 18.8: reject empty
    updateTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, name: trimmed } : t)))
  }

  /** Cycle priority (Req 19.2 — task 20.6 implements fully, placeholder here). */
  function handleCyclePriority(taskId: string) {
    updateTasks((ts) =>
      ts.map((t) => (t.id === taskId ? { ...t, priority: cyclePriority(t.priority) } : t))
    )
  }

  /** Delete a task (Req 19.5). */
  function handleDeleteTask(taskId: string) {
    if (!analysis) return
    const updatedTasks = analysis.tasks.filter((t) => t.id !== taskId)
    // Also update milestone taskIds
    const updatedMilestones = analysis.milestones.map((m) => ({
      ...m,
      taskIds: m.taskIds.filter((id) => id !== taskId),
    }))
    setAnalysis({ ...analysis, tasks: updatedTasks, milestones: updatedMilestones })
  }

  /**
   * Delete a milestone and cascade-remove its tasks (Req 18.9).
   * Called externally (e.g., from AnalysisStep when the roadmap's delete is triggered).
   */
  // Exported as a static helper for AnalysisStep to call directly on the store.

  // --- Drag and Drop ---

  function handleDragStart(event: React.DragEvent, task: WizardTask) {
    setDragState({ taskId: task.id, sourceMilestoneId: task.milestoneId })
    event.dataTransfer.setData('application/x-wizard-task', task.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(event: React.DragEvent, milestoneId: string, insertIndex: number) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTarget({ milestoneId, insertIndex })
  }

  function handleDragLeave() {
    setDropTarget(null)
  }

  function handleDrop(event: React.DragEvent, targetMilestoneId: string, insertIndex: number) {
    event.preventDefault()
    setDropTarget(null)

    if (!dragState || !analysis) {
      setDragState(null)
      return
    }

    const { taskId, sourceMilestoneId } = dragState
    setDragState(null)

    const task = analysis.tasks.find((t) => t.id === taskId)
    if (!task) return

    // Get tasks in the target milestone group (in their current order)
    const targetGroupTasks = analysis.tasks.filter(
      (t) => t.milestoneId === targetMilestoneId && t.id !== taskId
    )

    // Clamp insert index
    const clampedIndex = Math.max(0, Math.min(insertIndex, targetGroupTasks.length))

    // Insert the task at the target position
    targetGroupTasks.splice(clampedIndex, 0, {
      ...task,
      milestoneId: targetMilestoneId,
    })

    // Rebuild tasks: keep all tasks NOT in source or target groups unchanged,
    // then append reordered target group, and if source !== target, remove task from source group.
    const otherTasks = analysis.tasks.filter(
      (t) =>
        t.id !== taskId &&
        t.milestoneId !== targetMilestoneId &&
        (sourceMilestoneId === targetMilestoneId || t.milestoneId !== sourceMilestoneId)
    )

    // If same milestone, we already handled it (targetGroupTasks has all tasks for that milestone minus the dragged, then re-inserted)
    // If different milestone, we also need to keep the source milestone's remaining tasks
    let sourceGroupTasks: WizardTask[] = []
    if (sourceMilestoneId !== targetMilestoneId) {
      sourceGroupTasks = analysis.tasks.filter(
        (t) => t.milestoneId === sourceMilestoneId && t.id !== taskId
      )
    }

    // Rebuild in order: other tasks + source group (if cross-group) + target group
    const rebuiltTasks = [...otherTasks, ...sourceGroupTasks, ...targetGroupTasks]

    // Update milestone taskIds
    const updatedMilestones = analysis.milestones.map((m) => {
      if (m.id === targetMilestoneId) {
        return { ...m, taskIds: targetGroupTasks.map((t) => t.id) }
      }
      if (m.id === sourceMilestoneId && sourceMilestoneId !== targetMilestoneId) {
        return { ...m, taskIds: sourceGroupTasks.map((t) => t.id) }
      }
      return m
    })

    setAnalysis({ ...analysis, tasks: rebuiltTasks, milestones: updatedMilestones })
  }

  function handleDragEnd() {
    setDragState(null)
    setDropTarget(null)
  }

  // --- Render ---

  if (tasks.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-dashed border-gray-200 p-6 text-center', className)}>
        <p className="text-sm text-gray-500">No tasks generated yet.</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {visibleMilestones.map((milestone) => {
        const milestoneTasks = getTasksForMilestone(milestone.id)
        if (milestoneTasks.length === 0 && selectedMilestoneId) return null

        return (
          <MilestoneGroup
            key={milestone.id}
            milestoneId={milestone.id}
            milestoneName={milestone.name}
            tasks={milestoneTasks}
            dragState={dragState}
            dropTarget={dropTarget}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onRenameTask={handleRenameTask}
            onCyclePriority={handleCyclePriority}
            onDeleteTask={handleDeleteTask}
          />
        )
      })}
    </div>
  )
}

// --- Milestone Group ---

interface MilestoneGroupProps {
  milestoneId: string
  milestoneName: string
  tasks: WizardTask[]
  dragState: { taskId: string; sourceMilestoneId: string } | null
  dropTarget: { milestoneId: string; insertIndex: number } | null
  onDragStart: (event: React.DragEvent, task: WizardTask) => void
  onDragOver: (event: React.DragEvent, milestoneId: string, insertIndex: number) => void
  onDragLeave: () => void
  onDrop: (event: React.DragEvent, milestoneId: string, insertIndex: number) => void
  onDragEnd: () => void
  onRenameTask: (taskId: string, newName: string) => void
  onCyclePriority: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

function MilestoneGroup({
  milestoneId,
  milestoneName,
  tasks,
  dragState,
  dropTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onRenameTask,
  onCyclePriority,
  onDeleteTask,
}: MilestoneGroupProps) {
  const isDropTargetGroup = dropTarget?.milestoneId === milestoneId

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {milestoneName}
      </h4>
      <div
        className={cn(
          'flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50/50 p-2 transition-colors',
          isDropTargetGroup && 'border-indigo-200 bg-indigo-50/30'
        )}
        onDragOver={(e) => {
          // Allow drop at the end of the group when dragging over the empty area
          e.preventDefault()
          onDragOver(e, milestoneId, tasks.length)
        }}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, milestoneId, tasks.length)}
      >
        {tasks.length === 0 ? (
          <p className="py-3 text-center text-xs text-gray-400">
            Drop tasks here
          </p>
        ) : (
          tasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              index={index}
              milestoneId={milestoneId}
              isDragging={dragState?.taskId === task.id}
              isDropBefore={
                dropTarget?.milestoneId === milestoneId && dropTarget?.insertIndex === index
              }
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
              onRename={onRenameTask}
              onCyclePriority={onCyclePriority}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  )
}

// --- Task Row ---

interface TaskRowProps {
  task: WizardTask
  index: number
  milestoneId: string
  isDragging: boolean
  isDropBefore: boolean
  onDragStart: (event: React.DragEvent, task: WizardTask) => void
  onDragOver: (event: React.DragEvent, milestoneId: string, insertIndex: number) => void
  onDragEnd: () => void
  onDrop: (event: React.DragEvent, milestoneId: string, insertIndex: number) => void
  onRename: (taskId: string, newName: string) => void
  onCyclePriority: (taskId: string) => void
  onDelete: (taskId: string) => void
}

function TaskRow({
  task,
  index,
  milestoneId,
  isDragging,
  isDropBefore,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onRename,
  onCyclePriority,
  onDelete,
}: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.name)

  function handleNameCommit() {
    setIsEditing(false)
    if (editValue.trim() && editValue.trim() !== task.name) {
      onRename(task.id, editValue)
    } else {
      setEditValue(task.name) // revert
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleNameCommit()
    } else if (e.key === 'Escape') {
      setEditValue(task.name)
      setIsEditing(false)
    }
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg border border-transparent bg-white px-3 py-2 transition-all',
        isDragging && 'opacity-40',
        isDropBefore && 'border-t-2 border-t-indigo-400'
      )}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onDragOver(e, milestoneId, index)
      }}
      onDrop={(e) => {
        e.stopPropagation()
        onDrop(e, milestoneId, index)
      }}
      onDragEnd={onDragEnd}
    >
      {/* Drag handle */}
      <span
        className="flex cursor-grab items-center text-gray-300 hover:text-gray-500"
        aria-label="Drag to reorder"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="shrink-0"
        >
          <circle cx="5" cy="4" r="1.5" />
          <circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="11" cy="12" r="1.5" />
        </svg>
      </span>

      {/* Task name (editable) */}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleNameCommit}
            onKeyDown={handleKeyDown}
            className="w-full rounded border border-indigo-300 bg-transparent px-1 py-0.5 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-indigo-400"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditValue(task.name)
              setIsEditing(true)
            }}
            className="w-full truncate text-left text-sm text-gray-800 hover:text-indigo-600"
            title="Click to rename"
          >
            {task.name}
          </button>
        )}
      </div>

      {/* Priority chip (clickable to cycle) */}
      <PriorityChip
        variant={task.priority}
        onClick={() => onCyclePriority(task.id)}
        className="cursor-pointer select-none transition-transform hover:scale-105"
        role="button"
        aria-label={`Priority: ${task.priority}. Click to cycle.`}
      />

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="flex items-center text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
        aria-label={`Delete task: ${task.name}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="shrink-0"
        >
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="12" y1="4" x2="4" y2="12" />
        </svg>
      </button>
    </div>
  )
}

// --- Exported helpers for AnalysisStep to use ---

/**
 * Deletes a milestone and cascades the removal to all its tasks.
 * Call this from AnalysisStep when a milestone is deleted from the roadmap (Req 18.9).
 */
export function deleteMilestoneCascade(
  analysis: WizardAnalysis,
  milestoneId: string
): WizardAnalysis {
  const updatedMilestones = analysis.milestones.filter((m) => m.id !== milestoneId)
  const updatedTasks = analysis.tasks.filter((t) => t.milestoneId !== milestoneId)
  return { ...analysis, milestones: updatedMilestones, tasks: updatedTasks }
}
