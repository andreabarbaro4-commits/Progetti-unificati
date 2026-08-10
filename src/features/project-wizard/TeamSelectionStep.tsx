import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HiOutlineUserPlus, HiOutlineViewColumns, HiOutlineQueueList } from 'react-icons/hi2'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { MemberGraph } from '../../components/MemberGraph/MemberGraph'
import { AddMemberPopup } from './AddMemberPopup'
import { useWizardStore } from './useWizardStore'
import { apiClient } from '../../lib/api-client'
import { cn } from '../../lib/utils'
import type { ClusterSource, Project, TeamMember } from '../../mock/fixtures/types'

// ── AI-suggested member IDs (synthetic, for demo purposes) ──────────────────

const AI_SUGGESTED_MEMBER_IDS = new Set(['member-alice', 'member-carlos', 'member-priya'])

// ── Component ───────────────────────────────────────────────────────────────

export default function TeamSelectionStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const formData = useWizardStore((s) => s.formData)
  const analysis = useWizardStore((s) => s.analysis)
  const selectedMembers = useWizardStore((s) => s.selectedMembers)
  const toggleMember = useWizardStore((s) => s.toggleMember)
  const reset = useWizardStore((s) => s.reset)

  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph')
  const [addPopupOpen, setAddPopupOpen] = useState(false)
  const [confirmError, setConfirmError] = useState(false)

  // ── Fetch team members ──────────────────────────────────────────────────────

  const { data: members = [] } = useQuery<TeamMember[]>({
    queryKey: ['team-members'],
    queryFn: () => apiClient.get<TeamMember[]>('/team-members'),
  })

  // ── Redirect if no valid step-1 data ────────────────────────────────────────

  // If there's no project name and no analysis (step 1/2 weren't completed), redirect
  if (!formData.name && !analysis) {
    navigate('/projects/new', { replace: true })
    return null
  }

  // ── Build cluster source for the Member_Graph (single synthetic cluster) ────

  const clusters: ClusterSource[] = useMemo(() => {
    return [
      {
        id: 'wizard-team',
        label: formData.name || 'New Project',
        color: '#6366f1',
        memberIds: members.map((m) => m.id),
      },
    ]
  }, [members, formData.name])

  const selectedMemberIds = useMemo(() => new Set(selectedMembers), [selectedMembers])

  // ── Project creation mutation (task 21.6) ──────────────────────────────────

  const createProjectMutation = useMutation({
    mutationFn: async () => {
      // Build milestones and tasks from wizard analysis
      const milestones = (analysis?.milestones ?? []).map((ms) => ({
        name: ms.name,
        date: ms.date,
        taskIds: ms.taskIds,
      }))

      const tasks = (analysis?.tasks ?? []).map((task) => ({
        name: task.name,
        milestoneId: task.milestoneId,
        priority: task.priority,
      }))

      // Create the project via mock POST /projects
      const newProject = await apiClient.post<Project, Partial<Project>>('/projects', {
        name: formData.name,
        brief: formData.brief,
        owner: formData.owner,
        deadline: formData.deadline,
        budget: formData.budget ? Number(formData.budget) : undefined,
        type: formData.type,
        status: 'planning',
        progress: 0,
        members: selectedMembers,
        clientId: 'client-internal',
      })

      // Create milestones associated with the new project
      for (const ms of milestones) {
        await apiClient.post('/milestones', {
          projectId: newProject.id,
          name: ms.name,
          date: ms.date,
          completed: false,
          taskIds: ms.taskIds,
        })
      }

      // Create tasks associated with the new project
      for (const task of tasks) {
        await apiClient.post('/tasks', {
          projectId: newProject.id,
          name: task.name,
          milestoneId: task.milestoneId,
          priority: task.priority,
          status: 'unassigned',
          deadline: formData.deadline,
        })
      }

      return newProject
    },
    onSuccess: (newProject) => {
      // Invalidate project queries so lists refresh
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })

      // Reset the wizard store
      reset()

      // Navigate to the new project's detail page
      navigate(`/projects/${newProject.id}`)
    },
  })

  // ── Confirm handler (gated on selection count) ──────────────────────────────

  const handleConfirm = useCallback(() => {
    if (selectedMembers.length === 0) {
      setConfirmError(true)
      return
    }
    setConfirmError(false)
    createProjectMutation.mutate()
  }, [selectedMembers, createProjectMutation])

  // ── Member activation from graph ───────────────────────────────────────────

  const handleMemberActivate = useCallback(
    (memberId: string) => {
      toggleMember(memberId)
      setConfirmError(false)
    },
    [toggleMember]
  )

  // ── Cluster center activation (open add-member popup) ──────────────────────

  const handleClusterActivate = useCallback(() => {
    setAddPopupOpen(true)
  }, [])

  // ── List view toggle handler ───────────────────────────────────────────────

  const handleToggleMemberInList = useCallback(
    (memberId: string) => {
      toggleMember(memberId)
      setConfirmError(false)
    },
    [toggleMember]
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 lg:px-8">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('wizard.team_selection', 'Select Team')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            aria-label="Graph view"
            aria-pressed={viewMode === 'graph'}
            className={cn(
              'rounded-lg p-2 transition-colors',
              viewMode === 'graph' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <HiOutlineViewColumns className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            className={cn(
              'rounded-lg p-2 transition-colors',
              viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <HiOutlineQueueList className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Selection count */}
      <p className="text-sm text-gray-600">
        {selectedMembers.length === 0
          ? t('wizard.no_members_selected', 'No members selected')
          : t('wizard.members_selected', '{{count}} member(s) selected', { count: selectedMembers.length })}
      </p>

      {/* Main view area */}
      <div className="relative flex-1 min-h-[20rem]">
        {viewMode === 'graph' ? (
          <>
            <MemberGraph
              clusters={clusters}
              members={members}
              selectedMemberIds={selectedMemberIds}
              suggestedMemberIds={AI_SUGGESTED_MEMBER_IDS}
              onMemberActivate={handleMemberActivate}
              onClusterActivate={handleClusterActivate}
              className="h-full w-full"
            />
            {/* Add member popup anchored in the center */}
            <AddMemberPopup
              members={members}
              open={addPopupOpen}
              onClose={() => setAddPopupOpen(false)}
              className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4">
            {members.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                {t('wizard.no_members_available', 'No team members available')}
              </p>
            ) : (
              members.map((member) => {
                const isSelected = selectedMembers.includes(member.id)
                const isAiSuggested = AI_SUGGESTED_MEMBER_IDS.has(member.id)
                return (
                  <label
                    key={member.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-colors',
                      isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleMemberInList(member.id)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      aria-label={`Select ${member.name} ${member.surname}`}
                    />
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
                    {/* Workload indicator */}
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                        member.workload >= 85
                          ? 'bg-red-100 text-red-700'
                          : member.workload >= 60
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                      )}
                    >
                      {member.workload}%
                    </span>
                    {/* AI-suggestion indicator */}
                    {isAiSuggested && (
                      <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        AI
                      </span>
                    )}
                  </label>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Confirmation error message (Req 20.7) */}
      {confirmError && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {t('wizard.select_at_least_one', 'Please select at least one team member to continue.')}
        </p>
      )}

      {/* Navigation footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <Button variant="ghost" onClick={() => navigate('/projects/new/analysis')}>
          {t('common.back', 'Back')}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={createProjectMutation.isPending}
        >
          {createProjectMutation.isPending
            ? t('wizard.creating', 'Creating…')
            : t('wizard.confirm_create', 'Confirm & Create Project')}
        </Button>
      </div>
    </div>
  )
}
