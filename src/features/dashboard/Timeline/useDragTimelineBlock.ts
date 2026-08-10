import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import type { TimelineBlock } from '../../../mock/fixtures/types';
import { snapAndClamp } from './timelineLayout';

/**
 * Canonical React Query key for the timeline blocks collection
 * (`GET /timeline-blocks`). This hook establishes the convention — other
 * timeline-block-fetching code should key its `useQuery` call identically
 * so optimistic updates here are visible to every consumer of the cache.
 */
export const TIMELINE_BLOCKS_QUERY_KEY = ['timeline-blocks'] as const;

/** Formats a minutes-from-midnight value as a zero-padded "HH:MM" string. */
function minutesToTimeString(minutesFromMidnight: number): string {
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

interface DragMutationVariables {
  blockId: string;
  newTime: string;
  /**
   * The block's new day (ISO date), set only when a Timeline_Week_View drag
   * moves the block to a different day column (Requirement 10.3 — the week
   * view drags update "day and time", not just time). Omitted for
   * Timeline_Day_View drags, which never change the day.
   */
  newDate?: string;
}

/** Snapshot captured in `onMutate` so `onError` can revert precisely. */
interface DragMutationContext {
  previousBlocks: TimelineBlock[] | undefined;
}

/**
 * useDragTimelineBlock — optimistic drag-to-reschedule for a single
 * Timeline_Block (Requirements 9.4, 9.5, 9.6).
 *
 * `dragBlock` snaps/clamps the raw drop position via `snapAndClamp()`
 * (Req 9.4's "snapped to the nearest 5-minute increment", Req 9.5's
 * clamping to the `[00:00, 24:00 - duration]` bounds), then:
 * 1. Optimistically writes the new `time` (and `date`, when the drag also
 *    moved the block to a different day — Req 10.3) into the
 *    `['timeline-blocks']` React Query cache (`onMutate`) so the
 *    Timeline_Day_View / Timeline_Week_View reflects the move immediately,
 *    without waiting for the mock `PUT` round-trip.
 * 2. Persists the change via `apiClient.put('/timeline-blocks/:id', ...)`.
 * 3. On failure (Req 9.6), reverts the cache to the exact snapshot taken
 *    before the optimistic write and exposes a user-facing `error` message
 *    for the caller to render near the block.
 *
 * Reconciling the cache with the server's response on success is skipped —
 * the mock `PUT` handler echoes back exactly what was sent, so the
 * optimistic value is already correct (see design.md's Error Handling:
 * "Timeline drag persistence failure").
 */
export function useDragTimelineBlock() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation<TimelineBlock, unknown, DragMutationVariables, DragMutationContext>({
    mutationFn: ({ blockId, newTime, newDate }) =>
      apiClient.put<TimelineBlock, Partial<TimelineBlock>>(`/timeline-blocks/${blockId}`, {
        time: newTime,
        ...(newDate !== undefined ? { date: newDate } : {}),
      }),

    onMutate: ({ blockId, newTime, newDate }) => {
      setError(null);

      const previousBlocks = queryClient.getQueryData<TimelineBlock[]>(TIMELINE_BLOCKS_QUERY_KEY);

      queryClient.setQueryData<TimelineBlock[]>(TIMELINE_BLOCKS_QUERY_KEY, (blocks) =>
        blocks?.map((block) =>
          block.id === blockId
            ? { ...block, time: newTime, ...(newDate !== undefined ? { date: newDate } : {}) }
            : block,
        ),
      );

      return { previousBlocks };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousBlocks !== undefined) {
        queryClient.setQueryData<TimelineBlock[]>(TIMELINE_BLOCKS_QUERY_KEY, context.previousBlocks);
      }
      setError('Could not save the change. The block has been moved back.');
    },
  });

  /**
   * @param block - The dragged block.
   * @param newRawMinutesFromMidnight - The unsnapped drop position within the day's axis.
   * @param newDate - The ISO date of the column the block was dropped into,
   *   when it differs from `block.date` (Timeline_Week_View cross-day drag,
   *   Req 10.3). Omitted (or equal to `block.date`) for a same-day move.
   */
  function dragBlock(
    block: TimelineBlock,
    newRawMinutesFromMidnight: number,
    newDate?: string,
  ): void {
    // snapAndClamp already guarantees a result within [0, 1440 - duration],
    // so no further clamping is needed before formatting.
    const snappedStartMinutes = snapAndClamp(newRawMinutesFromMidnight, block.duration);
    const newTime = minutesToTimeString(snappedStartMinutes);

    mutation.mutate({
      blockId: block.id,
      newTime,
      newDate: newDate !== undefined && newDate !== block.date ? newDate : undefined,
    });
  }

  return {
    dragBlock,
    isPending: mutation.isPending,
    error,
  };
}
