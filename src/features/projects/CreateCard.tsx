import { useNavigate } from 'react-router-dom'
import { HiOutlinePlus } from 'react-icons/hi2'
import { cn } from '../../lib/utils'

export interface CreateCardProps {
  className?: string
}

/**
 * A "+" card that appears as the last item in the Projects List grid.
 * On click/tap/keyboard activation, navigates to /projects/new (Project Wizard first step).
 * Req 13.6: always-last creation affordance regardless of active client filter.
 */
export function CreateCard({ className }: CreateCardProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate('/projects/new')}
      aria-label="Create new project"
      className={cn(
        'flex min-h-[14rem] flex-1 flex-col items-center justify-center gap-2 rounded-3xl',
        'border-2 border-dashed border-gray-300 bg-white/60',
        'text-gray-400 transition-colors',
        'hover:border-gray-400 hover:text-gray-500',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'cursor-pointer',
        className
      )}
    >
      <HiOutlinePlus className="h-8 w-8" />
      <span className="text-sm font-medium">New project</span>
    </button>
  )
}
