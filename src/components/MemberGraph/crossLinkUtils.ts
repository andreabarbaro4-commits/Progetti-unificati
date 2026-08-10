// Cross-cluster link geometry helpers.
// Ported from ../demo/src/pages/TeamPage/crossLinkUtils.ts and adapted to
// this repo's `GenericCrossLink` shape (see groupingLogic.ts) rather than the
// demo's project-specific `CrossLink` type — both carry the same three
// fields (memberId/fromClusterId/toClusterId), so the endpoint math is
// identical.

import type { GenericCrossLink } from './groupingLogic'

/**
 * World-space endpoints for rendering a cross-cluster link line.
 */
export interface CrossLinkEndpoints {
  fromX: number
  fromY: number
  toX: number
  toY: number
}

/**
 * Computes the world-space (x, y) position of a member bubble within a cluster,
 * given the cluster center, ring radius, the member's base angle, and the
 * current rotation offset for that cluster's ring.
 */
function getMemberWorldPosition(
  clusterCenter: { x: number; y: number },
  ringRadius: number,
  memberAngle: number,
  ringOffset: number,
): { x: number; y: number } {
  const angle = memberAngle + ringOffset
  return {
    x: clusterCenter.x + Math.cos(angle) * ringRadius,
    y: clusterCenter.y + Math.sin(angle) * ringRadius,
  }
}

/**
 * Computes the world-space endpoints for a cross-cluster link line.
 *
 * Each endpoint is positioned at the member bubble's location within its
 * respective cluster: clusterCenter + rotatedRingPosition(memberId).
 *
 * @param link - The cross-cluster link descriptor
 * @param clusterPositions - Current world-space center of each cluster (clusterId → {x, y})
 * @param ringOffsets - Current rotation offset in radians per cluster (clusterId → radians)
 * @param memberAngles - Base angle of each member within each cluster (clusterId → Map<memberId, angle>)
 * @param ringRadii - Ring radius per cluster (clusterId → radius in px)
 * @returns The from/to endpoints, or null if required data is missing
 */
export function getCrossLinkEndpoints(
  link: GenericCrossLink,
  clusterPositions: Map<string, { x: number; y: number }>,
  ringOffsets: Map<string, number>,
  memberAngles: Map<string, Map<string, number>>,
  ringRadii: Map<string, number>,
): CrossLinkEndpoints | null {
  const fromCenter = clusterPositions.get(link.fromClusterId)
  const toCenter = clusterPositions.get(link.toClusterId)
  if (!fromCenter || !toCenter) return null

  const fromRadius = ringRadii.get(link.fromClusterId)
  const toRadius = ringRadii.get(link.toClusterId)
  if (fromRadius == null || toRadius == null) return null

  const fromAngles = memberAngles.get(link.fromClusterId)
  const toAngles = memberAngles.get(link.toClusterId)
  if (!fromAngles || !toAngles) return null

  const fromAngle = fromAngles.get(link.memberId)
  const toAngle = toAngles.get(link.memberId)
  if (fromAngle == null || toAngle == null) return null

  const fromOffset = ringOffsets.get(link.fromClusterId) ?? 0
  const toOffset = ringOffsets.get(link.toClusterId) ?? 0

  const from = getMemberWorldPosition(
    fromCenter,
    fromRadius,
    fromAngle,
    fromOffset,
  )
  const to = getMemberWorldPosition(toCenter, toRadius, toAngle, toOffset)

  return {
    fromX: from.x,
    fromY: from.y,
    toX: to.x,
    toY: to.y,
  }
}
