import type { ChatMessage } from './types';

// References real chatSessions.ts ids via sessionId.
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'message-1',
    sessionId: 'session-1',
    role: 'user',
    text: 'Can you help me draft the kickoff agenda for our new project?',
    timestamp: '2025-04-12T15:40:00Z',
  },
  {
    id: 'message-2',
    sessionId: 'session-1',
    role: 'assistant',
    text: "Sure! Here's a suggested agenda:\n\n1. Introductions\n2. Project goals\n3. Timeline review\n4. Next steps",
    timestamp: '2025-04-12T15:42:00Z',
  },
  {
    id: 'message-3',
    sessionId: 'session-2',
    role: 'user',
    text: 'Why is the infrastructure invoice overdue?',
    timestamp: '2025-04-10T09:05:00Z',
  },
  {
    id: 'message-4',
    sessionId: 'session-2',
    role: 'assistant',
    text: 'The infrastructure invoice was issued on Jan 20 and has not yet been marked as paid in the mock data.',
    timestamp: '2025-04-10T09:06:00Z',
  },
];
