import { useCallback, useEffect, useRef } from 'react'

import type { ProvisionalOffset } from './useClusterPhysics'

/**
 * Manages provisional (visual-only) position offsets for clusters during
 * the gesture decision window (tap vs. drag disambiguation). Offsets are
 * applied immediately for visual feedback and can be either committed into
 * the real position or reverted with a spring-back animation.
 *
 * ## Why Provisional Offsets Exist
 *
 * When a user touches a cluster, the system can't immediately tell if this
 * will be a tap (select) or a drag (move). To avoid a sluggish "wait for
 * threshold" UX, the cluster moves immediately with the pointer via a
 * provisional offset. This gives instant visual feedback while the gesture
 * is still being classified:
 *
 * - **Drag confirmed** (pointer moves past threshold): `commitProvisionalOffset()`
 *   bakes the offset into the real position — seamless handoff to momentum physics.
 * - **Tap detected** (pointer released before threshold): `revertProvisionalOffset()`
 *   animates the cluster back to its original position with a spring-back easing.
 *
 * ## Spring-Back Animation
 *
 * Revert uses an ease-out cubic curve (`1 - (1-t)³`) over 150ms. This gives
 * a fast initial snap that decelerates smoothly to rest, feeling physically
 * natural without being slow enough to annoy the user.
 */
export function useProvisionalOffset(
  positionsRef: React.MutableRefObject<Map<string, { x: number; y: number }>>,
  flushToState: () => void,
): {
  applyProvisionalOffset: (clusterId: string, dx: number, dy: number) => void
  commitProvisionalOffset: (clusterId: string) => void
  revertProvisionalOffset: (clusterId: string) => void
  getClusterPosition: (
    clusterId: string,
  ) => { x: number; y: number } | undefined
} {
  const provisionalOffsetRef = useRef<Map<string, ProvisionalOffset>>(new Map())
  const revertAnimationRef = useRef<Map<string, number>>(new Map())

  const applyProvisionalOffset = useCallback(
    (clusterId: string, dx: number, dy: number) => {
      provisionalOffsetRef.current.set(clusterId, { dx, dy })
      flushToState()
    },
    [flushToState],
  )

  const commitProvisionalOffset = useCallback(
    (clusterId: string) => {
      const offset = provisionalOffsetRef.current.get(clusterId)
      if (!offset) return

      const pos = positionsRef.current.get(clusterId)
      if (pos) {
        pos.x += offset.dx
        pos.y += offset.dy
      }

      provisionalOffsetRef.current.delete(clusterId)
      flushToState()
    },
    [positionsRef, flushToState],
  )

  const revertProvisionalOffset = useCallback(
    (clusterId: string) => {
      const offset = provisionalOffsetRef.current.get(clusterId)
      if (!offset) return

      // Cancel any existing revert animation for this cluster
      const existingRaf = revertAnimationRef.current.get(clusterId)
      if (existingRaf !== undefined) {
        cancelAnimationFrame(existingRaf)
      }

      // Spring-back animation: ease-out cubic ( 1 - (1-t)³ ) over 150ms.
      // 150ms is short enough to feel snappy but long enough for the eye to
      // track the motion, providing clear feedback that the tap was recognized
      // (not a failed drag). The cubic ease-out starts fast and decelerates,
      // mimicking a physical spring returning to rest.
      const startDx = offset.dx
      const startDy = offset.dy
      const duration = 150 // ms — total revert animation time
      const startTime = performance.now()

      const animate = () => {
        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1) // [0, 1]
        // Ease-out cubic: fast start, smooth deceleration to zero
        const eased = 1 - Math.pow(1 - progress, 3)

        // Interpolate offset from (startDx, startDy) → (0, 0)
        const currentDx = startDx * (1 - eased)
        const currentDy = startDy * (1 - eased)

        if (progress >= 1) {
          provisionalOffsetRef.current.delete(clusterId)
          revertAnimationRef.current.delete(clusterId)
          flushToState()
        } else {
          provisionalOffsetRef.current.set(clusterId, {
            dx: currentDx,
            dy: currentDy,
          })
          flushToState()
          const rafId = requestAnimationFrame(animate)
          revertAnimationRef.current.set(clusterId, rafId)
        }
      }

      const rafId = requestAnimationFrame(animate)
      revertAnimationRef.current.set(clusterId, rafId)
    },
    [flushToState],
  )

  const getClusterPosition = useCallback(
    (clusterId: string): { x: number; y: number } | undefined => {
      const pos = positionsRef.current.get(clusterId)
      if (!pos) return undefined

      const offset = provisionalOffsetRef.current.get(clusterId)
      if (offset) {
        return { x: pos.x + offset.dx, y: pos.y + offset.dy }
      }
      return { x: pos.x, y: pos.y }
    },
    [positionsRef],
  )

  // Cleanup revert animations on unmount
  useEffect(() => {
    const animationMap = revertAnimationRef.current
    return () => {
      for (const rafId of animationMap.values()) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return {
    applyProvisionalOffset,
    commitProvisionalOffset,
    revertProvisionalOffset,
    getClusterPosition,
  }
}
