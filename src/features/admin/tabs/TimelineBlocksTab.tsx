import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import { Button } from '../../../components/ui/Button'
import type { BlockType, TimelineBlock } from '../../../mock/fixtures/types'

/**
 * TimelineBlocksTab — CRUD for timeline blocks (Req 36.4, 36.8, 36.9).
 */
export default function TimelineBlocksTab() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', type: 'task' as BlockType, date: '', time: '09:00', duration: '60' })
  const [error, setError] = useState<string | null>(null)

  const { data: blocks = [] } = useQuery<TimelineBlock[]>({
    queryKey: ['timeline-blocks'],
    queryFn: () => apiClient.get<TimelineBlock[]>('/timeline-blocks'),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<TimelineBlock>) => apiClient.post<TimelineBlock, Partial<TimelineBlock>>('/timeline-blocks', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timeline-blocks'] }); setShowCreate(false); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimelineBlock> }) =>
      apiClient.put<TimelineBlock, Partial<TimelineBlock>>(`/timeline-blocks/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timeline-blocks'] }); setEditingId(null); resetForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<{ id: string }>(`/timeline-blocks/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timeline-blocks'] }); setDeleteConfirm(null) },
    onError: () => setError('Cannot delete: entity may be referenced by Email Trigger.'),
  })

  function resetForm() {
    setFormData({ title: '', type: 'task', date: '', time: '09:00', duration: '60' })
    setError(null)
  }

  function startEdit(block: TimelineBlock) {
    setEditingId(block.id)
    setFormData({ title: block.title, type: block.type, date: block.date, time: block.time, duration: String(block.duration) })
    setShowCreate(false)
  }

  function handleSave() {
    if (!formData.title.trim()) { setError('Title is required.'); return }
    if (!formData.date) { setError('Date is required.'); return }
    setError(null)
    const payload = { title: formData.title, type: formData.type, date: formData.date, time: formData.time, duration: parseInt(formData.duration, 10) || 60, memberId: '' }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{blocks.length} blocks</span>
        <Button type="button" variant="primary" size="sm" onClick={() => { setShowCreate(true); setEditingId(null); resetForm() }}>
          + Create
        </Button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {(showCreate || editingId) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-semibold">{editingId ? 'Edit Block' : 'New Block'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Title *" value={formData.title} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} />
            <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={formData.type} onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value as BlockType }))}>
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
              <option value="deadline">Deadline</option>
              <option value="break">Break</option>
            </select>
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" type="date" value={formData.date} onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))} />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" type="time" value={formData.time} onChange={(e) => setFormData((f) => ({ ...f, time: e.target.value }))} />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" type="number" placeholder="Duration (min)" value={formData.duration} onChange={(e) => setFormData((f) => ({ ...f, duration: e.target.value }))} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="primary" size="sm" onClick={handleSave}>Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setShowCreate(false); setEditingId(null); resetForm() }}>Cancel</Button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Are you sure you want to delete this block?</p>
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
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => (
              <tr key={block.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{block.title}</td>
                <td className="px-4 py-3 text-gray-600">{block.type}</td>
                <td className="px-4 py-3 text-gray-600">{block.date}</td>
                <td className="px-4 py-3 text-gray-600">{block.time}</td>
                <td className="px-4 py-3 text-gray-600">{block.duration}m</td>
                <td className="flex gap-2 px-4 py-3">
                  <button type="button" className="text-xs text-indigo-600 hover:underline" onClick={() => startEdit(block)}>Edit</button>
                  <button type="button" className="text-xs text-red-500 hover:underline" onClick={() => setDeleteConfirm(block.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
