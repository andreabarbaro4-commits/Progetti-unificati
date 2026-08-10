import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import { MemberGraph } from '../../../components/MemberGraph/MemberGraph'
import type { Project, TeamMember, Alert, ClusterSource } from '../../../mock/fixtures/types'

export interface TeamTabProps {
  /** The current project — used to scope the graph to `project.members`. */
  project: Project
}

/**
 * Project Detail — Team Tab (Requirements 24.1–24.4)
 *
 * Renders the shared `MemberGraph` component scoped exclusively to the
 * project's member list (one cluster containing `project.members`). Reuses
 * the overload-ring (≥85% workload) and alert-glow indicators already
 * built into the MemberGraph component. On member activation, displays
 * member detail via the shared `DetailPanel` inside `MemberGraph`.
 *
 * Property 39 governs correctness: the graph's bubble set must equal exactly
 * `project.members`, excluding every roster member not in that list.
 */
export function TeamTab({ project }: TeamTabProps) {
  // ── Fetch team members ────────────────────────────────────────────────────

  const { data: allMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ['team-members'],
    queryFn: () => apiClient.get<TeamMember[]>('/team-members'),
  })

  // Scope members to only those in this project (Req 24.1 / Property 39).
  const projectMembers = useMemo(
    () => allMembers.filter((m) => project.members.includes(m.id)),
    [allMembers, project.members],
  )

  // ── Fetch alerts for the project to determine alert-glow indicator ────────

  const { data: allAlerts = [] } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: () => apiClient.get<Alert[]>('/alerts'),
  })

  // Determine whether this project has at least one active alert (Req 24.3 / Property 41).
  const hasActiveAlert = useMemo(
    () =>
      allAlerts.some(
        (a) => a.projectId === project.id && !a.dismissed && !a.resolved,
      ),
    [allAlerts, project.id],
  )

  // ── Build a single ClusterSource scoped to this project's members ─────────

  const clusters: ClusterSource[] = useMemo(
    () => [
      {
        id: project.id,
        label: project.name,
        color: project.color ?? '#6366f1',
        memberIds: project.members,
        imageUrl: project.cover,
        hasAlert: hasActiveAlert,
      },
    ],
    [project, hasActiveAlert],
  )

  // ── Active member tracking (handled internally by MemberGraph's DetailPanel) ─

  const [_activeMemberId, setActiveMemberId] = useState<string | null>(null)

  function handleMemberActivate(memberId: string) {
    setActiveMemberId(memberId)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (projectMembers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-gray-500">No team members assigned to this project.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-800">Team</h2>
      <MemberGraph
        clusters={clusters}
        members={projectMembers}
        onMemberActivate={handleMemberActivate}
        className="min-h-[24rem] rounded-2xl border border-gray-100 bg-gray-50/50"
      />
    </div>
  )
}
