/**
 * Renders an SVG `<line>` element representing a cross-cluster link between
 * two Member_Bubbles of the same person across different clusters (projects,
 * or clients when a member spans multiple client-scoped projects).
 *
 * Ported from ../demo/src/pages/TeamPage/CrossClusterLink.tsx — same visual
 * states, using this repo's neutral slate tone instead of the demo's
 * lavender-grey (`#b0adc0`) so it reads consistently against this repo's
 * palette.
 *
 * Visual states:
 * - Default: opacity 0.18, thickness 1px
 * - Highlighted (connected member hovered): opacity 0.7, thickness 2px
 * - Dimmed (unrelated, during hover): opacity 0.08, thickness 1px
 */
export interface CrossClusterLinkProps {
  fromX: number
  fromY: number
  toX: number
  toY: number
  highlighted: boolean
  dimmed: boolean
}

export function CrossClusterLink({
  fromX,
  fromY,
  toX,
  toY,
  highlighted,
  dimmed,
}: CrossClusterLinkProps) {
  const opacity = highlighted ? 0.7 : dimmed ? 0.08 : 0.18
  const strokeWidth = highlighted ? 2 : 1

  return (
    <line
      x1={fromX}
      y1={fromY}
      x2={toX}
      y2={toY}
      stroke="#94a3b8"
      strokeWidth={strokeWidth}
      opacity={opacity}
      style={{ transition: 'opacity 150ms ease, stroke-width 150ms ease' }}
    />
  )
}
