import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { cn } from '../../lib/utils'
import type { ClusterSource, TeamMember } from '../../mock/fixtures/types'
import { BUBBLE_DIAMETER, computeMemberAngles } from './clusterGeometry'
import { GESTURE_THRESHOLD_PX, classifyPointerGesture, computeTangentAtAngle } from './gestureClassifier'
import { useClusterLayout } from './useClusterLayout'
import { useClusterPhysics, type ViewportTransform } from './useClusterPhysics'
import { buildMemberClusterMap, computeGenericCrossLinks } from './groupingLogic'
import { getCrossLinkEndpoints } from './crossLinkUtils'
import { MemberBubble } from './MemberBubble'
import { ClusterCenter } from './ClusterCenter'
import { CrossClusterLink } from './CrossClusterLink'
import { ZoomButton } from './ZoomButton'
import { HoverCard } from './HoverCard'
import { MemberCard } from './MemberCard'
import { DetailPanel } from './DetailPanel'

// ── Viewport zoom bounds ────────────────────────────────────────────────────

const ZOOM_MIN = 0.25
const ZOOM_MAX = 4
const ZOOM_STEP = 0.25
const WHEEL_ZOOM_FACTOR = 1.12

export interface MemberGraphProps {
  /** The clusters to render — one synthetic cluster, a project-scoped cluster, or N grouping-derived clusters (see design.md). */
  clusters: ClusterSource[]
  /** Full member roster used to resolve `ClusterSource.memberIds` to `TeamMember` records. */
  members: TeamMember[]
  /** Invoked when a Member_Bubble is tapped (not dragged). */
  onMemberActivate?: (memberId: string) => void
  /** Invoked when a cluster's center — or its ring's add-member button — is tapped (not dragged). */
  onClusterActivate?: (clusterId: string) => void
  /** Members currently selected (e.g. Team_Selection_Step) — full opacity/saturation regardless of `suggestedMemberIds`. */
  selectedMemberIds?: Set<string>
  /** Members AI-suggested for the current selection context — dimmed unless also selected. */
  suggestedMemberIds?: Set<string>
  /** The signed-in user's member id, highlighted with a persistent outline. */
  currentUserId?: string
  className?: string
}

interface ActiveDetail {
  type: 'member' | 'cluster'
  id: string
  anchorRect: DOMRect
}

interface HoverState {
  clusterId: string
  memberId: string
}

/**
 * MemberGraph — the public, shared cluster/physics component reused by
 * Team_Selection_Step (wizard step 3), Project_Detail's Team tab, and the
 * standalone Team_Page. Each call site passes a different `clusters` array
 * into this same component (Requirement: Member_Graph/Cluster_Graph shared
 * surface).
 *
 * Composition:
 * - `useClusterLayout` (ported from the demo) computes each cluster's ring
 *   radius (reserving an extra ring slot for the add-member button so
 *   members stay evenly spaced), evenly-spaced base member angles, and
 *   circle-packed center positions — shrinking every cluster uniformly via
 *   `computeScaleFactor` when their combined area would exceed the canvas.
 * - `useClusterPhysics` (composing `useClusterMomentum`/`useRingRotation`/
 *   `usePhysicsLoop`/`useProvisionalOffset`) drives cluster drag/flick
 *   momentum (Req 33.2) and ring-rotation flick momentum (Req 33.3) on top
 *   of that initial layout.
 * - A pan/zoom viewport (wheel, drag, pinch, and +/−/⊙ controls) transforms
 *   a "world" div that contains the clusters and the cross-cluster-link SVG
 *   layer, matching the demo's `ClusterCanvas`. Cluster drag and ring
 *   rotation both read/write through the same `viewportTransformRef`, so
 *   dragging/rotating stays correct at any zoom level.
 * - `gestureClassifier.ts` (`GESTURE_THRESHOLD_PX` / `classifyPointerGesture`)
 *   distinguishes a tap (open `DetailPanel`, fire the activate callback)
 *   from a drag/rotation on cluster centers, Member_Bubbles, and the
 *   per-cluster add-member button (Req 33.4, 33.5).
 * - Hovering a Member_Bubble dims every cluster that doesn't contain that
 *   member, highlights any cross-cluster links for that member (drawn
 *   between same-person bubbles across clusters, e.g. Req 5.3/6.3-equivalent
 *   for this repo's project/client grouping modes), and shows a floating
 *   `MemberCard` via `HoverCard`.
 * - A single `activeDetail` state value (never an array) backs the one
 *   `<DetailPanel>` rendered here, satisfying "at most one open, always the
 *   latest" (Req 33.6, 33.7, 24.4 / Property 56) — see DetailPanel.tsx's
 *   architecture note.
 */
export function MemberGraph({
  clusters,
  members,
  onMemberActivate,
  onClusterActivate,
  selectedMemberIds,
  suggestedMemberIds,
  currentUserId,
  className,
}: MemberGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  // ── Viewport (pan + zoom) state ──────────────────────────────────────────
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 })
  const [viewport, setViewport] = useState<ViewportTransform>({ panX: 0, panY: 0, zoom: 1 })
  const viewportTransformRef = useRef<ViewportTransform>(viewport)
  const updateViewport = useCallback((next: ViewportTransform) => {
    viewportTransformRef.current = next
    setViewport(next)
  }, [])

  const [activeDetail, setActiveDetail] = useState<ActiveDetail | null>(null)
  const [hovered, setHovered] = useState<HoverState | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  const memberIndex = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const clusterIndex = useMemo(() => new Map(clusters.map((c) => [c.id, c])), [clusters])

  // ── Layout + Physics (only once the container has a real size) ──────────
  const layout = useClusterLayout(clusters, viewportSize.w, viewportSize.h)
  const physics = useClusterPhysics(layout, viewportTransformRef, containerRef)

  // ── Measure container size; center the viewport on first measurement ────
  const initializedRef = useRef(false)
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const w = el.clientWidth
    const h = el.clientHeight
    if (w > 0 && h > 0 && !initializedRef.current) {
      initializedRef.current = true
      setViewportSize({ w, h })
      updateViewport({ panX: w / 2, panY: h / 2, zoom: 1 })
    }
  }, [updateViewport])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width)
      const h = Math.round(entry.contentRect.height)
      if (w <= 0 || h <= 0) return
      setViewportSize({ w, h })
      if (!initializedRef.current) {
        initializedRef.current = true
        updateViewport({ panX: w / 2, panY: h / 2, zoom: 1 })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateViewport])

  // ── Auto-fit once, after layout + initial positions are ready ───────────
  const autoFitAppliedRef = useRef(false)
  useEffect(() => {
    if (autoFitAppliedRef.current) return
    if (viewportSize.w === 0 || viewportSize.h === 0 || layout.length === 0) return

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const geo of layout) {
      const pos = physics.clusterPositions.get(geo.clusterId)
      if (!pos) continue
      minX = Math.min(minX, pos.x - geo.outerRadius)
      maxX = Math.max(maxX, pos.x + geo.outerRadius)
      minY = Math.min(minY, pos.y - geo.outerRadius)
      maxY = Math.max(maxY, pos.y + geo.outerRadius)
    }
    if (!isFinite(minX)) return

    const PADDING = 20
    const contentW = maxX - minX + PADDING * 2
    const contentH = maxY - minY + PADDING * 2
    const fitZoomX = viewportSize.w / contentW
    const fitZoomY = viewportSize.h / contentH
    const fitZoom = Math.min(1, Math.min(fitZoomX, fitZoomY))

    const centerWorldX = (minX + maxX) / 2
    const centerWorldY = (minY + maxY) / 2
    const panX = viewportSize.w / 2 - centerWorldX * fitZoom
    const panY = viewportSize.h / 2 - centerWorldY * fitZoom

    autoFitAppliedRef.current = true
    requestAnimationFrame(() => updateViewport({ panX, panY, zoom: fitZoom }))
  }, [viewportSize, layout, physics.clusterPositions, updateViewport])

  // ── Pan (single pointer) ─────────────────────────────────────────────────
  const singlePointerCleanupRef = useRef<(() => void) | null>(null)

  const handlePanStart = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      const startX = e.clientX
      const startY = e.clientY
      const { panX: ox, panY: oy, zoom } = viewportTransformRef.current
      setIsPanning(true)

      const move = (ev: PointerEvent) => {
        updateViewport({ panX: ox + (ev.clientX - startX), panY: oy + (ev.clientY - startY), zoom })
      }
      const up = () => {
        setIsPanning(false)
        singlePointerCleanupRef.current = null
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
      }
      singlePointerCleanupRef.current = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    },
    [updateViewport],
  )

  // ── Pinch-to-zoom (2 pointers) ───────────────────────────────────────────
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchStateRef = useRef<{
    initialDistance: number
    initialZoom: number
    lastMidpoint: { x: number; y: number }
  } | null>(null)

  const handleContainerPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (activePointersRef.current.size === 2) {
        if (singlePointerCleanupRef.current) {
          singlePointerCleanupRef.current()
          singlePointerCleanupRef.current = null
        }
        setIsPanning(true)
        const pts = Array.from(activePointersRef.current.values())
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        pinchStateRef.current = {
          initialDistance: dist,
          initialZoom: viewportTransformRef.current.zoom,
          lastMidpoint: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
        }
      } else if (activePointersRef.current.size === 1) {
        handlePanStart(e)
      }
    },
    [handlePanStart],
  )

  const handleContainerPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activePointersRef.current.has(e.pointerId)) return
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (activePointersRef.current.size === 2 && pinchStateRef.current) {
        const pts = Array.from(activePointersRef.current.values())
        const currentDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        const currentMidpoint = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
        const { initialDistance, initialZoom, lastMidpoint } = pinchStateRef.current

        const rawZoom = initialZoom * (currentDistance / initialDistance)
        const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, rawZoom))

        const container = containerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const cx = currentMidpoint.x - rect.left
        const cy = currentMidpoint.y - rect.top

        const { panX, panY, zoom: oldZoom } = viewportTransformRef.current
        const wx = (cx - panX) / oldZoom
        const wy = (cy - panY) / oldZoom

        let newPanX = cx - wx * newZoom
        let newPanY = cy - wy * newZoom
        newPanX += currentMidpoint.x - lastMidpoint.x
        newPanY += currentMidpoint.y - lastMidpoint.y

        updateViewport({ panX: newPanX, panY: newPanY, zoom: newZoom })
        pinchStateRef.current.lastMidpoint = currentMidpoint
      }
    },
    [updateViewport],
  )

  const handleContainerPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId)
    if (activePointersRef.current.size < 2) {
      pinchStateRef.current = null
      if (activePointersRef.current.size === 0) setIsPanning(false)
    }
  }, [])

  // ── Wheel zoom (native, non-passive so preventDefault stops page pinch-zoom) ─
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const container = containerRef.current
      if (!container) return
      const { panX, panY, zoom } = viewportTransformRef.current
      const factor = e.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * factor))
      const rect = container.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const wx = (cx - panX) / zoom
      const wy = (cy - panY) / zoom
      updateViewport({ panX: cx - wx * newZoom, panY: cy - wy * newZoom, zoom: newZoom })
    },
    [updateViewport],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // ── Zoom controls ─────────────────────────────────────────────────────────
  const zoomBy = useCallback(
    (delta: number) => {
      const { panX, panY, zoom } = viewportTransformRef.current
      const nz = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom + delta))
      const cx = viewportSize.w / 2
      const cy = viewportSize.h / 2
      const wx = (cx - panX) / zoom
      const wy = (cy - panY) / zoom
      updateViewport({ panX: cx - wx * nz, panY: cy - wy * nz, zoom: nz })
    },
    [viewportSize, updateViewport],
  )
  const zoomIn = useCallback(() => zoomBy(ZOOM_STEP), [zoomBy])
  const zoomOut = useCallback(() => zoomBy(-ZOOM_STEP), [zoomBy])
  const resetView = useCallback(
    () => updateViewport({ panX: viewportSize.w / 2, panY: viewportSize.h / 2, zoom: 1 }),
    [viewportSize, updateViewport],
  )

  // ── Cross-cluster links (any member appearing in 2+ of the current clusters) ─
  const memberClusterMap = useMemo(() => buildMemberClusterMap(clusters), [clusters])
  const crossLinks = useMemo(() => computeGenericCrossLinks(memberClusterMap), [memberClusterMap])
  const memberAnglesMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>()
    for (const geo of layout) map.set(geo.clusterId, geo.memberAngles)
    return map
  }, [layout])
  const ringRadiiMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const geo of layout) map.set(geo.clusterId, geo.ringRadius)
    return map
  }, [layout])

  // ── Hover: dimming + cross-link highlight + HoverCard ────────────────────
  const handleMemberHoverEnter = useCallback((clusterId: string, memberId: string) => {
    setHovered({ clusterId, memberId })
  }, [])
  const handleMemberHoverLeave = useCallback(() => setHovered(null), [])

  const isClusterDimmed = useCallback(
    (clusterId: string): boolean => {
      if (!hovered) return false
      const source = clusterIndex.get(clusterId)
      return !source?.memberIds.includes(hovered.memberId)
    },
    [hovered, clusterIndex],
  )

  const hoverCard = useMemo(() => {
    if (!hovered) return null
    const member = memberIndex.get(hovered.memberId)
    if (!member) return null
    const geo = layout.find((g) => g.clusterId === hovered.clusterId)
    if (!geo) return null
    const clusterPos = physics.clusterPositions.get(hovered.clusterId)
    if (!clusterPos) return null
    const baseAngle = geo.memberAngles.get(hovered.memberId)
    if (baseAngle === undefined) return null
    const rotOffset = physics.ringOffsets.get(hovered.clusterId) ?? 0
    const angle = baseAngle + rotOffset
    const worldX = clusterPos.x + Math.cos(angle) * geo.ringRadius
    const worldY = clusterPos.y + Math.sin(angle) * geo.ringRadius

    const vx = worldX * viewport.zoom + viewport.panX
    const vy = worldY * viewport.zoom + viewport.panY
    const memberClusters = (memberClusterMap.get(member.id) ?? [])
      .map((id) => clusterIndex.get(id))
      .filter((c): c is ClusterSource => c !== undefined)
      .map((c) => ({ id: c.id, label: c.label, color: c.color }))

    return { x: vx, y: vy, radius: (BUBBLE_DIAMETER / 2) * viewport.zoom, member, memberClusters }
  }, [hovered, memberIndex, layout, physics.clusterPositions, physics.ringOffsets, viewport, memberClusterMap, clusterIndex])

  // ── Gesture routing: cluster center → drag; member bubble → drag/rotate; add-button → drag/rotate ─
  const handleClusterPointerDown = useCallback(
    (cluster: ClusterSource) => (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      const startX = e.clientX
      const startY = e.clientY
      const target = e.currentTarget

      physics.startClusterDrag(cluster.id, e)

      const handlePointerUp = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        if (Math.hypot(dx, dy) < GESTURE_THRESHOLD_PX) {
          setActiveDetail({ type: 'cluster', id: cluster.id, anchorRect: target.getBoundingClientRect() })
          onClusterActivate?.(cluster.id)
        }
        window.removeEventListener('pointerup', handlePointerUp)
      }
      window.addEventListener('pointerup', handlePointerUp)
    },
    [physics, onClusterActivate],
  )

  const handleBubblePointerDown = useCallback(
    (cluster: ClusterSource, member: TeamMember, angle: number) => (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      const startX = e.clientX
      const startY = e.clientY
      const target = e.currentTarget
      const tangent = computeTangentAtAngle(angle)

      physics.startRingRotation(cluster.id, member.id, e)

      const handlePointerUp = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        if (classifyPointerGesture(dx, dy, tangent) === 'tap') {
          setActiveDetail({ type: 'member', id: member.id, anchorRect: target.getBoundingClientRect() })
          onMemberActivate?.(member.id)
        }
        window.removeEventListener('pointerup', handlePointerUp)
      }
      window.addEventListener('pointerup', handlePointerUp)
    },
    [physics, onMemberActivate],
  )

  const handleAddPointerDown = useCallback(
    (cluster: ClusterSource, angle: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      const startX = e.clientX
      const startY = e.clientY
      const target = e.currentTarget
      const tangent = computeTangentAtAngle(angle)

      // The add-button occupies the last ring slot, so it uses the same
      // drag/rotate physics as a member bubble (keyed by a sentinel id).
      physics.startRingRotation(cluster.id, '__add__', e)

      const handlePointerUp = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        if (classifyPointerGesture(dx, dy, tangent) === 'tap') {
          setActiveDetail({ type: 'cluster', id: cluster.id, anchorRect: target.getBoundingClientRect() })
          onClusterActivate?.(cluster.id)
        }
        window.removeEventListener('pointerup', handlePointerUp)
      }
      window.addEventListener('pointerup', handlePointerUp)
    },
    [physics, onClusterActivate],
  )

  const activeMember = activeDetail?.type === 'member' ? memberIndex.get(activeDetail.id) : undefined
  const activeCluster = activeDetail?.type === 'cluster' ? clusterIndex.get(activeDetail.id) : undefined

  const detailTitle = activeMember
    ? `${activeMember.name} ${activeMember.surname}`
    : activeCluster
      ? activeCluster.label
      : ''

  const detailBody = activeMember
    ? `${activeMember.role} · ${activeMember.workload}% workload`
    : activeCluster
      ? `${activeCluster.memberIds.length} member${activeCluster.memberIds.length === 1 ? '' : 's'}`
      : undefined

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative min-h-[20rem] w-full touch-none select-none overflow-hidden overscroll-contain rounded-2xl',
        isPanning ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onPointerCancel={handleContainerPointerUp}
    >
      {/* World layer — everything inside is in world-space coordinates, transformed by pan/zoom */}
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: '0 0',
          transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
        }}
      >
        {/* Cross-cluster links layer — behind clusters, only drawn for the hovered member */}
        <svg className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible" style={{ zIndex: 1 }}>
          {hovered !== null &&
            crossLinks.map((link) => {
              if (link.memberId !== hovered.memberId) return null
              if (link.fromClusterId !== hovered.clusterId && link.toClusterId !== hovered.clusterId) return null
              const endpoints = getCrossLinkEndpoints(link, physics.clusterPositions, physics.ringOffsets, memberAnglesMap, ringRadiiMap)
              if (!endpoints) return null
              const key = `${link.memberId}-${link.fromClusterId}-${link.toClusterId}`
              return (
                <CrossClusterLink
                  key={key}
                  fromX={endpoints.fromX}
                  fromY={endpoints.fromY}
                  toX={endpoints.toX}
                  toY={endpoints.toY}
                  highlighted
                  dimmed={false}
                />
              )
            })}
        </svg>

        {clusters.map((cluster) => {
          const geo = layout.find((g) => g.clusterId === cluster.id)
          if (!geo) return null

          const position = physics.getClusterPosition(cluster.id) ?? physics.clusterPositions.get(cluster.id) ?? { x: 0, y: 0 }
          const rotationOffset = physics.ringOffsets.get(cluster.id) ?? 0
          const totalSlots = cluster.memberIds.length + 1
          const angles = computeMemberAngles(cluster.memberIds, rotationOffset, totalSlots)
          const addAngle = (cluster.memberIds.length / totalSlots) * 2 * Math.PI + rotationOffset
          const dimmed = isClusterDimmed(cluster.id)
          const dragging = physics.isDragging(cluster.id) || physics.isRotating(cluster.id)

          return (
            <div
              key={cluster.id}
              className="absolute left-0 top-0"
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                zIndex: dragging ? 10 : 2,
                opacity: dimmed ? 0.3 : 1,
                transition: 'opacity 150ms ease',
              }}
            >
              <div
                role="button"
                tabIndex={0}
                aria-label={cluster.label}
                className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none"
                onPointerDown={handleClusterPointerDown(cluster)}
              >
                <ClusterCenter label={cluster.label} imageUrl={cluster.imageUrl} hasAlert={cluster.hasAlert} />
              </div>

              {cluster.memberIds.map((memberId) => {
                const member = memberIndex.get(memberId)
                if (!member) return null
                const angle = angles.get(memberId) ?? 0
                const x = Math.cos(angle) * geo.ringRadius
                const y = Math.sin(angle) * geo.ringRadius
                return (
                  <MemberBubble
                    key={memberId}
                    member={member}
                    x={x}
                    y={y}
                    isCurrentUser={member.id === currentUserId}
                    isHovered={hovered?.clusterId === cluster.id && hovered.memberId === member.id}
                    selected={selectedMemberIds?.has(member.id)}
                    suggested={suggestedMemberIds?.has(member.id)}
                    onPointerDown={handleBubblePointerDown(cluster, member, angle)}
                    onHoverEnter={() => handleMemberHoverEnter(cluster.id, member.id)}
                    onHoverLeave={handleMemberHoverLeave}
                  />
                )
              })}

              {/* Add-member button — evenly spaced on the ring after the last member */}
              <button
                type="button"
                aria-label={`Add member to ${cluster.label}`}
                className="absolute flex items-center justify-center rounded-full border-none bg-indigo-950 text-sm font-semibold leading-none text-white shadow-[0_2px_6px_rgba(45,43,85,0.3)]"
                style={{
                  left: Math.cos(addAngle) * geo.ringRadius,
                  top: Math.sin(addAngle) * geo.ringRadius,
                  width: BUBBLE_DIAMETER * 0.7,
                  height: BUBBLE_DIAMETER * 0.7,
                  transform: 'translate(-50%, -50%)',
                }}
                onPointerDown={handleAddPointerDown(cluster, addAngle)}
              >
                +
              </button>
            </div>
          )
        })}
      </div>
      {/* End world layer */}

      {/* Hover card — viewport-space overlay, stays constant size regardless of zoom */}
      {hoverCard && (
        <HoverCard x={hoverCard.x} y={hoverCard.y} nodeRadius={hoverCard.radius} containerW={viewportSize.w} containerH={viewportSize.h}>
          <MemberCard member={hoverCard.member} clusters={hoverCard.memberClusters} />
        </HoverCard>
      )}

      {/* Zoom / reset controls */}
      <div className="absolute bottom-3 right-3 z-20 flex gap-1">
        <ZoomButton title="Zoom in" onClick={zoomIn}>
          +
        </ZoomButton>
        <ZoomButton title="Zoom out" onClick={zoomOut}>
          −
        </ZoomButton>
        <ZoomButton title="Reset view" onClick={resetView}>
          ⊙
        </ZoomButton>
      </div>

      <DetailPanel
        open={activeDetail !== null}
        anchorRect={activeDetail?.anchorRect ?? null}
        title={detailTitle}
        body={detailBody}
        onDismiss={() => setActiveDetail(null)}
      />
    </div>
  )
}
