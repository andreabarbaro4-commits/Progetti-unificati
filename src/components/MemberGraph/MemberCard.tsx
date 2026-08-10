// Hover-card content for a Member_Bubble — shown inside `HoverCard` while the
// pointer hovers a member (as opposed to `DetailPanel`, which opens on tap).
// Ported from ../demo/src/components/forceGraph/MemberCard.tsx, restyled with
// this repo's `Avatar`/`Badge` components instead of inline styles.
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'
import type { TeamMember } from '../../mock/fixtures/types'

/** Workload threshold at/above which a member is considered overloaded (matches MemberBubble.tsx). */
const OVERLOAD_THRESHOLD = 85

export interface MemberCardClusterRef {
  id: string
  label: string
  color: string
}

export interface MemberCardProps {
  member: TeamMember
  /** The clusters (projects/units/clients) this member currently belongs to, for the "assignments" list. */
  clusters: MemberCardClusterRef[]
}

export function MemberCard({ member, clusters }: MemberCardProps) {
  const overloaded = member.workload >= OVERLOAD_THRESHOLD

  return (
    <>
      <div className="mb-2.5 flex items-center gap-2">
        <Avatar
          photoUrl={member.photoUrl}
          seed={`${member.name} ${member.surname}`.trim() || member.id}
          alt={`${member.name} ${member.surname}`}
          size="md"
        />
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900">
            {member.name} {member.surname}
          </div>
          <div className="text-xs text-slate-500">{member.role}</div>
        </div>
      </div>

      <div className="mb-2.5 flex items-center gap-1.5">
        <span
          className={member.available ? 'h-2 w-2 shrink-0 rounded-full bg-green-500' : 'h-2 w-2 shrink-0 rounded-full bg-slate-300'}
        />
        <span className={member.available ? 'text-xs font-semibold text-green-700' : 'text-xs font-semibold text-slate-500'}>
          {member.available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {overloaded && (
        <div className="mb-2.5 flex items-center gap-1.5 rounded-lg bg-red-50 px-2 py-1.5 text-xs font-bold text-red-700">
          <span aria-hidden="true">⚠️</span>
          Overloaded ({member.workload}%)
        </div>
      )}

      {member.skills.length > 0 && (
        <div className={cn('flex flex-wrap gap-1', clusters.length > 0 && 'mb-2.5')}>
          {member.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} size="sm" className="cursor-default border-none bg-indigo-50 text-indigo-700">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      <div className="border-t border-slate-100 pt-2">
        <div className="mb-1 text-xs text-slate-400">
          {clusters.length > 0 ? 'Projects' : 'No project assigned'}
        </div>
        {clusters.map((cluster) => (
          <div key={cluster.id} className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-700">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: cluster.color }} />
            <span className="truncate">{cluster.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}
