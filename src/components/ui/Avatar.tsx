import type { HTMLAttributes } from 'react'
import { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
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

// Deterministic hue pairs used to build the two-color-stop gradient fallback.
// Kept as fixed HSL hue offsets so the same seed always maps to the same pair.
const GRADIENT_HUE_OFFSET = 40

/**
 * Deterministically hashes a string into a 32-bit unsigned integer.
 *
 * Same implementation shape as a standard string hash (djb2-like): pure and
 * stable across calls/renders/environments so the same seed always produces
 * the same hash.
 */
export function hashSeed(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0 // force 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Derives the two initials shown in the fallback avatar from a member's
 * display name.
 *
 * - Two or more words: first letter of the first and last word.
 * - One word: its first one or two letters.
 * - Empty/whitespace-only input: "?".
 */
export function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'

  const words = trimmed.split(/\s+/).filter(Boolean)

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  const first = words[0][0] ?? ''
  const last = words[words.length - 1][0] ?? ''
  return `${first}${last}`.toUpperCase()
}

/**
 * Derives a deterministic two-color-stop linear-gradient CSS value from a
 * seed string (a member's name or id). The same seed always produces the
 * same gradient, and different seeds are spread across the hue wheel via a
 * hash of the seed.
 */
export function getGradientForSeed(seed: string): string {
  const hash = hashSeed(seed)
  const hueA = hash % 360
  const hueB = (hueA + GRADIENT_HUE_OFFSET) % 360
  return `linear-gradient(135deg, hsl(${hueA}, 65%, 55%), hsl(${hueB}, 65%, 45%))`
}

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof avatarVariants> {
  /** Optional photo URL. When provided (and loads successfully), it is rendered instead of the fallback. */
  photoUrl?: string
  /** Name or unique id used to deterministically derive the initials/gradient fallback. */
  seed: string
  /** Accessible label; defaults to the seed string when omitted. */
  alt?: string
}

/**
 * Circular avatar with a photo, falling back to a deterministic
 * gradient-initials treatment derived from `seed` (name or id) when no photo
 * is provided or the photo fails to load.
 */
export function Avatar({ photoUrl, seed, alt, size, className, ...props }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(photoUrl) && !imageFailed
  const accessibleLabel = alt ?? seed

  return (
    <span
      className={cn(avatarVariants({ size }), className)}
      style={showImage ? undefined : { background: getGradientForSeed(seed) }}
      role="img"
      aria-label={accessibleLabel}
      {...props}
    >
      {showImage ? (
        <img
          src={photoUrl}
          alt={accessibleLabel}
          className="h-full w-full rounded-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="font-medium text-white">{getInitials(seed)}</span>
      )}
    </span>
  )
}

export { avatarVariants }
