import type { GalleryImage } from './types';

// ownerId matches the mock signed-in user's id (see ./user.ts's mockUser.sub)
// so the personal photo gallery widget has content in mock mode.
export const mockGalleryImages: GalleryImage[] = [
  {
    id: 'image-1',
    ownerId: 'mock-user-001',
    fileKey: 'gallery/mock-user-001/sunset.jpg',
    order: 0,
    createdAt: '2025-02-10T12:00:00Z',
  },
  {
    id: 'image-2',
    ownerId: 'mock-user-001',
    fileKey: 'gallery/mock-user-001/team-offsite.jpg',
    order: 1,
    createdAt: '2025-03-01T09:30:00Z',
  },
  {
    id: 'image-3',
    ownerId: 'mock-user-001',
    fileKey: 'gallery/mock-user-001/coffee.png',
    order: 2,
    createdAt: '2025-03-15T08:15:00Z',
  },
];
