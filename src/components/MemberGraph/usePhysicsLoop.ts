import { useCallback, useEffect, useRef } from 'react'

/**
 * Manages the requestAnimationFrame lifecycle for physics simulations.
 * Starts the loop on demand and stops it automatically when the tick
 * callback reports no remaining activity.
 *
 * ## RAF Loop Lifecycle
 *
 * The loop is **demand-driven**: it only runs when there is active motion
 * (drag momentum or ring rotation). Calling `ensureRunning()` schedules
 * the first frame if the loop is idle. Each frame calls `onTick()`:
 *
 * 1. `onTick` returns `true` → another frame is scheduled (loop continues).
 * 2. `onTick` returns `false` → loop stops itself (no wasted frames when idle).
 *
 * This avoids a perpetual RAF that burns CPU when nothing is animating.
 *
 * The `onTick` callback is stored in a ref so that React re-renders can
 * update the tick logic (e.g., when sub-hook references change) without
 * tearing down and restarting the animation loop.
 *
 * @param onTick - Called each frame. Return `true` if there is still active
 *   motion that requires another frame; return `false` to stop the loop.
 * @returns `ensureRunning` — call this to guarantee the loop is scheduled.
 */
export function usePhysicsLoop(onTick: () => boolean): {
  ensureRunning: () => void
} {
  const rafIdRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)
  const onTickRef = useRef(onTick)

  // Store onTick in a mutable ref so the RAF loop always calls the latest
  // version without needing to cancel/restart the animation frame chain.
  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  // The core animation frame callback. Self-schedules via RAF as long as
  // onTick reports remaining motion; otherwise marks the loop as stopped.
  // Stored in a ref to allow self-referencing without a circular useCallback.
  const loopRef = useRef<() => void>(() => {})

  useEffect(() => {
    loopRef.current = () => {
      const shouldContinue = onTickRef.current()
      if (shouldContinue) {
        rafIdRef.current = requestAnimationFrame(loopRef.current)
      } else {
        // No more motion — park the loop until ensureRunning() is called again.
        isRunningRef.current = false
        rafIdRef.current = null
      }
    }
  }, [])

  // Idempotent: safe to call multiple times per frame (e.g., when both
  // cluster drag and ring rotation start simultaneously).
  const ensureRunning = useCallback(() => {
    if (!isRunningRef.current) {
      isRunningRef.current = true
      rafIdRef.current = requestAnimationFrame(loopRef.current)
    }
  }, [])

  // Cleanup: cancel any pending RAF on unmount to prevent callbacks
  // firing after the component tree is torn down.
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  return { ensureRunning }
}
