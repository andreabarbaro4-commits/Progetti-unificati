import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import { Button } from '../../../components/ui/Button'
import type { TeamMember } from '../../../mock/fixtures/types'

/**
 * TeamMembersTab — CRUD for team members (Req 36.2, 36.8, 36.9).
 */
export default function TeamMembersTab() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', surname: '', role: '', email: '' })
  const [error, setError] = useState<string | null>(null)

  const { data: members = [] } = useQuery<TeamMember[]>({
    queryKey: ['team-members'],
    queryFn: () => apiClient.get<TeamMember[]>('/team-members'),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<TeamMember>) => apiClient.post<TeamMember, Partial<TeamMember>>('/team-members', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['team-members'] }); setShowCreate(false); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeamMember> }) =>
      apiClient.put<TeamMember, Partial<TeamMember>>(`/team-members/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['team-members'] }); setEditingId(null); resetForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<{ id: string }>(`/team-members/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['team-members'] }); setDeleteConfirm(null) },
    onError: () => setError('Cannot delete: entity may be referenced by Email Trigger.'),
  })

  function resetForm() {
    setFormData({ name: '', surname: '', role: '', email: '' })
    setError(null)
  }

  function startEdit(member: TeamMember) {
    setEditingId(member.id)
    setFormData({ name: member.name, surname: member.surname, role: member.role, email: member.email })
    setShowCreate(false)
  }

  function handleSave() {
    if (!formData.name.trim() || !formData.email.trim()) { setError('Name and email are required.'); return }
    setError(null)
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate({ ...formData, skills: [], workload: 0, available: true })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{members.length} members</span>
        <Button type="button" variant="primary" size="sm" onClick={() => { setShowCreate(true); setEditingId(null); resetForm() }}>
          + Create
        </Button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {(showCreate || editingId) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-semibold">{editingId ? 'Edit Member' : 'New Member'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="First name *" value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Last name" value={formData.surname} onChange={(e) => setFormData((f) => ({ ...f, surname: e.target.value }))} />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Role" value={formData.role} onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value }))} />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="primary" size="sm" onClick={handleSave}>Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setShowCreate(false); setEditingId(null); resetForm() }}>Cancel</Button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Are you sure you want to delete this member?</p>
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="primary" size="sm" onClick={() => deleteMutation.mutate(deleteConfirm)}>Delete</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{member.name} {member.surname}</td>
                <td className="px-4 py-3 text-gray-600">{member.role}</td>
                <td className="px-4 py-3 text-gray-600">{member.email}</td>
                <td className="flex gap-2 px-4 py-3">
                  <button type="button" className="text-xs text-indigo-600 hover:underline" onClick={() => startEdit(member)}>Edit</button>
                  <button type="button" className="text-xs text-red-500 hover:underline" onClick={() => setDeleteConfirm(member.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
