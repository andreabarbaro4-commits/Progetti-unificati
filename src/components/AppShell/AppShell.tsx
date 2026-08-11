import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { TopNavigationBar } from './TopNavigationBar'
import { BottomNavbar } from './BottomNavbar'
import { AiMascotFab } from './AiMascotFab'
import { GreetingBubble } from './GreetingBubble'
import { useAuth } from '../../features/auth/AuthProvider'

export interface AppShellProps {
  children: ReactNode
}

/**
 * AppShell — the authenticated-area chrome wrapper matching the demo's AppLayout.
 *
 * Structure:
 * - Sticky zone for the floating pill TopNavigationBar
 * - Max-width constrained main content area
 * - Floating BottomNavbar
 * - AI Mascot FAB + greeting bubble (hidden on /agent)
 */
export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const { user } = useAuth()
  const hasBottomChrome = location.pathname !== '/agent'
  const firstName = user?.name?.trim().split(/\s+/)[0]

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100%',
      background: 'transparent',
      position: 'relative',
      /* Override #root's flex centering — stretch to full width */
      alignSelf: 'stretch',
    }}>
      {/* Sticky zone for the floating pill navbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="mx-auto w-full max-w-[clamp(0px,87.5vw,1680px)]">
          <TopNavigationBar variant="inline" firstName={firstName} />
        </div>
      </div>

      {/* Page content — normal document flow, body scroll */}
      <main
        id="main-content"
        className="mx-auto w-full max-w-[clamp(0px,87.5vw,1680px)]"
        style={{ position: 'relative', zIndex: 1, paddingBottom: hasBottomChrome ? '4.25rem' : '0' }}
      >
        {children}
      </main>

      {/* Floating bottom nav bar */}
      <BottomNavbar />

      {/* Floating AI agent button */}
      {hasBottomChrome && <AiMascotFab />}

      {/* Post-login greeting bubble */}
      {hasBottomChrome && <GreetingBubble />}
    </div>
  )
}
