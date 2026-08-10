import { useEffect, useState } from 'react'

/** Re-render tick so the indicator's position visually drifts over time. */
const UPDATE_INTERVAL_MS = 60_000

const MINUTES_PER_DAY = 24 * 60

/**
 * Day-match visibility logic for the "now" indicator (Req 9.2, 9.3).
 *
 * Pure and kept separate from the component for testability: returns true
 * iff `displayedDate` and `now` fall on the same calendar day, comparing
 * only year/month/date components and ignoring time-of-day.
 */
export function isNowVisible(displayedDate: Date, now: Date): boolean {
  return (
    displayedDate.getFullYear() === now.getFullYear() &&
    displayedDate.getMonth() === now.getMonth() &&
    displayedDate.getDate() === now.getDate()
  )
}

export interface NowIndicatorProps {
  /** The day currently shown in Timeline_Day_View. */
  displayedDate: Date
  /** Pixel height of the 24-hour axis, matching timelineLayout.ts's timeToPosition scale. */
  axisHeightPx: number
}

/**
 * NowIndicator — the "now" line rendered on Timeline_Day_View when the
 * displayed day is today (Req 9.2), and rendered as nothing otherwise
 * (Req 9.3).
 *
 * Re-computes `now` on a 60s interval so the line visually creeps down the
 * axis over time rather than freezing at mount time.
 */
export function NowIndicator({ displayedDate, axisHeightPx }: NowIndicatorProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date())
    }, UPDATE_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [])

  if (!isNowVisible(displayedDate, now)) {
    return null
  }

  // NOTE: `src/features/dashboard/Timeline/timelineLayout.ts` did not exist
  // yet at the time this component was written (its task is parallel to this
  // one). This duplicates the intended timeToPosition() scale: a linear
  // mapping of minutes-since-midnight over a 00:00-24:00 axis onto
  // [0, axisHeightPx]. If timelineLayout.ts lands with a different scale,
  // reconcile this by importing and calling `timeToPosition(now, axisHeightPx)`
  // instead of duplicating the math below.
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes()
  const topPx = (minutesSinceMidnight / MINUTES_PER_DAY) * axisHeightPx

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-10 h-px bg-red-500"
      style={{ top: `${topPx}px` }}
      role="presentation"
      aria-hidden="true"
    >
      <span className="absolute -left-1 -top-1 block h-2 w-2 rounded-full bg-red-500" />
    </div>
  )
}
