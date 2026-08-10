import { useMemo } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import type { Task, TeamMember } from '../../mock/fixtures/types'

export interface AssignDialogProps {
  /** Controls whether the dialog is visible. */
  open: boolean
  /** Called when the dialog is dismissed (cancel or backdrop/Escape). */
  onClose: () => void
  /** The task being assigned. */
  task: Task
  /** All project members available for assignment. */
  members: TeamMember[]
  /** All tasks in the project (used to compute the suggestion). */
  allTasks: Task[]
  /** Called when the user confirms assignment of a member. */
  onConfirm: (memberId: string) => void
}

/**
 * Computes the "suggested" member(s) — those with the fewest in-progress or
 * blocked tasks within the given task set. Returns the member IDs with the
 * minimum active-task count.
 *
 * Property 37: Assignment-dialog suggestion is the argmin of active task count.
 * Validates: Requirements 23.8
 */
export function computeSuggestedMembers(
  members: TeamMember[],
  tasks: Task[],
): string[] {
  if (members.length === 0) return []

  // Count in_progress + blocked tasks per member
  const countByMember = new Map<string, number>()
  for (const member of members) {
    countByMember.set(member.id, 0)
  }

  for (const task of tasks) {
    if (task.status === 'in_progress' || task.status === 'blocked') {
      if (task.assignedTo && countByMember.has(task.assignedTo)) {
        countByMember.set(task.assignedTo, countByMember.get(task.assignedTo)! + 1)
      }
      if (task.assignedTo2 && countByMember.has(task.assignedTo2)) {
        countByMember.set(task.assignedTo2, countByMember.get(task.assignedTo2)! + 1)
      }
    }
  }

  // Find the minimum count
  let minCount = Infinity
  for (const count of countByMember.values()) {
    if (count < minCount) minCount = count
  }

  // Collect all member IDs with that minimum count
  const suggested: string[] = []
  for (const [memberId, count] of countByMember.entries()) {
    if (count === minCount) suggested.push(memberId)
  }

  return suggested
}

/**
 * A dialog for assigning a team member to a task. Suggests the member with
 * the fewest in-progress/blocked tasks (argmin). On confirm: sets the
 * assignee and transitions the task status from unassigned → in_progress.
 *
 * Property 37: Assignment-dialog suggestion is the argmin of active task count.
 * Property 38: Task assignment transitions status only from `unassigned`.
 * Validates: Requirements 23.8, 23.9
 */
export function AssignDialog({
  open,
  onClose,
  task,
  members,
  allTasks,
  onConfirm,
}: AssignDialogProps) {
  const suggestedIds = useMemo(
    () => computeSuggestedMembers(members, allTasks),
    [members, allTasks],
  )

  function handleAssign(memberId: string) {
    onConfirm(memberId)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="md" ariaLabel="Assign team member">
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        Assign Member
      </h2>

      <p className="mb-4 text-sm text-gray-600">
        Select a team member to assign to{' '}
        <span className="font-medium text-gray-900">{task.name}</span>.
      </p>

      {members.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-500">
          No team members available.
        </p>
      ) : (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto" role="listbox">
          {members.map((member) => {
            const isSuggested = suggestedIds.includes(member.id)

            return (
              <li
                key={member.id}
                role="option"
                aria-selected={false}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleAssign(member.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleAssign(member.id)
                  }
                }}
                tabIndex={0}
              >
                <Avatar
                  seed={`${member.name} ${member.surname}`}
                  photoUrl={member.photoUrl}
                  size="md"
                  alt={`${member.name} ${member.surname}`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-gray-900">
                      {member.name} {member.surname}
                    </span>
                    {isSuggested && (
                      <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[0.625rem] font-semibold text-green-700">
                        Suggested
                      </span>
                    )}
                  </div>
                  <span className="truncate text-xs text-gray-500">
                    {member.role}
                  </span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAssign(member.id)
                  }}
                >
                  Assign
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  )
}
