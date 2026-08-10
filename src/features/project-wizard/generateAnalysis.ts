import type { WizardAnalysis } from './useWizardStore'

/**
 * Simulated delay range (ms) for the mock analysis generation.
 * Realistically 2–4 seconds; kept short for a good UX, well under the 30s timeout.
 */
const MIN_DELAY_MS = 2000
const MAX_DELAY_MS = 4000

/**
 * Injectable failure flag. Set to `true` to force the next call to reject,
 * useful for testing the error/retry path.
 */
let shouldFail = false

/**
 * Force the next `generateAnalysis()` call to fail.
 * Resets automatically after one failure.
 */
export function injectFailure(fail = true): void {
  shouldFail = fail
}

/**
 * Check whether the next call is configured to fail (read-only, for testing).
 */
export function willFail(): boolean {
  return shouldFail
}

/**
 * Canned analysis data returned by the mock generation.
 */
const CANNED_ANALYSIS: WizardAnalysis = {
  milestones: [
    { id: 'ms-1', name: 'Project Kickoff', date: '2025-02-01', taskIds: ['task-1', 'task-2'] },
    { id: 'ms-2', name: 'Design Phase', date: '2025-03-01', taskIds: ['task-3', 'task-4'] },
    { id: 'ms-3', name: 'Development Sprint 1', date: '2025-04-01', taskIds: ['task-5', 'task-6'] },
    { id: 'ms-4', name: 'Testing & QA', date: '2025-05-01', taskIds: ['task-7', 'task-8'] },
    { id: 'ms-5', name: 'Launch', date: '2025-06-01', taskIds: ['task-9', 'task-10'] },
  ],
  tasks: [
    { id: 'task-1', milestoneId: 'ms-1', name: 'Stakeholder interviews', priority: 'high' },
    { id: 'task-2', milestoneId: 'ms-1', name: 'Define project charter', priority: 'medium' },
    { id: 'task-3', milestoneId: 'ms-2', name: 'Wireframe key screens', priority: 'high' },
    { id: 'task-4', milestoneId: 'ms-2', name: 'Design system setup', priority: 'medium' },
    { id: 'task-5', milestoneId: 'ms-3', name: 'Implement core features', priority: 'high' },
    { id: 'task-6', milestoneId: 'ms-3', name: 'API integration', priority: 'medium' },
    { id: 'task-7', milestoneId: 'ms-4', name: 'Integration testing', priority: 'high' },
    { id: 'task-8', milestoneId: 'ms-4', name: 'Performance audit', priority: 'low' },
    { id: 'task-9', milestoneId: 'ms-5', name: 'Production deployment', priority: 'high' },
    { id: 'task-10', milestoneId: 'ms-5', name: 'Post-launch monitoring', priority: 'medium' },
  ],
  risks: [
    { id: 'risk-1', description: 'Scope creep due to unclear requirements', severity: 'high' },
    { id: 'risk-2', description: 'Key team member unavailability during Design Phase', severity: 'medium' },
    { id: 'risk-3', description: 'Third-party API rate-limiting in production', severity: 'low' },
  ],
  openQuestions: [
    'What is the preferred deployment strategy (blue-green vs. canary)?',
    'Are there existing brand guidelines for the UI design?',
    'Which third-party integrations are must-haves for MVP?',
    'Is there a hard deadline tied to a marketing event?',
  ],
}

/**
 * Pure mock function simulating AI analysis generation.
 *
 * - Returns canned milestones/tasks/risks/openQuestions after a simulated 2–4s delay.
 * - Supports injectable failure via `injectFailure()` for testing error/retry paths.
 * - Does NOT make any real network call (Requirements 3.1, 3.2).
 */
export function generateAnalysis(): Promise<WizardAnalysis> {
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)

  return new Promise<WizardAnalysis>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        shouldFail = false // Reset after one failure
        reject(new Error('Analysis generation failed. Please try again.'))
      } else {
        // Return a deep copy so consumers can mutate freely
        resolve(JSON.parse(JSON.stringify(CANNED_ANALYSIS)))
      }
    }, delay)
  })
}
