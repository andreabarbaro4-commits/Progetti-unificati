import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { HiXMark } from 'react-icons/hi2'
import { Card } from '../ui/Card'
import { useAuth } from '../../features/auth/AuthProvider'
import { greetingFor } from '../../lib/greeting'
import { cn } from '../../lib/utils'

/** How long the bubble stays visible before auto-dismissing (Req 6.4). */
const AUTO_DISMISS_MS = 9000

/**
 * sessionStorage key used to guarantee the bubble renders at most once per
 * sign-in session (Req 6.6). sessionStorage is scoped to the current browsing-
 * context tab and is cleared when that tab closes, which correctly satisfies
 * "not on reload" and "not on subsequent route changes" within the same tab.
 * It does NOT share state across additional tabs opened during the same
 * sign-in session — doing so would require a durable, login-scoped session
 * identifier (e.g. issued by a real backend) that this mock-data-only
 * integration doesn't have; using `localStorage` instead would trade that
 * gap for a worse one (the bubble would never reappear on a genuinely new
 * sign-in until the flag is explicitly cleared on login, which no component
 * here is positioned to do). sessionStorage is the closest available
 * primitive and is treated as a documented, best-effort limitation for the
 * "additional tabs" clause.
 */
const SESSION_STORAGE_KEY = 'greeting-bubble-shown'

/**
 * Extracts a first name from an OIDC `name` claim, which is always a single
 * full-name string (no separate given/family name fields are available on
 * `OidcUser`). Returns undefined for empty/whitespace-only input so
 * `greetingFor` falls back to the salutation-only form (Req 6.7).
 */
function getFirstName(fullName: string | undefined): string | undefined {
  const trimmed = fullName?.trim()
  if (!trimmed) return undefined
  return trimmed.split(/\s+/)[0]
}

/**
 * GreetingBubble — the post-login speech bubble anchored above the
 * AI_Mascot_FAB (Req 6.3-6.7).
 *
 * Shows a time-of-day greeting with the user's first name once per sign-in
 * session, auto-dismisses after 9 seconds, and can be dismissed manually at
 * any time. Hidden entirely on the AI_Chat_Page (`/agent`).
 */
export function GreetingBubble() {
  const location = useLocation()
  const { user } = useAuth()

  // Decide once per mount whether this session has already shown the
  // bubble, and if not, claim it immediately so a re-mount from a route
  // change within the same tab session never shows it again (Req 6.6).
  const [shouldRender] = useState(() => {
    if (typeof window === 'undefined') return false
    const alreadyShown = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (alreadyShown) return false
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')
    return true
  })

  const [visible, setVisible] = useState(shouldRender)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!shouldRender) return

    timeoutRef.current = setTimeout(() => {
      setVisible(false)
    }, AUTO_DISMISS_MS)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
    // Intentionally run once — the auto-dismiss timer should not reset on
    // unrelated re-renders (e.g. auth state settling).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRender])

  // Hidden on the AI_Chat_Page (Req 6.6 / the AI Mascot FAB area is hidden
  // there entirely).
  if (location.pathname === '/agent') return null
  if (!shouldRender || !visible) return null

  const firstName = getFirstName(user?.name)
  const greeting = greetingFor(new Date().getHours(), firstName)

  const handleDismiss = () => {
    // Synchronous state update — trivially satisfies the 200ms dismiss
    // budget (Req 6.5) since there is no artificial delay.
    setVisible(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  return (
    <div
      className={cn(
        // Positioned just above the AI_Mascot_FAB (fixed bottom-20 right-4),
        // leaving a small gap between the bubble's bottom edge and the FAB.
        'fixed bottom-36 right-4 z-40 max-w-[16rem]',
      )}
      role="status"
    >
      <Card
        size="sm"
        className="relative w-auto max-w-[16rem] flex-row items-start gap-2 rounded-2xl pr-8 text-left shadow-[0px_4px_20px_0px_rgba(0,0,0,0.15)]"
      >
        <p className="text-sm text-slate-800">{greeting}</p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss greeting"
          className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <HiXMark className="h-3.5 w-3.5" />
        </button>
        {/* Speech-bubble pointer, aimed down toward the FAB */}
        <span
          aria-hidden="true"
          className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-white shadow-[2px_2px_4px_0px_rgba(0,0,0,0.06)]"
        />
      </Card>
    </div>
  )
}
