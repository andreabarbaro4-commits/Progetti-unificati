// Floating detail card for a Member_Bubble, rendered once in an overlay above
// the whole canvas rather than anchored per-node — this keeps it from
// colliding with neighboring bubbles/clusters on a crowded graph. Positions
// itself to whichever side of the node has more room, then clamps fully
// inside the container.
//
// Ported from ../demo/src/components/forceGraph/HoverCard.tsx, restyled with
// this repo's `Card` component instead of an inline white/box-shadow div.
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Card } from '../ui/Card'
import { cn } from '../../lib/utils'

export interface HoverCardProps {
  /** Node center x, in the same coordinate space as `containerW` (viewport-space). */
  x: number
  /** Node center y, in the same coordinate space as `containerH` (viewport-space). */
  y: number
  /** Radius of the node being described, used to compute the gap between node edge and card. */
  nodeRadius: number
  containerW: number
  containerH: number
  width?: number
  children: ReactNode
  className?: string
}

export function HoverCard({
  x,
  y,
  nodeRadius,
  containerW,
  containerH,
  width = 240,
  children,
  className,
}: HoverCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: x, top: y })

  useLayoutEffect(() => {
    const gap = nodeRadius + 14
    const pad = 8
    const h = ref.current?.offsetHeight ?? 160

    // Prefer the side of the node with more open space.
    const spaceRight = containerW - x
    let left = spaceRight > x ? x + gap : x - gap - width
    left = Math.max(pad, Math.min(containerW - width - pad, left))

    // Centre vertically on the node, clamped to the canvas.
    let top = y - h / 2
    top = Math.max(pad, Math.min(containerH - h - pad, top))

    setPos({ left, top })
  }, [x, y, nodeRadius, containerW, containerH, width, children])

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-50 animate-[fade-in_150ms_ease-out]"
      style={{ left: pos.left, top: pos.top, width }}
    >
      <Card size="sm" className={cn('w-full max-w-none items-stretch gap-2 text-left', className)}>
        {children}
      </Card>
    </div>
  )
}
