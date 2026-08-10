import { cva } from 'class-variance-authority'
import type { MessageRole } from '../../mock/fixtures/types'
import type { ReactNode } from 'react'

const bubbleVariants = cva(
  'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
  {
    variants: {
      role: {
        user: 'ml-auto bg-indigo-600 text-white rounded-br-sm',
        assistant: 'mr-auto bg-gray-100 text-gray-800 rounded-bl-sm',
      },
    },
    defaultVariants: {
      role: 'assistant',
    },
  },
)

export interface ChatBubbleProps {
  role: MessageRole
  children: ReactNode
}

/**
 * ChatBubble — role-based message container (Req 29.1).
 *
 * User messages align right with an indigo background.
 * Assistant messages align left with a gray background.
 */
export function ChatBubble({ role, children }: ChatBubbleProps) {
  return <div className={bubbleVariants({ role })}>{children}</div>
}
