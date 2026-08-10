import { useMemo } from 'react'
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi2'
import type { ChatSession } from '../../mock/fixtures/types'

export interface ChatSessionSidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onNewSession: () => void
  open: boolean
  onClose: () => void
}

/**
 * ChatSessionSidebar — session list ordered most-recently-active-first (Req 28.1, 28.6).
 *
 * Renders as a fixed panel on ≥768px and an overlay drawer below 768px.
 */
export function ChatSessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
  open,
  onClose,
}: ChatSessionSidebarProps) {
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
      ),
    [sessions],
  )

  return (
    <>
      {/* Overlay backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform md:relative md:z-auto md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">Conversations</h2>
          <button
            type="button"
            onClick={onNewSession}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="New conversation"
          >
            <HiOutlinePlus className="h-4 w-4" />
          </button>
        </div>

        {/* Session list */}
        <nav className="flex-1 overflow-y-auto p-2">
          {sortedSessions.length === 0 ? (
            <p className="p-4 text-center text-xs text-gray-400">
              No conversations yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {sortedSessions.map((session) => (
                <li key={session.id} className="group relative">
                  <button
                    type="button"
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      session.id === activeSessionId
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <span className="block truncate">{session.title}</span>
                    <span className="mt-0.5 block text-xs text-gray-400">
                      {new Date(session.lastActiveAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </button>

                  {/* Delete control — visible on hover/swipe */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    aria-label={`Delete ${session.title}`}
                  >
                    <HiOutlineTrash className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>
    </>
  )
}
