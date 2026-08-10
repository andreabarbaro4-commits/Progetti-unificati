/**
 * Pure layout math for the Dashboard's Timeline_Day_View / Timeline_Week_View
 * (Requirements 9, 10).
 *
 * Every function here is pure and total — no DOM access, no React, no
 * mutation of its inputs — so it can be shared unchanged between the day
 * view (single axis) and the week view (five day columns sharing the same
 * axis range), per the design's "Property 4: Timeline block position is
 * proportional to time, consistently across day and week views".
 */

/**
 * Minimal shape `assignLanes` needs from a timeline block. Callers pass
 * their richer `TimelineBlock` (see `src/mock/fixtures/types.ts`) directly —
 * this narrower interface just documents the fields the algorithm reads.
 */
export interface TimedBlock {
  id: string;
  time: string;
  duration: number;
}

const MINUTES_PER_DAY = 24 * 60;

/**
 * Parses a "HH:MM" time string into minutes since midnight.
 *
 * Malformed input (wrong shape, non-numeric parts, or an out-of-range hour
 * `[0, 23]` / minute `[0, 59]`) is handled defensively by returning `0`
 * (start of the axis) rather than throwing or returning `NaN` — this keeps
 * every consumer (`timeToPosition`, `assignLanes`) total.
 */
function parseTimeToMinutes(timeHHMM: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeHHMM.trim());
  if (!match) return 0;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;

  return hours * 60 + minutes;
}

/**
 * Converts a "HH:MM" time string into a vertical pixel position
 * proportional to its place on the 24-hour (00:00–24:00) axis:
 *
 * ```
 * position = (hours * 60 + minutes) / (24 * 60) * axisHeightPx
 * ```
 *
 * Pure and total. Malformed `timeHHMM` is treated as `00:00` (position 0)
 * per `parseTimeToMinutes`'s defensive parsing, rather than throwing — a
 * bad fixture value should render at the top of the axis, not crash the
 * timeline. A non-finite or negative `axisHeightPx` simply scales through
 * (`0` in, `0` or `NaN` out) since there is no meaningful axis to position
 * against; callers are expected to pass a real, non-negative pixel height.
 *
 * @param timeHHMM - The block's start time, e.g. `"09:30"`.
 * @param axisHeightPx - The full pixel height representing the 00:00–24:00 range.
 */
export function timeToPosition(timeHHMM: string, axisHeightPx: number): number {
  const minutesFromMidnight = parseTimeToMinutes(timeHHMM);
  return (minutesFromMidnight / MINUTES_PER_DAY) * axisHeightPx;
}

/**
 * Assigns each block a "lane" index (0, 1, 2, ...) such that two blocks
 * whose time ranges `[time, time + duration)` overlap are never assigned
 * the same lane (design's "Property 5: Overlapping blocks never share a
 * lane"), enabling the Timeline_Day_View to render overlapping blocks side
 * by side instead of on top of each other (Requirement 9.1).
 *
 * Classic greedy interval-scheduling lane assignment:
 * 1. Sort blocks by start time ascending, breaking ties by original array
 *    order (stable — two blocks starting at the same time always assign
 *    lanes in the same relative order across calls).
 * 2. For each block in that order, assign it to the first existing lane
 *    whose most-recently-placed block ends at or before this block's start
 *    (i.e. no overlap); if no such lane exists, open a new one.
 *
 * Pure, total, and deterministic — does not mutate `blocks` and never
 * throws. A zero-or-negative `duration` produces a degenerate (possibly
 * empty) range, which is handled the same as any other range by the
 * comparison below.
 *
 * @param blocks - The blocks to lay out (all assumed to be on the same day/axis).
 * @returns A map from each block's `id` to its assigned lane index.
 */
export function assignLanes<T extends TimedBlock>(blocks: T[]): Map<string, number> {
  const withTiming = blocks.map((block, originalIndex) => {
    const start = parseTimeToMinutes(block.time);
    return { block, originalIndex, start, end: start + block.duration };
  });

  withTiming.sort((a, b) => a.start - b.start || a.originalIndex - b.originalIndex);

  // laneEndTimes[i] = end time (minutes) of the most-recently-placed block in lane i.
  const laneEndTimes: number[] = [];
  const laneByBlockId = new Map<string, number>();

  for (const { block, start, end } of withTiming) {
    let laneIndex = laneEndTimes.findIndex((laneEndTime) => laneEndTime <= start);
    if (laneIndex === -1) {
      laneIndex = laneEndTimes.length;
      laneEndTimes.push(end);
    } else {
      laneEndTimes[laneIndex] = end;
    }
    laneByBlockId.set(block.id, laneIndex);
  }

  return laneByBlockId;
}

/**
 * Snaps a raw drop position (in minutes from midnight, potentially
 * fractional/imprecise from pixel-to-minute conversion during a drag) to
 * the nearest 5-minute increment, then clamps the result so the block's
 * full duration fits within the `[0, 1440]` minute axis (Requirements 9.4,
 * 9.5, 10.3, 10.4; design's "Property 7: Drag-drop time resolution snaps to
 * 5 minutes and clamps to valid bounds").
 *
 * - Snapping: `Math.round(raw / 5) * 5`.
 * - Clamping: the snapped start is clamped to
 *   `[0, 1440 - blockDurationMinutes]` so `start + duration` never exceeds
 *   `1440` (24:00) and never goes below `0` (00:00).
 * - Defensive edge case: if `blockDurationMinutes` exceeds `1440` (longer
 *   than a full day — not a valid block, but the function stays total),
 *   there is no valid start that keeps the block within bounds, so the
 *   result clamps to `0` rather than producing a negative bound.
 *
 * Pure and total — never throws, always returns a finite minute value.
 *
 * @param rawMinutesFromMidnight - The unsnapped drop position, in minutes from midnight.
 * @param blockDurationMinutes - The dragged block's duration, in minutes.
 */
export function snapAndClamp(rawMinutesFromMidnight: number, blockDurationMinutes: number): number {
  const snapped = Math.round(rawMinutesFromMidnight / 5) * 5;

  if (blockDurationMinutes > MINUTES_PER_DAY) return 0;

  const maxStart = Math.max(0, MINUTES_PER_DAY - blockDurationMinutes);
  return Math.min(Math.max(snapped, 0), maxStart);
}
