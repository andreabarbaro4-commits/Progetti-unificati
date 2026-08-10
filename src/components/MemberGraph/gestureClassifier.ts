/**
 * Gesture disambiguation logic for cluster canvas interactions.
 *
 * Distinguishes between ring rotation gestures (drag along the arc)
 * and cluster drag gestures (drag away from the arc) using the angle
 * between the drag vector and the tangent of the ring at the drag start point.
 */

/**
 * Movement threshold (CSS pixels) below which a pointer gesture is classified
 * as a tap (triggering selection toggle) rather than a drag/rotation.
 */
export const GESTURE_THRESHOLD_PX = 4

/**
 * Computes the unit tangent vector at a given angle on the ring.
 *
 * For a ring centered at the origin, a point at angle θ has position (cos(θ), sin(θ)).
 * The tangent vector perpendicular to the radius at that point is (-sin(θ), cos(θ)),
 * which is the unit tangent in the counter-clockwise direction.
 */
export function computeTangentAtAngle(angle: number): {
  tx: number
  ty: number
} {
  return {
    tx: -Math.sin(angle),
    ty: Math.cos(angle),
  }
}

/**
 * Classifies a pointer gesture as either a ring rotation or a cluster drag.
 *
 * Uses the dot-product between the drag vector and the tangent vector at the
 * member's ring position. If the angle between them is less than 45°
 * (i.e. |cos(angle)| > cos(π/4)), the gesture is tangential → rotation.
 * Otherwise, it's radial → drag.
 */
export function classifyGesture(
  dragVector: { dx: number; dy: number },
  tangent: { tx: number; ty: number },
): 'rotation' | 'drag' {
  const dot = dragVector.dx * tangent.tx + dragVector.dy * tangent.ty
  const dragMag = Math.hypot(dragVector.dx, dragVector.dy)
  const tangentMag = Math.hypot(tangent.tx, tangent.ty)

  // Avoid division by zero for zero-length vectors
  if (dragMag === 0 || tangentMag === 0) {
    return 'drag'
  }

  const cosAngle = dot / (dragMag * tangentMag)
  return Math.abs(cosAngle) > Math.cos(Math.PI / 4) ? 'rotation' : 'drag'
}

/**
 * Full two-layer gesture classification:
 * 1. If Euclidean distance < GESTURE_THRESHOLD_PX → 'tap'
 * 2. Otherwise, delegates to classifyGesture → 'rotation' | 'drag'
 *
 * This represents the complete gesture decision logic used by ClusterCanvas
 * to determine whether a pointer interaction is a tap (selection toggle)
 * or a drag/rotation (canvas manipulation).
 */
export function classifyPointerGesture(
  dx: number,
  dy: number,
  tangent: { tx: number; ty: number },
): 'tap' | 'rotation' | 'drag' {
  const distance = Math.hypot(dx, dy)
  if (distance < GESTURE_THRESHOLD_PX) {
    return 'tap'
  }
  return classifyGesture({ dx, dy }, tangent)
}
