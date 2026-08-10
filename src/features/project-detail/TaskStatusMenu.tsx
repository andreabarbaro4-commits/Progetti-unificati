import { useEffect, useRef, useState } from 'react'
import { StatusChip } from '../../components/ui/StatusChip'
import type { TaskStatus } from '../../mock/fixtures/types'

const STATUSES: TaskStatus[] = ['unassigned', 'in_progress', 'completed', 'blocked']

export interface TaskStatusMenuProps {
  /** The task's current status (used for visual indication of the active option). */
  currentStatus: TaskStatus
  /** Called with the selected status when the user picks an option. Closes the menu. */
  onSelect: (status: TaskStatus) => void
  /** Called when the menu should close without a selection (e.g. click outside, Escape). */
  onClose: () => void
}

/**
 * A dropdown menu showing the 4 task status options. On selection it calls
 * `onSelect` with the chosen status and closes. Uses `StatusChip` as visual
 * indicators for each option.
 *
 * Validates: Requirements 23.6, 23.7
 */
export function TaskStatusMenu({ currentStatus, onSelect, onClose }: TaskStatusMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Task status options"
      className="absolute z-50 mt-1 flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
    >
      {STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          role="menuitem"
          aria-current={status === currentStatus ? 'true' : undefined}
          className="flex w-full cursor-pointer items-center rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-100"
          onClick={() => onSelect(status)}
        >
          <StatusChip variant={status} />
          {status === currentStatus && (
            <span className="ml-auto text-xs text-gray-400">●</span>
          )}
        </button>
      ))}
    </div>
  )
}

/**
 * A convenience wrapper that manages the open/close state for the TaskStatusMenu,
 * rendering the trigger (a clickable StatusChip) and the menu overlay together.
 */
export interface TaskStatusMenuTriggerProps {
  /** The task's current status. */
  status: TaskStatus
  /** Called with the new status when the user selects an option from the menu. */
  onStatusChange: (status: TaskStatus) => void
}

export function TaskStatusMenuTrigger({ status, onStatusChange }: TaskStatusMenuTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleSelect(newStatus: TaskStatus) {
    onStatusChange(newStatus)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer"
      >
        <StatusChip variant={status} />
      </button>

      {isOpen && (
        <TaskStatusMenu
          currentStatus={status}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
