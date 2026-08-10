import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HiOutlineTrash } from 'react-icons/hi2'
import { Button } from '../../components/ui/Button'
import { MilestoneRoadmap } from '../../components/MilestoneRoadmap/MilestoneRoadmap'
import { useWizardStore, type WizardAnalysis } from './useWizardStore'
import { validateStringLength } from '../../lib/validation'

// ── Analysis generation (mock/deterministic) ────────────────────────────────

/** Maximum time allowed for analysis generation before timeout (ms). */
const ANALYSIS_TIMEOUT_MS = 30_000

/**
 * Simulates an AI-generated analysis. Returns a deterministic set of
 * milestones, tasks, risks, and open questions after a short delay.
 *
 * Accepts an `injectFailure` flag for testing the error/retry path.
 */
function generateAnalysis(injectFailure = false): Promise<WizardAnalysis> {
  return new Promise((resolve, reject) => {
    const delay = 1500 + Math.random() * 1000 // 1.5–2.5s
    setTimeout(() => {
      if (injectFailure) {
        reject(new Error('Analysis generation failed'))
        return
      }
      resolve({
        milestones: [
          { id: 'gen-ms-1', name: 'Discovery & Planning', date: '2025-07-01', taskIds: ['gen-task-1', 'gen-task-2'] },
          { id: 'gen-ms-2', name: 'Design & Prototyping', date: '2025-08-01', taskIds: ['gen-task-3', 'gen-task-4'] },
          { id: 'gen-ms-3', name: 'Development Sprint 1', date: '2025-09-15', taskIds: ['gen-task-5'] },
          { id: 'gen-ms-4', name: 'Testing & QA', date: '2025-10-15', taskIds: ['gen-task-6'] },
          { id: 'gen-ms-5', name: 'Launch', date: '2025-11-01', taskIds: ['gen-task-7'] },
        ],
        tasks: [
          { id: 'gen-task-1', milestoneId: 'gen-ms-1', name: 'Stakeholder interviews', priority: 'high' },
          { id: 'gen-task-2', milestoneId: 'gen-ms-1', name: 'Competitive analysis', priority: 'medium' },
          { id: 'gen-task-3', milestoneId: 'gen-ms-2', name: 'Wireframes & user flows', priority: 'high' },
          { id: 'gen-task-4', milestoneId: 'gen-ms-2', name: 'Visual design system', priority: 'medium' },
          { id: 'gen-task-5', milestoneId: 'gen-ms-3', name: 'Core feature implementation', priority: 'high' },
          { id: 'gen-task-6', milestoneId: 'gen-ms-4', name: 'Integration testing', priority: 'high' },
          { id: 'gen-task-7', milestoneId: 'gen-ms-5', name: 'Production deployment', priority: 'medium' },
        ],
        risks: [
          { id: 'gen-risk-1', description: 'Scope creep due to unclear requirements', severity: 'high' },
          { id: 'gen-risk-2', description: 'Team availability constraints during holidays', severity: 'medium' },
          { id: 'gen-risk-3', description: 'Third-party API dependency instability', severity: 'low' },
        ],
        openQuestions: [
          'What is the primary success metric for this project?',
          'Are there regulatory compliance requirements?',
          'What is the preferred tech stack for the backend?',
        ],
      })
    }, delay)
  })
}

// ── Unique ID helper ────────────────────────────────────────────────────────

let idCounter = 0
function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`
}

// ── Component ───────────────────────────────────────────────────────────────

export default function AnalysisStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const formData = useWizardStore((s) => s.formData)
  const analysis = useWizardStore((s) => s.analysis)
  const setAnalysis = useWizardStore((s) => s.setAnalysis)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)

  const abortRef = useRef(false)

  // ── Redirect if no valid step-1 data (Req 18.10) ───────────────────────────

  useEffect(() => {
    // If there's no project name (step 1 wasn't completed), redirect back
    if (!formData.name && !analysis) {
      navigate('/projects/new', { replace: true })
    }
  }, [formData.name, analysis, navigate])

  // ── Generate analysis on mount if not already present ──────────────────────

  const runAnalysis = useCallback(async () => {
    setLoading(true)
    setError(null)
    abortRef.current = false

    try {
      const result = await Promise.race([
        generateAnalysis(false),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), ANALYSIS_TIMEOUT_MS)
        ),
      ])

      if (!abortRef.current) {
        setAnalysis(result)
      }
    } catch (err) {
      if (!abortRef.current) {
        setError(
          err instanceof Error && err.message === 'timeout'
            ? t('wizard.analysis_timeout', 'Analysis generation timed out. Please try again.')
            : t('wizard.analysis_error', 'Something went wrong generating the analysis.')
        )
      }
    } finally {
      if (!abortRef.current) {
        setLoading(false)
      }
    }
  }, [setAnalysis, t])

  useEffect(() => {
    if (!analysis && formData.name) {
      runAnalysis()
    }
    return () => {
      abortRef.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Milestone CRUD handlers (task 20.2) ────────────────────────────────────

  function handleAddMilestone() {
    if (!analysis) return
    const newMilestone = {
      id: uniqueId('ms'),
      name: 'New Milestone',
      date: new Date().toISOString().split('T')[0],
      taskIds: [] as string[],
    }
    setAnalysis({
      ...analysis,
      milestones: [...analysis.milestones, newMilestone],
    })
  }

  function handleRenameMilestone(id: string, newName: string) {
    if (!analysis) return
    // Validate: non-empty, max 100 chars (Req 18.8)
    const validation = validateStringLength(newName, { required: true, maxLength: 100 })
    if (!validation.valid) return // reject rename silently, retain previous name

    setAnalysis({
      ...analysis,
      milestones: analysis.milestones.map((ms) =>
        ms.id === id ? { ...ms, name: newName.trim().slice(0, 100) } : ms
      ),
    })
  }

  function handleReorderMilestone(fromIndex: number, toIndex: number) {
    if (!analysis) return
    const updated = [...analysis.milestones]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    setAnalysis({ ...analysis, milestones: updated })
  }

  function handleDeleteMilestone(milestoneId: string) {
    if (!analysis) return
    const milestone = analysis.milestones.find((ms) => ms.id === milestoneId)
    if (!milestone) return

    // Remove the milestone and cascade-delete its tasks (Req 18.9)
    const taskIdsToRemove = new Set(milestone.taskIds)
    setAnalysis({
      ...analysis,
      milestones: analysis.milestones.filter((ms) => ms.id !== milestoneId),
      tasks: analysis.tasks.filter((task) => !taskIdsToRemove.has(task.id)),
    })

    // If the deleted milestone was selected, clear selection
    if (selectedMilestoneId === milestoneId) {
      setSelectedMilestoneId(null)
    }
  }

  // ── Milestone selection for task filtering ─────────────────────────────────

  function handleSelectMilestone(id: string | null) {
    setSelectedMilestoneId(id)
  }

  // ── Compute roadmap milestones (adapted to the Milestone type expected by MilestoneRoadmap) ──

  const roadmapMilestones = (analysis?.milestones ?? []).map((ms) => ({
    id: ms.id,
    projectId: '',
    name: ms.name,
    date: ms.date,
    completed: false,
    taskIds: ms.taskIds,
  }))

  // ── Render: Loading state ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-500" />
        <p className="text-sm text-gray-600">
          {t('wizard.generating_analysis', 'Generating analysis…')}
        </p>
      </div>
    )
  }

  // ── Render: Error state ────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
        <p className="text-sm text-red-600">{error}</p>
        <Button onClick={runAnalysis}>
          {t('wizard.retry', 'Retry')}
        </Button>
      </div>
    )
  }

  // ── Render: Analysis result ────────────────────────────────────────────────

  if (!analysis) return null

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('wizard.analysis_title', 'Project Analysis')}
        </h1>
        <Button onClick={() => navigate('/projects/new/team')}>
          {t('wizard.continue', 'Continue')}
        </Button>
      </div>

      {/* Milestone Roadmap section */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('wizard.milestones', 'Milestones')}
          </h2>
          {analysis.milestones.length > 0 && (
            <span className="text-xs text-gray-500">
              {analysis.milestones.length} / 20
            </span>
          )}
        </div>

        <MilestoneRoadmap
          milestones={roadmapMilestones}
          selectedId={selectedMilestoneId}
          onSelect={handleSelectMilestone}
          onAdd={handleAddMilestone}
          onReorder={handleReorderMilestone}
          onRenameMilestone={handleRenameMilestone}
          editable
          showStateIndicator={false}
        />

        {/* Delete affordance per milestone */}
        {analysis.milestones.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {analysis.milestones.map((ms) => (
              <button
                key={ms.id}
                type="button"
                onClick={() => handleDeleteMilestone(ms.id)}
                aria-label={`Delete milestone: ${ms.name}`}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:border-red-300 hover:text-red-600"
              >
                <HiOutlineTrash className="h-3.5 w-3.5" />
                <span className="max-w-[8rem] truncate">{ms.name}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Navigation */}
      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
        <Button variant="ghost" onClick={() => navigate('/projects/new')}>
          {t('common.back', 'Back')}
        </Button>
        <Button onClick={() => navigate('/projects/new/team')}>
          {t('wizard.continue', 'Continue')}
        </Button>
      </div>
    </div>
  )
}
