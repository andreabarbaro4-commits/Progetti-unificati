import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import { Button } from '../../../components/ui/Button'
import type { Project, Task, TeamMember } from '../../../mock/fixtures/types'

interface EmailTriggerConfig {
  projectId: string
  taskId: string
  teamMemberId: string
  recipients: string[]
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_RECIPIENTS = 10

/**
 * EmailTriggerTab — save target project/task/team member + 1–10 recipients (Req 36.6, 36.7, 36.10).
 *
 * Overwrites any prior configuration. Validates:
 * - ≤10 entries
 * - Valid email format
 * - No case-insensitive duplicates
 * - All target selections required
 */
export default function EmailTriggerTab() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<EmailTriggerConfig>({
    projectId: '',
    taskId: '',
    teamMemberId: '',
    recipients: [],
  })
  const [newRecipient, setNewRecipient] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch current config
  const { data: currentConfig } = useQuery<EmailTriggerConfig | null>({
    queryKey: ['admin-email-trigger'],
    queryFn: () => apiClient.get<EmailTriggerConfig | null>('/admin/email-trigger'),
  })

  // Fetch reference data
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<Project[]>('/projects'),
  })

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => apiClient.get<Task[]>('/tasks'),
  })

  const { data: members = [] } = useQuery<TeamMember[]>({
    queryKey: ['team-members'],
    queryFn: () => apiClient.get<TeamMember[]>('/team-members'),
  })

  // Initialize form from current config on first load
  useState(() => {
    if (currentConfig) {
      setFormData(currentConfig)
    }
  })

  const saveMutation = useMutation({
    mutationFn: (config: EmailTriggerConfig) =>
      apiClient.put<EmailTriggerConfig, EmailTriggerConfig>('/admin/email-trigger', config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-trigger'] })
      setSuccess(true)
      setError(null)
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: () => setError('Failed to save configuration.'),
  })

  function addRecipient() {
    const email = newRecipient.trim()
    if (!email) return

    // Validate email format (Req 36.7)
    if (!EMAIL_REGEX.test(email)) {
      setError('Invalid email format.')
      return
    }

    // Check max (Req 36.7)
    if (formData.recipients.length >= MAX_RECIPIENTS) {
      setError(`Maximum ${MAX_RECIPIENTS} recipients allowed.`)
      return
    }

    // Check case-insensitive duplicate (Req 36.7)
    const lowerEmail = email.toLowerCase()
    if (formData.recipients.some((r) => r.toLowerCase() === lowerEmail)) {
      setError('This email is already in the list.')
      return
    }

    setFormData((f) => ({ ...f, recipients: [...f.recipients, email] }))
    setNewRecipient('')
    setError(null)
  }

  function removeRecipient(index: number) {
    setFormData((f) => ({ ...f, recipients: f.recipients.filter((_, i) => i !== index) }))
  }

  function handleSave() {
    // Validate required selections (Req 36.10)
    if (!formData.projectId) { setError('Please select a target project.'); return }
    if (!formData.taskId) { setError('Please select a target task.'); return }
    if (!formData.teamMemberId) { setError('Please select a target team member.'); return }
    if (formData.recipients.length === 0) { setError('At least one recipient is required.'); return }

    setError(null)
    saveMutation.mutate(formData)
  }

  // Filter tasks to selected project
  const projectTasks = tasks.filter((t) => t.projectId === formData.projectId)

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-500">
        Configure the email trigger target and recipients. Saving overwrites any prior configuration.
      </p>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-green-600">Configuration saved successfully.</p>}

      {/* Target selections */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Target Project *</label>
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={formData.projectId}
            onChange={(e) => setFormData((f) => ({ ...f, projectId: e.target.value, taskId: '' }))}
          >
            <option value="">Select…</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Target Task *</label>
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={formData.taskId}
            onChange={(e) => setFormData((f) => ({ ...f, taskId: e.target.value }))}
            disabled={!formData.projectId}
          >
            <option value="">Select…</option>
            {projectTasks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Target Team Member *</label>
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={formData.teamMemberId}
            onChange={(e) => setFormData((f) => ({ ...f, teamMemberId: e.target.value }))}
          >
            <option value="">Select…</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name} {m.surname}</option>)}
          </select>
        </div>
      </div>

      {/* Recipients list */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-medium text-gray-600">Recipients (1–{MAX_RECIPIENTS})</label>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            type="email"
            placeholder="email@example.com"
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRecipient() } }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addRecipient} disabled={formData.recipients.length >= MAX_RECIPIENTS}>
            Add
          </Button>
        </div>

        {formData.recipients.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {formData.recipients.map((email, index) => (
              <li key={email} className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {email}
                <button
                  type="button"
                  onClick={() => removeRecipient(index)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label={`Remove ${email}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Save */}
      <div>
        <Button type="button" variant="primary" size="sm" onClick={handleSave}>
          Save Configuration
        </Button>
      </div>

      {/* Show current config */}
      {currentConfig && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-2 text-xs font-semibold text-gray-600">Current Saved Configuration</h4>
          <pre className="text-xs text-gray-600">{JSON.stringify(currentConfig, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
