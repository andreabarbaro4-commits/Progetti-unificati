import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  // Base classes matching .ruolo-tag: border pill, clickable, smooth transitions
  'inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-sm transition-colors',
  {
    variants: {
      variant: {
        default: 'border-black bg-transparent text-black',
        active: 'border-indigo-600 bg-indigo-600 text-white',
      },
      size: {
        default: 'px-3 py-1.5 text-sm',
        sm: 'px-2 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Pill-shaped badge/tag with cva-driven variants.
 *
 * Extracted from the `.ruolo-tag` CSS pattern used in RoleTagList and PhotoUploadStep.
 * Consumer can override any class via `className` — tailwind-merge ensures
 * consumer classes win on conflict.
 */
export function Badge({ variant, size, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  )
}

export { badgeVariants }
