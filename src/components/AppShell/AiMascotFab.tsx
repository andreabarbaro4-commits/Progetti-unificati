import { useLocation, useNavigate } from 'react-router-dom'
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'
import { cn } from '../../lib/utils'

export interface AiMascotFabProps {
  className?: string
}

/**
 * AiMascotFab — the floating action button that opens the AI_Chat_Page
 * (Req 6.1-6.2).
 *
 * Demo's `AgentButton` renders an animated `.webp` mascot image that doesn't
 * exist in this repo (see design.md's App Shell rethink note). Until/unless
 * that asset is supplied, this is rebuilt as a plain circular icon button —
 * a visual simplification only; the required behavior (hide on `/agent`,
 * navigate to `/agent` on activation) is unchanged.
 *
 * Positioned above `BottomNavbar` (which occupies the bottom strip of every
 * authenticated route except `/agent`) with enough gap that the two never
 * overlap.
 */
export function AiMascotFab({ className }: AiMascotFabProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Req 6.1: renders on every authenticated route except AI_Chat_Page itself.
  if (location.pathname === '/agent') {
    return null
  }

  return (
    <button
      type="button"
      aria-label="Open AI assistant"
      onClick={() => navigate('/agent')}
      className={cn(
        'fixed right-4 bottom-24 z-40 flex h-14 w-14 items-center justify-center',
        'rounded-full border-none bg-indigo-600 text-white shadow-lg transition-colors',
        'hover:bg-indigo-700',
        className
      )}
    >
      <HiOutlineChatBubbleLeftRight className="h-6 w-6" aria-hidden="true" />
    </button>
  )
}
