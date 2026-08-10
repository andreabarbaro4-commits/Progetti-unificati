import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Card } from '../ui/Card'
import { cn } from '../../lib/utils'

/**
 * DetailPanel — the single "one open panel at a time" popover for Member_Graph
 * (member detail OR cluster tooltip), per Requirements 33.4, 33.6, 33.7, 24.4
 * / Property 56.
 *
 * ARCHITECTURE NOTE (read before wiring this into `MemberGraph.tsx`):
 * This component is intentionally "dumb" about the single-open-panel
 * invariant — it does not track which member/cluster is active, and nothing
 * here prevents a second instance of itself from being mounted. "At most one
 * open" and "replace-on-new-activation" (Property 56, Req 33.6/33.7) are
 * satisfied structurally by the PARENT (`MemberGraph.tsx`) holding exactly
 * one piece of state, e.g.:
 *
 *   const [activeDetail, setActiveDetail] = useState<
 *     { type: 'member' | 'cluster'; id: string; anchorRect: DOMRect } | null
 *   >(null)
 *
 * ...and rendering **at most one** `<DetailPanel>` derived from that single
 * value. Every new activation (a bubble or cluster-center tap) must call
 * `setActiveDetail(newValue)`, which *replaces* the previous value wholesale
 * (never appended to a list/array), and dismissal (this component's
 * `onDismiss`, or any other "activate a control outside it" case per Req
 * 33.6) must call `setActiveDetail(null)`. As long as the parent never
 * renders more than one `<DetailPanel>` and always assigns `activeDetail`
 * instead of accumulating multiple open panels, both properties hold by
 * construction — do not introduce a second `<DetailPanel>` instance or an
 * array of open panels in `MemberGraph.tsx`.
 */

/**
 * Gap (px) kept between the anchor and the panel. `DOMRect` measurements
 * (from `getBoundingClientRect`) are inherently pixel-based, so this stays
 * in px rather than rem — this file's positioning math operates directly on
 * raw viewport/anchor pixel coordinates, not Tailwind utility classes.
 */
const ANCHOR_GAP_PX = 8

export interface PopoverPosition {
  top: number
  left: number
}

/**
 * Pure, side-effect-free helper that computes a popover's `position: fixed`
 * top/left given the `DOMRect` it should be anchored to, its own measured
 * size, and the viewport size.
 *
 * Default placement is centered above the anchor. If that would overflow
 * the top of the viewport, it flips to below the anchor instead. The result
 * is then clamped so the panel never renders outside the vertical or
 * horizontal viewport bounds.
 *
 * Kept separate from the component (no React/DOM dependency beyond the
 * `DOMRect` shape of its inputs) so it can be unit/property tested directly
 * without mounting React or touching the real DOM.
 */
export function computePopoverPosition(
  anchorRect: DOMRect,
  panelWidth: number,
  panelHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  gap: number = ANCHOR_GAP_PX,
): PopoverPosition {
  let top = anchorRect.top - panelHeight - gap
  let left = anchorRect.left + anchorRect.width / 2 - panelWidth / 2

  // Flip below the anchor if placing above would overflow the top edge.
  if (top < 0) {
    top = anchorRect.bottom + gap
  }

  // Clamp vertically: if flipping below still overflows the bottom (or the
  // panel is simply taller than the viewport), pin it within bounds.
  if (top + panelHeight > viewportHeight) {
    top = Math.max(0, viewportHeight - panelHeight)
  }
  if (top < 0) {
    top = 0
  }

  // Clamp horizontally to the viewport.
  if (left < 0) {
    left = 0
  }
  if (left + panelWidth > viewportWidth) {
    left = Math.max(0, viewportWidth - panelWidth)
  }

  return { top, left }
}

export interface DetailPanelProps {
  /** Whether the panel should be rendered/visible at all. */
  open: boolean
  /** The rect of the bubble/cluster-center this panel is anchored to. `null` while nothing is active. */
  anchorRect: DOMRect | null
  /** Panel heading — member name, or cluster/group name. */
  title: string
  /** Panel body content — member role/workload, or cluster's project summary. */
  body?: ReactNode
  /** Invoked when the user dismisses the panel via its close control or a click outside it. */
  onDismiss: () => void
  className?: string
}

/**
 * DetailPanel — shows either a member's detail or a cluster's tooltip,
 * anchored near the element that was activated.
 *
 * Non-modal by design: no backdrop, no focus trap. Dismissal is
 * click-outside, the visible dismiss control, or being replaced by a new
 * activation (Req 33.6/33.7) — see the architecture note above for how "at
 * most one open, always the latest" is guaranteed at the parent level.
 *
 * Renders nothing when `open` is false or `anchorRect` is `null`.
 */
export function DetailPanel({
  open,
  anchorRect,
  title,
  body,
  onDismiss,
  className,
}: DetailPanelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<PopoverPosition | null>(null)

  // Measure the panel's own (already-rendered-but-hidden) size once it's in
  // the DOM and compute its anchored position. Re-runs whenever the anchor
  // or content changes, since either can change the panel's required
  // size/position.
  useLayoutEffect(() => {
    if (!open || !anchorRect || !wrapperRef.current) {
      setPosition(null)
      return
    }

    const { width, height } = wrapperRef.current.getBoundingClientRect()
    setPosition(
      computePopoverPosition(anchorRect, width, height, window.innerWidth, window.innerHeight),
    )
  }, [open, anchorRect, title, body])

  // Click-outside dismissal (Req 33.6).
  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onDismiss()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open, onDismiss])

  if (!open || !anchorRect) return null

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? 'visible' : 'hidden',
      }}
      className="z-50"
    >
      <Card size="sm" className={cn('w-64 items-stretch gap-2 text-left', className)}>
        <div className="flex w-full items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-base leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        {body !== undefined && <div className="w-full text-xs text-slate-600">{body}</div>}
      </Card>
    </div>
  )
}
