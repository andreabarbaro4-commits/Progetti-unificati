import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import { validateStringLength } from '../../../lib/validation'
import { Button } from '../../../components/ui/Button'
import type { ChatMessage, ChatSession, MessageRole } from '../../../mock/fixtures/types'

/**
 * AgentChatTab — add/edit mock chat messages up to 2000 chars (Req 36.5).
 *
 * Seeds the AI_Chat_Page's initial conversation by allowing admins to
 * create/edit messages within existing sessions.
 */
export default function AgentChatTab() {
  const queryClient = useQueryClient()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({ text: '', role: 'assistant' as MessageRole })
  const [error, setError] = useState<string | null>(null)

  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['chat-sessions'],
    queryFn: () => apiClient.get<ChatSession[]>('/chat-sessions'),
  })

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['chat-messages', selectedSessionId],
    queryFn: () => apiClient.get<ChatMessage[]>(`/chat-sessions/${selectedSessionId}/messages`),
    enabled: !!selectedSessionId,
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<ChatMessage>) =>
      apiClient.post<ChatMessage, Partial<ChatMessage>>(`/chat-sessions/${selectedSessionId}/messages`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedSessionId] })
      setShowCreate(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ChatMessage> }) =>
      apiClient.put<ChatMessage, Partial<ChatMessage>>(`/chat-sessions/${selectedSessionId}/messages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedSessionId] })
      setEditingId(null)
      resetForm()
    },
  })

  function resetForm() {
    setFormData({ text: '', role: 'assistant' })
    setError(null)
  }

  function startEdit(msg: ChatMessage) {
    setEditingId(msg.id)
    setFormData({ text: msg.text, role: msg.role })
    setShowCreate(false)
  }

  function handleSave() {
    const validation = validateStringLength(formData.text, { required: true, minLength: 1, maxLength: 2000 })
    if (!validation.valid) {
      setError('Message must be 1–2000 characters.')
      return
    }
    setError(null)
    const payload = { text: formData.text, role: formData.role, sessionId: selectedSessionId!, timestamp: new Date().toISOString() }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Session selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Session:</label>
        <select
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={selectedSessionId ?? ''}
          onChange={(e) => { setSelectedSessionId(e.target.value || null); setShowCreate(false); setEditingId(null); resetForm() }}
        >
          <option value="">Select a session…</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {!selectedSessionId && (
        <p className="text-sm text-gray-400">Select a session to manage its messages.</p>
      )}

      {selectedSessionId && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{messages.length} messages</span>
            <Button type="button" variant="primary" size="sm" onClick={() => { setShowCreate(true); setEditingId(null); resetForm() }}>
              + Add Message
            </Button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {(showCreate || editingId) && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold">{editingId ? 'Edit Message' : 'New Message'}</h3>
              <div className="flex flex-col gap-3">
                <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={formData.role} onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value as MessageRole }))}>
                  <option value="user">User</option>
                  <option value="assistant">Assistant</option>
                </select>
                <textarea
                  className="min-h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Message text (1–2000 chars) *"
                  maxLength={2000}
                  value={formData.text}
                  onChange={(e) => setFormData((f) => ({ ...f, text: e.target.value }))}
                />
                <span className="text-xs text-gray-400">{formData.text.length}/2000</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button type="button" variant="primary" size="sm" onClick={handleSave}>Save</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowCreate(false); setEditingId(null); resetForm() }}>Cancel</Button>
              </div>
            </div>
          )}

          <ul className="flex flex-col gap-2">
            {messages.map((msg) => (
              <li key={msg.id} className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.04)]">
                <span className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${msg.role === 'assistant' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                  {msg.role}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 line-clamp-3">{msg.text}</p>
                  <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
                <button type="button" className="text-xs text-indigo-600 hover:underline" onClick={() => startEdit(msg)}>Edit</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
