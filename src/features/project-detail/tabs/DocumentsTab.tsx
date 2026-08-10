import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import { filterExact } from '../../../lib/filter'
import type { Document, Milestone, Task } from '../../../mock/fixtures/types'

/**
 * File-type icon labels for documents that don't have a ready thumbnail.
 * Matches the `DocumentType` union from fixture types.
 */
const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  doc: 'DOC',
  ppt: 'PPT',
  sheet: 'XLS',
  image: 'IMG',
  other: 'FILE',
}

export interface DocumentsTabProps {
  /** The project ID to fetch and filter documents for. */
  projectId: string
}

/**
 * Project Detail — Documents Tab (Req 25.1)
 *
 * A grid of project documents with filtering by milestone, task, or filename
 * using `filterExact`. Each document shows either a thumbnail image (when
 * available and ready) or a generic file-type icon fallback.
 */
export function DocumentsTab({ projectId }: DocumentsTabProps) {
  const [milestoneFilter, setMilestoneFilter] = useState<string>('')
  const [taskFilter, setTaskFilter] = useState<string>('')
  const [filenameFilter, setFilenameFilter] = useState<string>('')

  // ── Fetch documents ───────────────────────────────────────────────────────

  const { data: allDocuments = [] } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: () => apiClient.get<Document[]>('/documents'),
  })

  // ── Fetch milestones and tasks for filter dropdowns ───────────────────────

  const { data: allMilestones = [] } = useQuery<Milestone[]>({
    queryKey: ['milestones'],
    queryFn: () => apiClient.get<Milestone[]>('/milestones'),
  })

  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => apiClient.get<Task[]>('/tasks'),
  })

  // Scope milestones/tasks to this project for dropdown options
  const projectMilestones = useMemo(
    () => allMilestones.filter((ms) => ms.projectId === projectId),
    [allMilestones, projectId],
  )

  const projectTasks = useMemo(
    () => allTasks.filter((t) => t.projectId === projectId),
    [allTasks, projectId],
  )

  // ── Filter documents scoped to this project ───────────────────────────────

  const projectDocuments = useMemo(
    () => allDocuments.filter((doc) => doc.projectId === projectId),
    [allDocuments, projectId],
  )

  const filteredDocuments = useMemo(() => {
    let result = projectDocuments

    // Filter by milestone (document must be linked to that milestone)
    if (milestoneFilter) {
      result = filterExact(result, (doc) =>
        doc.milestoneIds?.includes(milestoneFilter) ?? false,
      )
    }

    // Filter by task (document must be linked to that task)
    if (taskFilter) {
      result = filterExact(result, (doc) =>
        doc.taskIds?.includes(taskFilter) ?? false,
      )
    }

    // Filter by filename (case-insensitive substring match)
    if (filenameFilter.trim()) {
      const search = filenameFilter.trim().toLowerCase()
      result = filterExact(result, (doc) =>
        doc.name.toLowerCase().includes(search),
      )
    }

    return result
  }, [projectDocuments, milestoneFilter, taskFilter, filenameFilter])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Milestone filter */}
        <select
          value={milestoneFilter}
          onChange={(e) => setMilestoneFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
          aria-label="Filter by milestone"
        >
          <option value="">All milestones</option>
          {projectMilestones.map((ms) => (
            <option key={ms.id} value={ms.id}>
              {ms.name}
            </option>
          ))}
        </select>

        {/* Task filter */}
        <select
          value={taskFilter}
          onChange={(e) => setTaskFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
          aria-label="Filter by task"
        >
          <option value="">All tasks</option>
          {projectTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Filename filter */}
        <input
          type="text"
          value={filenameFilter}
          onChange={(e) => setFilenameFilter(e.target.value)}
          placeholder="Search by filename…"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400"
          aria-label="Filter by filename"
        />
      </div>

      {/* Document grid */}
      {filteredDocuments.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          No documents match the current filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Document Card ─────────────────────────────────────────────────────────────

interface DocumentCardProps {
  document: Document
}

/**
 * A single document card: shows a thumbnail when available and ready,
 * otherwise a generic file-type icon fallback.
 */
function DocumentCard({ document }: DocumentCardProps) {
  const hasThumbnail =
    document.thumbnailKey && document.thumbnailStatus === 'ready'

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)]">
      {/* Thumbnail or file-type icon */}
      <div className="flex h-32 items-center justify-center bg-gray-50">
        {hasThumbnail ? (
          <img
            src={document.thumbnailKey}
            alt={`Thumbnail for ${document.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-200 text-sm font-bold uppercase text-gray-500"
            aria-label={`File type: ${document.fileType}`}
          >
            {FILE_TYPE_LABELS[document.fileType] ?? 'FILE'}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <p className="truncate text-sm font-medium text-gray-800">
          {document.name}
        </p>
        <p className="text-xs text-gray-500">
          Updated{' '}
          {new Date(document.updatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}
