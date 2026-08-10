import { useState, lazy, Suspense } from 'react'
import { isTabActive } from '../../lib/tabs'

const UsersTab = lazy(() => import('./tabs/UsersTab'))
const ProjectsTab = lazy(() => import('./tabs/ProjectsTab'))
const TeamMembersTab = lazy(() => import('./tabs/TeamMembersTab'))
const TimelineBlocksTab = lazy(() => import('./tabs/TimelineBlocksTab'))
const AgentChatTab = lazy(() => import('./tabs/AgentChatTab'))
const EmailTriggerTab = lazy(() => import('./tabs/EmailTriggerTab'))

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'projects', label: 'Projects' },
  { key: 'team-members', label: 'Team Members' },
  { key: 'timeline-blocks', label: 'Timeline Blocks' },
  { key: 'agent-chat', label: 'Agent Chat' },
  { key: 'email-trigger', label: 'Email Trigger' },
] as const

/**
 * AdminPanel — the admin-only screen at `/admin` with 6 tabbed CRUD sections (Req 36.1).
 *
 * Tabs: Users (read-only), Projects, Team Members, Timeline Blocks, Agent Chat, Email Trigger.
 */
export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState(0)

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>

      {/* Tab strip */}
      <div
        className="flex gap-1 overflow-x-auto border-b border-gray-200"
        role="tablist"
        aria-label="Admin panel tabs"
      >
        {TABS.map((tab, index) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isTabActive(selectedTab, index)}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
              isTabActive(selectedTab, index)
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <Suspense fallback={<div className="p-4 text-sm text-gray-400">Loading…</div>}>
        {isTabActive(selectedTab, 0) && <UsersTab />}
        {isTabActive(selectedTab, 1) && <ProjectsTab />}
        {isTabActive(selectedTab, 2) && <TeamMembersTab />}
        {isTabActive(selectedTab, 3) && <TimelineBlocksTab />}
        {isTabActive(selectedTab, 4) && <AgentChatTab />}
        {isTabActive(selectedTab, 5) && <EmailTriggerTab />}
      </Suspense>
    </div>
  )
}
