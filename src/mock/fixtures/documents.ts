import type { Document } from './types';

// References real project/milestone/task ids from projects.ts, milestones.ts,
// and tasks.ts (task 2.1 fixtures).
export const mockDocuments: Document[] = [
  {
    id: 'document-1',
    projectId: 'proj-mobile-app',
    name: 'Project Brief.pdf',
    fileType: 'pdf',
    updatedAt: '2025-03-18T09:30:00Z',
    fileKey: 'documents/proj-mobile-app/project-brief.pdf',
    thumbnailKey: 'documents/proj-mobile-app/project-brief-thumb.png',
    thumbnailStatus: 'ready',
    milestoneIds: ['milestone-mobile-kickoff'],
    taskIds: ['task-onboarding-mockups'],
  },
  {
    id: 'document-2',
    projectId: 'proj-mobile-app',
    name: 'Kickoff Deck.ppt',
    fileType: 'ppt',
    updatedAt: '2025-03-22T14:00:00Z',
    fileKey: 'documents/proj-mobile-app/kickoff-deck.ppt',
    thumbnailStatus: 'pending',
    milestoneIds: ['milestone-mobile-kickoff'],
  },
  {
    id: 'document-3',
    projectId: 'proj-api-gateway',
    name: 'Budget Spreadsheet.xlsx',
    fileType: 'sheet',
    updatedAt: '2025-04-02T11:15:00Z',
    fileKey: 'documents/proj-api-gateway/budget.xlsx',
    thumbnailStatus: 'failed',
  },
  {
    id: 'document-4',
    projectId: 'proj-design-system',
    name: 'Site Photos.jpg',
    fileType: 'image',
    updatedAt: '2025-04-10T08:45:00Z',
    fileKey: 'documents/proj-design-system/site-photos.jpg',
    thumbnailKey: 'documents/proj-design-system/site-photos-thumb.png',
    thumbnailStatus: 'ready',
    taskIds: ['task-design-tokens-audit'],
  },
];
