import type { HTMLAttributes } from 'react'
import { FaCrown } from 'react-icons/fa'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Avatar, avatarVariants } from './Avatar'

/**
 * Default cap on visible avatars before an overflow "+N" chip is shown.
 * Callers override this via the `max` prop — e.g. Project_Card uses the
 * owner + up to 4 additional members (Requirement 14.3/14.4), while the
 * Project Detail Overview tab caps the whole stack (owner included) at 5
 * (Requirement 22.1).
 */
const DEFAULT_MAX_VISIBLE = 4

/** Minimal member shape `AvatarStack` needs; a `TeamMember` satisfies this. */
export interface AvatarStackMember {
  id: string
  name: string
  photoUrl?: string
}

const overflowChipVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-200 font-medium text-gray-600',
  {
    variants: {
      size: {
        sm: 'h-6 w-6 text-[0.625rem]',
        md: 'h-10 w-10 text-sm',
        lg: 'h-14 w-14 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface AvatarStackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof avatarVariants> {
  /** Members to render, in display order. */
  members: AvatarStackMember[]
  /** Id of the member distinguished as the project owner (crown badge), if any. */
  ownerId?: string
  /**
   * Maximum number of avatars visible before an overflow "+N" chip is shown.
   * Defaults to 4 (Project_Card's "owner + up to 4 others" cap). Pass 5 for
   * contexts that cap the whole stack, owner included (e.g. Overview tab).
   */
  max?: number
}

/**
 * Horizontally overlapping row of member avatars with an owner-distinguishing
 * badge and an overflow-count chip once `members.length` exceeds `max`.
 *
 * Rendering order: the owner (if present in `members`) is always shown first,
 * followed by the remaining members up to `max` total avatars. Any members
 * beyond that cap are summarized by a trailing "+N" chip showing the exact
 * count of members not shown (Requirements 14.3, 14.4).
 */
export function AvatarStack({
  members,
  ownerId,
  max = DEFAULT_MAX_VISIBLE,
  size,
  className,
  ...props
}: AvatarStackProps) {
  const owner = ownerId ? members.find((member) => member.id === ownerId) : undefined
  const others = owner ? members.filter((member) => member.id !== ownerId) : members
  const ordered = owner ? [owner, ...others] : others

  const visible = ordered.slice(0, max)
  const overflowCount = ordered.length - visible.length

  return (
    <div className={cn('flex items-center', className)} {...props}>
      {visible.map((member, index) => (
        <div
          key={member.id}
          className={cn('relative', index > 0 && '-ml-2.5')}
          style={{ zIndex: visible.length - index }}
        >
          <Avatar
            photoUrl={member.photoUrl}
            seed={member.id || member.name}
            alt={member.name}
            size={size}
            className="border-2 border-white"
          />
          {member.id === ownerId && (
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-amber-400 text-white"
              title="Project owner"
              aria-label="Project owner"
            >
              <FaCrown className="h-2 w-2" aria-hidden="true" />
            </span>
          )}
        </div>
      ))}
      {overflowCount > 0 && (
        <div className={cn('relative', visible.length > 0 && '-ml-2.5')} style={{ zIndex: 0 }}>
          <span
            className={cn(overflowChipVariants({ size }))}
            title={`${overflowCount} more member${overflowCount === 1 ? '' : 's'}`}
            aria-label={`${overflowCount} more member${overflowCount === 1 ? '' : 's'}`}
          >
            +{overflowCount}
          </span>
        </div>
      )}
    </div>
  )
}
