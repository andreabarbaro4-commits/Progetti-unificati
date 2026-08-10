import type React from 'react'
import { cn } from '../../lib/utils'
import type { Milestone } from '../../mock/fixtures/types'
import { MilestoneCard } from './MilestoneCard'
import { classify } from './milestoneState'

/** Upper bound on the number of milestones a roadmap may hold (Requirement 18.3/18.4, Property 22). */
export const MAX_MILESTONES = 20

export interface MilestoneRoadmapProps {
  /** Milestones to render, in display order. */
  milestones: Milestone[]
  /** The currently selected milestone's id, or `null`/`undefined` when none is selected. */
  selectedId?: string | null
  /**
   * Called with the newly selected milestone's id, or `null` when the
   * already-selected card is clicked again (click-to-select,
   * click-selected-again-to-deselect — Requirements 18.5, 18.6, 23.2, 23.3).
   */
  onSelect?: (id: string | null) => void
  /**
   * Called when the trailing "+" add-milestone affordance is activated
   * while enabled. Omit (or pass nothing) to suppress the add affordance
   * entirely, independent of the `readOnly` flag.
   */
  onAdd?: () => void
  /** Called to reorder a milestone from one index to another (drag-and-drop, optional). */
  onReorder?: (fromIndex: number, toIndex: number) => void
  /** Called with a milestone's id and its committed new (non-empty, trimmed) name. */
  onRenameMilestone?: (id: string, newName: string) => void
  /** Whether milestone names are inline-editable (Wizard step 2 use case). */
  editable?: boolean
  /**
   * When `true`, hides the add-milestone affordance regardless of `onAdd`
   * (e.g. Project_Detail's Milestones & Tasks tab may still want add/edit
   * behavior routed through its own area-local dialogs instead of this
   * affordance — set `readOnly` to suppress this component's own control
   * in that case).
   */
  readOnly?: boolean
  /**
   * Whether each card's `state` (completed/current/late/future, via
   * `classify`) is computed and passed down. Defaults to `true` (full
   * classification mode, e.g. Project_Detail). Wizard step 2 passes
   * `false` since analysis milestones have no completed/late notion yet.
   */
  showStateIndicator?: boolean
  className?: string
}

/**
 * MilestoneRoadmap — the shared horizontally-scrollable milestone timeline,
 * reused by the Project Wizard's step 2 (Requirements 18.3-18.6) and
 * Project_Detail's Milestones & Tasks tab (Requirements 23.2, 23.3).
 *
 * Renders each milestone as a `MilestoneCard` in a `flex` row with
 * `overflow-x-auto`, plus a connecting track line behind the cards (a
 * `relative` container with a `before:` pseudo-element horizontal line,
 * `z-0`, so the cards — `z-10` — render in front of it) and a trailing
 * "+" add-milestone affordance, disabled once `MAX_MILESTONES` (20) exist.
 *
 * Owns the click-to-select / click-selected-again-to-deselect toggle logic
 * itself: `MilestoneCard` only reports "I was clicked" via its `onSelect`
 * callback, and this component decides whether that resolves to a new
 * selection or a deselection.
 */
export function MilestoneRoadmap({
  milestones,
  selectedId,
  onSelect,
  onAdd,
  onReorder,
  onRenameMilestone,
  editable = false,
  readOnly = false,
  showStateIndicator = true,
  className,
}: MilestoneRoadmapProps) {
  const today = new Date()
  const isAtCap = milestones.length >= MAX_MILESTONES
  const showAddAffordance = !readOnly && Boolean(onAdd)

  function handleCardSelect(milestoneId: string) {
    if (!onSelect) return
    onSelect(selectedId === milestoneId ? null : milestoneId)
  }

  function handleDragStart(event: React.DragEvent, fromIndex: number) {
    if (!onReorder) return
    event.dataTransfer.setData('text/plain', String(fromIndex))
    event.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(event: React.DragEvent) {
    if (!onReorder) return
    event.preventDefault()
  }

  function handleDrop(event: React.DragEvent, toIndex: number) {
    if (!onReorder) return
    event.preventDefault()
    const raw = event.dataTransfer.getData('text/plain')
    const fromIndex = Number.parseInt(raw, 10)
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) return
    onReorder(fromIndex, toIndex)
  }

  if (milestones.length === 0) {
    return (
      <div className={cn('flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 p-6', className)}>
        <p className="text-sm text-gray-500">No milestones yet.</p>
        {showAddAffordance && (
          <AddMilestoneAffordance disabled={isAtCap} onAdd={onAdd} inline />
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'relative flex items-start gap-4 overflow-x-auto py-2',
          'before:absolute before:left-0 before:top-[2.75rem] before:z-0 before:h-px before:w-full before:bg-gray-300'
        )}
      >
        {milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            className="relative z-10"
            draggable={Boolean(onReorder)}
            onDragStart={(event) => handleDragStart(event, index)}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, index)}
          >
            <MilestoneCard
              milestone={milestone}
              selected={selectedId === milestone.id}
              state={showStateIndicator ? classify(milestone, today) : undefined}
              onSelect={() => handleCardSelect(milestone.id)}
              editable={editable}
              onNameChange={
                onRenameMilestone ? (newName) => onRenameMilestone(milestone.id, newName) : undefined
              }
            />
          </div>
        ))}

        {showAddAffordance && (
          <div className="relative z-10">
            <AddMilestoneAffordance disabled={isAtCap} onAdd={onAdd} />
          </div>
        )}
      </div>
    </div>
  )
}

interface AddMilestoneAffordanceProps {
  disabled: boolean
  onAdd?: () => void
  /** Renders as a standalone pill rather than a roadmap-row card (used in the empty state). */
  inline?: boolean
}

function AddMilestoneAffordance({ disabled, onAdd, inline = false }: AddMilestoneAffordanceProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      aria-label="Add milestone"
      onClick={disabled ? undefined : onAdd}
      className={cn(
        'flex items-center justify-center rounded-2xl border border-dashed text-2xl font-light transition-colors',
        inline ? 'h-12 w-12' : 'h-[4.75rem] w-[10rem]',
        disabled
          ? 'cursor-not-allowed border-gray-200 text-gray-300'
          : 'cursor-pointer border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500'
      )}
    >
      +
    </button>
  )
}
