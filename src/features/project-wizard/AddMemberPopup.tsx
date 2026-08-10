import { useState, useRef, useEffect, useCallback } from 'react'
import { filterExact } from '../../lib/filter'
import { useWizardStore } from './useWizardStore'
import { Avatar } from '../../components/ui/Avatar'
import type { TeamMember } from '../../mock/fixtures/types'
import { cn } from '../../lib/utils'

export interface AddMemberPopupProps {
  /** Full list of team members available for selection. */
  members: TeamMember[]
  /** Controls visibility. */
  open: boolean
  /** Called when the popup should close (e.g. click outside, Escape). */
  onClose: () => void
  /** Optional extra classes for the popup container. */
  className?: string
}

/**
 * Popup/popover that lets users search and add team members to the wizard's
 * selection. Uses `filterExact` to filter members by name or skill tag
 * (case-insensitive). Already-selected members show a checkmark indicator.
 * Clicking a member toggles their selection in the wizard store.
 */
export function AddMemberPopup({ members, open, onClose, className }: AddMemberPopupProps) {
  const [query, setQuery] = useState('')
  const popupRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { selectedMembers, toggleMember } = useWizardStore()

  // Focus the search input when the popup opens
  useEffect(() => {
    if (open) {
      setQuery('')
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open])

  // Click-outside dismiss
  useEffect(() => {
    if (!open) return

    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  // Escape key dismiss
  useEffect(() => {
    if (!open) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleToggle = useCallback(
    (memberId: string) => {
      toggleMember(memberId)
    },
    [toggleMember]
  )

  if (!open) return null

  // Filter members by name or skill tag, case-insensitive
  const lowerQuery = query.trim().toLowerCase()
  const filteredMembers = lowerQuery
    ? filterExact(members, (member) => {
        const fullName = `${member.name} ${member.surname}`.toLowerCase()
        const nameMatch = fullName.includes(lowerQuery)
        const skillMatch = member.skills.some((skill) =>
          skill.toLowerCase().includes(lowerQuery)
        )
        return nameMatch || skillMatch
      })
    : members

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-label="Add team member"
      className={cn(
        'absolute z-50 w-72 rounded-2xl bg-white shadow-[0px_4px_40px_0px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden',
        className
      )}
    >
      {/* Search input */}
      <div className="p-3 border-b border-gray-100">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by name or skill..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          aria-label="Search members"
        />
      </div>

      {/* Member list */}
      <ul className="max-h-64 overflow-y-auto p-2" role="listbox" aria-label="Available members">
        {filteredMembers.length === 0 ? (
          <li className="px-3 py-4 text-center text-sm text-gray-400">
            No members found
          </li>
        ) : (
          filteredMembers.map((member) => {
            const isSelected = selectedMembers.includes(member.id)
            return (
              <li
                key={member.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleToggle(member.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors',
                  isSelected
                    ? 'bg-indigo-50'
                    : 'hover:bg-gray-50'
                )}
              >
                <Avatar
                  seed={`${member.name} ${member.surname}`}
                  photoUrl={member.photoUrl}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.name} {member.surname}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {member.skills.slice(0, 3).join(', ')}
                  </p>
                </div>
                {isSelected && (
                  <span className="shrink-0 text-indigo-600" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
