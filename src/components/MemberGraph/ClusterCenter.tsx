import { useState } from 'react'
import { getInitials } from '../ui/Avatar'
import { cn } from '../../lib/utils'

/**
 * Default center-node diameter, in rem. Loosely mirrors the demo's
 * `CENTER_LOGO_SIZE + 10` (64px) sizing but expressed in rem per this repo's
 * `consistent-units` convention (64px / 16 = 4rem).
 */
const DEFAULT_SIZE_REM = '4rem'

export interface ClusterCenterProps {
  /** Project/unit/client name — used to derive the fallback initials shown when no `imageUrl` loads. */
  label: string
  /** Optional cluster/project image URL. Shown (cover-fit, circular) when provided and it loads successfully. */
  imageUrl?: string
  /**
   * Whether the cluster's underlying project/group has at least one active alert.
   * Takes precedence over `alertCount` when both are supplied.
   */
  hasAlert?: boolean
  /**
   * Active alert count for the cluster's underlying project/group. Used to derive
   * `hasAlert` (threshold predicate: alertCount >= 1) when `hasAlert` is not
   * explicitly provided — per Property 41, the glow is ON at exactly 1+ and OFF at 0.
   */
  alertCount?: number
  /** Diameter of the circular center node. Accepts a CSS length (rem recommended) or a bare number (treated as rem). Defaults to 4rem. */
  size?: number | string
  className?: string
}

/**
 * ClusterCenter — the center node of a Member_Graph cluster.
 *
 * Renders a circular badge showing the cluster's image (cover-fit, circular)
 * when `imageUrl` loads successfully, falling back to initials derived from
 * `label` otherwise. When the cluster has at least one active alert (per
 * `hasAlert` or `alertCount >= 1`), a pulsing red halo distinguishes it from
 * the non-alert state (Requirement 34.4 / Property 41).
 *
 * Matches the demo's `CenterCircle.tsx`: no persistent under-circle label —
 * the cluster's name is only ever surfaced via the tap-to-open `DetailPanel`
 * (Requirement 33.5). A permanent label here would sit outside the circular
 * ring geometry and collide with ring member bubbles at tight packing/zoom.
 */
export function ClusterCenter({
  label,
  imageUrl,
  hasAlert,
  alertCount,
  size = DEFAULT_SIZE_REM,
  className,
}: ClusterCenterProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(imageUrl) && !imageFailed
  const isAlerting = hasAlert ?? (alertCount ?? 0) >= 1
  const resolvedSize = typeof size === 'number' ? `${size}rem` : size

  return (
    <div className={cn('relative flex shrink-0 items-center justify-center', className)} style={{ width: resolvedSize, height: resolvedSize }}>
      {/* Alert halo — red glow emanating from the circle border, fading outward and
          pulsing, matching the demo's ProjectCluster.tsx alert indicator
          (Requirement 34.4 / Property 41: glow ON at 1+ active alerts, OFF at 0). */}
      {isAlerting && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full shadow-[0_0_0.875rem_0.375rem_rgba(220,38,38,0.6),0_0_2rem_0.875rem_rgba(220,38,38,0.3),0_0_3.5rem_1.5rem_rgba(220,38,38,0.12)]"
          style={{ animation: 'var(--animate-project-alert-halo-pulse)' }}
        />
      )}

      <div
        className="relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-white text-sm font-extrabold tracking-wide text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
        aria-hidden={showImage ? undefined : true}
      >
        {showImage ? (
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            className="h-full w-full rounded-full object-cover object-center"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span>{getInitials(label)}</span>
        )}
      </div>
    </div>
  )
}
