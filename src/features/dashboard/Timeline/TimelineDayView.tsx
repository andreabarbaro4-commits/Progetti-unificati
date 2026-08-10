import { assignLanes } from './timelineLayout';
import { NowIndicator } from './NowIndicator';
import { TimelineBlockCard } from './TimelineBlockCard';
import { cn } from '../../../lib/utils';
import type { TimelineBlock } from '../../../mock/fixtures/types';

/** Default working-hours start (8 AM). */
const DEFAULT_START_HOUR = 8;
/** Default working-hours end (7 PM). */
const DEFAULT_END_HOUR = 19;

function parseTimeToMinutes(timeHHMM: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeHHMM.trim());
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

export interface TimelineDayViewProps {
  /** Blocks for the displayed day — already filtered by the caller. */
  blocks: TimelineBlock[];
  displayedDate: Date;
  /** Pixel height of the visible axis. Defaults to 660 (11h × 60px/h). */
  axisHeightPx?: number;
  /** First visible hour (inclusive). Default: 8. */
  startHour?: number;
  /** Last visible hour (exclusive). Default: 19. */
  endHour?: number;
}

/**
 * TimelineDayView — the hourly vertical timeline for the current day.
 *
 * Shows a working-hours range (8–19 by default) with hour grid lines,
 * proportionally positioned blocks, and a now indicator.
 */
export function TimelineDayView({
  blocks,
  displayedDate,
  axisHeightPx,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
}: TimelineDayViewProps) {
  const totalMinutes = (endHour - startHour) * 60;
  const startMinute = startHour * 60;
  const height = axisHeightPx ?? totalMinutes; // default 1px per minute

  if (blocks.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-8 text-center text-sm text-gray-500"
        style={{ minHeight: '12rem' }}
      >
        No events scheduled for this day
      </div>
    );
  }

  // Filter blocks that overlap the visible range
  const visibleBlocks = blocks.filter((block) => {
    const blockStart = parseTimeToMinutes(block.time);
    const blockEnd = blockStart + block.duration;
    return blockEnd > startMinute && blockStart < endHour * 60;
  });

  const lanes = assignLanes(visibleBlocks);
  const laneCount = visibleBlocks.length > 0 ? Math.max(...lanes.values()) + 1 : 1;
  const widthPercent = 100 / laneCount;

  // Hour labels
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  return (
    <div>
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Hour grid lines */}
        {hours.map((hour) => {
          const top = ((hour * 60 - startMinute) / totalMinutes) * height;
          return (
            <div key={hour} className="absolute left-0 right-0" style={{ top: `${top}px` }}>
              <div className="flex items-start">
                <span className="w-12 shrink-0 pr-2 text-right text-xs text-gray-400">
                  {String(hour).padStart(2, '0')}:00
                </span>
                <div className="flex-1 border-t border-gray-100" />
              </div>
            </div>
          );
        })}

        {/* Blocks */}
        {visibleBlocks.map((block) => {
          const laneIndex = lanes.get(block.id) ?? 0;
          const blockStartMin = parseTimeToMinutes(block.time);
          // Clip to visible range
          const clippedStart = Math.max(blockStartMin, startMinute);
          const clippedEnd = Math.min(blockStartMin + block.duration, endHour * 60);
          const topPx = ((clippedStart - startMinute) / totalMinutes) * height;
          const heightPx = ((clippedEnd - clippedStart) / totalMinutes) * height;

          return (
            <TimelineBlockCard
              key={block.id}
              block={block}
              topPx={topPx}
              heightPx={Math.max(heightPx, 20)} // min height for visibility
              leftPercent={12 + laneIndex * (widthPercent * 0.88)} // offset for hour labels
              widthPercent={widthPercent * 0.88}
            />
          );
        })}

        {/* Now indicator */}
        <NowIndicator displayedDate={displayedDate} axisHeightPx={height} />
      </div>
    </div>
  );
}
