import { useRef } from 'react';
import type { DragEvent } from 'react';
import { assignLanes, timeToPosition } from './timelineLayout';
import { NowIndicator, isNowVisible } from './NowIndicator';
import { TimelineBlockCard } from './TimelineBlockCard';
import { useDragTimelineBlock } from './useDragTimelineBlock';
import { cn } from '../../../lib/utils';
import type { TimelineBlock } from '../../../mock/fixtures/types';

const MINUTES_PER_DAY = 24 * 60;
const DAYS_IN_WEEK_VIEW = 5;

/**
 * Same default as `TimelineDayView`'s `DEFAULT_AXIS_HEIGHT_PX` — Property 4
 * ("identical hourly axis range and vertical scale across all columns",
 * Req 10.1) requires the week view's shared axis to use the exact same
 * pixels-per-minute scale as the day view, not an independently-chosen
 * value that happens to look similar.
 */
const DEFAULT_AXIS_HEIGHT_PX = 1440;

/** Mirrors `TimelineDayView`'s scroll-container ceiling for the same reason (comfortably fits the Dashboard page). */
const SCROLLABLE_MAX_HEIGHT_PX = 640;

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric' });

/** Formats a `Date` as `YYYY-MM-DD` in local time (matching the fixtures' `date` field shape). */
function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export interface TimelineWeekViewProps {
  /**
   * All timeline blocks, unfiltered by day.
   *
   * NOTE on filtering convention: this differs intentionally from
   * `TimelineDayView`, which expects its caller to have already filtered
   * `blocks` to a single day. `TimelineWeekView` instead partitions one
   * shared collection across 5 day columns internally (matching each
   * column's ISO date against `block.date`), since a single upstream filter
   * can't serve 5 different day columns at once the way it can serve
   * `TimelineDayView`'s single day.
   */
  blocks: TimelineBlock[];
  /** The Monday of the displayed week. Tuesday–Friday are derived as `weekStartDate + 1..4` days. */
  weekStartDate: Date;
  /**
   * Pixel height of the 00:00-24:00 axis, shared identically by all 5
   * columns. Defaults to 1440 (1px/minute), matching `TimelineDayView` so
   * a block with a given `(time, duration)` renders at the identical
   * offset/height in either view (Req 10.1, Property 4).
   */
  axisHeightPx?: number;
}

/**
 * TimelineWeekView — the Mon-Fri column grid for the Dashboard's week mode
 * (Requirement 10).
 *
 * Each column reuses the exact same `timeToPosition`/`assignLanes`
 * functions `TimelineDayView` uses, applied to that column's own
 * date-filtered block subset, so block positioning is proportional and
 * consistent across both views (Req 10.1, Property 4). Today's column (if
 * within the displayed week) gets a distinct background/border treatment
 * no other column has (Req 10.2), via the same date-only comparison
 * `NowIndicator` already exports as `isNowVisible`.
 *
 * Drag/drop (Req 10.3, 10.4): dragging a block's card and dropping it
 * within a day column's axis bounds calls `useDragTimelineBlock`'s
 * `dragBlock` with the drop column's date and the raw vertical position —
 * `dragBlock` handles day-changing drags by passing the target date through
 * to the mock `PUT` call in addition to the snapped/clamped time. A drop
 * outside every column, or outside a column's vertical axis range, never
 * calls `dragBlock` at all, so the block's cached `(date, time)` is left
 * completely untouched — an implicit revert, since nothing was ever
 * optimistically written for that drop.
 */
export function TimelineWeekView({
  blocks,
  weekStartDate,
  axisHeightPx = DEFAULT_AXIS_HEIGHT_PX,
}: TimelineWeekViewProps) {
  const { dragBlock } = useDragTimelineBlock();

  // Column axis elements, keyed by that column's ISO date, so drop handlers
  // can translate a pointer's clientY into an offset relative to the
  // correct column's own bounding rect.
  const columnAxisRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const today = new Date();
  const days = Array.from({ length: DAYS_IN_WEEK_VIEW }, (_, index) => addDays(weekStartDate, index));

  const containerNeedsScroll = axisHeightPx > SCROLLABLE_MAX_HEIGHT_PX;

  function handleBlockDragStart(block: TimelineBlock) {
    return (event: DragEvent<HTMLButtonElement>) => {
      event.dataTransfer.setData('text/plain', block.id);
      event.dataTransfer.effectAllowed = 'move';
    };
  }

  function handleColumnDrop(columnDate: string) {
    return (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const blockId = event.dataTransfer.getData('text/plain');
      const block = blocks.find((candidate) => candidate.id === blockId);
      if (!block) return;

      const axisEl = columnAxisRefs.current.get(columnDate);
      if (!axisEl) return;

      const { top } = axisEl.getBoundingClientRect();
      const offsetY = event.clientY - top;

      // Req 10.4: a drop outside the displayed hourly axis range reverts —
      // implemented here by simply never calling dragBlock, leaving the
      // block's cached (date, time) unchanged.
      if (offsetY < 0 || offsetY > axisHeightPx) return;

      const rawMinutesFromMidnight = (offsetY / axisHeightPx) * MINUTES_PER_DAY;
      dragBlock(block, rawMinutesFromMidnight, columnDate);
    };
  }

  return (
    <div
      className={cn('grid grid-cols-5 gap-2', containerNeedsScroll && 'overflow-y-auto')}
      style={containerNeedsScroll ? { maxHeight: `${SCROLLABLE_MAX_HEIGHT_PX}px` } : undefined}
    >
      {days.map((day) => {
        const columnDate = toISODate(day);
        const dayBlocks = blocks.filter((block) => block.date === columnDate);
        const isToday = isNowVisible(day, today);

        const lanes = assignLanes(dayBlocks);
        const laneCount = dayBlocks.length > 0 ? Math.max(...lanes.values()) + 1 : 1;
        const widthPercent = 100 / laneCount;

        return (
          <div key={columnDate} className="flex flex-col">
            <div
              className={cn(
                'mb-1 rounded-md px-2 py-1 text-center text-xs font-semibold',
                isToday ? 'bg-indigo-100 text-indigo-800' : 'text-gray-500',
              )}
            >
              {DAY_LABEL_FORMATTER.format(day)}
            </div>

            <div
              ref={(el) => {
                if (el) {
                  columnAxisRefs.current.set(columnDate, el);
                } else {
                  columnAxisRefs.current.delete(columnDate);
                }
              }}
              className={cn(
                'relative flex-1 rounded-lg border',
                // Req 10.2: today's column gets a distinct treatment applied
                // to no other column — a tinted background + colored border.
                isToday ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white',
              )}
              style={{ height: `${axisHeightPx}px` }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleColumnDrop(columnDate)}
            >
              {dayBlocks.map((block) => {
                const laneIndex = lanes.get(block.id) ?? 0;
                const topPx = timeToPosition(block.time, axisHeightPx);
                const heightPx = (block.duration / MINUTES_PER_DAY) * axisHeightPx;

                return (
                  <TimelineBlockCard
                    key={block.id}
                    block={block}
                    topPx={topPx}
                    heightPx={heightPx}
                    leftPercent={laneIndex * widthPercent}
                    widthPercent={widthPercent}
                    draggable
                    onDragStart={handleBlockDragStart(block)}
                  />
                );
              })}

              <NowIndicator displayedDate={day} axisHeightPx={axisHeightPx} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
