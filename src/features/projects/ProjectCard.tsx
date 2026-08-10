import type { KeyboardEvent, MouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HiBell, HiOutlinePencilSquare, HiOutlineEllipsisVertical, HiOutlineTrash, HiOutlineFolder } from 'react-icons/hi2'
import { cn } from '../../lib/utils'
import { formatCountBadge } from '../../lib/badge'
import { AvatarStack, type AvatarStackMember } from '../../components/ui/AvatarStack'
import type { Project, TeamMember, Alert } from '../../mock/fixtures/types'

/** Minimal member shape needed to build the AvatarStack. */
function toAvatarStackMember(member: TeamMember): AvatarStackMember {
  return { id: member.id, name: `${member.name} ${member.surname}`, photoUrl: member.photoUrl }
}

/** Lightens/darkens a hex color by `amount` (-1 to 1) for the cover gradient fallback. */
function shadeColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16)
  let r = (num >> 16) + Math.round(255 * amount)
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * amount)
  let b = (num & 0x0000ff) + Math.round(255 * amount)
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

const DEFAULT_COVER_COLOR = '#8B7FE8'

export interface ProjectCardProps {
  /** The project to display. */
  project: Project
  /** All team members (used to resolve member ids to names/photos). */
  teamMembers: TeamMember[]
  /** Active (non-dismissed, non-resolved) alerts for this project. */
  alerts: Alert[]
  /** Client name to display above the project title. */
  clientName?: string
  /** Called when the user activates the edit control. */
  onEdit?: (project: Project) => void
  /** Called when the user activates the delete control. */
  onDelete?: (project: Project) => void
  className?: string
}

/**
 * A single project card in the Projects_List grid.
 *
 * Displays a cover image (with color-tinted fallback), client name, project
 * title, description, a progress indicator, an AvatarStack with owner
 * distinction, and an alert-count badge.
 *
 * Click/tap/keyboard activation navigates to `/projects/:id` EXCEPT when the
 * activation target is an edit, delete, or menu control (Requirements 14.1–14.6).
 */
export function ProjectCard({
  project,
  teamMembers,
  alerts,
  clientName,
  onEdit,
  onDelete,
  className,
}: ProjectCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the overflow menu on outside click.
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: globalThis.MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // Resolve member ids to AvatarStackMember shapes
  const memberMap = new Map(teamMembers.map((m) => [m.id, m]))
  const projectMembers: AvatarStackMember[] = project.members
    .map((id) => memberMap.get(id))
    .filter((m): m is TeamMember => m !== undefined)
    .map(toAvatarStackMember)

  // Alert badge
  const activeAlerts = alerts.filter((a) => !a.dismissed && !a.resolved)
  const badgeText = formatCountBadge(activeAlerts.length)

  const coverColor = project.color ?? DEFAULT_COVER_COLOR

  // Navigation handler that excludes edit/delete/menu controls
  function handleCardActivation(e: MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    if (target.closest('[data-card-control]')) return
    navigate(`/projects/${project.id}`)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const target = e.target as HTMLElement
    if (target.closest('[data-card-control]')) return
    e.preventDefault()
    navigate(`/projects/${project.id}`)
  }

  return (
    <div
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500',
        activeAlerts.length > 0 && 'ring-2 ring-red-400',
        className,
      )}
      role="article"
      tabIndex={0}
      aria-label={`Project: ${project.name}`}
      onClick={handleCardActivation}
      onKeyDown={handleKeyDown}
    >
      {/* Cover image / color fallback */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={
          project.cover
            ? undefined
            : { background: `linear-gradient(135deg, ${coverColor}, ${shadeColor(coverColor, -0.15)})` }
        }
      >
        {project.cover ? (
          <img
            src={project.cover}
            alt={`${project.name} cover`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <HiOutlineFolder className="h-10 w-10 text-white/60" />
          </div>
        )}

        {/* Edit control, overlapping the top-left corner of the cover */}
        {onEdit && (
          <button
            type="button"
            data-card-control
            className="absolute left-2 top-2 inline-flex items-center justify-center rounded-full bg-white p-1.5 text-gray-600 shadow-sm hover:text-gray-900"
            aria-label={`Edit ${project.name}`}
            onClick={(e) => {
              e.stopPropagation()
              onEdit(project)
            }}
          >
            <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {/* Alert badge overlaid on cover */}
        {badgeText && (
          <span
            className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white shadow-sm"
            aria-label={`${activeAlerts.length} active alert${activeAlerts.length === 1 ? '' : 's'}`}
          >
            <HiBell className="h-3 w-3" aria-hidden="true" />
            {badgeText}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2.5">
        {/* Client name */}
        {clientName && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {clientName}
          </span>
        )}

        {/* Project title */}
        <h3 className="truncate text-sm font-bold uppercase text-gray-900">{project.name}</h3>

        {/* Description */}
        {(project.description || project.brief) && (
          <p className="line-clamp-2 text-xs leading-snug text-gray-500">
            {project.description ?? project.brief}
          </p>
        )}

        {/* Progress indicator (thin, unlabeled) */}
        <div
          className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-valuenow={project.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Project progress: ${project.progress}%`}
        >
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
          />
        </div>

        {/* Footer: AvatarStack + overflow menu */}
        <div className="mt-2 flex items-center justify-between">
          <AvatarStack
            members={projectMembers}
            ownerId={project.owner}
            max={5}
            size="sm"
          />

          {/* Overflow menu: Edit / Delete */}
          {(onEdit || onDelete) && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                data-card-control
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label={t('projects.project_options')}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen((prev) => !prev)
                }}
              >
                <HiOutlineEllipsisVertical className="h-5 w-5" aria-hidden="true" />
              </button>

              {menuOpen && (
                <div
                  data-card-control
                  role="menu"
                  className="absolute right-0 bottom-full z-20 mb-1 w-36 overflow-hidden rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black/5"
                >
                  {onEdit && (
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        onEdit(project)
                      }}
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" aria-hidden="true" />
                      {t('projects.edit_project')}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        onDelete(project)
                      }}
                    >
                      <HiOutlineTrash className="h-4 w-4" aria-hidden="true" />
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
