import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HiOutlineBars3 } from 'react-icons/hi2'
import { apiClient } from '../../lib/api-client'
import { ChatSessionSidebar } from './ChatSessionSidebar'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import type { ChatAttachment, ChatMessage, ChatSession } from '../../mock/fixtures/types'

const SESSIONS_KEY = ['chat-sessions'] as const
const MESSAGES_KEY_PREFIX = 'chat-messages'

/** Simulated assistant responses for the mock demo. */
const SIMULATED_REPLIES = [
  "I've looked into that for you. Here's what I found:\n\n- The deadline is on track\n- No blockers reported\n- Team velocity is stable\n\nWould you like more details on any of these?",
  "Based on the project data, I'd recommend focusing on the **high-priority tasks** first. They have the tightest deadlines.",
  "Good question! Let me check the current status...\n\nEverything looks good. The team is making steady progress.",
  "I can help with that. Here are some suggestions:\n\n1. Schedule a sync meeting\n2. Review the milestone timeline\n3. Update the task assignments\n\nWhich would you like to start with?",
  "That's an interesting point. The data shows a positive trend over the last two weeks.",
]

function getSimulatedReply(): string {
  return SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)]
}

/**
 * AiChatPage — the AI Chat screen at `/agent` (Req 28–32).
 *
 * Features:
 * - Session sidebar (responsive: fixed ≥768px, overlay <768px)
 * - Session load/select/delete/new-unsaved-session logic
 * - Message display with markdown rendering
 * - Message input with file attachments and voice recording
 * - Simulated assistant replies (500–1500ms delay)
 * - Lazy session creation on first message (Req 28.5)
 */
export default function AiChatPage() {
  const queryClient = useQueryClient()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([])
  const [isAssistantTyping, setIsAssistantTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch sessions
  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: SESSIONS_KEY,
    queryFn: () => apiClient.get<ChatSession[]>('/chat-sessions'),
  })

  // Fetch messages for active session
  const { data: serverMessages = [] } = useQuery<ChatMessage[]>({
    queryKey: [MESSAGES_KEY_PREFIX, activeSessionId],
    queryFn: () =>
      apiClient.get<ChatMessage[]>(`/chat-sessions/${activeSessionId}/messages`),
    enabled: !!activeSessionId,
  })

  // Combined messages: server + pending (for unsaved sessions)
  const messages = useMemo(() => {
    if (activeSessionId) return serverMessages
    return pendingMessages
  }, [activeSessionId, serverMessages, pendingMessages])

  // Auto-select first session on initial load
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      const sorted = [...sessions].sort(
        (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
      )
      setActiveSessionId(sorted[0].id)
    }
  }, [sessions, activeSessionId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAssistantTyping])

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (title: string) =>
      apiClient.post<ChatSession, Partial<ChatSession>>('/chat-sessions', {
        title,
        lastActiveAt: new Date().toISOString(),
      }),
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
      setActiveSessionId(newSession.id)
    },
  })

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiClient.delete<{ id: string }>(`/chat-sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
      if (sessions.length > 1) {
        const remaining = sessions.filter((s) => s.id !== activeSessionId)
        setActiveSessionId(remaining[0]?.id ?? null)
      } else {
        setActiveSessionId(null)
      }
    },
  })

  const handleNewSession = useCallback(() => {
    setActiveSessionId(null)
    setPendingMessages([])
    setSidebarOpen(false)
  }, [])

  const handleSelectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId)
    setPendingMessages([])
    setSidebarOpen(false)
  }, [])

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      deleteSessionMutation.mutate(sessionId)
    },
    [deleteSessionMutation],
  )

  const handleSend = useCallback(
    (text: string, attachments?: ChatAttachment[], isVoiceRecording?: boolean) => {
      if (!text.trim() && !attachments?.length) return

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sessionId: activeSessionId ?? 'pending',
        role: 'user',
        text,
        timestamp: new Date().toISOString(),
        attachments,
        isVoiceRecording,
      }

      if (!activeSessionId) {
        // Lazy session creation (Req 28.5): create on first message
        const title = text.slice(0, 50) || 'New conversation'
        setPendingMessages((prev) => [...prev, userMessage])
        createSessionMutation.mutate(title)
      } else {
        // Add user message to cache
        queryClient.setQueryData<ChatMessage[]>(
          [MESSAGES_KEY_PREFIX, activeSessionId],
          (prev) => [...(prev ?? []), userMessage],
        )
      }

      // Simulate assistant reply (500–1500ms delay, Req 29.4)
      setIsAssistantTyping(true)
      const delay = 500 + Math.random() * 1000
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-reply`,
          sessionId: activeSessionId ?? 'pending',
          role: 'assistant',
          text: getSimulatedReply(),
          timestamp: new Date().toISOString(),
        }

        if (!activeSessionId) {
          setPendingMessages((prev) => [...prev, assistantMessage])
        } else {
          queryClient.setQueryData<ChatMessage[]>(
            [MESSAGES_KEY_PREFIX, activeSessionId],
            (prev) => [...(prev ?? []), assistantMessage],
          )
        }
        setIsAssistantTyping(false)
      }, delay)
    },
    [activeSessionId, queryClient, createSessionMutation],
  )

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar */}
      <ChatSessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewSession={handleNewSession}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile sidebar toggle */}
        <div className="flex items-center border-b border-gray-200 px-4 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Open conversations"
          >
            <HiOutlineBars3 className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-medium text-gray-700">
            {activeSessionId
              ? sessions.find((s) => s.id === activeSessionId)?.title ?? 'Chat'
              : 'New Conversation'}
          </span>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && !isAssistantTyping ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-lg font-medium text-gray-600">Start a conversation</p>
              <p className="mt-1 text-sm text-gray-400">
                Send a message to get started with the AI assistant.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isAssistantTyping && (
                <div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
                  <span className="flex gap-1 text-gray-400">
                    <span className="animate-bounce">·</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>·</span>
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <MessageInput onSend={handleSend} disabled={isAssistantTyping} />
      </div>
    </div>
  )
}
