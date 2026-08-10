import type { ChatSession } from './types';

// lastActiveAt values are deliberately out of insertion order so consumers
// must sort explicitly for most-recently-active-first ordering (Req 28.1).
export const mockChatSessions: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Project kickoff planning',
    lastActiveAt: '2025-04-12T15:42:00Z',
    projectContext: 'proj-mobile-app',
  },
  {
    id: 'session-2',
    title: 'Budget variance questions',
    lastActiveAt: '2025-04-10T09:05:00Z',
    projectContext: 'proj-api-gateway',
  },
  {
    id: 'session-3',
    title: 'General product questions',
    lastActiveAt: '2025-04-05T18:20:00Z',
  },
];
