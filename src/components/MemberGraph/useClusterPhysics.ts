import { useCallback, useEffect, useRef, useState } from 'react'

import type { ClusterGeometry } from './clusterGeometry'
import { useClusterMomentum } from './useClusterMomentum'
import { usePhysicsLoop } from './usePhysicsLoop'
import { useProvisionalOffset } from './useProvisionalOffset'
import { useRingRotation } from './useRingRotation'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ViewportTransform {
  panX: number
  panY: number
  zoom: number
}

export interface ClusterPhysicsState {
  /** Current cluster positions (updated by physics tick) */
  clusterPositions: Map<string, { x: number; y: number }>
  /** Current ring rotation offsets (radians, per cluster) */
  ringOffsets: Map<string, number>
}

export interface ProvisionalOffset {
  dx: number
  dy: number
}

export interface ClusterPhysicsActions {
  startClusterDrag: (clusterId: string, e: React.PointerEvent) => void
  startRingRotation: (
    clusterId: string,
    memberId: string,
    e: React.PointerEvent,
  ) => void
  isDragging: (clusterId: string) => boolean
  isRotating: (clusterId: string) => boolean
  /** Apply a temporary visual-only offset to a cluster (no re-render) */
  applyProvisionalOffset: (clusterId: string, dx: number, dy: number) => void
  /** Bake the provisional offset into the real cluster position for seamless handoff */
  commitProvisionalOffset: (clusterId: string) => void
  /** Animate the cluster back to original position (spring-back for sub-threshold releases) */
  revertProvisionalOffset: (clusterId: string) => void
  /** Get cluster position accounting for provisional offset */
  getClusterPosition: (
    clusterId: string,
  ) => { x: number; y: number } | undefined
}

// ── Re-export physics constants for external consumers ────────────────────────

export { FRICTION, MIN_VELOCITY } from './useClusterMomentum'
export {
  FLICK_MULTIPLIER,
  FLICK_VELOCITY_THRESHOLD,
  MIN_ANGULAR_VELOCITY,
  ROTATIONAL_FRICTION,
} from './useRingRotation'

// ── Helper: build initial state from layout ─────────────────────────────────

function buildInitialPositions(
  layout: ClusterGeometry[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  for (const geo of layout) {
    positions.set(geo.clusterId, { x: geo.cx, y: geo.cy })
  }
  return positions
}

function buildInitialOffsets(layout: ClusterGeometry[]): Map<string, number> {
  const offsets = new Map<string, number>()
  for (const geo of layout) {
    offsets.set(geo.clusterId, 0)
  }
  return offsets
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Composition hook that wires together the physics sub-hooks into a single
 * public API for cluster interaction (drag, flick, ring rotation, tap).
 *
 * ## Sub-Hook Wiring
 *
 * - `usePhysicsLoop` — owns the single shared RAF loop; ticks both momentum
 *   and rotation each frame, stops automatically when idle.
 * - `useClusterMomentum` — handles pointer-driven cluster drag and post-release
 *   friction decay.
 * - `useRingRotation` — handles angular drag on member rings and rotational
 *   friction decay.
 * - `useProvisionalOffset` — handles the tap/drag disambiguation layer with
 *   spring-back revert animation.
 *
 * ## Forward-Ref Pattern for `ensureRunning`
 *
 * The sub-hooks (momentum, rotation) need to call `ensureRunning()` to wake
 * the RAF loop when new motion starts. But `ensureRunning` comes from
 * `usePhysicsLoop`, which depends on `onTick`, which depends on the sub-hooks.
 * To break this circular dependency, sub-hooks receive a thunk
 * `() => ensureRunningRef.current()` at construction time, and the ref is
 * updated after `usePhysicsLoop` returns. This is safe because `ensureRunning`
 * is only called in response to user interaction (after the first render).
 */
export function useClusterPhysics(
  initialLayout: ClusterGeometry[],
  viewportTransformRef: React.MutableRefObject<ViewportTransform>,
  containerRef: React.RefObject<HTMLDivElement | null>,
): ClusterPhysicsState & ClusterPhysicsActions {
  // ── Exposed state ───────────────────────────────────────────────────────
  const [clusterPositions, setClusterPositions] = useState<
    Map<string, { x: number; y: number }>
  >(() => buildInitialPositions(initialLayout))
  const [ringOffsets, setRingOffsets] = useState<Map<string, number>>(() =>
    buildInitialOffsets(initialLayout),
  )

  // Mutable internal copies for physics mutation (avoids allocating new maps every frame)
  const positionsRef = useRef(clusterPositions)
  const ringOffsetsRef = useRef(ringOffsets)

  // ── Sync positions from layout when it changes ──────────────────────────
  const prevLayoutRef = useRef(initialLayout)
  useEffect(() => {
    if (prevLayoutRef.current === initialLayout) return
    prevLayoutRef.current = initialLayout

    const currentPositions = positionsRef.current
    const currentOffsets = ringOffsetsRef.current

    const mergedPositions = new Map<string, { x: number; y: number }>()
    const mergedOffsets = new Map<string, number>()

    for (const geo of initialLayout) {
      const existing = currentPositions.get(geo.clusterId)
      mergedPositions.set(geo.clusterId, existing ?? { x: geo.cx, y: geo.cy })
      mergedOffsets.set(geo.clusterId, currentOffsets.get(geo.clusterId) ?? 0)
    }

    positionsRef.current = mergedPositions
    ringOffsetsRef.current = mergedOffsets

    queueMicrotask(() => {
      setClusterPositions(new Map(mergedPositions))
      setRingOffsets(new Map(mergedOffsets))
    })
  }, [initialLayout])

  // ── Flush mutable refs into React state ─────────────────────────────────
  const flushToState = useCallback(() => {
    setClusterPositions(new Map(positionsRef.current))
    setRingOffsets(new Map(ringOffsetsRef.current))
  }, [])

  // ── Wire sub-hooks ──────────────────────────────────────────────────────
  // Momentum and rotation hooks need `ensureRunning` to wake the RAF loop,
  // but it doesn't exist yet (circular: loop needs onTick, onTick needs
  // sub-hooks). Solved via a stable ref that's assigned after usePhysicsLoop.
  const { tickMomentum, startClusterDrag, isDragging } = useClusterMomentum(
    positionsRef,
    viewportTransformRef,
    flushToState,
    // ensureRunning is forward-referenced below via a stable ref
    () => ensureRunningRef.current(),
  )

  const { tickRotation, startRingRotation, isRotating } = useRingRotation(
    ringOffsetsRef,
    positionsRef,
    containerRef,
    viewportTransformRef,
    flushToState,
    () => ensureRunningRef.current(),
  )

  // The combined tick: runs both momentum and rotation, flushes the mutated
  // positions/offsets into React state, and returns whether any motion remains
  // (which tells the RAF loop whether to schedule another frame).
  const onTick = useCallback((): boolean => {
    const momentumActive = tickMomentum()
    const rotationActive = tickRotation()
    flushToState()
    return momentumActive || rotationActive
  }, [tickMomentum, tickRotation, flushToState])

  const { ensureRunning } = usePhysicsLoop(onTick)

  // Complete the forward-ref: sub-hooks can now call ensureRunning via the ref.
  const ensureRunningRef = useRef(ensureRunning)
  useEffect(() => {
    ensureRunningRef.current = ensureRunning
  }, [ensureRunning])

  const {
    applyProvisionalOffset,
    commitProvisionalOffset,
    revertProvisionalOffset,
    getClusterPosition,
  } = useProvisionalOffset(positionsRef, flushToState)

  // ── Return (identical public API) ───────────────────────────────────────
  return {
    clusterPositions,
    ringOffsets,
    startClusterDrag,
    startRingRotation,
    isDragging,
    isRotating,
    applyProvisionalOffset,
    commitProvisionalOffset,
    revertProvisionalOffset,
    getClusterPosition,
  }
}
