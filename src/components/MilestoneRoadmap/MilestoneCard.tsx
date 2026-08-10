import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import type { Milestone } from '../../mock/fixtures/types'
import type { MilestoneState } from './milestoneState'

/** Fixed card width so cards line up predictably in the horizontally-scrolling roadmap row. */
const CARD_WIDTH = '10rem'

/** Maximum length for a milestone name, per Requirement 18.8 (rename must be non-empty, <=100 chars). */
const MAX_NAME_LENGTH = 100

/** State-indicator dot color per classified state (Requirement 23.1). */
const STATE_DOT_CLASSES: Record<MilestoneState, string> = {
  completed: 'bg-green-500',
  current: 'bg-blue-500',
  late: 'bg-red-500',
  future: 'bg-gray-400',
}

/** State-indicator border color per classified state, applied when no explicit selection border wins. */
const STATE_BORDER_CLASSES: Record<MilestoneState, string> = {
  completed: 'border-green-300',
  current: 'border-blue-300',
  late: 'border-red-300',
  future: 'border-gray-200',
}

const milestoneCardVariants = cva(
  'relative flex flex-col gap-1 rounded-2xl border bg-white p-3 text-left shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-300',
  {
    variants: {
      selected: {
        true: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200',
        false: '',
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
)

export interface MilestoneCardProps {
  /** The milestone this card represents. */
  milestone: Milestone
  /** Whether this card is currently the selected milestone. */
  selected?: boolean
  /**
   * Classified state (completed/current/late/future) driving the card's
   * border/dot color. When omitted, no state-indicator coloring is applied
   * beyond the card just "existing" (per the Wizard step 2 use case, where
   * analysis milestones don't have a completed/late notion yet).
   */
  state?: MilestoneState
  /**
   * Reports that this card was clicked. The parent (`MilestoneRoadmap`) owns
   * the actual select/deselect toggle logic — this component only reports
   * the click.
   */
  onSelect?: () => void
  /** Whether the milestone's name is inline-editable (Wizard step 2 use case). */
  editable?: boolean
  /** Called with the trimmed, non-empty new name when an inline edit is committed. */
  onNameChange?: (newName: string) => void
  className?: string
}

/**
 * MilestoneCard — a single card in the `MilestoneRoadmap`'s horizontally
 * scrollable row, showing a milestone's name, date, and (when `state` is
 * provided) a state-indicator dot/border for completed/current/late/future.
 */
export function MilestoneCard({
  milestone,
  selected = false,
  state,
  onSelect,
  editable = false,
  onNameChange,
  className,
}: MilestoneCardProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [draftName, setDraftName] = useState(milestone.name)

  function beginEditing() {
    setDraftName(milestone.name)
    setIsEditingName(true)
  }

  function commitEdit() {
    const trimmed = draftName.trim()
    // Reject empty renames (Requirement 18.8) by silently reverting to the
    // previous name rather than committing a blank value.
    if (trimmed && onNameChange) {
      onNameChange(trimmed.slice(0, MAX_NAME_LENGTH))
    }
    setIsEditingName(false)
  }

  function cancelEdit() {
    setDraftName(milestone.name)
    setIsEditingName(false)
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitEdit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelEdit()
    }
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={handleCardKeyDown}
      className={cn(
        milestoneCardVariants({ selected }),
        !selected && (state ? STATE_BORDER_CLASSES[state] : 'border-gray-200'),
        className
      )}
      style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH }}
    >
      {state && (
        <span
          className={cn('absolute right-2 top-2 h-2 w-2 rounded-full', STATE_DOT_CLASSES[state])}
          aria-hidden="true"
        />
      )}

      {editable && isEditingName ? (
        <input
          autoFocus
          value={draftName}
          maxLength={MAX_NAME_LENGTH}
          onChange={(event) => setDraftName(event.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleInputKeyDown}
          onClick={(event) => event.stopPropagation()}
          className="w-full rounded border border-gray-300 px-1 py-0.5 text-sm font-medium text-gray-900 outline-none focus:border-indigo-400"
        />
      ) : (
        <span
          className={cn('truncate pr-3 text-sm font-medium text-gray-900', editable && 'cursor-text')}
          onClick={
            editable
              ? (event) => {
                  event.stopPropagation()
                  beginEditing()
                }
              : undefined
          }
        >
          {milestone.name}
        </span>
      )}

      <span className="text-xs text-gray-500">{formatMilestoneDate(milestone.date)}</span>
    </div>
  )
}

function formatMilestoneDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
