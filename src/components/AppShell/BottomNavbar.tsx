import { useLocation, NavLink } from 'react-router-dom'
import { HiHome, HiOutlineHome, HiFolder, HiOutlineFolder, HiUserGroup, HiOutlineUserGroup } from 'react-icons/hi2'
import type { IconType } from 'react-icons'

interface NavEntry {
  path: string
  label: string
  icon: IconType
  activeIcon: IconType
}

const NAV_ENTRIES: NavEntry[] = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome, activeIcon: HiHome },
  { path: '/projects', label: 'Projects', icon: HiOutlineFolder, activeIcon: HiFolder },
  { path: '/team', label: 'Team', icon: HiOutlineUserGroup, activeIcon: HiUserGroup },
]

function isPathActive(currentPath: string, entryPath: string): boolean {
  return currentPath === entryPath || currentPath.startsWith(`${entryPath}/`)
}

/**
 * BottomNavbar — floating pill navigation bar pinned to the bottom center.
 *
 * Matches the demo's design: a narrow, rounded, semi-transparent pill with
 * a frosted-glass active indicator behind the selected icon. Icon-only on
 * the bar itself, with labels on mobile shown below.
 */
export function BottomNavbar() {
  const { pathname } = useLocation()

  // Hidden on the agent page for immersive chat
  if (pathname === '/agent') return null

  const activeIndex = NAV_ENTRIES.findIndex((entry) => isPathActive(pathname, entry.path))

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 40,
        pointerEvents: 'none',
      }}
    >
      <nav
        aria-label="Main navigation"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.4375rem 0.5rem',
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          pointerEvents: 'auto',
        }}
      >
        {/* Active indicator — frosted glass pill behind the active icon */}
        {activeIndex >= 0 && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${0.5 + activeIndex * (2.75 + 0.25)}rem`,
              top: '0.4375rem',
              width: '2.75rem',
              height: '2.125rem',
              borderRadius: '0.875rem',
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
              transition: 'left 200ms ease-out',
              pointerEvents: 'none',
            }}
          />
        )}

        {NAV_ENTRIES.map((entry) => {
          const isActive = isPathActive(pathname, entry.path)
          const Icon = isActive ? entry.activeIcon : entry.icon

          return (
            <NavLink
              key={entry.path}
              to={entry.path}
              aria-label={entry.label}
              title={entry.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.75rem',
                height: '2.125rem',
                borderRadius: '0.875rem',
                textDecoration: 'none',
                color: isActive ? '#463a93' : 'rgba(0,0,0,0.42)',
                transition: 'color 0.2s ease',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Icon style={{ fontSize: '1.5rem', width: '1.5rem', height: '1.5rem' }} />
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
