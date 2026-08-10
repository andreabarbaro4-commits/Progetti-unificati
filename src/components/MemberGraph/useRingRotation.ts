import { useCallback, useEffect, useRef } from 'react'

import type { ViewportTransform } from './useClusterPhysics'

// ── Physics constants ─────────────────────────────────────────────────────────

/**
 * Angular velocity multiplier per frame (at ~60fps).
 * 0.94 means 6% angular velocity decay per frame — slightly less friction than
 * linear cluster drag (0.92) so ring flicks feel "looser" and spin longer,
 * matching the UX expectation for a rotary gesture.
 */
export const ROTATIONAL_FRICTION = 0.94

/**
 * Minimum angular velocity threshold in radians per frame.
 * 0.002 rad/frame ≈ 0.11°/frame — below this the rotation is imperceptible
 * and the motion is killed. At 60fps this corresponds to ~7°/s.
 */
export const MIN_ANGULAR_VELOCITY = 0.002

/**
 * Angular velocity threshold (scaled by 1/100 in comparison) above which
 * the release velocity is amplified by FLICK_MULTIPLIER. This creates a
 * distinct "flick" feel: slow releases decelerate normally, but fast wrist
 * flicks get an extra velocity boost for a satisfying spin effect.
 * Effectively: if |angularVelocity| > 0.05 rad/frame, amplify.
 */
export const FLICK_VELOCITY_THRESHOLD = 5

/**
 * Velocity multiplier applied to angular velocity on release when the flick
 * threshold is exceeded. 1.8× means a fast flick travels almost twice as far
 * as the raw pointer tracking would suggest, making the gesture feel responsive.
 */
export const FLICK_MULTIPLIER = 1.8

// ── Internal types ────────────────────────────────────────────────────────────

interface RingMotion {
  angularVelocity: number
}

interface RotationState {
  clusterId: string
  memberId: string
  lastAngle: number
  lastTime: number
  releaseAngularVelocity: number
}

/**
 * Manages ring rotation physics: angular drag tracking, angular momentum
 * on release, and rotational friction decay per tick.
 *
 * ## Ring Rotation Model
 *
 * Members are arranged in a ring around each cluster center. The user can
 * grab any member bubble and rotate the entire ring:
 *
 * 1. **During drag**: the angle between the pointer and the cluster center
 *    is tracked. The delta between consecutive angles directly rotates the
 *    ring offset (stored as radians in `ringOffsetsRef`). Angles are
 *    normalized to [-π, π] to avoid wraparound discontinuities.
 *
 * 2. **On release**: angular velocity is computed (rad/frame at 16ms).
 *    If it exceeds `FLICK_VELOCITY_THRESHOLD / 100` (≈ 0.05 rad/frame),
 *    it's amplified by `FLICK_MULTIPLIER` (1.8×) for a snappy flick feel.
 *
 * 3. **Friction decay**: each frame multiplies angular velocity by
 *    `ROTATIONAL_FRICTION` (0.94). The ring offset advances by the decayed
 *    velocity and is normalized to [0, 2π]. Motion stops when below
 *    `MIN_ANGULAR_VELOCITY` (0.002 rad/frame).
 */
export function useRingRotation(
  ringOffsetsRef: React.MutableRefObject<Map<string, number>>,
  positionsRef: React.MutableRefObject<Map<string, { x: number; y: number }>>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  viewportTransformRef: React.MutableRefObject<ViewportTransform>,
  flushToState: () => void,
  ensureRunning: () => void,
): {
  startRingRotation: (
    clusterId: string,
    memberId: string,
    e: React.PointerEvent,
  ) => void
  isRotating: (clusterId: string) => boolean
  tickRotation: () => boolean
} {
  const ringMotionsRef = useRef<Map<string, RingMotion>>(new Map())
  const activeRotationRef = useRef<RotationState | null>(null)
  // Track active window listeners so they can be removed on unmount (mid-drag)
  const windowListenersRef = useRef<{
    move: (ev: PointerEvent) => void
    up: () => void
  } | null>(null)

  /** Apply rotational friction for one frame. Returns true if motion remains. */
  const tickRotation = useCallback((): boolean => {
    let anyActive = false
    for (const [id, motion] of ringMotionsRef.current) {
      const currentOffset = ringOffsetsRef.current.get(id) ?? 0
      // Advance ring offset by angular velocity (radians)
      let newOffset = currentOffset + motion.angularVelocity
      // Normalize to [0, 2π] — keeps the offset monotonically bounded
      newOffset = ((newOffset % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      ringOffsetsRef.current.set(id, newOffset)

      // Apply rotational friction: 6% decay per frame (0.94 multiplier)
      motion.angularVelocity *= ROTATIONAL_FRICTION

      // Kill rotation once angular velocity is imperceptible
      if (Math.abs(motion.angularVelocity) < MIN_ANGULAR_VELOCITY) {
        motion.angularVelocity = 0
        ringMotionsRef.current.delete(id)
      } else {
        anyActive = true
      }
    }
    return anyActive
  }, [ringOffsetsRef])

  const startRingRotation = useCallback(
    (clusterId: string, memberId: string, e: React.PointerEvent) => {
      // Stop any existing ring inertia for this cluster
      ringMotionsRef.current.delete(clusterId)

      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()

      const pos = positionsRef.current.get(clusterId)
      if (!pos) return

      const { panX, panY, zoom } = viewportTransformRef.current
      const centerClientX = pos.x * zoom + panX + rect.left
      const centerClientY = pos.y * zoom + panY + rect.top

      const initialAngle = Math.atan2(
        e.clientY - centerClientY,
        e.clientX - centerClientX,
      )

      activeRotationRef.current = {
        clusterId,
        memberId,
        lastAngle: initialAngle,
        lastTime: performance.now(),
        releaseAngularVelocity: 0,
      }

      const onPointerMove = (ev: PointerEvent) => {
        const rotation = activeRotationRef.current
        if (!rotation || rotation.clusterId !== clusterId) return

        const currentPos = positionsRef.current.get(clusterId)
        if (!currentPos) return

        // Compute cluster center in screen-space (client coordinates)
        const { panX: px, panY: py, zoom: z } = viewportTransformRef.current
        const containerRect = container.getBoundingClientRect()
        const ccx = currentPos.x * z + px + containerRect.left
        const ccy = currentPos.y * z + py + containerRect.top

        // Angle from cluster center to current pointer position (radians)
        const currentAngle = Math.atan2(ev.clientY - ccy, ev.clientX - ccx)
        let deltaAngle = currentAngle - rotation.lastAngle

        // Normalize delta to [-π, π] to avoid discontinuities when the
        // pointer crosses the ±π boundary (atan2 wraps there)
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI

        // Apply rotation delta directly to ring offset
        const currentOffset = ringOffsetsRef.current.get(clusterId) ?? 0
        let newOffset = currentOffset + deltaAngle
        newOffset = ((newOffset % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        ringOffsetsRef.current.set(clusterId, newOffset)

        // Track angular velocity (normalized to rad per 16ms frame)
        const now = performance.now()
        const dt = now - rotation.lastTime
        if (dt > 0) {
          rotation.releaseAngularVelocity = deltaAngle / (dt / 16)
        }

        rotation.lastAngle = currentAngle
        rotation.lastTime = now

        flushToState()
      }

      const onPointerUp = () => {
        const rotation = activeRotationRef.current
        if (rotation && rotation.clusterId === clusterId) {
          let angularVelocity = rotation.releaseAngularVelocity

          // Flick amplification: if the release angular velocity exceeds the
          // threshold (FLICK_VELOCITY_THRESHOLD / 100 = 0.05 rad/frame),
          // multiply by FLICK_MULTIPLIER (1.8×). This creates a two-tier feel:
          // slow rotations decelerate at their natural rate, while fast wrist
          // flicks get a satisfying extra "spin" boost.
          if (Math.abs(angularVelocity) > FLICK_VELOCITY_THRESHOLD / 100) {
            angularVelocity *= FLICK_MULTIPLIER
          }

          if (Math.abs(angularVelocity) >= MIN_ANGULAR_VELOCITY) {
            ringMotionsRef.current.set(clusterId, { angularVelocity })
            ensureRunning()
          }

          activeRotationRef.current = null
        }

        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
        windowListenersRef.current = null
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
      windowListenersRef.current = { move: onPointerMove, up: onPointerUp }
    },
    [
      ringOffsetsRef,
      positionsRef,
      containerRef,
      viewportTransformRef,
      ensureRunning,
      flushToState,
    ],
  )

  const isRotating = useCallback((clusterId: string): boolean => {
    return activeRotationRef.current?.clusterId === clusterId
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

  return { startRingRotation, isRotating, tickRotation }
}
