import { registerMockHandler, enableMockApi } from './mock-api-client';
import { mockOrgTypes, mockRoles } from './fixtures/onboarding';
import { mockClients, INTERNAL_CLIENT_ID } from './fixtures/clients';
import { mockTeamMembers } from './fixtures/teamMembers';
import { mockProjects } from './fixtures/projects';
import { mockMilestones } from './fixtures/milestones';
import { mockTasks } from './fixtures/tasks';
import { mockDocuments } from './fixtures/documents';
import { mockAlerts } from './fixtures/alerts';
import { mockEconomics } from './fixtures/economics';
import { mockChatSessions } from './fixtures/chatSessions';
import { mockChatMessages } from './fixtures/chatMessages';
import { mockTimelineBlocks } from './fixtures/timelineBlocks';
import { mockGalleryImages } from './fixtures/galleryImages';
import { mockAuthUsers } from './fixtures/authUsers';
import type {
  Client,
  TeamMember,
  Project,
  Milestone,
  Task,
  Document,
  ChatSession,
  ChatMessage,
  TimelineBlock,
  GalleryImage,
} from './fixtures/types';

// ---------------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------------

/** Generates a reasonably-unique id for newly-created mock entities. */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Returns the last non-empty path segment (the `:id` in `/entity/:id`). */
function extractLastSegment(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? '';
}

/** Extracts the `:id` in `/projects/:id/economics`. */
function extractProjectIdFromEconomicsPath(path: string): string {
  const match = path.match(/^\/projects\/([^/]+)\/economics$/);
  return match ? match[1] : '';
}

/** Extracts the `:id` in `/chat-sessions/:id/messages`. */
function extractSessionIdFromMessagesPath(path: string): string {
  const match = path.match(/^\/chat-sessions\/([^/]+)\/messages$/);
  return match ? match[1] : '';
}

// ---------------------------------------------------------------------------
// Admin — Email Trigger config (no dedicated fixture file; kept in-memory,
// module-scoped, matching the "no real persistence beyond session" pattern)
// ---------------------------------------------------------------------------

interface EmailTriggerConfig {
  projectId: string;
  taskId: string;
  teamMemberId: string;
  recipients: string[];
}

let emailTriggerConfig: EmailTriggerConfig | null = null;

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/clients', () => mockClients);

registerMockHandler('POST', '/clients', (body) => {
  const input = body as Partial<Client>;
  const id = generateId('client');
  const newClient: Client = {
    name: '',
    ...input,
    id,
  };
  mockClients.push(newClient);
  return newClient;
});

registerMockHandler('PUT', /^\/clients\/[^/]+$/, (body, path) => {
  const id = extractLastSegment(path ?? '');
  const client = mockClients.find((c) => c.id === id);
  if (!client) {
    throw new Error(`Client not found: ${id}`);
  }
  Object.assign(client, body as Partial<Client>, { id });
  return client;
});

registerMockHandler('DELETE', /^\/clients\/[^/]+$/, (_body, path) => {
  const id = extractLastSegment(path ?? '');
  const index = mockClients.findIndex((c) => c.id === id);
  if (index !== -1) {
    mockClients.splice(index, 1);
  }
  return { id };
});

// ---------------------------------------------------------------------------
// Team members
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/team', () => mockTeamMembers);
registerMockHandler('GET', '/team-members', () => mockTeamMembers);

registerMockHandler('POST', '/team-members', (body) => {
  const input = body as Partial<TeamMember>;
  const id = generateId('member');
  const newMember: TeamMember = {
    name: '',
    surname: '',
    role: '',
    email: '',
    skills: [],
    workload: 0,
    available: true,
    ...input,
    id,
  };
  mockTeamMembers.push(newMember);
  return newMember;
});

registerMockHandler('PUT', /^\/team-members\/[^/]+$/, (body, path) => {
  const id = extractLastSegment(path ?? '');
  const member = mockTeamMembers.find((m) => m.id === id);
  if (!member) {
    throw new Error(`Team member not found: ${id}`);
  }
  Object.assign(member, body as Partial<TeamMember>, { id });
  return member;
});

registerMockHandler('DELETE', /^\/team-members\/[^/]+$/, (_body, path) => {
  const id = extractLastSegment(path ?? '');
  const index = mockTeamMembers.findIndex((m) => m.id === id);
  if (index !== -1) {
    mockTeamMembers.splice(index, 1);
  }
  return { id };
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/projects', () => mockProjects);

registerMockHandler('POST', '/projects', (body) => {
  const input = body as Partial<Project>;
  const id = generateId('proj');
  const newProject: Project = {
    name: '',
    status: 'planning',
    progress: 0,
    deadline: new Date().toISOString().slice(0, 10),
    owner: '',
    members: [],
    clientId: INTERNAL_CLIENT_ID,
    ...input,
    id,
  };
  mockProjects.push(newProject);
  return newProject;
});

registerMockHandler('PUT', /^\/projects\/[^/]+$/, (body, path) => {
  const id = extractLastSegment(path ?? '');
  const project = mockProjects.find((p) => p.id === id);
  if (!project) {
    throw new Error(`Project not found: ${id}`);
  }
  Object.assign(project, body as Partial<Project>, { id });
  return project;
});

registerMockHandler('DELETE', /^\/projects\/[^/]+$/, (_body, path) => {
  const id = extractLastSegment(path ?? '');
  const index = mockProjects.findIndex((p) => p.id === id);
  if (index !== -1) {
    mockProjects.splice(index, 1);
  }
  return { id };
});

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/milestones', () => mockMilestones);

registerMockHandler('POST', '/milestones', (body) => {
  const input = body as Partial<Milestone>;
  const id = generateId('milestone');
  const newMilestone: Milestone = {
    projectId: '',
    name: '',
    date: new Date().toISOString().slice(0, 10),
    completed: false,
    taskIds: [],
    ...input,
    id,
  };
  mockMilestones.push(newMilestone);
  return newMilestone;
});

registerMockHandler('PUT', /^\/milestones\/[^/]+$/, (body, path) => {
  const id = extractLastSegment(path ?? '');
  const milestone = mockMilestones.find((m) => m.id === id);
  if (!milestone) {
    throw new Error(`Milestone not found: ${id}`);
  }
  Object.assign(milestone, body as Partial<Milestone>, { id });
  return milestone;
});

registerMockHandler('DELETE', /^\/milestones\/[^/]+$/, (_body, path) => {
  const id = extractLastSegment(path ?? '');
  const index = mockMilestones.findIndex((m) => m.id === id);
  if (index !== -1) {
    mockMilestones.splice(index, 1);
  }
  // Cascade: remove tasks that belonged to this milestone (Req 18.9).
  for (let i = mockTasks.length - 1; i >= 0; i -= 1) {
    if (mockTasks[i].milestoneId === id) {
      mockTasks.splice(i, 1);
    }
  }
  return { id };
});

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/tasks', () => mockTasks);

registerMockHandler('POST', '/tasks', (body) => {
  const input = body as Partial<Task>;
  const id = generateId('task');
  const newTask: Task = {
    projectId: '',
    name: '',
    status: 'unassigned',
    priority: 'medium',
    deadline: new Date().toISOString().slice(0, 10),
    ...input,
    id,
  };
  mockTasks.push(newTask);
  return newTask;
});

registerMockHandler('PUT', /^\/tasks\/[^/]+$/, (body, path) => {
  const id = extractLastSegment(path ?? '');
  const task = mockTasks.find((t) => t.id === id);
  if (!task) {
    throw new Error(`Task not found: ${id}`);
  }
  Object.assign(task, body as Partial<Task>, { id });
  return task;
});

registerMockHandler('DELETE', /^\/tasks\/[^/]+$/, (_body, path) => {
  const id = extractLastSegment(path ?? '');
  const index = mockTasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    mockTasks.splice(index, 1);
  }
  return { id };
});

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/documents', () => mockDocuments);

registerMockHandler('POST', '/documents', (body) => {
  const input = body as Partial<Document>;
  const id = generateId('document');
  const newDocument: Document = {
    projectId: '',
    name: '',
    fileType: 'other',
    updatedAt: new Date().toISOString(),
    fileKey: '',
    ...input,
    id,
  };
  mockDocuments.push(newDocument);
  return newDocument;
});

registerMockHandler('PUT', /^\/documents\/[^/]+$/, (body, path) => {
  const id = extractLastSegment(path ?? '');
  const document = mockDocuments.find((d) => d.id === id);
  if (!document) {
    throw new Error(`Document not found: ${id}`);
  }
  Object.assign(document, body as Partial<Document>, { id });
  return document;
});

registerMockHandler('DELETE', /^\/documents\/[^/]+$/, (_body, path) => {
  const id = extractLastSegment(path ?? '');
  const index = mockDocuments.findIndex((d) => d.id === id);
  if (index !== -1) {
    mockDocuments.splice(index, 1);
  }
  return { id };
});

// ---------------------------------------------------------------------------
// Alerts (read-only — alerts are generated by mock data, not user-authored)
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/alerts', () => mockAlerts);

// ---------------------------------------------------------------------------
// Economics (read-only, project-scoped)
// ---------------------------------------------------------------------------

registerMockHandler('GET', /^\/projects\/[^/]+\/economics$/, (_body, path) => {
  const projectId = extractProjectIdFromEconomicsPath(path ?? '');
  return mockEconomics.find((e) => e.projectId === projectId) ?? null;
});

// ---------------------------------------------------------------------------
// Chat sessions
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/chat-sessions', () => mockChatSessions);

registerMockHandler('POST', '/chat-sessions', (body) => {
  const input = body as Partial<ChatSession>;
  const id = generateId('session');
  const newSession: ChatSession = {
    title: 'New chat',
    lastActiveAt: new Date().toISOString(),
    ...input,
    id,
  };
  mockChatSessions.push(newSession);
  return newSession;
});

registerMockHandler('DELETE', /^\/chat-sessions\/[^/]+$/, (_body, path) => {
  const id = extractLastSegment(path ?? '');
  const index = mockChatSessions.findIndex((s) => s.id === id);
  if (index !== -1) {
    mockChatSessions.splice(index, 1);
  }
  // Also drop that session's messages so /chat-sessions/:id/messages stays consistent.
  for (let i = mockChatMessages.length - 1; i >= 0; i -= 1) {
    if (mockChatMessages[i].sessionId === id) {
      mockChatMessages.splice(i, 1);
    }
  }
  return { id };
});

// ---------------------------------------------------------------------------
// Chat messages (session-scoped)
// ---------------------------------------------------------------------------

registerMockHandler(
  'GET',
  /^\/chat-sessions\/[^/]+\/messages$/,
  (_body, path) => {
    const sessionId = extractSessionIdFromMessagesPath(path ?? '');
    return mockChatMessages.filter((m) => m.sessionId === sessionId);
  },
);

registerMockHandler(
  'POST',
  /^\/chat-sessions\/[^/]+\/messages$/,
  (body, path) => {
    const sessionId = extractSessionIdFromMessagesPath(path ?? '');
    const input = body as Partial<ChatMessage>;
    const id = generateId('message');
    const newMessage: ChatMessage = {
      sessionId,
      role: 'user',
      text: '',
      timestamp: new Date().toISOString(),
      ...input,
      id,
    };
    mockChatMessages.push(newMessage);
    return newMessage;
  },
);

// ---------------------------------------------------------------------------
// Timeline blocks
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/timeline-blocks', () => mockTimelineBlocks);

registerMockHandler('POST', '/timeline-blocks', (body) => {
  const input = body as Partial<TimelineBlock>;
  const id = generateId('block');
  const newBlock: TimelineBlock = {
    memberId: '',
    type: 'task',
    title: '',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    duration: 30,
    ...input,
    id,
  };
  mockTimelineBlocks.push(newBlock);
  return newBlock;
});

registerMockHandler('PUT', /^\/timeline-blocks\/[^/]+$/, (body, path) => {
  const id = extractLastSegment(path ?? '');
  const block = mockTimelineBlocks.find((b) => b.id === id);
  if (!block) {
    throw new Error(`Timeline block not found: ${id}`);
  }
  Object.assign(block, body as Partial<TimelineBlock>, { id });
  return block;
});

registerMockHandler('DELETE', /^\/timeline-blocks\/[^/]+$/, (_body, path) => {
  const id = extractLastSegment(path ?? '');
  const index = mockTimelineBlocks.findIndex((b) => b.id === id);
  if (index !== -1) {
    mockTimelineBlocks.splice(index, 1);
  }
  return { id };
});

// ---------------------------------------------------------------------------
// Gallery images
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/gallery-images', () => mockGalleryImages);

registerMockHandler('POST', '/gallery-images', (body) => {
  const input = body as Partial<GalleryImage>;
  const id = generateId('image');
  const newImage: GalleryImage = {
    ownerId: '',
    fileKey: '',
    order: mockGalleryImages.length,
    createdAt: new Date().toISOString(),
    ...input,
    id,
  };
  mockGalleryImages.push(newImage);
  return newImage;
});

// Also used for reordering: body carries the fields to update (e.g. `order`).
registerMockHandler('PUT', /^\/gallery-images\/[^/]+$/, (body, path) => {
  const id = extractLastSegment(path ?? '');
  const image = mockGalleryImages.find((i) => i.id === id);
  if (!image) {
    throw new Error(`Gallery image not found: ${id}`);
  }
  Object.assign(image, body as Partial<GalleryImage>, { id });
  return image;
});

registerMockHandler('DELETE', /^\/gallery-images\/[^/]+$/, (_body, path) => {
  const id = extractLastSegment(path ?? '');
  const index = mockGalleryImages.findIndex((i) => i.id === id);
  if (index !== -1) {
    mockGalleryImages.splice(index, 1);
  }
  return { id };
});

// ---------------------------------------------------------------------------
// Admin — Users (read-only mirror of mock Auth0 profiles, Req 36.11)
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/admin/users', () => mockAuthUsers);

// ---------------------------------------------------------------------------
// Admin — Email Trigger
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/admin/email-trigger', () => emailTriggerConfig);

registerMockHandler('PUT', '/admin/email-trigger', (body) => {
  emailTriggerConfig = body as EmailTriggerConfig;
  return emailTriggerConfig;
});

// ---------------------------------------------------------------------------
// Onboarding (unchanged)
// ---------------------------------------------------------------------------

registerMockHandler('GET', '/onboarding/org-types', () => mockOrgTypes);
registerMockHandler('GET', '/onboarding/roles', () => mockRoles);

// Activate mock interception
enableMockApi();
