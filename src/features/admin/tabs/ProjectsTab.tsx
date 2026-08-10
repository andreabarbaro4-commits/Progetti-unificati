import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import { Button } from '../../../components/ui/Button'
import type { Project } from '../../../mock/fixtures/types'

/**
 * ProjectsTab — CRUD for projects (Req 36.2, 36.8, 36.9).
 * Create/edit forms with required-field validation, delete confirmation.
 */
export default function ProjectsTab() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', brief: '', deadline: '', status: 'planning' as string })
  const [error, setError] = useState<string | null>(null)

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<Project[]>('/projects'),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Project>) => apiClient.post<Project, Partial<Project>>('/projects', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setShowCreate(false); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      apiClient.put<Project, Partial<Project>>(`/projects/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setEditingId(null); resetForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<{ id: string }>(`/projects/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setDeleteConfirm(null) },
    onError: () => setError('Cannot delete: entity may be referenced by Email Trigger.'),
  })

  function resetForm() {
    setFormData({ name: '', brief: '', deadline: '', status: 'planning' })
    setError(null)
  }

  function startEdit(project: Project) {
    setEditingId(project.id)
    setFormData({ name: project.name, brief: project.brief ?? '', deadline: project.deadline, status: project.status })
    setShowCreate(false)
  }

  function handleSave() {
    if (!formData.name.trim()) { setError('Name is required.'); return }
    setError(null)
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate({ ...formData, progress: 0, members: [], owner: '', clientId: '' })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{projects.length} projects</span>
        <Button type="button" variant="primary" size="sm" onClick={() => { setShowCreate(true); setEditingId(null); resetForm() }}>
          + Create
        </Button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Create/Edit form */}
      {(showCreate || editingId) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-semibold">{editingId ? 'Edit Project' : 'New Project'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Name *" value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Brief" value={formData.brief} onChange={(e) => setFormData((f) => ({ ...f, brief: e.target.value }))} />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" type="date" value={formData.deadline} onChange={(e) => setFormData((f) => ({ ...f, deadline: e.target.value }))} />
            <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={formData.status} onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}>
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="at_risk">At Risk</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="primary" size="sm" onClick={handleSave}>Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setShowCreate(false); setEditingId(null); resetForm() }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Are you sure you want to delete this project?</p>
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="primary" size="sm" onClick={() => deleteMutation.mutate(deleteConfirm)}>Delete</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{project.name}</td>
                <td className="px-4 py-3 text-gray-600">{project.status}</td>
                <td className="px-4 py-3 text-gray-600">{project.progress}%</td>
                <td className="flex gap-2 px-4 py-3">
                  <button type="button" className="text-xs text-indigo-600 hover:underline" onClick={() => startEdit(project)}>Edit</button>
                  <button type="button" className="text-xs text-red-500 hover:underline" onClick={() => setDeleteConfirm(project.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
