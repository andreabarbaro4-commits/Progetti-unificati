import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useAuth } from '../../features/auth/AuthProvider'
import { isMockMode } from '../../mock'
import { mockAuthUsers } from '../../mock/fixtures/authUsers'
import { cn } from '../../lib/utils'

const FALLBACK_ROLE = 'Team Member'

/**
 * Resolves the signed-in user's role/admin-status by matching `sub` against
 * the mock Auth0 profiles (Req 4.5). This repo has no role/isAdmin field on
 * the OIDC profile itself, so — in mock mode — we look the user up in the
 * same fixture the Admin Panel's read-only Users tab sources from
 * (`authUsers.ts`). Falls back to a generic label rather than crashing when
 * there's no match (e.g. real auth mode, or an unrecognized `sub`).
 */
function resolveRoleAndAdminStatus(sub: string | undefined): {
  role: string
  isAdmin: boolean
} {
  if (!sub || !isMockMode()) {
    return { role: FALLBACK_ROLE, isAdmin: false }
  }
  const match = mockAuthUsers.find((profile) => profile.id === sub)
  if (!match) {
    return { role: FALLBACK_ROLE, isAdmin: false }
  }
  return { role: match.role, isAdmin: match.isAdmin }
}

export interface ProfilePanelProps {
  /** Whether the panel is currently revealed. Renders nothing when false. */
  open: boolean
  /** Invoked to close the panel — on outside activation or after logout. */
  onClose: () => void
  className?: string
}

/**
 * ProfilePanel — the small floating panel revealed from `TopNavbar`'s profile
 * control (Req 4.5-4.7).
 *
 * Shows the signed-in user's name and role, an admin-management link when
 * the resolved profile is an admin, and a logout action. Dismisses itself
 * when the user activates anything outside its own DOM node (Req 4.6),
 * following the same click-outside pattern as `MemberGraph/DetailPanel.tsx`.
 */
export function ProfilePanel({ open, onClose, className }: ProfilePanelProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)

  const { role, isAdmin } = resolveRoleAndAdminStatus(user?.sub)

  // Click-outside dismissal (Req 4.6) — only attached while open, and only
  // after the panel has actually mounted, so the same activation that opened
  // the panel (the trigger button in TopNavbar) doesn't immediately close it.
  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open, onClose])

  if (!open) return null

  const handleAdminLink = () => {
    onClose()
    navigate('/admin')
  }

  const handleLogout = () => {
    onClose()
    void logout()
  }

  return (
    <div ref={panelRef} className="absolute right-0 top-full z-50 mt-2">
      <Card size="sm" className={cn('w-56 items-stretch gap-3 text-left', className)}>
        <div className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-slate-900">
            {user?.name || 'Signed-in user'}
          </span>
          <span className="truncate text-xs text-slate-500">{role}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {isAdmin && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full justify-center"
              onClick={handleAdminLink}
            >
              Admin panel
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      </Card>
    </div>
  )
}
