import { useMemo } from 'react'
import { AvatarStack } from '../../../components/ui/AvatarStack'
import { truncateWithFallback } from '../../../lib/truncate'
import type { Project, Document, Economics, TeamMember } from '../../../mock/fixtures/types'

/** Maximum characters before the description gets truncated (Req 22.2). */
const DESCRIPTION_MAX_LENGTH = 500

/** Maximum avatars visible in the Overview tab's team section (Req 22.1). */
const AVATAR_CAP = 5

export interface OverviewTabProps {
  project: Project
  documents: Document[]
  economics?: Economics
  /** Full team-member records for members referenced by project.members. */
  members: TeamMember[]
}

/**
 * Project Detail — Overview Tab (Req 22.1–22.5)
 *
 * Shows a quick summary: team avatars (capped at 5), truncated description,
 * most-recently-updated document thumbnail, progress indicator, and a
 * conditional budget summary when economics data is present.
 */
export function OverviewTab({ project, documents, economics, members }: OverviewTabProps) {
  // Map member ids to AvatarStackMember shape
  const avatarMembers = useMemo(
    () =>
      members
        .filter((m) => project.members.includes(m.id))
        .map((m) => ({
          id: m.id,
          name: `${m.name} ${m.surname}`,
          photoUrl: m.photoUrl,
        })),
    [members, project.members]
  )

  // Description with truncation/fallback (Req 22.2)
  const displayedDescription = truncateWithFallback(
    project.description,
    DESCRIPTION_MAX_LENGTH,
    'No description has been provided.'
  )

  // Most-recently-updated document for thumbnail (Req 22.3)
  const projectDocuments = useMemo(
    () => documents.filter((doc) => doc.projectId === project.id),
    [documents, project.id]
  )

  const mostRecentDocument = useMemo(() => {
    if (projectDocuments.length === 0) return null
    return projectDocuments.reduce((latest, doc) =>
      new Date(doc.updatedAt) > new Date(latest.updatedAt) ? doc : latest
    )
  }, [projectDocuments])

  return (
    <div className="flex flex-col gap-6">
      {/* Team Members Section (Req 22.1) */}
      <section aria-labelledby="overview-team-heading">
        <h3 id="overview-team-heading" className="mb-2 text-sm font-medium text-gray-500">
          Team
        </h3>
        <AvatarStack
          members={avatarMembers}
          ownerId={project.owner}
          max={AVATAR_CAP}
          size="md"
        />
      </section>

      {/* Description Section (Req 22.2) */}
      <section aria-labelledby="overview-description-heading">
        <h3 id="overview-description-heading" className="mb-2 text-sm font-medium text-gray-500">
          Description
        </h3>
        <p className="text-sm leading-relaxed text-gray-700">{displayedDescription}</p>
      </section>

      {/* Document Thumbnail Section (Req 22.3) */}
      <section aria-labelledby="overview-document-heading">
        <h3 id="overview-document-heading" className="mb-2 text-sm font-medium text-gray-500">
          Recent Document
        </h3>
        {mostRecentDocument ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            {mostRecentDocument.thumbnailKey &&
            mostRecentDocument.thumbnailStatus === 'ready' ? (
              <img
                src={mostRecentDocument.thumbnailKey}
                alt={`Thumbnail for ${mostRecentDocument.name}`}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-xs font-medium uppercase text-gray-500"
                aria-label={`File type: ${mostRecentDocument.fileType}`}
              >
                {mostRecentDocument.fileType}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {mostRecentDocument.name}
              </p>
              <p className="text-xs text-gray-500">
                Updated{' '}
                {new Date(mostRecentDocument.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-gray-400">No documents have been added.</p>
        )}
      </section>

      {/* Progress Indicator (Req 22.4) */}
      <section aria-labelledby="overview-progress-heading">
        <h3 id="overview-progress-heading" className="mb-2 text-sm font-medium text-gray-500">
          Progress
        </h3>
        <div className="flex items-center gap-3">
          <div
            className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuenow={project.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Project progress: ${project.progress}%`}
          >
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${Math.min(Math.max(project.progress, 0), 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
        </div>
      </section>

      {/* Budget Summary (Req 22.5) — only when economics data is present */}
      {economics && (
        <section aria-labelledby="overview-budget-heading">
          <h3 id="overview-budget-heading" className="mb-2 text-sm font-medium text-gray-500">
            Budget
          </h3>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-gray-500">Allocated</p>
                <p className="text-lg font-semibold text-gray-800">
                  €{economics.totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Spent</p>
                <p className="text-lg font-semibold text-gray-800">
                  €{economics.currentCost.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div
                className="h-2 overflow-hidden rounded-full bg-gray-200"
                role="progressbar"
                aria-valuenow={economics.currentCost}
                aria-valuemin={0}
                aria-valuemax={economics.totalBudget}
                aria-label={`Budget usage: €${economics.currentCost.toLocaleString()} of €${economics.totalBudget.toLocaleString()}`}
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.min(
                      (economics.currentCost / economics.totalBudget) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
