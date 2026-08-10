import { useCallback, useEffect, useRef, useState } from 'react'
import { Avatar } from '../../components/ui/Avatar'
import { validateStringLength } from '../../lib/validation'
import { cn } from '../../lib/utils'

export interface WizardChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

interface WizardChatPanelProps {
  /** Externally managed messages (e.g. from useWizardStore). When provided, panel syncs to this array. */
  messages?: WizardChatMessage[]
  /** Called when the internal messages array changes (new user or assistant message). */
  onMessagesChange?: (messages: WizardChatMessage[]) => void
  /** Optional class overrides for the root container. */
  className?: string
}

const SIMULATED_REPLIES = [
  "I understand! Let me think about that for a moment... Based on what you've described, I'd suggest structuring the project in phases to manage complexity.",
  "Great question! From my experience with similar projects, the key success factors are clear scope definition and regular stakeholder check-ins.",
  "That's a solid approach. I'd also recommend setting up milestone reviews at 25%, 50%, and 75% completion to catch any drift early.",
  "Interesting! Let me break that down: the timeline seems reasonable given the team size. Would you like me to suggest a task breakdown?",
  "Good point. Budget allocation typically works best when you reserve 10-15% for contingencies. Shall I detail how to distribute the rest?",
]

function generateId(): string {
  return `wizard-msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function pickReply(messageCount: number): string {
  return SIMULATED_REPLIES[messageCount % SIMULATED_REPLIES.length]
}

/**
 * AI-chat-styled panel shown alongside the project form in the Project Wizard
 * (right side of split-panel layout at ≥1024px viewport).
 *
 * - Messages are 1–2000 characters; empty/whitespace-only sends are blocked.
 * - A simulated assistant reply appears within 3 seconds after a user message.
 * - Chat auto-scrolls to the bottom on new messages.
 */
export function WizardChatPanel({ messages: externalMessages, onMessagesChange, className }: WizardChatPanelProps) {
  const [internalMessages, setInternalMessages] = useState<WizardChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const messages = externalMessages ?? internalMessages

  const updateMessages = useCallback(
    (newMessages: WizardChatMessage[]) => {
      if (onMessagesChange) {
        onMessagesChange(newMessages)
      } else {
        setInternalMessages(newMessages)
      }
    },
    [onMessagesChange]
  )

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const canSend = useCallback((): boolean => {
    const result = validateStringLength(inputValue, {
      required: true,
      minLength: 1,
      maxLength: 2000,
    })
    return result.valid
  }, [inputValue])

  const handleSend = useCallback(() => {
    if (!canSend() || isSending) return

    const trimmedText = inputValue.trim()
    const userMessage: WizardChatMessage = {
      id: generateId(),
      role: 'user',
      text: trimmedText,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    updateMessages(updatedMessages)
    setInputValue('')
    setIsSending(true)

    // Simulated AI reply within 3 seconds (use 800–2000ms for realistic feel)
    const delay = 800 + Math.random() * 1200
    setTimeout(() => {
      const assistantMessage: WizardChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: pickReply(updatedMessages.length),
        timestamp: new Date().toISOString(),
      }
      updateMessages([...updatedMessages, assistantMessage])
      setIsSending(false)
    }, delay)
  }, [canSend, inputValue, isSending, messages, updateMessages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn('flex h-full flex-col rounded-2xl border border-gray-200 bg-white shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <Avatar seed="Flowlee AI" size="sm" />
        <span className="text-sm font-medium text-gray-700">AI Assistant</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-gray-400">
              Ask me anything about your project setup!
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <Avatar
                seed={msg.role === 'user' ? 'You' : 'Flowlee AI'}
                size="sm"
                className="shrink-0"
              />
              <div
                className={cn(
                  'max-w-[75%] rounded-xl px-3 py-2 text-sm',
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-2">
              <Avatar seed="Flowlee AI" size="sm" className="shrink-0" />
              <div className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            maxLength={2000}
            disabled={isSending}
            className={cn(
              'flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm',
              'placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            aria-label="Chat message input"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend() || isSending}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              'bg-indigo-600 text-white transition-colors',
              'hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95l14.095-5.635a.75.75 0 0 0 0-1.403L3.105 2.289Z" />
            </svg>
          </button>
        </div>
        {inputValue.trim().length > 1800 && (
          <p className="mt-1 text-xs text-gray-400">
            {inputValue.trim().length}/2000
          </p>
        )}
      </div>
    </div>
  )
}
