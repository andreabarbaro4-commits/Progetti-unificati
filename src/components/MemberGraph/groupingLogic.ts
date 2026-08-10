// Pure grouping utilities for the cluster layout, ported from
// ../demo/src/pages/TeamPage/groupingLogic.ts and adapted to this repo's
// fixture types (src/mock/fixtures/types.ts), which differ from the demo's
// `@/types` in two ways relevant here:
//   - `TeamMember.organizationalUnit` is a single optional `string`, not a
//     `string[]`. Unit grouping is therefore a true partition (each member
//     belongs to exactly one unit cluster) rather than a multi-membership
//     grouping, so there is no unit-mode cross-link concept to port.
//   - `Project` has no `alert` field, so `hasAlert` (optional on
//     `ClusterSource`) is not computed here; callers that need it can set it
//     themselves from the `alerts` fixture.

import type { Alert, Client, ClusterSource, Project, TeamMember } from '../../mock/fixtures/types'

/**
 * Color palette for dynamically-assigned cluster colors (unit and client modes).
 * 8 distinct hues with good contrast on light/dark backgrounds.
 */
const CLUSTER_PALETTE = [
  '#4F46E5', // indigo
  '#0891B2', // cyan
  '#059669', // emerald
  '#D97706', // amber
  '#DC2626', // red
  '#7C3AED', // violet
  '#DB2777', // pink
  '#2563EB', // blue
] as const

/**
 * Builds a Map from member ID to TeamMember for O(1) lookups.
 * Use this to avoid repeated linear scans when resolving member references.
 *
 * @param members - Array of team members
 * @returns Map keyed by member ID
 */
export function buildMemberIndex(
  members: TeamMember[],
): Map<string, TeamMember> {
  return new Map(members.map((m) => [m.id, m]))
}

/**
 * Groups team members by project assignment.
 * One ClusterSource per project; memberIds are filtered to only include IDs
 * that exist in the members list (O(n) via index lookup).
 *
 * `imageUrl` is taken directly from `project.cover` when present. `hasAlert`
 * is computed from the optional `alerts` param — true when at least one
 * non-dismissed, non-resolved `Alert` references this project — matching the
 * demo's alert-glow indicator (Req 24.3 / Property 41). Both params are
 * optional so existing call sites that don't pass `alerts` keep working.
 */
export function groupByProject(
  projects: Project[],
  members: TeamMember[],
  alerts: Alert[] = [],
): ClusterSource[] {
  const memberIndex = buildMemberIndex(members)

  return projects.map((project) => ({
    id: project.id,
    label: project.name,
    color: project.color ?? CLUSTER_PALETTE[0],
    memberIds: project.members.filter((id) => memberIndex.has(id)),
    imageUrl: project.cover,
    hasAlert: alerts.some(
      (a) => a.projectId === project.id && !a.dismissed && !a.resolved,
    ),
  }))
}

/**
 * Groups team members by their `organizationalUnit` field.
 *
 * Unlike the demo (where `organizationalUnit` is a `string[]` and members can
 * belong to several units, requiring cross-links), this repo's `TeamMember`
 * has a single optional `organizationalUnit: string | undefined`. Unit
 * grouping is therefore a true partition: each member appears in exactly one
 * cluster — their unit, or "Unassigned" if the field is absent/blank.
 * Color is assigned from a palette indexed by cluster position.
 */
export function groupByUnit(members: TeamMember[]): ClusterSource[] {
  const unitMap = new Map<string, string[]>()

  for (const member of members) {
    const unit = member.organizationalUnit?.trim() || 'Unassigned'
    const existing = unitMap.get(unit)
    if (existing) {
      existing.push(member.id)
    } else {
      unitMap.set(unit, [member.id])
    }
  }

  return [...unitMap.entries()].map(([unit, memberIds], i) => ({
    id: unit,
    label: unit,
    color: CLUSTER_PALETTE[i % CLUSTER_PALETTE.length],
    memberIds,
  }))
}

/**
 * Groups team members by the client associated with their project assignments.
 *
 * Rules:
 * 1. Build map: clientId → Set<memberId> by iterating projects and their `members` arrays
 * 2. Only create clusters for clients that have at least one project with at least one assigned member
 * 3. Deduplicate: each member appears once per client cluster
 * 4. Exclude members with no project assignment (they won't appear in any project's members)
 * 5. label = client.name, color = consistent color, id = client.id
 */
export function groupByClient(
  projects: Project[],
  members: TeamMember[],
  clients: Client[],
): ClusterSource[] {
  const memberIndex = buildMemberIndex(members)
  const clientMemberMap = new Map<string, Set<string>>()

  for (const project of projects) {
    if (!project.clientId || project.members.length === 0) continue

    const existing = clientMemberMap.get(project.clientId)
    if (existing) {
      for (const memberId of project.members) {
        if (memberIndex.has(memberId)) existing.add(memberId)
      }
    } else {
      const validMembers = project.members.filter((id) => memberIndex.has(id))
      if (validMembers.length > 0) {
        clientMemberMap.set(project.clientId, new Set(validMembers))
      }
    }
  }

  const clientLookup = new Map(clients.map((c) => [c.id, c]))

  const clusters: ClusterSource[] = []
  let colorIndex = 0

  for (const [clientId, memberSet] of clientMemberMap) {
    if (memberSet.size === 0) continue

    const client = clientLookup.get(clientId)
    if (!client) continue

    clusters.push({
      id: client.id,
      label: client.name,
      color: CLUSTER_PALETTE[colorIndex % CLUSTER_PALETTE.length],
      memberIds: [...memberSet],
    })
    colorIndex++
  }

  return clusters
}

/**
 * A cross-link between two clusters for a specific member, generated when a
 * member is assigned to more than one cluster — either two projects (project
 * mode) or two clients (client mode, via projects belonging to different
 * clients).
 *
 * Note: the demo's `computeUnitCrossLinks` is not ported here — unit mode is
 * now a true partition (see `groupByUnit` above), so no member can ever
 * appear in more than one unit cluster and there is nothing to cross-link.
 */
export interface GenericCrossLink {
  memberId: string
  fromClusterId: string
  toClusterId: string
}

/**
 * Generates cross-cluster link pairs for members that appear in multiple
 * client clusters. For a member in N clusters, produces N*(N-1)/2 link pairs.
 *
 * Used for client grouping mode: when a member is assigned to projects
 * belonging to different clients, they appear in multiple client clusters
 * and links are generated between each pair.
 *
 * @param memberClusterMap - Maps memberId → list of clusterIds the member appears in
 * @returns Array of GenericCrossLink objects (one per cluster pair per member)
 */
export function computeGenericCrossLinks(
  memberClusterMap: Map<string, string[]>,
): GenericCrossLink[] {
  const links: GenericCrossLink[] = []

  for (const [memberId, clusterIds] of memberClusterMap) {
    if (clusterIds.length < 2) continue
    for (let i = 0; i < clusterIds.length; i++) {
      for (let j = i + 1; j < clusterIds.length; j++) {
        links.push({
          memberId,
          fromClusterId: clusterIds[i],
          toClusterId: clusterIds[j],
        })
      }
    }
  }

  return links
}

/**
 * Builds a generic memberId → clusterIds map directly from a `ClusterSource[]`
 * by scanning `memberIds`, regardless of grouping mode (project/unit/client)
 * or call site (Team_Page, Team_Tab, Team_Selection_Step). Any member who
 * appears in 2+ clusters produces cross-links between those clusters when
 * fed into `computeGenericCrossLinks`.
 *
 * This is the general-purpose counterpart to `buildClientCrossLinkMap` (which
 * only covers client mode from `Project[]`) — it works uniformly for every
 * `ClusterSource[]` shape, which is why `MemberGraph` uses this rather than a
 * mode-specific builder to derive cross-links.
 *
 * @param clusters - The cluster sources currently rendered
 * @returns Map of memberId → list of clusterIds the member appears in
 */
export function buildMemberClusterMap(
  clusters: ClusterSource[],
): Map<string, string[]> {
  const memberClusterSets = new Map<string, Set<string>>()

  for (const cluster of clusters) {
    for (const memberId of cluster.memberIds) {
      const existing = memberClusterSets.get(memberId)
      if (existing) {
        existing.add(cluster.id)
      } else {
        memberClusterSets.set(memberId, new Set([cluster.id]))
      }
    }
  }

  const result = new Map<string, string[]>()
  for (const [memberId, clusterSet] of memberClusterSets) {
    result.set(memberId, [...clusterSet])
  }

  return result
}

/**
 * Builds a memberClusterMap for client grouping mode.
 * Maps each member to the list of client cluster IDs they appear in.
 * A member appears in a client cluster if they're in at least one project
 * belonging to that client.
 *
 * @param projects - All projects
 * @returns Map of memberId → list of clientIds (cluster ids)
 */
export function buildClientCrossLinkMap(
  projects: Project[],
): Map<string, string[]> {
  const memberClientSets = new Map<string, Set<string>>()

  for (const project of projects) {
    if (!project.clientId) continue

    for (const memberId of project.members) {
      const existing = memberClientSets.get(memberId)
      if (existing) {
        existing.add(project.clientId)
      } else {
        memberClientSets.set(memberId, new Set([project.clientId]))
      }
    }
  }

  const result = new Map<string, string[]>()
  for (const [memberId, clientSet] of memberClientSets) {
    result.set(memberId, [...clientSet])
  }

  return result
}
