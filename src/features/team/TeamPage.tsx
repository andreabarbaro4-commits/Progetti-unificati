import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../lib/api-client'
import { cn } from '../../lib/utils'
import { MemberGraph } from '../../components/MemberGraph/MemberGraph'
import {
  groupByProject,
  groupByUnit,
  groupByClient,
} from '../../components/MemberGraph/groupingLogic'
import type {
  Alert,
  Client,
  GroupingMode,
  Project,
  TeamMember,
} from '../../mock/fixtures/types'

const GROUPING_OPTIONS: { value: GroupingMode; label: string }[] = [
  { value: 'project', label: 'By Project' },
  { value: 'organizationalUnit', label: 'By Unit' },
  { value: 'client', label: 'By Client' },
]

/** Workload threshold at/above which a member is considered overloaded (matches MemberBubble.tsx). */
const OVERLOAD_THRESHOLD = 85

/**
 * GroupingSelector — 3 mutually-exclusive modes, defaults to project (Req 32.1, 32.2).
 *
 * Restyled to match the demo's purple pill-in-pill treatment
 * (../demo/src/pages/TeamPage/GroupingSelector.tsx): an indigo-950 active pill
 * on a light indigo track, instead of the previous black/white styling.
 */
function GroupingSelector({
  value,
  onChange,
}: {
  value: GroupingMode
  onChange: (mode: GroupingMode) => void
}) {
  return (
    <div role="group" aria-label="Grouping" className="inline-flex gap-0.5 rounded-full bg-indigo-50 p-0.5">
      {GROUPING_OPTIONS.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              'cursor-pointer rounded-full border-none px-3.5 py-1.5 text-xs font-semibold leading-tight transition-colors',
              isActive ? 'bg-indigo-950 text-white' : 'bg-transparent text-gray-600 hover:bg-white/60',
            )}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * TeamPage — the authenticated Team screen at `/team` (Req 32, 33, 34).
 *
 * Fetches members/projects/clients/alerts, computes clusters via the
 * grouping logic utilities, passes them to the shared MemberGraph, and
 * re-renders on grouping mode change.
 */
export default function TeamPage() {
  const [grouping, setGrouping] = useState<GroupingMode>('project')

  const { data: members = [] } = useQuery<TeamMember[]>({
    queryKey: ['team-members'],
    queryFn: () => apiClient.get<TeamMember[]>('/team-members'),
  })

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<Project[]>('/projects'),
  })

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => apiClient.get<Client[]>('/clients'),
  })

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: () => apiClient.get<Alert[]>('/alerts'),
  })

  const clusters = useMemo(() => {
    switch (grouping) {
      case 'project':
        return groupByProject(projects, members, alerts)
      case 'organizationalUnit':
        return groupByUnit(members)
      case 'client':
        return groupByClient(projects, members, clients)
    }
  }, [grouping, projects, members, clients, alerts])

  // ── Header stats — assigned-to-a-project count and overloaded-member count ─
  const assignedCount = useMemo(
    () => members.filter((m) => projects.some((p) => p.members.includes(m.id))).length,
    [members, projects],
  )
  const overloadedCount = useMemo(
    () => members.filter((m) => m.workload >= OVERLOAD_THRESHOLD).length,
    [members],
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Team</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {members.length} {members.length === 1 ? 'member' : 'members'} · {assignedCount} on projects
            {overloadedCount > 0 && ` · ${overloadedCount} overloaded`}
          </p>
        </div>
        <GroupingSelector value={grouping} onChange={setGrouping} />
      </div>

      {members.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
          No team members found.
        </div>
      ) : (
        <div className="min-h-[28rem] rounded-2xl bg-white/60 p-4 shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)]">
          <MemberGraph
            clusters={clusters}
            members={members}
            className="h-full min-h-[26rem]"
          />
        </div>
      )}
    </div>
  )
}
