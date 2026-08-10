import type { TeamMember } from '../../mock/fixtures/types'
import { Avatar } from '../../components/ui/Avatar'
import { cn } from '../../lib/utils'
import { useWizardStore } from './useWizardStore'

export interface TeamListViewProps {
  /** Full list of team members to display in the list. */
  members: TeamMember[]
  /** IDs of members that the AI recommends for this project. */
  aiSuggestedIds: string[]
}

/**
 * Alternative view to the MemberGraph in TeamSelectionStep.
 *
 * Shows all team members as a list with:
 * - Selection checkbox (synced with useWizardStore.selectedMembers)
 * - Skill tags
 * - Workload indicator (visual bar with percentage)
 * - AI-suggestion indicator (highlights members the AI recommends)
 *
 * Each row uses Avatar for the member photo.
 */
export function TeamListView({ members, aiSuggestedIds }: TeamListViewProps) {
  const selectedMembers = useWizardStore((s) => s.selectedMembers)
  const toggleMember = useWizardStore((s) => s.toggleMember)

  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => {
        const isSelected = selectedMembers.includes(member.id)
        const isAiSuggested = aiSuggestedIds.includes(member.id)

        return (
          <label
            key={member.id}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 transition-colors cursor-pointer',
              isSelected
                ? 'border-indigo-400 bg-indigo-50/60'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            {/* Selection checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleMember(member.id)}
              className="h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              aria-label={`Select ${member.name} ${member.surname}`}
            />

            {/* Avatar */}
            <Avatar
              photoUrl={member.photoUrl}
              seed={`${member.name} ${member.surname}`}
              size="md"
              alt={`${member.name} ${member.surname}`}
            />

            {/* Member info */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-gray-900">
                  {member.name} {member.surname}
                </span>
                {isAiSuggested && <AiSuggestionBadge />}
              </div>

              {/* Skill tags */}
              <div className="flex flex-wrap gap-1">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[0.6875rem] font-medium text-gray-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Workload indicator */}
            <WorkloadIndicator workload={member.workload} />
          </label>
        )
      })}

      {members.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No team members available.
        </p>
      )}
    </div>
  )
}

/** Visual bar + percentage label for a member's current workload. */
function WorkloadIndicator({ workload }: { workload: number }) {
  const clamped = Math.max(0, Math.min(100, workload))
  const isOverloaded = clamped >= 85

  return (
    <div className="flex shrink-0 flex-col items-end gap-0.5">
      <span
        className={cn(
          'text-xs font-medium',
          isOverloaded ? 'text-red-600' : 'text-gray-500'
        )}
      >
        {clamped}%
      </span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isOverloaded ? 'bg-red-500' : clamped >= 60 ? 'bg-amber-400' : 'bg-green-400'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

/** Small badge indicating the AI recommends this member. */
function AiSuggestionBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-md bg-violet-100 px-1.5 py-0.5 text-[0.625rem] font-semibold text-violet-700">
      <svg
        className="h-3 w-3"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1zm4 8l.75 1.75L14.5 11.5l-1.75.75L12 14l-.75-1.75L9.5 11.5l1.75-.75L12 9z" />
      </svg>
      AI
    </span>
  )
}
