import { useMemo } from 'react'

import type { ClusterSource } from '../../mock/fixtures/types'
import {
  BUBBLE_DIAMETER,
  CLUSTER_PADDING,
  type ClusterGeometry,
  type ClusterInput,
  computeClusterPositions,
  computeMemberAngles,
  computeRingRadius,
  computeScaleFactor,
} from './clusterGeometry'

/**
 * Computes the deterministic initial cluster layout given the cluster sources
 * and canvas dimensions. Recomputes only when inputs change.
 *
 * Ported 1:1 from ../demo/src/pages/TeamPage/useClusterLayout.ts. Reserves an
 * extra ring slot per cluster for the add-member button (so members stay
 * evenly spaced around the ring) and applies `computeScaleFactor` to shrink
 * every cluster uniformly when their combined area would exceed the canvas.
 */
export function useClusterLayout(
  sources: ClusterSource[],
  canvasWidth: number,
  canvasHeight: number,
): ClusterGeometry[] {
  return useMemo(() => {
    if (sources.length === 0 || canvasWidth <= 0 || canvasHeight <= 0) {
      return []
    }

    // 1. Compute ring radius and outer radius for each source (+1 slot reserved for the add button)
    const clusterInputs: (ClusterInput & { ringRadius: number })[] =
      sources.map((source) => {
        const ringRadius = computeRingRadius(source.memberIds.length + 1)
        const outerRadius = ringRadius + BUBBLE_DIAMETER / 2 + CLUSTER_PADDING
        return { id: source.id, outerRadius, ringRadius }
      })

    // 2. Check if we need to scale down
    const canvasArea = canvasWidth * canvasHeight
    const scaleFactor = computeScaleFactor(clusterInputs, canvasArea)

    // 3. Apply scale factor to radii if needed
    const scaledInputs: (ClusterInput & { ringRadius: number })[] =
      scaleFactor < 1
        ? clusterInputs.map((c) => ({
            id: c.id,
            outerRadius: c.outerRadius * scaleFactor,
            ringRadius: c.ringRadius * scaleFactor,
          }))
        : clusterInputs

    // 4. Compute cluster positions using spiral-scan packing
    const positions = computeClusterPositions(
      scaledInputs,
      canvasWidth,
      canvasHeight,
    )

    // 5. Build ClusterGeometry for each source
    const geometries: ClusterGeometry[] = sources.map((source) => {
      const scaled = scaledInputs.find((c) => c.id === source.id)!
      const pos = positions.get(source.id) ?? { x: 0, y: 0 }

      // Compute initial member angles (rotationOffset = 0 for initial layout)
      // Reserve an extra slot for the add button so all items are evenly spaced
      const memberAngles = computeMemberAngles(
        source.memberIds,
        0,
        source.memberIds.length + 1,
      )

      return {
        clusterId: source.id,
        cx: pos.x,
        cy: pos.y,
        ringRadius: scaled.ringRadius,
        outerRadius: scaled.outerRadius,
        memberAngles,
      }
    })

    return geometries
  }, [sources, canvasWidth, canvasHeight])
}
