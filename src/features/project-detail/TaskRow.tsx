import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { StatusChip } from '../../components/ui/StatusChip'
import { PriorityChip } from '../../components/ui/StatusChip'
import { Avatar } from '../../components/ui/Avatar'
import type { Task, TeamMember } from '../../mock/fixtures/types'

export interface TaskRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  task: Task
  /** Resolved team members for the task's assignees. */
  members: TeamMember[]
}

/**
 * A single task row displaying:
 * - Task name
 * - StatusChip for the task's current status
 * - PriorityChip for the task's priority level
 * - Avatar(s) for each resolved assignee
 * - An unassigned indicator when no assignees exist
 *
 * Validates: Requirements 23.4, 23.5
 */
export function TaskRow({ task, members, className, ...props }: TaskRowProps) {
  // Collect assignee IDs from the task
  const assigneeIds: string[] = []
  if (task.assignedTo) assigneeIds.push(task.assignedTo)
  if (task.assignedTo2) assigneeIds.push(task.assignedTo2)

  // Resolve assignee IDs to TeamMember objects
  const assignees = assigneeIds
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is TeamMember => m !== undefined)

  const hasAssignees = assignees.length > 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2',
        className
      )}
      {...props}
    >
      {/* Task name */}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
        {task.name}
      </span>

      {/* Status chip */}
      <StatusChip variant={task.status} />

      {/* Priority chip */}
      <PriorityChip variant={task.priority} />

      {/* Assignee avatars or unassigned indicator */}
      <div className="flex shrink-0 items-center gap-1">
        {hasAssignees ? (
          assignees.map((member) => (
            <Avatar
              key={member.id}
              seed={`${member.name} ${member.surname}`}
              photoUrl={member.photoUrl}
              size="sm"
              alt={`${member.name} ${member.surname}`}
            />
          ))
        ) : (
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-[0.5rem] text-gray-400"
            aria-label="Unassigned"
          >
            ?
          </span>
        )}
      </div>
    </div>
  )
}
