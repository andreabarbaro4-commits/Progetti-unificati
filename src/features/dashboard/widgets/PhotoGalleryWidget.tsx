import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HiOutlineTrash, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlinePlus } from 'react-icons/hi2';
import { Card } from '../../../components/ui/Card';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../auth/AuthProvider';
import { validateFileAcceptance, type FileAcceptanceResult } from '../../../lib/fileValidation';
import type { GalleryImage } from '../../../mock/fixtures/types';

/**
 * PhotoGalleryWidget — the personal photo gallery Dashboard Widget
 * (Requirements 12.3, 12.4, 12.5).
 *
 * Data flow:
 * - `GET /gallery-images` (mock handler in `src/mock/setup.ts`) returns
 *   every user's gallery images unfiltered, so this widget filters the
 *   result to `ownerId === user.sub` client-side before rendering/counting.
 * - Upload (`POST`), reorder (`PUT .../:id` with an updated `order`), and
 *   delete (`DELETE .../:id`) each invalidate the `['gallery-images']`
 *   query on success so the grid reflects the change.
 *
 * `fileKey` for a mock upload: this repo has no real object-storage
 * backend for this integration (Requirement 3.1, 3.2 — mock/static data
 * only), so `fileKey` is set to `URL.createObjectURL(file)` — a
 * same-session, in-browser preview URL. This is a deliberate mock-only
 * choice: it lets the newly uploaded thumbnail render immediately without
 * a fake "upload pipeline", at the cost of the URL not surviving a full
 * page reload (a real backend would return a durable storage key/URL
 * instead). Documented here rather than pretending this is production
 * upload behavior.
 */

const GALLERY_IMAGES_QUERY_KEY = ['gallery-images'] as const;

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB (Req 12.4)
const MAX_COLLECTION_SIZE = 10; // Req 12.3, 12.5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPT_ATTR = ALLOWED_TYPES.join(',');

/** Maps a rejection reason to a human-readable message (Req 12.4, 12.5). */
function reasonToMessage(reason: Exclude<FileAcceptanceResult, { accepted: true }>['reason']): string {
  switch (reason) {
    case 'tooLarge':
      return 'File exceeds the 20MB size limit';
    case 'unsupportedType':
      return 'Unsupported file type — use JPEG, PNG, GIF, or WebP';
    case 'collectionFull':
      return 'Gallery is full (10 images max)';
  }
}

export default function PhotoGalleryWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: allImages, isLoading } = useQuery({
    queryKey: GALLERY_IMAGES_QUERY_KEY,
    queryFn: () => apiClient.get<GalleryImage[]>('/gallery-images'),
  });

  // GET /gallery-images returns every user's images unfiltered — scope to
  // the current user here, then sort by `order` for stable display.
  const images = (allImages ?? [])
    .filter((image) => image.ownerId === user?.sub)
    .sort((a, b) => a.order - b.order);

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: GALLERY_IMAGES_QUERY_KEY });
  }

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fileKey = URL.createObjectURL(file);
      return apiClient.post<GalleryImage, Partial<GalleryImage>>('/gallery-images', {
        ownerId: user?.sub,
        fileKey,
        order: images.length,
      });
    },
    onSuccess: () => invalidate(),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) =>
      apiClient.put<GalleryImage, Partial<GalleryImage>>(`/gallery-images/${id}`, { order }),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<{ id: string }>(`/gallery-images/${id}`),
    onSuccess: () => invalidate(),
  });

  function handleFileSelected(file: File) {
    const result = validateFileAcceptance(
      file,
      { maxSizeBytes: MAX_SIZE_BYTES, allowedTypes: ALLOWED_TYPES, maxCollectionSize: MAX_COLLECTION_SIZE },
      { currentCount: images.length },
    );

    if (!result.accepted) {
      setError(reasonToMessage(result.reason));
      return;
    }

    setError(null);
    uploadMutation.mutate(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
    // Reset so selecting the same file again still fires onChange.
    e.target.value = '';
  }

  /** Swaps `image` with its neighbor at `direction` and persists both new orders. */
  function moveImage(image: GalleryImage, direction: -1 | 1) {
    const index = images.findIndex((i) => i.id === image.id);
    const neighborIndex = index + direction;
    if (neighborIndex < 0 || neighborIndex >= images.length) return;

    const neighbor = images[neighborIndex];
    reorderMutation.mutate({ id: image.id, order: neighbor.order });
    reorderMutation.mutate({ id: neighbor.id, order: image.order });
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id);
  }

  const isFull = images.length >= MAX_COLLECTION_SIZE;

  return (
    <Card size="sm" className="max-w-none w-full items-stretch gap-3 p-4">
      <div className="flex w-full items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Photo Gallery</h3>
        <span className="text-xs text-gray-400">{images.length}/{MAX_COLLECTION_SIZE}</span>
      </div>

      <input
        ref={fileInputRef}
        accept={ACCEPT_ATTR}
        className="hidden"
        type="file"
        onChange={handleInputChange}
      />

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-xs text-gray-400">Loading photos…</p>
      ) : (
        <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                src={image.fileKey}
                alt="Gallery item"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-between bg-black/0 p-1 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Delete photo"
                  className="ml-auto rounded-full bg-white/90 p-1 text-red-600 hover:bg-white"
                  onClick={() => handleDelete(image.id)}
                >
                  <HiOutlineTrash className="h-3.5 w-3.5" />
                </button>
                <div className="flex w-full items-center justify-between">
                  <button
                    type="button"
                    aria-label="Move photo earlier"
                    className="rounded-full bg-white/90 p-1 text-gray-700 hover:bg-white disabled:opacity-40"
                    disabled={image.order === images[0]?.order}
                    onClick={() => moveImage(image, -1)}
                  >
                    <HiOutlineChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move photo later"
                    className="rounded-full bg-white/90 p-1 text-gray-700 hover:bg-white disabled:opacity-40"
                    disabled={image.order === images[images.length - 1]?.order}
                    onClick={() => moveImage(image, 1)}
                  >
                    <HiOutlineChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            aria-label="Upload photo"
            disabled={isFull}
            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <HiOutlinePlus className="h-5 w-5" />
          </button>
        </div>
      )}

      {isFull && !error && (
        <p className="text-xs text-gray-400">Gallery is full (10 images max)</p>
      )}
    </Card>
  );
}
