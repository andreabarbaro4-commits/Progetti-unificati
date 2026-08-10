// Pure geometry utilities for the project-centric cluster layout.
// Ported 1:1 from ../demo/src/pages/TeamPage/clusterGeometry.ts — all
// functions are deterministic and side-effect-free (no React/DOM dependency).

// ── Constants ─────────────────────────────────────────────────────────────────

export const MIN_RADIUS = 70
export const MAX_RADIUS = 320
export const BUBBLE_DIAMETER = 38
export const MIN_GAP = 20
export const CLUSTER_PADDING = 50
export const MIN_CLUSTER_SPACING = 60
export const CENTER_LOGO_SIZE = 54

// Spiral scan parameters
const ANGULAR_STEP_DEG = 15
const RADIAL_STEP = 10

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ClusterGeometry {
  clusterId: string
  cx: number // center x in world space
  cy: number // center y in world space
  ringRadius: number // distance from center to bubble centers
  outerRadius: number // ring radius + bubble radius + padding
  memberAngles: Map<string, number> // memberId → angle in radians
}

// ── Ring Radius ───────────────────────────────────────────────────────────────

/**
 * Compute the ring radius for a cluster given the number of members.
 * Formula: max(MIN_RADIUS, min(MAX_RADIUS, N * (BUBBLE_DIAMETER + MIN_GAP) / (2π)))
 */
export function computeRingRadius(memberCount: number): number {
  const computed = (memberCount * (BUBBLE_DIAMETER + MIN_GAP)) / (2 * Math.PI)
  return Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, computed))
}

// ── Member Angles ─────────────────────────────────────────────────────────────

/**
 * Compute evenly-distributed angles for each member on the ring.
 * angle(i, totalSlots) = (i / totalSlots) * 2π + rotationOffset
 *
 * totalSlots defaults to memberIds.length but can be set higher to reserve
 * slots for additional elements (e.g. the add button) so all items are
 * evenly spaced.
 */
export function computeMemberAngles(
  memberIds: string[],
  rotationOffset: number,
  totalSlots?: number,
): Map<string, number> {
  const angles = new Map<string, number>()
  const n = memberIds.length
  if (n === 0) return angles

  const slots = totalSlots ?? n

  for (let i = 0; i < n; i++) {
    const angle = (i / slots) * 2 * Math.PI + rotationOffset
    angles.set(memberIds[i], angle)
  }
  return angles
}

// ── Cluster Positions (Circle Packing via Spiral Scan) ────────────────────────

export interface ClusterInput {
  id: string
  outerRadius: number
}

/**
 * Compute cluster center positions using a spiral-scan circle-packing algorithm.
 *
 * 1. Sort clusters by outerRadius descending (largest first).
 * 2. Place the first cluster at the canvas center.
 * 3. For each subsequent cluster, spiral outward from the center to find the
 *    first valid position maintaining MIN_CLUSTER_SPACING edge-to-edge gap.
 * 4. Re-center all positions around the centroid for balanced spacing.
 *
 * Returns a Map from cluster id to {x, y} center position.
 */
export function computeClusterPositions(
  clusters: ClusterInput[],
  _canvasW: number,
  _canvasH: number,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  if (clusters.length === 0) return positions

  // Sort by size descending (work on a copy to avoid mutating input)
  const sorted = [...clusters].sort((a, b) => b.outerRadius - a.outerRadius)

  // Place the first (largest) cluster at world origin (0, 0)
  positions.set(sorted[0].id, { x: 0, y: 0 })

  // Place remaining clusters via spiral scan from world origin
  const angularStepRad = (ANGULAR_STEP_DEG * Math.PI) / 180

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    let placed = false
    let radius = 0

    // Spiral outward from origin until a valid position is found.
    // No canvas bounds constraint — the viewport auto-fits to content.
    while (!placed) {
      radius += RADIAL_STEP

      for (let angle = 0; angle < 2 * Math.PI; angle += angularStepRad) {
        const candidateX = radius * Math.cos(angle)
        const candidateY = radius * Math.sin(angle)

        // Check spacing against all already-placed clusters
        let valid = true
        for (let j = 0; j < i; j++) {
          const other = sorted[j]
          const otherPos = positions.get(other.id)!
          const dx = candidateX - otherPos.x
          const dy = candidateY - otherPos.y
          const dist = Math.hypot(dx, dy)
          const minDist =
            current.outerRadius + other.outerRadius + MIN_CLUSTER_SPACING

          if (dist < minDist) {
            valid = false
            break
          }
        }

        if (valid) {
          positions.set(current.id, { x: candidateX, y: candidateY })
          placed = true
          break
        }
      }

      // Safety: prevent infinite loops for edge cases
      if (radius > 5000) {
        positions.set(current.id, {
          x: radius * Math.cos(0),
          y: radius * Math.sin(0),
        })
        placed = true
      }
    }
  }

  // Re-center all positions around the centroid so clusters are balanced
  if (positions.size > 1) {
    let cx = 0
    let cy = 0
    for (const pos of positions.values()) {
      cx += pos.x
      cy += pos.y
    }
    cx /= positions.size
    cy /= positions.size

    for (const [id, pos] of positions) {
      positions.set(id, { x: pos.x - cx, y: pos.y - cy })
    }
  }

  return positions
}

// ── Scale Factor ──────────────────────────────────────────────────────────────

/**
 * Compute a uniform scale factor when the total cluster area exceeds the canvas.
 * scaleFactor = sqrt(canvasArea / totalClusterArea) clamped to [0.5, 1.0]
 *
 * If totalClusterArea <= canvasArea, returns 1.0 (no scaling needed).
 */
export function computeScaleFactor(
  clusters: ClusterInput[],
  canvasArea: number,
): number {
  const totalClusterArea = clusters.reduce((sum, c) => {
    return sum + Math.PI * c.outerRadius * c.outerRadius
  }, 0)

  if (totalClusterArea <= canvasArea) return 1.0

  const raw = Math.sqrt(canvasArea / totalClusterArea)
  return Math.max(0.5, Math.min(1.0, raw))
}
