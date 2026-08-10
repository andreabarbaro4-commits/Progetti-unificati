import { useCallback, useEffect, useRef } from 'react'

import type { ViewportTransform } from './useClusterPhysics'

// ── Physics constants ─────────────────────────────────────────────────────────

/**
 * Velocity multiplier applied each frame (at ~60fps / 16ms per frame).
 * 0.92 means 8% velocity decay per frame — a cluster released at 10 px/frame
 * decays to ~4.4 px/frame after 10 frames (~160ms), giving a smooth deceleration
 * that feels natural for a "flick" gesture without sliding too far.
 */
export const FRICTION = 0.92

/**
 * Minimum velocity threshold in pixels per frame. Once both vx and vy drop
 * below this, motion is considered stopped and the cluster is removed from
 * the active-motion set. 0.5 px/frame is sub-pixel — imperceptible movement.
 */
export const MIN_VELOCITY = 0.5

// ── Internal types ────────────────────────────────────────────────────────────

interface ClusterMotion {
  vx: number
  vy: number
}

interface DragState {
  clusterId: string
  lastClientX: number
  lastClientY: number
  lastTime: number
  releaseVx: number
  releaseVy: number
}

/**
 * Manages cluster drag physics: pointer-driven position updates during drag,
 * velocity tracking, and friction-based momentum decay after release.
 *
 * ## Drag/Flick Momentum Model
 *
 * 1. **During drag**: each `pointermove` moves the cluster position directly
 *    (1:1 with pointer movement, scaled by viewport zoom). Velocity is
 *    tracked as a rolling last-sample: `dx / (dt / 16)` normalizes to
 *    "pixels moved per 16ms frame" regardless of actual pointer event rate.
 *
 * 2. **On release**: if the release velocity exceeds `MIN_VELOCITY`, the
 *    cluster enters the momentum phase. Each RAF tick applies `FRICTION`
 *    decay: `v *= 0.92` per frame, displacing the cluster by the decayed
 *    velocity each frame.
 *
 * 3. **Stopping**: when both |vx| and |vy| drop below `MIN_VELOCITY`
 *    (0.5 px/frame), motion is killed and the cluster is removed from the
 *    active set. If no clusters remain active, the RAF loop stops.
 */
export function useClusterMomentum(
  positionsRef: React.MutableRefObject<Map<string, { x: number; y: number }>>,
  viewportTransformRef: React.MutableRefObject<ViewportTransform>,
  flushToState: () => void,
  ensureRunning: () => void,
): {
  startClusterDrag: (clusterId: string, e: React.PointerEvent) => void
  isDragging: (clusterId: string) => boolean
  tickMomentum: () => boolean
} {
  const clusterMotionsRef = useRef<Map<string, ClusterMotion>>(new Map())
  const activeDragRef = useRef<DragState | null>(null)
  // Track active window listeners so they can be removed on unmount (mid-drag)
  const windowListenersRef = useRef<{
    move: (ev: PointerEvent) => void
    up: () => void
  } | null>(null)

  /** Apply friction decay for one frame. Returns true if motion remains. */
  const tickMomentum = useCallback((): boolean => {
    let anyActive = false
    for (const [id, motion] of clusterMotionsRef.current) {
      const pos = positionsRef.current.get(id)
      if (!pos) continue

      // Displace position by current velocity
      pos.x += motion.vx
      pos.y += motion.vy

      // Apply friction: multiply velocity by FRICTION (0.92) each frame,
      // producing exponential decay. After N frames, v = v0 * 0.92^N.
      motion.vx *= FRICTION
      motion.vy *= FRICTION

      // Kill motion once velocity is sub-pixel (imperceptible)
      if (
        Math.abs(motion.vx) < MIN_VELOCITY &&
        Math.abs(motion.vy) < MIN_VELOCITY
      ) {
        motion.vx = 0
        motion.vy = 0
        clusterMotionsRef.current.delete(id)
      } else {
        anyActive = true
      }
    }
    return anyActive
  }, [positionsRef])

  const startClusterDrag = useCallback(
    (clusterId: string, e: React.PointerEvent) => {
      // Stop any existing momentum for this cluster
      clusterMotionsRef.current.delete(clusterId)

      activeDragRef.current = {
        clusterId,
        lastClientX: e.clientX,
        lastClientY: e.clientY,
        lastTime: performance.now(),
        releaseVx: 0,
        releaseVy: 0,
      }

      const onPointerMove = (ev: PointerEvent) => {
        const drag = activeDragRef.current
        if (!drag || drag.clusterId !== clusterId) return

        // Convert screen-space pointer delta to canvas-space by dividing by
        // the current zoom level — a 2× zoom means 1px of pointer movement
        // should only move the cluster 0.5px in world coordinates.
        const { zoom } = viewportTransformRef.current
        const dx = (ev.clientX - drag.lastClientX) / zoom
        const dy = (ev.clientY - drag.lastClientY) / zoom

        const pos = positionsRef.current.get(clusterId)
        if (pos) {
          pos.x += dx
          pos.y += dy
        }

        // Track instantaneous velocity for release momentum.
        // Normalize to "px per 16ms frame" so the post-release friction
        // decay runs at a consistent physical rate regardless of the actual
        // pointermove event frequency (which varies across browsers/devices).
        const now = performance.now()
        const dt = now - drag.lastTime
        if (dt > 0) {
          drag.releaseVx = dx / (dt / 16)
          drag.releaseVy = dy / (dt / 16)
        }

        drag.lastClientX = ev.clientX
        drag.lastClientY = ev.clientY
        drag.lastTime = now

        flushToState()
      }

      const onPointerUp = () => {
        const drag = activeDragRef.current
        if (drag && drag.clusterId === clusterId) {
          const vx = drag.releaseVx
          const vy = drag.releaseVy

          // Only enter momentum phase if release velocity is perceptible.
          // Sub-threshold releases (gentle lift) stop the cluster immediately.
          if (Math.abs(vx) >= MIN_VELOCITY || Math.abs(vy) >= MIN_VELOCITY) {
            clusterMotionsRef.current.set(clusterId, { vx, vy })
            ensureRunning()
          }

          activeDragRef.current = null
        }

        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
        windowListenersRef.current = null
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
      windowListenersRef.current = { move: onPointerMove, up: onPointerUp }
    },
    [viewportTransformRef, positionsRef, ensureRunning, flushToState],
  )

  const isDragging = useCallback((clusterId: string): boolean => {
    return activeDragRef.current?.clusterId === clusterId
  }, [])

  // Clean up window listeners on unmount (prevents leaks if component
  // unmounts mid-drag before pointerup fires)
  useEffect(() => {
    return () => {
      const listeners = windowListenersRef.current
      if (listeners) {
        window.removeEventListener('pointermove', listeners.move)
        window.removeEventListener('pointerup', listeners.up)
        windowListenersRef.current = null
      }
    }
  }, [])

  return { startClusterDrag, isDragging, tickMomentum }
}
