import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import type { TaskStatus, TaskPriority } from '../../mock/fixtures/types'

const statusChipVariants = cva(
  // Small pill chip matching Badge's rounded-lg pattern, sized down for inline task-row use
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        unassigned: 'border-gray-300 bg-gray-100 text-gray-600',
        in_progress: 'border-blue-300 bg-blue-100 text-blue-700',
        completed: 'border-green-300 bg-green-100 text-green-700',
        blocked: 'border-red-300 bg-red-100 text-red-700',
      },
    },
    defaultVariants: {
      variant: 'unassigned',
    },
  }
)

const STATUS_LABELS: Record<TaskStatus, string> = {
  unassigned: 'Unassigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
}

export interface StatusChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof statusChipVariants> {
  variant: TaskStatus
  /** Override the default status label without replacing the whole chip content. */
  label?: string
  children?: ReactNode
}

/**
 * Pill-shaped chip for a task's `TaskStatus`, driven by `cva` variants instead of
 * an inline-style lookup table (superseding Demo's `STATO_CONFIG` pattern).
 */
export function StatusChip({ variant, label, children, className, ...props }: StatusChipProps) {
  return (
    <span className={cn(statusChipVariants({ variant }), className)} {...props}>
      {children ?? label ?? STATUS_LABELS[variant]}
    </span>
  )
}

export { statusChipVariants }

const priorityChipVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        high: 'border-red-300 bg-red-100 text-red-700',
        medium: 'border-amber-300 bg-amber-100 text-amber-700',
        low: 'border-gray-300 bg-gray-100 text-gray-600',
      },
    },
    defaultVariants: {
      variant: 'low',
    },
  }
)

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export interface PriorityChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof priorityChipVariants> {
  variant: TaskPriority
  /** Override the default priority label without replacing the whole chip content. */
  label?: string
  children?: ReactNode
}

/**
 * Pill-shaped chip for a task's `TaskPriority`, driven by `cva` variants. Also used
 * as the basis for the wizard task list's priority-cycling control (high → medium → low → high).
 */
export function PriorityChip({ variant, label, children, className, ...props }: PriorityChipProps) {
  return (
    <span className={cn(priorityChipVariants({ variant }), className)} {...props}>
      {children ?? label ?? PRIORITY_LABELS[variant]}
    </span>
  )
}

export { priorityChipVariants }
