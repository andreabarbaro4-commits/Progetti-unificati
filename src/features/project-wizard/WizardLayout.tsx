import { useEffect, useState, type ReactNode } from 'react'

const BREAKPOINT = 1024

/**
 * Determines whether the viewport matches the desktop split-panel breakpoint (≥1024px).
 * Uses window.matchMedia for accurate JS-level component mounting control.
 */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINT : false
  )

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINT}px)`)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
    }

    // Sync initial state in case it changed between render and effect
    setIsDesktop(mql.matches)

    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isDesktop
}

export interface WizardLayoutProps {
  /** Form content (wizard step) rendered in the left/main column */
  children: ReactNode
  /** Chat panel content rendered in the right column — only mounts at ≥1024px */
  chatPanel?: ReactNode
}

/**
 * Layout wrapper for the Project Wizard.
 *
 * - ≥1024px: two-column split-panel (form left, chat panel right)
 * - <1024px: form only — the chat panel does NOT mount at all
 *
 * This is area-local (only the wizard uses a form+chat split layout).
 */
export function WizardLayout({ children, chatPanel }: WizardLayoutProps) {
  const isDesktop = useIsDesktop()

  if (!isDesktop) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 gap-6">
      <div className="flex min-h-0 flex-1 flex-col">
        {children}
      </div>
      {chatPanel && (
        <aside className="flex w-[25rem] shrink-0 flex-col">
          {chatPanel}
        </aside>
      )}
    </div>
  )
}
