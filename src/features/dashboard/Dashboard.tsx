import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { TimelineDayView } from './Timeline/TimelineDayView';
import { TimelineWeekView } from './Timeline/TimelineWeekView';
import { WidgetBoard } from './widgets/WidgetBoard';
import { TIMELINE_BLOCKS_QUERY_KEY } from './Timeline/useDragTimelineBlock';
import type { TimelineBlock } from '../../mock/fixtures/types';

/** Returns the ISO date string (YYYY-MM-DD) for a given Date in local time. */
function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns the Monday of the week containing `date`. */
function getMonday(date: Date): Date {
  const result = new Date(date);
  const dow = result.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  result.setDate(result.getDate() + diff);
  return result;
}

/**
 * Working-hours axis height: 11 hours (8:00–19:00) × 60px per hour = 660px.
 * This constrains the timeline to business hours like the demo does,
 * instead of showing a full 1440px (24h) axis.
 */
const WORKING_HOURS_AXIS_PX = 660;

/**
 * Dashboard — the authenticated landing screen at `/dashboard`.
 *
 * Two-column layout on desktop (timeline left, widget board right).
 * Stacked single-column on mobile. Matches the demo's DashboardPage layout.
 */
function Dashboard() {
  const [expanded, setExpanded] = useState(false);
  const [anchoredDate] = useState(() => new Date());
  const [widgetBoardWidth, setWidgetBoardWidth] = useState(0);

  // Measure the timeline panel height so widgets can size to match
  const timelinePanelRef = useRef<HTMLDivElement>(null);
  const [timelinePanelHeight, setTimelinePanelHeight] = useState(0);
  useEffect(() => {
    const el = timelinePanelRef.current;
    if (!el) return;
    const measure = () => setTimelinePanelHeight(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { data: blocks = [] } = useQuery({
    queryKey: TIMELINE_BLOCKS_QUERY_KEY,
    queryFn: () => apiClient.get<TimelineBlock[]>('/timeline-blocks'),
  });

  const todayISO = toISODate(anchoredDate);
  const dayBlocks = useMemo(
    () => blocks.filter((block) => block.date === todayISO).sort((a, b) => a.time.localeCompare(b.time)),
    [blocks, todayISO],
  );
  const weekStart = getMonday(anchoredDate);
  // Global border-box sizing means the panel's visual right padding is included
  // in `width`; reserve it in addition to the grid's reported content width.
  const widgetPanelWidth = widgetBoardWidth > 0
    ? `calc(${widgetBoardWidth}px + clamp(0.5rem, 1vw, 1rem))`
    : undefined;

  return (
    <div style={{ animation: 'var(--animate-fade-in)', animationFillMode: 'both' }}>
      {/* ── DESKTOP: two-column layout ── */}
      <div
        className="hidden md:flex"
        style={{ height: 'calc(100dvh - 4.25rem - 4.25rem)', overflow: 'hidden' }}
      >
        {/* Left panel: timeline */}
        <div
          style={{
            flex: expanded ? 1 : '1 1 auto',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '1rem clamp(0.5rem, 0.85vw, 0.75rem) 1rem clamp(0.75rem, 1.4vw, 1.25rem)',
            transition: 'flex 300ms ease-out',
          }}
        >
          <div ref={timelinePanelRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Timeline header */}
            <div className="mb-2 flex shrink-0 items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {expanded ? 'Week Timeline' : 'Today\'s Timeline'}
              </h2>
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="cursor-pointer border-none bg-transparent text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                {expanded ? '← Day view' : 'View all →'}
              </button>
            </div>

            {/* Timeline content */}
            <div
              className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white"
            >
              {expanded ? (
                <TimelineWeekView
                  blocks={blocks}
                  weekStartDate={weekStart}
                  axisHeightPx={WORKING_HOURS_AXIS_PX}
                />
              ) : (
                <TimelineDayView
                  blocks={dayBlocks}
                  displayedDate={anchoredDate}
                  axisHeightPx={WORKING_HOURS_AXIS_PX}
                />
              )}
            </div>
          </div>
        </div>

        {/*
          Right panel: its basis is the board's height-derived square-grid width.
          Without that explicit reservation, the flexible timeline consumes the
          row and clips the grid despite the board having calculated its width.
        */}
        <div
          style={{
            flex: expanded
              ? '0 0 0px'
              : widgetPanelWidth
                ? `0 0 ${widgetPanelWidth}`
                : '0 0 auto',
            width: expanded ? 0 : widgetPanelWidth,
            minWidth: expanded ? 0 : widgetPanelWidth,
            opacity: expanded ? 0 : 1,
            overflow: 'hidden',
            paddingTop: '1rem',
            paddingRight: 'clamp(0.5rem, 1vw, 1rem)',
            transition: 'flex-basis 300ms ease-out, width 300ms ease-out, opacity 300ms ease-out',
          }}
        >
          <WidgetBoard
            heightPx={expanded ? undefined : timelinePanelHeight}
            onWidthChange={setWidgetBoardWidth}
          />
        </div>
      </div>

      {/* ── MOBILE: stacked layout ── */}
      <div className="flex flex-col gap-6 p-4 md:hidden">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {expanded ? 'Week Timeline' : 'Today\'s Timeline'}
            </h2>
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="cursor-pointer border-none bg-transparent text-sm font-semibold text-gray-500 hover:text-gray-700"
              style={{ minHeight: '2.75rem', display: 'flex', alignItems: 'center' }}
            >
              {expanded ? '← Day' : 'View all →'}
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {expanded ? (
              <TimelineWeekView
                blocks={blocks}
                weekStartDate={weekStart}
                axisHeightPx={WORKING_HOURS_AXIS_PX}
              />
            ) : (
              <TimelineDayView
                blocks={dayBlocks}
                displayedDate={anchoredDate}
                axisHeightPx={WORKING_HOURS_AXIS_PX}
              />
            )}
          </div>
        </section>

        {!expanded && <WidgetBoard />}
      </div>
    </div>
  );
}

export default Dashboard;
