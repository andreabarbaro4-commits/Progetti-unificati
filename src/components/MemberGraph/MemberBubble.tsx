import { memo } from 'react'
import type React from 'react'
import { cva } from 'class-variance-authority'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../lib/utils'
import type { TeamMember } from '../../mock/fixtures/types'

/** Bubble diameter (Demo's 38px, converted to rem per `consistent-units`: 38 / 16 = 2.375rem). */
const BUBBLE_SIZE = '2.375rem'

/** Workload threshold at/above which a member is considered overloaded (Requirement 34.3 / Property 40). */
const OVERLOAD_THRESHOLD = 85

/**
 * Opacity/saturation treatment for the (selected, suggested) pair.
 *
 * A **total function** over every combination (Property 28):
 * - `selected` (regardless of `suggested`) -> `full`: 100% opacity, 100% saturation.
 * - `!selected && suggested` -> `suggestedDimmed`: <=60% opacity (50%), <=50% saturation (50%).
 * - `!selected && !suggested` -> `full` (same as selected — distinguished only by not
 *   being selected, not by opacity/saturation) UNLESS `manuallyDimmed` is set, in which
 *   case it drops to `manualDimmed` (used outside any selection context, e.g. plain
 *   Cluster_Graph browsing via the `dimmed` prop).
 */
const memberBubbleVisualVariants = cva('transition-[opacity,filter] duration-150 ease-out', {
  variants: {
    visualState: {
      full: 'opacity-100 saturate-100',
      suggestedDimmed: 'opacity-50 saturate-50',
      manualDimmed: 'opacity-30 saturate-100',
    },
  },
  defaultVariants: {
    visualState: 'full',
  },
})

export interface MemberBubbleProps {
  /** The member this bubble represents. */
  member: TeamMember
  /** Absolute horizontal center position, in px (physics-engine coordinate space). */
  x: number
  /** Absolute vertical center position, in px (physics-engine coordinate space). */
  y: number
  /** Highlights the bubble belonging to the signed-in user with a persistent outline. */
  isCurrentUser?: boolean
  /** Whether the pointer is currently hovering this bubble. */
  isHovered?: boolean
  /** Whether another bubble representing the same person (e.g. across clusters) is hovered. */
  isSamePersonHighlight?: boolean
  /**
   * Whether this bubble is currently selected in a selection context (e.g.
   * Team_Selection_Step). Selected always renders at full opacity/saturation
   * regardless of `suggested` — see `memberBubbleVisualVariants`.
   */
  selected?: boolean
  /**
   * Whether this member is AI-suggested for the current selection context.
   * Only visually dims the bubble when `selected` is not `true`.
   */
  suggested?: boolean
  /**
   * Manual dim flag for use outside a selection context (`selected`/`suggested`
   * both `undefined`), e.g. plain Cluster_Graph browsing where a search filter
   * greys out non-matching members.
   */
  dimmed?: boolean
  onPointerDown?: (e: React.PointerEvent) => void
  onHoverEnter?: () => void
  onHoverLeave?: () => void
  className?: string
}

/**
 * MemberBubble — a single team member's circular representation within a
 * `MemberGraph`/`Cluster_Graph`.
 *
 * Rebuilt from Demo's `TeamPage/MemberBubble.tsx` using this repo's `Avatar`
 * (photo | deterministic gradient-initials fallback) and Tailwind utility
 * classes instead of an inline `boxShadow` string:
 * - Overload ring: `ring-2 ring-red-500`, derived from `member.workload >= 85`
 *   (Requirement 34.3 / Property 40) rather than accepted as an external flag,
 *   so the threshold predicate lives in one place.
 * - Current-user indicator: a persistent `outline` (a distinct CSS box model
 *   layer from `ring`'s box-shadow, so it composes cleanly with the overload
 *   ring without any class conflict).
 * - Hover / same-person-highlight: a `drop-shadow` glow plus a slight scale-up,
 *   layered on top of (not replacing) the current-user/overload treatment —
 *   a deliberate simplification of Demo's mutually-exclusive box-shadow stack,
 *   since `filter: drop-shadow` and `box-shadow`(`ring`)/`outline` are
 *   independent CSS properties and can stack.
 * - Selected / AI-suggested: `memberBubbleVisualVariants` (see above) — the
 *   total function over `(selected, suggested)` required by Property 28.
 */
export const MemberBubble = memo(function MemberBubble({
  member,
  x,
  y,
  isCurrentUser = false,
  isHovered = false,
  isSamePersonHighlight = false,
  selected,
  suggested,
  dimmed = false,
  onPointerDown,
  onHoverEnter,
  onHoverLeave,
  className,
}: MemberBubbleProps) {
  const isOverloaded = member.workload >= OVERLOAD_THRESHOLD

  const inSelectionContext = selected !== undefined || suggested !== undefined
  const isUnselectedSuggestion = inSelectionContext && suggested === true && selected !== true
  const visualState = isUnselectedSuggestion
    ? 'suggestedDimmed'
    : !inSelectionContext && dimmed
      ? 'manualDimmed'
      : 'full'

  const isHighlighted = isHovered || isSamePersonHighlight

  return (
    <div
      className={cn(
        memberBubbleVisualVariants({ visualState }),
        'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full',
        isCurrentUser && 'outline outline-2 outline-offset-1 outline-indigo-500',
        isOverloaded && 'ring-2 ring-offset-1 ring-red-500',
        isHighlighted && 'z-10 scale-110 drop-shadow-[0_0_0.5rem_rgba(124,108,201,0.7)]',
        !isHighlighted && 'z-0',
        className
      )}
      style={{
        left: x,
        top: y,
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
      }}
      onPointerDown={onPointerDown}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      <Avatar
        photoUrl={member.photoUrl}
        seed={`${member.name} ${member.surname}`.trim() || member.id}
        alt={`${member.name} ${member.surname}`}
        className="h-full w-full"
      />
    </div>
  )
})

export { memberBubbleVisualVariants, OVERLOAD_THRESHOLD }
