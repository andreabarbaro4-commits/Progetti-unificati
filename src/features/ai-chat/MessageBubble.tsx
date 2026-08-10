import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatBubble } from './ChatBubble'
import type { ChatMessage } from '../../mock/fixtures/types'

export interface MessageBubbleProps {
  message: ChatMessage
}

/**
 * MessageBubble — renders a single chat message (Req 29.2–29.6).
 *
 * Assistant messages are rendered via react-markdown + remark-gfm with
 * Tailwind-classed element overrides.
 * User messages are rendered as plain text (literal, never markdown-processed).
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <ChatBubble role={message.role}>
      {message.role === 'assistant' ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="mb-2 ml-4 list-disc last:mb-0">{children}</ul>,
            ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal last:mb-0">{children}</ol>,
            li: ({ children }) => <li className="mb-0.5">{children}</li>,
            code: ({ children }) => (
              <code className="rounded bg-gray-200 px-1 py-0.5 text-xs font-mono">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="mb-2 overflow-x-auto rounded-lg bg-gray-800 p-3 text-xs text-gray-100 last:mb-0">
                {children}
              </pre>
            ),
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            a: ({ href, children }) => (
              <a href={href} className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            h1: ({ children }) => <h1 className="mb-2 text-base font-bold">{children}</h1>,
            h2: ({ children }) => <h2 className="mb-1.5 text-sm font-bold">{children}</h2>,
            h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold">{children}</h3>,
          }}
        >
          {message.text}
        </ReactMarkdown>
      ) : (
        <span>{message.text}</span>
      )}

      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {message.attachments.map((attachment, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md bg-black/10 px-2 py-0.5 text-xs"
            >
              📎 {attachment.fileName}
            </span>
          ))}
        </div>
      )}

      {message.isVoiceRecording && (
        <span className="mt-1 inline-flex items-center gap-1 text-xs opacity-70">
          🎤 Voice message
        </span>
      )}
    </ChatBubble>
  )
}
